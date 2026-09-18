# TruthLens — Architecture & Product Decisions (DECISIONS.md)

This document records the foundational product and technical decisions established for TruthLens.

---

## 1. Core Decision Points (DPs)

### DP1 — Feed Order
- **Decision:** The public feed defaults to **Newest First** (`submittedAt DESC`). Sorting and filtering are strictly decoupled controls.
- **Rationale:** A fast-moving misinformation monitoring stream requires immediate visibility of fresh incoming claims. Visitors can filter by category or status without losing their chosen sort order, and default browsing displays the most recently triaged activity.
- **Implementation:** GET `/api/claims?sort=newest&category=...&status=...`.

### DP2 — Unverified Claim Visibility
- **Decision:** Claims with `status = UNVERIFIED` remain publicly visible in the main feed, rendered with an unmistakable, prominent **UNVERIFIED** status badge.
- **Rationale:** Fact-checking platforms must operate transparently. Hiding claims until verified creates black-box triage and delays public awareness of emerging rumors. However, unverified items must never be mistaken for verified conclusions; the UI prominently separates risk triage flags from human factual verdicts.
- **Implementation:** Default feed query includes all statuses unless explicitly filtered. The `UNVERIFIED` badge uses distinct neutral/attention styling with clear textual labelling.

### DP3 — Claim Immutability
- **Decision:** Once submitted, core claim fields (`text`, `platform`, `category`, `sourceUrl`) are permanently immutable.
- **Rationale:** Reviewer decisions (`VERIFIED_TRUE`, `FALSE`, `MISLEADING`) and explanatory notes are tethered to the exact phrasing and metadata evaluated at that moment in time. Allowing edits would compromise fact-checking audit trails. Any corrected or altered text must be submitted as a separate new claim.
- **Implementation:** No `PUT` or `PATCH` endpoints exist for claim content. The review endpoint (`POST /api/reviews/:claimId`) updates only review-specific audit fields (`status`, `reviewerNote`, `reviewedAt`, `reviewerSessionId`).

---

## 2. API Contract & Security Decisions

### API Contract Baseline
- The API follows the specification detailed in `docs/5 - apiSpec.md`.
- Endpoints follow REST conventions with JSON payloads and uniform envelope structures (`{ success: true, data: ... }` / `{ success: false, error: ... }`).
- Authoritative backend rule: Client requests can never supply `flags`, `riskLevel`, `status`, `submittedAt`, or `reviewedAt`. All calculations and lifecycle timestamps are generated server-side.

### Reviewer Authentication Model
- Public registration and login are intentionally omitted as public accounts are not required.
- Reviewer authentication is governed by a secure demo access code (`REVIEWER_ACCESS_CODE`) maintained server-side in environment variables.
- Upon successful validation (`POST /api/reviewer/access`), the server establishes an HTTP-only, SameSite cookie containing a signed reviewer token/session.
- No secrets or reviewer keys are ever exposed in frontend client bundles.

---

## 3. UI/UX & Styling Baseline

### Editorial Newsroom Visual Language
- Visual design follows the principles in `docs/7 - desing.md`: restrained, calm, high-density editorial styling.
- Zero "vibecoding" elements: no gratuitous glowing gradients, no neon accents, no floating glassmorphic cards, no fake metrics/counters, and no generic AI illustrations.
- Color semantics are strictly mapped to factual states (`VERIFIED_TRUE` = emerald positive, `FALSE` = crimson negative, `MISLEADING` = amber warning, `UNVERIFIED` = slate neutral, `HIGH RISK` = burnt orange alert). Statuses always include clear text labels for accessibility.

### Component-Level CSS Architecture Rule
- Every React component has its own dedicated `.css` stylesheet residing in its own component directory (`Component/Component.jsx` + `Component/Component.css`).
- Monolithic stylesheets are prohibited. Global CSS is strictly restricted to design tokens, font definitions, CSS resets, and global accessibility utilities.
