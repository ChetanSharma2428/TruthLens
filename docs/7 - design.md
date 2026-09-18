# TruthLens — UI/UX Design System & Editorial Guidelines

## 1. Design Philosophy

TruthLens is designed as a **trustworthy, high-density editorial information-review instrument** rather than a consumer social app or generic AI SaaS template:

* **Restrained & Credible:** High-contrast typography, ample whitespace, and distinct editorial hierarchy inspired by Reuters, Financial Times, and ProPublica.
* **Separation of Risk and Veracity:** Automated risk indicators use alert amber/crimson borders with neutral backgrounds; verified factual verdicts use solid emerald, crimson, and amber badges.
* **Zero "Vibecoding" Slop:** No gratuitous neon glow, no floating glassmorphism cards, no fake live counters, and no generic decorative illustrations. Every UI element conveys audit information.

---

## 2. Component-Level CSS Architecture Rule

Every single React component strictly adheres to the component directory isolation standard:
```text
Component/
├── Component.jsx  # Presentation, hooks, accessibility attributes
└── Component.css  # Scoped component styles using global design variables
```

**Zero Monolithic CSS:** Global CSS is restricted exclusively to `index.css` (font imports, CSS reset, layout bounds) and `variables.css` (semantic tokens).

---

## 3. Semantic Color Tokens (`variables.css`)

```css
:root {
  /* Brand & Page Backgrounds */
  --bg-page: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;

  /* Editorial Text Tokens */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;

  /* Borders */
  --border-default: #e2e8f0;
  --border-subtle: #cbd5e1;
  --border-strong: #94a3b8;
  --border-dark: #0f172a;

  /* Civic Brand Accents */
  --color-brand: #0f172a;
  --color-accent: #2563eb;

  /* Authoritative Verdict Semantics */
  --status-true-bg: #ecfdf5;
  --status-true-border: #10b981;
  --status-true-text: #065f46;

  --status-false-bg: #fef2f2;
  --status-false-border: #ef4444;
  --status-false-text: #991b1b;

  --status-misleading-bg: #fffbeb;
  --status-misleading-border: #f59e0b;
  --status-misleading-text: #92400e;

  --status-unverified-bg: #f1f5f9;
  --status-unverified-border: #94a3b8;
  --status-unverified-text: #334155;

  /* Risk Triage Level Badges */
  --risk-high-bg: #fef2f2;
  --risk-high-border: #dc2626;
  --risk-high-text: #b91c1c;

  --risk-normal-bg: #f8fafc;
  --risk-normal-border: #94a3b8;
  --risk-normal-text: #475569;
}
```

---

## 4. Typography Scale

* **Headings:** Modern Editorial Serif (`Georgia`, `Newsreader`, `Charter`, serif) for authoritative journalistic gravity (`.tl-dashboard-title`, `.tl-panel-title`, `.tl-feed-title`).
* **Interface & Body Text:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif` for high-density readability.
* **Audit Metadata & Timestamps:** Monospace (`SFMono-Regular`, `Consolas`, `monospace`) for audit record IDs, status timestamps, and risk indicators (`.tl-record-id`, `.tl-meta-time`, `.tl-step-number`).

---

## 5. Key Interface Patterns

1. **Deterministic Risk Flags Inspector:**
   * Expandable drawer (`.tl-risk-inspector-panel`) displaying the exact uppercase ratio meter, detected keyword triggers, and civic neutrality disclaimers.
2. **Reviewer Collision Indicator:**
   * Amber pill badge (`🔒 In Review by Peer`) alerting fact-checkers if a colleague holds an active 10-minute lock on a claim.
3. **Audit Trail Timeline (DP3):**
   * Ordered chronological steps connecting submission timestamp, deterministic heuristic triage, and the human verification decision.
4. **Screenshot Lightbox Modal:**
   * Centered high-contrast modal preview for full-resolution inspection of uploaded viral screenshot evidence.
