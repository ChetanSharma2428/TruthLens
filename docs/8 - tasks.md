# TruthLens — Implementation Tasks

## Phase 0 — Product & Contract Freeze

- [ ] Confirm Track 2 standard API documentation.
- [ ] Reconcile proposed API names and payloads with the standard API.
- [ ] Freeze DP1: newest-first default.
- [ ] Freeze DP2: unverified claims visible with prominent status.
- [ ] Freeze DP3: core claim text immutable.
- [ ] Confirm final visual direction.
- [ ] Confirm demo reviewer access mechanism.

## Phase 1 — Repository Setup

- [ ] Create Git repository.
- [ ] Create `frontend`.
- [ ] Create `backend`.
- [ ] Create `docs`.
- [ ] Create `.gitignore`.
- [ ] Create root README.
- [ ] Add Hackathon ID to README.
- [ ] Add DECISIONS.md.

## Phase 2 — Frontend Foundation

- [ ] Initialize React/Vite.
- [ ] Configure React Router.
- [ ] Create global CSS tokens/base styles.
- [ ] Create common Button.
- [ ] Create common Badge.
- [ ] Create common loading/error components.
- [ ] Create landing page structure.
- [ ] Create page-specific CSS files.

## Phase 3 — Landing Page

- [ ] Navbar.
- [ ] Hero.
- [ ] Get Started action.
- [ ] Reviewer action.
- [ ] How It Works.
- [ ] Risk Signals explanation.
- [ ] Footer.
- [ ] Responsive behavior.

## Phase 4 — Backend Foundation

- [ ] Initialize Node/Express.
- [ ] Configure environment variables.
- [ ] Connect MongoDB.
- [ ] Configure CORS.
- [ ] Configure Helmet.
- [ ] Configure rate limiting.
- [ ] Configure JSON parsing.
- [ ] Configure error middleware.
- [ ] Create base API structure.

## Phase 5 — Claim Model + Risk Engine

- [ ] Create Claim model.
- [ ] Add validation.
- [ ] Implement sensational rule.
- [ ] Implement uppercase rule.
- [ ] Implement unsourced rule.
- [ ] Implement high-risk calculation.
- [ ] Write unit tests for every risk rule.
- [ ] Ensure frontend cannot override risk values.

## Phase 6 — Claim APIs

- [ ] Implement create claim.
- [ ] Implement public feed.
- [ ] Implement category filtering.
- [ ] Implement status filtering.
- [ ] Implement default newest-first ordering.
- [ ] Implement pagination.
- [ ] Implement claim detail.
- [ ] Test API responses against the standard API contract.

## Phase 7 — Public Frontend

- [ ] Public feed page.
- [ ] Claim card.
- [ ] Status badge.
- [ ] Risk flags.
- [ ] Filters.
- [ ] Sorting.
- [ ] Empty state.
- [ ] Error state.
- [ ] Loading state.
- [ ] Submit claim page.
- [ ] Form validation.
- [ ] Submission success state.
- [ ] Claim detail page.

## Phase 8 — Reviewer Access

- [ ] Reviewer access page.
- [ ] Backend access endpoint.
- [ ] Server-side access code.
- [ ] Temporary reviewer session.
- [ ] HTTP-only cookie.
- [ ] Reviewer middleware.
- [ ] Reviewer logout.
- [ ] Reviewer access tests.

## Phase 9 — Reviewer Workflow

- [ ] Reviewer dashboard.
- [ ] Pending review queue.
- [ ] Review claim page/panel.
- [ ] Verdict selection.
- [ ] Reviewer note.
- [ ] Review validation.
- [ ] Review API.
- [ ] Public feed reflects reviewed status.
- [ ] Detail page reflects review note.

## Phase 10 — Product Polish

- [ ] Responsive desktop layout.
- [ ] Responsive mobile layout.
- [ ] Keyboard navigation.
- [ ] Focus states.
- [ ] Error messages.
- [ ] Empty states.
- [ ] Skeleton/loading states.
- [ ] Button disabled states.
- [ ] Consistent spacing.
- [ ] Typography refinement.
- [ ] Remove placeholder content.
- [ ] Remove unnecessary visual effects.

## Phase 11 — Optional AI Enhancement

Only after all required features work:

- [ ] Decide whether AI adds meaningful value.
- [ ] If yes, add category suggestion and/or duplicate detection.
- [ ] Keep AI optional.
- [ ] Clearly distinguish AI suggestion from reviewer verdict.
- [ ] Test failure/fallback behavior.

## Phase 12 — Testing

### Functional

- [ ] Submit valid claim.
- [ ] Reject invalid claim.
- [ ] Sensational detection.
- [ ] Shouting detection.
- [ ] Unsourced detection.
- [ ] High-risk calculation.
- [ ] Feed.
- [ ] Category filter.
- [ ] Status filter.
- [ ] Sort.
- [ ] Details.
- [ ] Reviewer access.
- [ ] Invalid reviewer code.
- [ ] Review True.
- [ ] Review False.
- [ ] Review Misleading.
- [ ] Reviewer note.
- [ ] Unauthorized review API rejection.

### UX

- [ ] Desktop.
- [ ] Mobile.
- [ ] Empty states.
- [ ] Loading states.
- [ ] Error states.
- [ ] Accessibility basics.

## Phase 13 — Deployment

- [ ] Deploy frontend.
- [ ] Deploy backend.
- [ ] Configure MongoDB.
- [ ] Configure environment variables.
- [ ] Configure CORS.
- [ ] Verify production cookies.
- [ ] Verify all API calls.
- [ ] Test public URL.

## Phase 14 — Submission

- [ ] Public working URL.
- [ ] Public GitHub repository.
- [ ] README with track.
- [ ] README with tech stack.
- [ ] README with run steps.
- [ ] README with demo reviewer credentials.
- [ ] README with Hackathon ID.
- [ ] DECISIONS.md.
- [ ] Standard API implementation declaration.
- [ ] 3–4 minute demo.
- [ ] Demonstrate all five features in order.
- [ ] Demonstrate Decision Point behaviors.
- [ ] Final production test.
