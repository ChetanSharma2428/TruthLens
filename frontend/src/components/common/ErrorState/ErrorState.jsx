import React from 'react';
import Button from '../Button/Button';
import './ErrorState.css';

export default function ErrorState({
  title = 'An error occurred',
  message = 'Unable to complete the requested action. Please try again.',
  onRetry,
  retryLabel = 'Try Again'
}) {
  return (
    <div className="tl-error-card" role="alert">
      <div className="tl-error-icon" aria-hidden="true">!</div>
      <div className="tl-error-body">
        <h3 className="tl-error-title">{title}</h3>
        <p className="tl-error-message">{message}</p>
        {onRetry && (
          <div className="tl-error-action">
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
