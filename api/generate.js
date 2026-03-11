/**
 * Vercel serverless function — POST /api/generate
 *
 * Accepts a JSON body: { mode: 'interviewer'|'candidate', inputs: { cv, jobDescription, companyContext?, template? } }
 * Returns: { markdown: string } on success, or { error: string } on failure.
 *
 * Authentication: X-App-Password header must match APP_PASSWORD env var.
 */

import { getPrompt } from '../lib/prompts.js';
import { extractMarkdown, ValidationError, AuthError, ModelError, NetworkError } from '../lib/processor.js';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'google/gemini-2.5-pro-exp-03-25:free';
const APP_PASSWORD = process.env.APP_PASSWORD;
const DEBUG = process.env.DEBUG === 'true';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TOKENS = 8000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function debugLog(label, data) {
  if (DEBUG) {
    process.stderr.write(`[DEBUG] ${label}: ${JSON.stringify(data, null, 2)}\n`);
  }
}

function jsonResponse(res, status, body) {
  res.status(status).json(body);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  // Guard against misconfigured deployments — APP_PASSWORD must be set.
  if (!APP_PASSWORD) {
    return jsonResponse(res, 500, { error: 'Server configuration error: APP_PASSWORD is not set.' });
  }

  // Auth check
  const providedPassword = req.headers['x-app-password'];
  if (providedPassword !== APP_PASSWORD) {
    return jsonResponse(res, 401, { error: 'Invalid password.' });
  }

  // Parse body
  let mode, inputs;
  try {
    ({ mode, inputs } = req.body);
  } catch (err) {
    return jsonResponse(res, 400, { error: 'Invalid JSON body.' });
  }

  if (!mode || !['interviewer', 'candidate'].includes(mode)) {
    return jsonResponse(res, 400, { error: 'Invalid or missing "mode". Expected "interviewer" or "candidate".' });
  }

  if (!inputs || typeof inputs !== 'object') {
    return jsonResponse(res, 400, { error: 'Missing or invalid "inputs" field.' });
  }

  // Build prompt
  let systemPrompt, userMessageParts;
  try {
    ({ systemPrompt, userMessageParts } = getPrompt(mode, inputs));
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonResponse(res, 400, { error: err.message, code: err.code });
    }
    return jsonResponse(res, 400, { error: 'Invalid inputs.' });
  }

  // Validate API key
  if (!OPENROUTER_API_KEY) {
    return jsonResponse(res, 500, { error: 'Server configuration error: missing API key.' });
  }

  // Build OpenRouter request
  const requestBody = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessageParts,
      },
    ],
  };

  console.log(`[OpenRouter] Sending request. Model: ${MODEL}, messages: ${requestBody.messages.length}, max_tokens: ${MAX_TOKENS}`);
  debugLog('OpenRouter request', requestBody);

  // Call OpenRouter
  let apiResponse;
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://interview-prep-tool.vercel.app',
        'X-Title': 'Interview Prep Tool',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[OpenRouter] HTTP ${response.status} error. Model: ${MODEL}. Body: ${errorText}`);
      debugLog('OpenRouter error response', { status: response.status, body: errorText });

      if (response.status === 401) {
        return jsonResponse(res, 502, { error: 'API authentication failed. Check your OpenRouter API key.' });
      }
      if (response.status === 429) {
        return jsonResponse(res, 502, { error: 'Rate limit exceeded. Please wait a moment and try again.' });
      }
      return jsonResponse(res, 502, { error: `AI service returned an error (HTTP ${response.status}). Please try again.` });
    }

    apiResponse = await response.json();
    debugLog('OpenRouter response', apiResponse);
  } catch (err) {
    debugLog('Fetch error', { message: err.message });
    return jsonResponse(res, 502, { error: 'Failed to reach the AI service. Check your internet connection and try again.' });
  }

  // Extract Markdown
  let markdown;
  try {
    markdown = extractMarkdown(apiResponse);
  } catch (err) {
    if (err instanceof ModelError) {
      return jsonResponse(res, 502, { error: err.message, code: err.code });
    }
    return jsonResponse(res, 502, { error: 'Unexpected response from AI service.' });
  }

  return jsonResponse(res, 200, { markdown });
}
