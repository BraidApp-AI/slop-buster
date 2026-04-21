import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";
import { Chip } from "../ui/Chip";

const LEAKING_KEYS = [
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "STRIPE_SECRET_KEY",
  "DATABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CLERK_SECRET_KEY",
  "AWS_SECRET_ACCESS_KEY",
];

export const Scene2Problem: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineY = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 22 });
  const count = Math.floor(interpolate(frame, [6, 44], [0, 53], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const highlight = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: vertical ? 80 : 140, justifyContent: "center", gap: 60 }}>
      <div
        style={{
          opacity: headlineY,
          transform: `translateY(${interpolate(headlineY, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: vertical ? 36 : 44,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: theme.muted,
            marginBottom: 24,
          }}
        >
          the vercel graveyard, today
        </div>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: vertical ? 160 : 220,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: theme.ink,
            margin: 0,
          }}
        >
          <span style={{ color: theme.danger }}>{count}</span> abandoned
          <br />
          projects.
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          opacity: highlight,
          transform: `translateY(${interpolate(highlight, [0, 1], [24, 0])}px)`,
        }}
      >
        {LEAKING_KEYS.map((k, i) => {
          const appear = interpolate(frame, [50 + i * 4, 62 + i * 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={k}
              style={{
                opacity: appear,
                transform: `translateY(${interpolate(appear, [0, 1], [20, 0])}px)`,
              }}
            >
              <Chip tone={i < 2 ? "danger" : "default"} size={vertical ? 22 : 26} borderWidth={3}>
                {k}
              </Chip>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          fontFamily: fonts.mono,
          fontSize: vertical ? 38 : 48,
          color: theme.ink,
          lineHeight: 1.3,
          opacity: highlight,
        }}
      >
        Each one still holds <em style={{ background: theme.danger, color: "#fff", padding: "2px 10px" }}>live API keys.</em>
      </div>
    </AbsoluteFill>
  );
};
