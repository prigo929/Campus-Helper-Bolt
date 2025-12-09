import React from 'react';

type LogoProps = {
  className?: string;
};

const Logo = ({ className = 'w-10 h-10' }: LogoProps) => {
  return (
    <div className={`${className} relative`}>
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
        role="img"
        aria-label="Military Helper logo"
      >
        <defs>
          <radialGradient id="mhRadial" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f7f0d8" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#d3b45c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#b73239" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="mhRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1df9c" />
            <stop offset="50%" stopColor="#caa35d" />
            <stop offset="100%" stopColor="#21476f" />
          </linearGradient>
          <linearGradient id="mhText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f7e6b0" />
            <stop offset="50%" stopColor="#e4c975" />
            <stop offset="100%" stopColor="#caa35d" />
          </linearGradient>
        </defs>
        <g>
          <circle cx="60" cy="60" r="58" fill="url(#mhRadial)" />
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth="2"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#mhRing)"
            strokeWidth="6"
            strokeLinecap="round"
            className="animate-[spin_10s_linear_infinite]"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="6 12"
            strokeLinecap="round"
            className="animate-[spin_6s_linear_infinite]"
          />
          <circle
            cx="60"
            cy="60"
            r="36"
            fill="rgba(255,255,255,0.16)"
            className="animate-ping"
          />
          <circle cx="60" cy="60" r="42" fill="rgba(11,15,24,0.38)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            fill="url(#mhText)"
            fontFamily="Rajdhani, var(--font-heading), sans-serif"
            fontWeight="900"
            fontSize="48"
            letterSpacing="6"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="1.8"
          >
            MH
          </text>
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20" />
    </div>
  );
};

export default Logo;
