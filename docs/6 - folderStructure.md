# TruthLens — Folder Structure

## 1. Repository

```text
truthlens/
│
├── frontend/
├── backend/
├── docs/
├── README.md
├── DECISIONS.md
└── .gitignore
```

All nine planning documents belong in `docs/`.

## 2. Frontend

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Badge.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Modal.css
│   │   │   └── ...
│   │   │
│   │   ├── landing/
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Navbar.css
│   │   │   ├── Hero/
│   │   │   │   ├── Hero.jsx
│   │   │   │   └── Hero.css
│   │   │   ├── HowItWorks/
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   └── HowItWorks.css
│   │   │   ├── RiskSignals/
│   │   │   │   ├── RiskSignals.jsx
│   │   │   │   └── RiskSignals.css
│   │   │   └── Footer/
│   │   │       ├── Footer.jsx
│   │   │       └── Footer.css
│   │   │
│   │   ├── claims/
│   │   │   ├── ClaimCard/
│   │   │   │   ├── ClaimCard.jsx
│   │   │   │   └── ClaimCard.css
│   │   │   ├── ClaimList/
│   │   │   │   ├── ClaimList.jsx
│   │   │   │   └── ClaimList.css
│   │   │   ├── ClaimFilters/
│   │   │   │   ├── ClaimFilters.jsx
│   │   │   │   └── ClaimFilters.css
│   │   │   ├── ClaimForm/
│   │   │   │   ├── ClaimForm.jsx
│   │   │   │   └── ClaimForm.css
│   │   │   ├── RiskFlags/
│   │   │   │   ├── RiskFlags.jsx
│   │   │   │   └── RiskFlags.css
│   │   │   └── StatusBadge/
│   │   │       ├── StatusBadge.jsx
│   │   │       └── StatusBadge.css
│   │   │
│   │   └── reviewer/
│   │       ├── ReviewerAccessForm/
│   │       │   ├── ReviewerAccessForm.jsx
│   │       │   └── ReviewerAccessForm.css
│   │       ├── ReviewerQueue/
│   │       │   ├── ReviewerQueue.jsx
│   │       │   └── ReviewerQueue.css
│   │       ├── ReviewPanel/
│   │       │   ├── ReviewPanel.jsx
│   │       │   └── ReviewPanel.css
│   │       └── ReviewStatus/
│   │           ├── ReviewStatus.jsx
│   │           └── ReviewStatus.css
│   │
│   ├── pages/
│   │   ├── LandingPage/
│   │   │   ├── LandingPage.jsx
│   │   │   └── LandingPage.css
│   │   ├── FeedPage/
│   │   │   ├── FeedPage.jsx
│   │   │   └── FeedPage.css
│   │   ├── SubmitClaimPage/
│   │   │   ├── SubmitClaimPage.jsx
│   │   │   └── SubmitClaimPage.css
│   │   ├── ClaimDetailPage/
│   │   │   ├── ClaimDetailPage.jsx
│   │   │   └── ClaimDetailPage.css
│   │   ├── ReviewerAccessPage/
│   │   │   ├── ReviewerAccessPage.jsx
│   │   │   └── ReviewerAccessPage.css
│   │   └── ReviewerDashboardPage/
│   │       ├── ReviewerDashboardPage.jsx
│   │       └── ReviewerDashboardPage.css
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── claimService.js
│   │   └── reviewerService.js
│   │
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
└── vite.config.js
```

## 3. CSS Rule

Every React component gets its own CSS file.

```text
ClaimCard/
├── ClaimCard.jsx
└── ClaimCard.css
```

Global CSS should contain only genuine global rules:

- Reset/base.
- Global typography.
- CSS variables/tokens.
- Global utility/accessibility styles.

Do not create one giant stylesheet for all components.

## 4. Backend

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── claimController.js
│   │   ├── reviewerController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/
│   │   ├── errorMiddleware.js
│   │   ├── reviewerMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── models/
│   │   ├── Claim.js
│   │   └── ReviewerSession.js
│   │
│   ├── routes/
│   │   ├── claimRoutes.js
│   │   ├── reviewerRoutes.js
│   │   └── reviewRoutes.js
│   │
│   ├── services/
│   │   ├── riskAnalyzer.js
│   │   ├── claimService.js
│   │   └── reviewService.js
│   │
│   ├── validators/
│   │   ├── claimValidator.js
│   │   └── reviewValidator.js
│   │
│   ├── utils/
│   │   ├── AppError.js
│   │   └── asyncHandler.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

## 5. Backend Rule

Keep responsibilities separated:

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
 ↓
MongoDB
```

Controllers should not contain large blocks of business logic.
