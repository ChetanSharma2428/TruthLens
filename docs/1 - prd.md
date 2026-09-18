# TruthLens — Product Requirements Document

## 1. Product Summary

TruthLens is a misinformation triage platform for a newsroom, citizen group, or public-interest team. It lets anyone submit viral claims, automatically identifies the risk signals required by the hackathon brief, routes unverified claims into a reviewer workflow, and exposes review outcomes through a transparent public feed.

TruthLens separates **risk** from **truth**:

- Risk flags are generated deterministically by the backend.
- A human reviewer determines the factual outcome.
- The public sees the current review status and explanation.

TruthLens is not presented as an infallible automatic fake-news detector.

## 2. Required Features

### F1 — Submit a Claim

Public visitors can submit:

- Claim text.
- Source platform: WhatsApp, X, Instagram, Other.
- Category: Politics, Health, Finance, Other.
- Optional source link.

Every new claim starts as `UNVERIFIED`.

### F2 — Risk Flags

The backend applies the required rules:

| Condition | Flag |
|---|---|
| Contains `breaking`, `shocking`, or `share before deleted` | Sensational |
| More than 50% CAPS | Shouting |
| No source link | Unsourced |
| 2+ flags | High Risk |

Risk level is not the same as factual status.

### F3 — Review Workflow

A reviewer sees unverified claims and chooses:

- Verified True.
- False.
- Misleading.

The reviewer must add a short note.

The backend records the verdict and review time.

### F4 — Public Feed

The public feed contains claims with:

- Status badge.
- Risk indicator.
- Claim text.
- Category.
- Platform.
- Submission time.
- Detail action.

Filters:

- Category.
- Status.

Sorting is separate from filtering.

Default:

- Category: All.
- Status: All.
- Sort: Newest First.

### F5 — Detail View

A claim detail page displays:

- Full claim.
- Platform.
- Category.
- Source link when supplied.
- Risk flags.
- Risk level.
- Status.
- Reviewer note.
- Submission time.
- Review time when available.

## 3. Entry Experience

### Landing Page

The landing page has two primary actions:

**Get Started**
→ Public Feed

**Reviewer**
→ Reviewer Access → Reviewer Dashboard

Public visitors do not create accounts.

### Reviewer Access

Reviewer functionality is protected by a server-side access code and temporary reviewer session. The code is never hard-coded into the React application.

## 4. Users and Permissions

### Public Visitor

Can:

- Browse the feed.
- Filter.
- Sort.
- View claim details.
- Submit claims.

Cannot:

- Change a claim verdict.
- Edit a submitted claim.

### Reviewer

Can:

- Access reviewer dashboard.
- View pending claims.
- Open claims.
- Record a verdict.
- Add a reviewer note.

Reviewer access is controlled without creating a public registration/login system.

## 5. Claim Lifecycle

```text
UNVERIFIED
    |
    +--> VERIFIED_TRUE
    |
    +--> FALSE
    |
    +--> MISLEADING
```

The submitted claim text is immutable after submission.

## 6. Decision Points

### DP1 — Feed Order

**Decision:** Default to newest first. Sorting is explicitly separate from filters.

**Why:** A public claims feed benefits from showing the newest submissions first while still allowing visitors to select the subset they want.

### DP2 — Unverified Visibility

**Decision:** Unverified claims are publicly visible with a prominent `UNVERIFIED` label.

**Why:** This makes the review lifecycle transparent while clearly communicating that the claim has not received a factual verdict.

### DP3 — Editing

**Decision:** Core claim text cannot be edited after submission.

**Why:** A review should remain attached to exactly the text that the reviewer evaluated. A correction can be submitted as a new claim.

## 7. Product Principles

1. Risk signals must not be presented as proof of falsehood.
2. Human review is distinct from automated triage.
3. The public feed should be understandable without training.
4. Reviewer actions must be protected at the API level.
5. No fake credibility metrics or fabricated endorsements.
6. Empty, loading, success, and error states are part of the product.
7. The interface should look like a serious information/review product, not a generic AI template.

## 8. Success Criteria

A grader should be able to:

1. Open the public URL.
2. Understand the product from the landing page.
3. Enter the public experience without an account.
4. Submit a claim.
5. Trigger the required risk flags.
6. Find the claim in the feed.
7. Filter and sort claims.
8. Open claim details.
9. Enter reviewer mode using the supplied demo code.
10. Review the claim.
11. Select True/False/Misleading.
12. Add a note.
13. See the updated public status.

## 9. Out of Scope

- Public user accounts.
- Social features such as comments, likes, followers.
- Payments.
- Native mobile apps.
- Automatic factual verdicts.
- Complex organization/user administration.
- AI dependency for the five mandatory features.
