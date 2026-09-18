import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { Claim } from '../src/models/Claim.js';
import { ReviewerSession } from '../src/models/ReviewerSession.js';

let server;
let baseUrl;

describe('TruthLens — Full E2E Product Verification Flow', () => {
  before(async () => {
    await connectDB();
    await Claim.deleteMany({ text: { $regex: /E2E_VERIFICATION/ } });
    await ReviewerSession.deleteMany({});
    server = app.listen(5095);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
  });

  after(async () => {
    await Claim.deleteMany({ text: { $regex: /E2E_VERIFICATION/ } });
    await ReviewerSession.deleteMany({});
    if (server) server.close();
    await mongoose.disconnect();
  });

  it('executes full public submission -> deterministic triage -> reviewer verdict -> public update flow', async () => {
    // 1. PUBLIC VISITOR: Submits viral claim
    const submitRes = await fetch(`${baseUrl}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'E2E_VERIFICATION: BREAKING!!! EMERGENCY FINANCIAL FREEZE ON ALL CITIZEN ACCOUNTS! SHARE BEFORE DELETED!',
        platform: 'WHATSAPP',
        category: 'FINANCE',
        sourceUrl: '' // Missing -> Unsourced
      })
    });

    assert.equal(submitRes.status, 201, 'Claim creation returns 201 Created');
    const createdClaim = (await submitRes.json()).data;
    const claimId = createdClaim.id;

    // 2. RISK ENGINE: Authoritative deterministic validation
    assert.equal(createdClaim.status, 'UNVERIFIED', 'Initial status is UNVERIFIED');
    assert.equal(createdClaim.riskLevel, 'HIGH', 'Risk level is HIGH (3 flags >= 2)');
    assert.ok(createdClaim.flags.includes('SENSATIONAL'), 'Flagged SENSATIONAL');
    assert.ok(createdClaim.flags.includes('SHOUTING'), 'Flagged SHOUTING');
    assert.ok(createdClaim.flags.includes('UNSOURCED'), 'Flagged UNSOURCED');

    // 3. PUBLIC FEED: Verify claim appears with DP1 newest sort & DP2 prominent unverified
    const feedRes = await fetch(`${baseUrl}/claims?category=FINANCE&status=UNVERIFIED`);
    assert.equal(feedRes.status, 200);
    const feedData = (await feedRes.json()).data;
    const foundInFeed = feedData.claims.find((c) => c.id === claimId);
    assert.ok(foundInFeed, 'Claim is visible in public unverified feed');
    assert.equal(foundInFeed.status, 'UNVERIFIED');

    // 4. REVIEWER: Authenticates with Demo Access Code
    const authRes = await fetch(`${baseUrl}/reviewer/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TRUTHLENS-DEMO-2026' })
    });
    assert.equal(authRes.status, 200, 'Reviewer authenticated');
    const cookieHeader = authRes.headers.get('set-cookie');
    const cookieValue = cookieHeader.split(';')[0];

    // 5. REVIEWER QUEUE: Inspects pending claims
    const queueRes = await fetch(`${baseUrl}/reviews/pending`, {
      headers: { Cookie: cookieValue }
    });
    assert.equal(queueRes.status, 200);
    const queueData = (await queueRes.json()).data;
    assert.ok(queueData.claims.some((c) => c.id === claimId), 'Claim is in reviewer pending queue');

    // 6. REVIEWER VERDICT: Assigns FALSE verdict with mandatory explanatory note
    const reviewRes = await fetch(`${baseUrl}/reviews/${claimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieValue
      },
      body: JSON.stringify({
        verdict: 'FALSE',
        note: 'Ministry of Finance and Central Bank confirmed normal operations. No asset freeze exists.'
      })
    });
    assert.equal(reviewRes.status, 200, 'Review submitted successfully');
    const reviewedClaim = (await reviewRes.json()).data;
    assert.equal(reviewedClaim.status, 'FALSE');
    assert.equal(reviewedClaim.reviewerNote, 'Ministry of Finance and Central Bank confirmed normal operations. No asset freeze exists.');
    assert.ok(reviewedClaim.reviewedAt);

    // 7. PUBLIC VERIFICATION: Public claim detail reflects updated FALSE verdict and note
    const detailRes = await fetch(`${baseUrl}/claims/${claimId}`);
    assert.equal(detailRes.status, 200);
    const detailClaim = (await detailRes.json()).data;
    assert.equal(detailClaim.status, 'FALSE');
    assert.equal(detailClaim.reviewerNote, 'Ministry of Finance and Central Bank confirmed normal operations. No asset freeze exists.');
    assert.ok(detailClaim.reviewedAt);

    // 8. QUEUE UPDATE: Verified claim is no longer in reviewer pending queue
    const updatedQueueRes = await fetch(`${baseUrl}/reviews/pending`, {
      headers: { Cookie: cookieValue }
    });
    const updatedQueueData = (await updatedQueueRes.json()).data;
    assert.ok(!updatedQueueData.claims.some((c) => c.id === claimId), 'Reviewed claim removed from queue');
  });
});
