/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeShiki from '@shikijs/rehype'
import type { ShikiTransformer } from 'shiki'

// Expose the code block language so <CodeTabs> can label its tabs.
const languageAttr: ShikiTransformer = {
  name: 'language-attr',
  pre(node) {
    node.properties.dataLanguage = this.options.lang
  },
}

export default defineConfig({
  base: './',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: 'github-light', dark: 'github-dark' },
              defaultColor: false,
              langs: [
                'python', 'typescript', 'tsx', 'javascript', 'bash', 'shell', 'yaml', 'json',
                'dockerfile', 'sql', 'toml', 'markdown', 'diff', 'http', 'ini', 'hcl', 'graphql',
              ],
              defaultLanguage: 'text',
              fallbackLanguage: 'text',
              transformers: [languageAttr],
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
