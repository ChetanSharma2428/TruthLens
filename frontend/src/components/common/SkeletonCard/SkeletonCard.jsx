import React from 'react';
import './SkeletonCard.css';

export default function SkeletonCard({ count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((key) => (
        <div key={key} className="tl-skeleton-card tl-shimmer" aria-hidden="true">
          <div className="tl-skeleton-top-row">
            <div className="tl-skeleton-badge" />
            <div className="tl-skeleton-badge-sm" />
          </div>

          <div className="tl-skeleton-title" />
          <div className="tl-skeleton-title-sub" />

          <div className="tl-skeleton-meta-row">
            <div className="tl-skeleton-pill" />
            <div className="tl-skeleton-pill" />
            <div className="tl-skeleton-pill" />
          </div>

          <div className="tl-skeleton-footer">
            <div className="tl-skeleton-pill" />
            <div className="tl-skeleton-btn" />
          </div>
        </div>
      ))}
    </>
  );
}
