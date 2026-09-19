import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import RiskFlags from '../RiskFlags/RiskFlags';
import './ClaimCard.css';

function ClaimCard({ claim }) {
  if (!claim) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      const diffMs = Date.now() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat?.toUpperCase()) {
      case 'WHATSAPP': return '💬';
      case 'X': return '𝕏';
      case 'INSTAGRAM': return '📷';
      default: return '🌐';
    }
  };

  const formattedPlatform = claim.platform
    ? claim.platform.charAt(0) + claim.platform.slice(1).toLowerCase()
    : 'Unknown';

  const formattedCategory = claim.category
    ? claim.category.charAt(0) + claim.category.slice(1).toLowerCase()
    : 'General';

  return (
    <article className="tl-claim-card" aria-labelledby={`claim-${claim.id}`}>
      <div className="tl-card-inner">
        <div className="tl-card-main-col">
          {/* Top Row: Status Badge & Risk Indicator */}
          <div className="tl-card-top-row">
            <StatusBadge status={claim.status} size="sm" />
            <RiskFlags
              flags={claim.flags}
              riskLevel={claim.riskLevel}
              metrics={claim.riskMetrics}
              interactive={true}
            />
          </div>

          {/* Claim Headline */}
          <h3 id={`claim-${claim.id}`} className="tl-card-title-text">
            <Link to={`/claims/${claim.id}`} className="tl-card-title-link">
              {claim.text}
            </Link>
          </h3>

          {claim.reviewerNote && (
            <div className="tl-card-note-box">
              <span className="tl-card-note-label">Review Summary:</span> {claim.reviewerNote}
            </div>
          )}

          {/* Metadata Row */}
          <div className="tl-card-meta-row">
            <span className="tl-card-platform-tag">
              <span className="tl-plat-emoji">{getPlatformIcon(claim.platform)}</span>
              {formattedPlatform}
            </span>
            <span className="tl-meta-dot">•</span>
            <span className="tl-card-category-tag">{formattedCategory}</span>
            <span className="tl-meta-dot">•</span>
            <time className="tl-card-time" dateTime={claim.submittedAt}>
              {formatDate(claim.submittedAt)}
            </time>
          </div>

          {/* Footer Metrics */}
          <div className="tl-card-engagement-footer">
            <div className="tl-card-metrics">
              <span className="tl-metric-item" title="Automated triage flags">
                🚩 {claim.flags?.length || 0} {claim.flags?.length === 1 ? 'signal' : 'signals'}
              </span>
              {claim.evidenceUrl ? (
                <span className="tl-metric-item tl-metric-has-evidence" title="Primary evidence source attached">
                  📎 Verified Citation
                </span>
              ) : (
                <span className="tl-metric-item" title="Community reported viral claim">
                  💬 Community triage
                </span>
              )}
            </div>
            <Link to={`/claims/${claim.id}`} className="tl-card-read-more">
              View Details →
            </Link>
          </div>
        </div>

        {/* Right Thumbnail Preview (Image 2 - Screen 2) */}
        {claim.imageUrl ? (
          <div className="tl-card-thumb-col">
            <div className="tl-card-image-wrap">
              <img
                src={claim.imageUrl}
                alt="Claim evidence preview"
                className="tl-card-thumb-img"
                loading="lazy"
                decoding="async"
              />
              {claim.status === 'FALSE' && (
                <div className="tl-thumb-stamp tl-stamp-false-mini">FALSE</div>
              )}
              {claim.status === 'VERIFIED_TRUE' && (
                <div className="tl-thumb-stamp tl-stamp-true-mini">VERIFIED</div>
              )}
            </div>
          </div>
        ) : (
          <div className="tl-card-thumb-col tl-thumb-fallback">
            <div className="tl-card-abstract-thumb">
              <span className="tl-abstract-icon">{getPlatformIcon(claim.platform)}</span>
              <span className="tl-abstract-tag">{formattedCategory}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(ClaimCard);
