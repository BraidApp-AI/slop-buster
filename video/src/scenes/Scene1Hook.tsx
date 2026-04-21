import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";
import { Logo } from "../ui/Logo";

export const Scene1Hook: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 180 }, durationInFrames: 20 });
  const titleY = spring({ frame: frame - 8, fps, config: { damping: 14 }, durationInFrames: 22 });
  const tagY = spring({ frame: frame - 18, fps, config: { damping: 14 }, durationInFrames: 22 });
  const outOpacity = interpolate(frame, [72, 88], [1, 0], { extrapolateRight: "clamp" });
  const shakeX = frame < 12 ? 0 : Math.sin(frame * 0.4) * interpolate(frame, [12, 30, 60], [0, 4, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, opacity: outOpacity }}>
      <div style={{ transform: `scale(${logoScale}) translateX(${shakeX}px)` }}>
        <Logo size={vertical ? 300 : 320} />
      </div>
      <h1
        style={{
          fontFamily: fonts.display,
          fontSize: vertical ? 180 : 220,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 0.9,
          color: theme.ink,
          margin: 0,
          transform: `translateY(${interpolate(titleY, [0, 1], [80, 0])}px)`,
          opacity: titleY,
        }}
      >
        SLOP-BUSTER
      </h1>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: vertical ? 44 : 50,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: theme.muted,
          transform: `translateY(${interpolate(tagY, [0, 1], [40, 0])}px)`,
          opacity: tagY,
        }}
      >
        sweep the vercel graveyard
      </div>
    </AbsoluteFill>
  );
};
