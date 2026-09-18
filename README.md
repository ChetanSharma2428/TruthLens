# TruthLens — Misinformation Triage & Human-Review Platform

> **Hackathon Track:** Track 2 — Real-World AI Products / Information Verification  
> **Hackathon Project ID:** TL-TRACK2-2026  
> **Reviewer Access Code:** `TRUTHLENS-DEMO-2026`

TruthLens is an editorial misinformation triage platform engineered for newsrooms, citizen organizations, and public-interest researchers. It provides rapid viral claim submission, automated deterministic risk triage, an authenticated human-review workflow, and a transparent public feed.

---

## The Core Philosophy: Separating Risk from Factual Truth

1. **Automated Risk Engine:** Deterministically detects viral risk patterns (sensational language, excessive uppercase shout-formatting, unsourced citations).
2. **Authoritative Human Review:** Factual verdicts (`VERIFIED_TRUE`, `FALSE`, `MISLEADING`) are strictly assigned by human reviewers with required explanatory notes.
3. **Transparent Public Record:** All claims remain publicly traceable across their lifecycle, clearly distinguishing unverified submissions from verified conclusions.

---

## 5 Mandatory Features

1. **F1 — Submit a Claim:** Public submission interface capturing claim text, platform (WhatsApp, X, Instagram, Other), category (Politics, Health, Finance, Other), and optional source URL.
2. **F2 — Deterministic Risk Engine:** Server-side evaluation identifying Sensational text, Shouting (>50% CAPS), Unsourced claims, and High Risk status (2+ flags).
3. **F3 — Human Reviewer Workflow:** Secure, code-authenticated workspace enabling fact-checkers to inspect claims, evaluate evidence, assign verdicts, and write explanatory notes.
4. **F4 — Public Claims Feed:** Editorial card feed with independent category and status filtering, configurable sorting (defaulting to Newest First), and clear state indicators.
5. **F5 — Claim Detail View:** Complete audit record with full claim text, original platform, source links, risk signals, factual verdict, reviewer note, and timestamps.

---

## Key Decision Points (DPs)

- **DP1 — Feed Order:** Default sort is **Newest First** (`submittedAt DESC`). Filtering controls (category/status) are strictly decoupled from sorting controls.
- **DP2 — Unverified Visibility:** Unverified claims remain publicly visible in the feed with a prominent `UNVERIFIED` badge to maintain process transparency without confusing triage with factual verdict.
- **DP3 — Claim Immutability:** Core claim text and initial metadata are permanently immutable post-submission to safeguard the audit trail of what was evaluated.

---

## Tech Stack

- **Frontend:** React 19 / 18, Vite, React Router, Axios, Component-Scoped CSS (1 component = 1 dedicated `.css` file)
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Cookie-Parser, Helmet, CORS, Dotenv, Express-Rate-Limit
- **Security:** HTTP-Only reviewer cookie, server-side secret validation, strict input sanitization, rate-limiting

---

## Repository Structure

```text
TruthLens/
├── backend/                  # Node/Express API, MongoDB models, deterministic risk service
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── controllers/      # Thin route controllers
│   │   ├── middleware/       # Auth, error, rate-limit, and validation middleware
│   │   ├── models/           # Mongoose schemas (Claim, ReviewerSession)
│   │   ├── routes/           # Express API endpoints
│   │   ├── services/         # Risk engine, claim services, review services
│   │   ├── utils/            # Custom AppError and asyncHandler utilities
│   │   ├── validators/       # Input validation schemas
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # HTTP server entrypoint
│   └── package.json
│
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Component-scoped CSS architecture
│   │   │   ├── common/       # Button, Badge, Modal, Loading, ErrorState
│   │   │   ├── landing/      # Navbar, Hero, HowItWorks, RiskSignals, Footer
│   │   │   ├── claims/       # ClaimCard, ClaimList, ClaimFilters, ClaimForm
│   │   │   └── reviewer/     # ReviewerAccessForm, ReviewerQueue, ReviewPanel
│   │   ├── pages/            # LandingPage, FeedPage, SubmitClaimPage, etc.
│   │   ├── services/         # Axios API clients
│   │   ├── index.css         # Global tokens & typography only
│   │   └── App.jsx           # App routes
│   └── package.json
│
├── docs/                     # Product, schema, and API specifications
├── DECISIONS.md              # Architectural and product decisions record
├── README.md                 # Project documentation
└── .gitignore                # Git exclusions
```

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on default port 27017 or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Review configuration: PORT=5001, REVIEWER_ACCESS_CODE=TRUTHLENS-DEMO-2026
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Accessing TruthLens
- **Public Feed & Landing:** `http://localhost:5173`
- **Reviewer Access:** Click "Reviewer" on the landing page or visit `http://localhost:5173/reviewer/access`
- **Reviewer Demo Code:** `TRUTHLENS-DEMO-2026`

---

## 3–4 Minute Hackathon Evaluation Demo Walkthrough

1. **Landing Page (`/`):**
   - Open `http://localhost:5173`.
   - Inspect the editorial mission statement, the 3-step workflow (Submit → Triage → Review), and the deterministic risk signal definitions.
   - Click **Get Started** to enter the public feed.

2. **Public Claims Feed (`/feed`):**
   - Note the **Newest First** default sort order (DP1).
   - Observe that unverified claims are transparently displayed with a prominent `UNVERIFIED` badge (DP2).
   - Test independent filtering: select **Category = Finance** or **Status = False**.
   - Notice how sorting remains independent from filtering.

3. **Submit a Claim (`/submit`):**
   - Enter a viral claim: `"BREAKING!!! SHOCKING EMERGENCY LOCKDOWN ON ALL ACCOUNTS! SHARE BEFORE DELETED!"`
   - Select Platform = **WhatsApp**, Category = **Finance**, leave Source URL empty.
   - Click **Submit Claim**.
   - Observe instant deterministic triage: **HIGH RISK** (Sensational + Shouting + Unsourced).
   - Note that initial status is strictly **UNVERIFIED**.

4. **Reviewer Access (`/reviewer/access`):**
   - Navigate to Reviewer Workspace.
   - Enter invalid code to demonstrate rejection.
   - Enter demo reviewer code: `TRUTHLENS-DEMO-2026`.
   - Observe secure server validation and establishment of HTTP-only session cookie.

5. **Reviewer Dashboard (`/reviewer/dashboard`):**
   - View pending review queue showing all unverified submissions.
   - Click **Review Claim** on the submitted claim.
   - Inspect the 3-part layout: (1) Exact Submitted Content, (2) Automated Risk Heuristics, (3) Human Reviewer Verdict.
   - Select **Verdict = FALSE** and enter explanation: `"Official regulatory authorities and Central Bank confirmed normal operations. No lockdown exists."`
   - Click **Submit Verification Verdict**.

6. **Audit & Transparency (`/claims/:id` & `/feed`):**
   - Return to the Public Feed: verify the claim is now marked **FALSE**.
   - Click **View Details**: inspect the complete immutable record (DP3), including the reviewer note, original platform, risk flags, and verification timestamp.
