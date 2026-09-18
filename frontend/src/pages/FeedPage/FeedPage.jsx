import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ClaimFilters from '../../components/claims/ClaimFilters/ClaimFilters';
import ClaimList from '../../components/claims/ClaimList/ClaimList';
import Button from '../../components/common/Button/Button';
import { fetchClaims } from '../../services/claimService';
import './FeedPage.css';

export default function FeedPage() {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter, DP1 Sort & DP2 Visibility State
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('newest'); // DP1: Default newest first
  const [visibility, setVisibility] = useState('ALL'); // DP2: Default transparent (all claims)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClaims({
        category,
        status,
        sort,
        visibility,
        search: debouncedSearch,
        page,
        limit: 10
      });
      setClaims(data.claims || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category, status, sort, visibility, debouncedSearch, page]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility);
    setPage(1);
  };

  return (
    <div className="tl-feed-page">
      <Navbar />

      <main id="main-content" className="tl-feed-main">
        <div className="tl-feed-container">
          <header className="tl-feed-header">
            <div className="tl-feed-intro">
              <span className="tl-feed-kicker">PUBLIC RECORD</span>
              <h1 className="tl-feed-title">Claims Feed</h1>
              <p className="tl-feed-subtitle">
                Track submitted viral claims, inspect deterministic risk indicators, and explore human-verified outcomes.
              </p>
            </div>
            <div className="tl-feed-header-action">
              <Button variant="primary" size="md" to="/submit">
                + Submit a Claim
              </Button>
            </div>
          </header>

          <ClaimFilters
            selectedCategory={category}
            selectedStatus={status}
            selectedSort={sort}
            selectedVisibility={visibility}
            searchQuery={search}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onVisibilityChange={handleVisibilityChange}
            onSearchChange={setSearch}
            totalCount={pagination?.total || 0}
          />

          <ClaimList
            claims={claims}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={setPage}
            onRetry={loadClaims}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
