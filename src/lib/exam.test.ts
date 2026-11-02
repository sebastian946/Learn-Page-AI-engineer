import { describe, expect, it } from 'vitest'
import { isCorrect, isPassing, scoreExam, shuffle, shuffledIndexes } from './exam'
import type { ExamQuestion } from '../types'

const t = (s: string) => ({ en: s, es: s })
const tl = (xs: string[]) => ({ en: xs, es: xs })

const single: ExamQuestion = {
  id: 'single',
  type: 'single',
  prompt: t('2 + 2?'),
  options: tl(['3', '4', '5']),
  answer: [1],
  explanation: t(''),
}
const multi: ExamQuestion = {
  id: 'multi',
  type: 'multi',
  prompt: t('Even numbers?'),
  options: tl(['1', '2', '3', '4']),
  answer: [1, 3],
  explanation: t(''),
}
const order: ExamQuestion = {
  id: 'order',
  type: 'order',
  prompt: t('Order'),
  items: tl(['load', 'chunk', 'embed', 'index']),
  explanation: t(''),
}
const code: ExamQuestion = {
  id: 'code',
  type: 'code',
  prompt: t('Returns?'),
  code: 'return 1',
  options: tl(['1', 'None']),
  answer: [0],
  explanation: t(''),
}

describe('isCorrect', () => {
  it('single and code questions need exactly the right option', () => {
    expect(isCorrect(single, [1])).toBe(true)
    expect(isCorrect(single, [0])).toBe(false)
    expect(isCorrect(single, [1, 0])).toBe(false)
    expect(isCorrect(code, [0])).toBe(true)
  })

  it('multi questions need the exact set, in any order', () => {
    expect(isCorrect(multi, [3, 1])).toBe(true)
    expect(isCorrect(multi, [1])).toBe(false)
    expect(isCorrect(multi, [1, 2, 3])).toBe(false)
  })

  it('order questions need the original sequence', () => {
    expect(isCorrect(order, [0, 1, 2, 3])).toBe(true)
    expect(isCorrect(order, [1, 0, 2, 3])).toBe(false)
    expect(isCorrect(order, [0, 1, 2])).toBe(false)
  })

  it('treats missing or empty responses as wrong', () => {
    expect(isCorrect(single, undefined)).toBe(false)
    expect(isCorrect(multi, [])).toBe(false)
  })
})

describe('scoreExam', () => {
  const questions = [single, multi, order, code]

  it('computes a rounded percentage and per-question results', () => {
    const result = scoreExam(questions, { single: [1], multi: [1, 3], order: [3, 2, 1, 0] })
    expect(result.correct).toBe(2)
    expect(result.total).toBe(4)
    expect(result.percent).toBe(50)
    expect(result.results.map((r) => r.correct)).toEqual([true, true, false, false])
  })

  it('rounds to the nearest integer', () => {
    expect(scoreExam([single, multi, code], { single: [1], multi: [1, 3] }).percent).toBe(67)
  })

  it('returns 0 for an empty exam', () => {
    expect(scoreExam([], {}).percent).toBe(0)
  })
})

describe('isPassing', () => {
  it('uses 70 as the default threshold, inclusive', () => {
    expect(isPassing(70)).toBe(true)
    expect(isPassing(69)).toBe(false)
    expect(isPassing(80, 85)).toBe(false)
  })
})

describe('shuffle', () => {
  it('keeps every element and never mutates the input', () => {
    const input = [1, 2, 3, 4, 5]
    const output = shuffle(input)
    expect(output).toHaveLength(5)
    expect([...output].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  it('is deterministic for a given random source', () => {
    const rng = () => 0
    expect(shuffle([1, 2, 3, 4], rng)).toEqual([2, 3, 4, 1])
    expect(shuffledIndexes(3, rng)).toEqual([1, 2, 0])
  })
})
