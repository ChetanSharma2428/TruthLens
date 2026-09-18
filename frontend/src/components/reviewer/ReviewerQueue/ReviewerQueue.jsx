import React from 'react';
import RiskFlags from '../../claims/RiskFlags/RiskFlags';
import StatusBadge from '../../claims/StatusBadge/StatusBadge';
import Button from '../../common/Button/Button';
import EmptyState from '../../common/EmptyState/EmptyState';
import './ReviewerQueue.css';

export default function ReviewerQueue({
  claims = [],
  onSelectClaim,
  selectedClaimId = null
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  if (!claims || claims.length === 0) {
    return (
      <EmptyState
        title="Review queue is clear"
        message="All matching submissions have received human fact-checking verdicts. Great job! Check back as new public claims are submitted."
        actionLabel="View Public Feed"
        actionTo="/feed"
      />
    );
  }

  return (
    <div className="tl-reviewer-queue" aria-label="Review Queue">
      <div className="tl-queue-list">
        {claims.map((claim) => {
          const isSelected = selectedClaimId === claim.id;
          const isLockedByOther = claim.activeLock?.isLockedByOther;
          const isLockedByMe = claim.activeLock?.isLockedByMe;

          return (
            <div
              key={claim.id}
              className={`tl-queue-item ${isSelected ? 'tl-queue-item-selected' : ''} ${isLockedByOther ? 'tl-queue-item-locked' : ''}`}
            >
              <div className="tl-queue-item-top">
                <RiskFlags
                  flags={claim.flags}
                  riskLevel={claim.riskLevel}
                  metrics={claim.riskMetrics}
                  interactive={true}
                />
                <div className="tl-queue-status-wrap">
                  {isLockedByOther && (
                    <span className="tl-lock-pill" title="Another fact-checker is reviewing this claim">
                      🔒 In Review by Peer
                    </span>
                  )}
                  {isLockedByMe && (
                    <span className="tl-lock-pill-me" title="You hold the lock on this claim">
                      🔒 Assigned to You
                    </span>
                  )}
                  <StatusBadge status={claim.status} size="sm" />
                </div>
              </div>

              <p className="tl-queue-item-text">{claim.text}</p>

              <div className="tl-queue-item-footer">
                <div className="tl-queue-item-meta">
                  <span className="tl-queue-category">{claim.category}</span>
                  <span>·</span>
                  <span>{claim.platform}</span>
                  {claim.imageUrl && (
                    <>
                      <span>·</span>
                      <span className="tl-queue-screenshot-badge">📷 Screenshot</span>
                    </>
                  )}
                  <span>·</span>
                  <time dateTime={claim.submittedAt}>{formatDate(claim.submittedAt)}</time>
                </div>

                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onSelectClaim(claim)}
                >
                  {isSelected ? 'Reviewing Claim' : 'Review Claim →'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
