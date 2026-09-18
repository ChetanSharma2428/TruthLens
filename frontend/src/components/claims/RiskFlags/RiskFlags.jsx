import React from 'react';
import Badge from '../../common/Badge/Badge';
import './RiskFlags.css';

export default function RiskFlags({
  flags = [],
  riskLevel = 'NORMAL',
  showIndividualFlags = true,
  size = 'sm'
}) {
  const isHighRisk = riskLevel === 'HIGH' || flags.length >= 2;

  return (
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
            <span key={flag} className="tl-risk-chip">
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
