import { beforeEach, describe, expect, it } from 'vitest'
import { initialData, parseExport, STORAGE_KEY, useProgress } from './progress'

const state = () => useProgress.getState()

beforeEach(() => {
  localStorage.clear()
  useProgress.setState(initialData)
})

describe('lesson completion', () => {
  it('marks a lesson complete with the local day and keeps the first date', () => {
    state().markComplete('m1/01-tokens', new Date(2026, 10, 1))
    state().markComplete('m1/01-tokens', new Date(2026, 10, 2))
    expect(state().completed).toEqual({ 'm1/01-tokens': '2026-11-01' })
  })

  it('marks a lesson incomplete', () => {
    state().markComplete('m1/01-tokens')
    state().markIncomplete('m1/01-tokens')
    expect(state().completed).toEqual({})
  })
})

describe('exam scores', () => {
  it('keeps the best score, the last score and the attempt count', () => {
    state().recordExam('m1', 60)
    state().recordExam('m1', 85)
    state().recordExam('m1', 70)
    expect(state().examScores.m1).toEqual({ best: 85, last: 70, attempts: 3 })
  })
})

describe('checklists, unlocks and repos', () => {
  it('toggles checklist items independently', () => {
    state().toggleChecklistItem('m1-05-review', 0)
    state().toggleChecklistItem('m1-05-review', 2)
    state().toggleChecklistItem('m1-05-review', 0)
    expect(state().checklists['m1-05-review']).toEqual({ 0: false, 2: true })
  })

  it('stores manual unlocks and repo URLs', () => {
    state().unlockModule('m3')
    state().setRepoUrl('m1-llm-client', 'https://github.com/me/llm-provider-client')
    expect(state().unlocked).toEqual({ m3: true })
    expect(state().repoUrls['m1-llm-client']).toBe('https://github.com/me/llm-provider-client')
  })
})

describe('preferences', () => {
  it('switches locale and theme', () => {
    state().setLocale('es')
    state().toggleTheme()
    expect(state().locale).toBe('es')
    expect(state().theme).toBe('light')
  })
})

describe('persistence', () => {
  it('writes progress to localStorage', () => {
    state().markComplete('m0/01-intro', new Date(2026, 10, 2))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored.state.completed).toEqual({ 'm0/01-intro': '2026-11-02' })
  })
})

describe('export / import', () => {
  it('round-trips all progress', () => {
    state().markComplete('m0/01-intro', new Date(2026, 10, 2))
    state().recordExam('m0', 90)
    state().toggleChecklistItem('m0-01-review', 1)
    state().setRepoUrl('m0-portfolio-hub', 'https://github.com/me/ai-engineer-portfolio')
    state().setLocale('es')
    const json = state().exportData()

    state().reset()
    expect(state().completed).toEqual({})

    state().importData(json)
    expect(state().completed).toEqual({ 'm0/01-intro': '2026-11-02' })
    expect(state().examScores.m0.best).toBe(90)
    expect(state().checklists['m0-01-review']).toEqual({ 1: true })
    expect(state().repoUrls['m0-portfolio-hub']).toBe('https://github.com/me/ai-engineer-portfolio')
    expect(state().locale).toBe('es')
  })

  it('includes a version and timestamp in the export', () => {
    const parsed = JSON.parse(state().exportData())
    expect(parsed.version).toBe(1)
    expect(typeof parsed.exportedAt).toBe('string')
  })

  it('rejects invalid payloads without touching state', () => {
    state().markComplete('m0/01-intro')
    expect(() => state().importData('not json')).toThrow('Invalid JSON')
    expect(() => state().importData('{"foo": 1}')).toThrow('Missing "data" object')
    expect(() => state().importData('{"data": {"completed": []}}')).toThrow('"completed" must be an object')
    expect(Object.keys(state().completed)).toEqual(['m0/01-intro'])
  })

  it('fills missing fields with defaults and sanitizes preferences', () => {
    const data = parseExport('{"data": {"completed": {"m0/01-intro": "2026-11-02"}, "locale": "fr", "theme": "neon"}}')
    expect(data.examScores).toEqual({})
    expect(data.locale).toBe('en')
    expect(data.theme).toBe('dark')
  })
})
