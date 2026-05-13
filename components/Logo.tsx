export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="relative inline-flex shrink-0 items-center justify-center"
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft warm canvas tile */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="8"
          fill="var(--color-ink)"
        />
        {/* Lightbulb hint: filament loop atop a small base.
            Two arcs forming an idea-glyph that doubles as the "i" dot. */}
        <circle cx="16" cy="13.5" r="5.6" stroke="white" strokeWidth="1.8" fill="none" />
        <path
          d="M12.6 18.6 h6.8"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M13.4 21 h5.2"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Accent dot — the "spark" */}
        <circle cx="16" cy="8.2" r="1.4" fill="var(--color-accent)" />
      </svg>
    </span>
  );
}
