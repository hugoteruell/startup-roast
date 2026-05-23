import { ImageResponse } from "next/og";
import { getRoastBySlug, type FixTip } from "@/lib/db";
import { initials, avatarColor } from "@/lib/avatar";

export const runtime = "nodejs";

const W = 1080;
const H = 1920;

const BG = "#f5f0e8";
const SURFACE = "#ede5d3";
const BORDER = "#d8cdb7";
const TEXT = "#1a1612";
const TEXT_SOFT = "#5a4f44";
const ACCENT = "#d97757";

const flex = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  ...extra,
});

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roast = await getRoastBySlug(slug).catch(() => null);

  if (!roast || roast.status !== "ready") {
    return new ImageResponse(
      (
        <div style={flex({ width: "100%", height: "100%", background: BG, color: ACCENT, alignItems: "center", justifyContent: "center", fontSize: 80 })}>
          Startup Roast
        </div>
      ),
      { width: W, height: H },
    );
  }

  const tips: FixTip[] = Array.isArray(roast.fix_tips)
    ? roast.fix_tips
    : roast.fix_tips
    ? (JSON.parse(roast.fix_tips as unknown as string) as FixTip[])
    : [];

  const companyFontSize = roast.company_name.length > 16 ? 96 : 130;

  return new ImageResponse(
    (
      <div style={flex({
        width: "100%",
        height: "100%",
        background: BG,
        color: TEXT,
        flexDirection: "column",
        padding: 56,
        fontFamily: "Inter, system-ui, sans-serif",
      })}>

        {/* Top eyebrow */}
        <div style={flex({ justifyContent: "space-between", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: TEXT_SOFT })}>
          <div style={flex({})}>Startup Roast</div>
          <div style={flex({})}>{slug}</div>
        </div>

        {/* Painting */}
        {roast.image_url && (
          <div style={flex({ marginTop: 40, position: "relative", justifyContent: "center" })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={roast.image_url}
              alt=""
              width={968}
              height={968}
              style={{ width: 968, height: 968, objectFit: "cover", borderRadius: 28 }}
            />
            {/* Badge overlay */}
            <div style={flex({
              position: "absolute",
              left: 24,
              bottom: 24,
              background: SURFACE,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: BORDER,
              borderRadius: 999,
              padding: "12px 22px",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
            })}>
              <div style={flex({
                width: 36,
                height: 36,
                borderRadius: 999,
                background: avatarColor(roast.founder_name),
                color: "#fff",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
              })}>
                {initials(roast.founder_name)}
              </div>
              <span>{roast.founder_name.split(" ")[0]}</span>
              <span style={{ color: TEXT_SOFT }}>·</span>
              <span>{roast.company_name}</span>
            </div>
          </div>
        )}

        {/* Score + company */}
        <div style={flex({ marginTop: 40, flexDirection: "column", gap: 8 })}>
          <div style={flex({ alignItems: "baseline", gap: 18, flexWrap: "wrap" })}>
            <span style={{
              fontSize: 64,
              fontWeight: 900,
              color: ACCENT,
              lineHeight: 1,
            }}>
              {roast.survival_score?.toFixed(1)} / 10
            </span>
            {roast.verdict_pill && (
              <span style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 30,
                color: TEXT_SOFT,
              }}>
                {roast.verdict_pill}
              </span>
            )}
          </div>

          {/* Company name big */}
          <div style={{
            fontSize: companyFontSize,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 0.95,
            color: TEXT,
            marginTop: 8,
          }}>
            {roast.company_name}
          </div>
        </div>

        {/* Quote */}
        {roast.absurd_prediction && (
          <div style={flex({
            marginTop: 32,
            paddingLeft: 24,
            borderLeftWidth: 4,
            borderLeftStyle: "solid",
            borderLeftColor: ACCENT,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 36,
            lineHeight: 1.25,
            color: TEXT,
          })}>
            “{roast.absurd_prediction}”
          </div>
        )}

        {/* Tips preview (first one) */}
        {tips.length > 0 && (
          <div style={flex({
            marginTop: 32,
            background: SURFACE,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: BORDER,
            borderRadius: 18,
            padding: 24,
            gap: 16,
          })}>
            <div style={{ fontSize: 32, color: ACCENT, fontWeight: 700 }}>01</div>
            <div style={flex({ flexDirection: "column", gap: 4 })}>
              <span style={{ fontSize: 26, fontWeight: 700 }}>{tips[0].title}</span>
              <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24, color: TEXT_SOFT, lineHeight: 1.3 }}>
                {tips[0].body}
              </span>
            </div>
          </div>
        )}

        {/* CTA footer */}
        <div style={flex({
          marginTop: "auto",
          paddingTop: 28,
          borderTopWidth: 1,
          borderTopStyle: "solid",
          borderTopColor: BORDER,
          justifyContent: "space-between",
          alignItems: "center",
        })}>
          <div style={{ fontSize: 22, color: TEXT_SOFT, letterSpacing: 4, textTransform: "uppercase" }}>
            get roasted at
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: ACCENT }}>
            roast.beverlyhills
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
