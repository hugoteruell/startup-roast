import Link from "next/link";

type Item = { slug: string; company: string; founder: string; score: number };

function TickerItem({ item }: { item: Item }) {
  return (
    <Link
      href={`/roast/${item.slug}`}
      className="pill text-sm whitespace-nowrap hover:border-border-hi"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blood" />
      <span className="font-medium">{item.company}</span>
      <span className="text-text-mute">·</span>
      <span className="text-text-soft">{item.founder.split(" ")[0]}</span>
      <span className="text-blood font-bold tabular-nums">{item.score.toFixed(1)}</span>
    </Link>
  );
}

export default function Ticker({ items }: { items: Item[] }) {
  // Duplicate so the marquee loop is seamless
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className="ticker-row">
        {doubled.map((item, i) => (
          <TickerItem key={`${item.slug}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
