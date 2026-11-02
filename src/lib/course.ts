import { lessonKey } from '../content'
import type { ModuleMeta } from '../types'
import type { ProgressData } from '../store/progress'

export const PASSING_SCORE = 70

type GateData = Pick<ProgressData, 'examScores' | 'unlocked'>
type CompletionData = Pick<ProgressData, 'completed'>

/** A module is open when it is first, was force-unlocked, or the previous module's exam is passed. */
export function isModuleUnlocked(modules: ModuleMeta[], index: number, data: GateData): boolean {
  if (index <= 0) return true
  const current = modules[index]
  if (data.unlocked[current.id]) return true
  const previous = modules[index - 1]
  return (data.examScores[previous.id]?.best ?? 0) >= PASSING_SCORE
}

export function moduleProgress(module: ModuleMeta, data: CompletionData) {
  const done = module.lessons.filter((l) => data.completed[lessonKey(module.id, l.slug)]).length
  const total = module.lessons.length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}

export function overallProgress(modules: ModuleMeta[], data: CompletionData) {
  const total = modules.reduce((n, m) => n + m.lessons.length, 0)
  const done = modules.reduce((n, m) => n + moduleProgress(m, data).done, 0)
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}

/** First incomplete lesson in course order; null when everything is done. */
export function nextLesson(modules: ModuleMeta[], data: CompletionData) {
  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (!data.completed[lessonKey(module.id, lesson.slug)]) return { module, lesson }
    }
  }
  return null
}
