export function CryptographicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-[8%] top-0 h-[55vh] w-[55vw] rounded-full bg-onboarding-accent/8 blur-[100px]" />
      <div className="absolute top-[15%] right-[10%] h-[280px] w-[280px] rounded-full bg-[#1a2332]/40 blur-[80px]" />
      <div className="absolute bottom-[20%] left-[20%] h-[200px] w-[200px] rounded-full bg-[#1a2332]/30 blur-[60px]" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="absolute inset-0">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-px rounded-full bg-onboarding-accent/25"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${(i * 11.7) % 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
