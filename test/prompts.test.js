import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPrompt, ValidationError } from '../lib/prompts.js';

describe('getPrompt — interviewer mode, all text inputs', () => {
  it('returns an object with systemPrompt and userMessageParts', () => {
    const result = getPrompt('interviewer', {
      cv: 'Alice Smith, 5 years experience',
      jobDescription: 'Senior Engineer role',
    });
    assert.ok(result.systemPrompt, 'systemPrompt should be non-empty');
    assert.ok(Array.isArray(result.userMessageParts), 'userMessageParts should be an array');
  });

  it('system prompt contains interviewer-related keywords', () => {
    const result = getPrompt('interviewer', {
      cv: 'Bob Jones',
      jobDescription: 'Frontend Developer',
    });
    const lower = result.systemPrompt.toLowerCase();
    assert.ok(lower.includes('interview'), 'system prompt should mention "interview"');
    assert.ok(lower.includes('markdown'), 'system prompt should mention "markdown"');
  });

  it('user parts contain the CV text', () => {
    const cvText = 'Unique CV content XYZ123';
    const result = getPrompt('interviewer', {
      cv: cvText,
      jobDescription: 'Some job',
    });
    const combined = result.userMessageParts.map(p => p.text || '').join(' ');
    assert.ok(combined.includes(cvText), 'user parts should include CV text');
  });

  it('user parts contain the job description text', () => {
    const jdText = 'Unique JD content ABC456';
    const result = getPrompt('interviewer', {
      cv: 'Some CV',
      jobDescription: jdText,
    });
    const combined = result.userMessageParts.map(p => p.text || '').join(' ');
    assert.ok(combined.includes(jdText), 'user parts should include job description text');
  });

  it('user parts contain optional company context when provided', () => {
    const ctx = 'Company context DEF789';
    const result = getPrompt('interviewer', {
      cv: 'CV text',
      jobDescription: 'JD text',
      companyContext: ctx,
    });
    const combined = result.userMessageParts.map(p => p.text || '').join(' ');
    assert.ok(combined.includes(ctx), 'user parts should include company context');
  });
});

describe('getPrompt — candidate mode, all text inputs', () => {
  it('returns an object with systemPrompt and userMessageParts', () => {
    const result = getPrompt('candidate', {
      cv: 'Jane Doe, 3 years experience',
      jobDescription: 'Data Analyst',
    });
    assert.ok(result.systemPrompt, 'systemPrompt should be non-empty');
    assert.ok(Array.isArray(result.userMessageParts), 'userMessageParts should be an array');
  });

  it('system prompt contains candidate-related keywords', () => {
    const result = getPrompt('candidate', {
      cv: 'Jane Doe',
      jobDescription: 'Data Analyst',
    });
    const lower = result.systemPrompt.toLowerCase();
    assert.ok(lower.includes('candidate') || lower.includes('preparation'), 'system prompt should mention candidate or preparation');
    assert.ok(lower.includes('markdown'), 'system prompt should mention "markdown"');
  });

  it('user parts contain the CV and job description text', () => {
    const cvText = 'Candidate CV text GHI000';
    const jdText = 'Candidate JD text JKL111';
    const result = getPrompt('candidate', {
      cv: cvText,
      jobDescription: jdText,
    });
    const combined = result.userMessageParts.map(p => p.text || '').join(' ');
    assert.ok(combined.includes(cvText), 'user parts should include CV text');
    assert.ok(combined.includes(jdText), 'user parts should include JD text');
  });
});

describe('getPrompt — file inputs (Base64 objects)', () => {
  it('includes an image_url part for a file-based CV', () => {
    const fileInput = { mimeType: 'application/pdf', data: 'AAABBBCCC' };
    const result = getPrompt('interviewer', {
      cv: fileInput,
      jobDescription: 'Some job',
    });
    const imageUrlParts = result.userMessageParts.filter(p => p.type === 'image_url');
    assert.ok(imageUrlParts.length > 0, 'should have at least one image_url part for file input');
    const url = imageUrlParts[0].image_url.url;
    assert.ok(url.startsWith('data:application/pdf;base64,'), 'URL should be a data URI with correct mime type');
    assert.ok(url.includes('AAABBBCCC'), 'URL should include the base64 data');
  });

  it('includes an image_url part for a file-based job description', () => {
    const fileInput = { mimeType: 'text/plain', data: 'DDDEEEFFF' };
    const result = getPrompt('interviewer', {
      cv: 'Some CV text',
      jobDescription: fileInput,
    });
    const imageUrlParts = result.userMessageParts.filter(p => p.type === 'image_url');
    assert.ok(imageUrlParts.length > 0, 'should have at least one image_url part for file JD');
    const url = imageUrlParts[0].image_url.url;
    assert.ok(url.includes('DDDEEEFFF'), 'URL should include the base64 data');
  });

  it('includes an image_url part for a file-based company context', () => {
    const fileInput = { mimeType: 'application/pdf', data: 'GGGHHH' };
    const result = getPrompt('candidate', {
      cv: 'CV text',
      jobDescription: 'JD text',
      companyContext: fileInput,
    });
    const imageUrlParts = result.userMessageParts.filter(p => p.type === 'image_url');
    assert.ok(imageUrlParts.length > 0, 'should have image_url part for file company context');
  });
});

describe('getPrompt — custom template', () => {
  it('system prompt contains the custom template text when provided', () => {
    const customTemplate = '## Custom Interview Structure\n### Section One\n- Question A\n- Question B';
    const result = getPrompt('interviewer', {
      cv: 'CV',
      jobDescription: 'JD',
      template: customTemplate,
    });
    assert.ok(
      result.systemPrompt.includes(customTemplate),
      'system prompt should embed the custom template'
    );
  });

  it('system prompt does NOT contain custom template text when not provided (uses default)', () => {
    const customTemplate = 'UNIQUE_CUSTOM_TEMPLATE_STRING_99999';
    const result = getPrompt('interviewer', {
      cv: 'CV',
      jobDescription: 'JD',
    });
    assert.ok(
      !result.systemPrompt.includes(customTemplate),
      'system prompt should not contain the custom template string when not provided'
    );
  });
});

describe('getPrompt — file-object template (Base64 encoded)', () => {
  it('decodes a Base64 file-object template and uses it as the active template', () => {
    const templateText = '## File-Upload Template\n### Section A\n- Question X';
    const base64Data = Buffer.from(templateText, 'utf8').toString('base64');
    const fileTemplate = { mimeType: 'text/markdown', data: base64Data };

    const result = getPrompt('interviewer', {
      cv: 'CV text',
      jobDescription: 'JD text',
      template: fileTemplate,
    });

    assert.ok(
      result.systemPrompt.includes(templateText),
      'system prompt should contain the decoded file template content'
    );
  });

  it('does not forward the file-object template as an image_url part in userMessageParts', () => {
    const templateText = '## Another Template\n### Section B';
    const base64Data = Buffer.from(templateText, 'utf8').toString('base64');
    const fileTemplate = { mimeType: 'text/markdown', data: base64Data };

    const result = getPrompt('candidate', {
      cv: 'CV text',
      jobDescription: 'JD text',
      template: fileTemplate,
    });

    // userMessageParts should only contain CV/JD parts, not the template
    const combined = result.userMessageParts.map(p => p.text || p?.image_url?.url || '').join(' ');
    assert.ok(!combined.includes(templateText), 'userMessageParts should not contain template text');
  });
});

describe('getPrompt — validation errors', () => {
  it('throws ValidationError when cv is missing', () => {
    assert.throws(
      () => getPrompt('interviewer', { jobDescription: 'JD text' }),
      (err) => {
        assert.ok(err instanceof ValidationError, 'error should be a ValidationError');
        assert.ok(typeof err.message === 'string', 'error should have a message string');
        assert.ok(typeof err.code === 'string', 'error should have a code string');
        return true;
      }
    );
  });

  it('throws ValidationError when jobDescription is missing', () => {
    assert.throws(
      () => getPrompt('interviewer', { cv: 'CV text' }),
      (err) => {
        assert.ok(err instanceof ValidationError, 'error should be a ValidationError');
        assert.ok(typeof err.message === 'string', 'error should have a message string');
        assert.ok(typeof err.code === 'string', 'error should have a code string');
        return true;
      }
    );
  });

  it('throws ValidationError when inputs object is empty', () => {
    assert.throws(
      () => getPrompt('candidate', {}),
      ValidationError
    );
  });
});
