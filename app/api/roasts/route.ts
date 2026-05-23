import { NextResponse } from "next/server";
import { listRecentRoasts, listWorstRoasts, countReadyRoasts } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const order = url.searchParams.get("order") ?? "recent";
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? "20")));
  const sinceParam = url.searchParams.get("since");
  const sinceHours = sinceParam ? Number(sinceParam) : null;
  const includeCount = url.searchParams.get("count") === "1";

  let rows;
  if (order === "worst") {
    rows = await listWorstRoasts(limit, sinceHours);
  } else {
    rows = await listRecentRoasts(limit);
  }

  if (includeCount) {
    const total = await countReadyRoasts();
    return NextResponse.json({ roasts: rows, total });
  }
  return NextResponse.json({ roasts: rows });
}
