import { Children, Fragment, isValidElement, useState, type ReactElement, type ReactNode } from 'react'

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  tsx: 'TypeScript',
  javascript: 'JavaScript',
  bash: 'Bash',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  dockerfile: 'Dockerfile',
  sql: 'SQL',
}

/**
 * Wraps two or more fenced code blocks and shows them as tabs.
 * Tab labels come from `labels` or from each block's language.
 */
export function CodeTabs({ labels, children }: { labels?: string[]; children: ReactNode }) {
  // rehype-shiki wraps each highlighted block in a Fragment, so unwrap one level.
  const blocks = Children.toArray(children)
    .filter(isValidElement)
    .flatMap((el) => (el.type === Fragment ? Children.toArray((el.props as { children: ReactNode }).children) : [el]))
    .filter(isValidElement) as ReactElement<Record<string, unknown>>[]
  const [active, setActive] = useState(0)
  if (blocks.length === 0) return null
  const names = blocks.map((block, i) => {
    const lang = String(block.props['data-language'] ?? '')
    return labels?.[i] ?? LANGUAGE_LABELS[lang] ?? (lang || `Tab ${i + 1}`)
  })
  return (
    <div className="not-prose my-6">
      <div role="tablist" className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {names.map((name, i) => (
          <button
            key={name + i}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-2 px-3 py-1.5 text-sm font-medium ${
              active === i
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="prose max-w-none dark:prose-invert prose-pre:mt-2">{blocks[active]}</div>
    </div>
  )
}
