import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { analyzeRisk } from './riskAnalyzer.js';
import { AppError } from '../utils/AppError.js';

/**
 * Creates a new claim with authoritative server-calculated risk analysis.
 * Initial status is strictly UNVERIFIED.
 *
 * @param {Object} claimData
 * @param {string} claimData.text
 * @param {string} claimData.platform
 * @param {string} claimData.category
 * @param {string|null} claimData.sourceUrl
 * @returns {Promise<Object>} The created claim document
 */
export async function createClaim({ text, platform, category, sourceUrl }) {
  // Execute deterministic risk analysis
  const { flags, riskLevel } = analyzeRisk({ text, sourceUrl });

  const claim = await Claim.create({
    text,
    platform,
    category,
    sourceUrl,
    flags,
    riskLevel,
    status: 'UNVERIFIED',
    reviewerNote: null,
    reviewerSessionId: null,
    submittedAt: new Date(),
    reviewedAt: null
  });

  return claim;
}

/**
 * Fetches public claims feed with filtering, sorting, and pagination.
 * DP1: Default sort is Newest First (submittedAt DESC).
 * DP2: Unverified claims are returned transparently.
 *
 * @param {Object} params
 * @returns {Promise<Object>} Claims array and pagination metadata
 */
export async function getClaimsFeed({
  category = 'ALL',
  status = 'ALL',
  sort = 'newest',
  page = 1,
  limit = 20
} = {}) {
  const query = {};

  // Category filter
  if (category && category.toUpperCase() !== 'ALL') {
    query.category = category.toUpperCase();
  }

  // Status filter
  if (status && status.toUpperCase() !== 'ALL') {
    query.status = status.toUpperCase();
  }

  // DP1 Sort order
  let sortOption = { submittedAt: -1 }; // Default newest first
  if (sort === 'oldest') {
    sortOption = { submittedAt: 1 };
  } else if (sort === 'highest_risk') {
    sortOption = { riskLevel: 1, submittedAt: -1 }; // 'HIGH' precedes 'NORMAL' alphabetically
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [claims, total] = await Promise.all([
    Claim.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Claim.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    claims,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages
    }
  };
}

/**
 * Retrieves a single claim by its ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getClaimById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid claim ID format: '${id}'`, 400, 'INVALID_ID');
  }

  const claim = await Claim.findById(id);
  if (!claim) {
    throw new AppError('Claim not found.', 404, 'CLAIM_NOT_FOUND');
  }

  return claim;
}
