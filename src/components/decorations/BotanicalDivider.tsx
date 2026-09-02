interface BotanicalDividerProps {
  className?: string;
}

export function BotanicalDivider({ className = "" }: BotanicalDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`reveal flex items-center justify-center gap-4 py-8 text-taupe/40 ${className}`}
    >
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-taupe/30 sm:w-28" />

      {/* Symmetrical delicate olive/botanical laurel flourish */}
      <svg
        width="80"
        height="24"
        viewBox="0 0 80 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-sage/80"
      >
        {/* Left Laurel Branch */}
        <path
          d="M38 12C32 11.5 24 13 14 16"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Left Leaves */}
        <path
          d="M20 14.5C18.5 12 19 9.5 22 10.5C24 11.2 23 13.8 20 14.5Z"
          fill="currentColor"
          fillOpacity="0.45"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M27 13C26 10.2 27.5 8 30.5 9.2C32.2 10 30.5 12.5 27 13Z"
          fill="currentColor"
          fillOpacity="0.5"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M34 12C34.5 9 37 7.5 39 9C40.5 10.2 38 12 34 12Z"
          fill="currentColor"
          fillOpacity="0.4"
          stroke="currentColor"
          strokeWidth="0.5"
        />

        {/* Center Bud / Pearl Accent */}
        <circle cx="40" cy="12" r="2" fill="#c0a46b" fillOpacity="0.85" />
        <circle cx="40" cy="12" r="4" stroke="#c0a46b" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Right Laurel Branch */}
        <path
          d="M42 12C48 11.5 56 13 66 16"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Right Leaves */}
        <path
          d="M60 14.5C61.5 12 61 9.5 58 10.5C56 11.2 57 13.8 60 14.5Z"
          fill="currentColor"
          fillOpacity="0.45"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M53 13C54 10.2 52.5 8 49.5 9.2C47.8 10 49.5 12.5 53 13Z"
          fill="currentColor"
          fillOpacity="0.5"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M46 12C45.5 9 43 7.5 41 9C39.5 10.2 42 12 46 12Z"
          fill="currentColor"
          fillOpacity="0.4"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>

      <div className="h-px w-16 bg-gradient-to-l from-transparent to-taupe/30 sm:w-28" />
    </div>
  );
}
