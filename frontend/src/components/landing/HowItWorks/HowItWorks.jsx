import React from 'react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit',
      subtitle: 'Public Submission',
      desc: 'Anyone can submit suspicious claims circulating on WhatsApp, X, Instagram, or the web. No user registration or account creation is required.'
    },
    {
      num: '02',
      title: 'Triage',
      subtitle: 'Automated Risk Signals',
      desc: 'The backend engine instantly analyzes the claim for viral danger markers: sensational urgency phrasing, aggressive uppercase shouting, and missing citations.'
    },
    {
      num: '03',
      title: 'Review',
      subtitle: 'Human Verification',
      desc: 'Authorized reviewers investigate credible sources and evidence, assigning a definitive verdict (Verified True, False, or Misleading) with an explanatory note.'
    }
  ];

  return (
    <section id="how-it-works" className="tl-how" aria-labelledby="how-title">
      <div className="tl-how-container">
        <div className="tl-section-header">
          <span className="tl-section-kicker">EDITORIAL PROCESS</span>
          <h2 id="how-title" className="tl-section-title">How TruthLens Works</h2>
          <p className="tl-section-lead">
            Separating automated urgency assessment from factual human truth.
          </p>
        </div>

        <div className="tl-how-grid">
          {steps.map((step) => (
            <div key={step.num} className="tl-how-step">
              <div className="tl-step-top">
                <span className="tl-step-num">{step.num}</span>
                <span className="tl-step-subtitle">{step.subtitle}</span>
              </div>
              <h3 className="tl-step-title">{step.title}</h3>
              <p className="tl-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
