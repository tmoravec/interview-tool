/**
 * Prompt builder for the Interview Prep Tool.
 *
 * getPrompt(mode, inputs) → { systemPrompt: string, userMessageParts: array }
 */

import { ValidationError } from './processor.js';
import { INTERVIEWER_DEFAULT, CANDIDATE_DEFAULT } from './defaults.js';

/**
 * Determine whether an input value is a file object (Base64 Data URI object).
 *
 * @param {*} value
 * @returns {boolean}
 */
function isFileInput(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.mimeType === 'string' &&
    typeof value.data === 'string'
  );
}

/**
 * Determine whether an input value is a non-empty string.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isTextInput(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check that a required input is present (either text or file).
 *
 * @param {*} value - The input value to check.
 * @param {string} fieldName - Human-readable field name for the error message.
 * @throws {ValidationError}
 */
function requireInput(value, fieldName) {
  if (value == null || (!isTextInput(value) && !isFileInput(value))) {
    throw new ValidationError(
      `"${fieldName}" is required but was not provided.`,
      'MISSING_REQUIRED_FIELD'
    );
  }
}

/**
 * Build a user message part for a text input.
 *
 * @param {string} label - Label describing the content (e.g. "CV / Résumé").
 * @param {string} text  - The text content.
 * @returns {object}
 */
function textPart(label, text) {
  return { type: 'text', text: `${label}:\n${text}` };
}

/**
 * Build a user message part for a file input (Base64 Data URI).
 *
 * @param {string} label          - Label describing the content.
 * @param {{ mimeType: string, data: string }} file
 * @returns {object[]} - Array with a text label part and an image_url part.
 */
function fileParts(label, file) {
  return [
    { type: 'text', text: `${label}:` },
    {
      type: 'image_url',
      image_url: {
        url: `data:${file.mimeType};base64,${file.data}`,
      },
    },
  ];
}

/**
 * Build the user message parts array from the provided inputs.
 *
 * @param {{ cv, jobDescription, companyContext, template }} inputs
 * @returns {object[]}
 */
function buildUserParts(inputs) {
  const { cv, jobDescription, companyContext } = inputs;
  const parts = [];

  // CV — required, may be text or file
  if (isFileInput(cv)) {
    parts.push(...fileParts('CV / Résumé', cv));
  } else {
    parts.push(textPart('CV / Résumé', cv));
  }

  // Job Description — required, may be text or file
  if (isFileInput(jobDescription)) {
    parts.push(...fileParts('Job Description', jobDescription));
  } else {
    parts.push(textPart('Job Description', jobDescription));
  }

  // Company Context — optional, may be text or file
  if (companyContext != null) {
    if (isFileInput(companyContext)) {
      parts.push(...fileParts('Company Context', companyContext));
    } else if (isTextInput(companyContext)) {
      parts.push(textPart('Company Context', companyContext));
    }
  }

  return parts;
}

/**
 * Build the system prompt for the given mode and template.
 *
 * @param {'interviewer'|'candidate'} mode
 * @param {string} template - The Markdown template to embed.
 * @returns {string}
 */
function buildSystemPrompt(mode, template) {
  if (mode === 'interviewer') {
    return `You are an expert interviewer and talent assessment specialist.

Your task is to produce a tailored, competency-based **interview guide** that a hiring manager can use to assess the candidate described in the provided CV against the given job description. Take into account any company context provided.

**Output requirements:**
- Respond with **only Markdown** — no prose introduction, no code fences, no commentary outside the Markdown document.
- Follow the structure and sections defined in the template below exactly. Adapt the content to the specific candidate and role, but preserve the template's headings and scorecard format.
- Make the interview questions specific and insightful — tailored to the candidate's background and the role's requirements.
- Include concrete follow-up probes for each question.
- Provide a completed scorecard table with role-relevant descriptions for each score level.

**Template to follow:**

---

${template}

---

Now generate the tailored interview guide based on the inputs provided by the user.`;
  }

  // candidate mode
  return `You are an expert career coach and interview preparation specialist.

Your task is to produce a tailored **interview preparation guide** for the candidate described in the provided CV, helping them prepare for the specific role and company described in the job description. Take into account any company context provided.

**Output requirements:**
- Respond with **only Markdown** — no prose introduction, no code fences, no commentary outside the Markdown document.
- Follow the structure and sections defined in the template below exactly. Adapt the content to the specific candidate and role, but preserve the template's headings and format.
- Fill in the research checklist items with specific, actionable insights tailored to the company and role.
- Suggest STAR-format story themes drawn from the candidate's actual CV experience.
- Draft specific, personalised answers for the standard question prompts based on the candidate's background.
- Tailor the questions-to-ask section to the specific company and role.

**Template to follow:**

---

${template}

---

Now generate the tailored preparation guide based on the inputs provided by the user.`;
}

/**
 * Build the full prompt for an OpenRouter API call.
 *
 * @param {'interviewer'|'candidate'} mode
 * @param {{ cv, jobDescription, companyContext?, template? }} inputs
 *   Each field may be:
 *     - a plain-text string
 *     - a Base64 file object: { mimeType: string, data: string }
 *     - null / undefined (only allowed for optional fields)
 * @returns {{ systemPrompt: string, userMessageParts: object[] }}
 * @throws {ValidationError} if a required field is missing
 */
export function getPrompt(mode, inputs = {}) {
  const { cv, jobDescription, companyContext, template } = inputs;

  // Validate required fields
  requireInput(cv, 'cv');
  requireInput(jobDescription, 'jobDescription');

  // Select template: use provided template string or fall back to default
  const activeTemplate =
    isTextInput(template)
      ? template
      : mode === 'interviewer'
        ? INTERVIEWER_DEFAULT
        : CANDIDATE_DEFAULT;

  const systemPrompt = buildSystemPrompt(mode, activeTemplate);
  const userMessageParts = buildUserParts({ cv, jobDescription, companyContext });

  return { systemPrompt, userMessageParts };
}

// Re-export ValidationError so callers can import it from this module
export { ValidationError };
