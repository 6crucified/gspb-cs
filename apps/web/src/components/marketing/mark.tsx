export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="currentColor" className="text-navy" />
      <path
        d="M7 8.5 10.2 12 7 15.5M13 15.5h4.5"
        fill="none"
        stroke="#1c1b18"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
