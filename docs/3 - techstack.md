# TruthLens — Technology Stack & Infrastructure

## 1. System Architecture Diagram

```text
               CLIENT LAYER
   +------------------------------------+
   |   React 18 + Vite + React Router   |
   |   Component-Level CSS Architecture |
   +-----------------+------------------+
                     | Axios (HTTP / Cookie Credentials)
                     v
               SERVER LAYER
   +------------------------------------+
   |   Node.js + Express.js API         |
   |   Security: Helmet, CORS, Sessions |
   |   Upload: Multer Memory Storage    |
   +-----+---------------+--------+-----+
         |               |        |
         v               v        v
+-----------------+ +---------+ +---------------------+
|  MongoDB Atlas  | |  Redis  | |   Cloudinary CDN    |
|  - Claims Store | | (ioredis| | - Viral Screenshot  |
|  - Indexing     | |  Cache  | |   Evidence Storage  |
|  - Vector Search| | & Locks)| +---------------------+
+-----------------+ +---------+
         |
         v
+-----------------------------+
|     Google Gemini API       |
| - Multimodal Vision OCR     |
| - Text Embeddings           |
| - Advisory Research Queries |
+-----------------------------+
```

---

## 2. Component Technologies

### Frontend Client Layer
* **React 18**: Component-based user interface with hooks (`useState`, `useEffect`, `useCallback`, `useParams`, `useNavigate`).
* **Vite 6**: Ultra-fast module bundler with instant HMR and 138ms production builds.
* **React Router v6**: Client-side routing with deep link resolution (`/`, `/submit`, `/feed`, `/claims/:id`, `/reviewer/access`, `/reviewer/dashboard`).
* **Axios**: HTTP client configured with `withCredentials: true` for automatic HTTP-only session cookie exchange.
* **Component-Level CSS**: Strict $1\text{ Component} = 1\text{ Directory} = 1\text{ Dedicated } .css\text{ File}$ architectural rule. Zero monolithic styling, zero tailwind bloat.

### Backend Application Layer
* **Node.js (ES Modules)**: Modern ES6 `import`/`export` runtime with native test runner.
* **Express.js**: REST API server configured with security middlewares.
* **Helmet**: Sets security HTTP headers (`Content-Security-Policy`, `X-Frame-Options`, `X-XSS-Protection`).
* **Cookie-Parser**: Parses and validates signed reviewer session tokens.
* **Express-Rate-Limit**: Guards public submission endpoints against automated spam.
* **Multer**: In-memory file buffer processing for screenshot OCR uploads.

### Primary Data Layer: MongoDB Atlas
* **Cluster:** Hosted MongoDB Atlas multi-tenant cluster.
* **Mongoose ODM**: Schema modeling with validation, virtuals, and custom JSON transforms (`id` normalization, `_id` and `__v` cleanup).
* **Secondary Indexes:**
  * `{ submittedAt: -1 }` (Newest first feed query)
  * `{ status: 1, submittedAt: -1 }` (Status filter + pagination)
  * `{ category: 1, status: 1, submittedAt: -1 }` (Category filter + pagination)
* **Atlas Vector Search / Semantic Similarity**: Computes cosine distance on claim text embeddings for duplicate detection.

### Cache & Lock Layer: Redis (`ioredis`)
* **Dual-Tier Strategy:** Connects to Redis server via `ioredis` with an automated, resilient in-memory `Map` fallback if Redis is unconfigured or offline.
* **Feed Cache:** Caches filtered feed queries for 30 seconds (`feed:<cat>:<status>:<sort>:<vis>:<q>:<page>:<limit>`).
* **Deterministic Risk Cache:** Caches calculated risk heuristics by SHA-256 hash for 1 hour.
* **Collaborative Newsroom Locks:** Implements 10-minute distributed locks (`claim:lock:<id>`) with expiration to prevent dual-review collisions.

### Multimodal Storage & AI Services
* **Cloudinary:** Direct memory-buffer image upload via Cloudinary SDK; delivers optimized HTTPS image URLs for attached screenshots.
* **Google Gemini API:**
  * **Gemini Vision OCR:** Extracts multilingual text from screenshots of viral social media posts.
  * **Advisory Research Queries:** Generates targeted search operators (`site:pib.gov.in`, `site:who.int`) for fact-checkers.
  * **Graceful Degradation:** The entire system functions 100% offline with heuristic fallbacks if external API keys are omitted.

---

## 3. Automated Testing & Verification Framework
* **Native Node.js Test Runner (`node:test`, `node:assert/strict`)**:
  * 45 automated tests executing against the live MongoDB Atlas cluster.
  * Test suites:
    * `riskAnalyzer.test.js`: Deterministic rules, uppercase ratios, and Redis cache.
    * `claimApi.test.js`: Public submission, validation, risk assignment, feed queries, and search.
    * `duplicateAndOcr.test.js`: Gemini OCR vision extraction and duplicate detection.
    * `reviewerAuth.test.js`: Access code verification, HTTP-only cookie issuance, and logout.
    * `reviewWorkflow.test.js`: Verdict updates, collision locks, evidence links, and immutability.
    * `e2eVerification.test.js`: Complete end-to-end civic tech lifecycle.
