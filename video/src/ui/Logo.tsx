import { theme } from "../theme";

export const Logo: React.FC<{ size?: number }> = ({ size = 160 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <polygon
        points="20,9 33,31 7,31"
        fill={theme.ink}
        stroke={theme.ink}
        strokeLinejoin="miter"
        strokeWidth={1}
      />
      <circle
        cx={20}
        cy={20}
        r={17}
        fill="none"
        stroke={theme.danger}
        strokeWidth={4}
      />
      <line
        x1={7}
        y1={7}
        x2={33}
        y2={33}
        stroke={theme.danger}
        strokeWidth={4}
        strokeLinecap="square"
      />
    </svg>
  );
};
