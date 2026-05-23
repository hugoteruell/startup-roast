import Link from "next/link";
import { listRecentRoasts, listWorstRoasts, countReadyRoasts } from "@/lib/db";
import HeroPainting from "./hero-painting";
import Ticker from "./ticker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [recent, worst, total] = await Promise.all([
    listRecentRoasts(12).catch(() => []),
    listWorstRoasts(20).catch(() => []),
    countReadyRoasts().catch(() => 1247),
  ]);

  const pool = Array.from(new Map([...recent, ...worst].map((r) => [r.slug, r])).values());
  const rotatingImages = pool.filter((r) => r.image_url).slice(0, 10);
  const tickerItems = pool.filter((r) => r.survival_score != null).slice(0, 20);

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 mx-auto max-w-md w-full px-5 py-6 flex flex-col">

        <div className="eyebrow">Startup Roast</div>

        <div className="flex-1 flex flex-col justify-center gap-6 py-6">
          <header className="flex flex-col gap-3">
            <h1 className="h-display text-[40px] sm:text-[44px] leading-[1.08] tracking-tight font-bold">
              tired of your mom saying it&apos;s a{" "}
              <span className="marker text-accent">great idea?</span>
            </h1>
            <p className="text-base text-text-soft leading-snug">
              drop your startup here. we&apos;ll give you an honest opinion — and a painting to remember it by.
            </p>
          </header>

          <HeroPainting images={rotatingImages.map((r) => ({ slug: r.slug, url: r.image_url! }))} />

          <div className="flex flex-col gap-2">
            <Link href="/roast/new" className="btn-primary">
              roast me
            </Link>
            <p className="text-center text-sm text-text-soft">
              {total.toLocaleString("en-US")} moms proven wrong today
            </p>
          </div>
        </div>

        {tickerItems.length > 0 && (
          <div className="overflow-hidden -mx-5 pt-2">
            <Ticker items={tickerItems.map((r) => ({
              slug: r.slug,
              company: r.company_name,
              founder: r.founder_name,
              score: r.survival_score!,
            }))} />
          </div>
        )}
      </div>
    </main>
  );
}
