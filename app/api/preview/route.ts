import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const cache = new Map<string, { at: number; imageUrl: string | null }>();
const TTL = 1000 * 60 * 30;

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return Response.json({ ok: false, error: "missing url" }, { status: 400 });
  }
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ ok: false, error: "bad url" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return Response.json({ ok: false, error: "bad protocol" }, { status: 400 });
  }

  const cached = cache.get(target);
  if (cached && Date.now() - cached.at < TTL) {
    return Response.json({ ok: true, imageUrl: cached.imageUrl, source: "cache" });
  }

  const og = await scrapeOg(target).catch(() => null);
  if (og) {
    cache.set(target, { at: Date.now(), imageUrl: og });
    return Response.json({ ok: true, imageUrl: og, source: "og" });
  }

  const shot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=900&h=600`;
  cache.set(target, { at: Date.now(), imageUrl: shot });
  return Response.json({ ok: true, imageUrl: shot, source: "mshots" });
}

async function scrapeOg(url: string): Promise<string | null> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 6000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ac.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (slop-buster preview scraper) AppleWebKit/537.36 Chrome/118",
        accept: "text/html",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const head = html.slice(0, 32_000);
    const m =
      head.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i) ||
      head.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i) ||
      head.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      head.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (!m) return null;
    return new URL(m[1], url).toString();
  } finally {
    clearTimeout(t);
  }
}
