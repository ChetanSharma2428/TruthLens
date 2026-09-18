import React from 'react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Submit',
      desc: 'Share a claim you found on social media or messaging apps with source details or screenshots.'
    },
    {
      num: '2',
      title: 'Analyze',
      desc: 'Our deterministic triage engine instantly checks for viral risk signals and propagation urgency.'
    },
    {
      num: '3',
      title: 'Review',
      desc: 'Fact-checking journalists review authoritative primary sources and assign an editorial verdict.'
    },
    {
      num: '4',
      title: 'Inform',
      desc: 'The verified result is shared transparently with the public with full audit provenance.'
    }
  ];

  return (
    <section id="how-it-works" className="tl-how" aria-labelledby="how-title">
      <div className="tl-how-container">
        <div className="tl-section-header">
          <span className="tl-section-kicker">EDITORIAL PROCESS</span>
          <h2 id="how-title" className="tl-section-title">How TruthLens Works</h2>
          <p className="tl-section-lead">
            A simple, transparent 4-stage process to fight misinformation.
          </p>
        </div>

        <div className="tl-how-timeline">
          {steps.map((step, idx) => (
            <div key={step.num} className="tl-how-step-col">
              <div className="tl-step-circle-badge">
                {step.num}
              </div>
              {idx < steps.length - 1 && <div className="tl-step-connector-line" />}
              <h3 className="tl-pipeline-step-title">{step.title}</h3>
              <p className="tl-pipeline-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
