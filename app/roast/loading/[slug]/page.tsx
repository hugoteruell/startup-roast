import { notFound } from "next/navigation";
import { getRoastBySlug, listWorstRoasts } from "@/lib/db";
import LoadingClient from "./loading-client";

export const dynamic = "force-dynamic";

export default async function LoadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = await getRoastBySlug(slug).catch(() => null);
  if (!target) notFound();

  // Past roasts to cycle through (excluding the in-flight one)
  const cycleRaw = await listWorstRoasts(50).catch(() => []);
  const cycle = cycleRaw
    .filter((r) => r.slug !== slug && r.image_url && r.absurd_prediction)
    .map((r) => ({
      slug: r.slug,
      founder_name: r.founder_name,
      company_name: r.company_name,
      what_it_does: r.what_it_does,
      survival_score: r.survival_score!,
      verdict_pill: r.verdict_pill ?? "",
      absurd_prediction: r.absurd_prediction ?? "",
      image_url: r.image_url!,
    }));

  return <LoadingClient slug={slug} cycle={cycle} />;
}
