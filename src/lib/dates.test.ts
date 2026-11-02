import { describe, expect, it } from 'vitest'
import { computeStreak, dayKey } from './dates'

const today = new Date(2026, 10, 2, 15, 0) // 2 Nov 2026, local time

describe('dayKey', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('computeStreak', () => {
  it('is 0 without activity', () => {
    expect(computeStreak([], today)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-11-02', '2026-11-01', '2026-10-31'], today)).toBe(3)
  })

  it('stays alive when the last activity was yesterday', () => {
    expect(computeStreak(['2026-11-01', '2026-10-31'], today)).toBe(2)
  })

  it('breaks on a gap', () => {
    expect(computeStreak(['2026-11-02', '2026-10-31', '2026-10-30'], today)).toBe(1)
    expect(computeStreak(['2026-10-31'], today)).toBe(0)
  })

  it('ignores duplicate days and crosses month boundaries', () => {
    expect(computeStreak(['2026-11-02', '2026-11-02', '2026-11-01', '2026-10-31', '2026-10-30'], today)).toBe(4)
  })
})
