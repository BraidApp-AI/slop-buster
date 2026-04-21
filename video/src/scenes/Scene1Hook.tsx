import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts } from "../theme";
import { Logo } from "../ui/Logo";

export const Scene1Hook: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 180 },
    durationInFrames: 20,
  });
  const titleY = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14 },
    durationInFrames: 22,
  });
  const tagY = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14 },
    durationInFrames: 22,
  });
  const outOpacity = interpolate(frame, [72, 88], [1, 0], {
    extrapolateRight: "clamp",
  });

  // Slow zoom on the footage for a subtle Ken Burns feel
  const footageScale = interpolate(frame, [0, 90], [1.05, 1.18]);
  const vignette = interpolate(frame, [0, 30], [1, 0.35]);

  return (
    <AbsoluteFill style={{ background: "#000", opacity: outOpacity }}>
      <AbsoluteFill
        style={{ transform: `scale(${footageScale})`, transformOrigin: "center" }}
      >
        <OffthreadVideo
          src={staticFile("hero-graveyard.mp4")}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(0.65) contrast(1.1) brightness(0.75)",
          }}
        />
      </AbsoluteFill>

      {/* Warm cream tint + vignette to bridge into the brutalist palette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(17,17,17,${vignette}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(242,240,232,0.2) 0%, rgba(17,17,17,0.1) 60%, rgba(17,17,17,0.4) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Text overlay */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: vertical ? 36 : 32,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.7))",
          }}
        >
          <Logo size={vertical ? 240 : 260} />
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: vertical ? 180 : 220,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
            color: theme.paper,
            margin: 0,
            transform: `translateY(${interpolate(titleY, [0, 1], [80, 0])}px)`,
            opacity: titleY,
            textShadow: "0 4px 40px rgba(0,0,0,0.8)",
          }}
        >
          SLOP-BUSTER
        </h1>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: vertical ? 44 : 54,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.chrome,
            transform: `translateY(${interpolate(tagY, [0, 1], [40, 0])}px)`,
            opacity: tagY,
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
          }}
        >
          sweep the vercel graveyard
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
