import React from 'react';
import Badge from '../../common/Badge/Badge';
import './RiskSignals.css';

export default function RiskSignals() {
  const signals = [
    {
      flag: 'SENSATIONAL',
      condition: 'Triggered when the text contains viral trigger words: "breaking", "shocking", or "share before deleted".',
      why: 'Viral misinformation frequently relies on fabricated urgency to force rapid uncritical sharing.'
    },
    {
      flag: 'SHOUTING',
      condition: 'Triggered when more than 50% of the alphabetic characters are capitalized.',
      why: 'All-caps formatting mimics emergency warnings and suppresses nuanced critical evaluation.'
    },
    {
      flag: 'UNSOURCED',
      condition: 'Triggered when no primary source or credible reference URL is supplied with the claim.',
      why: 'Unreferenced hearsay cannot be audited without an initial verifiable point of origin.'
    }
  ];

  return (
    <section id="risk-signals" className="tl-signals" aria-labelledby="signals-title">
      <div className="tl-signals-container">
        <div className="tl-section-header">
          <span className="tl-section-kicker">AUTOMATED TRIAGE RULES</span>
          <h2 id="signals-title" className="tl-section-title">Deterministic Risk Signals</h2>
          <p className="tl-section-lead">
            Every submission is scanned through three objective criteria before entering the reviewer queue.
          </p>
        </div>

        <div className="tl-signals-grid">
          {signals.map((sig) => (
            <div key={sig.flag} className="tl-signal-card">
              <div className="tl-signal-header">
                <Badge variant="neutral" size="sm">{sig.flag}</Badge>
              </div>
              <h3 className="tl-signal-condition">{sig.condition}</h3>
              <p className="tl-signal-why"><strong>Why it matters:</strong> {sig.why}</p>
            </div>
          ))}
        </div>

        <div className="tl-signals-callout" role="note">
          <div className="tl-callout-badge-wrap">
            <Badge variant="risk-high" size="md">HIGH RISK CALCULATION</Badge>
          </div>
          <div className="tl-callout-text">
            <h4>2 or More Signals = HIGH RISK</h4>
            <p>
              <strong>High risk does not mean false.</strong> Risk measures urgency patterns and lack of attribution, not factual truth. Even a true event can be reported with sensational shouting. Only a human reviewer can verify facts and assign final verdict states.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
