#!/usr/bin/env node
// Merges glossary fragment files (one JSON array per module) into src/content/glossary.json.
// Existing terms win; duplicates (case-insensitive) are skipped. Usage:
//   node scripts/merge-glossary.mjs path/to/m1.json path/to/m2.json ...
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const target = fileURLToPath(new URL('../src/content/glossary.json', import.meta.url))
const glossary = JSON.parse(readFileSync(target, 'utf8'))
const seen = new Set(glossary.map((g) => g.term.toLowerCase()))
let added = 0
const skipped = []

for (const file of process.argv.slice(2).sort()) {
  for (const entry of JSON.parse(readFileSync(file, 'utf8'))) {
    const key = entry.term.toLowerCase()
    if (seen.has(key)) {
      skipped.push(`${entry.term} (${entry.module})`)
      continue
    }
    seen.add(key)
    glossary.push({ term: entry.term, termEs: entry.termEs, module: entry.module, en: entry.en, es: entry.es })
    added++
  }
}

glossary.sort((a, b) => a.term.localeCompare(b.term))
writeFileSync(target, JSON.stringify(glossary, null, 2) + '\n')
console.log(`Added ${added} terms (${glossary.length} total).`)
if (skipped.length) console.log(`Skipped duplicates: ${skipped.join(', ')}`)
