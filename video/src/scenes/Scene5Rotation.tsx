import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";

const ITEMS = [
  { key: "OPENAI_API_KEY", provider: "OpenAI", url: "platform.openai.com/api-keys" },
  { key: "STRIPE_SECRET_KEY", provider: "Stripe", url: "dashboard.stripe.com/apikeys" },
  { key: "DATABASE_URL", provider: "Database", url: "rotate manually" },
];

export const Scene5Rotation: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({ frame, fps, config: { damping: 16 }, durationInFrames: 18 });
  const outOpacity = interpolate(frame, [75, 90], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: outOpacity,
        padding: 80,
      }}
    >
      <div
        style={{
          width: 820,
          border: `6px solid ${theme.ink}`,
          background: theme.subtle,
          transform: `scale(${interpolate(panelIn, [0, 1], [0.85, 1])})`,
          opacity: panelIn,
        }}
      >
        <div
          style={{
            padding: "22px 28px",
            background: theme.ink,
            color: theme.paper,
            borderBottom: `4px solid ${theme.ink}`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            ROTATE NOW
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 16,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme.chrome,
              marginTop: 6,
            }}
          >
            keys from deleted projects · check when rotated
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 16,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme.muted,
            }}
          >
            deleted
          </div>
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 36,
              fontWeight: 700,
              marginTop: 2,
              marginBottom: 18,
            }}
          >
            v0-loan-origination
          </div>

          {ITEMS.map((it, i) => {
            const appear = interpolate(frame, [18 + i * 6, 28 + i * 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const checked = frame >= 50 + i * 4;
            return (
              <div
                key={it.key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  marginBottom: 14,
                  opacity: appear,
                  transform: `translateY(${interpolate(appear, [0, 1], [20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: `4px solid ${theme.ink}`,
                    background: checked ? theme.ink : theme.paper,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.paper,
                    fontFamily: fonts.mono,
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {checked ? "×" : ""}
                </div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 22,
                    color: theme.ink,
                    textDecoration: checked ? "line-through" : "none",
                    opacity: checked ? 0.45 : 1,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{it.key}</div>
                  <div style={{ fontSize: 16, color: theme.inkSoft, marginTop: 2 }}>
                    {it.provider} — <span style={{ textDecoration: "underline" }}>rotate ↗ {it.url}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          fontFamily: fonts.mono,
          fontSize: vertical ? 36 : 44,
          color: theme.ink,
          textAlign: "center",
          opacity: panelIn,
        }}
      >
        When a project dies,
        <br />
        <strong>its keys should die with it.</strong>
      </div>
    </AbsoluteFill>
  );
};
