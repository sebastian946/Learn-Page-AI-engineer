import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Flame, FolderGit2, Lock, Trophy } from 'lucide-react'
import { modules } from '../content'
import { isModuleUnlocked, moduleProgress, nextLesson, overallProgress } from '../lib/course'
import { computeStreak } from '../lib/dates'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'
import { DataControls } from '../components/DataControls'
import { LessonTypeIcon } from '../components/LessonTypeIcon'

const isGithubUrl = (url: string) => /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url.trim())

export function Dashboard() {
  const { t, l } = useT()
  const completed = useProgress((s) => s.completed)
  const examScores = useProgress((s) => s.examScores)
  const unlocked = useProgress((s) => s.unlocked)
  const repoUrls = useProgress((s) => s.repoUrls)
  const setRepoUrl = useProgress((s) => s.setRepoUrl)

  const overall = overallProgress(modules, { completed })
  const streak = computeStreak(Object.values(completed))
  const next = nextLesson(modules, { completed })
  const current = next?.module ?? modules[modules.length - 1]
  const repos = modules.flatMap((m) => m.repos.map((r) => ({ ...r, module: m })))
  const linked = repos.filter((r) => isGithubUrl(repoUrls[r.id] ?? '')).length

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('dash.welcome')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('dash.subtitle')}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">{t('dash.overall')}</p>
          <p className="mt-1 text-4xl font-bold" data-testid="overall-percent">
            {overall.percent}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-emerald-500" style={{ width: `${overall.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {overall.done}/{overall.total} {t('dash.lessons')}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">{t('dash.streak')}</p>
          <p className="mt-1 flex items-center gap-2 text-4xl font-bold">
            <Flame className={`h-8 w-8 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`} aria-hidden />
            {streak}
          </p>
          <p className="mt-3 text-xs text-slate-500">{t('dash.streakHint')}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">{t('dash.current')}</p>
          <p className="mt-1 text-lg font-semibold">
            {t('common.module')} {current.order}: {l(current.title)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {current.days} {t('unit.days')} · ~{current.hours}
            {t('unit.hours')}
          </p>
        </div>
      </section>

      <section className="card border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">{t('dash.next')}</p>
        {next ? (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <LessonTypeIcon type={next.lesson.type} className="h-6 w-6" />
            <div className="flex-1">
              <p className="text-lg font-semibold">{l(next.lesson.title)}</p>
              <p className="text-sm text-slate-500">
                {t(`type.${next.lesson.type}`)} · {next.lesson.minutes} {t('unit.min')} · {t('common.module')} {next.module.order}
              </p>
            </div>
            <Link to={`/learn/${next.module.id}/${next.lesson.slug}`} className="btn-primary">
              {t('dash.continue')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-6 w-6 text-amber-500" aria-hidden />
            {t('dash.allDone')}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t('dash.modules')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module, index) => {
            const progress = moduleProgress(module, { completed })
            const locked = !isModuleUnlocked(modules, index, { examScores, unlocked })
            const best = examScores[module.id]?.best
            return (
              <Link
                key={module.id}
                to={`/learn/${module.id}/${module.lessons[0]?.slug ?? ''}`}
                className="card block transition hover:border-indigo-400"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 font-mono font-bold dark:bg-slate-800">
                    {module.order}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold leading-snug">{l(module.title)}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{l(module.summary)}</p>
                  </div>
                  {locked ? (
                    <Lock className="h-5 w-5 text-slate-400" aria-label={t('sidebar.locked')} />
                  ) : progress.percent === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                  ) : null}
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>
                    {progress.done}/{progress.total} {t('dash.lessons')} · {module.days} {t('unit.days')}
                  </span>
                  {best !== undefined && (
                    <span>
                      {t('dash.bestScore')}: {best}%
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <FolderGit2 className="h-5 w-5" aria-hidden />
            {t('dash.portfolio')}
          </h2>
          <span className="text-sm text-slate-500">
            {linked}/{repos.length} {t('dash.reposDone')}
          </span>
        </div>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t('dash.portfolioHint')}</p>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {repos.map((repo) => {
            const url = repoUrls[repo.id] ?? ''
            const valid = isGithubUrl(url)
            return (
              <li key={repo.id} className="grid gap-2 py-3 md:grid-cols-[1fr_minmax(0,22rem)] md:items-center">
                <div>
                  <p className="flex items-center gap-2 font-mono text-sm font-semibold">
                    {valid && <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />}
                    {repo.name}
                    <span className="badge bg-slate-100 font-sans text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      M{repo.module.order}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{l(repo.description)}</p>
                </div>
                <div>
                  <input
                    className="input"
                    type="url"
                    value={url}
                    placeholder={t('dash.repoPlaceholder')}
                    aria-label={repo.name}
                    onChange={(e) => setRepoUrl(repo.id, e.target.value)}
                  />
                  {url && !valid && <p className="mt-1 text-xs text-amber-600">{t('dash.repoInvalid')}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{t('dash.data')}</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-400">{t('dash.dataHint')}</p>
        <DataControls />
      </section>
    </div>
  )
}
