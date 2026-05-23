import { NextResponse } from "next/server";
import { incrementShareCount } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    await incrementShareCount(slug);
  } catch (err) {
    console.error(err);
  }
  return NextResponse.json({ ok: true });
}
