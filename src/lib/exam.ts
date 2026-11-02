import type { ExamQuestion } from '../types'

/**
 * A response is a list of ORIGINAL indexes:
 * - single / code / multi: the selected option indexes
 * - order: the item indexes in the order the learner arranged them
 */
export type Response = number[]

export interface QuestionResult {
  id: string
  correct: boolean
}

export interface ExamResult {
  correct: number
  total: number
  percent: number
  results: QuestionResult[]
}

const sameSet = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

export function isCorrect(question: ExamQuestion, response: Response | undefined): boolean {
  if (!response || response.length === 0) return false
  switch (question.type) {
    case 'single':
    case 'code':
      return response.length === 1 && response[0] === question.answer?.[0]
    case 'multi':
      return sameSet(response, question.answer ?? [])
    case 'order': {
      const count = question.items?.en.length ?? 0
      return response.length === count && response.every((v, i) => v === i)
    }
  }
}

export function scoreExam(questions: ExamQuestion[], responses: Record<string, Response>): ExamResult {
  const results = questions.map((q) => ({ id: q.id, correct: isCorrect(q, responses[q.id]) }))
  const correct = results.filter((r) => r.correct).length
  const total = questions.length
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100), results }
}

export const isPassing = (percent: number, passingScore = 70) => percent >= passingScore

/** Fisher–Yates shuffle that never mutates its input. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Indexes 0..n-1 in random order, used to shuffle options and order items. */
export const shuffledIndexes = (n: number, random?: () => number) =>
  shuffle(Array.from({ length: n }, (_, i) => i), random)
