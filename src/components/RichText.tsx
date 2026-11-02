import { Fragment, type ReactNode } from 'react'

/** Inline `code` and **bold** only — enough for JSON-sourced answers without a markdown parser. */
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em] text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
          {part.slice(1, -1)}
        </code>
      )
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Paragraphs split on blank lines; lines starting with "- " become bullet lists. */
export function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-2 leading-relaxed text-slate-700 dark:text-slate-300">
      {text.split(/\n\s*\n/).map((block, i) => {
        const lines = block.split('\n')
        if (lines.every((line) => line.trim().startsWith('- ')))
          return (
            <ul key={i} className="ml-5 list-disc space-y-1">
              {lines.map((line, j) => (
                <li key={j}>{inline(line.trim().slice(2))}</li>
              ))}
            </ul>
          )
        return (
          <p key={i} className="whitespace-pre-line">
            {inline(block)}
          </p>
        )
      })}
    </div>
  )
}
