import React from 'react';
import Button from '../Button/Button';
import './EmptyState.css';

export default function EmptyState({
  title = 'No items found',
  message = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  actionTo
}) {
  return (
    <div className="tl-empty-state">
      <div className="tl-empty-symbol" aria-hidden="true">—</div>
      <h3 className="tl-empty-title">{title}</h3>
      <p className="tl-empty-message">{message}</p>
      {(actionLabel && (onAction || actionTo)) && (
        <div className="tl-empty-action">
          <Button variant="secondary" size="sm" to={actionTo} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
