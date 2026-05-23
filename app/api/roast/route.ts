import { NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import { sql, ensureSchema } from "@/lib/db";
import { generateRoastText, generateRoastImage } from "@/lib/roast";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { founderName, companyName, whatItDoes } = (await req.json()) as {
      founderName?: string;
      companyName?: string;
      whatItDoes?: string;
    };

    const f = (founderName ?? "").trim();
    const c = (companyName ?? "").trim();
    const w = (whatItDoes ?? "").trim();

    if (!f || f.length < 2) return NextResponse.json({ error: "We need your name." }, { status: 400 });
    if (!c || c.length < 2) return NextResponse.json({ error: "What's the company called?" }, { status: 400 });
    if (!w || w.length < 10) return NextResponse.json({ error: "Tell us what it actually does." }, { status: 400 });
    if (f.length > 60 || c.length > 80 || w.length > 280) {
      return NextResponse.json({ error: "Too long. Keep it short." }, { status: 400 });
    }

    await ensureSchema();

    const id = nanoid();
    const slug = nanoid(6);

    // Insert pending row immediately so the loading screen has something to poll.
    await sql`
      INSERT INTO roasts (id, slug, founder_name, company_name, what_it_does, status)
      VALUES (${id}, ${slug}, ${f}, ${c}, ${w}, 'pending')
    `;

    // Run generation AFTER the response is sent (Vercel after()).
    after(async () => {
      try {
        const roast = await generateRoastText({ founderName: f, companyName: c, whatItDoes: w });
        const imageUrl = await generateRoastImage(roast.image_prompt);
        await sql`
          UPDATE roasts SET
            survival_score = ${roast.survival_score},
            verdict_pill = ${roast.verdict_pill},
            absurd_prediction = ${roast.absurd_prediction},
            fix_tips = ${JSON.stringify(roast.fix_tips)},
            image_prompt = ${roast.image_prompt},
            image_url = ${imageUrl},
            status = 'ready'
          WHERE slug = ${slug}
        `;
      } catch (err) {
        console.error("Roast generation failed for", slug, err);
        await sql`UPDATE roasts SET status = 'failed' WHERE slug = ${slug}`.catch(() => {});
      }
    });

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("POST /api/roast failed:", err);
    const msg = err instanceof Error ? err.message : "Something broke.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
