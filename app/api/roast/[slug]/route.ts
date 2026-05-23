import { NextResponse } from "next/server";
import { getRoastBySlug } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roast = await getRoastBySlug(slug).catch(() => null);
  if (!roast) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(roast);
}
