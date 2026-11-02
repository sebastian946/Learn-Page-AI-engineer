import { BookOpen, FileQuestion, Hammer, Rocket } from 'lucide-react'
import type { LessonType } from '../types'

const icons = { concept: BookOpen, exercise: Hammer, exam: FileQuestion, project: Rocket }

export const typeColors: Record<LessonType, string> = {
  concept: 'text-sky-500',
  exercise: 'text-amber-500',
  exam: 'text-rose-500',
  project: 'text-violet-500',
}

export function LessonTypeIcon({ type, className = 'h-4 w-4' }: { type: LessonType; className?: string }) {
  const Icon = icons[type]
  return <Icon className={`${className} ${typeColors[type]}`} aria-hidden />
}
