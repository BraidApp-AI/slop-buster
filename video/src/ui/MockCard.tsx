import { theme, fonts } from "../theme";
import { Chip } from "./Chip";

export const MockCard: React.FC<{
  name: string;
  url: string;
  days: number;
  visitors: number;
  envVars: string[];
  deleted?: boolean;
  deleting?: number;
  scale?: number;
}> = ({ name, url, days, visitors, envVars, deleted, deleting = 0, scale = 1 }) => {
  const exitScale = deleted ? 0 : 1 - deleting * 0.95;
  const exitOpacity = deleted ? 0 : 1 - deleting;
  return (
    <div
      style={{
        border: `4px solid ${theme.ink}`,
        background: theme.paper,
        display: "flex",
        flexDirection: "column",
        transform: `scaleX(${exitScale}) scale(${scale})`,
        transformOrigin: "left center",
        opacity: exitOpacity,
        width: 460,
      }}
    >
      {/* Preview placeholder */}
      <div
        style={{
          aspectRatio: "16 / 10",
          borderBottom: `4px solid ${theme.ink}`,
          background: theme.subtle,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FakeDashboard />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <Chip tone="danger" size={14} borderWidth={2}>
            SLOP
          </Chip>
          <Chip size={14} borderWidth={2}>{`${days}D STALE`}</Chip>
          <Chip size={14} borderWidth={2}>{`${visitors} VISITORS`}</Chip>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 32,
            fontWeight: 700,
            color: theme.ink,
            lineHeight: 1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            color: theme.inkSoft,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {url}
        </div>
        <div style={{ borderTop: `3px solid ${theme.ink}`, paddingTop: 8 }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme.muted,
              marginBottom: 6,
            }}
          >
            env vars · {envVars.length}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {envVars.slice(0, 5).map((v) => (
              <Chip key={v} size={11} borderWidth={2}>
                {v}
              </Chip>
            ))}
            {envVars.length > 5 ? (
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: theme.muted,
                  alignSelf: "center",
                }}
              >
                +{envVars.length - 5} more
              </span>
            ) : null}
          </div>
        </div>
        <div
          style={{ borderTop: `3px solid ${theme.ink}`, paddingTop: 10, display: "flex", gap: 8 }}
        >
          <BtnOutline>↗ live</BtnOutline>
          <BtnOutline>▲ vercel</BtnOutline>
          <BtnDanger>✗ delete</BtnDanger>
        </div>
      </div>
    </div>
  );
};

const BtnOutline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      flex: 1,
      textAlign: "center",
      padding: "10px 14px",
      border: `3px solid ${theme.ink}`,
      background: theme.paper,
      color: theme.ink,
      fontFamily: fonts.mono,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontSize: 14,
    }}
  >
    {children}
  </div>
);

const BtnDanger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      flex: 1,
      textAlign: "center",
      padding: "10px 14px",
      border: `3px solid ${theme.ink}`,
      color: "#fff",
      fontFamily: fonts.mono,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontSize: 14,
      backgroundImage: `repeating-linear-gradient(45deg, ${theme.danger}, ${theme.danger} 10px, ${theme.dangerDark} 10px, ${theme.dangerDark} 20px)`,
    }}
  >
    {children}
  </div>
);

const FakeDashboard: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(180deg, ${theme.chrome} 0%, ${theme.subtle} 100%)`,
      padding: 18,
      display: "grid",
      gridTemplateColumns: "80px 1fr",
      gap: 10,
    }}
  >
    <div
      style={{
        background: theme.ink,
        opacity: 0.15,
      }}
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 20, background: theme.ink, opacity: 0.25, width: "55%" }} />
      <div style={{ height: 12, background: theme.ink, opacity: 0.15, width: "80%" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 34, background: theme.ink, opacity: 0.12 }} />
        ))}
      </div>
      <div style={{ height: 68, background: theme.ink, opacity: 0.1, marginTop: 6 }} />
    </div>
  </div>
);
