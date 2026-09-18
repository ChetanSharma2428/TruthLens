import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { Claim } from '../src/models/Claim.js';

let server;
let baseUrl;

describe('Feature 1 Enhancements — OCR and Duplicate Detection Tests', () => {
  before(async () => {
    await connectDB();
    server = app.listen(5094);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api/claims`;

    // Ensure a reference claim exists for duplicate matching
    await Claim.create({
      text: 'DUPLICATE_TEST: Central Reserve Bank to freeze all citizen banking accounts tomorrow!',
      platform: 'WHATSAPP',
      category: 'FINANCE',
      sourceUrl: null,
      status: 'FALSE',
      reviewerNote: 'Debunked by central banking authorities.'
    });
  });

  after(async () => {
    await Claim.deleteMany({ text: { $regex: /DUPLICATE_TEST/ } });
    if (server) server.close();
    await mongoose.disconnect();
  });

  it('detects duplicate/near-duplicate when similar text is submitted', async () => {
    const res = await fetch(`${baseUrl}/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Central Reserve Bank to freeze all citizen banking accounts tomorrow!'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.isDuplicate, true);
    assert.ok(body.data.similarity >= 50);
    assert.ok(body.data.matchedClaim);
    assert.equal(body.data.matchedClaim.status, 'FALSE');
  });

  it('returns isDuplicate: false when query text is distinct', async () => {
    const res = await fetch(`${baseUrl}/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'A completely unrelated query about astronomy telescopes and planetary orbits in the galaxy.'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.isDuplicate, false);
  });

  it('rejects POST /extract-from-image when no file is uploaded', async () => {
    const res = await fetch(`${baseUrl}/extract-from-image`, {
      method: 'POST'
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });
});
