/* eslint-disable */
// Seed example roasts into the DB so the loading carousel + hall of shame
// have real content. Run with: npx tsx scripts/seed.ts
//
// Posts to the running local server and polls until each is ready.

const BASE = process.env.SEED_BASE_URL ?? "http://localhost:3000";

const SAMPLES = [
  {
    founderName: "Luísa Ferreira",
    companyName: "GreenCart",
    whatItDoes:
      "Sustainable grocery delivery in the US. We plant a tree per order. Carbon-neutral fleet, subscription model, $9.99/month minimum.",
  },
  {
    founderName: "Rafael Nunes",
    companyName: "SnapLaw",
    whatItDoes:
      "AI legal assistant that auto-generates cease and desist letters for individuals. $19 per letter. Marketed to creators and small businesses.",
  },
  {
    founderName: "Ana Beatriz",
    companyName: "SleepCoach AI",
    whatItDoes:
      "AI-powered sleep coach that learns your patterns from your phone and sends you personalized sleep nudges. $14.99/month, B2C.",
  },
  {
    founderName: "Thiago Lima",
    companyName: "CryptoMilk",
    whatItDoes:
      "Tokenized cow ownership. Each $MILK token represents a fractional share of a US dairy cow. Yield comes from milk revenue paid in stablecoin.",
  },
  {
    founderName: "Camila Souza",
    companyName: "B2B Tinder",
    whatItDoes:
      "Tinder-style matching for B2B vendors and procurement teams. Swipe right on suppliers. Subscription for both sides. US enterprise focus.",
  },
  {
    founderName: "Pedro Alves",
    companyName: "MeetMatch",
    whatItDoes:
      "AI that joins your Zoom calls and rates how interested the other person is in real-time. $29/month per seat. Targeting US sales teams.",
  },
  {
    founderName: "Marli Santos",
    companyName: "FitBank",
    whatItDoes:
      "Neobank for gym-goers. Your debit card rewards are tied to your gym attendance. More workouts = better cashback. Available in 4 US states.",
  },
  {
    founderName: "Bruno Castro",
    companyName: "DriveBy Dental",
    whatItDoes:
      "Uber for dentists. Dentists subscribe monthly and we match them with patients on demand. We take 20%. Launching in Austin and Miami first.",
  },
];

async function postOne(s: typeof SAMPLES[number]): Promise<string> {
  const res = await fetch(`${BASE}/api/roast`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(s),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`POST failed for ${s.companyName}: ${JSON.stringify(data)}`);
  return data.slug as string;
}

async function poll(slug: string, label: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    const r = await fetch(`${BASE}/api/roast/${slug}`).then((r) => r.json());
    if (r.status === "ready") {
      console.log(`✓ ${label} ready — ${r.survival_score}/10 — "${r.verdict_pill}"`);
      return;
    }
    if (r.status === "failed") {
      console.error(`✗ ${label} failed`);
      return;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.warn(`! ${label} timed out`);
}

async function main() {
  console.log(`Seeding ${SAMPLES.length} roasts to ${BASE}…`);
  // Kick all off in parallel (server handles them concurrently via after())
  const pairs: Array<[string, string]> = [];
  for (const s of SAMPLES) {
    try {
      const slug = await postOne(s);
      pairs.push([slug, `${s.companyName} (${s.founderName})`]);
      console.log(`→ queued ${s.companyName} as ${slug}`);
      // Small gap so we don't slam the API at exactly the same instant
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`queue ${s.companyName} failed:`, err);
    }
  }

  // Now wait for all in parallel
  await Promise.all(pairs.map(([slug, label]) => poll(slug, label)));
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
