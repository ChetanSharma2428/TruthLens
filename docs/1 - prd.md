# TruthLens — Product Requirements Document (PRD)

## 1. Executive Summary & Vision

**TruthLens** is a modern, civic-tech misinformation triage and human-in-the-loop verification platform built for newsrooms, citizen audit collectives, and public-interest fact-checkers.

Social media moves orders of magnitude faster than human fact-checkers can publish debunks. TruthLens solves this by separating **virality urgency triage** from **authoritative factual verification**:

1. **Deterministic Triage Engine:** Scans submitted claims against objective viral urgency patterns (sensational urgency phrasing, shouting capitalization, unsourced claims) and prioritizes triage queues.
2. **Authoritative Human-in-the-Loop Review:** Dedicated newsroom reviewers evaluate primary-source evidence to assign immutable factual verdicts (`Verified True`, `False`, `Misleading`) with explanatory notes and official citations.
3. **Transparent Public Accountability:** The public feed and audit record display both the initial automated triage signals and the human verdict, accompanied by full chronological provenance (DP3).

> **Core Civic Tech Principle:** Automated heuristics flag viral amplification risk, never factual truth. A true event can be reported with sensational shouting; a calm, polite post can be completely fabricated. High Risk $\neq$ False.

---

## 2. Implemented Feature Specifications

### Feature 1 — Submit a Claim (Multimodal OCR & Duplicate Detection)
* **Text Input:** Claim text (5–1000 chars) with real-time character counter and input sanitization.
* **Source Attribution:** Circulating platform (`WhatsApp`, `X`, `Instagram`, `Other`) and subject category (`Politics`, `Health`, `Finance`, `Other`).
* **Optional Source Link:** URL syntax validation for primary link attribution.
* **Multimodal Screenshot OCR (Gemini Vision + Cloudinary):** Citizens can drag-and-drop screenshots of viral posts. Gemini Vision extracts claim text automatically while Cloudinary hosts the visual evidence.
* **Semantic Duplicate Detection (MongoDB Atlas Vector Search):** Compares submissions against existing circulating claims using cosine similarity, alerting users before filing duplicates.
* **Live Triage Preview:** Real-time signal preview bar showing estimated risk signals as the citizen types.
* **Authoritative Initial State:** Every submission starts strictly as `UNVERIFIED`.

### Feature 2 — Deterministic Risk Flags & Structured Metrics
The backend evaluates submitted text and attribution against deterministic rules:

| Signal | Evaluation Condition | Meaning in Triage |
|---|---|---|
| **SENSATIONAL** | Text contains `"breaking"`, `"shocking"`, or `"share before deleted"` (case-insensitive regex). | Flags manufactured urgency designed to force uncritical re-sharing. |
| **SHOUTING** | $>50\%$ of alphabetic characters are capitalized (ignoring emojis/numbers/punctuation). | Flags emergency warning emulation. |
| **UNSOURCED** | Missing, null, or whitespace-only source link. | Flags unreferenced hearsay lacking an verifiable point of origin. |
| **HIGH RISK** | $2$ or more active risk flags. | Flags compounded virality risk requiring priority newsroom attention. |

* **Structured Metrics Breakdown:** In addition to flag arrays, outputs `uppercaseRatio`, `uppercasePercent`, `detectedKeywords`, `hasSource`, and `riskScore`.
* **Interactive Signal Inspector:** Frontend meter displaying exact capitalization ratio progress bars, detected keywords, and civic neutrality disclaimers.
* **Redis Caching:** Risk evaluations are cached by SHA-256 hash for 1 hour to eliminate redundant recalculation.

### Feature 3 — Human Reviewer Workflow & Collision Prevention
* **Reviewer Authentication:** Server-side validation of `REVIEWER_ACCESS_CODE` issuing signed HTTP-only session cookies (`truthlens_reviewer_token`).
* **Verdict Assignment:** Reviewers transition claims from `UNVERIFIED` to `VERIFIED_TRUE`, `FALSE`, or `MISLEADING`.
* **Mandatory Reviewer Note:** Requires an explanatory note ($5\text{–}1000$ characters) justifying the editorial outcome.
* **Official Evidence Citation (`evidenceUrl`):** Reviewers attach official reference links (e.g. PIB fact-checks, WHO bulletins, government gazettes).
* **Collaborative Collision Locks (Redis):** Reviewers acquire a 10-minute lock (`claim:lock:<id>`) upon opening a claim, preventing newsroom peers from duplicating effort.
* **Advisory Research Assistance:** Optional Gemini AI / heuristic search query suggestions (e.g. `site:pib.gov.in`, `site:who.int`) with 24-hour Redis caching.

### Feature 4 — Public Feed & Decision Points (DP1 & DP2)
* **DP1 · Feed Order Selector:**
  * `Newest First` (Default): Chronological recency displaying unvarnished social media reality.
  * `Highest Risk First`: Surfaces urgent claims triggering 2+ risk flags for rapid triage.
  * `Verified Outcomes First`: Surfaces concluded factual verdicts first.
  * `Oldest Submissions`: Archival review.
* **DP2 · Visibility Mode Selector:**
  * `All Claims (Transparent Triage)` (Default): Unverified claims are visible immediately with amber badges to prevent misinformation vacuums.
  * `Verified Only`: Editorial filter for confirmed factual debunks.
* **Debounced Keyword Search:** Search bar filtering claims and notes across all fields with 350ms debouncing.
* **Category & Status Dropdowns:** Dynamic multi-dimensional filtering with instant count feedback.
* **Redis Feed Caching:** Feed queries cached for 30 seconds for instant page navigation.

### Feature 5 — Detail View & Immutability Provenance (DP3)
* **Full Record Display:** Complete claim text, platform, category, submission time, and flags breakdown.
* **Verdict Card:** Authoritative verdict badge, reviewer explanation note, review timestamp, and clickable evidence link (`evidenceUrl ↗`).
* **Audit Trail Timeline (DP3):** Step-by-step chronological provenance:
  1. *Community Claim Submitted* (timestamp, platform, category, immutable text).
  2. *Deterministic Heuristic Scan* (risk signals, uppercase percentage, keyword triggers).
  3. *Human Editorial Verdict* (assigned verdict, explanation note, citation link).
* **Screenshot Lightbox Modal:** Full-resolution preview of attached screenshot evidence.
* **One-Click Citation Sharing:** Generates formatted audit citations for journalists and researchers.
* **Related Claims Grid:** Contextual claims in the same subject category.
* **Redis Record Caching:** Single-record lookups cached for 60 seconds.

---

## 3. Decision Points (DPs) Specification

| Decision Point | Architectural Choice | Civic Tech Rationale |
|---|---|---|
| **DP1 · Feed Order** | Default to **Newest First**, with user toggles for **Highest Risk First** and **Status**. | Chronological order prevents algorithmic editorial curation or suppression. High Risk sorting enables urgency triage; Status sorting provides established reference records. |
| **DP2 · Visibility** | Default to **Transparent Triage (All Claims Visible)**, with user toggle for **Verified Only**. | Withholding unverified claims creates information vacuums where conspiracies proliferate. Visible unverified claims with amber warning badges signal active newsroom scrutiny. |
| **DP3 · Immutability** | **Core claim text and submission metadata are permanently immutable post-submission.** | Factual verdicts and evidence notes are tethered to the exact phrasing evaluated. Allowing post-submission edits corrupts fact-checking integrity; corrections require distinct submissions. |
