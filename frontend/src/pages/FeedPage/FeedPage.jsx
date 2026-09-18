import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ClaimFilters from '../../components/claims/ClaimFilters/ClaimFilters';
import ClaimList from '../../components/claims/ClaimList/ClaimList';
import Button from '../../components/common/Button/Button';
import { fetchClaims } from '../../services/claimService';
import { fetchPlatformStats } from '../../services/statsService';
import './FeedPage.css';

export default function FeedPage() {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter, DP1 Sort & DP2 Visibility State
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [platform, setPlatform] = useState('ALL');
  const [sort, setSort] = useState('newest'); // DP1: Default newest first
  const [visibility, setVisibility] = useState('ALL'); // DP2: Default transparent (all claims)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [platformStats, setPlatformStats] = useState(null);

  // Fetch real database aggregated statistics
  useEffect(() => {
    let isMounted = true;
    fetchPlatformStats().then((data) => {
      if (isMounted && data) {
        setPlatformStats(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
        platform: platform !== 'ALL' ? platform : undefined,
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
  }, [category, status, platform, sort, visibility, debouncedSearch, page]);

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

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
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

  const handleTrendingClick = (tag) => {
    setSearch(tag.replace('#', ''));
    setPage(1);
  };

  // Live community statistics summary (memoized)
  const verifiedCount = useMemo(
    () => claims.filter((c) => c.status === 'VERIFIED_TRUE' || c.status === 'FALSE' || c.status === 'MISLEADING').length,
    [claims]
  );
  const underReviewCount = useMemo(
    () => claims.filter((c) => c.status === 'UNVERIFIED').length,
    [claims]
  );

  return (
    <div className="tl-feed-page">
      <Navbar />

      <main id="main-content" className="tl-feed-main">
        <div className="tl-feed-container">
          {/* Header (Image 2 - Screen 2) */}
          <header className="tl-feed-header">
            <div className="tl-feed-intro">
              <span className="tl-feed-kicker">COMMUNITY FORUM</span>
              <h1 className="tl-feed-title">Community Claims</h1>
              <p className="tl-feed-subtitle">
                Explore the latest claims submitted by the community. Get the facts, not the forwards.
              </p>
            </div>
            <div className="tl-feed-header-action">
              <Button variant="primary" size="md" to="/submit">
                + Submit a Claim
              </Button>
            </div>
          </header>

          {/* Filters Bar */}
          <ClaimFilters
            selectedCategory={category}
            selectedStatus={status}
            selectedPlatform={platform}
            selectedSort={sort}
            selectedVisibility={visibility}
            searchQuery={search}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onPlatformChange={handlePlatformChange}
            onSortChange={handleSortChange}
            onVisibilityChange={handleVisibilityChange}
            onSearchChange={setSearch}
            totalCount={pagination?.total || claims.length}
          />

          {/* Two-Column Feed Layout (Image 2 - Screen 2) */}
          <div className="tl-feed-layout-grid">
            {/* Left Column: Feed List */}
            <div className="tl-feed-list-col">
              <ClaimList
                claims={claims}
                loading={loading}
                error={error}
                pagination={pagination}
                onPageChange={setPage}
                onRetry={loadClaims}
              />
            </div>

            {/* Right Sidebar Widgets */}
            <aside className="tl-feed-sidebar-col" aria-label="Community Insights">
              {/* Widget 1: Live Stats */}
              <div className="tl-sidebar-widget-card">
                <div className="tl-widget-header">
                  <span className="tl-widget-icon">📊</span>
                  <h3 className="tl-widget-title">Live Stats</h3>
                </div>
                <div className="tl-widget-stats-list">
                  <div className="tl-widget-stat-row">
                    <span className="tl-stat-bullet tl-bullet-blue" />
                    <span className="tl-stat-name">Claims Today</span>
                    <strong className="tl-stat-val">
                      {platformStats?.claimsToday ?? (pagination?.total || claims.length || 0)}
                    </strong>
                  </div>
                  <div className="tl-widget-stat-row">
                    <span className="tl-stat-bullet tl-bullet-green" />
                    <span className="tl-stat-name">Verified Outcomes</span>
                    <strong className="tl-stat-val">
                      {platformStats?.verifiedOutcomes ?? verifiedCount}
                    </strong>
                  </div>
                  <div className="tl-widget-stat-row">
                    <span className="tl-stat-bullet tl-bullet-amber" />
                    <span className="tl-stat-name">Under Review</span>
                    <strong className="tl-stat-val">
                      {platformStats?.underReview ?? underReviewCount}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Widget 2: Trending Topics (Dynamic Aggregation from Claims) */}
              {platformStats?.trendingTopics && platformStats.trendingTopics.length > 0 && (
                <div className="tl-sidebar-widget-card">
                  <div className="tl-widget-header">
                    <span className="tl-widget-icon">🔥</span>
                    <h3 className="tl-widget-title">Trending Topics</h3>
                  </div>
                  <div className="tl-trending-tags-list">
                    {platformStats.trendingTopics.map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        className="tl-trending-tag-item"
                        onClick={() => handleTrendingClick(item.tag)}
                        title={`Filter by ${item.tag}`}
                      >
                        <span className="tl-tag-name">{item.tag}</span>
                        <span className="tl-tag-count">{item.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
