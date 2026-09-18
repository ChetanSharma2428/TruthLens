import { asyncHandler } from '../utils/asyncHandler.js';
import * as claimService from '../services/claimService.js';

export const handleCreateClaim = asyncHandler(async (req, res) => {
  const newClaim = await claimService.createClaim(req.sanitizedClaim);

  res.status(201).json({
    success: true,
    data: newClaim
  });
});

export const handleGetClaims = asyncHandler(async (req, res) => {
  const { category, status, sort, page, limit } = req.query;

  const result = await claimService.getClaimsFeed({
    category,
    status,
    sort,
    page,
    limit
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

export const handleGetClaimById = asyncHandler(async (req, res) => {
  const claim = await claimService.getClaimById(req.params.id);

  res.status(200).json({
    success: true,
    data: claim
  });
});

export const handleSuggestCategory = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { suggestCategory } = await import('../services/aiService.js');
  const suggestion = suggestCategory(text || '');

  res.status(200).json({
    success: true,
    data: suggestion
  });
});
