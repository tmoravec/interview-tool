# PRD: Interview Prep Tool

**Version:** 1.0
**Status:** Ready for implementation planning

---

## Overview

A web application that generates tailored interview preparation documents. Given a set of inputs about a candidate and role, it produces a structured Markdown document ready to paste into Obsidian.

Two modes support opposite sides of the same interview conversation: an interviewer preparing to assess a candidate, and a candidate preparing to be assessed.

---

## Goals

- Reduce interview preparation time from hours to minutes
- Produce output specific enough to be immediately useful, not a generic question bank
- Deploy and run with zero infrastructure beyond Vercel and an OpenRouter API key
- Remain maintainable by a single developer with no ongoing commitment

## Non-Goals

- Storing or persisting any data
- User accounts or authentication beyond a simple password
- Scoring, tracking, or analytics
- Integration with ATS or HR systems


---

## Users

**Primary user:** The developer himself. Everything else is a nice-to-have. Will use it as both interviewer and candidate.

**Secondary user:** Any hiring manager or job-seeking engineer who finds the tool and wants to use it.

---

## Modes

### Interviewer Mode

Prepares the interviewer to assess a specific candidate for a specific role.

**Inputs:**
| Input | Format | Required |
|---|---|---|
| Candidate CV | PDF, text file, or plain text paste | Yes |
| Job description | PDF, text file, or plain text paste | Yes |
| Company context | PDF, text file, or plain text paste | No |
| Interview template | `.md` file upload or text paste | No |

**Output:** A tailored interview guide in Markdown, structured around competency areas. Each section contains:
- Standard questions for the competency
- Candidate-specific probes derived from the CV
- Follow-up questions to go deeper on claims in the CV
- Red flags specific to this candidate/role combination
- A summary scorecard template at the end



### Candidate Mode

Prepares the candidate to perform well in an interview for a specific role.

**Inputs:**
| Input | Format | Required |
|---|---|---|
| User CV | PDF, text file, or plain text paste | Yes |
| Job description | PDF, text file, or plain text paste | Yes |
| Company context | PDF, text file, or plain text paste | No |
| Interview template | `.md` file upload or text paste | No |

**Output:** A preparation guide in Markdown containing:
- Likely questions the interviewer will ask, derived from the JD
- For each question: angles to consider, what a strong answer covers, what to avoid, both theoretical and based on the user's CV.
- Company-specific questions to ask the interviewer, prioritised by what the JD signals about the role as well as the user's CV.
- A "tell me about yourself" outline prompt (not filled in — the user fills this in themselves)



---

## User Interface

Single page. Two tabs at the top: **Interviewer** and **Candidate**. Switching tabs clears the form and output.

Works on mobile as well as desktop.

Each tab contains:
- Input fields for that mode (described above)
- A **Generate** button
- An output panel below the button

The output panel renders the Markdown response using `marked.js`. A **Copy** button copies the raw Markdown to clipboard.

While generation is in progress, the Generate button is disabled and shows a spinner.

No login screen. The app password is prompted on first API call and stored in `sessionStorage`. There's no username, just the password, sent to the server in a HTTP header (`X-App-Password`). Clear the saved password and prompt again on HTTP 401.

Clear error messages for the user. E.g., wrong password, malformed model response, oversized upload, unsupported file type, network failure, etc.

If a template is provided, it replaces the built-in default as the base structure for generation. The generated output should follow that structure while filling it with role- and candidate-specific content.

If both pasted text and a file are provided for the same field, the the file takes precedence.

---

## Technical Constraints

- **Frontend:** Single HTML file + single JS file, vanilla JS, Bootstrap 5 via CDN, `marked.js` via CDN. No build step.
- **Backend:** Single Vercel serverless function. Plain Node.js, no framework. A tiny  `server.js` for local testing and development.
- **AI:** OpenRouter API. Model is configurable via environment variable (and .env.local), with google/gemini-3-flash-preview as the default.
- **File handling:** PDF and text files passed directly to the model as-is via the OpenRouter multimodal API. No server-side parsing.
- **Dependencies:** Zero npm dependencies.
- **Tests:** Node's built-in `node:test`. Unit tests for prompt construction and response handling. No API calls in tests.

---

## File Handling

- **File handling:** Zero server-side file parsing or multipart handling. The frontend converts all selected files to Base64 Data URIs (FileReader.readAsDataURL). The frontend sends a standard application/json payload containing the Base64 strings to the backend. The backend forwards these URIs directly to the OpenRouter API.
- **File Size Limit:** Frontend must strictly validate that combined file sizes do not exceed 3MB to prevent hitting Vercel's hard 4.5MB JSON body limit.

---

## Environment Variables

| Variable             | Description                                             | Required |
| -------------------- | ------------------------------------------------------- | -------- |
| `OPENROUTER_API_KEY` | OpenRouter API key                                      | Yes      |
| `MODEL`              | Model identifier (e.g. `google/gemini-3-flash-preview`) | Yes      |
| `APP_PASSWORD`       | Password for API access                                 | Yes      |
| `DEBUG`              | Verbose logging if `true`                               | No       |

---

## Project Structure (suggestion only)

```
├── api/
│   └── generate.js          # Serverless function: auth, file handling, OpenRouter call
├── lib/
│   ├── prompts.js            # System prompts + getPrompt(mode, inputs)
│   ├── defaults.js           # Default interviewer and candidate templates
│   └── processor.js          # Response parsing, error handling
├── public/
│   ├── index.html            # Single-page UI, Bootstrap 5 + marked.js via CDN
│   └── app.js                # Tab switching, form handling, copy button
├── test/
│   ├── prompts.test.js       # Unit tests for prompt construction
│   └── processor.test.js     # Unit tests for response handling
├── server.js                 # Local dev server
├── .env.local                # Local environment variables (gitignored)
├── package.json
├── vercel.json
└── README.md
```

---

## Default Templates

Two built-in defaults, hardcoded in `lib/defaults.js`:

**Interviewer default:** A simplified competency-based interview guide covering: problem-solving, learning mindset, collaboration, communication. Structured with questions, follow-up probes, and a scorecard. Simpler than the full personal template — no company-specific content, no mini case study.

**Candidate default:** A question bank covering company strategy, team dynamics, role clarity, career growth, and process. Plus a standard answers section with prompts (not pre-filled content).

Both are plain Markdown strings. If the user uploads a template file, it replaces the relevant default entirely.

---

## Out of Scope for v1

- Saving or exporting sessions
- Multiple file uploads for any field (one file only)
- Side-by-side diff view when a template is provided vs. the generated output
- Any form of caching
- Rate limiting beyond what Vercel provides
- Streaming of the response
- Aborting an existing request if user switches tabs
- Limiting requests to OpenRouter - handled by the API key limit

---

## Success Criteria

The tool is successful if:
- A complete interviewer guide for a real candidate takes under 2 minutes end-to-end
- In normal use, the output should be immediately usable after a quick review and minor edits.
- The project README clearly communicates purpose, stack, and how to deploy it

---

## Acceptance Criteria

- System shall support two modes: Interviewer, Candidate.
- System shall accept either pasted text or one uploaded file per field.
- System shall generate Markdown only.
- System shall render generated Markdown in the UI and allow copying raw Markdown.
- System shall clear mode-specific state on tab switch.
- System shall validate combined uploaded file size ≤ 3 MB before submission.
- System shall reject requests with missing required inputs.
- System shall return user-visible errors for auth failure, validation failure, model failure, and timeout.
