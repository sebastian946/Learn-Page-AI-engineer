import { lazy, Suspense, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lock } from 'lucide-react'
import { findLesson, hasLocaleFile, lessonKey, lessonLoader, modules } from '../content'
import { isModuleUnlocked } from '../lib/course'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'
import { mdxComponents } from '../components/mdx'
import { LessonTypeIcon } from '../components/LessonTypeIcon'
import { ExamRunner } from '../components/ExamRunner'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { NotFound } from './NotFound'

export function LessonPage() {
  const { moduleId = '', slug = '' } = useParams()
  const { t, l, locale } = useT()
  const found = findLesson(moduleId, slug)
  const key = lessonKey(moduleId, slug)
  const done = useProgress((s) => Boolean(s.completed[key]))
  const examScores = useProgress((s) => s.examScores)
  const unlocked = useProgress((s) => s.unlocked)
  const markComplete = useProgress((s) => s.markComplete)
  const markIncomplete = useProgress((s) => s.markIncomplete)
  const unlockModule = useProgress((s) => s.unlockModule)

  const Content = useMemo(() => {
    const loader = lessonLoader(moduleId, slug, locale)
    return loader ? lazy(loader) : null
  }, [moduleId, slug, locale])

  if (!found) return <NotFound message={t('lesson.notFound')} />
  const { module, lesson, prev, next } = found
  const moduleIndex = modules.indexOf(module)

  if (!isModuleUnlocked(modules, moduleIndex, { examScores, unlocked })) {
    const previous = modules[moduleIndex - 1]
    const previousExam = previous.lessons.find((x) => x.type === 'exam')
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <Lock className="mx-auto h-12 w-12 text-slate-400" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold">{t('lock.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('lock.body')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {previousExam && (
            <Link to={`/learn/${previous.id}/${previousExam.slug}`} className="btn-primary">
              {t('lock.goToExam')}
            </Link>
          )}
          <button type="button" className="btn-secondary" onClick={() => confirm(t('lock.confirm')) && unlockModule(module.id)}>
            {t('lock.unlock')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <LessonTypeIcon type={lesson.type} />
            {t(`type.${lesson.type}`)}
          </span>
          <span>·</span>
          <span>
            {t('common.module')} {module.order}: {l(module.title)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {lesson.minutes} {t('unit.min')}
          </span>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{l(lesson.title)}</h1>
        {locale !== 'en' && !hasLocaleFile(moduleId, slug, locale) && Content && (
          <p className="mt-3 text-sm text-amber-600">{t('lesson.fallback')}</p>
        )}
      </header>

      {Content && (
        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <MDXProvider components={mdxComponents}>
            <ErrorBoundary key={`${moduleId}/${slug}/${locale}`} fallback={t('lesson.error')}>
              <Suspense fallback={<p className="text-slate-500">{t('lesson.loading')}</p>}>
                <Content />
              </Suspense>
            </ErrorBoundary>
          </MDXProvider>
        </div>
      )}

      {lesson.type === 'exam' && (
        <ExamRunner key={module.id} moduleId={module.id} onPass={() => markComplete(key)} />
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
        {lesson.type !== 'exam' && (
          <div className="mb-6 flex items-center gap-3">
            {done ? (
              <>
                <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400" data-testid="lesson-completed">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                  {t('lesson.completed')}
                </span>
                <button type="button" className="btn-ghost text-xs" onClick={() => markIncomplete(key)}>
                  {t('lesson.undo')}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => markComplete(key)}>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {t('lesson.markComplete')}
              </button>
            )}
          </div>
        )}
        <nav className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={`/learn/${prev.module.id}/${prev.lesson.slug}`} className="card flex items-center gap-3 hover:border-indigo-400">
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="block text-xs text-slate-500">{t('lesson.prev')}</span>
                <span className="text-sm font-medium">{l(prev.lesson.title)}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/learn/${next.module.id}/${next.lesson.slug}`}
              className="card flex items-center justify-end gap-3 text-right hover:border-indigo-400"
            >
              <span>
                <span className="block text-xs text-slate-500">{t('lesson.next')}</span>
                <span className="text-sm font-medium">{l(next.lesson.title)}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          )}
        </nav>
      </footer>
    </article>
  )
}
