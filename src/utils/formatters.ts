export function formatFollowers(count: number): string {
  if (count >= 1_000_000_000) {
    return (count / 1_000_000_000).toFixed(1) + "B";
  }
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1) + "M";
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1) + "K";
  }
  return count.toLocaleString();
}

export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined || rate === null) return "N/A";
  // rate is a decimal like 0.0125 → "1.25%"
  return (rate * 100).toFixed(2) + "%";
}

export function formatCount(count: number | undefined): string {
  if (count === undefined || count === null) return "N/A";
  return formatFollowers(count);
}

export function formatNumber(count: number): string {
  return count.toLocaleString();
}
