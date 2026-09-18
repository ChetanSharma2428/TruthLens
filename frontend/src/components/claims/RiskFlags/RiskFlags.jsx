import React, { useState, memo } from 'react';
import Badge from '../../common/Badge/Badge';
import './RiskFlags.css';

function RiskFlags({
  flags = [],
  riskLevel = 'NORMAL',
  metrics = null,
  showIndividualFlags = true,
  interactive = false,
  size = 'sm'
}) {
  const [expanded, setExpanded] = useState(false);
  const isHighRisk = riskLevel === 'HIGH' || flags.length >= 2;

  const hasSensational = flags.includes('SENSATIONAL');
  const hasShouting = flags.includes('SHOUTING');
  const hasUnsourced = flags.includes('UNSOURCED');

  const capsPercent = metrics?.uppercasePercent !== undefined
    ? metrics.uppercasePercent
    : (hasShouting ? 75 : 15);

  const detectedKeywords = metrics?.detectedKeywords || [];

  return (
    <div className="tl-risk-flags-wrapper">
      <div className="tl-risk-flags-container">
        <Badge
          variant={isHighRisk ? 'risk-high' : 'risk-normal'}
          size={size}
          className="tl-risk-level-badge"
        >
          {isHighRisk ? 'HIGH RISK' : 'NORMAL RISK'}
        </Badge>

        {showIndividualFlags && flags.length > 0 && (
          <div className="tl-individual-flags">
            {flags.map((flag) => (
              <span key={flag} className={`tl-risk-chip tl-risk-chip-${flag.toLowerCase()}`}>
                {flag}
              </span>
            ))}
          </div>
        )}

        {interactive && (
          <button
            type="button"
            className={`tl-risk-details-toggle ${expanded ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            title="Inspect deterministic risk breakdown"
            aria-label="Inspect deterministic risk signals"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide Signals ▴' : 'Signals Info ▾'}
          </button>
        )}
      </div>

      {interactive && expanded && (
        <div
          className="tl-risk-inspector-panel"
          onClick={(e) => e.stopPropagation()}
          role="region"
          aria-label="Risk signal metrics breakdown"
        >
          <div className="tl-inspector-header">
            <span className="tl-inspector-title">Deterministic Triage Signals</span>
            <span className="tl-inspector-rule">Rule: 2+ flags = High Risk</span>
          </div>

          <div className="tl-inspector-grid">
            {/* Signal 1: Sensational */}
            <div className={`tl-inspector-item ${hasSensational ? 'triggered' : 'passed'}`}>
              <div className="tl-item-title-row">
                <span className="tl-item-indicator">{hasSensational ? '● Active' : '○ Clear'}</span>
                <span className="tl-item-name">Sensational</span>
              </div>
              <p className="tl-item-desc">
                {hasSensational
                  ? `Urgency triggers: ${detectedKeywords.length > 0 ? detectedKeywords.join(', ') : '"breaking" / "shocking" / "share before deleted"'}`
                  : 'No sensational urgency keywords detected'}
              </p>
            </div>

            {/* Signal 2: Shouting */}
            <div className={`tl-inspector-item ${hasShouting ? 'triggered' : 'passed'}`}>
              <div className="tl-item-title-row">
                <span className="tl-item-indicator">{hasShouting ? '● Active' : '○ Clear'}</span>
                <span className="tl-item-name">Shouting (&gt;50% CAPS)</span>
              </div>
              <div className="tl-item-meter-wrap">
                <div className="tl-meter-bar-bg">
                  <div
                    className={`tl-meter-bar-fill ${hasShouting ? 'high' : 'normal'}`}
                    style={{ width: `${Math.min(100, Math.max(8, capsPercent))}%` }}
                  />
                </div>
                <span className="tl-meter-value">{capsPercent}% uppercase</span>
              </div>
            </div>

            {/* Signal 3: Unsourced */}
            <div className={`tl-inspector-item ${hasUnsourced ? 'triggered' : 'passed'}`}>
              <div className="tl-item-title-row">
                <span className="tl-item-indicator">{hasUnsourced ? '● Active' : '○ Clear'}</span>
                <span className="tl-item-name">Attribution</span>
              </div>
              <p className="tl-item-desc">
                {hasUnsourced ? 'No source reference URL supplied' : 'Source reference link supplied'}
              </p>
            </div>
          </div>

          <div className="tl-inspector-footer">
            <span className="tl-inspector-disclaimer">
              ℹ Automated risk flags viral urgency patterns, not factual truth. High risk ≠ false.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(RiskFlags);
