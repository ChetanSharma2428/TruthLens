import crypto from 'crypto';
import { ReviewerSession } from '../models/ReviewerSession.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const COOKIE_NAME = 'truthlens_reviewer_session';

/**
 * Validates reviewer access code and establishes a temporary session.
 * @param {string} code
 * @returns {Promise<{ rawToken: string, expiresAt: Date }>}
 */
export async function authenticateReviewer(code) {
  if (!code || typeof code !== 'string') {
    throw new AppError('Reviewer access code is required.', 400, 'VALIDATION_ERROR');
  }

  // Timing safe comparison to prevent timing attacks
  const expectedCode = env.REVIEWER_ACCESS_CODE;
  const bufferA = Buffer.from(code.trim());
  const bufferB = Buffer.from(expectedCode);

  let isMatch = false;
  if (bufferA.length === bufferB.length) {
    isMatch = crypto.timingSafeEqual(bufferA, bufferB);
  }

  if (!isMatch) {
    throw new AppError('Invalid reviewer access code.', 401, 'INVALID_ACCESS_CODE');
  }

  // Generate cryptographic session token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const sessionTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await ReviewerSession.create({
    sessionTokenHash,
    expiresAt
  });

  return {
    rawToken,
    expiresAt
  };
}

/**
 * Validates an existing session token.
 * @param {string} rawToken
 * @returns {Promise<Object>}
 */
export async function validateSession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const sessionTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const session = await ReviewerSession.findOne({
    sessionTokenHash,
    expiresAt: { $gt: new Date() }
  });

  return session;
}

/**
 * Destroys a reviewer session.
 * @param {string} rawToken
 */
export async function destroySession(rawToken) {
  if (!rawToken) return;
  const sessionTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await ReviewerSession.deleteOne({ sessionTokenHash });
}
