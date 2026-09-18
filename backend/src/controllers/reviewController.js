import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewService from '../services/reviewService.js';

export const handleGetPendingReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getPendingClaims();

  res.status(200).json({
    success: true,
    data: result
  });
});

export const handleSubmitReview = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { verdict, note } = req.sanitizedReview;
  const reviewerSessionId = req.reviewerSessionId;

  const updatedClaim = await reviewService.submitReview({
    claimId,
    verdict,
    note,
    reviewerSessionId
  });

  res.status(200).json({
    success: true,
    data: updatedClaim
  });
});
