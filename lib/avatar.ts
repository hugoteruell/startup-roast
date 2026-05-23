const PALETTE = [
  "#c1342d", // blood
  "#a23a8e", // magenta
  "#3f7ad6", // royal blue
  "#1d8a6b", // emerald
  "#d4a44a", // gold
  "#7a4ad6", // violet
  "#d57f1d", // orange
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
}

export function avatarColor(name: string): string {
  return PALETTE[hash(name.trim().toLowerCase()) % PALETTE.length];
}
