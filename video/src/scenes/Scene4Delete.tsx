import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";
import { MockCard } from "../ui/MockCard";

export const Scene4Delete: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 18 });
  const modalIn = spring({
    frame: frame - 26,
    fps,
    config: { damping: 16 },
    durationInFrames: 16,
  });
  const cursorX = interpolate(frame, [0, 38], [1400, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [0, 38], [900, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const click = frame >= 36 && frame <= 44 ? 1 : 0;

  const wipeStart = 100;
  const wiping = interpolate(frame, [wipeStart, wipeStart + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deleted = frame >= wipeStart + 18;

  const outOpacity = interpolate(frame, [135, 150], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: outOpacity,
      }}
    >
      <div
        style={{
          transform: `scale(${cardIn * 1.3})`,
          filter: modalIn > 0.3 ? "blur(6px)" : "none",
          opacity: 1 - modalIn * 0.5,
        }}
      >
        <MockCard
          name="v0-loan-origination"
          url="v0-loan-origination-system-3u.vercel.app"
          days={130}
          visitors={0}
          envVars={["OPENAI_API_KEY", "STRIPE_SECRET_KEY", "DATABASE_URL"]}
          deleted={deleted}
          deleting={wiping}
          scale={1.3}
        />
      </div>

      {modalIn > 0 ? (
        <div
          style={{
            position: "absolute",
            transform: `scale(${modalIn})`,
            width: 780,
            background: theme.paper,
            border: `6px solid ${theme.ink}`,
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              background: theme.danger,
              color: "#fff",
              borderBottom: `4px solid ${theme.ink}`,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "-0.01em",
            }}
          >
            DELETE FOREVER
          </div>
          <div style={{ padding: "28px 32px" }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 18,
                color: theme.muted,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              target
            </div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 52,
                color: theme.ink,
                marginTop: 4,
              }}
            >
              v0-loan-origination
            </div>
            <div
              style={{
                marginTop: 20,
                border: `3px solid ${theme.ink}`,
                padding: 18,
                fontFamily: fonts.mono,
                fontSize: 20,
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: theme.muted, fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                this removes
              </div>
              <div>✗ the vercel project</div>
              <div>✗ all deployments and preview urls</div>
              <div>✗ 3 environment variables</div>
              <div>✗ the production url</div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                style={{
                  padding: "12px 20px",
                  border: `3px solid ${theme.ink}`,
                  background: theme.paper,
                  color: theme.ink,
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: 16,
                }}
              >
                cancel
              </button>
              <button
                style={{
                  padding: "12px 20px",
                  border: `3px solid ${theme.ink}`,
                  color: "#fff",
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: 16,
                  backgroundImage: `repeating-linear-gradient(45deg, ${theme.danger}, ${theme.danger} 10px, ${theme.dangerDark} 10px, ${theme.dangerDark} 20px)`,
                  transform: frame >= 92 && frame <= 100 ? "translate(2px, 2px)" : "none",
                }}
              >
                delete forever
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Cursor x={cursorX} y={cursorY} click={click} />
    </AbsoluteFill>
  );
};

const Cursor: React.FC<{ x: number; y: number; click: number }> = ({ x, y, click }) => (
  <svg
    width={48}
    height={48}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${1 + click * 0.3})`,
      filter: `drop-shadow(0 0 0 ${theme.ink})`,
    }}
  >
    <path
      d="M2 2 L2 16 L6 12 L10 20 L13 19 L9 11 L15 11 Z"
      fill={theme.ink}
      stroke="#fff"
      strokeWidth={0.75}
    />
  </svg>
);
