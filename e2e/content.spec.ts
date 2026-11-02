import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import type { Locale, ModuleMeta } from '../src/types'

// Renders every lesson in both languages: catches MDX runtime errors, broken Mermaid and missing exams.
const modulesDir = new URL('../src/content/modules/', import.meta.url)
const modules: ModuleMeta[] = readdirSync(modulesDir)
  .map((id) => JSON.parse(readFileSync(new URL(`${id}/module.json`, modulesDir), 'utf8')) as ModuleMeta)
  .sort((a, b) => a.order - b.order)

const seed = (locale: Locale) =>
  JSON.stringify({
    state: {
      completed: {},
      examScores: {},
      checklists: {},
      repoUrls: {},
      unlocked: Object.fromEntries(modules.map((m) => [m.id, true])),
      locale,
      theme: 'dark',
    },
    version: 1,
  })

for (const module of modules) {
  for (const locale of ['en', 'es'] as const) {
    test(`renders every lesson of ${module.id} (${locale})`, async ({ page }) => {
      test.setTimeout(30_000 + module.lessons.length * 10_000)
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.addInitScript((value) => localStorage.setItem('ai-engineer-progress', value), seed(locale))

      for (const lesson of module.lessons) {
        const where = `${module.id}/${lesson.slug} (${locale})`
        await page.goto(`/#/learn/${module.id}/${lesson.slug}`)
        await expect(page.getByRole('heading', { level: 1, name: lesson.title[locale] }), where).toBeVisible()
        await expect(page.getByText(/Loading lesson|Cargando lección/), where).toHaveCount(0)
        // Mermaid placeholders pulse until the diagram renders or fails.
        await expect(page.locator('figure .animate-pulse'), where).toHaveCount(0, { timeout: 15_000 })
        await expect(page.getByText(/Diagram could not be rendered|No se pudo renderizar el diagrama/), where).toHaveCount(0)
        await expect(page.getByTestId('lesson-error'), where).toHaveCount(0)
        if (lesson.type === 'exam') await expect(page.getByTestId('exam-intro'), where).toBeVisible()
      }
      expect(errors).toEqual([])
    })
  }
}
