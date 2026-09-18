import { AppError } from '../utils/AppError.js';

const ALLOWED_VERDICTS = ['VERIFIED_TRUE', 'FALSE', 'MISLEADING'];

export function validateSubmitReview(req, res, next) {
  const { verdict, note } = req.body;

  if (!verdict || typeof verdict !== 'string') {
    return next(new AppError('Verdict is required and must be a string.', 400, 'VALIDATION_ERROR'));
  }

  const normalizedVerdict = verdict.toUpperCase().trim();
  if (!ALLOWED_VERDICTS.includes(normalizedVerdict)) {
    return next(
      new AppError(
        `Invalid verdict. Must be one of: ${ALLOWED_VERDICTS.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  if (!note || typeof note !== 'string') {
    return next(new AppError('Reviewer explanatory note is required.', 400, 'VALIDATION_ERROR'));
  }

  const trimmedNote = note.trim();
  if (trimmedNote.length < 5) {
    return next(new AppError('Reviewer note must be at least 5 characters long.', 400, 'VALIDATION_ERROR'));
  }
  if (trimmedNote.length > 1000) {
    return next(new AppError('Reviewer note cannot exceed 1000 characters.', 400, 'VALIDATION_ERROR'));
  }

  req.sanitizedReview = {
    verdict: normalizedVerdict,
    note: trimmedNote
  };

  next();
}
