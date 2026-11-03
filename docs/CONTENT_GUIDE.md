# Content authoring guide

All course content lives in `src/content/`. You never need to touch React components to add or edit lessons.

```
src/content/
  modules/<module-id>/
    module.json            # module manifest: titles, lesson order, expected repos
    01-some-lesson.en.mdx  # English lesson
    01-some-lesson.es.mdx  # Spanish lesson (same slug)
    ...
  exams/<module-id>.json   # exam questions, both languages in one file
  interview/<module-id>.json  # interview bank for the module
  glossary.json            # all glossary terms
```

Module ids are `m0` … `m10`. Run `npm run validate:content` (or `node scripts/validate-content.mjs m3`) after every change.

## module.json

```json
{
  "id": "m1",
  "order": 1,
  "days": 3,
  "hours": 18,
  "title": { "en": "LLM foundations for engineers", "es": "Fundamentos de LLM para ingenieros" },
  "summary": { "en": "One or two sentences.", "es": "Una o dos frases." },
  "lessons": [
    { "slug": "01-tokens-and-context", "type": "concept", "minutes": 40, "title": { "en": "...", "es": "..." } },
    { "slug": "05-ex-llm-client", "type": "exercise", "minutes": 90, "title": { "en": "...", "es": "..." } },
    { "slug": "09-exam", "type": "exam", "minutes": 25, "title": { "en": "Module 1 exam", "es": "Examen del módulo 1" } },
    { "slug": "10-capstone-ticket-router", "type": "project", "minutes": 1200, "title": { "en": "...", "es": "..." } }
  ],
  "repos": [
    { "id": "m1-llm-client", "name": "llm-provider-client", "description": { "en": "...", "es": "..." } }
  ]
}
```

- `slug` must match `NN-kebab-case`. Lessons render in array order.
- `type` is one of `concept`, `exercise`, `exam`, `project` (capstone).
- Each lesson needs `<slug>.en.mdx` and `<slug>.es.mdx`. Exam lessons may omit MDX, but a short intro is recommended.
- `repos` feed the dashboard's portfolio tracker. Repo `id`s must be unique across the course.

## Lesson page types

| type | What the page shows |
|---|---|
| `concept` | MDX + "Mark complete" |
| `exercise` | MDX (use the exercise components below) + "Mark complete" |
| `exam` | MDX intro + the exam runner fed by `exams/<module-id>.json`. Completes automatically on a pass (≥ passingScore). |
| `project` | MDX client brief + "Mark complete" |

The **next module unlocks** when the previous module's exam best score is ≥ 70% (or the learner clicks "Unlock anyway").

## MDX components (no imports needed)

````mdx
<Callout type="tip|warning|interview|info" title="Optional title">
Markdown content.
</Callout>

<CodeTabs>
```python
print("hi")
```
```typescript
console.log("hi")
```
</CodeTabs>

<Checklist id="m1-ex1-review" title="Self-review" items={["Item one", "Item two"]} />

<Diagram caption="Optional caption" chart={`flowchart LR
  A[Query] --> B["Retriever (hybrid)"]
  B --> C[LLM]`} />

<InterviewQuestion question="Why use structured outputs?" level="mid">
Model answer in markdown.
</InterviewQuestion>

<AcceptanceCriteria>
- [ ] Criterion one
- [ ] Criterion two
</AcceptanceCriteria>

<StarterCode>
```python
...
```
</StarterCode>

<Hints>
  <Hint>First, gentle hint.</Hint>
  <Hint>Second, more specific hint.</Hint>
</Hints>

<CommitBox repo="llm-provider-client">
Folder structure, README outline, commit message suggestions (markdown).
</CommitBox>

<ClientBrief company="Northwind Mortgage" industry="Fintech / Mortgage lending" duration="5 days" />
````

### Rules that keep MDX compiling

- `{`, `}` and `<` in prose are JSX syntax. Put them in `inline code` or code blocks, or rephrase ("under 200 ms", not "<200ms").
- Don't start with a `# Title`. The page already renders the title from `module.json`; start sections at `##`.
- No HTML comments (`<!-- -->`). Use `{/* comment */}`.
- Leave a blank line after an opening component tag and before its closing tag when the content is markdown.
- Array props are JS: `items={["a", "b"]}`. Escape inner double quotes or use single quotes for the string.
- `Checklist` ids are global and must be unique across the course. Use the **same ids in the en and es files** of a lesson so progress is shared between languages. Pattern: `<module>-<lesson-number>-<name>`, e.g. `m2-07-review`.
- Mermaid in `<Diagram>`: no backticks or `${` in the chart. Quote labels with punctuation: `A["Embed (batch)"]`.
- Fenced code blocks need a language: `python`, `typescript`, `bash`, `yaml`, `json`, `dockerfile`, `sql`, `toml`, `text`, …

## Lesson templates

**Concept lesson:** explanation → code example → common mistakes → how this shows up in interviews (`<InterviewQuestion>` / `<Callout type="interview">`) → further reading (real, stable links).

**Exercise (30–90 min):** goal/context → `<AcceptanceCriteria>` → `<StarterCode>` → `<Hints>` → `<CommitBox>` (repo name, folder tree, README outline) → self-review `<Checklist>`.

**Capstone (client brief):** `<ClientBrief>` → company context → stakeholders → business goal → functional requirements → non-functional requirements (latency, cost per 1k requests, accuracy target) → out of scope → deliverables → acceptance criteria → suggested architecture `<Diagram>` → evaluation rubric (table) → suggested timeline (3–5 days) → Definition of Done `<Checklist>` → how to present this in an interview.

## exams/<module-id>.json

```json
{
  "moduleId": "m1",
  "title": { "en": "Module 1 exam", "es": "Examen del módulo 1" },
  "timeLimitMinutes": 25,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "prompt": { "en": "...", "es": "..." },
      "options": { "en": ["A", "B", "C", "D"], "es": ["A", "B", "C", "D"] },
      "answer": [2],
      "explanation": { "en": "...", "es": "..." }
    },
    { "id": "q2", "type": "multi", "...": "answer has ≥ 2 indexes" },
    {
      "id": "q3",
      "type": "order",
      "prompt": { "en": "Order the RAG ingestion steps", "es": "..." },
      "items": { "en": ["Load", "Clean", "Chunk", "Embed", "Index"], "es": ["..."] },
      "explanation": { "en": "...", "es": "..." }
    },
    {
      "id": "q4",
      "type": "code",
      "prompt": { "en": "What does this LangGraph node return?", "es": "..." },
      "code": "def node(state):\n    return {\"count\": state[\"count\"] + 1}",
      "codeLang": "python",
      "options": { "en": ["..."], "es": ["..."] },
      "answer": [0],
      "explanation": { "en": "...", "es": "..." }
    }
  ]
}
```

- 12–20 questions, at least one of each type. `items` are written in the **correct** order; the app shuffles them.
- Options and answers are shuffled on every attempt, so never write "all of the above" or "both A and B".
- Code in `code` is shared across languages.

## interview/<module-id>.json

```json
[
  {
    "id": "m1-iv-01",
    "level": "mid",
    "tags": ["structured-output", "pydantic"],
    "question": { "en": "...", "es": "..." },
    "answer": { "en": "Paragraphs separated by blank lines. Lines starting with \"- \" become bullets. `code` and **bold** work.", "es": "..." }
  }
]
```

## glossary.json

```json
[{ "term": "Embedding", "termEs": "Embedding", "module": "m2", "en": "Definition.", "es": "Definición." }]
```

## Adding a new module

1. Create `src/content/modules/m11/module.json` with `"order": 11`.
2. Add `NN-slug.en.mdx` and `NN-slug.es.mdx` for each lesson.
3. Add `exams/m11.json` and `interview/m11.json`. Add terms to `glossary.json`.
4. Run `npm run validate:content`, then `npm run dev`. The module shows up in the sidebar, dashboard and portfolio tracker automatically.
