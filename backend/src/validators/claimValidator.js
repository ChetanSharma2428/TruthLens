import { AppError } from '../utils/AppError.js';
import { PLATFORMS, CATEGORIES } from '../models/Claim.js';

export function validateCreateClaim(req, res, next) {
  const { text, platform, category, sourceUrl } = req.body;

  // Text validation
  if (!text || typeof text !== 'string') {
    return next(new AppError('Claim text is required and must be a string.', 400, 'VALIDATION_ERROR'));
  }
  const trimmedText = text.trim();
  if (trimmedText.length < 5) {
    return next(new AppError('Claim text must be at least 5 characters long.', 400, 'VALIDATION_ERROR'));
  }
  if (trimmedText.length > 1000) {
    return next(new AppError('Claim text cannot exceed 1000 characters.', 400, 'VALIDATION_ERROR'));
  }

  // Platform validation
  if (!platform || !PLATFORMS.includes(platform.toUpperCase())) {
    return next(
      new AppError(
        `Invalid source platform. Must be one of: ${PLATFORMS.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  // Category validation
  if (!category || !CATEGORIES.includes(category.toUpperCase())) {
    return next(
      new AppError(
        `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  // Source URL validation (optional)
  let cleanSourceUrl = null;
  if (sourceUrl !== undefined && sourceUrl !== null && sourceUrl !== '') {
    if (typeof sourceUrl !== 'string') {
      return next(new AppError('Source URL must be a valid string.', 400, 'VALIDATION_ERROR'));
    }
    const trimmedUrl = sourceUrl.trim();
    if (trimmedUrl.length > 0) {
      try {
        const parsed = new URL(trimmedUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return next(new AppError('Source URL must start with http:// or https://', 400, 'VALIDATION_ERROR'));
        }
        cleanSourceUrl = trimmedUrl;
      } catch (err) {
        return next(new AppError('Invalid source URL format.', 400, 'VALIDATION_ERROR'));
      }
    }
  }

  // Authoritative sanitization: only pass sanitized whitelisted fields
  req.sanitizedClaim = {
    text: trimmedText,
    platform: platform.toUpperCase(),
    category: category.toUpperCase(),
    sourceUrl: cleanSourceUrl
  };

  next();
}
