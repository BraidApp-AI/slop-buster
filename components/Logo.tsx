export function Logo({
  size = 40,
  title = "slop-buster",
}: {
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className="shrink-0"
    >
      <title>{title}</title>
      <polygon
        points="20,9 33,31 7,31"
        fill="var(--ink)"
        stroke="var(--ink)"
        strokeLinejoin="miter"
        strokeWidth="1"
      />
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="none"
        stroke="var(--danger)"
        strokeWidth="4"
      />
      <line
        x1="7"
        y1="7"
        x2="33"
        y2="33"
        stroke="var(--danger)"
        strokeWidth="4"
        strokeLinecap="square"
      />
    </svg>
  );
}
