import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import BrandLogo from '../../common/BrandLogo/BrandLogo';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="tl-navbar">
      <div className="tl-navbar-container">
        <div className="tl-navbar-brand">
          <Link to="/" className="tl-brand-link" title="TruthLens Home" onClick={closeMobileMenu}>
            <BrandLogo size={38} showText={true} />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="tl-navbar-nav" aria-label="Main Navigation">
          <Link to="/" className="tl-nav-link">Home</Link>
          <Link to="/feed" className="tl-nav-link">Claims Feed</Link>
          <a href="/#how-it-works" className="tl-nav-link">How It Works</a>
          <a href="/#risk-signals" className="tl-nav-link">Risk Signals</a>
          <Link to="/submit" className="tl-nav-link">Submit Claim</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="tl-navbar-actions">
          <Button variant="outline" size="sm" to="/reviewer" className="tl-nav-reviewer-btn">
            Reviewer
          </Button>
          <Button variant="primary" size="sm" to="/feed" className="tl-nav-cta-btn">
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="tl-nav-hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu (Screens < 860px) */}
      {mobileMenuOpen && (
        <div className="tl-mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
          <nav className="tl-mobile-nav-links">
            <Link to="/" className="tl-mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/feed" className="tl-mobile-nav-link" onClick={closeMobileMenu}>
              Claims Feed
            </Link>
            <a href="/#how-it-works" className="tl-mobile-nav-link" onClick={closeMobileMenu}>
              How It Works
            </a>
            <a href="/#risk-signals" className="tl-mobile-nav-link" onClick={closeMobileMenu}>
              Risk Signals
            </a>
            <Link to="/submit" className="tl-mobile-nav-link" onClick={closeMobileMenu}>
              Submit Claim
            </Link>
          </nav>
          <div className="tl-mobile-nav-actions">
            <Button variant="outline" size="md" to="/reviewer" onClick={closeMobileMenu} className="tl-mobile-btn">
              Reviewer
            </Button>
            <Button variant="primary" size="md" to="/feed" onClick={closeMobileMenu} className="tl-mobile-btn">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
