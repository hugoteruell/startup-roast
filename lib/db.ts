import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL ?? "");

export type FixTip = { title: string; body: string };

export type RoastStatus = "pending" | "ready" | "failed";

export type Roast = {
  id: string;
  slug: string;
  founder_name: string;
  company_name: string;
  what_it_does: string;
  status: RoastStatus;
  survival_score: number | null;
  verdict_pill: string | null;
  absurd_prediction: string | null;
  fix_tips: FixTip[] | null;
  image_prompt: string | null;
  image_url: string | null;
  created_at: string;
  view_count: number;
  share_count: number;
};

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS roasts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      founder_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      what_it_does TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      survival_score REAL,
      verdict_pill TEXT,
      absurd_prediction TEXT,
      fix_tips JSONB,
      image_prompt TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      view_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0
    )
  `;
  // Make existing-deployment migrations idempotent
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready'`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS survival_score REAL`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS verdict_pill TEXT`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS fix_tips JSONB`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS founder_name TEXT`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS company_name TEXT`;
  await sql`ALTER TABLE roasts ADD COLUMN IF NOT EXISTS what_it_does TEXT`;
  await sql`ALTER TABLE roasts ALTER COLUMN startup_idea DROP NOT NULL`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_roasts_slug ON roasts(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_roasts_created_at ON roasts(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_roasts_score ON roasts(survival_score ASC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_roasts_status ON roasts(status)`;
}

export async function getRoastBySlug(slug: string): Promise<Roast | null> {
  const rows = (await sql`SELECT * FROM roasts WHERE slug = ${slug} LIMIT 1`) as Roast[];
  return rows[0] ?? null;
}

export async function listRecentRoasts(limit = 20): Promise<Roast[]> {
  return (await sql`
    SELECT * FROM roasts
    WHERE status = 'ready' AND image_url IS NOT NULL
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Roast[];
}

export async function listWorstRoasts(limit = 50, sinceHours: number | null = null): Promise<Roast[]> {
  if (sinceHours != null) {
    return (await sql`
      SELECT * FROM roasts
      WHERE status = 'ready' AND image_url IS NOT NULL
        AND survival_score IS NOT NULL
        AND created_at > NOW() - (${sinceHours} || ' hours')::interval
      ORDER BY survival_score ASC, created_at DESC
      LIMIT ${limit}
    `) as Roast[];
  }
  return (await sql`
    SELECT * FROM roasts
    WHERE status = 'ready' AND image_url IS NOT NULL
      AND survival_score IS NOT NULL
    ORDER BY survival_score ASC, created_at DESC
    LIMIT ${limit}
  `) as Roast[];
}

export async function countReadyRoasts(): Promise<number> {
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM roasts WHERE status = 'ready'`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function incrementViewCount(slug: string) {
  await sql`UPDATE roasts SET view_count = view_count + 1 WHERE slug = ${slug}`;
}

export async function incrementShareCount(slug: string) {
  await sql`UPDATE roasts SET share_count = share_count + 1 WHERE slug = ${slug}`;
}
