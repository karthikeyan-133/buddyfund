import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  textClassName?: string;
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'Friends Savings & Tour Ledger',
  className = '',
  textClassName = '',
  dark = false,
}) => {
  // Dimensions based on size prop
  const iconDimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-13 sm:h-13',
  }[size];

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Cute Aesthetic Icon Squircle */}
      <div
        className={`${iconDimensions} rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all duration-200 flex-shrink-0 relative overflow-hidden flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="logoHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>

          {/* Cute Glowing Coin Character */}
          <circle cx="50" cy="53" r="33" fill="url(#logoCoinGrad)" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="50" cy="53" r="27" fill="none" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="2.5 2.5" />

          {/* Happy Arc Eyes */}
          <path d="M 37 49 Q 41 43 45 49" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 55 49 Q 59 43 63 49" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Rosy Blushing Cheeks */}
          <ellipse cx="35" cy="55" rx="3.5" ry="2.2" fill="#FB7185" opacity="0.9" />
          <ellipse cx="65" cy="55" rx="3.5" ry="2.2" fill="#FB7185" opacity="0.9" />

          {/* Sweet Cute Smile */}
          <path d="M 47 55 Q 50 59 53 55" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Tiny Floating Heart */}
          <path
            d="M 50 37 C 50 34 47 32 45 34 C 43 32 40 34 40 37 C 40 40 45 44 45 44 C 45 44 50 40 50 37 Z"
            fill="url(#logoHeartGrad)"
            transform="translate(18, -2) scale(0.55)"
          />

          {/* Aesthetic Sparkles */}
          <path d="M 76 19 Q 78 23 82 25 Q 78 27 76 31 Q 74 27 70 25 Q 74 23 76 19 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M 22 72 Q 23.5 74.5 26.5 76 Q 23.5 77.5 22 80 Q 20.5 77.5 17.5 76 Q 20.5 74.5 22 72 Z" fill="#FEF08A" opacity="0.9" />
        </svg>
      </div>

      {/* Cute Aesthetic Typography */}
      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <div className="flex items-center gap-1.5 leading-tight">
            <span
              className={`font-extrabold tracking-tight font-cute ${titleSizes} flex items-center gap-1 ${
                dark ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}
            >
              Ithanu_njangal
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </span>
            <span
              className={`hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md shadow-xs border font-cute ${
                dark
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200/60'
              }`}
            >
              ✨ Squad
            </span>
          </div>
          {subtitle && (
            <p
              className={`text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 font-aesthetic ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
