import { useEffect, useId, useState } from 'react'
import { useT } from '../../i18n'
import { useProgress } from '../../store/progress'

/** Renders a Mermaid chart client-side. Mermaid is lazy-loaded on first use. */
export function Diagram({ chart, caption }: { chart: string; caption?: string }) {
  const { t } = useT()
  const theme = useProgress((s) => s.theme)
  const id = 'mmd-' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'strict' })
        const result = await mermaid.render(id, chart.trim())
        if (!cancelled) {
          setSvg(result.svg)
          setError(false)
        }
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [chart, id, theme])

  return (
    <figure className="not-prose my-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      {error ? (
        <div>
          <p className="mb-2 text-sm text-amber-600">{t('diagram.error')}</p>
          <pre className="text-xs">{chart}</pre>
        </div>
      ) : svg ? (
        <div className="flex justify-center [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      )}
      {caption && <figcaption className="mt-3 text-center text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  )
}
