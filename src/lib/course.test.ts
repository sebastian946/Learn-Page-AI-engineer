import { describe, expect, it } from 'vitest'
import { isModuleUnlocked, moduleProgress, nextLesson, overallProgress } from './course'
import type { ModuleMeta } from '../types'

const t = (s: string) => ({ en: s, es: s })
const mod = (id: string, order: number, slugs: string[]): ModuleMeta => ({
  id,
  order,
  days: 1,
  hours: 6,
  title: t(id),
  summary: t(id),
  repos: [],
  lessons: slugs.map((slug) => ({ slug, type: slug.includes('exam') ? 'exam' : 'concept', minutes: 10, title: t(slug) })),
})

const modules = [mod('m0', 0, ['01-a', '02-exam']), mod('m1', 1, ['01-b', '02-c', '03-exam']), mod('m2', 2, ['01-d'])]

describe('isModuleUnlocked', () => {
  const none = { examScores: {}, unlocked: {} }

  it('always unlocks the first module', () => {
    expect(isModuleUnlocked(modules, 0, none)).toBe(true)
  })

  it('locks a module until the previous exam reaches 70%', () => {
    expect(isModuleUnlocked(modules, 1, none)).toBe(false)
    expect(isModuleUnlocked(modules, 1, { ...none, examScores: { m0: { best: 69, last: 69, attempts: 1 } } })).toBe(false)
    expect(isModuleUnlocked(modules, 1, { ...none, examScores: { m0: { best: 70, last: 50, attempts: 2 } } })).toBe(true)
  })

  it('only looks at the immediately previous module', () => {
    const data = { examScores: { m0: { best: 100, last: 100, attempts: 1 } }, unlocked: {} }
    expect(isModuleUnlocked(modules, 2, data)).toBe(false)
  })

  it('honours a manual unlock', () => {
    expect(isModuleUnlocked(modules, 2, { examScores: {}, unlocked: { m2: true } })).toBe(true)
  })
})

describe('progress helpers', () => {
  const completed = { 'm0/01-a': '2026-11-01', 'm0/02-exam': '2026-11-01', 'm1/01-b': '2026-11-02' }

  it('computes per-module and overall progress', () => {
    expect(moduleProgress(modules[0], { completed })).toEqual({ done: 2, total: 2, percent: 100 })
    expect(moduleProgress(modules[1], { completed })).toEqual({ done: 1, total: 3, percent: 33 })
    expect(overallProgress(modules, { completed })).toEqual({ done: 3, total: 6, percent: 50 })
  })

  it('recommends the first incomplete lesson in course order', () => {
    expect(nextLesson(modules, { completed })?.lesson.slug).toBe('02-c')
    expect(nextLesson(modules, { completed: {} })?.lesson.slug).toBe('01-a')
  })

  it('returns null when everything is complete', () => {
    const all = Object.fromEntries(modules.flatMap((m) => m.lessons.map((l) => [`${m.id}/${l.slug}`, '2026-11-02'])))
    expect(nextLesson(modules, { completed: all })).toBeNull()
  })
})
