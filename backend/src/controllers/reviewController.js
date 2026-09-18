import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewService from '../services/reviewService.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const handleGetPendingReviews = asyncHandler(async (req, res) => {
  const { category, sort } = req.query;
  const reviewerSessionId = req.reviewerSessionId;

  const result = await reviewService.getPendingClaims({
    category,
    sort,
    reviewerSessionId
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

export const handleSubmitReview = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { verdict, note, evidenceUrl } = req.sanitizedReview;
  const reviewerSessionId = req.reviewerSessionId;

  const updatedClaim = await reviewService.submitReview({
    claimId,
    verdict,
    note,
    evidenceUrl,
    reviewerSessionId
  });

  res.status(200).json({
    success: true,
    data: updatedClaim
  });
});

export const handleLockClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const reviewerSessionId = req.reviewerSessionId;

  const lockResult = await reviewService.acquireReviewLock(claimId, reviewerSessionId);

  res.status(200).json({
    success: true,
    data: lockResult
  });
});

export const handleUnlockClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const reviewerSessionId = req.reviewerSessionId;

  const released = await reviewService.releaseReviewLock(claimId, reviewerSessionId);

  res.status(200).json({
    success: true,
    data: { released }
  });
});

export const handleResearchAssistance = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const cacheKey = `assistance:${claimId}`;

  const cachedAssistance = await cacheGet(cacheKey);
  if (cachedAssistance) {
    return res.status(200).json({
      success: true,
      data: {
        claimId,
        assistance: cachedAssistance,
        cached: true
      }
    });
  }

  const { getClaimById } = await import('../services/claimService.js');
  const { generateResearchAssistance } = await import('../services/aiService.js');

  const claim = await getClaimById(claimId);
  const assistance = generateResearchAssistance(claim);

  // Cache advisory queries for 24 hours
  await cacheSet(cacheKey, assistance, 86400);

  res.status(200).json({
    success: true,
    data: {
      claimId,
      assistance,
      cached: false
    }
  });
});
