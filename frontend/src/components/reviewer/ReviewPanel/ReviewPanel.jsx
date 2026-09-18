import React, { useState, useEffect } from 'react';
import Button from '../../common/Button/Button';
import RiskFlags from '../../claims/RiskFlags/RiskFlags';
import {
  submitClaimReview,
  fetchResearchAssistance,
  lockClaim,
  unlockClaim
} from '../../../services/reviewerService';
import './ReviewPanel.css';

export default function ReviewPanel({ claim, onReviewSuccess, onClose }) {
  const [verdict, setVerdict] = useState('');
  const [note, setNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lockStatus, setLockStatus] = useState(null);
  const [researchQueries, setResearchQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [showResearch, setShowResearch] = useState(false);

  // Acquire collaborative review lock on mount to prevent newsroom collision
  useEffect(() => {
    let isMounted = true;
    if (claim?.id) {
      lockClaim(claim.id)
        .then((status) => {
          if (isMounted) setLockStatus(status);
        })
        .catch(() => {
          // Graceful fallback
        });
    }

    return () => {
      isMounted = false;
      if (claim?.id) {
        unlockClaim(claim.id).catch(() => {});
      }
    };
  }, [claim?.id]);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!verdict) {
      setError('Please select a verification verdict (Verified True, False, or Misleading).');
      return;
    }

    const trimmedNote = note.trim();
    if (!trimmedNote || trimmedNote.length < 5) {
      setError('Please provide an explanatory reviewer note (minimum 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await submitClaimReview(claim.id, {
        verdict,
        note: trimmedNote,
        evidenceUrl: evidenceUrl.trim() || null
      });
      onReviewSuccess(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit review verdict. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const verdictOptions = [
    {
      value: 'VERIFIED_TRUE',
      label: 'Verified True',
      desc: 'Claim is substantiated by credible official sources and primary evidence.',
      styleClass: 'tl-choice-true'
    },
    {
      value: 'FALSE',
      label: 'False',
      desc: 'Claim is demonstrably fabricated, contradicted by official records.',
      styleClass: 'tl-choice-false'
    },
    {
      value: 'MISLEADING',
      label: 'Misleading',
      desc: 'Claim contains genuine elements stripped of essential context or exaggerated.',
      styleClass: 'tl-choice-misleading'
    }
  ];

  return (
    <aside className="tl-review-panel" aria-label="Claim Review Panel">
      <div className="tl-panel-header">
        <div className="tl-panel-title-wrap">
          <span className="tl-panel-kicker">FACT-CHECKING INTERFACE</span>
          <h2 className="tl-panel-title">Review Claim #{claim.id.slice(-6).toUpperCase()}</h2>
        </div>
        <button
          type="button"
          className="tl-panel-close-btn"
          onClick={onClose}
          aria-label="Close review panel"
        >
          ✕
        </button>
      </div>

      {lockStatus?.lockedByOther && (
        <div className="tl-lock-warning-banner" role="alert">
          <span>⚠️ Another reviewer is actively triaging this claim. Submitting will update the authoritative record.</span>
        </div>
      )}

      <div className="tl-panel-body">
        {/* SECTION 1: Exact Claim Content */}
        <div className="tl-panel-section">
          <h3 className="tl-section-heading">1. Submitted Claim Content</h3>
          <blockquote className="tl-panel-claim-quote">
            "{claim.text}"
          </blockquote>

          {claim.imageUrl && (
            <div className="tl-panel-screenshot-preview">
              <span className="tl-preview-label">Attached Viral Screenshot:</span>
              <a href={claim.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={claim.imageUrl}
                  alt="Attached screenshot evidence"
                  className="tl-panel-thumb"
                />
              </a>
            </div>
          )}

          <div className="tl-panel-claim-details">
            <div>
              <strong>Platform:</strong> {claim.platform}
            </div>
            <div>
              <strong>Category:</strong> {claim.category}
            </div>
            <div className="tl-panel-source-line">
              <strong>Source URL:</strong>{' '}
              {claim.sourceUrl ? (
                <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {claim.sourceUrl} ↗
                </a>
              ) : (
                <span className="tl-text-muted">None provided (Unsourced)</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Automated Risk Analysis */}
        <div className="tl-panel-section">
          <h3 className="tl-section-heading">2. Automated Triage Signals</h3>
          <div className="tl-panel-risk-summary">
            <RiskFlags
              flags={claim.flags}
              riskLevel={claim.riskLevel}
              metrics={claim.riskMetrics}
              interactive={true}
            />
          </div>
          <p className="tl-risk-reminder">
            Automated signals measure viral urgency patterns. Factual truth is determined by your investigation below.
          </p>
        </div>

        {/* OPTIONAL ASSISTANCE: Fact-Checking Research Queries */}
        <div className="tl-panel-section tl-research-assistance-section">
          <div className="tl-assistance-header">
            <div className="tl-assistance-title-row">
              <h3 className="tl-section-heading">✦ Advisory Research Queries</h3>
              <span className="tl-assistance-tag">Optional AI / Heuristic</span>
            </div>
            <button
              type="button"
              className="tl-toggle-research-btn"
              onClick={async () => {
                if (!showResearch && researchQueries.length === 0) {
                  try {
                    setLoadingQueries(true);
                    const res = await fetchResearchAssistance(claim.id);
                    setResearchQueries(res.assistance || []);
                  } catch {
                    // Non-blocking fallback
                  } finally {
                    setLoadingQueries(false);
                  }
                }
                setShowResearch(!showResearch);
              }}
            >
              {showResearch ? 'Hide Queries' : 'Show Suggested Queries'}
            </button>
          </div>

          {showResearch && (
            <div className="tl-research-queries-body">
              <p className="tl-research-explainer">
                Recommended search queries to verify official gazettes and primary records before assigning your verdict:
              </p>
              {loadingQueries ? (
                <p className="tl-text-muted">Generating query assistance...</p>
              ) : (
                <ul className="tl-research-queries-list">
                  {researchQueries.map((item, idx) => (
                    <li key={idx} className="tl-query-item">
                      <div className="tl-query-label">
                        <strong>{item.label}</strong>
                        <span className="tl-query-type">{item.targetType}</span>
                      </div>
                      <div className="tl-query-code-row">
                        <code>{item.query}</code>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(item.query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tl-query-search-link"
                        >
                          Search ↗
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Reviewer Decision */}
        <form className="tl-panel-section tl-panel-form" onSubmit={handleSubmit}>
          <h3 className="tl-section-heading">3. Human Reviewer Verdict</h3>

          {error && (
            <div className="tl-panel-error" role="alert">
              {error}
            </div>
          )}

          <div className="tl-verdict-selector" role="radiogroup" aria-label="Select Verification Verdict">
            {verdictOptions.map((opt) => (
              <label
                key={opt.value}
                className={`tl-verdict-option ${opt.styleClass} ${verdict === opt.value ? 'tl-verdict-option-active' : ''}`}
              >
                <input
                  type="radio"
                  name="verdict"
                  value={opt.value}
                  checked={verdict === opt.value}
                  onChange={(e) => setVerdict(e.target.value)}
                  className="sr-only"
                />
                <div className="tl-verdict-radio-mark" aria-hidden="true" />
                <div className="tl-verdict-option-content">
                  <div className="tl-verdict-option-label">{opt.label}</div>
                  <div className="tl-verdict-option-desc">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="tl-form-group">
            <div className="tl-label-row">
              <label htmlFor="reviewer-note" className="tl-form-label">
                Explanatory Review Note <span className="tl-required">*</span>
              </label>
              <span className="tl-char-counter">{note.length}/1000</span>
            </div>
            <textarea
              id="reviewer-note"
              className="tl-form-textarea"
              rows={4}
              placeholder="Cite official statements, government bulletins, or credible reporting that justifies this verdict..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="tl-form-group">
            <label htmlFor="reviewer-evidence-url" className="tl-form-label">
              Official Citation / Evidence Link <span className="tl-optional">(Optional)</span>
            </label>
            <input
              id="reviewer-evidence-url"
              type="url"
              className="tl-form-input"
              placeholder="https://pib.gov.in/factcheck/... or credible news report"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              disabled={submitting}
            />
            <span className="tl-field-hint">
              Provides the public and newsroom with a direct primary reference link.
            </span>
          </div>

          <div className="tl-panel-actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="tl-submit-verdict-btn"
            >
              {submitting ? 'Recording Verdict...' : 'Submit Verification Verdict'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}
