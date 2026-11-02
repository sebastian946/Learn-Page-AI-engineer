import type { ReactNode } from 'react'
import { AlertTriangle, Info, Lightbulb, MessageSquareQuote } from 'lucide-react'
import { useLocale } from '../../i18n'

type CalloutType = 'tip' | 'warning' | 'interview' | 'info'

const styles: Record<CalloutType, { box: string; icon: typeof Info; label: { en: string; es: string } }> = {
  tip: {
    box: 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40',
    icon: Lightbulb,
    label: { en: 'Tip', es: 'Consejo' },
  },
  warning: {
    box: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/40',
    icon: AlertTriangle,
    label: { en: 'Warning', es: 'Cuidado' },
  },
  interview: {
    box: 'border-violet-500/50 bg-violet-50 dark:bg-violet-950/40',
    icon: MessageSquareQuote,
    label: { en: 'In interviews', es: 'En entrevistas' },
  },
  info: {
    box: 'border-sky-500/40 bg-sky-50 dark:bg-sky-950/40',
    icon: Info,
    label: { en: 'Note', es: 'Nota' },
  },
}

export function Callout({ type = 'info', title, children }: { type?: CalloutType; title?: string; children: ReactNode }) {
  const locale = useLocale()
  const style = styles[type] ?? styles.info
  const Icon = style.icon
  return (
    <aside className={`not-prose my-6 rounded-lg border-l-4 px-4 py-3 ${style.box}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" aria-hidden />
        {title ?? style.label[locale]}
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1.5">{children}</div>
    </aside>
  )
}
