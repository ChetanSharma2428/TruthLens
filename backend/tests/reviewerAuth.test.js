import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { ReviewerSession } from '../src/models/ReviewerSession.js';

let server;
let baseUrl;

describe('Reviewer Access & Authentication — Tests', () => {
  before(async () => {
    await connectDB();
    await ReviewerSession.deleteMany({});
    server = app.listen(5097);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api/reviewer`;
  });

  after(async () => {
    await ReviewerSession.deleteMany({});
    if (server) server.close();
    await mongoose.disconnect();
  });

  it('POST /api/reviewer/access rejects invalid access code', async () => {
    const res = await fetch(`${baseUrl}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'wrong-passcode' })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_ACCESS_CODE');
  });

  it('POST /api/reviewer/access rejects empty access code', async () => {
    const res = await fetch(`${baseUrl}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/reviewer/access succeeds with valid code and sets HTTP-only cookie', async () => {
    const res = await fetch(`${baseUrl}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TRUTHLENS-DEMO-2026' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.authenticated, true);

    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader, 'Sets Set-Cookie header');
    assert.ok(cookieHeader.includes('truthlens_reviewer_session='), 'Cookie has correct name');
    assert.ok(cookieHeader.toLowerCase().includes('httponly'), 'Cookie is HttpOnly');
  });

  it('GET /api/reviewer/me returns authenticated: false when no cookie is sent', async () => {
    const res = await fetch(`${baseUrl}/me`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.authenticated, false);
  });

  it('GET /api/reviewer/me returns authenticated: true when valid cookie is sent', async () => {
    // Authenticate first to grab cookie
    const authRes = await fetch(`${baseUrl}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TRUTHLENS-DEMO-2026' })
    });
    const cookieHeader = authRes.headers.get('set-cookie');
    const cookieValue = cookieHeader.split(';')[0];

    // Check /me with cookie
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookieValue }
    });
    assert.equal(meRes.status, 200);
    const meBody = await meRes.json();
    assert.equal(meBody.success, true);
    assert.equal(meBody.data.authenticated, true);
  });

  it('POST /api/reviewer/logout terminates session and clears cookie', async () => {
    // Authenticate first
    const authRes = await fetch(`${baseUrl}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TRUTHLENS-DEMO-2026' })
    });
    const cookieHeader = authRes.headers.get('set-cookie');
    const cookieValue = cookieHeader.split(';')[0];

    // Logout
    const logoutRes = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: { Cookie: cookieValue }
    });
    assert.equal(logoutRes.status, 200);
    const logoutBody = await logoutRes.json();
    assert.equal(logoutBody.success, true);

    // Verify /me is now false
    const checkRes = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookieValue }
    });
    const checkBody = await checkRes.json();
    assert.equal(checkBody.data.authenticated, false);
  });
});
