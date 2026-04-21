import { theme } from "../theme";

type Tone = "default" | "danger" | "warn" | "ok";

const toneBg: Record<Tone, string> = {
  default: theme.paper,
  danger: theme.danger,
  warn: theme.warn,
  ok: theme.ok,
};

const toneFg: Record<Tone, string> = {
  default: theme.ink,
  danger: "#fff",
  warn: theme.ink,
  ok: theme.paper,
};

export const Chip: React.FC<{
  children: React.ReactNode;
  tone?: Tone;
  size?: number;
  borderWidth?: number;
}> = ({ children, tone = "default", size = 18, borderWidth = 3 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: `${Math.round(size * 0.3)}px ${Math.round(size * 0.6)}px`,
      border: `${borderWidth}px solid ${theme.ink}`,
      background: toneBg[tone],
      color: toneFg[tone],
      fontFamily: `"JetBrains Mono", ui-monospace, monospace`,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);
