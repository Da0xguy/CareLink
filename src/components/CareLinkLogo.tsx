import React from 'react';

interface CareLinkIconProps {
  className?: string;
  size?: number | string;
}

export const CareLinkIcon: React.FC<CareLinkIconProps> = ({ 
  className = "w-8 h-8", 
  size 
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      style={style}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CareLink Logo Icon"
    >
      <defs>
        {/* Main Gradient for the Medical Cross */}
        <linearGradient id="careLinkCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Network Lines Gradient */}
        <linearGradient id="careLinkNetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Center Core Radial Glow */}
        <radialGradient id="careLinkCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="60%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filter */}
        <filter id="careLinkGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* --- Outer Network Web / Hexagon Lines --- */}
      <g stroke="url(#careLinkNetGrad)" strokeWidth="1.8" strokeOpacity="0.85" strokeLinecap="round">
        {/* Main Outer Hexagon */}
        <polygon points="100,16 172,58 172,142 100,184 28,142 28,58" />
        
        {/* Triangulating Interconnect Lines */}
        <line x1="28" y1="58" x2="48" y2="42" />
        <line x1="48" y1="42" x2="100" y2="16" />
        <line x1="100" y1="16" x2="152" y2="42" />
        <line x1="152" y1="42" x2="172" y2="58" />
        
        <line x1="172" y1="58" x2="178" y2="100" />
        <line x1="178" y1="100" x2="172" y2="142" />
        <line x1="172" y1="142" x2="152" y2="158" />
        <line x1="152" y1="158" x2="100" y2="184" />
        <line x1="100" y1="184" x2="48" y2="158" />
        <line x1="48" y1="158" x2="28" y2="142" />
        <line x1="28" y1="142" x2="22" y2="100" />
        <line x1="22" y1="100" x2="28" y2="58" />

        <line x1="48" y1="42" x2="38" y2="80" />
        <line x1="152" y1="42" x2="162" y2="80" />
        <line x1="152" y1="158" x2="162" y2="120" />
        <line x1="48" y1="158" x2="38" y2="120" />
      </g>

      {/* --- Outer Network Node Dots --- */}
      <g>
        <circle cx="100" cy="16" r="5" fill="#0284C7" />
        <circle cx="172" cy="58" r="5" fill="#06B6D4" />
        <circle cx="172" cy="142" r="5" fill="#10B981" />
        <circle cx="100" cy="184" r="5" fill="#10B981" />
        <circle cx="28" cy="142" r="5" fill="#0284C7" />
        <circle cx="28" cy="58" r="5" fill="#0284C7" />

        {/* Secondary Node Dots */}
        <circle cx="48" cy="42" r="4" fill="#0284C7" />
        <circle cx="152" cy="42" r="4" fill="#06B6D4" />
        <circle cx="178" cy="100" r="4" fill="#10B981" />
        <circle cx="152" cy="158" r="4" fill="#10B981" />
        <circle cx="48" cy="158" r="4" fill="#0284C7" />
        <circle cx="22" cy="100" r="4" fill="#0284C7" />
      </g>

      {/* --- Main Medical Cross Shape --- */}
      <g>
        {/* Vertical Arm */}
        <rect x="80" y="38" width="40" height="124" rx="14" fill="url(#careLinkCrossGrad)" />
        {/* Horizontal Arm */}
        <rect x="38" y="80" width="124" height="40" rx="14" fill="url(#careLinkCrossGrad)" />
        {/* Center Ring Junction */}
        <circle cx="100" cy="100" r="28" fill="url(#careLinkCrossGrad)" />
      </g>

      {/* --- Glowing Center Circle --- */}
      <circle cx="100" cy="100" r="22" fill="url(#careLinkCenterGlow)" />
      <circle cx="100" cy="100" r="16" fill="#FFFFFF" filter="url(#careLinkGlow)" />

      {/* --- Synchronized Heartbeat ECG Pulse Waveform --- */}
      <path 
        d="M 38 100 L 62 100 L 70 82 L 78 118 L 86 72 L 92 100 L 108 100 L 114 128 L 122 82 L 130 118 L 138 100 L 162 100" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

interface CareLinkLogoProps {
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const CareLinkLogo: React.FC<CareLinkLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = false,
  className = ""
}) => {
  // Size mappings
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14"
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
  };

  const subtitleSizes = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-xs"
  };

  // Text colors matching website styling (not copying graphic letter colors, per prompt instructions)
  const textColorClass = variant === 'dark' 
    ? 'text-white' 
    : variant === 'brand' 
      ? 'text-blue-600' 
      : 'text-slate-900';

  const subtitleColorClass = variant === 'dark' 
    ? 'text-slate-400' 
    : 'text-slate-500';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <CareLinkIcon className={`${iconSizes[size]} shrink-0`} />
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${titleSizes[size]} ${textColorClass}`}>
          CareLink
        </span>
        {showSubtitle && (
          <span className={`font-extrabold uppercase tracking-wider ${subtitleSizes[size]} ${subtitleColorClass} mt-0.5`}>
            National Digital Health
          </span>
        )}
      </div>
    </div>
  );
};

export default CareLinkLogo;
