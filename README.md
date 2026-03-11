# Interview Prep Tool

A single-page web app that generates tailored interview preparation documents in seconds using AI. Supports two modes:

- **Interviewer mode** — produce a competency-based interview guide for assessing a specific candidate
- **Candidate mode** — produce a preparation guide for a person going into an interview

Output is structured Markdown, ready to paste into Obsidian or any Markdown editor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS + Bootstrap 5 + marked.js (all via CDN) |
| Backend | Single Vercel serverless function (Node.js, no framework) |
| AI | OpenRouter API (multimodal — accepts PDF and text) |
| Tests | Node.js built-in `node:test` |
| Dependencies | **Zero npm dependencies** |

---

## Prerequisites

- Node.js 18 or later
- An [OpenRouter](https://openrouter.ai/) API key
- [Vercel CLI](https://vercel.com/docs/cli) (for deployment only)

---

## Local Development

### 1. Clone the repository

```bash
git clone <repo-url>
cd interview-prep-tool
```

### 2. Configure environment variables

Copy the provided template and fill in your values:

```bash
cp .env.local.example .env.local   # or edit .env.local directly
```

`.env.local` (gitignored — **never committed**):

```
OPENROUTER_API_KEY=your-openrouter-api-key-here
MODEL=google/gemini-2.5-flash-preview
APP_PASSWORD=your-secret-password-here
DEBUG=false
```

See [Environment Variables](#environment-variables) for details.

### 3. Start the dev server

```bash
node server.js
```

The server listens on port 3000 by default (override with the `PORT` environment variable).

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run the tests

```bash
node --test
# or
npm test
```

All tests run against the lib layer only — no API calls, no network required.

---

## Deployment

### 1. Install the Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel deploy
```

Follow the prompts to link or create a project.

### 3. Set environment variables in Vercel

In the [Vercel dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `MODEL` | Model identifier (see below) |
| `APP_PASSWORD` | Password users must enter to use the tool |
| `DEBUG` | `true` to enable verbose server-side logging (optional) |

Or use the CLI:

```bash
vercel env add OPENROUTER_API_KEY
vercel env add MODEL
vercel env add APP_PASSWORD
```

### 4. Redeploy to pick up env vars

```bash
vercel deploy --prod
```

---

## Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | **Yes** | — |
| `MODEL` | OpenRouter model identifier, e.g. `google/gemini-2.5-flash-preview` | **Yes** | — |
| `APP_PASSWORD` | Shared password for API access | **Yes** | — |
| `DEBUG` | Set to `true` to log full request/response to stderr | No | `false` |

> **Note:** The default Vercel hobby plan has a 10-second function timeout. The `vercel.json` in this repo sets `maxDuration: 60`, which requires a Pro plan. On the hobby plan, generation of long documents may time out. Either upgrade to Pro or expect occasional timeouts on large inputs.

---

## How to Use

### Both Modes

1. Open the app in your browser.
2. Click **Generate** — you will be prompted for the app password once per browser session.
3. The output panel renders the Markdown below the form.
4. Click **Copy** to copy the raw Markdown to your clipboard.
5. Paste into Obsidian (or any Markdown editor) and review.

Switching tabs clears the form, output, and any errors. Your password is not cleared.

### Interviewer Mode

Fill in at least **CV** and **Job Description**, then click **Generate**. Optionally add:

- **Company Context** — any background on the company, team, or hiring process
- **Interview Template** — a custom `.md` file or pasted Markdown to override the built-in structure

Output: a competency-based interview guide with tailored questions, candidate-specific probes, follow-up questions, red flags, and a scorecard template.

### Candidate Mode

Fill in at least **CV** and **Job Description**, then click **Generate**. The same optional fields apply.

Output: a preparation guide with likely interview questions, angle breakdowns, strong-answer guidance, questions to ask the interviewer, and a "tell me about yourself" prompt.

### File Uploads

Each field accepts either **pasted text** or a **file upload** (`.pdf`, `.txt`, `.md`). If both are provided, the file takes precedence.

**File size limit:** The combined size of all uploaded files must not exceed **3 MB** (enforced in the browser before any network call, to stay within Vercel's 4.5 MB JSON body limit).

Files are converted to Base64 in the browser and forwarded directly to the OpenRouter multimodal API — no server-side parsing.

---

## Project Structure

```
├── api/
│   └── generate.js          # Vercel serverless function: auth, validation, OpenRouter call
├── lib/
│   ├── defaults.js           # Default Markdown templates for both modes
│   ├── prompts.js            # getPrompt(mode, inputs) — builds the messages array
│   └── processor.js          # extractMarkdown() + error classes
├── public/
│   ├── index.html            # Single-page UI (Bootstrap 5 + marked.js via CDN)
│   └── app.js                # Tab switching, file → Base64, fetch, render, copy
├── test/
│   ├── prompts.test.js       # Unit tests for prompt construction
│   └── processor.test.js     # Unit tests for response handling
├── server.js                 # Local dev server (serves public/, proxies /api/*)
├── .env.local                # Local environment variables (gitignored)
├── package.json              # "type": "module", test + start scripts
├── vercel.json               # Routing + function config
└── README.md
```

---

## Out of Scope (v1)

- Saving or exporting sessions
- Multiple file uploads per field
- Streaming responses
- Rate limiting (handled at the OpenRouter API key level)
- Aborting in-flight requests on tab switch
