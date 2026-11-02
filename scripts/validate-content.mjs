#!/usr/bin/env node
// Validates course content: module manifests, MDX syntax, exams, interview bank and glossary.
// Usage: node scripts/validate-content.mjs [moduleId ...]
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'

const ROOT = new URL('../src/content/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LOCALES = ['en', 'es']
const TYPES = ['concept', 'exercise', 'exam', 'project']
const only = process.argv.slice(2)
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    err(path, `invalid JSON (${e.message})`)
    return null
  }
}
const isL10n = (v) => v && LOCALES.every((l) => typeof v[l] === 'string' && v[l].trim().length > 0)
const isL10nList = (v) => v && LOCALES.every((l) => Array.isArray(v[l]) && v[l].every((x) => typeof x === 'string' && x.trim()))

const modulesDir = join(ROOT, 'modules')
const moduleIds = readdirSync(modulesDir).filter((d) => existsSync(join(modulesDir, d, 'module.json')))
const checklistOwners = new Map()

for (const id of moduleIds) {
  if (only.length && !only.includes(id)) continue
  const dir = join(modulesDir, id)
  const meta = readJson(join(dir, 'module.json'))
  if (!meta) continue
  const where = `modules/${id}/module.json`
  if (meta.id !== id) err(where, `id "${meta.id}" must match folder "${id}"`)
  for (const f of ['order', 'days', 'hours']) if (typeof meta[f] !== 'number') err(where, `"${f}" must be a number`)
  if (!isL10n(meta.title)) err(where, 'title needs en + es')
  if (!isL10n(meta.summary)) err(where, 'summary needs en + es')
  if (!Array.isArray(meta.repos)) err(where, 'repos must be an array')
  for (const repo of meta.repos ?? []) {
    if (!repo.id || !repo.name || !isL10n(repo.description)) err(where, `repo ${JSON.stringify(repo.id)} needs id, name, description en+es`)
  }
  const slugs = new Set()
  for (const lesson of meta.lessons ?? []) {
    const lw = `${where} › ${lesson.slug}`
    if (!/^\d{2}-[a-z0-9-]+$/.test(lesson.slug ?? '')) err(lw, 'slug must look like "01-some-name"')
    if (slugs.has(lesson.slug)) err(lw, 'duplicate slug')
    slugs.add(lesson.slug)
    if (!TYPES.includes(lesson.type)) err(lw, `type must be one of ${TYPES.join(', ')}`)
    if (typeof lesson.minutes !== 'number') err(lw, 'minutes must be a number')
    if (!isL10n(lesson.title)) err(lw, 'title needs en + es')
    const ids = {}
    for (const locale of LOCALES) {
      const file = join(dir, `${lesson.slug}.${locale}.mdx`)
      if (!existsSync(file)) {
        if (lesson.type !== 'exam') err(lw, `missing ${lesson.slug}.${locale}.mdx`)
        continue
      }
      const source = readFileSync(file, 'utf8')
      try {
        await compile(source, { remarkPlugins: [remarkGfm] })
      } catch (e) {
        err(`modules/${id}/${lesson.slug}.${locale}.mdx`, `MDX compile error: ${e.message}`)
      }
      // The page renders the title from module.json; an H1 in the MDX duplicates it.
      let inFence = false
      for (const line of source.split(/\r?\n/)) {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
        else if (!inFence && /^# /.test(line)) {
          err(`modules/${id}/${lesson.slug}.${locale}.mdx`, `remove the H1 "${line.slice(0, 50)}" (the page already shows the title; start at ##)`)
          break
        }
      }
      // Current Claude models reject sampling params (400). Catch the common single-line forms.
      for (const line of source.split(/\r?\n/)) {
        if (/(ChatAnthropic|claude-[a-z]+-\d)/.test(line) && /\b(temperature|top_p|top_k)\s*[=:]/.test(line)) {
          err(`modules/${id}/${lesson.slug}.${locale}.mdx`, `sampling params are rejected by current Claude models: "${line.trim().slice(0, 70)}"`)
        }
      }
      ids[locale] = [...source.matchAll(/<Checklist\s+id="([^"]+)"/g)].map((m) => m[1]).sort()
      if (source.trim().split(/\s+/).length < 150 && lesson.type !== 'exam') warn(lw, `${locale} file looks short`)
    }
    if (ids.en && ids.es && ids.en.join() !== ids.es.join())
      err(lw, `Checklist ids differ between en (${ids.en}) and es (${ids.es}); they must match so progress is shared`)
    for (const cid of ids.en ?? []) {
      const owner = checklistOwners.get(cid)
      if (owner && owner !== lw) err(lw, `Checklist id "${cid}" already used in ${owner}`)
      checklistOwners.set(cid, lw)
    }
  }

  // Exam
  if ((meta.lessons ?? []).some((l) => l.type === 'exam')) {
    const examPath = join(ROOT, 'exams', `${id}.json`)
    if (!existsSync(examPath)) err(`exams/${id}.json`, 'missing')
    else {
      const exam = readJson(examPath)
      const ew = `exams/${id}.json`
      if (exam) {
        if (exam.moduleId !== id) err(ew, 'moduleId mismatch')
        if (!isL10n(exam.title)) err(ew, 'title needs en + es')
        if (typeof exam.timeLimitMinutes !== 'number' || typeof exam.passingScore !== 'number')
          err(ew, 'timeLimitMinutes and passingScore must be numbers')
        const qs = exam.questions ?? []
        if (qs.length < 12 || qs.length > 20) err(ew, `needs 12–20 questions, has ${qs.length}`)
        const qids = new Set()
        const typesSeen = new Set()
        for (const q of qs) {
          const qw = `${ew} › ${q.id}`
          if (qids.has(q.id)) err(qw, 'duplicate id')
          qids.add(q.id)
          typesSeen.add(q.type)
          if (!['single', 'multi', 'order', 'code'].includes(q.type)) err(qw, 'bad type')
          if (!isL10n(q.prompt)) err(qw, 'prompt needs en + es')
          if (!isL10n(q.explanation)) err(qw, 'explanation needs en + es')
          if (q.type === 'order') {
            if (!isL10nList(q.items) || q.items.en.length !== q.items.es.length || q.items.en.length < 3)
              err(qw, 'order items need en + es lists of equal length (≥3)')
          } else {
            if (!isL10nList(q.options) || q.options.en.length !== q.options.es.length || q.options.en.length < 2)
              err(qw, 'options need en + es lists of equal length')
            const n = q.options?.en.length ?? 0
            if (!Array.isArray(q.answer) || q.answer.some((a) => !Number.isInteger(a) || a < 0 || a >= n))
              err(qw, 'answer must be valid option indexes')
            if ((q.type === 'single' || q.type === 'code') && q.answer?.length !== 1) err(qw, 'single/code need exactly one answer')
            if (q.type === 'multi' && (q.answer?.length ?? 0) < 2) err(qw, 'multi needs at least two correct answers')
            if (q.type === 'code' && !q.code) err(qw, 'code question needs "code"')
          }
        }
        for (const t of ['single', 'multi', 'order', 'code']) if (!typesSeen.has(t)) err(ew, `no "${t}" question`)
      }
    }
  }

  // Interview bank
  const ivPath = join(ROOT, 'interview', `${id}.json`)
  if (!existsSync(ivPath)) err(`interview/${id}.json`, 'missing')
  else {
    const items = readJson(ivPath) ?? []
    const seen = new Set()
    if (!Array.isArray(items) || items.length < 6) err(`interview/${id}.json`, 'needs an array of at least 6 questions')
    for (const it of items) {
      const iw = `interview/${id}.json › ${it.id}`
      if (!it.id || seen.has(it.id)) err(iw, 'missing or duplicate id')
      seen.add(it.id)
      if (!['mid', 'senior'].includes(it.level)) err(iw, 'level must be mid|senior')
      if (!Array.isArray(it.tags)) err(iw, 'tags must be an array')
      if (!isL10n(it.question) || !isL10n(it.answer)) err(iw, 'question and answer need en + es')
    }
  }
}

// Glossary (always checked)
const glossary = readJson(join(ROOT, 'glossary.json'))
if (glossary) {
  const terms = new Set()
  for (const g of glossary) {
    if (!g.term || !g.module || !g.en || !g.es) err('glossary.json', `entry ${JSON.stringify(g.term)} needs term, module, en, es`)
    if (terms.has(g.term.toLowerCase())) err('glossary.json', `duplicate term "${g.term}"`)
    terms.add(g.term?.toLowerCase())
  }
}

for (const w of warnings) console.warn('WARN ', w)
for (const e of errors) console.error('ERROR', e)
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
