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

  return (
    <div className="tl-detail-page">
      <Navbar />

      <main id="main-content" className="tl-detail-main">
        <div className="tl-detail-container">
          <div className="tl-detail-breadcrumbs">
            <Link to="/feed">← Back to Claims Feed</Link>
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
                  <RiskFlags flags={claim.flags} riskLevel={claim.riskLevel} size="md" />
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
                        <a href={claim.imageUrl} target="_blank" rel="noopener noreferrer">
                          <img src={claim.imageUrl} alt="Attached viral screenshot" className="tl-detail-screenshot-thumb" />
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="tl-meta-row">
                    <dt>Submitted At:</dt>
                    <dd>{formatDate(claim.submittedAt)}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 4: Audit & Immutability */}
              <footer className="tl-detail-audit-footer">
                <p className="tl-immutability-note">
                  <strong>Editorial Standard (DP3):</strong> Core claim text and initial metadata are permanently immutable post-submission. Corrections must be entered as distinct new submissions to preserve audit integrity.
                </p>
              </footer>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
