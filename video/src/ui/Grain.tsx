import { AbsoluteFill } from "remotion";

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='400' height='400' filter='url(%23n)'/></svg>`;

export const Grain: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,${GRAIN_SVG}")`,
        backgroundSize: "400px 400px",
        mixBlendMode: "multiply",
        opacity: 0.8,
      }}
    />
  );
};
