# slop-buster

> Find and delete unmaintained Vercel projects before their API keys leak.

```
┌───────────────────────────────────────────────┐
│ SLOP-BUSTER · sweep the vercel graveyard     │
│                                               │
│  7 SLOP · 2 UNKNOWN · 23 HEALTHY              │
│                                               │
│  [SLOP 142d]  [SLOP 89d]   [SLOP 61d]         │
│  ai-dating-   todo-app-v7  saas-landing       │
│  coach        [DELETE]     [DELETE]           │
│  [DELETE]                                     │
└───────────────────────────────────────────────┘
```

Vibe-coding is cheap. Leaving abandoned Next.js demos on Vercel with live
`OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `DATABASE_URL` env vars is not. The
recent Vercel leak news made that concrete. slop-buster is a tiny local app
that finds those dead projects, shows you a live preview so memory kicks in
("oh yeah, that one"), then deletes them and hands you a checklist of keys
to rotate.

## Quickstart

```bash
npx slop-buster
```

That opens `http://localhost:4242`. Paste a
[Vercel API token](https://vercel.com/account/tokens?name=slop-buster&scope=full),
pick an account, and you're in. No signup, no cloud, nothing leaves your
laptop except requests to `api.vercel.com`.

## What it does

1. **Scans** every Vercel project on the token's account/team.
2. **Classifies** each one using two signals:
   - days since last production deployment (staleness)
   - monthly visitors — from Vercel Web Analytics if available, otherwise a
     deployment-activity heuristic (clearly labelled on each card).
3. **Shows** slop projects as a grid with live iframe previews of the actual
   deployed site. You see what you're about to delete.
4. **Deletes** on type-to-confirm. Removes env vars first, then the project.
5. **Generates** a per-project rotation checklist: OpenAI, Anthropic, Stripe,
   Supabase, Clerk, Resend, and ~25 others mapped to their rotation URLs.

## Default rule

A project is **SLOP** when:

- no commits in **30+ days**, AND
- **≤ 10 visitors** / 30d

Both thresholds are user-configurable (top-right `⚙ rules`) and persist to
`~/.slop-buster/config.json`.

## What it does NOT do

- It will not touch your GitHub repos.
- It will not rotate your OpenAI/Anthropic/Stripe keys — that still requires
  logging into each provider.
- It will not store your Vercel token anywhere but this laptop
  (`~/.slop-buster/config.json`, mode `0600`).
- It will not nag you with notifications, cron jobs, or telemetry.
- It does **not** support Railway, Netlify, or Cloudflare Pages in v1.

## Development

```bash
pnpm install
pnpm dev          # next dev on :4242
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
```

Project layout:

```
app/                 # Next.js 16 App Router
  api/
    vercel/
      validate      # POST  — exchange token for user/teams
      projects      # GET   — list + classify
      projects/[id] # DELETE — destroy project + env vars
    team            # POST  — pick team scope
    config          # GET/POST — user thresholds
components/          # brutalist UI (mono-only typography)
lib/
  vercel-client.ts   # REST wrapper
  classifier.ts      # pure, tested slop/healthy decision
  scan.ts            # orchestrates list + classify
  config-store.ts    # ~/.slop-buster/config.json
  key-rotation-map.json
bin/
  slop-buster.ts     # CLI bootstrap — starts Next, opens browser
```

## License

MIT © BraidApp-AI
