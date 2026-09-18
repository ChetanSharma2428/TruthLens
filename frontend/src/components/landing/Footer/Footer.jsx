import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="tl-footer">
      <div className="tl-footer-container">
        <div className="tl-footer-main">
          <div className="tl-footer-brand">
            <div className="tl-footer-logo">
              <span className="tl-footer-icon">TL</span>
              <span className="tl-footer-title">TRUTHLENS</span>
            </div>
            <p className="tl-footer-desc">
              An open misinformation triage and human-review platform designed to protect public information ecosystems from unverified viral panics.
            </p>
            <div className="tl-footer-dps">
              <span className="tl-dp-tag">DP1: Newest First</span>
              <span className="tl-dp-tag">DP2: Unverified Transparency</span>
              <span className="tl-dp-tag">DP3: Claim Immutability</span>
            </div>
          </div>

          <div className="tl-footer-nav-col">
            <h4 className="tl-footer-col-title">Public Platform</h4>
            <ul className="tl-footer-links">
              <li><Link to="/feed">Browse Claims Feed</Link></li>
              <li><Link to="/submit">Submit Suspicious Claim</Link></li>
              <li><a href="#how-it-works">Editorial Methodology</a></li>
              <li><a href="#risk-signals">Triage Risk Signals</a></li>
            </ul>
          </div>

          <div className="tl-footer-nav-col">
            <h4 className="tl-footer-col-title">Newsroom & Audit</h4>
            <ul className="tl-footer-links">
              <li><Link to="/reviewer/access">Reviewer Workspace</Link></li>
              <li><span className="tl-footer-note">Track 2: Real-World AI Products</span></li>
              <li><span className="tl-footer-note">Deterministic Risk Engine</span></li>
              <li><span className="tl-footer-note">Server-Side Authoritative</span></li>
            </ul>
          </div>
        </div>

        <div className="tl-footer-bottom">
          <p className="tl-footer-copy">
            TruthLens Platform · Factual verdicts represent independent human journalistic verification.
          </p>
          <div className="tl-footer-meta">
            <span>Project ID: TL-TRACK2-2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
