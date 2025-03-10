export function getHoursRemainingInYear(): number {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  const diffMs = endOfYear.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
} 