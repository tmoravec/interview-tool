# Implementation Plan: Interview Prep Tool

**Created**: 2026-03-10
**Original Request**: Implement the tool described in plans/prd.md

---

## Context Summary

Fresh repository — only the PRD and `ralph.sh` exist. No existing code, dependencies, or build tooling. The PRD is complete and unambiguous:

- Vanilla JS + Bootstrap 5 + marked.js (all via CDN)
- Single HTML file + single JS file for the frontend
- One Vercel serverless function (`api/generate.js`) as the backend
- Thin lib layer: prompts, defaults, response processor
- Zero npm dependencies
- Node's built-in `node:test` for tests
- `server.js` for local dev
- Auth: single password via `X-App-Password` header, stored in `sessionStorage`
- File handling: frontend converts files to Base64 Data URIs; backend forwards directly to OpenRouter multimodal API
- No server-side PDF parsing

---

## High-Level Implementation Plan

### Overview

A two-tab single-page web app where **Interviewer** mode generates a tailored interview guide for assessing a candidate, and **Candidate** mode generates a preparation guide for a person going into an interview. All AI work is done by a single Vercel serverless function that calls the OpenRouter API.

### Approach

Build scaffolding first, then tests (TDD-style), then implementation:

1. **Scaffolding first** — `package.json`, `vercel.json`, `.gitignore`, `.env.local`. This gives a runnable test harness before any logic exists.
2. **Tests second** — write all unit tests up-front against the not-yet-implemented lib modules. Tests will fail until the lib layer is written, acting as a living spec.
3. **Lib layer third** — implement `lib/defaults.js`, `lib/prompts.js`, `lib/processor.js` until all tests pass.
4. **Backend fourth** — serverless function wiring the lib layer together.
5. **Frontend fifth** — HTML skeleton, then JS behaviour.
6. **Local dev server** — thin wrapper so everything runs with `node server.js`.
7. **Docs** — `README.md` last, once everything is working.

Writing tests before implementation keeps the lib API honest and ensures correctness is verified continuously as the lib layer is built out.

### Key Components

| Component | Location | Description |
|---|---|---|
| Default templates | `lib/defaults.js` | Hardcoded Markdown strings for Interviewer and Candidate default templates |
| Prompt builder | `lib/prompts.js` | `getPrompt(mode, inputs)` returns the full messages array for the OpenRouter call |
| Response processor | `lib/processor.js` | Extracts Markdown from the API response; surfaces structured errors |
| Serverless function | `api/generate.js` | Auth check, input validation, OpenRouter call, error responses |
| Frontend HTML | `public/index.html` | Single page; Bootstrap 5 + marked.js via CDN; two tabs |
| Frontend JS | `public/app.js` | Tab switching, file → Base64, size validation, fetch, render, copy |
| Local dev server | `server.js` | Serves `public/` statically; proxies `/api/*` to `api/generate.js` |
| Tests | `test/prompts.test.js`, `test/processor.test.js` | Unit tests using `node:test` |

### Dependencies

- **Bootstrap 5 (CDN)** — responsive layout, tabs, spinners
- **marked.js (CDN)** — Markdown rendering in the browser
- **OpenRouter API** — AI model access (multimodal, supports PDF Data URIs)
- **Node.js built-in `node:test`** — unit tests
- **Vercel** — deployment platform (serverless functions + static hosting)

No npm dependencies whatsoever.

---

## TODO List

### Phase 1 — Project scaffolding

- [x] 1. Create `package.json` — name, version, `"type": "module"`, `scripts.test`, `scripts.start`
- [x] 2. Create `vercel.json` — route `/api/*` to the serverless function, serve `public/` as static root
- [x] 3. Create `.gitignore` — `node_modules/`, `.env.local`, `.env`
- [x] 4. Create `.env.local` — placeholder entries for `OPENROUTER_API_KEY`, `MODEL`, `APP_PASSWORD`, `DEBUG`

### Phase 2 — Tests (written before implementation)

- [x] 5. Create `test/prompts.test.js`
  - Use `node:test` and `node:assert`
  - Test `getPrompt('interviewer', ...)` with all text inputs → verify system prompt contains expected keywords, user parts contain text items
  - Test `getPrompt('candidate', ...)` with all text inputs → same
  - Test with a file input (Base64 object) → verify `image_url` part is included
  - Test that a custom template replaces the default
  - Test `ValidationError` thrown when `cv` is missing
  - Test `ValidationError` thrown when `jobDescription` is missing

- [x] 6. Create `test/processor.test.js`
  - Test `extractMarkdown` with a well-formed OpenRouter response → returns expected string
  - Test `extractMarkdown` with a response that has no choices → throws `ModelError`
  - Test `extractMarkdown` with an empty content string → throws `ModelError`
  - Test error class shapes: `.message` is a string, `.code` is a defined constant

### Phase 3 — Lib layer (make tests pass)

- [x] 7. Create `lib/defaults.js`
  - Export `INTERVIEWER_DEFAULT` — a competency-based interview guide template (Markdown string) covering problem-solving, learning mindset, collaboration, communication; includes questions, follow-up probes, scorecard
  - Export `CANDIDATE_DEFAULT` — a preparation guide template (Markdown string) covering company strategy, team dynamics, role clarity, career growth, process; plus standard answers section with prompts
- [x] 8. Create `lib/prompts.js`
  - Export `getPrompt(mode, inputs)` → returns `{ systemPrompt: string, userMessageParts: array }`
  - `mode`: `"interviewer"` | `"candidate"`
  - `inputs`: `{ cv, jobDescription, companyContext, template }` — each may be `null`, a plain-text string, or a Base64 Data URI object `{ mimeType, data }`
  - Builds a system prompt that: states the mode, instructs the model to output **only Markdown**, references the template (or uses the relevant default), describes the expected output structure
  - Assembles the `userMessageParts` array: text items for each text input; `image_url` items (with `data:` URI) for each file input; follows OpenRouter multimodal format
  - Validates required fields (`cv`, `jobDescription`) and throws `ValidationError` if missing
- [x] 9. Create `lib/processor.js`
  - Export `extractMarkdown(apiResponse)` — pulls the Markdown string out of the OpenRouter response; throws `ModelError` if the response is malformed or empty
  - Export named error classes: `ValidationError`, `AuthError`, `ModelError`, `NetworkError`
  - All errors carry a user-visible `.message` and a machine-readable `.code`
- [x] 10. Run `node --test` — all tests must pass before proceeding

### Phase 4 — Backend

- [x] 11. Create `api/generate.js`
  - Load env vars (`OPENROUTER_API_KEY`, `MODEL`, `APP_PASSWORD`, `DEBUG`)
  - Export a Vercel-compatible handler: `export default async function handler(req, res)`
  - Reject non-POST requests with 405
  - Check `X-App-Password` header against `APP_PASSWORD`; return 401 on mismatch with JSON `{ error: "Invalid password" }`
  - Parse JSON body; call `getPrompt(mode, inputs)` — return 400 on `ValidationError`
  - Build OpenRouter request: `model`, `messages` (system + user with multimodal parts), `max_tokens` (reasonable default, e.g. 8000)
  - Call OpenRouter with `Authorization: Bearer <key>` and `HTTP-Referer` header
  - Call `extractMarkdown(response)` and return `{ markdown }` with 200
  - Catch all errors; map to HTTP status + JSON `{ error: "<user-visible message>" }`
  - `DEBUG=true` logs full request/response to stderr

### Phase 5 — Frontend

- [x] 12. Create `public/index.html`
  - Bootstrap 5 from CDN (CSS + JS bundle)
  - marked.js from CDN
  - Two tab buttons: **Interviewer** / **Candidate**
  - Interviewer tab pane:
    - CV field: textarea (paste) + file input (.pdf, .txt, .md)
    - Job Description field: textarea + file input
    - Company Context field: textarea + file input (optional)
    - Interview Template field: textarea + file input (.md) (optional)
    - **Generate** button with spinner
  - Candidate tab pane: identical field set
  - Output panel (shared or per-tab, below the active form): rendered Markdown area + **Copy** button
  - Error alert area (dismissible Bootstrap alert)
  - `<script src="app.js">` at end of body
  - Mobile-first responsive layout (Bootstrap grid)

- [x] 13. Create `public/app.js`
  - **Tab switching**: on tab click, clear form fields + output + errors for the newly selected tab; record active mode
  - **File → Base64**: `readFileAsDataURI(file)` — wraps `FileReader.readAsDataURL` in a Promise; returns `{ mimeType, data }` (strip the `data:<mime>;base64,` prefix and store separately, or pass the full URI — match what the prompts builder expects)
  - **Size validation**: before submission, sum all selected file sizes; if total > 3 MB, show error and abort
  - **Password management**: `getPassword()` — reads from `sessionStorage`; if absent, prompts user; `clearPassword()` — removes from `sessionStorage`
  - **Generate handler**: on button click →
    1. Collect text + file values for active tab
    2. Validate size
    3. Convert files to Base64
    4. Disable button, show spinner
    5. `POST /api/generate` with JSON body `{ mode, inputs }` and `X-App-Password` header
    6. On 401: `clearPassword()`, re-prompt, retry once
    7. On success: render Markdown with `marked.parse()`, show output panel
    8. On error: show dismissible alert with user-visible message
    9. Re-enable button, hide spinner
  - **Copy button**: `navigator.clipboard.writeText(rawMarkdown)`
  - **File precedence**: if both file and textarea are filled, file takes precedence
  - **Error messages**: define a map of error codes → human strings; fallback to server's `.error` field

### Phase 6 — Local dev server

- [x] 14. Create `server.js`
  - Pure Node.js, no framework, no npm deps
  - Serves files from `public/` as static assets (correct MIME types for `.html`, `.js`, `.css`)
  - Routes `POST /api/generate` to `api/generate.js` handler
  - Loads `.env.local` manually (simple `fs.readFileSync` + line-by-line parse → `process.env`)
  - Listens on `PORT` env var or `3000`
  - Logs requests to stdout

### Phase 7 — Documentation

- [x] 15. Create `README.md`
  - Purpose and overview
  - Prerequisites (Node 18+, Vercel CLI)
  - Local dev setup: clone → copy `.env.local` → `node server.js`
  - Deployment: `vercel deploy` + environment variables to set
  - Environment variable reference
  - How to use (both modes, file upload notes)
  - Tech stack summary

---

## Testing Strategy

### Unit Tests

- **`lib/prompts.js`**: verify prompt structure for each mode, text vs. file input handling, template override logic, required-field validation
- **`lib/processor.js`**: verify Markdown extraction from valid API responses, error handling for malformed/empty responses

### Integration Tests

Not in scope for v1 (would require real API calls). Manual testing covers the integration path.

### Manual Testing

1. `node server.js` — confirm server starts on port 3000
2. Open `http://localhost:3000` — confirm page loads with two tabs
3. Interviewer tab: paste text into all fields → click Generate → confirm Markdown renders
4. Interviewer tab: upload a PDF CV + paste JD → confirm file takes precedence → confirm generation works
5. Interviewer tab: upload a custom `.md` template → confirm output follows that structure
6. Candidate tab: repeat steps 3–5
7. Switch tabs — confirm form and output clears
8. Submit with wrong password → confirm 401 error message, then re-prompt
9. Omit CV field → confirm user-visible validation error
10. Upload a file combination totalling > 3 MB → confirm size-limit error before any network call
11. Test on a mobile viewport (Chrome DevTools device emulation)
12. Copy button — confirm raw Markdown is in clipboard
13. Deploy to Vercel → run steps 3–9 on the live URL

### Test Execution

```bash
node --test
```

---

## Files to Create/Modify

| File | Action | Phase | Purpose |
|------|--------|-------|---------|
| `package.json` | Create | 1 | Project metadata, `"type": "module"`, test and start scripts |
| `vercel.json` | Create | 1 | Routing: `/api/*` → function, `/` → static |
| `.gitignore` | Create | 1 | Exclude `.env.local`, `node_modules/` |
| `.env.local` | Create | 1 | Local environment variable placeholders (gitignored) |
| `test/prompts.test.js` | Create | 2 | Unit tests for prompt construction — written before lib |
| `test/processor.test.js` | Create | 2 | Unit tests for response handling — written before lib |
| `lib/defaults.js` | Create | 3 | Default Markdown templates for both modes |
| `lib/prompts.js` | Create | 3 | `getPrompt(mode, inputs)` + `ValidationError` |
| `lib/processor.js` | Create | 3 | `extractMarkdown()` + error classes |
| `api/generate.js` | Create | 4 | Vercel serverless handler |
| `public/index.html` | Create | 5 | Single-page UI |
| `public/app.js` | Create | 5 | All frontend logic |
| `server.js` | Create | 6 | Local dev HTTP server |
| `README.md` | Create | 7 | Project documentation |

---

## Notes

### OpenRouter multimodal format

OpenRouter accepts Base64 content via the `image_url` field using a `data:` URI even for PDFs (when the model supports it). The user message parts array for a multimodal message looks like:

```json
[
  { "type": "text", "text": "Here is the candidate CV:" },
  { "type": "image_url", "image_url": { "url": "data:application/pdf;base64,<data>" } }
]
```

`lib/prompts.js` should produce exactly this shape so `api/generate.js` can forward it verbatim.

### Password flow edge case

If the user dismisses the password prompt, generation should silently abort (no error shown). Only show an error if a request was actually made and failed.

### Tab clearing

When the user switches tabs, clear: all form field values, any file input selections (set `.value = ""`), the output panel content, and the error alert. Do **not** clear `sessionStorage` password.

### File field UX

Each file-accepting field has a `<textarea>` (paste) alongside a `<input type="file">`. Both are visible simultaneously. The JS reads the file first; if no file is selected, it falls back to textarea content. A small note below each field explains precedence.

### Template handling in prompts

`getPrompt` should inject the template (user-provided or default) into the system prompt with a clear delimiter so the model understands it as a structural guide, not content to copy verbatim.

### Vercel function timeout

Default Vercel hobby plan function timeout is 10s. OpenRouter calls for long documents could exceed this. Set the function `maxDuration` to 60s in `vercel.json` (Pro plan) or document the limitation for hobby plan in the README.

### `"type": "module"` and Vercel

Vercel serverless functions support ES modules when `"type": "module"` is set in `package.json`. The handler export must be `export default function`. The local dev server must also use `import` syntax.

---

## Context Files (Auto-Generated)

The following files were examined during planning:

- `plans/prd.md`: Full product requirements — primary source of truth for this plan
- `ralph.sh`: Utility loop script (not relevant to implementation)
- `.git/config`: Confirms fresh single-branch repo with no remotes yet
