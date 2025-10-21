
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <svg
    className="w-16 h-16 text-brand-primary"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="currentColor"
      strokeWidth="8"
      strokeOpacity="0.3"
    />
    <path
      d="M50 10 A 40 40 0 0 1 90 50"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 50 50"
        to="360 50 50"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);
