import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import StatusBadge from '../../components/claims/StatusBadge/StatusBadge';
import RiskFlags from '../../components/claims/RiskFlags/RiskFlags';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import Button from '../../components/common/Button/Button';
import { fetchClaimById } from '../../services/claimService';
import './ClaimDetailPage.css';

export default function ClaimDetailPage() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  useEffect(() => {
    async function loadClaim() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClaimById(id);
        setClaim(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadClaim();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet reviewed';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getFlagExplanation = (flag) => {
    switch (flag) {
      case 'SENSATIONAL':
        return 'Triggered by viral urgency phrasing (e.g. "breaking", "shocking", or "share before deleted").';
      case 'SHOUTING':
        return 'Triggered because over 50% of the alphabetic characters were capitalized.';
      case 'UNSOURCED':
        return 'Triggered because no external source link was supplied with the submission.';
      default:
        return 'Detected risk signal.';
    }
  };

  const handleCopyCitation = () => {
    if (!claim) return;
    const citationText = `TruthLens Audit Record #${claim.id.slice(-6).toUpperCase()}\nClaim: "${claim.text}"\nStatus: ${claim.status.replace('_', ' ')}\nPlatform: ${claim.platform} | Category: ${claim.category}\nRecord Link: ${window.location.href}`;
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 3000);
  };

  return (
    <div className="tl-detail-page">
      <Navbar />

      <main id="main-content" className="tl-detail-main">
        <div className="tl-detail-container">
          <div className="tl-detail-nav-row">
            <Link to="/feed" className="tl-back-link">← Back to Claims Feed</Link>
            {claim && (
              <button
                type="button"
                className="tl-share-citation-btn"
                onClick={handleCopyCitation}
                aria-label="Copy verification audit citation"
              >
                {copiedCitation ? '✓ Citation Copied to Clipboard' : '📋 Copy Audit Citation'}
              </button>
            )}
          </div>

          {loading && <LoadingSpinner message="Loading claim audit record..." size="lg" />}

          {error && (
            <ErrorState
              title={error.status === 404 ? 'Claim Not Found' : 'Error Loading Claim'}
              message={error.message || 'The requested claim record could not be retrieved.'}
              onRetry={() => window.location.reload()}
            />
          )}

          {!loading && !error && claim && (
            <article className="tl-detail-article">
              {/* Header */}
              <header className="tl-detail-header">
                <div className="tl-detail-status-bar">
                  <div className="tl-status-left">
                    <span className="tl-record-id">AUDIT RECORD #{claim.id.slice(-6).toUpperCase()}</span>
                    <StatusBadge status={claim.status} size="md" />
                  </div>
                  <RiskFlags
                    flags={claim.flags}
                    riskLevel={claim.riskLevel}
                    metrics={claim.riskMetrics}
                    size="md"
                    interactive={true}
                  />
                </div>

                <h1 className="tl-detail-claim-text">"{claim.text}"</h1>
              </header>

              {/* Section 1: Verification Decision */}
              <section className="tl-detail-section tl-decision-section">
                <h2 className="tl-section-title">Human Verification Verdict</h2>
                {claim.status === 'UNVERIFIED' ? (
                  <div className="tl-unverified-callout">
                    <div className="tl-unverified-badge-row">
                      <StatusBadge status="UNVERIFIED" size="md" />
                      <span className="tl-unverified-tagline">Pending Newsroom Review</span>
                    </div>
                    <p className="tl-unverified-desc">
                      This claim is currently undergoing editorial verification. Factual verdicts are determined strictly through primary-source evidence analysis, not automated heuristics.
                    </p>
                    <div className="tl-unverified-action">
                      <Button variant="outline" size="sm" to="/reviewer/access">
                        Reviewer Workspace →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`tl-verdict-card tl-verdict-${claim.status.toLowerCase()}`}>
                    <div className="tl-verdict-top">
                      <StatusBadge status={claim.status} size="md" />
                      <span className="tl-verdict-time">
                        Reviewed on {formatDate(claim.reviewedAt)}
                      </span>
                    </div>
                    <div className="tl-verdict-note-body">
                      <h3 className="tl-note-title">Reviewer Explanation & Evidence Note:</h3>
                      <p className="tl-note-content">{claim.reviewerNote}</p>
                      {claim.evidenceUrl && (
                        <div className="tl-verdict-evidence-row">
                          <span className="tl-evidence-label">Official Reference Citation:</span>{' '}
                          <a
                            href={claim.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tl-verdict-evidence-link"
                          >
                            {claim.evidenceUrl} ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 2: Automated Risk Analysis */}
              <section className="tl-detail-section">
                <h2 className="tl-section-title">Automated Risk Analysis</h2>
                <p className="tl-section-sub">
                  Deterministic triage signals evaluated upon submission. High risk indicates viral amplification patterns, not necessarily factual falsehood.
                </p>

                <div className="tl-risk-cards-grid">
                  {claim.flags.length === 0 ? (
                    <div className="tl-no-flags-card">
                      <span className="tl-check-icon">✓</span>
                      <div>
                        <strong>No Automated Risk Flags Triggered</strong>
                        <p>The submission does not exhibit sensational urgency keywords, shout capitalization, or missing source attribution.</p>
                      </div>
                    </div>
                  ) : (
                    claim.flags.map((flag) => (
                      <div key={flag} className="tl-detail-flag-card">
                        <div className="tl-flag-top">
                          <span className="tl-flag-name">{flag}</span>
                          <span className="tl-flag-indicator">Active</span>
                        </div>
                        <p className="tl-flag-explanation">{getFlagExplanation(flag)}</p>
                        {flag === 'SHOUTING' && claim.riskMetrics?.uppercasePercent !== undefined && (
                          <div className="tl-flag-metric-pill">
                            Measured: <strong>{claim.riskMetrics.uppercasePercent}%</strong> uppercase (&gt;50% threshold)
                          </div>
                        )}
                        {flag === 'SENSATIONAL' && claim.riskMetrics?.detectedKeywords?.length > 0 && (
                          <div className="tl-flag-metric-pill">
                            Detected triggers: <strong>{claim.riskMetrics.detectedKeywords.join(', ')}</strong>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Section 3: Source & Submission Metadata */}
              <section className="tl-detail-section">
                <h2 className="tl-section-title">Source Attribution & Context</h2>
                <dl className="tl-meta-definition-list">
                  <div className="tl-meta-row">
                    <dt>Circulating Platform:</dt>
                    <dd>{claim.platform}</dd>
                  </div>
                  <div className="tl-meta-row">
                    <dt>Subject Category:</dt>
                    <dd>{claim.category}</dd>
                  </div>
                  <div className="tl-meta-row">
                    <dt>Provided Source Link:</dt>
                    <dd>
                      {claim.sourceUrl ? (
                        <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer" className="tl-source-url">
                          {claim.sourceUrl} ↗
                        </a>
                      ) : (
                        <span className="tl-unsourced-tag">None provided (Unsourced)</span>
                      )}
                    </dd>
                  </div>
                  {claim.imageUrl && (
                    <div className="tl-meta-row tl-meta-image-row">
                      <dt>Attached Screenshot:</dt>
                      <dd>
                        <button
                          type="button"
                          className="tl-screenshot-thumb-btn"
                          onClick={() => setShowScreenshotModal(true)}
                          title="Click to view full screenshot"
                        >
                          <img
                            src={claim.imageUrl}
                            alt="Attached viral screenshot"
                            className="tl-detail-screenshot-thumb"
                          />
                          <span className="tl-expand-badge">🔍 Click to Expand</span>
                        </button>
                      </dd>
                    </div>
                  )}
                  <div className="tl-meta-row">
                    <dt>Submitted At:</dt>
                    <dd>{formatDate(claim.submittedAt)}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 4: Audit Trail Timeline (DP3) */}
              <section className="tl-detail-section">
                <h2 className="tl-section-title">Audit Trail & Immutability Record (DP3)</h2>
                <p className="tl-section-sub">
                  Immutable chronological provenance record from initial community submission to human editorial verdict.
                </p>

                <div className="tl-audit-timeline">
                  {(claim.auditTimeline || [
                    {
                      step: 1,
                      label: 'Community Claim Submitted',
                      timestamp: claim.submittedAt,
                      description: `Circulating on ${claim.platform} under category ${claim.category}. Core text permanently immutable.`
                    },
                    {
                      step: 2,
                      label: 'Deterministic Risk Scan',
                      timestamp: claim.submittedAt,
                      description: claim.flags?.length > 0 ? `Active signals: ${claim.flags.join(', ')}` : 'Zero risk signals detected.'
                    }
                  ]).map((event, idx) => (
                    <div key={idx} className="tl-timeline-step">
                      <div className="tl-timeline-marker">
                        <span className="tl-step-number">{event.step}</span>
                        {idx < (claim.auditTimeline?.length || 2) - 1 && <div className="tl-step-line" />}
                      </div>
                      <div className="tl-step-content">
                        <div className="tl-step-header">
                          <h3 className="tl-step-label">{event.label}</h3>
                          <time className="tl-step-time">{formatDate(event.timestamp)}</time>
                        </div>
                        <p className="tl-step-desc">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 5: Related Claims in Subject Category */}
              {claim.relatedClaims && claim.relatedClaims.length > 0 && (
                <section className="tl-detail-section">
                  <h2 className="tl-section-title">Related Claims in {claim.category}</h2>
                  <div className="tl-related-claims-grid">
                    {claim.relatedClaims.map((rel) => (
                      <Link key={rel.id || rel._id} to={`/claims/${rel.id || rel._id}`} className="tl-related-claim-card">
                        <div className="tl-related-top">
                          <StatusBadge status={rel.status} size="sm" />
                          <span className="tl-related-platform">{rel.platform}</span>
                        </div>
                        <p className="tl-related-text">"{rel.text}"</p>
                        <span className="tl-related-action">View Audit Record →</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 6: Editorial Standard Footer */}
              <footer className="tl-detail-audit-footer">
                <p className="tl-immutability-note">
                  <strong>Editorial Standard (DP3):</strong> Core claim text and initial metadata are permanently immutable post-submission. Corrections must be entered as distinct new submissions to preserve audit integrity.
                </p>
              </footer>
            </article>
          )}

          {/* Screenshot Modal Lightbox */}
          {showScreenshotModal && claim?.imageUrl && (
            <div
              className="tl-modal-backdrop"
              onClick={() => setShowScreenshotModal(false)}
              role="dialog"
              aria-modal="true"
            >
              <div className="tl-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="tl-modal-header">
                  <span className="tl-modal-title">Submitted Post Screenshot Evidence</span>
                  <button
                    type="button"
                    className="tl-modal-close-btn"
                    onClick={() => setShowScreenshotModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="tl-modal-body">
                  <img src={claim.imageUrl} alt="Full screenshot view" className="tl-modal-full-img" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
