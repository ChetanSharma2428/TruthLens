import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';
import './App.css';

// Lazy-loaded route chunks for code splitting and fast initial page load
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'));
const FeedPage = lazy(() => import('./pages/FeedPage/FeedPage'));
const SubmitClaimPage = lazy(() => import('./pages/SubmitClaimPage/SubmitClaimPage'));
const ClaimDetailPage = lazy(() => import('./pages/ClaimDetailPage/ClaimDetailPage'));
const ReviewerAccessPage = lazy(() => import('./pages/ReviewerAccessPage/ReviewerAccessPage'));
const ReviewerDashboardPage = lazy(() => import('./pages/ReviewerDashboardPage/ReviewerDashboardPage'));

export default function App() {
  return (
    <Router>
      <div className="tl-app-root">
        <Suspense
          fallback={
            <div className="tl-page-suspense-fallback" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size="lg" message="Loading..." />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/submit" element={<SubmitClaimPage />} />
            <Route path="/claims/:id" element={<ClaimDetailPage />} />
            <Route path="/reviewer" element={<ReviewerDashboardPage />} />
            <Route path="/reviewer/dashboard" element={<ReviewerDashboardPage />} />
            <Route path="/reviewer/access" element={<ReviewerDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}
