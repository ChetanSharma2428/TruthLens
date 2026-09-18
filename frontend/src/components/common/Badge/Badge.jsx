import React from 'react';
import './Badge.css';

export default function Badge({
  children,
  variant = 'neutral', // 'status-true' | 'status-false' | 'status-misleading' | 'status-unverified' | 'risk-high' | 'risk-normal' | 'neutral'
  size = 'md', // 'sm' | 'md'
  className = '',
  ...props
}) {
  return (
    <span className={`tl-badge tl-badge-${variant} tl-badge-${size} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
