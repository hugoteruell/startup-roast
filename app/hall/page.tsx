import Link from "next/link";
import { listWorstRoasts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HallPage() {
  let rows = await listWorstRoasts(40, 24).catch(() => []);
  if (rows.length < 5) {
    rows = await listWorstRoasts(40).catch(() => []);
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto max-w-md w-full px-5 py-6 flex flex-col gap-5">

        <Link href="/" className="eyebrow hover:text-text">← back</Link>

        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="h-display text-4xl font-bold">hall of shame</h1>
            <p className="text-text-soft text-sm">today&apos;s most brutal verdicts</p>
          </div>
        </header>

        {rows.length === 0 ? (
          <div className="surface p-8 text-center text-text-soft">
            <p>nobody has been roasted yet today.</p>
            <p className="text-text-mute text-sm mt-1">be the first.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/roast/${r.slug}`}
                  className="surface p-3 flex gap-3 hover:border-border-hi transition-colors"
                >
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image_url}
                      alt=""
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 image-placeholder rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-text-soft truncate">{r.founder_name}</span>
                        <span className="font-semibold text-base truncate">{r.company_name}</span>
                      </div>
                    </div>
                    <span className="score text-lg">
                      {r.survival_score?.toFixed(1)} / 10
                    </span>
                    {r.absurd_prediction && (
                      <p className="h-serif-italic text-sm text-text-soft line-clamp-3">
                        &ldquo;{r.absurd_prediction}&rdquo;
                      </p>
                    )}
                    <div className="text-xs text-text-mute mt-0.5">
                      {r.share_count} share{r.share_count === 1 ? "" : "s"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-2">
          <Link href="/roast/new" className="btn-primary w-full">
            roast yours
          </Link>
        </div>
      </div>
    </main>
  );
}
