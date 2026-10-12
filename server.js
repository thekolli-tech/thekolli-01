const http = require('http');
const fs = require('fs');
const path = require('path');

// Ensure dist output is compiled
try {
  const buildScript = path.join(__dirname, 'build.js');
  if (fs.existsSync(buildScript)) {
    require(buildScript);
  }
} catch (err) {
  console.log('[BUILD] note:', err.message);
}

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname);
const DIST_DIR = fs.existsSync(path.join(BASE_DIR, 'dist')) ? path.join(BASE_DIR, 'dist') : BASE_DIR;
const DATA_DIR = path.join(BASE_DIR, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function readJsonFile(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return defaultVal;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write JSON file:', err);
    return false;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  // API Endpoints
  if (pathname === '/api/inquiry' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (data.hp_field && data.hp_field.trim() !== '') {
        return sendJson(res, 400, { success: false, errors: ['Spam detected.'] });
      }

      const errors = [];
      if (!data.name || data.name.trim().length < 2) errors.push('Please provide your full name.');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.push('Please provide a valid email address.');
      if (!data.company || data.company.trim().length < 2) errors.push('Please provide your company name.');
      if (!data.interest || data.interest.trim().length < 2) errors.push('Please select a service or product of interest.');

      if (errors.length > 0) {
        return sendJson(res, 400, { success: false, errors });
      }

      const inquiryId = 'INQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      const record = {
        inquiryId,
        createdAt: new Date().toISOString(),
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company.trim(),
        interest: data.interest.trim(),
        region: data.region || 'International',
        currency: data.currency || 'USD',
        timeline: data.timeline || '1 - 3 months',
        notes: (data.notes || '').trim(),
        ip: req.socket.remoteAddress
      };

      const filePath = path.join(DATA_DIR, 'inquiries.json');
      const list = readJsonFile(filePath, []);
      list.unshift(record);
      writeJsonFile(filePath, list);

      return sendJson(res, 200, {
        success: true,
        message: 'Your project inquiry has been successfully received. Our engineering team will review your requirements.',
        inquiryId
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, errors: ['Server error processing inquiry.'] });
    }
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const userMsg = (data.message || '').trim();

      if (!userMsg) {
        return sendJson(res, 400, { success: false, reply: "Please provide a question or message." });
      }

      const q = userMsg.toLowerCase();
      let reply = "I am KLARA, your AI concierge for THE KOLLI. You can chat with us directly on WhatsApp at +91 6366850605 or ask about KLERP, KLAB, KLAI, and KLORA.";
      let actions = [{ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605" }];
      let suggestions = ["What is KLERP?", "What is KLORA?", "What is KLAB?"];

      if (q.includes('klora') || q.includes('marketing')) {
        reply = "KLORA is our autonomous AI digital marketing platform automating ad campaigns across Meta, Google, and LinkedIn, generative ChatGPT copywriting, SEO & GEO, and AI graphic design.";
      } else if (q.includes('klab') || q.includes('browser')) {
        reply = "KLAB is our proprietary AI browser and intelligent workspace engineered for autonomous research, neural tab memory, and privacy isolation.";
      } else if (q.includes('klerp') || q.includes('erp')) {
        reply = "KLERP is our unified Enterprise Resource Planning (ERP) platform connecting finance, supply chain, inventory, and cross-departmental operations.";
      } else if (q.includes('klai') || q.includes('ai')) {
        reply = "KLAI is our enterprise AI platform deploying autonomous workflows, document intelligence, and multi-agent systems with deterministic guardrails.";
      }

      return sendJson(res, 200, { success: true, reply, actions, suggestions });
    } catch (err) {
      return sendJson(res, 500, { success: false, errors: ['Server error processing chat.'] });
    }
  }

  if (pathname === '/api/status' || pathname === '/api/health') {
    return sendJson(res, 200, { status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  }

  // Static File Serving
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  let cleanRel = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  while (cleanRel.startsWith('/') || cleanRel.startsWith('\\')) {
    cleanRel = cleanRel.slice(1);
  }

  // Check DIST_DIR first, then BASE_DIR
  let filePath = path.join(DIST_DIR, cleanRel);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(BASE_DIR, cleanRel);
  }

  // Check directory index
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) filePath = indexPath;
  }

  // Check clean URLs
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const page404 = fs.existsSync(path.join(DIST_DIR, '404.html')) ? path.join(DIST_DIR, '404.html') : path.join(BASE_DIR, '404.html');
      if (fs.existsSync(page404)) {
        res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(page404).pipe(res);
      } else {
        res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    let cacheControl = 'public, max-age=0, must-revalidate';
    if (['.png', '.jpg', '.webp', '.svg', '.ico', '.woff2', '.woff', '.css', '.js'].includes(ext)) {
      cacheControl = 'public, max-age=31536000, immutable';
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': cacheControl
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 THE KOLLI Web Server running on http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
