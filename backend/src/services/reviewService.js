import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { AppError } from '../utils/AppError.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../config/redis.js';

// Retrieves all claims pending reviewer verification with priority ordering
export async function getPendingClaims({
  category = 'ALL',
  sort = 'priority',
  reviewerSessionId = null
} = {}) {
  const query = { status: 'UNVERIFIED' };

  if (category && category.toUpperCase() !== 'ALL') {
    query.category = category.toUpperCase();
  }

  let sortOption = { riskLevel: 1, submittedAt: -1 }; // Priority: HIGH before NORMAL, then newest
  if (sort === 'newest') {
    sortOption = { submittedAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { submittedAt: 1 };
  }

  const claims = await Claim.find(query).sort(sortOption).limit(100).lean();

  // Check active collision locks for queue items
  const claimsWithLockStatus = await Promise.all(
    claims.map(async (rawClaim) => {
      const claimId = rawClaim._id.toString();
      const lockKey = `claim:lock:${claimId}`;
      const lockHolder = await cacheGet(lockKey);
      const isLocked = Boolean(lockHolder);
      const isLockedByMe = lockHolder === reviewerSessionId;

      return {
        ...rawClaim,
        id: claimId,
        activeLock: isLocked ? {
          isLocked: true,
          isLockedByMe,
          isLockedByOther: !isLockedByMe
        } : null
      };
    })
  );

  return {
    pendingCount: claims.length,
    claims: claimsWithLockStatus
  };
}

// Acquires a collaborative triage lock on a claim for 10 minutes to prevent collisions
export async function acquireReviewLock(claimId, reviewerSessionId) {
  if (!reviewerSessionId) return { locked: false, lockedByOther: false };

  const lockKey = `claim:lock:${claimId}`;
  const existingHolder = await cacheGet(lockKey);

  if (existingHolder && existingHolder !== reviewerSessionId) {
    return { locked: false, lockedByOther: true, lockHolder: existingHolder };
  }

  // Lock for 10 minutes (600 seconds)
  await cacheSet(lockKey, reviewerSessionId, 600);
  return { locked: true, lockedByOther: false };
}

// Releases a triage lock
export async function releaseReviewLock(claimId, reviewerSessionId) {
  const lockKey = `claim:lock:${claimId}`;
  const existingHolder = await cacheGet(lockKey);

  if (existingHolder === reviewerSessionId) {
    await cacheDel(lockKey);
    return true;
  }
  return false;
}

// Records an authoritative human reviewer verdict, note, and evidence link on a claim
export async function submitReview({ claimId, verdict, note, evidenceUrl = null, reviewerSessionId }) {
  if (!mongoose.Types.ObjectId.isValid(claimId)) {
    throw new AppError(`Invalid claim ID format: '${claimId}'`, 400, 'INVALID_ID');
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new AppError('Claim not found.', 404, 'CLAIM_NOT_FOUND');
  }

  if (claim.status !== 'UNVERIFIED') {
    throw new AppError(
      `Claim has already been reviewed with status '${claim.status}'. Re-reviewing is restricted.`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // Authoritative status and review update
  claim.status = verdict;
  claim.reviewerNote = note;
  claim.evidenceUrl = evidenceUrl || null;
  claim.reviewedAt = new Date();
  claim.reviewerSessionId = reviewerSessionId || null;

  await claim.save();

  // Clean up collision lock and detail cache, and invalidate public feeds & stats
  await Promise.all([
    cacheDel(`claim:lock:${claimId}`),
    cacheDel(`claim:detail:${claimId}`),
    cacheDelPattern('feed:*'),
    cacheDel('truthlens:platform_stats')
  ]).catch(() => {});

  return claim;
}
