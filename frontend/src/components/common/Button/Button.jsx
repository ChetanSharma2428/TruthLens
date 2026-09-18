import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  to,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const classNames = `tl-btn tl-btn-${variant} tl-btn-${size} ${loading ? 'tl-btn-loading' : ''} ${className}`.trim();

  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classNames} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="tl-btn-spinner" aria-hidden="true" />}
      <span className="tl-btn-content">{children}</span>
    </button>
  );
}
