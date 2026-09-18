# TruthLens — API Specification

## Important Contract Rule

The Track 2 standard API supplied by the hackathon is authoritative for grader-facing APIs. The endpoints below are the proposed application API and must be reconciled against that standard contract before implementation.

## 1. API Conventions

Base:

```text
/api
```

JSON requests and responses.

Suggested success:

```json
{
  "success": true,
  "data": {}
}
```

Suggested error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Claim text is required."
  }
}
```

## 2. Create Claim

### POST `/api/claims`

Request:

```json
{
  "text": "A viral claim...",
  "platform": "WHATSAPP",
  "category": "FINANCE",
  "sourceUrl": "https://example.com/post"
}
```

Backend:

1. Validate.
2. Run risk analyzer.
3. Calculate risk level.
4. Set status to `UNVERIFIED`.
5. Save.
6. Return created claim.

The client cannot choose:

- status
- flags
- risk level
- submittedAt
- reviewedAt

## 3. Public Feed

### GET `/api/claims`

Suggested query parameters:

```text
category=FINANCE
status=FALSE
sort=newest
page=1
limit=20
```

`ALL` means that corresponding filter is not applied.

Response should provide fields required by the feed card.

## 4. Claim Details

### GET `/api/claims/:id`

Returns:

- Full text.
- Platform.
- Category.
- Source URL.
- Flags.
- Risk level.
- Status.
- Reviewer note.
- Submission time.
- Review time.

## 5. Reviewer Access

### POST `/api/reviewer/access`

Request:

```json
{
  "code": "demo-reviewer-code"
}
```

Backend compares against a server-side value.

Success:

- Does not return the secret code.
- Establishes temporary reviewer access.
- Sets HTTP-only cookie.

Failure:

```text
401 Unauthorized
```

### GET `/api/reviewer/me`

Optional endpoint to check current reviewer access.

### POST `/api/reviewer/logout`

Clears/revokes reviewer access.

## 6. Reviewer Queue

### GET `/api/reviews/pending`

Requires reviewer access.

Returns unverified claims.

## 7. Submit Review

### POST `/api/reviews/:claimId`

Request:

```json
{
  "verdict": "FALSE",
  "note": "No official source supports this claim."
}
```

Backend verifies:

- reviewer access.
- claim exists.
- claim is unverified.
- verdict is allowed.
- note is valid.

Then stores:

```text
status
reviewerNote
reviewedAt
reviewerSessionId
```

## 8. HTTP Status Codes

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

## 9. Risk Analyzer

Internal service:

```js
analyzeRisk({
  text,
  sourceUrl
})
```

Returns:

```js
{
  flags: [],
  riskLevel: "NORMAL"
}
```

The exact flag calculation must follow the hackathon brief.

## 10. API Security

Public endpoints:

```text
GET /claims
GET /claims/:id
POST /claims
```

Reviewer endpoints require reviewer access:

```text
GET /reviews/pending
POST /reviews/:claimId
POST /reviewer/logout
```

Never trust client-provided:

```text
flags
riskLevel
status
reviewedAt
reviewerSessionId
```

## 11. Pagination

Initial design:

```text
page
limit
```

If the standard API specifies a different pagination format, follow that contract.

## 12. UI/API Mapping

```text
Landing
    ↓
Public Feed → GET /claims
    ↓
Submit → POST /claims
    ↓
Details → GET /claims/:id

Reviewer
    ↓
Access → POST /reviewer/access
    ↓
Queue → GET /reviews/pending
    ↓
Review → POST /reviews/:claimId
```
