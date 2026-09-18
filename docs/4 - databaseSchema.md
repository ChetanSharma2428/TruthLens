# TruthLens — Database Schema

## 1. Core Entity

The primary collection is:

```text
claims
```

No public User collection is required because public visitors do not authenticate.

## 2. Claim Schema

Suggested Mongoose model:

```js
{
  text: String,

  platform: {
    type: String,
    enum: ["WHATSAPP", "X", "INSTAGRAM", "OTHER"]
  },

  category: {
    type: String,
    enum: ["POLITICS", "HEALTH", "FINANCE", "OTHER"]
  },

  sourceUrl: {
    type: String,
    default: null
  },

  flags: [
    {
      type: String,
      enum: ["SENSATIONAL", "SHOUTING", "UNSOURCED"]
    }
  ],

  riskLevel: {
    type: String,
    enum: ["HIGH", "NORMAL"]
  },

  status: {
    type: String,
    enum: [
      "UNVERIFIED",
      "VERIFIED_TRUE",
      "FALSE",
      "MISLEADING"
    ],
    default: "UNVERIFIED"
  },

  reviewerNote: {
    type: String,
    default: null
  },

  reviewerSessionId: {
    type: String,
    default: null
  },

  submittedAt: Date,

  reviewedAt: {
    type: Date,
    default: null
  },

  createdAt: Date,
  updatedAt: Date
}
```

Exact names/enums should be reconciled with the Track 2 standard API contract before implementation.

## 3. Validation

### text

- Required.
- Trim whitespace.
- Reject empty strings.
- Apply a reasonable maximum length.

### platform

Only:

```text
WHATSAPP
X
INSTAGRAM
OTHER
```

### category

Only:

```text
POLITICS
HEALTH
FINANCE
OTHER
```

### sourceUrl

Optional.

If present, validate URL syntax.

### reviewerNote

Required when a reviewer submits a verdict.

## 4. Status Rules

New claim:

```text
UNVERIFIED
```

Allowed review transitions:

```text
UNVERIFIED → VERIFIED_TRUE
UNVERIFIED → FALSE
UNVERIFIED → MISLEADING
```

The review API should reject invalid/repeated transitions unless the product later introduces an explicit re-review workflow.

## 5. Risk Rules

The backend generates flags.

The client cannot submit authoritative values for:

```text
flags
riskLevel
```

Risk:

```text
2+ flags → HIGH
```

Otherwise use the documented normal-risk state.

## 6. Timestamps

Use timestamps for:

- Submission.
- Review.
- Record creation/update.

Do not trust timestamps supplied by the browser.

## 7. Indexes

Recommended:

```js
{ submittedAt: -1 }
{ status: 1, submittedAt: -1 }
{ category: 1, status: 1, submittedAt: -1 }
```

These support feed and reviewer queue queries.

## 8. Reviewer Sessions

If using server-side sessions, an optional collection can be:

```js
{
  sessionTokenHash: String,
  expiresAt: Date,
  createdAt: Date
}
```

If using a signed/stateless cookie, this collection is not necessary.

## 9. Immutability

After creation, the claim's core submitted content should not be edited:

```text
text
platform
category
sourceUrl
```

Review metadata may change only through authorized review operations.

## 10. Example

```json
{
  "text": "BREAKING!!! RBI WILL CLOSE ALL BANK ACCOUNTS TOMORROW!!!",
  "platform": "WHATSAPP",
  "category": "FINANCE",
  "sourceUrl": null,
  "flags": [
    "SENSATIONAL",
    "SHOUTING",
    "UNSOURCED"
  ],
  "riskLevel": "HIGH",
  "status": "FALSE",
  "reviewerNote": "No official source supports the claim.",
  "submittedAt": "2026-09-18T17:02:00.000Z",
  "reviewedAt": "2026-09-18T17:25:00.000Z"
}
```
