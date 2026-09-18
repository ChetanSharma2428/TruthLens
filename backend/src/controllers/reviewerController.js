import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewerService from '../services/reviewerService.js';
import { env } from '../config/env.js';

export const handleAccess = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { rawToken, expiresAt } = await reviewerService.authenticateReviewer(code);

  // Set HTTP-only secure cookie
  res.cookie(reviewerService.COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    expires: expiresAt
  });

  res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      expiresAt: expiresAt.toISOString()
    }
  });
});

export const handleCheckAuth = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.[reviewerService.COOKIE_NAME] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(200).json({
      success: true,
      data: { authenticated: false }
    });
  }

  const session = await reviewerService.validateSession(token);

  res.status(200).json({
    success: true,
    data: {
      authenticated: Boolean(session),
      expiresAt: session?.expiresAt ? session.expiresAt.toISOString() : null
    }
  });
});

export const handleLogout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.[reviewerService.COOKIE_NAME] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (token) {
    await reviewerService.destroySession(token);
  }

  res.clearCookie(reviewerService.COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Reviewer session successfully terminated.'
    }
  });
});
