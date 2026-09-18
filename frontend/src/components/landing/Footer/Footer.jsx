import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../common/BrandLogo/BrandLogo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="tl-footer">
      <div className="tl-footer-container">
        <div className="tl-footer-main">
          <div className="tl-footer-brand">
            <div className="tl-footer-logo">
              <BrandLogo size={34} showText={true} />
            </div>
            <p className="tl-footer-desc">
              An open civic misinformation triage platform. Spot suspicious claims, verify with evidence, and share transparent facts with the community.
            </p>
          </div>

          <div className="tl-footer-nav-col">
            <h4 className="tl-footer-col-title">Public Platform</h4>
            <ul className="tl-footer-links">
              <li><Link to="/feed">Browse Claims Feed</Link></li>
              <li><Link to="/submit">Submit Suspicious Claim</Link></li>
              <li><a href="/#how-it-works">Editorial Methodology</a></li>
              <li><a href="/#risk-signals">Triage Risk Signals</a></li>
            </ul>
          </div>

          <div className="tl-footer-nav-col">
            <h4 className="tl-footer-col-title">Newsroom & Review</h4>
            <ul className="tl-footer-links">
              <li><Link to="/reviewer/access">Reviewer Workspace</Link></li>
              <li><a href="/#how-it-works">Verification Process</a></li>
              <li><a href="/#risk-signals">Deterministic Heuristics</a></li>
            </ul>
          </div>
        </div>

        <div className="tl-footer-bottom">
          <p className="tl-footer-copy">
            TruthLens Platform · Factual verdicts represent independent human journalistic verification.
          </p>
          <div className="tl-footer-meta">
            <span>Facts Over Fear</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
