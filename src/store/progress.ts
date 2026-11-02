import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { dayKey } from '../lib/dates'
import type { Locale } from '../types'

export interface ExamRecord {
  best: number
  last: number
  attempts: number
}

export interface ProgressData {
  /** lessonKey -> local day the lesson was completed (YYYY-MM-DD) */
  completed: Record<string, string>
  examScores: Record<string, ExamRecord>
  /** checklistId -> item index -> checked */
  checklists: Record<string, Record<number, boolean>>
  /** moduleId -> unlocked manually despite the exam gate */
  unlocked: Record<string, boolean>
  /** repoId -> GitHub URL pasted by the learner */
  repoUrls: Record<string, string>
  locale: Locale
  theme: 'dark' | 'light'
}

interface ProgressActions {
  markComplete: (key: string, date?: Date) => void
  markIncomplete: (key: string) => void
  recordExam: (moduleId: string, percent: number) => void
  toggleChecklistItem: (checklistId: string, index: number) => void
  unlockModule: (moduleId: string) => void
  setRepoUrl: (repoId: string, url: string) => void
  setLocale: (locale: Locale) => void
  toggleTheme: () => void
  exportData: () => string
  importData: (json: string) => void
  reset: () => void
}

export type ProgressState = ProgressData & ProgressActions

export const STORAGE_KEY = 'ai-engineer-progress'
export const EXPORT_VERSION = 1

export const initialData: ProgressData = {
  completed: {},
  examScores: {},
  checklists: {},
  unlocked: {},
  repoUrls: {},
  locale: 'en',
  theme: 'dark',
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Validates and normalizes an imported payload. Throws on invalid input. */
export function parseExport(json: string): ProgressData {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON')
  }
  if (!isRecord(raw) || !isRecord(raw.data)) throw new Error('Missing "data" object')
  const data = raw.data
  for (const field of ['completed', 'examScores', 'checklists', 'unlocked', 'repoUrls'] as const) {
    if (data[field] !== undefined && !isRecord(data[field])) throw new Error(`"${field}" must be an object`)
  }
  return {
    ...initialData,
    ...(data as Partial<ProgressData>),
    locale: data.locale === 'es' ? 'es' : 'en',
    theme: data.theme === 'light' ? 'light' : 'dark',
  }
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialData,
      markComplete: (key, date = new Date()) =>
        set((s) => (s.completed[key] ? s : { completed: { ...s.completed, [key]: dayKey(date) } })),
      markIncomplete: (key) =>
        set((s) => {
          const { [key]: _removed, ...rest } = s.completed
          return { completed: rest }
        }),
      recordExam: (moduleId, percent) =>
        set((s) => {
          const prev = s.examScores[moduleId]
          return {
            examScores: {
              ...s.examScores,
              [moduleId]: {
                best: Math.max(prev?.best ?? 0, percent),
                last: percent,
                attempts: (prev?.attempts ?? 0) + 1,
              },
            },
          }
        }),
      toggleChecklistItem: (checklistId, index) =>
        set((s) => {
          const list = s.checklists[checklistId] ?? {}
          return { checklists: { ...s.checklists, [checklistId]: { ...list, [index]: !list[index] } } }
        }),
      unlockModule: (moduleId) => set((s) => ({ unlocked: { ...s.unlocked, [moduleId]: true } })),
      setRepoUrl: (repoId, url) => set((s) => ({ repoUrls: { ...s.repoUrls, [repoId]: url } })),
      setLocale: (locale) => set({ locale }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      exportData: () => {
        const { completed, examScores, checklists, unlocked, repoUrls, locale, theme } = get()
        return JSON.stringify(
          {
            version: EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            data: { completed, examScores, checklists, unlocked, repoUrls, locale, theme },
          },
          null,
          2,
        )
      },
      importData: (json) => set(parseExport(json)),
      reset: () => set(initialData),
    }),
    {
      name: STORAGE_KEY,
      version: EXPORT_VERSION,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
