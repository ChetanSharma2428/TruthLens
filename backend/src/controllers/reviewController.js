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

export const handleResearchAssistance = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { getClaimById } = await import('../services/claimService.js');
  const { generateResearchAssistance } = await import('../services/aiService.js');

  const claim = await getClaimById(claimId);
  const assistance = generateResearchAssistance(claim);

  res.status(200).json({
    success: true,
    data: {
      claimId,
      assistance
    }
  });
});
