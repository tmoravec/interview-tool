/**
 * Error classes and response processor for the Interview Prep Tool.
 */

/** Base class for all application errors. */
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

/** Thrown when required inputs are missing or invalid. */
export class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, code);
  }
}

/** Thrown when authentication fails. */
export class AuthError extends AppError {
  constructor(message, code = 'AUTH_ERROR') {
    super(message, code);
  }
}

/** Thrown when the AI model returns an unexpected or empty response. */
export class ModelError extends AppError {
  constructor(message, code = 'MODEL_ERROR') {
    super(message, code);
  }
}

/** Thrown when a network/HTTP call to OpenRouter fails. */
export class NetworkError extends AppError {
  constructor(message, code = 'NETWORK_ERROR') {
    super(message, code);
  }
}

/**
 * Extract the Markdown string from an OpenRouter API response.
 *
 * @param {object} apiResponse - The parsed JSON response from OpenRouter.
 * @returns {string} The trimmed Markdown content.
 * @throws {ModelError} If the response is malformed or the content is empty.
 */
export function extractMarkdown(apiResponse) {
  if (!apiResponse || !Array.isArray(apiResponse.choices) || apiResponse.choices.length === 0) {
    throw new ModelError(
      'The AI model returned an unexpected response. Please try again.',
      'MODEL_EMPTY_RESPONSE'
    );
  }

  const first = apiResponse.choices[0];
  const content = first?.message?.content;

  if (content == null || typeof content !== 'string' || content.trim() === '') {
    throw new ModelError(
      'The AI model returned empty content. Please try again.',
      'MODEL_EMPTY_CONTENT'
    );
  }

  return content.trim();
}
