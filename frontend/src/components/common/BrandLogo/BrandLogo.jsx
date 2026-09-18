import React from 'react';
import './BrandLogo.css';

export default function BrandLogo({ size = 38, showText = true, className = '', badge = true }) {
  return (
    <div className={`tl-brand-logo-wrap ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="tl-brand-logo-svg"
        aria-label="TruthLens Brand Logo"
      >
        <defs>
          <linearGradient id="tlBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1e3f" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="tlBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0066ff" />
          </linearGradient>
          <linearGradient id="tlLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <filter id="tlShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {badge && (
          <>
            {/* Modern Rounded Square Badge */}
            <rect width="48" height="48" rx="10" fill="url(#tlBgGrad)" />
            <rect
              x="0.75"
              y="0.75"
              width="46.5"
              height="46.5"
              rx="9.25"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* Pixel accents from Image 1 logo */}
        <rect x="7" y="10" width="3" height="3" rx="0.5" fill="#38bdf8" />
        <rect x="11" y="7" width="3" height="3" rx="0.5" fill="#38bdf8" />

        {/* Stylized T in pure white */}
        <path
          d="M11 11H27V16.5H21.5V34H15V16.5H11V11Z"
          fill="#ffffff"
        />

        {/* Stylized L in vibrant electric blue gradient */}
        <path
          d="M21.5 17H27V29.5H35V34H21.5V17Z"
          fill="url(#tlBlueGrad)"
        />

        {/* Magnifying Glass with Checkmark (official emblem) */}
        <g filter="url(#tlShadow)">
          {/* Handle */}
          <path
            d="M38 31.5L43.5 37"
            stroke="#0b1e3f"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Lens Glass Circle */}
          <circle
            cx="32.5"
            cy="26"
            r="8.5"
            fill="url(#tlLensGrad)"
            stroke="#0066ff"
            strokeWidth="2.2"
          />
          {/* Vibrant Verification Checkmark */}
          <path
            d="M29.5 26L31.8 28.3L36 23.5"
            stroke="#0066ff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {showText && (
        <div className="tl-brand-text-col">
          <span className="tl-brand-title">
            Truth<span className="tl-brand-highlight">Lens</span>
          </span>
          <span className="tl-brand-subtag">FACTS OVER FEAR</span>
        </div>
      )}
    </div>
  );
}
