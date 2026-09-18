import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ReviewerAccessForm from '../../components/reviewer/ReviewerAccessForm/ReviewerAccessForm';
import BrandLogo from '../../components/common/BrandLogo/BrandLogo';
import './ReviewerAccessPage.css';

export default function ReviewerAccessPage() {
  return (
    <div className="tl-reviewer-access-page">
      <Navbar />

      <main id="main-content" className="tl-access-main">
        <div className="tl-access-container">
          <div className="tl-access-split-layout">
            {/* Left Column: Access Form */}
            <div className="tl-access-form-column">
              <div className="tl-access-back">
                <Link to="/feed">← Back to Public Claims Feed</Link>
              </div>
              <ReviewerAccessForm />
            </div>

            {/* Right Column: Inspirational Brand Card (Screen 11) */}
            <div className="tl-access-brand-card">
              <div className="tl-brand-card-inner">
                <div className="tl-brand-card-logo">
                  <BrandLogo size={52} showText={false} />
                </div>
                <h2 className="tl-brand-card-title">Facts Create a Safer Tomorrow</h2>
                <p className="tl-brand-card-desc">
                  Join journalists, open-source researchers, and fact-checking newsrooms working together to stop viral falsehoods and restore digital integrity.
                </p>

                <div className="tl-brand-card-perks">
                  <div className="tl-brand-perk-item">
                    <span className="tl-perk-icon">🛡️</span>
                    <div>
                      <strong>Authoritative Verdict Separation</strong>
                      <span>Automated risk heuristics guide triage; only verified humans assign factual truth.</span>
                    </div>
                  </div>

                  <div className="tl-brand-perk-item">
                    <span className="tl-perk-icon">⚡</span>
                    <div>
                      <strong>Real-Time Semantic Duplicate Detection</strong>
                      <span>Atlas Vector Search detects duplicate viral rumors across multiple platforms.</span>
                    </div>
                  </div>

                  <div className="tl-brand-perk-item">
                    <span className="tl-perk-icon">🔍</span>
                    <div>
                      <strong>Public Auditability & Citations</strong>
                      <span>Every verdict links to primary sources, archive URLs, and transparent rationale.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
