import React from 'react';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import './Hero.css';

export default function Hero() {
  return (
    <section className="tl-hero" aria-labelledby="hero-title">
      <div className="tl-hero-container">
        <div className="tl-hero-content">
          <div className="tl-hero-kicker">
            <span className="tl-kicker-dot" aria-hidden="true" />
            MISINFORMATION TRIAGE & EDITORIAL FACT-CHECKING
          </div>

          <h1 id="hero-title" className="tl-hero-headline">
            Verify before <br />
            <span className="tl-headline-emphasis">you amplify.</span>
          </h1>

          <p className="tl-hero-lead">
            A misinformation triage platform for viral claims. Automatically detect risk signals, organize newsroom human review, and provide the public with transparent verification verdicts.
          </p>

          <div className="tl-hero-ctas">
            <Button variant="primary" size="lg" to="/feed">
              Get Started
            </Button>
            <Button variant="outline" size="lg" to="/reviewer/access">
              Reviewer Workspace
            </Button>
          </div>

          <div className="tl-hero-guarantee">
            <span className="tl-guarantee-icon">✓</span>
            <span>Deterministic Risk Triage</span>
            <span className="tl-guarantee-sep">·</span>
            <span className="tl-guarantee-icon">✓</span>
            <span>Human-Reviewed Verdicts</span>
            <span className="tl-guarantee-sep">·</span>
            <span className="tl-guarantee-icon">✓</span>
            <span>Public Lifecycle Transparency</span>
          </div>
        </div>

        <div className="tl-hero-preview" aria-hidden="true">
          <div className="tl-preview-card">
            <div className="tl-preview-header">
              <Badge variant="risk-high" size="sm">HIGH RISK (2 FLAGS)</Badge>
              <Badge variant="status-unverified" size="sm">UNVERIFIED</Badge>
            </div>
            <p className="tl-preview-text">
              "BREAKING!!! CENTRAL BANK WILL SUSPEND ALL DIGITAL TRANSFERS OVERNIGHT! SHARE BEFORE DELETED!"
            </p>
            <div className="tl-preview-meta">
              <span>Finance · WhatsApp</span>
              <span>• Unsourced</span>
              <span>• Sensational</span>
            </div>
            <div className="tl-preview-arrow">
              <span className="tl-arrow-label">Human Review Decision</span>
              <span className="tl-arrow-indicator">↓</span>
            </div>
            <div className="tl-preview-resolution">
              <div className="tl-resolution-top">
                <Badge variant="status-false" size="sm">VERDICT: FALSE</Badge>
                <span className="tl-resolution-time">Reviewed Today</span>
              </div>
              <p className="tl-resolution-note">
                "Central Bank published official circular refuting all transfer shutdown claims. Normal operations remain unaffected."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
