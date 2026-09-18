import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  return (
    <div className={`tl-loading-container tl-loading-${size}`} role="status" aria-live="polite">
      <div className="tl-loading-spinner" aria-hidden="true" />
      {message && <p className="tl-loading-message">{message}</p>}
    </div>
  );
}
