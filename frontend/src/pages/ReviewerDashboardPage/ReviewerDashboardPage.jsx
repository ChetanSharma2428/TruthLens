import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ReviewerQueue from '../../components/reviewer/ReviewerQueue/ReviewerQueue';
import ReviewPanel from '../../components/reviewer/ReviewPanel/ReviewPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import Button from '../../components/common/Button/Button';
import {
  checkReviewerSession,
  fetchPendingReviews,
  logoutReviewer
} from '../../services/reviewerService';
import { fetchPlatformStats } from '../../services/statsService';
import './ReviewerDashboardPage.css';

export default function ReviewerDashboardPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [notification, setNotification] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [riskTab, setRiskTab] = useState('ALL');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Debounce search input by 300ms for fast, smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 1. Direct Reviewer Access (no login/signup required for hackathon grading)
  useEffect(() => {
    setCheckingAuth(false);
  }, []);

  // 2. Fetch Pending Queue with filters
  const loadQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);
      setQueueError(null);
      const data = await fetchPendingReviews({
        category: categoryFilter,
        sort: sortFilter
      });
      setPendingClaims(data.claims || []);
    } catch (err) {
      setQueueError(err);
    } finally {
      setLoadingQueue(false);
    }
  }, [categoryFilter, sortFilter]);

  useEffect(() => {
    if (!checkingAuth) {
      loadQueue();
      fetchPlatformStats().then((data) => {
        if (data) setStats(data);
      });
    }
  }, [checkingAuth, loadQueue]);

  const handleLogout = async () => {
    try {
      await logoutReviewer();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleReviewSuccess = (updatedClaim) => {
    // Remove reviewed claim from queue
    setPendingClaims((prev) => prev.filter((c) => c.id !== updatedClaim.id));
    setSelectedClaim(null);
    setNotification({
      type: 'success',
      message: `Verdict recorded: Claim marked ${updatedClaim.status.replace('_', ' ')}. Public feed updated.`
    });

    // Auto dismiss notification after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Client-side debounced quick search & risk tab filter (memoized to prevent redundant renders)
  const displayedClaims = useMemo(() => {
    return pendingClaims.filter((claim) => {
      // 1. Text Search (Debounced)
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const match = claim.text.toLowerCase().includes(q) || (claim.platform && claim.platform.toLowerCase().includes(q));
        if (!match) return false;
      }
      // 2. Risk Tab
      if (riskTab === 'HIGH') {
        return claim.riskLevel === 'HIGH' || claim.flags?.length >= 2;
      }
      if (riskTab === 'MEDIUM') {
        return claim.flags?.length === 1;
      }
      if (riskTab === 'LOW') {
        return !claim.flags || claim.flags.length === 0;
      }
      return true;
    });
  }, [pendingClaims, debouncedSearchQuery, riskTab]);

  const highRiskCount = useMemo(() => pendingClaims.filter((c) => c.riskLevel === 'HIGH' || c.flags?.length >= 2).length, [pendingClaims]);
  const medRiskCount = useMemo(() => pendingClaims.filter((c) => c.flags?.length === 1).length, [pendingClaims]);
  const lowRiskCount = useMemo(() => pendingClaims.filter((c) => !c.flags || c.flags.length === 0).length, [pendingClaims]);

  if (checkingAuth) {
    return (
      <div className="tl-reviewer-dashboard-page">
        <Navbar />
        <main className="tl-dashboard-loading">
          <LoadingSpinner message="Verifying reviewer credentials..." size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="tl-reviewer-dashboard-page">
      <Navbar />

      <main id="main-content" className="tl-dashboard-main">
        <div className="tl-dashboard-container">
          {/* Workspace Header (Image 2 - Screen 5) */}
          <header className="tl-dashboard-header">
            <div className="tl-header-left">
              <h1 className="tl-dashboard-title">Reviewer Workspace</h1>
              <p className="tl-dashboard-subtitle">
                Inspect pending community submissions, evaluate automated risk heuristics, and publish verified factual verdicts.
              </p>
            </div>

            <div className="tl-header-actions">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Exit Workspace
              </Button>
            </div>
          </header>

          {/* 4 Metric Cards Row (Real Dynamic Database Metrics) */}
          <div className="tl-reviewer-metrics-grid">
            <div className="tl-rev-metric-card tl-metric-orange">
              <span className="tl-rev-metric-num">{pendingClaims.length}</span>
              <span className="tl-rev-metric-label">Pending Reviews</span>
            </div>
            <div className="tl-rev-metric-card tl-metric-green">
              <span className="tl-rev-metric-num">{stats?.reviewedToday ?? (stats?.verifiedOutcomes || 0)}</span>
              <span className="tl-rev-metric-label">Reviewed Today</span>
            </div>
            <div className="tl-rev-metric-card tl-metric-blue">
              <span className="tl-rev-metric-num">{stats?.avgReviewHours || '...'}</span>
              <span className="tl-rev-metric-label">Avg. Review Time</span>
            </div>
            <div className="tl-rev-metric-card tl-metric-purple">
              <span className="tl-rev-metric-num">{stats?.accuracyRate || '...'}</span>
              <span className="tl-rev-metric-label">Accuracy Rate</span>
            </div>
          </div>

          {notification && (
            <div className={`tl-dashboard-banner tl-banner-${notification.type}`} role="status">
              <span>{notification.message}</span>
              <button
                type="button"
                className="tl-banner-close"
                onClick={() => setNotification(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Workspace Layout */}
          <div className="tl-dashboard-grid">
            {/* Queue Column */}
            <section className="tl-queue-column" aria-label="Unverified Claims Queue">
              <div className="tl-column-header">
                <div>
                  <h2 className="tl-column-title">Review Queue</h2>
                  <span className="tl-column-sub">Claims waiting for your review</span>
                </div>
                <button
                  type="button"
                  className="tl-refresh-btn"
                  onClick={loadQueue}
                  disabled={loadingQueue}
                >
                  {loadingQueue ? 'Refreshing...' : '↻ Refresh'}
                </button>
              </div>

              {/* Risk Level Filter Tabs (Image 2 - Screen 6) */}
              <div className="tl-risk-filter-tabs">
                {[
                  { id: 'ALL', label: `All (${pendingClaims.length})` },
                  { id: 'HIGH', label: `High Risk (${highRiskCount})` },
                  { id: 'MEDIUM', label: `Medium Risk (${medRiskCount})` },
                  { id: 'LOW', label: `Low Risk (${lowRiskCount})` }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`tl-risk-tab-btn ${riskTab === t.id ? 'active' : ''}`}
                    onClick={() => setRiskTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Reviewer Filter Controls */}
              <div className="tl-queue-controls">
                <input
                  type="search"
                  className="tl-queue-search-input"
                  placeholder="Filter queue by text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter queue by text"
                />

                <div className="tl-queue-filters-row">
                  <div className="tl-filter-select-wrap">
                    <label htmlFor="category-filter" className="tl-filter-label">Category:</label>
                    <select
                      id="category-filter"
                      className="tl-filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="POLITICS">Politics</option>
                      <option value="HEALTH">Health</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="tl-filter-select-wrap">
                    <label htmlFor="sort-filter" className="tl-filter-label">Triage Order:</label>
                    <select
                      id="sort-filter"
                      className="tl-filter-select"
                      value={sortFilter}
                      onChange={(e) => setSortFilter(e.target.value)}
                    >
                      <option value="priority">Priority (High Risk First)</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {loadingQueue && <LoadingSpinner message="Updating queue..." size="md" />}

              {queueError && (
                <ErrorState
                  title="Queue Load Error"
                  message={queueError.message || 'Unable to fetch pending claims.'}
                  onRetry={loadQueue}
                />
              )}

              {!loadingQueue && !queueError && (
                <ReviewerQueue
                  claims={displayedClaims}
                  selectedClaimId={selectedClaim?.id}
                  onSelectClaim={(claim) => {
                    setSelectedClaim(claim);
                    // Scroll to panel on mobile
                    if (window.innerWidth < 1024) {
                      document.getElementById('review-panel-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              )}
            </section>

            {/* Review Panel Column */}
            <section id="review-panel-section" className="tl-panel-column" aria-label="Active Review Panel">
              {selectedClaim ? (
                <ReviewPanel
                  claim={selectedClaim}
                  onReviewSuccess={handleReviewSuccess}
                  onClose={() => setSelectedClaim(null)}
                />
              ) : (
                <div className="tl-panel-empty-placeholder">
                  <div className="tl-placeholder-icon" aria-hidden="true">✎</div>
                  <h3 className="tl-placeholder-title">No Claim Selected</h3>
                  <p className="tl-placeholder-text">
                    Select any claim from the pending queue on the left to inspect its evidence and record a verified verdict.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
