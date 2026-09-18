# TruthLens — Technology Stack

## 1. Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS
- Component-level CSS files

### Backend

- Node.js
- Express.js
- Mongoose
- MongoDB
- cookie-parser
- Helmet
- CORS
- dotenv
- express-rate-limit
- Request validation library

### Tooling

- Git
- GitHub
- VS Code
- npm

## 2. Architecture

```text
React
  ↓
Axios
  ↓
Express API
  ↓
Services
  ↓
Mongoose
  ↓
MongoDB
```

## 3. Frontend Responsibilities

React owns:

- Page composition.
- Navigation.
- Form interaction.
- Feed UI.
- Filters/sort controls.
- Claim details.
- Reviewer UI.
- Loading/error/success states.

The frontend does not determine authoritative risk or review status.

## 4. Backend Responsibilities

Node/Express owns:

- Validation.
- Risk analysis.
- Claim creation.
- Feed queries.
- Reviewer access.
- Review authorization.
- Review updates.
- Error handling.

## 5. Database

MongoDB stores the claim lifecycle and review information.

The main entity is `Claim`.

## 6. Reviewer Security

Use:

```text
Reviewer code
    ↓
Backend comparison
    ↓
Temporary reviewer access
    ↓
HTTP-only cookie
```

Never place the reviewer code in React source.

Sensitive values belong in environment variables.

## 7. Security Baseline

- Helmet.
- Restricted CORS.
- Rate limiting.
- Input validation.
- HTTP-only cookies for reviewer access.
- Secure cookie settings in production.
- No secrets in Git.
- No client authority over flags, risk, status, reviewer identity, or timestamps.

## 8. AI Strategy

AI is an optional enhancement.

Recommended AI use cases:

- Suggested category.
- Duplicate/near-duplicate claim detection.
- Evidence summarization assistance.

AI should not replace the required deterministic risk rules or be presented as the final factual authority.

## 9. Deployment

```text
Browser
  ↓
Deployed React app
  ↓
Deployed Express API
  ↓
MongoDB
```

Use environment variables for:

```text
MONGODB_URI
REVIEWER_ACCESS_CODE
FRONTEND_ORIGIN
COOKIE/SESSION_SECRET
AI_API_KEY (only if needed)
```

## 10. Standard API

The hackathon's Track 2 standard API contract must be reconciled with our internal API before implementation. It is the authority for any grader-facing route, field name, request shape, response shape, or required behavior that it specifies.
