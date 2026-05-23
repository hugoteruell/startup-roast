"use client";

import { useEffect, useState } from "react";

export default function HeroPainting({ images }: { images: { slug: string; url: string }[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="image-placeholder">
        <span className="text-sm">painting rotates here</span>
      </div>
    );
  }

  return (
    <div className="crossfade-stack rounded-2xl overflow-hidden aspect-square">
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.slug}
          src={img.url}
          alt=""
          className={i === idx ? "active object-cover w-full h-full" : "object-cover w-full h-full"}
        />
      ))}
    </div>
  );
}
