export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
        letterSpacing: -Math.round(size * 0.03),
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-black font-bold leading-none text-white"
    >
      ih
    </span>
  );
}
