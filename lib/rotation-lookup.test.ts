import { describe, expect, it } from "vitest";
import { rotationHintFor } from "./rotation-lookup";

describe("rotationHintFor", () => {
  it("exact match", () => {
    const h = rotationHintFor("OPENAI_API_KEY");
    expect(h.provider).toBe("OpenAI");
    expect(h.url).toContain("platform.openai.com");
    expect(h.known).toBe(true);
  });

  it("substring match", () => {
    const h = rotationHintFor("MY_OPENAI_API_KEY");
    expect(h.provider).toBe("OpenAI");
    expect(h.known).toBe(true);
  });

  it("unknown but looks like a secret", () => {
    const h = rotationHintFor("WEIRD_SERVICE_TOKEN");
    expect(h.known).toBe(false);
    expect(h.provider).toBe("Unknown provider");
    expect(h.url).toBeNull();
  });

  it("unknown and does not look like a secret", () => {
    const h = rotationHintFor("NEXT_PUBLIC_SITE_NAME");
    expect(h.known).toBe(false);
    expect(h.provider).toBe("Not a secret (probably)");
  });
});
