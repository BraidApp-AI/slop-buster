import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, fonts } from "../theme";
import { MockCard } from "../ui/MockCard";
import { Logo } from "../ui/Logo";
import { Chip } from "../ui/Chip";

const CARDS = [
  {
    name: "excel-data-uploader",
    url: "excel-data-uploader-57wklyq3c.vercel.app",
    days: 300,
    visitors: 0,
    envVars: ["COS_BUCKET_NAME", "COS_REGION", "COS_SECRET_ID", "COS_SECRET_KEY", "DATABASE_URL"],
  },
  {
    name: "v0-crm-module",
    url: "v0-crm-module-specifications-qi9v0gwze.vercel.app",
    days: 278,
    visitors: 0,
    envVars: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "POSTGRES_URL",
      "POSTGRES_DATABASE",
      "POSTGRES_PASSWORD",
      "POSTGRES_HOST",
      "POSTGRES_PRISMA_URL",
      "POSTGRES_USER",
      "OPENAI_API_KEY",
    ],
  },
  {
    name: "admin-os",
    url: "admin-8rjntl0q1-adiwangs...vercel.app",
    days: 231,
    visitors: 0,
    envVars: ["DATABASE_URL", "DIRECT_URL"],
  },
  {
    name: "v0-leave-management",
    url: "v0-leave-management-system.vercel.app",
    days: 184,
    visitors: 0,
    envVars: ["ANTHROPIC_API_KEY", "RESEND_API_KEY"],
  },
  {
    name: "v0-loan-origination",
    url: "v0-loan-origination-system-3u.vercel.app",
    days: 130,
    visitors: 0,
    envVars: [],
  },
  {
    name: "v0-tvri-enhancer",
    url: "v0-tvri-video-enchancer.vercel.app",
    days: 97,
    visitors: 0,
    envVars: ["REPLICATE_API_TOKEN", "OPENAI_API_KEY"],
  },
];

export const Scene3Dashboard: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const topIn = spring({ frame, fps, config: { damping: 16 }, durationInFrames: 20 });
  const out = interpolate(frame, [110, 120], [0, 1], { extrapolateRight: "clamp" });
  const scroll = interpolate(frame, [40, 115], [0, 140], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, opacity: 1 - out }}>
      {/* Top chrome */}
      <div
        style={{
          borderBottom: `4px solid ${theme.ink}`,
          display: "flex",
          alignItems: "center",
          padding: "24px 36px",
          gap: 24,
          transform: `translateY(${interpolate(topIn, [0, 1], [-120, 0])}px)`,
        }}
      >
        <Logo size={64} />
        <div>
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: theme.ink,
              lineHeight: 1,
            }}
          >
            SLOP-BUSTER
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              color: theme.muted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            53 slop · 5 unknown · 18 healthy
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginLeft: 40 }}>
          <Chip tone="warn" size={20} borderWidth={3}>LOCAL ONLY</Chip>
          <Chip size={20} borderWidth={3}>NO TELEMETRY</Chip>
          <Chip size={20} borderWidth={3}>MIT</Chip>
        </div>
      </div>

      {/* Sub-header */}
      <div
        style={{
          borderBottom: `4px solid ${theme.ink}`,
          display: "flex",
          alignItems: "center",
          padding: "14px 36px",
          gap: 14,
        }}
      >
        <TabButton active label="slop · 53" tone="danger" />
        <TabButton label="unknown · 5" />
        <TabButton label="healthy · 18" />
        <TabButton label="all · 76" />
        <div style={{ flex: 1 }} />
        <Chip size={20} borderWidth={3}>RULE</Chip>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 20,
            color: theme.ink,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          stale &gt; 30d · visitors ≤ 10
        </span>
      </div>

      {/* Cards grid */}
      <div
        style={{
          flex: 1,
          padding: 36,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          transform: `translateY(${-scroll}px)`,
        }}
      >
        {CARDS.map((c, i) => {
          const inAt = 14 + i * 4;
          const s = spring({
            frame: frame - inAt,
            fps,
            config: { damping: 14 },
            durationInFrames: 20,
          });
          return (
            <div
              key={c.name}
              style={{
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
              }}
            >
              <MockCard {...c} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TabButton: React.FC<{ label: string; active?: boolean; tone?: "danger" }> = ({
  label,
  active,
  tone,
}) => (
  <div
    style={{
      padding: "10px 18px",
      border: `3px solid ${theme.ink}`,
      background: active ? (tone === "danger" ? theme.danger : theme.ink) : theme.paper,
      color: active ? "#fff" : theme.ink,
      opacity: active ? 1 : 0.6,
      fontFamily: fonts.mono,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontSize: 18,
    }}
  >
    {label}
  </div>
);
