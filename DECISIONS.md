# Decisions

Choices made while building the platform where the spec left room. Newest last.

## Bilingual content (English + Spanish)
- **Lesson files per locale:** `NN-slug.en.mdx` and `NN-slug.es.mdx` sit side by side in each module folder. A missing Spanish file falls back to English with a notice.
- **Structured data keeps both languages in one file:** exams, interview questions, module manifests and the glossary use `{ "en": "...", "es": "..." }` fields. This keeps one source of truth for answers, ids and order, so a translation can never change which option is correct.
- **UI strings** live in `src/i18n/index.ts`. The Spanish dictionary is typed against the English keys, so a missing translation fails the type-check.
- **Language is a user preference** stored with the progress (and included in export/import). Progress is shared across languages: completing a lesson in Spanish completes it in English too.
- **Code is identical in both languages.** Identifiers and code comments stay in English, as they would in a real codebase. Industry terms (prompt, embeddings, chunking, evals) stay in English inside Spanish prose.
- **Checklist ids** are shared between the en/es files of a lesson so checklist state is language-independent. The validator enforces this.

## Content pipeline
- **Lesson metadata lives in `module.json`, not MDX frontmatter.** The sidebar, dashboard and portfolio tracker need every lesson's title, type and duration up front. Keeping it in JSON avoids bundling every MDX file into the main chunk. MDX files are lazy-loaded per lesson.
- **Exercise and capstone pages are MDX + components** (`<AcceptanceCriteria>`, `<StarterCode>`, `<Hints>`, `<CommitBox>`, `<ClientBrief>`, `<Checklist>`), not a rigid JSON schema. Authors keep full control of the writing; the components give each section a consistent look.
- **Syntax highlighting runs at build time** with `@shikijs/rehype` (dual light/dark themes through CSS variables), so lessons ship no highlighter JS. Exam code snippets come from JSON, so they use a lazy-loaded Shiki core with only the 9 grammars the exams use.
- **Mermaid is lazy-loaded** on the first `<Diagram>`. It is large (~700 kB) and most pages don't need it.
- **`scripts/validate-content.mjs`** compiles every MDX file and checks manifests, exams (12–20 questions, all four types, valid answer indexes, en/es parity), interview banks and the glossary. It runs in CI.
- **`CURRICULUM.md` is generated** from the manifests (`npm run curriculum`), so it can't drift from the app.

## App behaviour
- **Hash routing** (`/#/learn/...`). The static build then works on any file host (GitHub Pages, S3, `vite preview`) with no rewrite rules. `base: './'` makes asset paths relative for the same reason.
- **Module gate:** a module unlocks when the previous module's exam *best* score is ≥ 70%. "Unlock anyway" asks for confirmation and is stored per module. Module 0 is always open.
- **Exam lessons complete automatically** on a passing attempt. Other lesson types use "Mark complete".
- **Exam scoring is all-or-nothing per question.** Multi-select needs the exact set; ordering needs the exact sequence. Partial credit would make 70% too easy to reach by guessing.
- **Retakes shuffle** question order, option order and the starting order of "order the steps" items. Answers are stored as original indexes, so shuffling never affects scoring.
- **The timer auto-submits** when it reaches zero.
- **Streak** = consecutive local calendar days with at least one lesson completed, ending today. It stays alive until the end of the day after your last activity. It's derived from completion dates, so un-completing a lesson can shorten it.
- **Progress storage:** one Zustand store persisted to `localStorage` (key `ai-engineer-progress`, versioned). Export produces `{ version, exportedAt, data }`; import validates the shape and fills missing fields with defaults.
- **Portfolio tracker** takes repos from every module's `repos` array and only counts a repo as linked when the URL looks like `https://github.com/<user>/<repo>`.
- **Interview answers and glossary entries are plain text** with a tiny renderer (paragraphs, `- ` bullets, `code`, **bold**). That's enough for the content and avoids a runtime markdown parser.

## Curriculum
- **Module 0 has a short exam too**, so the unlock rule is the same for every module. It has an exercise (portfolio hub repo) instead of a capstone.
- **Module 2 has 20 lessons** (6 days). Each technique gets a concept lesson and most get an exercise, as the spec asks ("one per technique").
- **One lab repo per module for exercises** (one folder per exercise) plus one repo per capstone. This keeps the portfolio to about 14 focused repos instead of 40 small ones. Module 5's exercises extend `mortgage-knowledge-assistant` from Module 2 rather than creating a new repo, as the spec says to deploy the Module 2 project.
- **Advanced modules 8 and 9 (added on request):** deployment & LLMOps (release strategies, Kubernetes autoscaling, self-hosted serving with vLLM, AI gateways, Terraform, Bedrock, model/prompt release management, DR and compliance) and advanced LLM evaluation (metrics taxonomy, statistical rigor, human evaluation, judge calibration, eval frameworks, synthetic/metamorphic tests, multi-turn and production eval loops). They are new modules rather than extensions of Modules 3 and 5, so the core path stays at 32 days and the basics aren't repeated. They follow the same gate rule (after Module 7) and "unlock anyway" lets you take them earlier.
- **Module 10, System One models & Jev (added on request, Nov 2026):** TypeSafe AI's Jev is a non-autoregressive "decision" model (Choice / Score / Noul primitives with probabilities and confidence) that was announced in September 2026. The module is written from the official docs downloaded on 2026-11-03 and treats vendor speed/cost claims as vendor claims. Because the product is in early access and its API may change, the lessons pin the facts to `jev-1.14.0` and tell the learner to check the docs. It is positioned as the typed decision layer inside LLM systems (routing, guardrails, re-ranking, verification), not as an LLM replacement, and it reuses the M2 and M4 repos for exercises.
- **Model names and prices:** content uses the current Claude model ids (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`). Other providers' model names and all prices are labelled as examples to check against the provider's current pricing, because they change often.
- **Job-market numbers:** the spec gives a skill ranking but no exact figures, so the content describes demand in tiers and doesn't invent percentages.

## Tooling
- Vite 6, React 18, TypeScript 5 (strict), Tailwind CSS 3 with `@tailwindcss/typography`, Zustand 5, react-router-dom 6, MDX 3, Shiki 3, Mermaid 11, lucide-react icons.
- Vitest (jsdom) for the progress store, exam scoring, streak and unlock logic. Playwright for e2e: complete a lesson, pass an exam using the real exam JSON, switch language.
- A GitHub Actions workflow runs content validation, unit tests, the build and e2e tests.
