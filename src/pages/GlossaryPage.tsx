import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { glossary, modules } from '../content'
import { useT } from '../i18n'

export function GlossaryPage() {
  const { t, locale } = useT()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = glossary.filter(
      (entry) => !q || [entry.term, entry.termEs ?? '', entry.en, entry.es].some((text) => text.toLowerCase().includes(q)),
    )
    const byLetter = new Map<string, typeof filtered>()
    for (const entry of filtered) {
      const letter = entry.term[0].toUpperCase()
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), entry])
    }
    return [...byLetter.entries()]
  }, [query])

  const count = groups.reduce((n, [, entries]) => n + entries.length, 0)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('glossary.title')}</h1>
      <input
        className="input mt-6"
        type="search"
        placeholder={t('glossary.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="mt-3 text-sm text-slate-500">
        {count} {t('glossary.count')}
      </p>
      <nav className="mt-3 flex flex-wrap gap-1">
        {groups.map(([letter]) => (
          <a key={letter} href={`#letter-${letter}`} className="btn-ghost px-2 py-1 font-mono text-xs" onClick={(e) => {
            e.preventDefault()
            document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' })
          }}>
            {letter}
          </a>
        ))}
      </nav>
      <div className="mt-6 space-y-8">
        {groups.map(([letter, entries]) => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <h2 className="mb-3 border-b border-slate-200 pb-1 font-mono text-lg font-bold dark:border-slate-800">{letter}</h2>
            <dl className="space-y-4">
              {entries.map((entry) => {
                const module = modules.find((m) => m.id === entry.module)
                return (
                  <div key={entry.term}>
                    <dt className="flex flex-wrap items-center gap-2 font-semibold">
                      {entry.term}
                      {locale === 'es' && entry.termEs && entry.termEs !== entry.term && (
                        <span className="text-sm font-normal text-slate-500">({entry.termEs})</span>
                      )}
                      {module && (
                        <Link
                          to={`/learn/${module.id}/${module.lessons[0]?.slug ?? ''}`}
                          className="badge bg-slate-100 text-slate-600 hover:bg-indigo-100 dark:bg-slate-800 dark:text-slate-300"
                        >
                          M{module.order}
                        </Link>
                      )}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {locale === 'es' ? entry.es : entry.en}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}
      </div>
      {count === 0 && <p className="mt-6 text-slate-500">{t('common.empty')}</p>}
    </div>
  )
}
