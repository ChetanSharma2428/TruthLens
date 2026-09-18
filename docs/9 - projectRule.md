# TruthLens — Project Rules

These rules govern implementation so the project remains consistent, testable, realistic, and aligned with the hackathon requirements.

## 1. Product Rules

1. TruthLens is a misinformation triage and review platform.
2. Do not describe risk flags as proof that a claim is false.
3. Every new claim starts as `UNVERIFIED`.
4. Only the reviewer workflow can set the factual verdict.
5. Reviewer verdicts must include a short note.
6. The core submitted claim is immutable after submission.
7. Unverified claims are visibly labeled when shown publicly.
8. Public visitors do not need accounts.

## 2. Risk Rules

1. Implement the required risk rules deterministically.
2. Do not use AI to replace required deterministic behavior.
3. Sensational:
   - `breaking`
   - `shocking`
   - `share before deleted`
4. Shouting:
   - more than 50% CAPS according to the implemented rule.
5. Unsourced:
   - no source link.
6. Two or more flags:
   - High Risk.
7. Risk is independent of the factual verdict.

## 3. Reviewer Rules

1. Reviewer access must be protected on the backend.
2. Never trust the frontend to identify itself as a reviewer.
3. Never put the reviewer access code in frontend source.
4. Store secrets in environment variables.
5. Review endpoints must reject requests without valid reviewer access.
6. The reviewer cannot silently change the claim text.
7. Review notes must be validated.
8. Review timestamps are generated server-side.

## 4. API Rules

1. Backend is the source of truth.
2. Validate all external input.
3. Never accept client-supplied flags as authoritative.
4. Never accept client-supplied risk level as authoritative.
5. Never accept client-supplied reviewer timestamps.
6. Return consistent response structures.
7. Use appropriate HTTP status codes.
8. Handle missing resources explicitly.
9. Keep API logic aligned with the Track 2 standard API contract.

## 5. Architecture Rules

Use:

```text
Route
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Model
```

Controllers should orchestrate, not contain large business algorithms.

Risk calculation belongs in a service.

Database operations belong in services/models as appropriate.

## 6. Frontend Rules

1. React components should be focused and reusable.
2. Each component gets its own CSS file.
3. Avoid a giant global stylesheet.
4. Keep API calls out of purely presentational components where practical.
5. Handle loading, success, error, and empty states.
6. Never expose secrets in client code.
7. Use semantic HTML and accessible form labels.
8. Do not hide important status information behind color only.

## 7. CSS Rules

Required pattern:

```text
Component/
├── Component.jsx
└── Component.css
```

Global CSS is reserved for:

- Base/reset.
- Typography defaults.
- Design tokens.
- Global accessibility helpers.

Do not duplicate the same component's CSS across page files.

## 8. Design Rules

TruthLens must not look "vibecoded."

Avoid:

- Excessive gradients.
- Neon effects.
- Excessive glassmorphism.
- Generic AI robot imagery.
- Fake statistics.
- Excessive pill-shaped UI.
- Unnecessary animations.

Prefer:

- Editorial hierarchy.
- Clear information density.
- Restrained color.
- Strong typography.
- Consistent spacing.
- Meaningful interaction.
- Professional empty/error states.

## 9. Data Rules

1. Store timestamps in a consistent server-side format.
2. Use MongoDB indexes only for real query needs.
3. Keep the Claim document understandable.
4. Do not create collections merely to make the architecture look complex.
5. Preserve the original submitted claim.

## 10. Error Handling Rules

Every API should handle:

- Invalid input.
- Missing resources.
- Unauthorized reviewer action.
- Database failure.
- Unexpected server errors.

The frontend must turn API errors into useful user-facing messages.

## 11. Security Rules

Minimum:

- Helmet.
- Restricted CORS.
- Rate limiting.
- Input validation.
- HTTP-only reviewer cookie.
- Production secure-cookie configuration.
- Environment variables for secrets.
- No secrets committed to GitHub.

## 12. AI Rules

If AI is added:

1. AI must solve a real product problem.
2. AI is an assistant, not the final factual authority.
3. The required risk engine remains deterministic.
4. AI failure must not break mandatory features.
5. AI API keys remain server-side.
6. Explain AI-assisted outputs clearly in the UI.

## 13. Development Rules

Build in this order:

```text
Product contract
 ↓
Database
 ↓
Backend foundation
 ↓
Risk engine
 ↓
Claim APIs
 ↓
Public UI
 ↓
Reviewer access
 ↓
Review workflow
 ↓
Polish
 ↓
Optional AI
 ↓
Testing
 ↓
Deployment
```

Do not build optional features before the five mandatory features work.

## 14. Git Rules

Use meaningful commits, for example:

```text
feat: add claim model
feat: implement risk analyzer
feat: add public claims feed
feat: add reviewer access
feat: implement review workflow
fix: correct uppercase risk calculation
style: refine claim card layout
```

Do not commit:

```text
.env
API keys
database credentials
reviewer secrets
```

## 15. Hackathon Rules

Before submission verify:

- Public URL works.
- GitHub repository is public if required.
- README contains the Hackathon ID.
- README explains setup.
- README includes test/demo reviewer credentials.
- All five required features work.
- DECISIONS.md covers all three Decision Points.
- Standard API implementation status is stated.
- Demo recording is 3–4 minutes.
- Demo walks through all five features in order.

## 16. Final Quality Rule

Do not add complexity just to make the code look advanced.

A smaller system that is:

- correct,
- reliable,
- understandable,
- polished,
- testable,
- and aligned with the contract

is preferable to a larger system full of unnecessary features.
