# TruthLens — Actual Repository & Directory Structure

## 1. Top-Level Repository

```text
TruthLens/
├── backend/                  # Express.js REST API server & test suites
├── frontend/                 # React 18 + Vite SPA client
├── docs/                     # Comprehensive architecture & civic tech specifications
│   ├── 1 - prd.md            # Product Requirements Document
│   ├── 2 - appflow.md        # Application & user interaction flows
│   ├── 3 - techstack.md      # Tech stack & infrastructure architecture
│   ├── 4 - databaseSchema.md # Mongoose schemas & data models
│   ├── 5 - apiSpec.md        # Authoritative REST API specification
│   ├── 6 - folderStructure.md# Repository file tree reference
│   ├── 7 - design.md         # Newsroom UI/UX design system
│   ├── 8 - tasks.md          # Completed implementation audit log
│   └── 9 - projectRule.md    # Civic tech principles & project rules
├── DECISIONS.md              # Decision Points (DP1, DP2, DP3) write-up
├── README.md                 # Project README & quick start guide
└── .gitignore                # Environment and dependency exclusions
```

---

## 2. Backend Architecture (`backend/`)

```text
backend/
├── package.json              # Express, ioredis, mongoose, multer, cloudinary, dotenv
├── .env                      # Local environment configuration (MongoDB, Redis, secrets)
├── src/
│   ├── app.js                # Express app configuration, middlewares, and routes mounting
│   ├── server.js             # HTTP server entry point with graceful shutdown
│   │
│   ├── config/
│   │   ├── env.js            # Centralized typed environment loader
│   │   ├── db.js             # Mongoose connection to MongoDB Atlas
│   │   ├── redis.js          # ioredis client with resilient in-memory Map fallback
│   │   ├── cloudinary.js     # Cloudinary SDK buffer upload handler
│   │   └── seed.js           # Seed script for realistic editorial demo claims
│   │
│   ├── models/
│   │   └── Claim.js          # Mongoose Claim schema (text, flags, riskMetrics, evidenceUrl)
│   │
│   ├── controllers/
│   │   ├── claimController.js   # Public claim submission, feed, search, and image OCR
│   │   ├── reviewController.js  # Reviewer queue, verdict submission, locks, and queries
│   │   └── reviewerAuthController.js # Access code verification and session logout
│   │
│   ├── services/
│   │   ├── claimService.js      # Authoritative claim creation, feed query, and detail retrieval
│   │   ├── reviewService.js     # Review submission, priority sorting, and collision locks
│   │   ├── riskAnalyzer.js      # Deterministic heuristic engine with metrics & Redis cache
│   │   ├── geminiService.js     # Multimodal Gemini Vision OCR & advisory research queries
│   │   ├── duplicateDetector.js # Atlas semantic vector duplicate detection
│   │   └── aiService.js         # Category suggestion and research query fallbacks
│   │
│   ├── middleware/
│   │   ├── errorMiddleware.js   # Global error formatting and AppError resolution
│   │   └── reviewerMiddleware.js# Guard checking signed HTTP-only reviewer cookie
│   │
│   ├── validators/
│   │   ├── claimValidator.js    # Payload validation for claim submissions
│   │   └── reviewValidator.js   # Payload validation for reviewer verdicts and notes
│   │
│   └── utils/
│       ├── AppError.js          # Operational custom error class
│       ├── asyncHandler.js      # Async controller wrapper catching rejections
│       └── logger.js            # Structured environment-aware console logger
│
└── tests/                       # 45 Automated unit, integration, and E2E tests
    ├── riskAnalyzer.test.js     # Heuristic rules, uppercase ratios, and Redis cache tests
    ├── claimApi.test.js         # Public submission, validation, feed search, and caching
    ├── duplicateAndOcr.test.js  # Gemini Vision OCR and duplicate detector tests
    ├── reviewerAuth.test.js     # Access code validation and cookie session tests
    ├── reviewWorkflow.test.js   # Verdict updates, locks, evidenceUrl, and immutability
    └── e2eVerification.test.js  # Full end-to-end civic tech lifecycle flow
```

---

## 3. Frontend Architecture (`frontend/`)

```text
frontend/
├── index.html                # HTML5 entry document with Inter and Serif typography
├── package.json              # Vite, React, React Router, Axios
├── vite.config.js            # Vite configuration with proxy rules
│
├── src/
│   ├── main.jsx              # React DOM render root
│   ├── App.jsx               # React Router route definitions
│   │
│   ├── styles/
│   │   ├── index.css         # Global design tokens, typography, CSS resets
│   │   └── variables.css     # Semantic color tokens and spacing variables
│   │
│   ├── services/
│   │   ├── api.js            # Configured Axios instance (withCredentials: true)
│   │   ├── claimService.js   # Client HTTP methods for claims, OCR, and duplicates
│   │   └── reviewerService.js# Client HTTP methods for reviewer auth, queue, and locks
│   │
│   ├── pages/
│   │   ├── LandingPage/      # Public landing overview
│   │   ├── SubmitClaimPage/  # Citizen submission interface
│   │   ├── FeedPage/         # Public feed with DP1 & DP2 controls
│   │   ├── ClaimDetailPage/  # Audit record, timeline, citation copy, and related claims
│   │   ├── ReviewerAccessPage/# Access code gate for fact-checkers
│   │   └── ReviewerDashboardPage/# Newsroom workspace with priority queue
│   │
│   └── components/
│       ├── common/
│       │   ├── Button/           # Standardized button variants
│       │   ├── Badge/            # Semantic status and risk badge
│       │   ├── LoadingSpinner/   # High-contrast spinner with accessibility text
│       │   ├── ErrorState/       # Recovery error card with retry button
│       │   └── EmptyState/       # Clear empty state visual
│       │
│       ├── landing/
│       │   ├── Navbar/           # Persistent navigation header with live indicator
│       │   ├── Hero/             # Mission headline and civic tech call-to-actions
│       │   ├── HowItWorks/       # 3-step triage to review explanation
│       │   ├── RiskSignals/      # Deterministic signals explainer
│       │   └── Footer/           # Audit standard notes and navigation links
│       │
│       ├── claims/
│       │   ├── ClaimForm/        # Multimodal claim submission form with OCR & preview
│       │   ├── ClaimCard/        # Public feed claim card with expandable risk drawer
│       │   ├── ClaimList/        # Responsive grid list with pagination controls
│       │   ├── ClaimFilters/     # DP1 sort, DP2 visibility, and debounced search
│       │   ├── RiskFlags/        # Interactive risk signal meter and inspector drawer
│       │   └── StatusBadge/      # Semantic verdict state badges
│       │
│       └── reviewer/
│           ├── ReviewerAccessForm/# Code entry card with HTTP-only cookie auth
│           ├── ReviewerQueue/    # Priority queue list with peer collision lock pills
│           └── ReviewPanel/      # Editorial review form with evidence citations
```
