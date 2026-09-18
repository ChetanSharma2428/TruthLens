# TruthLens — Project Rules & Architectural Invariants

These strict rules govern the TruthLens codebase, ensuring audit integrity, security, and adherence to civic tech principles.

---

## 1. Core Civic Tech Rules

1. **Risk $\neq$ Truth:** Automated risk flags (`Sensational`, `Shouting`, `Unsourced`) indicate viral dissemination patterns, **never** factual truth. A factual report can be shouted; a fabricated hoax can be written in calm, polite language.
2. **Authoritative Human-in-the-Loop:** Automated engines or AI models must **never** assign or override factual verdicts (`Verified True`, `False`, `Misleading`). Factual determinations belong exclusively to human editorial review.
3. **Transparent Triage (DP2):** Unverified claims are shown publicly by default with distinct amber warning badges so that viral rumors are not allowed to fester in an information vacuum.
4. **Permanent Immutability (DP3):** Once submitted, core claim content (`text`, `platform`, `category`, `sourceUrl`, `imageUrl`) is permanently immutable. Reviewer decisions evaluate exact text at a specific moment in time; corrections must be filed as distinct new submissions.
5. **Mandatory Explanatory Notes:** Human reviewers cannot assign a verdict without a clear explanation note ($\ge 5$ characters) citing evidence.

---

## 2. Security & Authentication Invariants

1. **Server-Side Authority:** The backend is the sole authority for flags, risk level, status, timestamps, and reviewer attribution. The client cannot supply authoritative values for these fields.
2. **Reviewer Session Protection:** Reviewer access is authenticated via server-side verification of `REVIEWER_ACCESS_CODE` and protected with signed, HTTP-only, SameSite cookies.
3. **No Secrets in Bundles:** `REVIEWER_ACCESS_CODE`, database URIs, and API keys must never appear in frontend source code.
4. **Input Sanitization:** All text inputs are trimmed and bounded ($5\text{–}1000$ characters). Image uploads are restricted to memory buffers $\le 5$MB with MIME-type validation.

---

## 3. Modern Architecture & Fallback Rules

1. **100% Graceful Fallback:** External cloud services (Google Gemini API, Cloudinary CDN, Redis) must feature automated, non-crashing fallbacks:
   * If Redis is unavailable, the application transparently operates using an in-memory `Map` cache.
   * If Cloudinary or Gemini API keys are omitted, the application logs a clean warning and operates with local fallbacks without throwing 500 errors.
2. **Dual-Review Collision Locks:** Fact-checkers must acquire collaborative locks when reviewing claims to prevent redundant work in multi-user newsrooms.
3. **Deterministic Heuristic Integrity:** Deterministic heuristic rules are unit-tested and must never be altered by machine learning inference or prompt instability.

---

## 4. Frontend Engineering Standards

1. **Component-Level CSS Rule:** Every React component must have its own directory containing its dedicated stylesheet (`Component/Component.jsx` + `Component/Component.css`). Monolithic styles or utility-framework overrides are strictly prohibited.
2. **Accessibility & Semantics:** All interactive elements must have accessible labels (`aria-label`, `role`), distinct focus rings, and readable contrast ratios matching WCAG 2.1 AA standards.
3. **Entity Escaping:** In JSX text nodes, write `&gt;` and `&lt;` instead of raw angle brackets to prevent bundle compilation errors.
