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
                <span className="tl-submit-kicker">COMMUNITY TRIAGE</span>
                <h1 className="tl-submit-title">Submit a Claim for Triage</h1>
                <p className="tl-submit-lead">
                  Enter circulating claims from social networks or messaging apps. Our backend triage engine will identify urgency risk patterns and route the claim to our verification queue.
                </p>
              </header>

              <ClaimForm />
            </div>

            <aside className="tl-submit-sidebar" aria-label="Submission Guidelines">
              <div className="tl-sidebar-card">
                <h2 className="tl-sidebar-title">What Happens After Submission?</h2>
                <ol className="tl-sidebar-steps">
                  <li>
                    <strong>Deterministic Triage:</strong> The backend instantly checks for sensational wording, aggressive capitalization, and source attribution.
                  </li>
                  <li>
                    <strong>Public Feed:</strong> Your claim is immediately logged with a prominent <code>UNVERIFIED</code> status indicator.
                  </li>
                  <li>
                    <strong>Reviewer Queue:</strong> Reviewers audit credible evidence and assign an authoritative fact-checking verdict with an explanatory note.
                  </li>
                </ol>
              </div>

              <div className="tl-sidebar-card tl-sidebar-card-subtle">
                <h2 className="tl-sidebar-title">Important Note</h2>
                <p className="tl-sidebar-text">
                  High Risk ratings do <strong>not</strong> imply a claim is false. Risk measures sensational propagation signals. Final factual verdicts are strictly assigned by human review.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
