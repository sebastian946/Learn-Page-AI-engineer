import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import { loadExam } from '../content'
import { isPassing, scoreExam, shuffle, shuffledIndexes, type ExamResult, type Response } from '../lib/exam'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'
import type { Exam, ExamQuestion } from '../types'
import { CodeBlock } from './CodeBlock'

interface Attempt {
  questions: ExamQuestion[]
  /** Display order of option/item indexes per question. */
  layout: Record<string, number[]>
  responses: Record<string, Response>
  deadline: number
}

function newAttempt(exam: Exam): Attempt {
  const questions = shuffle(exam.questions)
  const layout: Record<string, number[]> = {}
  const responses: Record<string, Response> = {}
  for (const q of questions) {
    const count = q.type === 'order' ? (q.items?.en.length ?? 0) : (q.options?.en.length ?? 0)
    layout[q.id] = shuffledIndexes(count)
    if (q.type === 'order') responses[q.id] = layout[q.id]
  }
  return { questions, layout, responses, deadline: Date.now() + exam.timeLimitMinutes * 60_000 }
}

const formatTime = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function ExamRunner({ moduleId, onPass }: { moduleId: string; onPass: () => void }) {
  const { t, l, ll } = useT()
  const record = useProgress((s) => s.examScores[moduleId])
  const recordExam = useProgress((s) => s.recordExam)
  const [exam, setExam] = useState<Exam | null | undefined>(undefined)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [now, setNow] = useState(Date.now())
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    loadExam(moduleId).then(setExam)
  }, [moduleId])

  const submit = useCallback(
    (current: Attempt, auto = false) => {
      if (!exam) return
      const scored = scoreExam(current.questions, current.responses)
      setResult(scored)
      setTimedOut(auto)
      recordExam(moduleId, scored.percent)
      if (isPassing(scored.percent, exam.passingScore)) onPass()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [exam, moduleId, onPass, recordExam],
  )

  useEffect(() => {
    if (!attempt || result) return
    const timer = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= attempt.deadline) submit(attempt, true)
    }, 1000)
    return () => clearInterval(timer)
  }, [attempt, result, submit])

  if (exam === undefined) return <p className="text-slate-500">{t('lesson.loading')}</p>
  if (exam === null) return <p className="text-amber-600">{t('exam.notFound')}</p>

  const start = () => {
    setAttempt(newAttempt(exam))
    setResult(null)
    setTimedOut(false)
    setNow(Date.now())
  }

  if (!attempt) {
    return (
      <section className="card not-prose mt-8" data-testid="exam-intro">
        <h2 className="text-xl font-semibold">{l(exam.title)}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            [t('exam.questions'), exam.questions.length],
            [t('exam.timeLimit'), `${exam.timeLimitMinutes} ${t('unit.min')}`],
            [t('exam.passing'), `${exam.passingScore}%`],
            [t('exam.best'), record ? `${record.best}%` : '—'],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-xs capitalize text-slate-500">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="btn-primary mt-6" onClick={start}>
          {t('exam.start')}
        </button>
      </section>
    )
  }

  const answered = attempt.questions.filter((q) => (attempt.responses[q.id]?.length ?? 0) > 0).length
  const setResponse = (id: string, response: Response) =>
    setAttempt((a) => (a ? { ...a, responses: { ...a.responses, [id]: response } } : a))

  return (
    <section className="not-prose mt-8 space-y-6" data-testid="exam">
      {result ? (
        <div
          className={`card ${isPassing(result.percent, exam.passingScore) ? 'border-emerald-500' : 'border-rose-500'}`}
          data-testid="exam-result"
        >
          {timedOut && <p className="mb-2 text-sm text-amber-600">{t('exam.timeUp')}</p>}
          <p className="text-sm text-slate-500">{t('exam.score')}</p>
          <p className="text-4xl font-bold" data-testid="exam-score">
            {result.percent}%
          </p>
          <p className="mt-1 text-sm">
            {result.correct}/{result.total} · {t('exam.best')}: {record?.best ?? result.percent}% · {t('exam.attempts')}:{' '}
            {record?.attempts ?? 1}
          </p>
          <p className="mt-3 font-medium">
            {isPassing(result.percent, exam.passingScore) ? t('exam.passed') : t('exam.failed')}
          </p>
          <button type="button" className="btn-secondary mt-4" onClick={start}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t('exam.retake')}
          </button>
        </div>
      ) : (
        <div className="sticky top-14 z-10 flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 px-4 py-2 text-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <span>
            {answered}/{attempt.questions.length} {t('exam.answered')}
          </span>
          <span className="flex items-center gap-1 font-mono" aria-label={t('exam.timeLeft')}>
            <Clock className="h-4 w-4" aria-hidden />
            {formatTime(attempt.deadline - now)}
          </span>
        </div>
      )}

      <ol className="space-y-6">
        {attempt.questions.map((q, index) => {
          const response = attempt.responses[q.id] ?? []
          const outcome = result?.results.find((r) => r.id === q.id)
          const order = attempt.layout[q.id]
          return (
            <li key={q.id} className="card" data-testid={`question-${q.id}`}>
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm text-slate-500">{index + 1}.</span>
                <div className="flex-1">
                  <p className="whitespace-pre-line font-medium">{l(q.prompt)}</p>
                  {q.code && <CodeBlock code={q.code} lang={q.codeLang} />}
                  <p className="mt-2 text-xs text-slate-500">
                    {q.type === 'multi' ? t('exam.selectMany') : q.type === 'order' ? t('exam.order') : t('exam.selectOne')}
                  </p>

                  {q.type === 'order' ? (
                    <OrderList
                      items={ll(q.items!)}
                      value={response}
                      disabled={Boolean(result)}
                      onChange={(v) => setResponse(q.id, v)}
                      labels={{ up: t('exam.moveUp'), down: t('exam.moveDown') }}
                    />
                  ) : (
                    <div className="mt-3 space-y-2">
                      {order.map((optionIndex) => {
                        const option = ll(q.options!)[optionIndex]
                        const selected = response.includes(optionIndex)
                        const isAnswer = q.answer?.includes(optionIndex)
                        const reviewTone = result
                          ? isAnswer
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : selected
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                              : 'border-slate-200 dark:border-slate-800'
                          : selected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                            : 'border-slate-200 hover:border-slate-400 dark:border-slate-800'
                        return (
                          <label key={optionIndex} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${reviewTone}`}>
                            <input
                              type={q.type === 'multi' ? 'checkbox' : 'radio'}
                              name={q.id}
                              className="mt-0.5"
                              checked={selected}
                              disabled={Boolean(result)}
                              onChange={() =>
                                setResponse(
                                  q.id,
                                  q.type === 'multi'
                                    ? selected
                                      ? response.filter((x) => x !== optionIndex)
                                      : [...response, optionIndex]
                                    : [optionIndex],
                                )
                              }
                            />
                            <span className="whitespace-pre-line">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {result && outcome && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                      <p
                        className={`mb-1 flex items-center gap-1.5 font-semibold ${
                          outcome.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {outcome.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {outcome.correct ? t('exam.correct') : t('exam.incorrect')}
                      </p>
                      {q.type === 'order' && !outcome.correct && (
                        <div className="mb-2">
                          <p className="font-medium">{t('exam.correctAnswer')}:</p>
                          <ol className="ml-5 list-decimal">
                            {ll(q.items!).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{l(q.explanation)}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {!result && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (answered < attempt.questions.length && !confirm(t('exam.submitConfirm'))) return
            submit(attempt)
          }}
        >
          {t('exam.submit')}
        </button>
      )}
    </section>
  )
}

function OrderList({
  items,
  value,
  disabled,
  onChange,
  labels,
}: {
  items: string[]
  value: number[]
  disabled: boolean
  onChange: (value: number[]) => void
  labels: { up: string; down: string }
}) {
  const move = (from: number, to: number) => {
    const next = [...value]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }
  return (
    <ol className="mt-3 space-y-2">
      {value.map((itemIndex, position) => (
        <li
          key={itemIndex}
          className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800"
          data-order-item={itemIndex}
        >
          <span className="w-6 text-center font-mono text-slate-500">{position + 1}</span>
          <span className="flex-1">{items[itemIndex]}</span>
          <button
            type="button"
            className="btn-ghost p-1"
            aria-label={labels.up}
            disabled={disabled || position === 0}
            onClick={() => move(position, position - 1)}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-ghost p-1"
            aria-label={labels.down}
            disabled={disabled || position === value.length - 1}
            onClick={() => move(position, position + 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ol>
  )
}
