import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ClaimForm from '../../components/claims/ClaimForm/ClaimForm';
import './SubmitClaimPage.css';

export default function SubmitClaimPage() {
  return (
    <div className="tl-submit-page">
      <Navbar />

      <main id="main-content" className="tl-submit-main">
        <div className="tl-submit-container">
          <div className="tl-submit-breadcrumbs">
            <Link to="/feed">← Back to Claims Feed</Link>
          </div>

          <div className="tl-submit-layout">
            <div className="tl-submit-form-col">
              <header className="tl-submit-header">
                <h1 className="tl-submit-title">Submit a Claim for Triage</h1>
                <p className="tl-submit-lead">
                  Help us fight misinformation. Paste or describe a claim you found on social media or messaging apps. Our automated triage engine will analyze it for potential risk signals.
                </p>
              </header>

              <ClaimForm />
            </div>

            <aside className="tl-submit-sidebar" aria-label="Submission Guidelines">
              {/* Card 1: What Happens After Submission */}
              <div className="tl-sidebar-card">
                <h2 className="tl-sidebar-title">What Happens After Submission?</h2>
                <div className="tl-sidebar-step-item">
                  <div className="tl-step-num-pill">1</div>
                  <div>
                    <strong>Deterministic Triage</strong>
                    <p>We analyze the text for viral risk signals and propagation urgency.</p>
                  </div>
                </div>
                <div className="tl-sidebar-step-item">
                  <div className="tl-step-num-pill">2</div>
                  <div>
                    <strong>Public Feed</strong>
                    <p>Your claim is immediately visible with an UNVERIFIED status indicator.</p>
                  </div>
                </div>
                <div className="tl-sidebar-step-item">
                  <div className="tl-step-num-pill">3</div>
                  <div>
                    <strong>Reviewer Queue</strong>
                    <p>Our team verifies authoritative sources and assigns a final editorial verdict.</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Important Note */}
              <div className="tl-sidebar-card tl-sidebar-warning-card">
                <div className="tl-warning-card-header">
                  <span className="tl-warning-card-icon">⚠️</span>
                  <h3 className="tl-warning-card-title">Important Note</h3>
                </div>
                <p className="tl-sidebar-text">
                  High-risk ratings do <strong>not</strong> imply a claim is false. Final factual verdicts are assigned by human reviewers after examining primary evidence.
                </p>
              </div>

              {/* Card 3: Together for a Safer Internet (Image 2 - Screen 3) */}
              <div className="tl-sidebar-card tl-together-card">
                <div className="tl-together-icon-wrap" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(0, 102, 255, 0.25)" stroke="#38bdf8" />
                    <polyline points="9 12 11 14 15 10" stroke="#ffffff" strokeWidth="2.2" />
                  </svg>
                </div>
                <h3 className="tl-together-title">Together for a Safer Internet</h3>
                <p className="tl-together-desc">Report. Verify. Share facts.</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
