import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import { fetchPlatformStats } from '../../../services/statsService';
import { fetchClaims } from '../../../services/claimService';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState(null);
  const [featuredClaim, setFeaturedClaim] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchPlatformStats().then((data) => {
      if (isMounted && data) {
        setStats(data);
      }
    });

    fetchClaims({ limit: 8, visibility: 'ALL' }).then((res) => {
      if (isMounted && res?.claims?.length > 0) {
        // Find first claim that has a reviewer verdict/note, or take the latest
        const reviewed = res.claims.find((c) => c.status !== 'UNVERIFIED' && c.reviewerNote) || res.claims[0];
        setFeaturedClaim(reviewed);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="tl-hero" aria-labelledby="hero-title">
      <div className="tl-hero-container">
        {/* Left Column: Headline, Subtitle, CTAs */}
        <div className="tl-hero-content">
          <div className="tl-hero-kicker">
            <span className="tl-kicker-dot" aria-hidden="true" />
            CIVIC MISINFORMATION TRIAGE PLATFORM
          </div>

          <h1 id="hero-title" className="tl-hero-headline">
            Stop Misinformation.<br />
            <span className="tl-headline-blue">Start Facts.</span>
          </h1>

          <p className="tl-hero-lead">
            TruthLens helps you verify claims, understand the truth, and build a more informed society. Submit, review, and explore fact-checked information from around the world.
          </p>

          <div className="tl-hero-ctas">
            <Button variant="primary" size="lg" to="/feed" className="tl-cta-start">
              Get Started
            </Button>
            <a href="#how-it-works" onClick={scrollToHowItWorks} className="tl-hero-secondary-btn">
              <span className="tl-btn-play-icon">▶</span> See How It Works
            </a>
          </div>

          {/* Social Proof Stats Row (Image 2 - Screen 1 - Real Dynamic Values) */}
          <div className="tl-hero-stats-grid">
            <div className="tl-stat-card">
              <span className="tl-stat-num">{stats?.totalClaims !== undefined ? stats.totalClaims.toLocaleString() : '...'}</span>
              <span className="tl-stat-label">Claims Submitted</span>
            </div>
            <div className="tl-stat-card">
              <span className="tl-stat-num">{stats?.fastChecked !== undefined ? stats.fastChecked.toLocaleString() : '...'}</span>
              <span className="tl-stat-label">Fast-Checked</span>
            </div>
            <div className="tl-stat-card">
              <span className="tl-stat-num">{stats?.peopleReached || '...'}</span>
              <span className="tl-stat-label">People Reached</span>
            </div>
            <div className="tl-stat-card">
              <span className="tl-stat-num">{stats?.communityTrust || '...'}</span>
              <span className="tl-stat-label">Community Trust</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Smartphone Showcase (Live Dynamic Claim) */}
        <div className="tl-hero-visual-col" aria-hidden="true">
          <div className="tl-phone-mockup-wrapper">
            {/* Floating Social Icons & Badges */}
            <div className="tl-floating-badge tl-float-wa" title="WhatsApp Viral Triage">
              <span className="tl-wa-icon">💬</span> WhatsApp
            </div>
            <div className="tl-floating-badge tl-float-x" title="Social Post">
              <span className="tl-x-icon">𝕏</span> Viral Post
            </div>
            <div className="tl-floating-badge tl-float-check" title="Fact Checked">
              <span className="tl-check-bubble">✓</span> Fact Checked
            </div>

            {/* Smartphone Frame */}
            <div className="tl-smartphone-frame">
              <div className="tl-phone-notch">
                <div className="tl-notch-camera" />
                <div className="tl-notch-speaker" />
              </div>

              <div className="tl-phone-screen">
                <div className="tl-phone-app-header">
                  <div className="tl-app-header-avatar">TL</div>
                  <div className="tl-app-header-info">
                    <span className="tl-app-name">TruthLens Triage</span>
                    <span className="tl-app-status">● Live Verification</span>
                  </div>
                </div>

                <div className="tl-phone-chat-body">
                  <div className="tl-chat-bubble tl-claim-bubble">
                    <div className="tl-bubble-tag">
                      <span className="tl-warn-emoji">⚠️</span> {featuredClaim?.category || 'General'} Alert
                    </div>
                    <p className="tl-bubble-text">
                      "{featuredClaim?.text || 'Searching for live circulating community claims...'}"
                    </p>
                    <div className="tl-bubble-meta">
                      <span>{featuredClaim?.platform ? `${featuredClaim.platform.charAt(0) + featuredClaim.platform.slice(1).toLowerCase()} Report` : 'Community Stream'}</span> · <span>{featuredClaim?.submittedAt ? new Date(featuredClaim.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                    </div>

                    {/* Verdict Stamp */}
                    {featuredClaim && featuredClaim.status !== 'UNVERIFIED' && (
                      <div className={`tl-verdict-stamp ${featuredClaim.status === 'VERIFIED_TRUE' ? 'tl-stamp-true' : 'tl-stamp-false'}`}>
                        {featuredClaim.status === 'VERIFIED_TRUE' ? 'VERIFIED' : featuredClaim.status.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  <div className="tl-chat-bubble tl-verification-bubble">
                    <div className="tl-verif-header">
                      <span className="tl-verif-icon">🛡️</span>
                      <strong>Official Fact-Check:</strong>
                    </div>
                    <p className="tl-verif-text">
                      {featuredClaim?.reviewerNote || 'Editorial review verifies primary source evidence to establish ground truth.'}
                    </p>
                    <span className="tl-verif-source">
                      {featuredClaim?.evidenceUrl ? `Source: ${featuredClaim.evidenceUrl.replace(/^https?:\/\//, '')}` : 'Source: TruthLens Editorial Newsroom'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Feature Banner (Image 2 - Screen 1 bottom strip) */}
      <div className="tl-hero-three-steps">
        <div className="tl-three-steps-container">
          <div className="tl-three-steps-header">
            <h2 className="tl-three-steps-title">A more informed tomorrow starts with you.</h2>
            <p className="tl-three-steps-sub">Join thousands triaging claims and debunking viral rumors in real time.</p>
          </div>

          <div className="tl-three-steps-grid">
            <Link to="/submit" className="tl-step-card">
              <div className="tl-step-icon-wrap tl-step-blue">
                <span>📝</span>
              </div>
              <h3 className="tl-step-title">Submit Claims</h3>
              <p className="tl-step-desc">Saw something suspicious? Paste text or upload screenshots from any messaging app.</p>
              <span className="tl-step-link">Submit Now →</span>
            </Link>

            <Link to="/feed" className="tl-step-card">
              <div className="tl-step-icon-wrap tl-step-indigo">
                <span>🔍</span>
              </div>
              <h3 className="tl-step-title">Get Verified</h3>
              <p className="tl-step-desc">Automated triage checks risk signals, while expert newsrooms verify authoritative facts.</p>
              <span className="tl-step-link">Explore Feed →</span>
            </Link>

            <Link to="/reviewer/access" className="tl-step-card">
              <div className="tl-step-icon-wrap tl-step-cyan">
                <span>🤝</span>
              </div>
              <h3 className="tl-step-title">Help Others</h3>
              <p className="tl-step-desc">Share verified conclusions with clear citations and stop the viral spread of fake news.</p>
              <span className="tl-step-link">Reviewer Workspace →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
