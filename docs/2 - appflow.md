# TruthLens — Complete Application Flow

## 1. System Architecture Flow

```text
                               +-----------------------------+
                               |     PUBLIC USER / CITIZEN   |
                               +--------------+--------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
                   v                                                     v
          SUBMISSION FLOW                                          PUBLIC FEED FLOW
+------------------------------------+               +-------------------------------------------+
| 1. Type claim text or upload image |               | 1. Browse live claims                     |
| 2. OCR extracts text (Gemini)      |               | 2. Toggle DP1 Feed Order                  |
| 3. Duplicate check (Atlas Vector)  |               |    (Newest / High Risk / Status / Oldest) |
| 4. Real-time triage preview bar    |               | 3. Toggle DP2 Visibility                  |
| 5. Submit -> Backend calculates    |               |    (Transparent All vs Verified Only)     |
|    deterministic flags & caches    |               | 4. Filter by Category & Status            |
| 6. Stored in Atlas as UNVERIFIED   |               | 5. Debounced keyword search               |
+------------------+-----------------+               +---------------------+---------------------+
                   |                                                       |
                   +---------------------------+---------------------------+
                                               |
                                               v
                                   +-----------------------+
                                   |      DETAIL VIEW      |
                                   | - Full immutable text |
                                   | - Risk signal meters  |
                                   | - Reviewer verdict    |
                                   | - Evidence citations  |
                                   | - Audit trail (DP3)   |
                                   | - Screenshot modal    |
                                   | - Related claims      |
                                   +-----------------------+
                                               ^
                                               |
                               +---------------+---------------+
                               |  AUTHENTICATED NEWSROOM FLOW  |
                               +---------------+---------------+
                                               |
                                    1. Access Code Verification
                                    2. HTTP-only Cookie Set
                                    3. Priority Queue Triage
                                    4. Collaborative Collision Lock
                                    5. Advisory Research Assistance
                                    6. Record Verdict + Note + Citation
```

---

## 2. Public Submission Flow (`/submit`)

1. **User Navigation:** Citizen clicks **Submit a Claim** from the Navbar or Feed header.
2. **Screenshot Upload & OCR (Multimodal):**
   * Citizen can drop an image file (PNG, JPG, WEBP).
   * Backend uploads the buffer to Cloudinary and invokes Gemini Vision OCR.
   * Extracted text automatically populates the text field; image thumbnail preview is displayed.
3. **Atlas Duplicate Detection:**
   * Text is evaluated via semantic cosine similarity against existing claims.
   * If a near-duplicate is detected, an amber notification card warns the user with a link to the existing audit record.
4. **Live Triage Preview:**
   * As text is typed, client-side triage preview calculates active signals (`Sensational`, `Shouting`, `Unsourced`, `Estimated Risk Level`).
5. **Submission Dispatch (`POST /api/claims`):**
   * Authoritative backend validates inputs, executes deterministic risk rules, stores `riskMetrics`, creates the record as `UNVERIFIED`, and invalidates feed caches.
   * Citizen is automatically redirected to the new claim's **Detail View**.

---

## 3. Public Feed Flow (`/feed`)

1. **Initial Load:**
   * Fetches `GET /api/claims` with default parameters:
     * `category = ALL`
     * `status = ALL`
     * `sort = newest` (DP1 Default)
     * `visibility = ALL` (DP2 Default)
     * `page = 1, limit = 10`
   * Redis serves cached results if available within 30-second TTL.
2. **Interactive Filtering & Sorting:**
   * **Category Filter:** `Politics`, `Health`, `Finance`, `Other`.
   * **Status Filter:** `Unverified`, `Verified True`, `False`, `Misleading`.
   * **DP1 Sort Order:** `Newest First` $\leftrightarrow$ `Highest Risk First` $\leftrightarrow$ `Verified Outcomes First` $\leftrightarrow$ `Oldest`.
   * **DP2 Visibility Mode:** `All Claims` $\leftrightarrow$ `Verified Only`.
   * **Live Search:** Debounced keyword search filters across claim text and reviewer notes.
   * **Pagination:** Seamless Next/Previous navigation with current page and total count indicator.
3. **Card Inspection:**
   * Cards show status badge, platform, category, submission time, and expandable **Signals Info ▾** drawer.
   * Clicking "View Details →" opens the full audit record.

---

## 4. Reviewer Verification Flow (`/reviewer/*`)

1. **Reviewer Gate (`/reviewer/access`):**
   * Reviewer submits `REVIEWER_ACCESS_CODE`.
   * Server validates code and issues signed, HTTP-only cookie (`truthlens_reviewer_token`).
   * Browser redirects to `/reviewer/dashboard`.
2. **Reviewer Queue Navigation:**
   * Reviewer queue loads pending `UNVERIFIED` claims sorted by **Priority (High Risk First)**.
   * Reviewers can filter the queue by category, sort order, or search query.
3. **Active Review Panel & Collision Locking:**
   * Clicking a claim acquires a 10-minute Redis lock (`claim:lock:<id>`).
   * If a peer reviewer is already viewing the claim, a warning banner alerts the user (`🔒 In Review by Peer`).
4. **Investigation & Advisory Assistance:**
   * Reviewer inspects submitted text, attached screenshot, and automated risk breakdown.
   * Optional: Reviewer clicks **Show Suggested Queries** to fetch cached primary-record search queries.
5. **Verdict Submission (`POST /api/reviews/:claimId`):**
   * Reviewer selects verdict (`Verified True`, `False`, `Misleading`).
   * Reviewer writes an explanatory note ($\ge 5$ characters) and optional official evidence link (`evidenceUrl`).
   * Server validates, transitions status, sets `reviewedAt` and `reviewerSessionId`, releases lock, clears cache, and returns updated claim.
   * Queue updates reactively and the claim updates across the public feed.

---

## 5. Claim Detail Flow (`/claims/:id`)

1. **Data Retrieval:**
   * Fetches `GET /api/claims/:id` (cached in Redis for 60s).
   * Retrieves claim, active flags, detailed metrics, audit timeline, and related category claims.
2. **Presentation:**
   * Prominent status badge and risk flags with interactive inspector drawer.
   * Verdict card with reviewer explanation and clickable official evidence citation (`evidenceUrl ↗`).
   * Audit Trail Timeline showing chronological provenance from submission through triage to human verification.
   * Screenshot thumbnail with click-to-expand lightbox modal.
   * "Copy Audit Citation" button formatting citations for newsroom publications.
   * Related Claims grid for exploring connected viral narratives.
