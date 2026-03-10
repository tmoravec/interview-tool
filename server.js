/**
 * Local development server
 *
 * - Serves static files from public/
 * - Routes POST /api/generate to api/generate.js handler
 * - Loads environment variables from .env.local
 * - Listens on PORT env var or 3000
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Resolve __dirname equivalent in ESM
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Load .env.local into process.env
// ---------------------------------------------------------------------------

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    console.log(`[server] No ${envPath} found — skipping env load`);
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    // Don't overwrite values already set in the environment
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
  console.log(`[server] Loaded environment from ${envPath}`);
}

loadEnvFile(path.join(__dirname, '.env.local'));

// ---------------------------------------------------------------------------
// MIME types for static serving
// ---------------------------------------------------------------------------

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------

function serveStatic(req, res) {
  // Normalise URL: strip query string, decode percent-encoding
  let urlPath = req.url.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  // Default to index.html for "/"
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  // Resolve to a path inside public/ — prevent directory traversal
  const publicDir = path.join(__dirname, 'public');
  const filePath = path.resolve(publicDir, '.' + urlPath);
  if (!filePath.startsWith(publicDir + path.sep) && filePath !== publicDir) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// ---------------------------------------------------------------------------
// API proxy — forwards to api/generate.js handler
// ---------------------------------------------------------------------------

// Lazily import the handler so env vars are already set by the time the
// module is evaluated (important for top-level const initialisation in the handler).
let _handler = null;
async function getHandler() {
  if (!_handler) {
    const mod = await import('./api/generate.js');
    _handler = mod.default;
  }
  return _handler;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleApi(req, res) {
  // Read and parse the JSON body, then attach to req.body to mimic Vercel/Express
  let bodyText = '';
  try {
    bodyText = await readBody(req);
    req.body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
    return;
  }

  // Provide a minimal Express-compatible response object
  const mockRes = {
    _status: 200,
    _headers: {},
    status(code) {
      this._status = code;
      return this;
    },
    setHeader(name, value) {
      this._headers[name] = value;
      return this;
    },
    json(body) {
      const payload = JSON.stringify(body);
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        ...this._headers,
      };
      res.writeHead(this._status, headers);
      res.end(payload);
    },
  };

  try {
    const handler = await getHandler();
    await handler(req, mockRes);
  } catch (err) {
    console.error('[server] Unhandled error in API handler:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error.' }));
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log(`[server] ${method} ${url}`);

  // Route API calls
  if (url === '/api/generate' || url.startsWith('/api/generate?')) {
    await handleApi(req, res);
    return;
  }

  // Everything else — serve as a static file
  serveStatic(req, res);
});

const PORT = parseInt(process.env.PORT || '3000', 10);

server.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`[server] API endpoint: POST http://localhost:${PORT}/api/generate`);
});
