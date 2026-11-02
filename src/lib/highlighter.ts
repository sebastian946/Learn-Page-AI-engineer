import type { HighlighterCore } from 'shiki/core'

export const RUNTIME_LANGS = ['python', 'typescript', 'javascript', 'bash', 'yaml', 'json', 'dockerfile', 'sql', 'hcl'] as const

let highlighter: Promise<HighlighterCore> | null = null

/** Single lazily-created highlighter with only the languages exams use. */
export function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ])
    return createHighlighterCore({
      themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
      langs: [
        import('@shikijs/langs/python'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/yaml'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/dockerfile'),
        import('@shikijs/langs/sql'),
        import('@shikijs/langs/hcl'),
      ],
      engine: createJavaScriptRegexEngine(),
    })
  })()
  return highlighter
}
