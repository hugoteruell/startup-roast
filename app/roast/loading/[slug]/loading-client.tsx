"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initials, avatarColor } from "@/lib/avatar";

type CycleItem = {
  slug: string;
  founder_name: string;
  company_name: string;
  what_it_does: string;
  survival_score: number;
  verdict_pill: string;
  absurd_prediction: string;
  image_url: string;
};

const ROTATE_MS = 4500;
const POLL_MS = 2500;

export default function LoadingClient({ slug, cycle }: { slug: string; cycle: CycleItem[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<"pending" | "ready" | "failed">("pending");

  // Cycle through past roasts
  useEffect(() => {
    if (cycle.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % cycle.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [cycle.length]);

  // Poll generation status
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/roast/${slug}`, { cache: "no-store" });
        if (!res.ok) throw new Error("poll failed");
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "ready") {
          setStatus("ready");
          router.push(`/roast/${slug}`);
          return;
        }
        if (data.status === "failed") {
          setStatus("failed");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, router]);

  const item = cycle[idx];

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto max-w-md w-full px-5 pt-5 pb-6 flex flex-col gap-5 flex-1">

        {/* Painting up top, big */}
        {item ? (
          <div className="rounded-2xl overflow-hidden crossfade-stack aspect-square">
            {cycle.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.slug}
                src={c.image_url}
                alt=""
                className={i === idx ? "active object-cover w-full h-full" : "object-cover w-full h-full"}
              />
            ))}
          </div>
        ) : (
          <div className="image-placeholder" />
        )}

        {item && (
          <section className="flex flex-col gap-3">
            <div className="eyebrow">Previously Roasted</div>
            <div className="flex items-center gap-3">
              <div
                className="avatar"
                style={{ background: avatarColor(item.founder_name) }}
              >
                {initials(item.founder_name)}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="text-sm font-medium truncate">{item.founder_name}</div>
                <div className="text-xs text-text-soft italic truncate">
                  &ldquo;{item.what_it_does}&rdquo;
                </div>
              </div>
            </div>

            <h2 className="h-display text-4xl mt-1 font-bold">{item.company_name}</h2>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="score text-2xl">{item.survival_score.toFixed(1)} / 10</span>
              {item.verdict_pill && (
                <span className="h-serif-italic text-text-soft text-base">
                  {item.verdict_pill}
                </span>
              )}
            </div>

            <blockquote className="quote-bar h-serif-italic text-base text-text mt-1">
              &ldquo;{item.absurd_prediction}&rdquo;
            </blockquote>
          </section>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <div className="eyebrow text-center">
            {status === "failed" ? "something broke. try again." : "almost done…"}
          </div>
          <div className="progress-bar">
            <div />
          </div>
          {cycle.length > 1 && (
            <div className="dots justify-center mx-auto">
              {cycle.slice(0, Math.min(cycle.length, 5)).map((_, i) => (
                <span key={i} className={i === idx % 5 ? "active" : ""} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
