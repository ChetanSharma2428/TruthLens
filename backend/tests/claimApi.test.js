import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { Claim } from '../src/models/Claim.js';

let server;
let baseUrl;

describe('Claim APIs — Integration Tests', () => {
  before(async () => {
    await connectDB();
    await Claim.deleteMany({ text: { $regex: /TEST_CLAIM/ } }); // Clean up test fixtures

    server = app.listen(5098);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api/claims`;
  });

  after(async () => {
    await Claim.deleteMany({ text: { $regex: /TEST_CLAIM/ } });
    if (server) server.close();
    await mongoose.disconnect();
  });

  it('POST /api/claims creates claim with automatic risk engine flags and sets UNVERIFIED', async () => {
    const payload = {
      text: 'TEST_CLAIM: BREAKING SHOCKING ANNOUNCEMENT! SHARE BEFORE DELETED!',
      platform: 'WHATSAPP',
      category: 'FINANCE',
      sourceUrl: '', // Unsourced -> 3 flags (Sensational, Shouting, Unsourced) -> HIGH risk
      // Attempting client override of status and flags
      status: 'VERIFIED_TRUE',
      flags: ['FAKE_FLAG'],
      riskLevel: 'NORMAL'
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'UNVERIFIED', 'Client cannot override UNVERIFIED status');
    assert.equal(body.data.riskLevel, 'HIGH', 'Risk engine correctly calculates HIGH risk');
    assert.equal(body.data.flags.includes('SENSATIONAL'), true);
    assert.equal(body.data.flags.includes('SHOUTING'), true);
    assert.equal(body.data.flags.includes('UNSOURCED'), true);
    assert.equal(body.data.flags.includes('FAKE_FLAG'), false, 'Client-supplied fake flags are stripped');
    assert.ok(body.data.id);
  });

  it('POST /api/claims rejects invalid platform', async () => {
    const payload = {
      text: 'TEST_CLAIM: Valid text here but invalid platform',
      platform: 'TELEGRAM',
      category: 'POLITICS'
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/claims rejects text shorter than 5 characters', async () => {
    const payload = {
      text: 'No',
      platform: 'X',
      category: 'POLITICS'
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('GET /api/claims returns paginated claims feed with DP1 default newest first', async () => {
    const res = await fetch(baseUrl);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.claims));
    assert.ok(body.data.pagination);
    assert.equal(body.data.pagination.page, 1);
  });

  it('GET /api/claims/:id returns 404 for non-existent claim', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await fetch(`${baseUrl}/${fakeId}`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CLAIM_NOT_FOUND');
  });

  it('GET /api/claims/:id returns 400 for malformed ID', async () => {
    const res = await fetch(`${baseUrl}/invalid-id-123`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_ID');
  });

  it('POST /api/claims/analyze-risk returns cached deterministic risk analysis with metrics', async () => {
    const payload = {
      text: 'BREAKING SHOCKING CONSPIRACY EXPOSED! SHARE BEFORE DELETED!',
      sourceUrl: null
    };

    const res = await fetch(`${baseUrl}/analyze-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.riskLevel, 'HIGH');
    assert.equal(body.data.flags.length, 3);
    assert.ok(body.data.metrics);
    assert.equal(body.data.metrics.riskScore, 3);
    assert.ok(body.data.metrics.detectedKeywords.length >= 2);
  });

  it('Feature 4: GET /api/claims supports search filtering and decision point visibility', async () => {
    // 1. Keyword search filter
    const searchRes = await fetch(`${baseUrl}?search=BREAKING`);
    assert.equal(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.equal(searchBody.success, true);
    assert.ok(Array.isArray(searchBody.data.claims));

    // 2. DP2 Visibility: VERIFIED_ONLY excludes unverified claims
    const verifiedOnlyRes = await fetch(`${baseUrl}?visibility=VERIFIED_ONLY`);
    assert.equal(verifiedOnlyRes.status, 200);
    const verifiedOnlyBody = await verifiedOnlyRes.json();
    assert.equal(verifiedOnlyBody.success, true);
    const hasUnverified = verifiedOnlyBody.data.claims.some((c) => c.status === 'UNVERIFIED');
    assert.equal(hasUnverified, false);

    // 3. Feed caching: second query should return fromCache: true
    const cachedRes = await fetch(`${baseUrl}?visibility=VERIFIED_ONLY`);
    assert.equal(cachedRes.status, 200);
    const cachedBody = await cachedRes.json();
    assert.equal(cachedBody.data.fromCache, true);
  });
});
