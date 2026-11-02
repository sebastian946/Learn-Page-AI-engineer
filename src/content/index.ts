import type { ComponentType } from 'react'
import type { Exam, GlossaryEntry, InterviewItem, LessonMeta, Locale, ModuleMeta } from '../types'
import glossaryData from './glossary.json'

const moduleFiles = import.meta.glob<ModuleMeta>('./modules/*/module.json', {
  eager: true,
  import: 'default',
})

export const modules: ModuleMeta[] = Object.values(moduleFiles).sort((a, b) => a.order - b.order)

export const allLessons: { module: ModuleMeta; lesson: LessonMeta }[] = modules.flatMap((module) =>
  module.lessons.map((lesson) => ({ module, lesson })),
)

export const lessonKey = (moduleId: string, slug: string) => `${moduleId}/${slug}`

export function findLesson(moduleId: string, slug: string) {
  const index = allLessons.findIndex((l) => l.module.id === moduleId && l.lesson.slug === slug)
  if (index === -1) return null
  return {
    ...allLessons[index],
    prev: allLessons[index - 1] ?? null,
    next: allLessons[index + 1] ?? null,
  }
}

type MdxModule = { default: ComponentType<{ components?: Record<string, unknown> }> }
const lessonFiles = import.meta.glob<MdxModule>('./modules/*/*.mdx')

/** Loads a lesson's MDX in the requested locale, falling back to English. */
export function lessonLoader(moduleId: string, slug: string, locale: Locale) {
  const preferred = `./modules/${moduleId}/${slug}.${locale}.mdx`
  const fallback = `./modules/${moduleId}/${slug}.en.mdx`
  return lessonFiles[preferred] ?? lessonFiles[fallback] ?? null
}

export const hasLocaleFile = (moduleId: string, slug: string, locale: Locale) =>
  `./modules/${moduleId}/${slug}.${locale}.mdx` in lessonFiles

const examFiles = import.meta.glob<Exam>('./exams/*.json', { import: 'default' })

export async function loadExam(moduleId: string): Promise<Exam | null> {
  const loader = examFiles[`./exams/${moduleId}.json`]
  return loader ? loader() : null
}

const interviewFiles = import.meta.glob<InterviewItem[]>('./interview/*.json', {
  eager: true,
  import: 'default',
})

export const interviewBank: (InterviewItem & { module: string })[] = Object.entries(interviewFiles)
  .flatMap(([path, items]) => {
    const module = path.match(/\/(m\d+)\.json$/)?.[1] ?? 'm0'
    return items.map((item) => ({ ...item, module }))
  })
  .sort((a, b) => a.module.localeCompare(b.module))

export const glossary = (glossaryData as GlossaryEntry[])
  .slice()
  .sort((a, b) => a.term.localeCompare(b.term))
