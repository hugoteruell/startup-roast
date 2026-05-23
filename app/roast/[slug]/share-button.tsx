"use client";

import { useState } from "react";

export default function ShareButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const pageUrl = `${window.location.origin}/roast/${slug}`;

    // Track share (fire-and-forget)
    fetch(`/api/roast/${slug}/share`, { method: "POST" }).catch(() => {});

    // LinkedIn share intent — opens compose with our roast URL pre-filled.
    // LinkedIn fetches the OG meta (title, description, og:image = share card)
    // from the URL, so the preview already shows the painting + roast.
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
    window.location.href = linkedinUrl;
  }

  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn-primary">
      {busy ? "opening linkedin…" : "show to your enemies"}
    </button>
  );
}
