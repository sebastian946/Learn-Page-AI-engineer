import { readFileSync } from 'node:fs'
import { expect, test, type Locator } from '@playwright/test'
import type { Exam, ModuleMeta } from '../src/types'

const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as T

const m0 = readJson<ModuleMeta>('../src/content/modules/m0/module.json')
const exam = readJson<Exam>('../src/content/exams/m0.json')
const firstLesson = m0.lessons.find((l) => l.type !== 'exam')!
const examLesson = m0.lessons.find((l) => l.type === 'exam')!

/** Moves order items with the up buttons until they match the correct sequence. */
async function arrange(card: Locator, count: number) {
  for (let target = 0; target < count; target++) {
    const items = card.locator('[data-order-item]')
    const positions = await items.evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-order-item'))))
    let current = positions.indexOf(target)
    while (current > target) {
      await items.nth(current).getByRole('button', { name: 'Move up' }).click()
      current--
    }
  }
}

test('completes a lesson and shows it as done', async ({ page }) => {
  await page.goto(`/#/learn/m0/${firstLesson.slug}`)
  await expect(page.getByRole('heading', { level: 1, name: firstLesson.title.en })).toBeVisible()

  await page.getByRole('button', { name: 'Mark complete' }).click()
  await expect(page.getByTestId('lesson-completed')).toBeVisible()

  // Progress survives a reload (localStorage) and shows up on the dashboard.
  await page.reload()
  await expect(page.getByTestId('lesson-completed')).toBeVisible()
  await page.goto('/#/')
  await expect(page.getByTestId('overall-percent')).not.toHaveText('0%')
})

test('passes the module 0 exam and unlocks module 1', async ({ page }) => {
  await page.goto(`/#/learn/m0/${examLesson.slug}`)
  await page.getByRole('button', { name: 'Start exam' }).click()

  for (const question of exam.questions) {
    const card = page.getByTestId(`question-${question.id}`)
    if (question.type === 'order') {
      await arrange(card, question.items!.en.length)
    } else {
      for (const index of question.answer!) {
        await card.getByText(question.options!.en[index], { exact: true }).click()
      }
    }
  }

  await page.getByRole('button', { name: 'Submit exam' }).click()
  await expect(page.getByTestId('exam-score')).toHaveText('100%')
  await expect(page.getByTestId('exam-result')).toContainText('Passed')

  // The best score unlocks the next module without the "unlock anyway" gate.
  await page.goto('/#/learn/m1/' + readJson<ModuleMeta>('../src/content/modules/m1/module.json').lessons[0].slug)
  await expect(page.getByText('This module is locked')).toHaveCount(0)
})

test('switches the interface and lesson to Spanish', async ({ page }) => {
  await page.goto(`/#/learn/m0/${firstLesson.slug}`)
  await page.getByTestId('locale-toggle').click()
  await expect(page.getByRole('heading', { level: 1, name: firstLesson.title.es })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Marcar como completada' })).toBeVisible()
})
