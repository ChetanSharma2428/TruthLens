import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { AppError } from '../utils/AppError.js';

/**
 * Retrieves all claims pending reviewer verification (status = UNVERIFIED).
 * @returns {Promise<{ pendingCount: number, claims: Array }>}
 */
export async function getPendingClaims() {
  const claims = await Claim.find({ status: 'UNVERIFIED' }).sort({ submittedAt: -1 });
  return {
    pendingCount: claims.length,
    claims
  };
}

/**
 * Records an authoritative human reviewer verdict and note on a claim.
 * Enforces valid status transition from UNVERIFIED only.
 * Core claim text is immutable (DP3).
 *
 * @param {Object} params
 * @param {string} params.claimId
 * @param {string} params.verdict - 'VERIFIED_TRUE' | 'FALSE' | 'MISLEADING'
 * @param {string} params.note - Reviewer explanation
 * @param {string} params.reviewerSessionId - ID of authenticated reviewer session
 * @returns {Promise<Object>} The updated claim
 */
export async function submitReview({ claimId, verdict, note, reviewerSessionId }) {
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
  claim.reviewedAt = new Date();
  claim.reviewerSessionId = reviewerSessionId || null;

  await claim.save();
  return claim;
}
