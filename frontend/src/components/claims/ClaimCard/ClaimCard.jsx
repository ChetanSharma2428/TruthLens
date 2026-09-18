import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import RiskFlags from '../RiskFlags/RiskFlags';
import './ClaimCard.css';

export default function ClaimCard({ claim }) {
  if (!claim) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return dateString;
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
      <div className="tl-card-header">
        <RiskFlags flags={claim.flags} riskLevel={claim.riskLevel} />
        <StatusBadge status={claim.status} size="sm" />
      </div>

      <p id={`claim-${claim.id}`} className="tl-card-text">
        {claim.text}
      </p>

      {claim.reviewerNote && (
        <div className="tl-card-note-preview">
          <span className="tl-note-kicker">Review Note:</span> {claim.reviewerNote}
        </div>
      )}

      <div className="tl-card-footer">
        <div className="tl-card-meta">
          <span className="tl-meta-tag">{formattedCategory}</span>
          <span className="tl-meta-sep">·</span>
          <span className="tl-meta-tag">{formattedPlatform}</span>
          <span className="tl-meta-sep">·</span>
          <time className="tl-meta-time" dateTime={claim.submittedAt}>
            {formatDate(claim.submittedAt)}
          </time>
        </div>

        <Link to={`/claims/${claim.id}`} className="tl-card-action">
          View Details <span className="tl-action-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
