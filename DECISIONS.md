# Architectural & Product Decisions (DECISIONS.md)

This document details the key architectural and product decisions for **TruthLens — Misinformation Triage Platform**, addressing the three core Decision Points.

---

## DP1 · Feed Order
* **Chosen Approach:** **Recency (Newest First)** by default (`submittedAt DESC`), with user controls to re-order by **Highest Risk First** or **Status**.
* **Why:** Misinformation travels at viral speeds, so users and fact-checkers need immediate visibility into newly emerging claims circulating across platforms. Defaulting to recency ensures fresh rumors are triaged right away instead of being buried under older items. Sorting controls are decoupled from category and status filters so users can view the latest submissions while retaining the flexibility to re-rank by risk severity at any point.

---

## DP2 · Visibility
* **Chosen Approach:** **Unverified claims are publicly visible immediately** upon submission, clearly labeled with a prominent `UNVERIFIED` badge.
* **Why:** The platform operates with complete transparency rather than acting as a black-box filter that withholds incoming reports. Holding claims back until review would introduce critical information delays during breaking events when public awareness is most urgent. To prevent confusion, unverified claims feature distinct neutral styling that clearly separates automated risk heuristics from human factual verdicts (`Verified True`, `False`, `Misleading`).

---

## DP3 · Editing
* **Chosen Approach:** **Claims are strictly immutable after submission**; editing is prohibited.
* **Why:** A dependable fact-checking audit trail requires that human verdicts, reviewer notes, and automated risk flags remain permanently linked to the exact wording evaluated at submission. Allowing text to be edited post-submission would create a severe exploit where benign text is verified and subsequently swapped for harmful misinformation. If a claim contains a mistake or new phrasing emerges, it must be submitted as a separate new claim with its own independent triage timeline.

---

## Standard API Implementation
I have implemented the standard REST API for this track. All 5 core features and decision points can be evaluated via standard REST endpoints or through the web interface.

---

## API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description (In Brief) |
|---|---|---|
| `POST` | `/api/claims` | Submits a new claim and executes automated risk triage. |
| `GET` | `/api/claims` | Fetches public feed with sorting, filtering, and pagination. |
| `GET` | `/api/claims/:id` | Returns complete claim detail, audit timeline, and reviewer verdict. |
| `POST` | `/api/claims/check-duplicate` | Checks text similarity to detect duplicate viral rumors. |
| `POST` | `/api/claims/extract-from-image` | Extracts claim text, platform, and category from screenshot via OCR. |
| `POST` | `/api/claims/suggest-category` | Suggests editorial category based on claim keywords. |
| `POST` | `/api/claims/analyze-risk` | Evaluates heuristic virality flags and returns risk score. |
| `GET` | `/api/stats` | Returns live platform metrics and trending topics from database. |
| `GET` | `/health` | Lightweight service liveness and uptime check for external monitors. |

### Reviewer Workflow Endpoints (Direct Access — No Login Required)
| Method | Endpoint | Description (In Brief) |
|---|---|---|
| `GET` | `/api/reviews/pending` | Fetches queue of unverified claims prioritized by risk level. |
| `POST` | `/api/reviews/:claimId` | Submits human verdict (`Verified True`, `False`, `Misleading`) with explanation note. |
| `POST` | `/api/reviews/:claimId/lock` | Acquires 10-minute collision lock to prevent simultaneous reviews. |
| `POST` | `/api/reviews/:claimId/unlock` | Releases active collision lock on a claim. |
| `GET` | `/api/reviews/:claimId/research-assistance` | Generates targeted search queries to assist fact-checkers. |

---

