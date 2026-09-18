# TruthLens — Authoritative REST API Specification

All endpoints follow standard REST conventions, responding with uniform envelope formats and standard HTTP status codes.

Base URL: `/api`

---

## 1. Response Envelope Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error."
  }
}
```

---

## 2. Public Claims Endpoints

### 1. Submit a Claim
* **Method & Route:** `POST /api/claims`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "text": "BREAKING: Central bank freezes transfers! Share before deleted!",
    "platform": "WHATSAPP",
    "category": "FINANCE",
    "sourceUrl": "https://example.com/post",
    "imageUrl": "https://res.cloudinary.com/.../screenshot.png"
  }
  ```
* **Response:** `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": "66ea1a2b3c4d5e6f7a8b9c0d",
      "text": "BREAKING: Central bank freezes transfers! Share before deleted!",
      "platform": "WHATSAPP",
      "category": "FINANCE",
      "sourceUrl": "https://example.com/post",
      "imageUrl": "https://res.cloudinary.com/.../screenshot.png",
      "flags": ["SENSATIONAL"],
      "riskLevel": "NORMAL",
      "riskMetrics": {
        "uppercaseRatio": 0.15,
        "uppercasePercent": 15,
        "detectedKeywords": ["breaking", "share before deleted"],
        "hasSource": true,
        "riskScore": 1
      },
      "status": "UNVERIFIED",
      "submittedAt": "2026-09-18T20:00:00.000Z"
    }
  }
  ```

### 2. Get Public Claims Feed
* **Method & Route:** `GET /api/claims`
* **Access:** Public
* **Query Parameters:**
  * `category`: `ALL` (default), `POLITICS`, `HEALTH`, `FINANCE`, `OTHER`
  * `status`: `ALL` (default), `UNVERIFIED`, `VERIFIED_TRUE`, `FALSE`, `MISLEADING`
  * `sort` (DP1): `newest` (default), `highest_risk`, `status`, `oldest`
  * `visibility` (DP2): `ALL` (default), `VERIFIED_ONLY`
  * `search`: Keyword string matching claim text and reviewer notes
  * `page`: Integer (default: 1)
  * `limit`: Integer (default: 20, max: 100)
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "claims": [ ... ],
      "pagination": {
        "total": 42,
        "page": 1,
        "limit": 20,
        "totalPages": 3,
        "hasMore": true
      },
      "decisionPoints": {
        "dp1_feedOrder": "newest",
        "dp2_visibility": "ALL"
      },
      "fromCache": false
    }
  }
  ```

### 3. Get Claim by ID (Detail View)
* **Method & Route:** `GET /api/claims/:id`
* **Access:** Public
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "66ea1a2b3c4d5e6f7a8b9c0d",
      "text": "...",
      "platform": "X",
      "category": "POLITICS",
      "status": "FALSE",
      "flags": ["SENSATIONAL", "UNSOURCED"],
      "riskLevel": "HIGH",
      "riskMetrics": { ... },
      "reviewerNote": "Official government gazette contradicts this claim.",
      "evidenceUrl": "https://pib.gov.in/factcheck/...",
      "submittedAt": "2026-09-18T18:00:00.000Z",
      "reviewedAt": "2026-09-18T19:30:00.000Z",
      "auditTimeline": [ ... ],
      "relatedClaims": [ ... ]
    }
  }
  ```

### 4. Multimodal Screenshot OCR
* **Method & Route:** `POST /api/claims/extract-from-image`
* **Access:** Public
* **Payload:** `multipart/form-data` with field `screenshot` (PNG/JPG/WEBP $\le 5$MB)
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "extractedText": "Claim text extracted from screenshot via Gemini Vision",
      "suggestedCategory": "POLITICS",
      "imageUrl": "https://res.cloudinary.com/.../screenshot.png"
    }
  }
  ```

### 5. Semantic Duplicate Detection
* **Method & Route:** `POST /api/claims/check-duplicate`
* **Access:** Public
* **Payload:** `{ "text": "Claim text to check" }`
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "isDuplicate": true,
      "similarity": 0.89,
      "duplicateClaim": { "id": "...", "text": "...", "status": "..." }
    }
  }
  ```

### 6. Suggest Category (AI/Heuristic)
* **Method & Route:** `POST /api/claims/suggest-category`
* **Access:** Public
* **Payload:** `{ "text": "Claim text" }`
* **Response:** `200 OK` (`{ "success": true, "data": { "category": "HEALTH" } }`)

### 7. Analyze Risk (Deterministic Engine with Redis Cache)
* **Method & Route:** `POST /api/claims/analyze-risk`
* **Access:** Public
* **Payload:** `{ "text": "...", "sourceUrl": "..." }`
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "flags": ["SENSATIONAL", "UNSOURCED"],
      "riskLevel": "HIGH",
      "metrics": {
        "uppercaseRatio": 0.22,
        "uppercasePercent": 22,
        "detectedKeywords": ["breaking"],
        "hasSource": false,
        "riskScore": 2
      },
      "fromCache": false
    }
  }
  ```

---

## 3. Reviewer Authentication Endpoints

### 8. Authenticate Reviewer
* **Method & Route:** `POST /api/reviewer/access`
* **Payload:** `{ "code": "TRUTHLENS-DEMO-2026" }`
* **Response:** `200 OK` + `Set-Cookie: truthlens_reviewer_token=...; HttpOnly; SameSite=Lax; Path=/`

### 9. Verify Session
* **Method & Route:** `GET /api/reviewer/me`
* **Access:** Public / Cookie
* **Response:** `200 OK` (`{ "success": true, "data": { "authenticated": true } }`)

### 10. Logout Reviewer
* **Method & Route:** `POST /api/reviewer/logout`
* **Response:** `200 OK` (Clears session cookie)

---

## 4. Reviewer Workflow Endpoints (Requires Cookie Auth)

### 11. Get Pending Claims Queue
* **Method & Route:** `GET /api/reviews/pending`
* **Query Parameters:**
  * `category`: `ALL`, `POLITICS`, `HEALTH`, `FINANCE`, `OTHER`
  * `sort`: `priority` (High risk first - default), `newest`, `oldest`
* **Response:** `200 OK` (`{ "success": true, "data": { "pendingCount": 12, "claims": [ ... ] } }`)

### 12. Acquire Collaborative Review Lock
* **Method & Route:** `POST /api/reviews/:claimId/lock`
* **Response:** `200 OK` (`{ "success": true, "data": { "locked": true, "lockedByOther": false } }`)

### 13. Release Review Lock
* **Method & Route:** `POST /api/reviews/:claimId/unlock`
* **Response:** `200 OK` (`{ "success": true, "data": { "released": true } }`)

### 14. Advisory Research Assistance
* **Method & Route:** `GET /api/reviews/:claimId/research-assistance`
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "claimId": "...",
      "assistance": [
        { "label": "Official Health Source Query", "query": "site:who.int ...", "targetType": "Global Health" }
      ],
      "cached": false
    }
  }
  ```

### 15. Submit Verification Verdict
* **Method & Route:** `POST /api/reviews/:claimId`
* **Payload:**
  ```json
  {
    "verdict": "FALSE",
    "note": "Official press release published by the Ministry confirms this claim is entirely fabricated.",
    "evidenceUrl": "https://pib.gov.in/factcheck/press-release-1234"
  }
  ```
* **Response:** `200 OK` (Returns updated claim)
