import React from 'react';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="dexter-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--clerk-color-primary)" />
          <stop offset="1" stopColor="var(--clerk-color-primary)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Premium background shape */}
      <rect x="2" y="2" width="36" height="36" rx="10" className="fill-primary text-primary" fillOpacity="0.1" />
      
      {/* Geometric 'D' */}
      <path 
        d="M13 10H20C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30H13V10Z" 
        className="stroke-primary text-primary"
        strokeWidth="3.5"
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Inner Accent Line for "Premium" feel */}
      <path 
        d="M13 16H18C20.2091 16 22 17.7909 22 20C22 22.2091 20.2091 24 18 24H13" 
        className="stroke-primary text-primary opacity-50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};