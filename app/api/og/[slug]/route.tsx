import { ImageResponse } from "next/og";
import { getRoastBySlug } from "@/lib/db";

export const runtime = "nodejs";

const flex = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  ...extra,
});

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roast = await getRoastBySlug(slug).catch(() => null);

  if (!roast) {
    return new ImageResponse(
      (
        <div style={flex({ width: "100%", height: "100%", background: "#09090b", color: "#fbbf24", alignItems: "center", justifyContent: "center", fontSize: 64 })}>
          Startup Roast
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    (
      <div style={flex({ width: "100%", height: "100%", background: "#09090b", color: "#fafafa" })}>
        <div style={flex({ flexDirection: "column", flex: 1, padding: 60, justifyContent: "space-between" })}>
          <div style={flex({ fontSize: 22, color: "#71717a", letterSpacing: 4, textTransform: "uppercase" })}>
            Startup Roast
          </div>
          <div style={flex({ flexDirection: "column", gap: 24 })}>
            <div style={flex({ flexDirection: "column", gap: 8 })}>
              <div style={flex({ fontSize: 28, color: "#71717a" })}>RIP</div>
              <div style={flex({ fontSize: 72, fontWeight: 800, color: "#fafafa", lineHeight: 1 })}>
                {roast.company_name}
              </div>
              <div style={flex({ fontSize: 22, color: "#71717a" })}>
                Founded by {roast.founder_name}
              </div>
            </div>
            <div style={flex({ fontSize: 30, color: "#d4d4d8", fontStyle: "italic", lineHeight: 1.3 })}>
              &ldquo;{roast.absurd_prediction}&rdquo;
            </div>
          </div>
          <div style={flex({ fontSize: 22, color: "#71717a" })}>Get yours roasted →</div>
        </div>
        {roast.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={roast.image_url}
            alt=""
            width={520}
            height={630}
            style={{ width: 520, height: 630, objectFit: "cover" }}
          />
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
