import React, { useState, useEffect, useCallback } from 'react';
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
  const navigate = useNavigate();

  // 1. Check Authentication on Mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const authData = await checkReviewerSession();
        if (!authData?.authenticated) {
          navigate('/reviewer/access', { replace: true });
        } else {
          setCheckingAuth(false);
        }
      } catch {
        navigate('/reviewer/access', { replace: true });
      }
    }
    verifyAuth();
  }, [navigate]);

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

  // Client-side quick search filter
  const displayedClaims = pendingClaims.filter((claim) => {
    if (!searchQuery.trim()) return true;
    return (
      claim.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (claim.platform && claim.platform.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    );
  });

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
          {/* Workspace Header */}
          <header className="tl-dashboard-header">
            <div className="tl-header-left">
              <div className="tl-workspace-badge-row">
                <span className="tl-live-indicator" aria-hidden="true" />
                <span className="tl-workspace-tag">AUTHENTICATED REVIEWER WORKSPACE</span>
              </div>
              <h1 className="tl-dashboard-title">Reviewer Dashboard</h1>
              <p className="tl-dashboard-subtitle">
                Inspect pending community submissions, analyze automated risk heuristics, and publish human factual verdicts.
              </p>
            </div>

            <div className="tl-header-actions">
              <span className="tl-queue-counter">
                <strong>{pendingClaims.length}</strong> {pendingClaims.length === 1 ? 'claim' : 'claims'} awaiting review
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </header>

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
                <h2 className="tl-column-title">Pending Claims Queue</h2>
                <button
                  type="button"
                  className="tl-refresh-btn"
                  onClick={loadQueue}
                  disabled={loadingQueue}
                >
                  {loadingQueue ? 'Refreshing...' : '↻ Refresh'}
                </button>
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
