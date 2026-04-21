import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";
import { Logo } from "../ui/Logo";
import { Chip } from "../ui/Chip";

export const Scene6CTA: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 18 });
  const cmdIn = spring({ frame: frame - 10, fps, config: { damping: 14 }, durationInFrames: 20 });
  const urlIn = spring({ frame: frame - 22, fps, config: { damping: 14 }, durationInFrames: 20 });

  const caret = Math.floor(frame / 18) % 2 === 0 ? "_" : " ";

  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div style={{ transform: `scale(${logoIn})` }}>
        <Logo size={vertical ? 220 : 200} />
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: vertical ? 140 : 160,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: theme.ink,
          lineHeight: 0.95,
          opacity: logoIn,
        }}
      >
        SLOP-BUSTER
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "20px 40px",
          background: theme.ink,
          color: theme.paper,
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: vertical ? 54 : 64,
          letterSpacing: "0.02em",
          opacity: cmdIn,
          transform: `translateY(${interpolate(cmdIn, [0, 1], [30, 0])}px)`,
        }}
      >
        <span style={{ color: theme.warn }}>$</span> npx slop-buster{caret}
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: urlIn,
          transform: `translateY(${interpolate(urlIn, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <Chip tone="warn" size={22} borderWidth={3}>OPEN SOURCE</Chip>
          <Chip size={22} borderWidth={3}>LOCAL ONLY</Chip>
          <Chip size={22} borderWidth={3}>MIT</Chip>
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: vertical ? 28 : 32,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: 12,
          }}
        >
          github.com/BraidApp-AI/slop-buster
        </div>
      </div>
    </AbsoluteFill>
  );
};
