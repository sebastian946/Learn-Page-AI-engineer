import { useEffect, useState } from 'react'
import { getHighlighter, RUNTIME_LANGS } from '../lib/highlighter'

/** Runtime-highlighted code for JSON-sourced content (exams). Shiki is lazy-loaded. */
export function CodeBlock({ code, lang = 'python' }: { code: string; lang?: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const safeLang = (RUNTIME_LANGS as readonly string[]).includes(lang) ? lang : 'text'
    getHighlighter()
      .then((h) =>
        h.codeToHtml(code, { lang: safeLang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false }),
      )
      .then((result) => !cancelled && setHtml(result))
      .catch(() => !cancelled && setHtml(null))
    return () => {
      cancelled = true
    }
  }, [code, lang])

  const shell = 'my-3 overflow-x-auto rounded-lg border border-slate-200 text-[0.85rem] leading-relaxed dark:border-slate-800 [&_pre]:p-4'
  return html ? (
    <div className={shell} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div className={shell}>
      <pre className="bg-slate-50 dark:bg-slate-900">
        <code>{code}</code>
      </pre>
    </div>
  )
}
