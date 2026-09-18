import React from 'react';
import Badge from '../../common/Badge/Badge';
import './RiskSignals.css';

export default function RiskSignals() {
  const signals = [
    {
      id: 'SENSATIONAL',
      title: 'Sensational Language',
      icon: '🚨',
      tag: 'Core Rule 1',
      desc: 'Words like "breaking", "urgent", "shocking", or "share before deleted" designed to panic users.',
      why: 'Viral disinformation relies on fabricated emergency phrasing to force rapid uncritical re-sharing.'
    },
    {
      id: 'SHOUTING',
      title: 'Shouting / Excessive Caps',
      icon: '📢',
      tag: 'Core Rule 2',
      desc: 'More than 50% uppercase alphabetic characters simulating alarm bells.',
      why: 'All-caps formatting mimics emergency warnings and suppresses nuanced critical verification.'
    },
    {
      id: 'UNSOURCED',
      title: 'Unsourced Claim',
      icon: '🔗',
      tag: 'Core Rule 3',
      desc: 'No credible primary source link or reference citation supplied with the post.',
      why: 'Unreferenced hearsay cannot be audited without an initial verifiable point of origin.'
    },
    {
      id: 'PUNCTUATION',
      title: 'Clickbait Punctuation',
      icon: '❗',
      tag: 'Heuristic',
      desc: 'Excessive exclamation marks (!!!) and interrogative clusters (???) intended to provoke.',
      why: 'Exaggerated typography triggers emotional urgency rather than factual deliberation.'
    },
    {
      id: 'SUSPICIOUS_DOMAIN',
      title: 'Suspicious Domain',
      icon: '🌐',
      tag: 'Heuristic',
      desc: 'Links targeting known unreliable, cloaked, or cloned misinformation websites.',
      why: 'Lookalike domains impersonate legitimate news outlets to deceive casual readers.'
    },
    {
      id: 'EMOTIONAL_MANIPULATION',
      title: 'Emotional Manipulation',
      icon: '💔',
      tag: 'Heuristic',
      desc: 'Language engineered to incite acute anger, communal dread, or conspiracy anxiety.',
      why: 'Heightened emotional arousal directly degrades cognitive fact-checking defenses.'
    }
  ];

  return (
    <section id="risk-signals" className="tl-signals" aria-labelledby="signals-title">
      <div className="tl-signals-container">
        <div className="tl-section-header">
          <span className="tl-section-kicker">AUTOMATED TRIAGE RULES</span>
          <h2 id="signals-title" className="tl-section-title">Risk Signals</h2>
          <p className="tl-section-lead">
            Our triage engine detects common patterns and viral amplification markers in misleading content.
          </p>
        </div>

        <div className="tl-signals-grid-six">
          {signals.map((sig) => (
            <div key={sig.id} className="tl-signal-modern-card">
              <div className="tl-signal-card-header">
                <span className="tl-signal-card-icon">{sig.icon}</span>
                <span className="tl-signal-card-tag">{sig.tag}</span>
              </div>
              <h3 className="tl-signal-card-title">{sig.title}</h3>
              <p className="tl-signal-card-desc">{sig.desc}</p>
              <div className="tl-signal-card-why">
                <strong>Why it matters:</strong> {sig.why}
              </div>
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
              <strong>High risk does not mean false.</strong> Risk measures urgency propagation patterns and lack of attribution, not factual truth. Even a true event can be forwarded with sensational shouting. Final factual verdicts are strictly assigned through editorial review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
