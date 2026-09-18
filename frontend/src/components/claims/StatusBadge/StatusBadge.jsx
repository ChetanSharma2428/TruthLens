import React, { memo } from 'react';
import Badge from '../../common/Badge/Badge';
import './StatusBadge.css';

function StatusBadge({ status = 'UNVERIFIED', size = 'md', className = '' }) {
  const statusConfig = {
    VERIFIED_TRUE: {
      label: 'Verified True',
      variant: 'status-true'
    },
    FALSE: {
      label: 'False',
      variant: 'status-false'
    },
    MISLEADING: {
      label: 'Misleading',
      variant: 'status-misleading'
    },
    UNVERIFIED: {
      label: 'Unverified',
      variant: 'status-unverified'
    }
  };

  const current = statusConfig[status] || statusConfig.UNVERIFIED;

  return (
    <span className={`tl-status-badge-wrapper ${className}`}>
      <Badge variant={current.variant} size={size}>
        {current.label}
      </Badge>
    </span>
  );
}

export default memo(StatusBadge);
