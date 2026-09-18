import React, { useState } from 'react';
import './ClaimFilters.css';

export default function ClaimFilters({
  selectedCategory = 'ALL',
  selectedStatus = 'ALL',
  selectedSort = 'newest',
  selectedVisibility = 'ALL',
  searchQuery = '',
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onVisibilityChange,
  onSearchChange,
  totalCount = 0
}) {
  const [showDpExplainer, setShowDpExplainer] = useState(false);

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'POLITICS', label: 'Politics' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'UNVERIFIED', label: 'Unverified' },
    { value: 'VERIFIED_TRUE', label: 'Verified True' },
    { value: 'FALSE', label: 'False' },
    { value: 'MISLEADING', label: 'Misleading' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First (Default DP1)' },
    { value: 'highest_risk', label: 'Highest Risk First (DP1)' },
    { value: 'status', label: 'Verified Outcomes First (DP1)' },
    { value: 'oldest', label: 'Oldest Submissions' }
  ];

  const visibilityOptions = [
    { value: 'ALL', label: 'All Claims (Transparent Triage - DP2)' },
    { value: 'VERIFIED_ONLY', label: 'Verified Only (Confirmed Facts - DP2)' }
  ];

  return (
    <div className="tl-filters-panel" role="search" aria-label="Claims filters and sorting">
      {/* Top row: Counter, Search & DP Info Toggle */}
      <div className="tl-filters-top-row">
        <div className="tl-filters-count-wrap">
          <span className="tl-filters-count">
            Showing <strong>{totalCount}</strong> {totalCount === 1 ? 'claim' : 'claims'}
          </span>
          <button
            type="button"
            className={`tl-dp-info-btn ${showDpExplainer ? 'active' : ''}`}
            onClick={() => setShowDpExplainer(!showDpExplainer)}
            aria-expanded={showDpExplainer}
          >
            {showDpExplainer ? 'Hide Architecture Notes ▴' : 'Decision Points (DP1 & DP2) Info ▾'}
          </button>
        </div>

        {/* Search Input */}
        <div className="tl-search-wrap">
          <input
            type="search"
            className="tl-feed-search-input"
            placeholder="Search claims by keywords or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search claims feed by keyword"
          />
        </div>
      </div>

      {/* DP Architecture Explainer */}
      {showDpExplainer && (
        <div className="tl-dp-explainer-banner" role="region" aria-label="Decision Points Rationale">
          <div className="tl-dp-item">
            <span className="tl-dp-badge">DP1 · FEED ORDER</span>
            <h4>Why default to Newest First, with Risk and Status options?</h4>
            <p>
              In fast-moving viral disinformation environments, chronological recency presents unvarnished platform reality without algorithmic manipulation. Readers and newsrooms can toggle to <em>Highest Risk First</em> to triage viral urgency, or <em>Verified Outcomes First</em> to consult established facts.
            </p>
          </div>
          <div className="tl-dp-item">
            <span className="tl-dp-badge">DP2 · VISIBILITY</span>
            <h4>Why are unverified claims visible by default?</h4>
            <p>
              Holding back unverified submissions creates an informational vacuum where viral rumors fester unchecked. Displaying claims immediately with high-visibility amber badges signals that the community is aware and human verification is actively in progress.
            </p>
          </div>
        </div>
      )}

      {/* Bottom controls row */}
      <div className="tl-filters-controls">
        {/* Category Filter */}
        <div className="tl-filter-group">
          <label htmlFor="filter-category" className="tl-filter-label">
            Category
          </label>
          <select
            id="filter-category"
            className="tl-filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="tl-filter-group">
          <label htmlFor="filter-status" className="tl-filter-label">
            Status
          </label>
          <select
            id="filter-status"
            className="tl-filter-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* DP1 Separate Sort Control */}
        <div className="tl-filter-group tl-sort-group">
          <label htmlFor="sort-order" className="tl-filter-label">
            DP1 Sort
          </label>
          <select
            id="sort-order"
            className="tl-filter-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* DP2 Visibility Control */}
        <div className="tl-filter-group">
          <label htmlFor="filter-visibility" className="tl-filter-label">
            DP2 Visibility
          </label>
          <select
            id="filter-visibility"
            className="tl-filter-select"
            value={selectedVisibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
          >
            {visibilityOptions.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
