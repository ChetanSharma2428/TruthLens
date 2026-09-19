import React, { useState } from 'react';
import './ClaimFilters.css';

export default function ClaimFilters({
  selectedCategory = 'ALL',
  selectedStatus = 'ALL',
  selectedPlatform = 'ALL',
  selectedSort = 'newest',
  selectedVisibility = 'ALL',
  searchQuery = '',
  onCategoryChange,
  onStatusChange,
  onPlatformChange,
  onSortChange,
  onVisibilityChange,
  onSearchChange,
  totalCount = 0
}) {
  const statusPills = [
    { value: 'ALL', label: 'All' },
    { value: 'UNVERIFIED', label: 'Unverified' },
    { value: 'VERIFIED_TRUE', label: 'Verified True' },
    { value: 'FALSE', label: 'False' },
    { value: 'MISLEADING', label: 'Misleading' }
  ];

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'POLITICS', label: 'Politics' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'OTHER', label: 'Other' }
  ];

  const platforms = [
    { value: 'ALL', label: 'All Platforms' },
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'X', label: 'X (Twitter)' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'OTHER', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'highest_risk', label: 'Highest Risk First' },
    { value: 'status', label: 'Verified Outcomes First' },
    { value: 'oldest', label: 'Oldest Submissions' }
  ];

  const visibilityOptions = [
    { value: 'ALL', label: 'All Claims' },
    { value: 'VERIFIED_ONLY', label: 'Verified Only' }
  ];

  return (
    <div className="tl-filters-panel" role="search" aria-label="Claims filters and sorting">
      {/* Row 1: Interactive Status Pills (Image 2 - Screen 2) */}
      <div className="tl-status-pills-row">
        <div className="tl-status-pills-wrap">
          {statusPills.map((pill) => {
            const isActive = selectedStatus === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                className={`tl-status-pill-btn ${isActive ? 'active' : ''} tl-pill-${pill.value.toLowerCase()}`}
                onClick={() => onStatusChange(pill.value)}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="tl-feed-search-box">
          <span className="tl-search-glass-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="tl-feed-search-input"
            placeholder="Search claims, keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search claims feed"
          />
        </div>
      </div>

      {/* Row 2: Secondary Dropdowns Bar */}
      <div className="tl-filters-dropdowns-row">
        <div className="tl-dropdowns-left">
          {/* Category Dropdown */}
          <div className="tl-filter-select-wrap">
            <select
              id="filter-category"
              className="tl-filter-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Dropdown */}
          <div className="tl-filter-select-wrap">
            <select
              id="filter-platform"
              className="tl-filter-select"
              value={selectedPlatform || 'ALL'}
              onChange={(e) => onPlatformChange ? onPlatformChange(e.target.value) : null}
              aria-label="Filter by platform"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* DP1 Sort Dropdown */}
          <div className="tl-filter-select-wrap">
            <select
              id="filter-sort"
              className="tl-filter-select"
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort order"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* DP2 Visibility Dropdown */}
          <div className="tl-filter-select-wrap">
            <select
              id="filter-visibility"
              className="tl-filter-select"
              value={selectedVisibility}
              onChange={(e) => onVisibilityChange(e.target.value)}
              aria-label="Visibility mode"
            >
              {visibilityOptions.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="tl-filters-meta-right">
          <span className="tl-claims-count-badge">
            <strong>{totalCount}</strong> {totalCount === 1 ? 'claim' : 'claims'}
          </span>
        </div>
      </div>
    </div>
  );
}
