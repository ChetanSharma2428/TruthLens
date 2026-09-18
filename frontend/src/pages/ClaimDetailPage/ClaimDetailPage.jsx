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
              {/* Top Banner: Prominent Verdict Badge (Image 2 - Screen 4) */}
              <div className="tl-detail-verdict-banner-wrap">
                {claim.status === 'FALSE' && (
                  <div className="tl-banner-verdict tl-banner-false">
                    <span className="tl-verdict-icon">✕</span> FALSE
                  </div>
                )}
                {claim.status === 'VERIFIED_TRUE' && (
                  <div className="tl-banner-verdict tl-banner-true">
                    <span className="tl-verdict-icon">✓</span> VERIFIED TRUE
                  </div>
                )}
                {claim.status === 'MISLEADING' && (
                  <div className="tl-banner-verdict tl-banner-misleading">
                    <span className="tl-verdict-icon">⚠️</span> MISLEADING
                  </div>
                )}
                {claim.status === 'UNVERIFIED' && (
                  <div className="tl-banner-verdict tl-banner-unverified">
                    UNVERIFIED
                  </div>
                )}
              </div>

              {/* Main Headline */}
              <header className="tl-detail-header-v2">
                <h1 className="tl-detail-claim-title">"{claim.text}"</h1>
                <div className="tl-detail-meta-pill-row">
                  <span className="tl-meta-pill tl-meta-plat">
                    <strong>Platform:</strong> {claim.platform}
                  </span>
                  <span className="tl-meta-pill tl-meta-cat">
                    <strong>Category:</strong> {claim.category}
                  </span>
                  <span className="tl-meta-pill tl-meta-date">
                    <strong>Submitted:</strong> {formatDate(claim.submittedAt)}
                  </span>
                </div>
              </header>

              {/* Two Column Layout (Image 2 - Screen 4) */}
              <div className="tl-detail-split-layout">
                {/* Left Column: Fact-Check Summary & Analysis */}
                <div className="tl-detail-main-col">
                  {/* Fact-Check Summary Card */}
                  <div className={`tl-factcheck-summary-card tl-summary-${claim.status.toLowerCase()}`}>
                    <div className="tl-summary-header">
                      <div className="tl-summary-title-wrap">
                        <span className="tl-summary-shield-icon">🛡️</span>
                        <h3 className="tl-summary-title">Fact-Check Summary</h3>
                      </div>
                      <span className="tl-summary-reviewed-date">
                        Reviewed: {formatDate(claim.reviewedAt)}
                      </span>
                    </div>

                    <p className="tl-summary-body-text">
                      {claim.status === 'UNVERIFIED' ? (
                        "This claim is currently undergoing editorial review. Factual verdicts are determined strictly through primary-source evidence analysis, not automated heuristics."
                      ) : (
                        claim.reviewerNote
                      )}
                    </p>

                    <div className="tl-summary-footer-meta">
                      <span>Verified by: <strong>TruthLens Editorial Newsroom</strong></span>
                      {claim.evidenceUrl && (
                        <span>
                          Source: <a href={claim.evidenceUrl} target="_blank" rel="noopener noreferrer" className="tl-evidence-link">{claim.evidenceUrl} ↗</a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reviewer Note Detailed Section */}
                  {claim.reviewerNote && (
                    <section className="tl-detail-content-card">
                      <h3 className="tl-card-inner-title">Reviewer Analysis & Context</h3>
                      <p className="tl-card-inner-desc">{claim.reviewerNote}</p>
                    </section>
                  )}

                  {/* Automated Risk Analysis Card */}
                  <section className="tl-detail-content-card">
                    <div className="tl-card-inner-header">
                      <h3 className="tl-card-inner-title">Automated Risk Analysis</h3>
                      <RiskFlags
                        flags={claim.flags}
                        riskLevel={claim.riskLevel}
                        metrics={claim.riskMetrics}
                        size="md"
                        interactive={true}
                      />
                    </div>
                    <p className="tl-card-inner-sub">
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
                </div>

                {/* Right Column: Screenshot & Evidence Sources (Image 2 - Screen 4) */}
                <aside className="tl-detail-side-col">
                  {/* Screenshot Card with FALSE stamp */}
                  {claim.imageUrl && (
                    <div className="tl-detail-side-card">
                      <h4 className="tl-side-card-title">Circulating Evidence Screenshot</h4>
                      <div
                        className="tl-detail-screenshot-frame"
                        onClick={() => setShowScreenshotModal(true)}
                        role="button"
                        tabIndex={0}
                      >
                        <img src={claim.imageUrl} alt="Circulating viral screenshot" className="tl-detail-main-img" />
                        {claim.status === 'FALSE' && (
                          <div className="tl-detail-stamp tl-stamp-false">FALSE</div>
                        )}
                        {claim.status === 'VERIFIED_TRUE' && (
                          <div className="tl-detail-stamp tl-stamp-true">VERIFIED</div>
                        )}
                      </div>
                      <span className="tl-screenshot-hint">Click image to inspect full size</span>
                    </div>
                  )}

                  {/* Risk Signals Detected Box */}
                  <div className="tl-detail-side-card">
                    <div className="tl-side-card-header">
                      <h4 className="tl-side-card-title">Risk Signals Detected</h4>
                      <span className={`tl-risk-side-pill ${claim.riskLevel === 'HIGH' ? 'high' : 'normal'}`}>
                        {claim.riskLevel} RISK
                      </span>
                    </div>
                    <div className="tl-side-signals-list">
                      <div className={`tl-side-sig-item ${claim.flags.includes('SENSATIONAL') ? 'active' : ''}`}>
                        <span className="tl-sig-bullet">●</span> Sensational Language
                      </div>
                      <div className={`tl-side-sig-item ${claim.flags.includes('SHOUTING') ? 'active' : ''}`}>
                        <span className="tl-sig-bullet">●</span> Shouting / Excessive Caps
                      </div>
                      <div className={`tl-side-sig-item ${claim.flags.includes('UNSOURCED') ? 'active' : ''}`}>
                        <span className="tl-sig-bullet">●</span> Unsourced Claim
                      </div>
                    </div>
                  </div>

                  {/* Evidence Sources Card */}
                  <div className="tl-detail-side-card">
                    <h4 className="tl-side-card-title">Evidence Sources</h4>
                    {claim.evidenceUrl ? (
                      <a
                        href={claim.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tl-side-evidence-link"
                      >
                        🔗 Official Reference Citation ↗
                      </a>
                    ) : (
                      <p className="tl-side-empty-evidence">Primary evidence link pending reviewer attachment.</p>
                    )}
                  </div>
                </aside>
              </div>

              {/* Section 4: Audit Trail Timeline */}
              <section className="tl-detail-section">
                <h2 className="tl-section-title">Audit Trail & Verification Record</h2>
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
                  <strong>Editorial Standard:</strong> Core claim text and initial metadata are permanently immutable post-submission. Corrections must be entered as distinct new submissions to preserve audit integrity.
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
