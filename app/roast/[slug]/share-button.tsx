"use client";

import { useState } from "react";

export default function ShareButton({ slug, text }: { slug: string; text: string }) {
  const [busy, setBusy] = useState(false);

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/roast/${slug}` : "";
  const shareCardUrl = typeof window !== "undefined" ? `${window.location.origin}/api/share-card/${slug}` : "";

  function track() {
    fetch(`/api/roast/${slug}/share`, { method: "POST" }).catch(() => {});
  }

  async function onClick() {
    setBusy(true);
    track();
    try {
      // Try native share with the image file (mobile: IG / LinkedIn / WhatsApp etc)
      const res = await fetch(shareCardUrl);
      const blob = await res.blob();
      const file = new File([blob], `${slug}-roast.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url: pageUrl });
        return;
      }
      // Desktop fallback: open LinkedIn share intent + download the card
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-roast.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn-primary">
      {busy ? "preparing…" : "show to your enemies"}
    </button>
  );
}
