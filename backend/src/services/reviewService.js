import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { AppError } from '../utils/AppError.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

/**
 * Retrieves all claims pending reviewer verification (status = UNVERIFIED),
 * supporting category filtering and priority queue ordering.
 * Default ordering is 'priority' (High Risk claims first, then newest).
 *
 * @param {Object} [params]
 * @param {string} [params.category] - Filter by category (POLITICS, HEALTH, etc.)
 * @param {string} [params.sort] - 'priority' | 'newest' | 'oldest'
 * @param {string} [params.reviewerSessionId]
 * @returns {Promise<{ pendingCount: number, claims: Array }>}
 */
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

  const claims = await Claim.find(query).sort(sortOption);

  // Check active collision locks for queue items
  const claimsWithLockStatus = await Promise.all(
    claims.map(async (claim) => {
      const lockKey = `claim:lock:${claim.id}`;
      const lockHolder = await cacheGet(lockKey);
      const isLocked = Boolean(lockHolder);
      const isLockedByMe = lockHolder === reviewerSessionId;

      return {
        ...claim.toJSON(),
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

/**
 * Acquires a collaborative triage lock on a claim for 10 minutes.
 * Prevents newsroom collisions when multiple fact-checkers review simultaneously.
 *
 * @param {string} claimId
 * @param {string} reviewerSessionId
 * @returns {Promise<{ locked: boolean, lockedByOther: boolean }>}
 */
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

/**
 * Releases a triage lock.
 *
 * @param {string} claimId
 * @param {string} reviewerSessionId
 * @returns {Promise<boolean>}
 */
export async function releaseReviewLock(claimId, reviewerSessionId) {
  const lockKey = `claim:lock:${claimId}`;
  const existingHolder = await cacheGet(lockKey);

  if (existingHolder === reviewerSessionId) {
    await cacheDel(lockKey);
    return true;
  }
  return false;
}

/**
 * Records an authoritative human reviewer verdict, explanation note,
 * and optional official evidence link on a claim.
 * Enforces valid status transition from UNVERIFIED only.
 * Core claim text is immutable (DP3).
 *
 * @param {Object} params
 * @param {string} params.claimId
 * @param {string} params.verdict - 'VERIFIED_TRUE' | 'FALSE' | 'MISLEADING'
 * @param {string} params.note - Reviewer explanation
 * @param {string|null} [params.evidenceUrl] - Official evidence reference URL
 * @param {string} params.reviewerSessionId - ID of authenticated reviewer session
 * @returns {Promise<Object>} The updated claim
 */
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

  // Clean up any collision lock
  await cacheDel(`claim:lock:${claimId}`);

  return claim;
}
