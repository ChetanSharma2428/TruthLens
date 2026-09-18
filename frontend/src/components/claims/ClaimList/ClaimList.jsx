import React from 'react';
import ClaimCard from '../ClaimCard/ClaimCard';
import SkeletonCard from '../../common/SkeletonCard/SkeletonCard';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../common/ErrorState/ErrorState';
import EmptyState from '../../common/EmptyState/EmptyState';
import Button from '../../common/Button/Button';
import './ClaimList.css';

export default function ClaimList({
  claims = [],
  loading = false,
  error = null,
  pagination = null,
  onPageChange,
  onRetry
}) {
  if (loading) {
    return (
      <div className="tl-claim-list-wrapper" aria-busy="true" aria-label="Loading claims feed">
        <div className="tl-claim-grid">
          <SkeletonCard count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Claims"
        message={error.message || 'Unable to retrieve claims from the server.'}
        onRetry={onRetry}
      />
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <EmptyState
        title="No claims match your filters"
        message="Try adjusting your category or status filters to discover more claims, or submit a new viral claim for triage."
        actionLabel="Submit a Claim"
        actionTo="/submit"
      />
    );
  }

  return (
    <div className="tl-claim-list-wrapper">
      <div className="tl-claim-grid">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <nav className="tl-pagination" aria-label="Claims pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            ← Previous
          </Button>

          <span className="tl-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next →
          </Button>
        </nav>
      )}
    </div>
  );
}
