import { COOKIE_NAME, validateSession } from '../services/reviewerService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireReviewer = asyncHandler(async (req, res, next) => {
  // Read token from signed or unsigned cookies or Authorization header
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.signedCookies?.[COOKIE_NAME] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(
      new AppError(
        'Reviewer authorization required. Please authenticate with a valid access code.',
        401,
        'UNAUTHORIZED_REVIEWER'
      )
    );
  }

  const session = await validateSession(token);
  if (!session) {
    return next(
      new AppError(
        'Reviewer session has expired or is invalid. Please re-authenticate.',
        401,
        'SESSION_EXPIRED'
      )
    );
  }

  req.reviewerSessionId = session._id.toString();
  next();
});
