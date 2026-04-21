import { NextRequest } from "next/server";
import { readConfig } from "@/lib/config-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deploymentId = req.nextUrl.searchParams.get("deploymentId");
  const target = req.nextUrl.searchParams.get("url");
  const width = req.nextUrl.searchParams.get("w") ?? "720";

  if (deploymentId) {
    const cfg = await readConfig();
    if (cfg.token) {
      const res = await fetch(
        `https://vercel.com/api/screenshot?deploymentId=${encodeURIComponent(deploymentId)}&width=${encodeURIComponent(width)}`,
        {
          headers: { Authorization: `Bearer ${cfg.token}` },
          cache: "no-store",
        },
      ).catch(() => null);
      if (res && res.ok && res.body) {
        return new Response(res.body, {
          status: 200,
          headers: {
            "content-type": res.headers.get("content-type") ?? "image/jpeg",
            "cache-control": "public, max-age=3600",
          },
        });
      }
    }
  }

  if (target) {
    try {
      const parsed = new URL(target);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        const og = await scrapeOg(target).catch(() => null);
        if (og) return Response.redirect(og, 302);
        return Response.redirect(
          `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=900&h=600`,
          302,
        );
      }
    } catch {}
  }

  return Response.json({ ok: false, error: "no preview" }, { status: 404 });
}

async function scrapeOg(url: string): Promise<string | null> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 5000);
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
      head.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i);
    if (!m) return null;
    return new URL(m[1], url).toString();
  } finally {
    clearTimeout(t);
  }
}
