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

export const handleCheckDuplicate = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { checkDuplicateClaim } = await import('../services/duplicateDetector.js');
  const result = await checkDuplicateClaim(text || '');

  res.status(200).json({
    success: true,
    data: result
  });
});

export const handleExtractFromImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const { AppError } = await import('../utils/AppError.js');
    throw new AppError('No image file provided. Please upload a screenshot (PNG/JPEG/WEBP).', 400, 'VALIDATION_ERROR');
  }

  const { uploadImageBuffer } = await import('../config/cloudinary.js');
  const { extractClaimFromImage } = await import('../services/geminiService.js');

  const [imageUrl, extraction] = await Promise.all([
    uploadImageBuffer(req.file.buffer, req.file.mimetype),
    extractClaimFromImage({ buffer: req.file.buffer, mimetype: req.file.mimetype })
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...extraction,
      imageUrl
    }
  });
});
