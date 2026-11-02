import { Children, useState, type ReactNode } from 'react'
import { Briefcase, ChevronDown, ClipboardCheck, Code2, GitBranch, HelpCircle, Lightbulb } from 'lucide-react'
import { useT } from '../../i18n'

function Box({ icon, title, tone, children }: { icon: ReactNode; title: ReactNode; tone: string; children: ReactNode }) {
  return (
    <section className={`not-prose my-6 rounded-xl border ${tone} p-4`}>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
        {icon}
        {title}
      </h4>
      <div className="prose prose-sm max-w-none dark:prose-invert prose-li:my-0.5">{children}</div>
    </section>
  )
}

export function AcceptanceCriteria({ children }: { children: ReactNode }) {
  const { t } = useT()
  return (
    <Box
      icon={<ClipboardCheck className="h-4 w-4" aria-hidden />}
      title={t('criteria.title')}
      tone="border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30"
    >
      {children}
    </Box>
  )
}

export function StarterCode({ children }: { children: ReactNode }) {
  const { t } = useT()
  return (
    <Box
      icon={<Code2 className="h-4 w-4" aria-hidden />}
      title={t('starter.title')}
      tone="border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
    >
      {children}
    </Box>
  )
}

/** "What to commit to GitHub": suggested repo name, folder structure and README outline as children. */
export function CommitBox({ repo, children }: { repo: string; children: ReactNode }) {
  const { t } = useT()
  return (
    <Box
      icon={<GitBranch className="h-4 w-4" aria-hidden />}
      title={t('commit.title')}
      tone="border-indigo-500/40 bg-indigo-50/60 dark:bg-indigo-950/30"
    >
      <p>
        {t('commit.repo')}: <code>{repo}</code>
      </p>
      {children}
    </Box>
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/** Reveals <Hint> children one at a time. */
export function Hints({ children }: { children: ReactNode }) {
  const { t } = useT()
  const hints = Children.toArray(children)
  const [shown, setShown] = useState(0)
  return (
    <section className="not-prose my-6 rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/30">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
        <Lightbulb className="h-4 w-4" aria-hidden />
        Hints
        <span className="ml-auto text-xs font-normal normal-case text-slate-500">
          {shown} {t('hints.of')} {hints.length}
        </span>
      </h4>
      <ol className="space-y-3">
        {hints.slice(0, shown).map((hint, i) => (
          <li key={i} className="prose prose-sm max-w-none dark:prose-invert">
            <span className="mr-2 font-semibold">#{i + 1}</span>
            {hint}
          </li>
        ))}
      </ol>
      {shown < hints.length ? (
        <button type="button" className="btn-secondary mt-3" onClick={() => setShown((n) => n + 1)}>
          <HelpCircle className="h-4 w-4" aria-hidden />
          {t('hints.show')} {shown + 1}
        </button>
      ) : (
        <p className="mt-3 text-xs text-slate-500">{t('hints.none')}</p>
      )}
    </section>
  )
}

export function InterviewQuestion({
  question,
  level,
  children,
}: {
  question: string
  level?: 'mid' | 'senior'
  children: ReactNode
}) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <div className="not-prose my-4 rounded-lg border border-violet-500/40 bg-violet-50/50 dark:bg-violet-950/20">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" aria-hidden />
        <span className="flex-1 font-medium">{question}</span>
        {level && <span className="badge bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-100">{level}</span>}
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div className="prose prose-sm max-w-none border-t border-violet-500/20 px-4 py-3 dark:prose-invert">{children}</div>
      ) : (
        <p className="px-4 pb-3 text-xs text-slate-500">{t('interviewQ.show')}</p>
      )}
    </div>
  )
}

/** Header card for capstone client briefs. */
export function ClientBrief({
  company,
  industry,
  duration,
  children,
}: {
  company: string
  industry: string
  duration: string
  children?: ReactNode
}) {
  const { t } = useT()
  return (
    <section className="not-prose my-6 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50 to-indigo-50 p-5 dark:border-slate-700 dark:from-slate-900 dark:to-indigo-950/40">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
        <Briefcase className="h-4 w-4" aria-hidden />
        {t('brief.title')}
      </h4>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          [t('brief.company'), company],
          [t('brief.industry'), industry],
          [t('brief.duration'), duration],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {children && <div className="prose prose-sm mt-4 max-w-none dark:prose-invert">{children}</div>}
    </section>
  )
}
