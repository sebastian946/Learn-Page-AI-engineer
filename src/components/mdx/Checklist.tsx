import { CheckSquare, Square } from 'lucide-react'
import { useT } from '../../i18n'
import { useProgress } from '../../store/progress'

/** A checklist whose state is persisted per `id` (must be unique across the course). */
export function Checklist({ id, title, items }: { id: string; title?: string; items: string[] }) {
  const { t } = useT()
  const state = useProgress((s) => s.checklists[id])
  const toggle = useProgress((s) => s.toggleChecklistItem)
  const done = items.filter((_, i) => state?.[i]).length
  return (
    <div className="not-prose my-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800" data-checklist={id}>
      <div className="mb-3 flex items-center justify-between gap-4">
        {title && <h4 className="font-semibold">{title}</h4>}
        <span className="ml-auto text-xs text-slate-500">
          {done}/{items.length} {t('checklist.done')}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const checked = Boolean(state?.[i])
          return (
            <li key={i}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(id, i)}
                className="flex w-full items-start gap-2 rounded text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {checked ? (
                  <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                ) : (
                  <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                )}
                <span className={checked ? 'text-slate-500 line-through' : ''}>{item}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
