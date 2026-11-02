import { useEffect, useState } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import { lessonKey, modules } from '../content'
import { isModuleUnlocked, moduleProgress } from '../lib/course'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'
import { LessonTypeIcon } from './LessonTypeIcon'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, l } = useT()
  // The sidebar lives in the layout route, so read the module from the URL rather than useParams.
  const moduleId = useMatch('/learn/:moduleId/*')?.params.moduleId
  const completed = useProgress((s) => s.completed)
  const examScores = useProgress((s) => s.examScores)
  const unlocked = useProgress((s) => s.unlocked)
  const [open, setOpen] = useState<Record<string, boolean>>(() => (moduleId ? { [moduleId]: true } : {}))

  useEffect(() => {
    if (moduleId) setOpen((o) => ({ ...o, [moduleId]: true }))
  }, [moduleId])

  return (
    <nav aria-label={t('nav.course')} className="space-y-1 p-3">
      {modules.map((module, index) => {
        const isOpen = open[module.id]
        const locked = !isModuleUnlocked(modules, index, { examScores, unlocked })
        const progress = moduleProgress(module, { completed })
        return (
          <div key={module.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen((o) => ({ ...o, [module.id]: !o[module.id] }))}
              className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 transition ${isOpen ? 'rotate-90' : ''}`} aria-hidden />
              <span className="flex-1">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('common.module')} {module.order}
                </span>
                <span className="block text-sm font-semibold leading-snug">{l(module.title)}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                  <span className="block h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
                </span>
              </span>
              {locked && <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-label={t('sidebar.locked')} />}
            </button>
            {isOpen && (
              <ul className="mb-2 ml-4 border-l border-slate-200 pl-2 dark:border-slate-800">
                {module.lessons.map((lesson) => {
                  const done = Boolean(completed[lessonKey(module.id, lesson.slug)])
                  return (
                    <li key={lesson.slug}>
                      <NavLink
                        to={`/learn/${module.id}/${lesson.slug}`}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `flex items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
                            isActive
                              ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                          }`
                        }
                      >
                        <LessonTypeIcon type={lesson.type} className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="flex-1 leading-snug">{l(lesson.title)}</span>
                        {done && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-label={t('lesson.completed')} />
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
