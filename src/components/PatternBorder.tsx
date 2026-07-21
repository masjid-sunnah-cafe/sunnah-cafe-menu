export default function PatternBorder() {
  return (
    <div className="h-4 w-full border-b border-brand-dark/20" aria-hidden="true">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="woven" width="40" height="16" patternUnits="userSpaceOnUse">
            <rect width="40" height="16" fill="#1C120C" />
            <rect width="40" height="3" y="1" fill="#9A3A26" />
            <rect width="40" height="2" y="5" fill="#D9A752" />
            <rect width="40" height="3" y="8" fill="#425439" />
            <path d="M0 13 L5 15 L10 13 L15 15 L20 13 L25 15 L30 13 L35 15 L40 13" stroke="#D9A752" strokeWidth="1" fill="none" />
            <path d="M0 2 L5 4 L10 2 L15 4 L20 2 L25 4 L30 2 L35 4 L40 2" stroke="#1C120C" strokeWidth="1" fill="none" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#woven)" />
      </svg>
    </div>
  )
}
