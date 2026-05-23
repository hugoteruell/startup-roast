"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX = 280;

export default function RoastForm() {
  const router = useRouter();
  const [founderName, setFounderName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ founderName, companyName, whatItDoes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something broke.");
      router.push(`/roast/loading/${data.slug}`);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something broke.");
    }
  }

  const ready =
    founderName.trim().length >= 2 &&
    companyName.trim().length >= 2 &&
    whatItDoes.trim().length >= 10;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 relative">
        <span className="text-sm text-text-soft">your name <span className="text-text-mute">(for the tombstone)</span></span>
        <span className="hand text-xl text-accent tilt-l1 absolute -top-5 right-0 select-none pointer-events-none">
          yes, the real one ↓
        </span>
        <input
          value={founderName}
          onChange={(e) => setFounderName(e.target.value)}
          maxLength={60}
          required
          disabled={submitting}
          placeholder="João Silva"
          className="input"
          autoFocus
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-text-soft">startup name</span>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          maxLength={80}
          required
          disabled={submitting}
          placeholder="FreelanceHub"
          className="input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-text-soft">
          what does this thing do? <span className="text-text-mute">(be honest, we won&apos;t tell anyone)</span>
        </span>
        <textarea
          value={whatItDoes}
          onChange={(e) => setWhatItDoes(e.target.value.slice(0, MAX))}
          maxLength={MAX}
          rows={6}
          required
          disabled={submitting}
          placeholder="we're building an AI-powered B2B marketplace that connects micro-entrepreneurs with enterprise clients through a subscription model with network effects…"
          className="input resize-none italic"
        />
        <div className="flex justify-end text-xs text-text-mute tabular-nums">
          {whatItDoes.length} / {MAX}
        </div>
      </label>

      <button type="submit" disabled={submitting || !ready} className="btn-primary">
        {submitting ? "submitting…" : "i'm ready for the worst"}
      </button>

      {error && <p className="text-sm text-accent">{error}</p>}
    </form>
  );
}
