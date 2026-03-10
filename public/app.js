/**
 * Interview Prep Tool — Frontend Logic
 *
 * Handles: tab switching, file → Base64, size validation, password management,
 * API calls, Markdown rendering, and clipboard copy.
 */

'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TOTAL_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Please fill in all required fields.',
  AUTH_ERROR: 'Authentication failed. Please check your password.',
  MODEL_EMPTY_RESPONSE: 'The AI model returned an unexpected response. Please try again.',
  MODEL_EMPTY_CONTENT: 'The AI model returned empty content. Please try again.',
  NETWORK_ERROR: 'Failed to reach the server. Please check your connection.',
};

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/** @param {string} id */
function el(id) {
  return document.getElementById(id);
}

// ---------------------------------------------------------------------------
// Password management
// ---------------------------------------------------------------------------

const PASSWORD_KEY = 'app_password';

function getStoredPassword() {
  return sessionStorage.getItem(PASSWORD_KEY);
}

function storePassword(pw) {
  sessionStorage.setItem(PASSWORD_KEY, pw);
}

function clearPassword() {
  sessionStorage.removeItem(PASSWORD_KEY);
}

/**
 * Returns the password, prompting the user if not already stored.
 * Returns null if the user dismissed the prompt.
 */
function getPassword() {
  const stored = getStoredPassword();
  if (stored !== null) return stored;

  const pw = window.prompt('Enter the app password:');
  if (pw === null) return null; // user dismissed — silent abort
  storePassword(pw);
  return pw;
}

// ---------------------------------------------------------------------------
// File → Base64 Data URI
// ---------------------------------------------------------------------------

/**
 * Converts a File to a Base64 Data URI object.
 * @param {File} file
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
function readFileAsDataURI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // e.g. "data:application/pdf;base64,AAAA..."
      const commaIndex = result.indexOf(',');
      const header = result.slice(0, commaIndex); // "data:application/pdf;base64"
      const data = result.slice(commaIndex + 1);   // base64 string
      const mimeType = header.split(':')[1].split(';')[0];
      resolve({ mimeType, data });
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Error display
// ---------------------------------------------------------------------------

function showError(message) {
  const alert = el('error-alert');
  el('error-message').textContent = message;
  alert.classList.remove('d-none');
  alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearError() {
  const alert = el('error-alert');
  alert.classList.add('d-none');
  el('error-message').textContent = '';
}

// ---------------------------------------------------------------------------
// Output panel
// ---------------------------------------------------------------------------

let rawMarkdown = '';

function showOutput(markdown) {
  rawMarkdown = markdown;
  const panel = el('output-panel');
  const content = el('output-content');
  content.innerHTML = marked.parse(markdown);
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearOutput() {
  rawMarkdown = '';
  el('output-panel').style.display = 'none';
  el('output-content').innerHTML = '';
}

// ---------------------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------------------

function clearForm(mode) {
  const prefix = mode;
  const fields = ['cv', 'jd', 'context', 'template'];
  for (const field of fields) {
    const textEl = el(`${prefix}-${field}-text`);
    const fileEl = el(`${prefix}-${field}-file`);
    if (textEl) textEl.value = '';
    if (fileEl) fileEl.value = '';
  }
}

// Listen for Bootstrap tab-show events
document.addEventListener('DOMContentLoaded', () => {
  const tabEls = document.querySelectorAll('#mode-tabs button[data-bs-toggle="tab"]');
  tabEls.forEach((tabEl) => {
    tabEl.addEventListener('shown.bs.tab', (event) => {
      const newMode = event.target.dataset.mode;
      const oldMode = event.relatedTarget?.dataset.mode;
      if (oldMode) clearForm(oldMode);
      clearOutput();
      clearError();
    });
  });

  // Copy button
  el('copy-btn').addEventListener('click', async () => {
    if (!rawMarkdown) return;
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      const btn = el('copy-btn');
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    } catch {
      showError('Failed to copy to clipboard. Please copy the text manually.');
    }
  });

  // Wire up form submissions
  el('interviewer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleGenerate('interviewer');
  });
  el('candidate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleGenerate('candidate');
  });
});

// ---------------------------------------------------------------------------
// Form data collection
// ---------------------------------------------------------------------------

/**
 * Collects the raw input values for a given mode.
 * Returns { cv, jd, context, template } where each is either a File, a string, or null.
 */
function collectRawInputs(mode) {
  const get = (field, type) => {
    const elem = el(`${mode}-${field}-${type}`);
    if (!elem) return null;
    if (type === 'file') {
      return elem.files && elem.files.length > 0 ? elem.files[0] : null;
    }
    return elem.value.trim() || null;
  };

  return {
    cvFile: get('cv', 'file'),
    cvText: get('cv', 'text'),
    jdFile: get('jd', 'file'),
    jdText: get('jd', 'text'),
    contextFile: get('context', 'file'),
    contextText: get('context', 'text'),
    templateFile: get('template', 'file'),
    templateText: get('template', 'text'),
  };
}

/**
 * Validate and collect all files; return total byte size and file list.
 */
function getFiles(raw) {
  const files = [];
  if (raw.cvFile) files.push(raw.cvFile);
  if (raw.jdFile) files.push(raw.jdFile);
  if (raw.contextFile) files.push(raw.contextFile);
  if (raw.templateFile) files.push(raw.templateFile);
  return files;
}

// ---------------------------------------------------------------------------
// Generate handler
// ---------------------------------------------------------------------------

async function handleGenerate(mode) {
  clearError();

  const raw = collectRawInputs(mode);
  const files = getFiles(raw);

  // Size validation
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_FILE_SIZE) {
    const mb = (totalSize / 1024 / 1024).toFixed(1);
    showError(`Total file size (${mb} MB) exceeds the 3 MB limit. Please reduce the number or size of files.`);
    return;
  }

  // Require at least one source for CV and JD
  if (!raw.cvFile && !raw.cvText) {
    showError('Please provide the CV — paste text or upload a file.');
    return;
  }
  if (!raw.jdFile && !raw.jdText) {
    showError('Please provide the Job Description — paste text or upload a file.');
    return;
  }

  // UI: disable button, show spinner
  const btn = el(`${mode}-generate-btn`);
  const spinner = el(`${mode}-spinner`);
  btn.disabled = true;
  spinner.classList.remove('d-none');

  try {
    // Convert files to Base64
    const toBase64 = async (file) => file ? readFileAsDataURI(file) : null;
    const [cvFile, jdFile, contextFile, templateFile] = await Promise.all([
      toBase64(raw.cvFile),
      toBase64(raw.jdFile),
      toBase64(raw.contextFile),
      toBase64(raw.templateFile),
    ]);

    // Build inputs: file takes precedence over text
    const inputs = {
      cv: cvFile || raw.cvText,
      jobDescription: jdFile || raw.jdText,
      companyContext: contextFile || raw.contextText || null,
      template: templateFile || raw.templateText || null,
    };

    await callAPI(mode, inputs, { btn, spinner });
  } catch (err) {
    showError(err.message || 'An unexpected error occurred.');
    btn.disabled = false;
    spinner.classList.add('d-none');
  }
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

/**
 * Calls POST /api/generate. Handles auth retry on 401.
 * @param {string} mode
 * @param {object} inputs
 * @param {{ btn: HTMLElement, spinner: HTMLElement }} ui
 */
async function callAPI(mode, inputs, ui, isRetry = false) {
  const password = getPassword();
  if (password === null) {
    // User dismissed the prompt — silent abort
    ui.btn.disabled = false;
    ui.spinner.classList.add('d-none');
    return;
  }

  let response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Password': password,
      },
      body: JSON.stringify({ mode, inputs }),
    });
  } catch {
    ui.btn.disabled = false;
    ui.spinner.classList.add('d-none');
    showError('Failed to reach the server. Please check your connection and try again.');
    return;
  }

  if (response.status === 401) {
    clearPassword();
    if (!isRetry) {
      // Prompt again and retry once
      return callAPI(mode, inputs, ui, true);
    }
    ui.btn.disabled = false;
    ui.spinner.classList.add('d-none');
    showError('Incorrect password. Please try again.');
    return;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    ui.btn.disabled = false;
    ui.spinner.classList.add('d-none');
    showError('Received an unreadable response from the server.');
    return;
  }

  ui.btn.disabled = false;
  ui.spinner.classList.add('d-none');

  if (!response.ok) {
    const code = body?.code;
    const message = (code && ERROR_MESSAGES[code]) || body?.error || 'An unexpected error occurred. Please try again.';
    showError(message);
    return;
  }

  if (!body?.markdown) {
    showError('The server returned an empty response. Please try again.');
    return;
  }

  showOutput(body.markdown);
}
