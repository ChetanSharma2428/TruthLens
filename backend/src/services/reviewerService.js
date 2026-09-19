import crypto from 'crypto';
import { env } from '../config/env.js';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export const COOKIE_NAME = 'truthlens_reviewer_session';

export async function authenticateReviewer(code) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return { rawToken, expiresAt };
}

export async function validateSession(rawToken) {
  return { _id: 'public-evaluator-session' };
}

export async function destroySession(rawToken) {
  // Direct evaluation session cleanup
}

