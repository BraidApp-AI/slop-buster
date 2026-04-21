"use client";

import { useState } from "react";
import type { ClassifiedProject } from "@/lib/types";
import { Stamp } from "./Stamp";

export function ProjectCard({
  item,
  accountSlug,
  onRequestDelete,
  deleting,
}: {
  item: ClassifiedProject;
  accountSlug: string | null;
  onRequestDelete: () => void;
  deleting: boolean;
}) {
  const days = item.daysSinceLastCommit;
  const visitors = item.traffic.visitors;
  const url = item.productionUrl;
  const [previewFailed, setPreviewFailed] = useState(false);

  const vercelDashboardUrl = accountSlug
    ? `https://vercel.com/${accountSlug}/${item.project.name}`
    : null;

  const previewSrc = item.latestDeploymentId
    ? `/api/preview?deploymentId=${encodeURIComponent(item.latestDeploymentId)}&w=720`
    : url
      ? `/api/preview?url=${encodeURIComponent(url)}`
      : null;

  return (
    <article
      className={`rule border flex flex-col bg-[color:var(--paper)] ${
        deleting ? "card-exit" : "fade-in"
      }`}
    >
      <div className="relative aspect-[16/10] border-b-[3px] border-[color:var(--ink)] bg-[color:var(--subtle)] overflow-hidden">
        {previewSrc && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={`preview of ${item.project.name}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 checker opacity-30" />
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-full">
          {item.verdict === "slop" ? (
            <Stamp status="danger">SLOP</Stamp>
          ) : item.verdict === "unknown" ? (
            <Stamp status="warn">UNKNOWN</Stamp>
          ) : (
            <Stamp status="ok">HEALTHY</Stamp>
          )}
          {days !== null ? <Stamp>{`${days}D STALE`}</Stamp> : null}
          <Stamp>{`${visitors} VISITORS`}</Stamp>
        </div>
        {item.traffic.source === "deployment-heuristic" ? (
          <div className="absolute bottom-2 right-2">
            <Stamp status="warn">HEURISTIC</Stamp>
          </div>
        ) : null}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="display text-xl font-bold truncate">
            {item.project.name}
          </h3>
          <span className="label text-[color:var(--muted)] shrink-0">
            {item.project.framework ?? "—"}
          </span>
        </div>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[color:var(--ink-soft)] underline underline-offset-2 decoration-[color:var(--ink)] decoration-2 truncate"
          >
            {url.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-xs text-[color:var(--muted)]">
            no production url
          </span>
        )}

        <div className="mt-3 text-xs leading-snug text-[color:var(--ink-soft)]">
          {item.reason}
        </div>

        <div className="mt-3 border-t-[3px] border-[color:var(--ink)] pt-3">
          <div className="label text-[color:var(--muted)] mb-1.5">
            env vars · {item.envVarCount}
          </div>
          <div className="flex flex-wrap gap-1">
            {item.envVarKeys.length === 0 ? (
              <span className="label text-[color:var(--muted)]">none</span>
            ) : (
              item.envVarKeys.slice(0, 8).map((k) => (
                <span key={k} className="chip">
                  {k}
                </span>
              ))
            )}
            {item.envVarKeys.length > 8 ? (
              <span className="label text-[color:var(--muted)]">
                +{item.envVarKeys.length - 8} more
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex gap-2 pt-3 border-t-[3px] border-[color:var(--ink)]">
          {url ? (
            <a
              className="ink-btn flex-1"
              href={url}
              target="_blank"
              rel="noreferrer"
              title="open the live url"
            >
              ↗ live
            </a>
          ) : null}
          {vercelDashboardUrl ? (
            <a
              className="ink-btn flex-1"
              href={vercelDashboardUrl}
              target="_blank"
              rel="noreferrer"
              title="inspect on vercel.com"
            >
              ▲ vercel
            </a>
          ) : null}
          <button
            onClick={onRequestDelete}
            disabled={deleting}
            className="ink-btn danger-btn flex-1"
          >
            {deleting ? "deleting…" : "✗ delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
