export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "literally",
  "actually", "so", "right", "okay", "well", "kind of", "sort of",
];

export interface FillerWordCount {
  word: string;
  count: number;
}

export function countFillerWords(transcript: string): {
  total: number;
  breakdown: FillerWordCount[];
} {
  const lower = transcript.toLowerCase();
  const breakdown = FILLER_WORDS.map((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    return { word, count: matches ? matches.length : 0 };
  }).filter((w) => w.count > 0);

  const total = breakdown.reduce((sum, w) => sum + w.count, 0);
  return { total, breakdown };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function scoreGrade(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 85) return { label: "Executive", color: "#22D3A5", description: "Top 10% of communicators" };
  if (score >= 70) return { label: "Proficient", color: "#6C63FF", description: "Above industry average" };
  if (score >= 55) return { label: "Developing", color: "#F5A623", description: "On track for improvement" };
  return { label: "Emerging", color: "#FF5555", description: "Room for meaningful growth" };
}

// Executive baseline metrics for comparison
export const EXECUTIVE_BASELINE = {
  eyeContactPercent: 72,
  fillerWordsPerMinute: 1.2,
  confidenceScore: 83,
  fidgetLevel: 18,
};

export function generateShareToken(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
