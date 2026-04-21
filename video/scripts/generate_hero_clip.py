#!/usr/bin/env python3
"""
Generate a short hero B-roll clip via ByteDance ARK (Seedance).
Requires ARK_API_KEY and ARK_VIDEO_MODEL in env.

Saves the clip to ./out/hero-graveyard.mp4.
"""
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ARK_API_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3"


def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def ark(key: str, method: str, path: str, data=None) -> dict:
    req = urllib.request.Request(
        ARK_API_BASE + path,
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        data=json.dumps(data).encode() if data else None,
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())


def main() -> int:
    env_src = Path(os.environ.get("ARK_ENV_FILE") or (Path.home() / "Code/ai-companion-video-maker/.env"))
    env = load_env(env_src)
    api_key = os.environ.get("ARK_API_KEY") or env.get("ARK_API_KEY")
    model = os.environ.get("ARK_VIDEO_MODEL") or env.get("ARK_VIDEO_MODEL")
    if not api_key or not model:
        print(f"error: missing ARK_API_KEY or ARK_VIDEO_MODEL (checked env and {env_src})", file=sys.stderr)
        return 1

    prompt = (
        "A vast, dim server room at dusk. Hundreds of neglected rack-mounted servers "
        "glow faintly; tiny holographic text labels — OPENAI_API_KEY, STRIPE_SECRET_KEY, "
        "DATABASE_URL — float above them like dust motes, slowly fading. Cinematic, "
        "slow camera push-in, moody warm backlight cutting through dust, "
        "brutalist industrial typography stencilled on metal shelves. "
        "Muted palette: paper cream, ink black, with a single red neon warning "
        "light pulsing in the distance. No humans, no logos. 16:9, 5 seconds."
    )

    print("→ submitting generation task…", file=sys.stderr)
    out_dir = Path(__file__).resolve().parent.parent / "out"
    out_dir.mkdir(exist_ok=True)
    task = ark(
        api_key,
        "POST",
        "/contents/generations/tasks",
        {
            "model": model,
            "content": [{"type": "text", "text": prompt + " --rs 1080p --rt 16:9 --dur 5"}],
        },
    )
    task_id = task.get("id")
    if not task_id:
        print("error: no task id returned", task, file=sys.stderr)
        return 1
    print(f"  task id: {task_id}", file=sys.stderr)

    # Poll
    for i in range(120):
        time.sleep(5)
        status = ark(api_key, "GET", f"/contents/generations/tasks/{task_id}")
        s = status.get("status")
        print(f"  [{i*5:>4}s] status={s}", file=sys.stderr)
        if s == "succeeded":
            video_url = (status.get("content") or {}).get("video_url") or status.get("result", {}).get("video_url")
            if not video_url:
                # Some variants use a different shape
                print(json.dumps(status, indent=2), file=sys.stderr)
                return 1
            print(f"→ downloading {video_url}", file=sys.stderr)
            dest = out_dir / "hero-graveyard.mp4"
            urllib.request.urlretrieve(video_url, dest)
            print(f"saved: {dest}")
            return 0
        if s == "failed":
            print("failed:", status, file=sys.stderr)
            return 1
    print("timed out", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
