import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { Claim } from '../src/models/Claim.js';
import { ReviewerSession } from '../src/models/ReviewerSession.js';

let server;
let baseUrl;
let reviewerCookie;

describe('Reviewer Workflow — End-to-End Integration Tests', () => {
  let testClaimId;

  before(async () => {
    await connectDB();
    await Claim.deleteMany({ text: { $regex: /WORKFLOW_TEST/ } });
    await ReviewerSession.deleteMany({});

    server = app.listen(5096);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;

    // 1. Submit a public claim to be reviewed
    const createRes = await fetch(`${baseUrl}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'WORKFLOW_TEST: BREAKING VIRAL ALERT! SHARE BEFORE DELETED!',
        platform: 'WHATSAPP',
        category: 'FINANCE',
        sourceUrl: ''
      })
    });
    const createBody = await createRes.json();
    testClaimId = createBody.data.id;
    assert.equal(createBody.data.status, 'UNVERIFIED');

    // 2. Authenticate as reviewer
    const authRes = await fetch(`${baseUrl}/reviewer/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TRUTHLENS-DEMO-2026' })
    });
    const setCookie = authRes.headers.get('set-cookie');
    reviewerCookie = setCookie.split(';')[0];
  });

  after(async () => {
    await Claim.deleteMany({ text: { $regex: /WORKFLOW_TEST/ } });
    await ReviewerSession.deleteMany({});
    if (server) server.close();
    await mongoose.disconnect();
  });

  it('rejects unauthorized reviewer access to GET /api/reviews/pending', async () => {
    const res = await fetch(`${baseUrl}/reviews/pending`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, 'UNAUTHORIZED_REVIEWER');
  });

  it('rejects unauthorized reviewer attempt to POST /api/reviews/:claimId', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verdict: 'FALSE',
        note: 'No authorization provided.'
      })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, 'UNAUTHORIZED_REVIEWER');
  });

  it('allows authenticated reviewer to fetch pending queue', async () => {
    const res = await fetch(`${baseUrl}/reviews/pending`, {
      headers: { Cookie: reviewerCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.claims.some((c) => c.id === testClaimId));
  });

  it('rejects invalid verdict value', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: reviewerCookie
      },
      body: JSON.stringify({
        verdict: 'PLAUSIBLE', // Invalid verdict enum
        note: 'Valid note explaining why.'
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('rejects empty or short reviewer note', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: reviewerCookie
      },
      body: JSON.stringify({
        verdict: 'FALSE',
        note: 'bad' // Less than 5 characters
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('records reviewer verdict and note on claim', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: reviewerCookie
      },
      body: JSON.stringify({
        verdict: 'FALSE',
        note: 'Official regulatory bulletin issued refuting shutdown claims entirely.'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'FALSE');
    assert.equal(
      body.data.reviewerNote,
      'Official regulatory bulletin issued refuting shutdown claims entirely.'
    );
    assert.ok(body.data.reviewedAt);
  });

  it('rejects repeated review on an already verified claim', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: reviewerCookie
      },
      body: JSON.stringify({
        verdict: 'VERIFIED_TRUE',
        note: 'Trying to alter verdict.'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'INVALID_STATUS_TRANSITION');
  });

  it('reflects updated status and reviewer note on public claim detail endpoint', async () => {
    const res = await fetch(`${baseUrl}/claims/${testClaimId}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'FALSE');
    assert.equal(
      body.data.reviewerNote,
      'Official regulatory bulletin issued refuting shutdown claims entirely.'
    );
  });

  it('supports acquiring and releasing reviewer collision locks', async () => {
    // Create a temporary unverified claim for testing lock
    const { Claim } = await import('../src/models/Claim.js');
    const tempClaim = await Claim.create({
      text: 'Temporary claim for testing collision locks',
      platform: 'WHATSAPP',
      category: 'HEALTH',
      status: 'UNVERIFIED',
      submittedAt: new Date()
    });

    // Acquire lock
    const lockRes = await fetch(`${baseUrl}/reviews/${tempClaim.id}/lock`, {
      method: 'POST',
      headers: { Cookie: reviewerCookie }
    });
    assert.equal(lockRes.status, 200);
    const lockBody = await lockRes.json();
    assert.equal(lockBody.success, true);
    assert.equal(lockBody.data.locked, true);

    // Release lock
    const unlockRes = await fetch(`${baseUrl}/reviews/${tempClaim.id}/unlock`, {
      method: 'POST',
      headers: { Cookie: reviewerCookie }
    });
    assert.equal(unlockRes.status, 200);
    const unlockBody = await unlockRes.json();
    assert.equal(unlockBody.success, true);

    // Clean up
    await Claim.findByIdAndDelete(tempClaim.id);
  });

  it('provides and caches advisory fact-checking research queries', async () => {
    const res = await fetch(`${baseUrl}/reviews/${testClaimId}/research-assistance`, {
      headers: { Cookie: reviewerCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.assistance));
    assert.ok(body.data.assistance.length > 0);
  });
});
