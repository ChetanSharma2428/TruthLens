import React from 'react';
import Navbar from '../../components/landing/Navbar/Navbar';
import Hero from '../../components/landing/Hero/Hero';
import HowItWorks from '../../components/landing/HowItWorks/HowItWorks';
import RiskSignals from '../../components/landing/RiskSignals/RiskSignals';
import Footer from '../../components/landing/Footer/Footer';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="tl-landing-page">
      <Navbar />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <RiskSignals />
      </main>
      <Footer />
    </div>
  );
}
