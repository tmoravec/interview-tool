import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractMarkdown, ModelError, ValidationError, AuthError, NetworkError } from '../lib/processor.js';

// Helper: build a well-formed OpenRouter API response
function makeResponse(content) {
  return {
    choices: [
      {
        message: {
          content,
        },
      },
    ],
  };
}

describe('extractMarkdown — well-formed responses', () => {
  it('returns the content string from a valid response', () => {
    const markdown = '# Interview Guide\n\n## Section 1\nSome content here.';
    const result = extractMarkdown(makeResponse(markdown));
    assert.equal(result, markdown);
  });

  it('returns trimmed content (strips leading/trailing whitespace)', () => {
    const markdown = '  \n# Interview Guide\n\nContent\n  ';
    const result = extractMarkdown(makeResponse(markdown));
    assert.equal(result, markdown.trim());
  });

  it('handles a response with multiple choices — uses first', () => {
    const response = {
      choices: [
        { message: { content: '# First Choice' } },
        { message: { content: '# Second Choice' } },
      ],
    };
    const result = extractMarkdown(response);
    assert.equal(result, '# First Choice');
  });
});

describe('extractMarkdown — malformed responses throw ModelError', () => {
  it('throws ModelError when choices array is empty', () => {
    assert.throws(
      () => extractMarkdown({ choices: [] }),
      (err) => {
        assert.ok(err instanceof ModelError, 'error should be ModelError');
        assert.ok(typeof err.message === 'string');
        assert.ok(typeof err.code === 'string');
        return true;
      }
    );
  });

  it('throws ModelError when choices is missing', () => {
    assert.throws(
      () => extractMarkdown({}),
      ModelError
    );
  });

  it('throws ModelError when choices is null', () => {
    assert.throws(
      () => extractMarkdown({ choices: null }),
      ModelError
    );
  });

  it('throws ModelError when content is an empty string', () => {
    assert.throws(
      () => extractMarkdown(makeResponse('')),
      ModelError
    );
  });

  it('throws ModelError when content is only whitespace', () => {
    assert.throws(
      () => extractMarkdown(makeResponse('   \n  \t  ')),
      ModelError
    );
  });

  it('throws ModelError when message is missing', () => {
    assert.throws(
      () => extractMarkdown({ choices: [{}] }),
      ModelError
    );
  });

  it('throws ModelError when content is null', () => {
    assert.throws(
      () => extractMarkdown({ choices: [{ message: { content: null } }] }),
      ModelError
    );
  });

  it('throws ModelError when the entire response is null', () => {
    assert.throws(
      () => extractMarkdown(null),
      ModelError
    );
  });
});

describe('Error class shapes', () => {
  it('ValidationError has .message and .code', () => {
    const err = new ValidationError('test message', 'TEST_CODE');
    assert.ok(err instanceof Error, 'should be an Error instance');
    assert.ok(err instanceof ValidationError);
    assert.equal(typeof err.message, 'string');
    assert.equal(typeof err.code, 'string');
    assert.equal(err.message, 'test message');
    assert.equal(err.code, 'TEST_CODE');
  });

  it('AuthError has .message and .code', () => {
    const err = new AuthError('auth message', 'AUTH_CODE');
    assert.ok(err instanceof Error);
    assert.ok(err instanceof AuthError);
    assert.equal(typeof err.message, 'string');
    assert.equal(typeof err.code, 'string');
    assert.equal(err.message, 'auth message');
    assert.equal(err.code, 'AUTH_CODE');
  });

  it('ModelError has .message and .code', () => {
    const err = new ModelError('model message', 'MODEL_CODE');
    assert.ok(err instanceof Error);
    assert.ok(err instanceof ModelError);
    assert.equal(typeof err.message, 'string');
    assert.equal(typeof err.code, 'string');
    assert.equal(err.message, 'model message');
    assert.equal(err.code, 'MODEL_CODE');
  });

  it('NetworkError has .message and .code', () => {
    const err = new NetworkError('network message', 'NETWORK_CODE');
    assert.ok(err instanceof Error);
    assert.ok(err instanceof NetworkError);
    assert.equal(typeof err.message, 'string');
    assert.equal(typeof err.code, 'string');
    assert.equal(err.message, 'network message');
    assert.equal(err.code, 'NETWORK_CODE');
  });

  it('Error classes are distinct (not same class)', () => {
    const ve = new ValidationError('v', 'V');
    const ae = new AuthError('a', 'A');
    const me = new ModelError('m', 'M');
    const ne = new NetworkError('n', 'N');

    assert.ok(!(ve instanceof AuthError));
    assert.ok(!(ve instanceof ModelError));
    assert.ok(!(ve instanceof NetworkError));
    assert.ok(!(ae instanceof ValidationError));
    assert.ok(!(me instanceof ValidationError));
    assert.ok(!(ne instanceof ValidationError));
  });
});
