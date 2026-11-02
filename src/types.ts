export type Locale = 'en' | 'es'
export type L10n = Record<Locale, string>
export type L10nList = Record<Locale, string[]>

export type LessonType = 'concept' | 'exercise' | 'exam' | 'project'

export interface LessonMeta {
  slug: string
  type: LessonType
  minutes: number
  title: L10n
}

export interface RepoMeta {
  id: string
  name: string
  description: L10n
}

export interface ModuleMeta {
  id: string
  order: number
  days: number
  hours: number
  title: L10n
  summary: L10n
  lessons: LessonMeta[]
  repos: RepoMeta[]
}

export type QuestionType = 'single' | 'multi' | 'order' | 'code'

export interface ExamQuestion {
  id: string
  type: QuestionType
  prompt: L10n
  /** Code snippet shown with the prompt (code-reading questions). */
  code?: string
  codeLang?: string
  /** Options for single / multi / code questions. */
  options?: L10nList
  /** Indexes of the correct options (single / multi / code). */
  answer?: number[]
  /** Steps in the CORRECT order (order questions). Shuffled at display time. */
  items?: L10nList
  explanation: L10n
}

export interface Exam {
  moduleId: string
  title: L10n
  timeLimitMinutes: number
  passingScore: number
  questions: ExamQuestion[]
}

export type Seniority = 'mid' | 'senior'

export interface InterviewItem {
  id: string
  level: Seniority
  tags: string[]
  question: L10n
  answer: L10n
}

export interface GlossaryEntry {
  term: string
  termEs?: string
  module: string
  en: string
  es: string
}
