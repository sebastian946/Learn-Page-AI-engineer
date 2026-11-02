/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Consecutive days with at least one completed lesson, ending today.
 * If today has no activity yet, the streak is still alive when yesterday had activity.
 */
export function computeStreak(days: Iterable<string>, today: Date = new Date()): number {
  const set = new Set(days)
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
