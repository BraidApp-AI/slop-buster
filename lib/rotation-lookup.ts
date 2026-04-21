import map from "./key-rotation-map.json";

type Entry = { provider: string; url: string | null };

const KNOWN = map as Record<string, Entry>;

export type RotationHint = {
  envKey: string;
  provider: string;
  url: string | null;
  known: boolean;
};

export function rotationHintFor(envKey: string): RotationHint {
  const exact = KNOWN[envKey];
  if (exact) {
    return { envKey, provider: exact.provider, url: exact.url, known: true };
  }
  const upper = envKey.toUpperCase();
  for (const [k, v] of Object.entries(KNOWN)) {
    if (upper.includes(k)) {
      return { envKey, provider: v.provider, url: v.url, known: true };
    }
  }
  const looksLikeSecret =
    /_KEY$|_SECRET$|_TOKEN$|_PASSWORD$|PRIVATE/i.test(envKey);
  return {
    envKey,
    provider: looksLikeSecret ? "Unknown provider" : "Not a secret (probably)",
    url: null,
    known: false,
  };
}
