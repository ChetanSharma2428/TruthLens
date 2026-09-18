# TruthLens — Misinformation Triage Platform

> **Hackathon Track:** Civic Tech — A Misinformation Triage Platform  
> **Hackathon ID:** `[YOUR_HACKATHON_ID_HERE]` *(Find on your Profile page; replace before submitting)*  
> **Standard API Implemented:** **YES** *(Implements standard REST API; gradable by test scripts or browser agents)*  
> **Authentication Policy:** **NO LOGIN / SIGNUP REQUIRED** *(Graders have direct access to all features without creating an account)*  
> **Live App URL:** `http://localhost:5173` 

TruthLens is a civic tech misinformation triage platform built for newsrooms, citizen organizations, and research collectives. Social media moves faster than fact-checkers can; TruthLens is neutral by design, checking information patterns rather than ideologies.

---

## 5 Required Features

### 1. Submit a Claim
- Public intake interface capturing the text of a viral post.
- **Source Platform Selector:** `WhatsApp` | `X` | `Instagram` | `Other`.
- **Category Selector:** `Politics` | `Health` | `Finance` | `Other`.
- **Optional Source Link:** URL attribution verification.
- **Optional Screenshot Dropzone:** Integrated Gemini Vision OCR with Cloudinary CDN hosting.

### 2. Risk Flags (Deterministic Heuristics)
- `"breaking"` / `"shocking"` / `"share before deleted"` → **Sensational**
- `>50% CAPS` in alphabetic text → **Shouting**
- `no source link` → **Unsourced**
- **High Risk:** Triggered when **2 or more flags** are detected (otherwise Normal Risk).
- *Strict Separation:* Heuristic risk indicates viral urgency patterns, NOT factual truth.

### 3. Review Workflow
- Reviewers move claims from **Unverified** to **Verified True**, **False**, or **Misleading**.
- Requires a factual explanation note and optional primary evidence citation.
- Collaborative collision-lock prevents newsroom reviewers from overwriting concurrent triage.
- **No account required:** Graders can access and test the review workflow directly at `/reviewer`.

### 4. Public Feed
- Public stream displaying all submitted claims with unmistakable status badges.
- **Independent Category Filter:** `All`, `Politics`, `Health`, `Finance`, `Other`.
- **Independent Status Filter:** `All`, `Unverified`, `Verified True`, `False`, `Misleading`.
- Real-time search with 350ms debouncing and text-indexed database queries.

### 5. Detail View
- Comprehensive audit page (`/claims/:id`) rendering:
  - Claim's full unedited text.
  - Detected risk flags and percentage metrics.
  - Reviewer's note and official evidence link.
  - Submission timestamp and immutable audit history.

---

## 3 Decision Points (See DECISIONS.md)

| Decision Point | Chosen Approach | Summary Rationale |
|---|---|---|
| **DP1 · Feed Order** | **Recency (Newest First)** | Social media rumors travel at viral speeds; users need immediate situational awareness of fresh incoming claims. Users can switch to *Highest Risk* or *Status* anytime. |
| **DP2 · Visibility** | **Unverified Claims Publicly Visible** | Radical transparency prevents black-box censorship during breaking crises. Unverified claims display a prominent neutral `UNVERIFIED` badge clearly separated from human verdicts. |
| **DP3 · Editing** | **Claims Strictly Immutable** | Core claim text cannot be edited post-submission to protect audit trails from bad-actor bait-and-switch tampering. Altered claims must be submitted as new entries. |

*Full 2–4 sentence rationales for each Decision Point are documented in [DECISIONS.md](DECISIONS.md).*

---

## Standard API Specification

TruthLens implements the standard REST API specification:

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/claims` | List public claims feed (supports `category`, `status`, `sort`, `visibility`, `search`, `page`, `limit`) | Public |
| `POST` | `/api/claims` | Submit a new claim (`text`, `platform`, `category`, `sourceUrl`, `imageUrl`) | Public |
| `GET` | `/api/claims/:id` | Get claim detail by ID with audit timeline and related claims | Public |
| `GET` | `/api/reviews/pending` | Get queue of claims pending reviewer verification | Direct / Grader |
| `POST` | `/api/reviews/:claimId` | Submit human reviewer verdict (`verdict`, `note`, `evidenceUrl`) | Direct / Grader |
| `POST` | `/api/reviews/:claimId/lock` | Acquire collaborative review lock (10-minute TTL) | Direct / Grader |
| `POST` | `/api/reviews/:claimId/unlock`| Release review lock | Direct / Grader |
| `GET` | `/api/stats` | Dynamic live platform metrics aggregated directly from database | Public |

---

## Tech Stack & Architecture

- **Frontend:** React, Vite, React Router, Axios, Component-Scoped CSS (1 component = 1 directory with dedicated `.css`).
- **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, Redis Cloud / Resilient In-Memory Fallback.
- **Multimodal AI & OCR:** Google Gemini 3.5 Flash Vision & Cloudinary CDN.
- **Performance:** Dynamic code splitting, gzip compression, database connection pooling (`5-20`), Redis query caching.

---

## Quick Start & Local Run Steps

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Access All Features (No Account Required)
- **Public Feed:** `http://localhost:5173/feed`
- **Submit Claim:** `http://localhost:5173/submit`
- **Reviewer Workspace:** `http://localhost:5173/reviewer` (Click "Reviewer" in navbar — zero login/signup barrier)

---

## 3–4 Minute Demo Recording Script (Feature-by-Feature)

Follow this sequence for your hackathon demo video:

1. **Submit a Claim (Feature 1 & 2):**
   - Navigate to `/submit`.
   - Paste a viral text: `"BREAKING: CENTRAL BANK CLOSES ALL ATMS THIS FRIDAY! SHARE BEFORE DELETED!"`
   - Select platform **WhatsApp**, category **Finance**, leave source URL empty.
   - Point out the instant risk calculation: **HIGH RISK** with flags `Sensational` (`breaking`, `share before deleted`), `Shouting` (`>50% CAPS`), and `Unsourced` (`no source link`).
   - Click **Submit Claim**.

2. **Public Feed & Decision Points DP1 & DP2 (Feature 4):**
   - Open `/feed`.
   - **DP1 Demonstration:** Show that the newly submitted claim appears at the very top under **Newest First**. Toggle sort to **Highest Risk First** to demonstrate decoupled control.
   - **DP2 Demonstration:** Show that the unverified claim is transparently visible with the neutral **UNVERIFIED** badge, clearly distinguished from verified conclusions.
   - Filter by **Category = Finance** and **Status = Unverified** to show real-time filtering.

3. **Review Workflow (Feature 3):**
   - Click **Reviewer** in the top navbar (navigate to `/reviewer` without any login prompt).
   - Select the newly submitted claim from the pending queue.
   - Select verdict card **✕ False**.
   - Type reviewer note: `"Official banking authorities and central bank press releases confirm all ATMs operate under normal schedule."`
   - Attach official citation URL and click **Submit Verdict**.

4. **Detail View & Decision Point DP3 (Feature 5):**
   - Return to `/feed` and observe status updated to **False**.
   - Click the claim to open **Detail View** (`/claims/:id`).
   - Show the full text, reviewer note, detected flags, and verification timestamp.
   - **DP3 Demonstration:** Explain that claim text is strictly immutable to safeguard the fact-checking audit trail from tampering.
