import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import FeedPage from './pages/FeedPage/FeedPage';
import SubmitClaimPage from './pages/SubmitClaimPage/SubmitClaimPage';
import ClaimDetailPage from './pages/ClaimDetailPage/ClaimDetailPage';
import ReviewerAccessPage from './pages/ReviewerAccessPage/ReviewerAccessPage';
import ReviewerDashboardPage from './pages/ReviewerDashboardPage/ReviewerDashboardPage';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="tl-app-root">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/submit" element={<SubmitClaimPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/reviewer/access" element={<ReviewerAccessPage />} />
          <Route path="/reviewer/dashboard" element={<ReviewerDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
