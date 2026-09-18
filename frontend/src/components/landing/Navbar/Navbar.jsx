import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="tl-navbar">
      <div className="tl-navbar-container">
        <div className="tl-navbar-brand">
          <Link to="/" className="tl-brand-link">
            <span className="tl-brand-icon" aria-hidden="true">TL</span>
            <span className="tl-brand-title">TRUTHLENS</span>
          </Link>
          <span className="tl-brand-tagline">Triage & Verification</span>
        </div>

        <nav className="tl-navbar-nav" aria-label="Main Navigation">
          <Link to="/feed" className="tl-nav-link">Claims Feed</Link>
          <a href="#how-it-works" className="tl-nav-link">How It Works</a>
          <a href="#risk-signals" className="tl-nav-link">Risk Signals</a>
          <Link to="/submit" className="tl-nav-link">Submit Claim</Link>
        </nav>

        <div className="tl-navbar-actions">
          <Button variant="outline" size="sm" to="/reviewer/access" className="tl-reviewer-btn">
            Reviewer
          </Button>
          <Button variant="primary" size="sm" to="/feed">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
