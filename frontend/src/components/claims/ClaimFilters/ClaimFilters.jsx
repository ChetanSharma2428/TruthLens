import React from 'react';
import './ClaimFilters.css';

export default function ClaimFilters({
  selectedCategory = 'ALL',
  selectedStatus = 'ALL',
  selectedSort = 'newest',
  onCategoryChange,
  onStatusChange,
  onSortChange,
  totalCount = 0
}) {
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
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest_risk', label: 'Highest Risk' }
  ];

  return (
    <div className="tl-filters-panel" role="search" aria-label="Claims filters and sorting">
      <div className="tl-filters-header">
        <span className="tl-filters-count">
          Showing <strong>{totalCount}</strong> {totalCount === 1 ? 'claim' : 'claims'}
        </span>
      </div>

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
            Sort Order
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
      </div>
    </div>
  );
}
