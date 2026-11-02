import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { interviewBank, modules } from '../content'
import { useT } from '../i18n'
import { RichText } from '../components/RichText'
import type { Seniority } from '../types'

export function InterviewPage() {
  const { t, l } = useT()
  const [module, setModule] = useState('all')
  const [level, setLevel] = useState<'all' | Seniority>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interviewBank.filter(
      (item) =>
        (module === 'all' || item.module === module) &&
        (level === 'all' || item.level === level) &&
        (!q ||
          [item.question.en, item.question.es, ...item.tags].some((text) => text.toLowerCase().includes(q))),
    )
  }, [module, level, query])

  const moduleOrder = (id: string) => modules.find((m) => m.id === id)?.order ?? '?'

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('interview.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t('interview.subtitle')}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="input" type="search" placeholder={t('interview.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={module} onChange={(e) => setModule(e.target.value)} aria-label={t('common.module')}>
          <option value="all">{t('interview.allModules')}</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              M{m.order} · {l(m.title)}
            </option>
          ))}
        </select>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value as 'all' | Seniority)} aria-label="Level">
          <option value="all">{t('interview.allLevels')}</option>
          <option value="mid">{t('interview.mid')}</option>
          <option value="senior">{t('interview.senior')}</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {items.length} {t('interview.count')}
      </p>

      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const isOpen = open[item.id]
          return (
            <li key={item.id} className="card p-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <span className="flex-1">
                  <span className="mb-1 flex flex-wrap gap-1.5">
                    <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">M{moduleOrder(item.module)}</span>
                    <span
                      className={`badge ${
                        item.level === 'senior'
                          ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200'
                      }`}
                    >
                      {t(`interview.${item.level}`)}
                    </span>
                    {item.tags.map((tag) => (
                      <span key={tag} className="badge border border-slate-200 text-slate-500 dark:border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </span>
                  <span className="block font-medium">{l(item.question)}</span>
                </span>
                <ChevronDown className={`mt-1 h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <RichText text={l(item.answer)} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {items.length === 0 && <p className="mt-6 text-slate-500">{t('common.empty')}</p>}
    </div>
  )
}
