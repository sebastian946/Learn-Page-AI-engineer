# AI Engineer Path

A personal, text-first and project-first learning platform for moving from **Senior SDET to AI Engineer**. It's structured like a Udemy course, without video: every module ends with real artifacts for your GitHub portfolio.

The whole course is bilingual: **English and Spanish** (toggle in the header).

- 10 modules, 40 days, ~240 hours: LLM foundations → RAG → evals & observability → agents & MCP → production serving → data & Databricks → final capstone and job readiness, plus two advanced deep-dives: LLM deployment & LLMOps, and LLM evaluation. See [CURRICULUM.md](CURRICULUM.md).
- Concept lessons, hands-on exercises, timed exams that gate the next module, capstones written as client briefs, an interview question bank and a glossary.
- Progress, exam scores, checklists and repo links are saved in your browser, with JSON export/import.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in dist/ (works on any static host)
npm run preview      # serve the build locally
```

## Test it

```bash
npm test                   # Vitest: progress store, exam scoring, streak, module gating
npx playwright install chromium
npm run test:e2e           # Playwright: complete a lesson, pass an exam, switch language
npm run validate:content   # check every module, exam, interview bank and the glossary
```

## Project layout

```
src/
  content/              # all course content (edit this, not components)
    modules/m0..m9/     # module.json + NN-slug.en.mdx / NN-slug.es.mdx
    exams/m0..m9.json
    interview/m0..m9.json
    glossary.json
  components/           # layout, sidebar, exam runner
  components/mdx/       # Callout, CodeTabs, Checklist, Diagram, InterviewQuestion, Hints, CommitBox, ...
  pages/                # dashboard, lesson, interview prep, glossary
  store/progress.ts     # Zustand store persisted to localStorage
  lib/                  # exam scoring, streaks, course gating
  i18n/                 # UI strings (en, es)
scripts/                # content validator, CURRICULUM.md generator, glossary merge
e2e/                    # Playwright tests
```

## Add or edit content

Read [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md). In short, to add a module:

1. Create `src/content/modules/m10/module.json` (`"order": 10`, titles in `en` and `es`, the lesson list, expected repos).
2. Write `NN-slug.en.mdx` and `NN-slug.es.mdx` for each lesson. MDX components need no imports.
3. Add `src/content/exams/m10.json` (12–20 questions) and `src/content/interview/m10.json`. Add terms to `glossary.json`.
4. Run `npm run validate:content` and `npm run curriculum`, then `npm run dev`.

Design decisions are recorded in [DECISIONS.md](DECISIONS.md).
