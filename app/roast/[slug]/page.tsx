import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRoastBySlug, incrementViewCount, type FixTip } from "@/lib/db";
import { initials, avatarColor } from "@/lib/avatar";
import ShareButton from "./share-button";

type Props = { params: Promise<{ slug: string }> };

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const roast = await getRoastBySlug(slug).catch(() => null);
  if (!roast || roast.status !== "ready") return { title: "Roast not found" };

  return {
    title: `${roast.company_name} · ${roast.survival_score?.toFixed(1)}/10`,
    description: roast.absurd_prediction ?? "",
    openGraph: {
      title: `${roast.company_name} · ${roast.survival_score?.toFixed(1)}/10`,
      description: roast.absurd_prediction ?? "",
      images: [{ url: `${baseUrl()}/api/share-card/${slug}`, width: 1080, height: 1920 }],
      url: `${baseUrl()}/roast/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${roast.company_name} · ${roast.survival_score?.toFixed(1)}/10`,
      description: roast.absurd_prediction ?? "",
      images: [`${baseUrl()}/api/share-card/${slug}`],
    },
  };
}

export default async function RoastPage({ params }: Props) {
  const { slug } = await params;
  const roast = await getRoastBySlug(slug).catch(() => null);
  if (!roast) notFound();
  if (roast.status === "pending") redirect(`/roast/loading/${slug}`);
  if (roast.status === "failed") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-accent h-display text-3xl font-bold">generation failed</p>
        <Link href="/roast/new" className="btn-primary max-w-xs">try again</Link>
      </main>
    );
  }

  incrementViewCount(slug).catch(() => {});

  const tips: FixTip[] = Array.isArray(roast.fix_tips)
    ? roast.fix_tips
    : roast.fix_tips
    ? (JSON.parse(roast.fix_tips as unknown as string) as FixTip[])
    : [];

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto max-w-md w-full px-5 py-6 flex flex-col gap-5">

        <Link href="/" className="eyebrow hover:text-text">← back</Link>

        {/* Painting */}
        {roast.image_url && (
          <div className="relative rounded-2xl overflow-hidden aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={roast.image_url}
              alt={`Painting for ${roast.company_name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute left-3 bottom-3 pill text-sm">
              <span
                className="avatar"
                style={{ background: avatarColor(roast.founder_name), width: 22, height: 22, fontSize: 10 }}
              >
                {initials(roast.founder_name)}
              </span>
              <span className="font-medium">{roast.founder_name.split(" ")[0]}</span>
              <span className="text-text-mute">·</span>
              <span>{roast.company_name}</span>
            </div>
          </div>
        )}

        {/* Score + meme roast */}
        <header className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3 flex-wrap relative">
            <span className="score text-4xl font-bold tilt-l1 inline-block">
              {roast.survival_score?.toFixed(1)} / 10
            </span>
            <span className="hand text-2xl text-accent tilt-r2 select-none">← yikes</span>
            {roast.verdict_pill && (
              <span className="h-serif-italic text-text-soft text-lg w-full">
                {roast.verdict_pill}
              </span>
            )}
          </div>

          {roast.absurd_prediction && (
            <blockquote className="quote-bar h-serif-italic text-xl text-text">
              &ldquo;{roast.absurd_prediction}&rdquo;
            </blockquote>
          )}
        </header>

        {/* Survival tips — the actually useful part */}
        {tips.length > 0 && (
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-sm text-text-soft">
              if you somehow survive — here&apos;s what needs to change
            </h2>
            <ul className="flex flex-col gap-3">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className={`surface p-4 flex gap-3 ${i === 0 ? "tilt-l1" : i === 1 ? "tilt-r1" : "tilt-l1"}`}
                >
                  <span className="text-accent text-base leading-none mt-0.5 font-bold" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-base">
                      <span className="font-semibold">{tip.title}</span>{" "}
                      <span className="h-serif-italic text-text-soft">{tip.body}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-2">
          <ShareButton slug={roast.slug} />
          <Link href={`/hall?from=${roast.slug}`} className="btn-secondary">
            see hall of shame
          </Link>
          <Link href="/roast/new" className="text-center text-sm text-text-mute hover:text-text-soft mt-1">
            i have an even worse idea →
          </Link>
        </div>

        <p className="text-center text-xs text-text-mute pt-1">
          {roast.view_count + 1} views · {roast.share_count} share{roast.share_count === 1 ? "" : "s"}
        </p>
      </div>
    </main>
  );
}
