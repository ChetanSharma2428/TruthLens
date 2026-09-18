import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar/Navbar';
import Footer from '../../components/landing/Footer/Footer';
import ReviewerAccessForm from '../../components/reviewer/ReviewerAccessForm/ReviewerAccessForm';
import './ReviewerAccessPage.css';

export default function ReviewerAccessPage() {
  return (
    <div className="tl-reviewer-access-page">
      <Navbar />

      <main id="main-content" className="tl-access-main">
        <div className="tl-access-container">
          <div className="tl-access-back">
            <Link to="/feed">← Back to Public Claims Feed</Link>
          </div>

          <ReviewerAccessForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
