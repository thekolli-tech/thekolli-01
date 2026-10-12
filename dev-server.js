const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
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
      if (body.length > 1e6) { // 1MB limit
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
      
      // Honeypot spam check
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

      console.log(`[INQUIRY RECEIVED] ID: ${inquiryId} from ${record.email} (${record.company})`);

      return sendJson(res, 200, {
        success: true,
        message: 'Your project inquiry has been successfully received. Our engineering and architecture team will review your requirements.',
        inquiryId
      });
    } catch (err) {
      console.error('Error handling /api/inquiry:', err);
      return sendJson(res, 500, { success: false, errors: ['Server error processing inquiry.'] });
    }
  }

  if (pathname === '/api/early-access' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);

      // Honeypot check
      if (data.hp_field && data.hp_field.trim() !== '') {
        return sendJson(res, 400, { success: false, errors: ['Spam detected.'] });
      }

      const errors = [];
      if (!data.product || !['KLERP', 'KLAI', 'KLAB', 'KLORA'].includes(data.product.toUpperCase())) errors.push('Please select a valid product (KLAB, KLERP, KLAI, or KLORA).');
      if (!data.name || data.name.trim().length < 2) errors.push('Please provide your name.');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.push('Please provide a valid work email.');
      if (!data.company || data.company.trim().length < 2) errors.push('Please provide your organization name.');

      if (errors.length > 0) {
        return sendJson(res, 400, { success: false, errors });
      }

      const regId = 'EA-' + data.product.toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      const record = {
        registrationId: regId,
        createdAt: new Date().toISOString(),
        product: data.product.toUpperCase(),
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company.trim(),
        teamSize: data.teamSize || '10-50',
        useCase: (data.useCase || '').trim()
      };

      const filePath = path.join(DATA_DIR, 'early-access.json');
      const list = readJsonFile(filePath, []);
      list.unshift(record);
      writeJsonFile(filePath, list);

      console.log(`[PRODUCT ACCESS REGISTERED] Product: ${record.product}, ID: ${regId} from ${record.email}`);

      return sendJson(res, 200, {
        success: true,
        message: `Your access request for ${record.product} has been received. Our solutions engineering team will reach out immediately with onboarding and environment setup details.`,
        registrationId: regId
      });
    } catch (err) {
      console.error('Error handling /api/early-access:', err);
      return sendJson(res, 500, { success: false, errors: ['Server error registering product access.'] });
    }
  }

  // KLARA AI Chatbot Endpoint
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const userMsg = (data.message || '').trim();

      if (!userMsg) {
        return sendJson(res, 400, { success: false, reply: "Please provide a question or message." });
      }

      const q = userMsg.toLowerCase();
      let reply = "";
      let actions = [];
      let suggestions = [];

      const waInquiryUrl = "https://wa.me/916366850605?text=" + encodeURIComponent("Hi THE KOLLI, I am inquiring through KLARA about:\n\n\"" + userMsg + "\"\n\nCould we discuss this?");

      // 0. Direct WhatsApp intent
      if (q.includes('whatsapp') || q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('6366850605')) {
        reply = "You can connect directly with our engineering and leadership team on WhatsApp at <strong>+91 6366850605</strong>. Click the button below to start a direct WhatsApp conversation right away.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20am%20reaching%20out%20via%20KLARA." });
        actions.push({ label: "Discuss Your Project", action: "modal_consultation" });
        suggestions = ["What is KLORA?", "What is KLAB AI Browser?", "How does KLERP work?"];
      }
      // 1. KLORA (Autonomous AI Digital Marketing)
      else if (q.includes('klora') || q.includes('marketing') || q.includes('digital marketing') || q.includes('meta ads') || q.includes('google ads') || q.includes('linkedin ads') || q.includes('chatgpt') || q.includes('seo') || q.includes('geo') || q.includes('graphic design') || q.includes('content creation')) {
        reply = "<strong>KLORA</strong> is our proprietary autonomous AI digital marketing platform. It automates full-cycle growth operations across key capabilities:<br><br>• <strong>Ad Campaign Orchestration:</strong> Autonomous creation, budget balancing, and bid tuning across <strong>Meta (FB & IG)</strong>, <strong>Google Ads (Search & P-Max)</strong>, and <strong>LinkedIn B2B Ads</strong>.<br>• <strong>ChatGPT Copywriting:</strong> Generates high-converting, multi-angle headlines, ad creatives, hooks, and sales copy.<br>• <strong>SEO & GEO (Generative Engine Optimization):</strong> Optimizes authority and ranking on traditional search and AI search engines (Perplexity, ChatGPT, Copilot, Gemini).<br>• <strong>Autonomous Content Creation:</strong> End-to-end long-form articles, landing pages, and social calendars.<br>• <strong>AI Graphic Design Studio:</strong> Automated banners, carousels, and multi-format display graphics.<br><br><em>Status:</em> <strong>Ready to Use</strong>. Available for immediate onboarding.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20am%20interested%20in%20deploying%20KLORA%20Autonomous%20Digital%20Marketing%20Platform." });
        actions.push({ label: "Get Started with KLORA", action: "modal_early_access", product: "KLORA" });
        actions.push({ label: "View KLORA Specs", action: "navigate", url: "/products/klora.html" });
        suggestions = ["How does ad automation work in KLORA?", "What is KLAB AI Browser?", "+91 6366850605"];
      }
      // 2. KLAB AI Browser
      else if (q.includes('klab') || q.includes('browser') || q.includes('web workspace') || q.includes('ai browser') || q.includes('browsing')) {
        reply = "<strong>KLAB</strong> is our proprietary AI Browser and intelligent web workspace. Unlike conventional browsers, KLAB performs autonomous multi-step research, maintains a neural context graph across open tabs, strips 100% of intrusive ads/trackers via its clean semantic DOM engine, and bridges web findings directly into enterprise business systems (including KLERP) with local-first privacy isolation.<br><br><em>Status:</em> <strong>Ready to Use</strong>. Available for immediate deployment.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20would%20like%20to%20get%20started%20with%20KLAB%20AI%20Browser." });
        actions.push({ label: "Get Started with KLAB", action: "modal_early_access", product: "KLAB" });
        actions.push({ label: "View KLAB Specs", action: "navigate", url: "/products/klab.html" });
        suggestions = ["What is KLORA?", "How does KLERP ERP work?", "Discuss a project"];
      }
      // 3. KLERP (Enterprise Resource Planning)
      else if (q.includes('klerp') || q.includes('erp') || q.includes('enterprise resource planning')) {
        reply = "<strong>KLERP</strong> is KLABS's proprietary <strong>Enterprise Resource Planning (ERP)</strong> system. It is engineered to unify fragmented business operations—connecting finance, supply chains, inventory, human resources, and cross-departmental workflows into a single coherent, real-time enterprise management environment.<br><br><em>Status:</em> <strong>Ready to Use</strong>. Production-ready for enterprise deployment.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20would%20like%20to%20discuss%20deploying%20KLERP%20ERP." });
        actions.push({ label: "Deploy KLERP / Request Demo", action: "modal_early_access", product: "KLERP" });
        actions.push({ label: "View KLERP Architecture", action: "navigate", url: "/products/klerp.html" });
        suggestions = ["What is KLORA AI Marketing?", "What is KLAB AI Browser?", "Discuss enterprise ERP integration"];
      }
      // 4. KLAI
      else if (q.includes('klai') || q.includes('ai platform') || q.includes('agent') || q.includes('intelligence engine')) {
        reply = "<strong>KLAI</strong> is our enterprise AI platform focused on deploying autonomous workflows, document intelligence, and multi-system agentic automation with human-in-the-loop governance and verified audit trails.<br><br><em>Status:</em> <strong>Ready to Use</strong>. Production-ready for immediate integration.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20am%20interested%20in%20deploying%20KLAI%20Enterprise%20AI." });
        actions.push({ label: "Deploy KLAI", action: "modal_early_access", product: "KLAI" });
        actions.push({ label: "View KLAI Details", action: "navigate", url: "/products/klai.html" });
        suggestions = ["What is KLORA?", "What is KLAB AI Browser?", "How does KLERP ERP work?"];
      }
      // 5. Products overview
      else if (q.includes('product') || q.includes('products') || q.includes('ecosystem')) {
        reply = "THE KOLLI builds four proprietary software products, all <strong>ready to use</strong> for your organization:<br><br>1. <strong>KLAB (AI Browser)</strong> — Intelligent web workspace with autonomous research & neural tab memory.<br>2. <strong>KLERP (Enterprise Resource Planning - ERP)</strong> — Unified enterprise operations & ERP system.<br>3. <strong>KLAI (AI Platform)</strong> — Autonomous workflow automation & enterprise agent mesh.<br>4. <strong>KLORA (Autonomous AI Digital Marketing)</strong> — Full-cycle ad automation (Meta, Google, LinkedIn), ChatGPT copy, SEO & GEO, and AI graphics.<br><br>All four products are fully available for deployment and demonstration.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20want%20to%20learn%20more%20about%20your%20products." });
        actions.push({ label: "View All Products", action: "navigate", url: "/products/index.html" });
        suggestions = ["Tell me about KLORA", "What is KLAB AI Browser?", "Tell me about KLERP ERP"];
      }
      // 6. Services / Software Development
      else if (q.includes('service') || q.includes('services') || q.includes('software development') || q.includes('cloud') || q.includes('managed') || q.includes('development')) {
        reply = "THE KOLLI delivers four core technology service offerings:<br><br>• <strong>Software Development:</strong> Custom web, mobile, and enterprise platforms tailored to exact specifications.<br>• <strong>AI & Automation:</strong> Intelligent workflow systems and process optimization.<br>• <strong>IT & Cloud Services:</strong> Modernization, cloud migration, and performance scaling.<br>• <strong>Managed IT Services:</strong> Proactive 24/7 monitoring, maintenance, and technical support.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: waInquiryUrl });
        actions.push({ label: "Discuss Your Project", action: "modal_consultation" });
        actions.push({ label: "Explore Services", action: "navigate", url: "/services/index.html" });
        suggestions = ["Discuss Your Project", "What products do you build?", "Email THE KOLLI team"];
      }
      // 7. Project Discussion / Contact / Pricing
      else if (q.includes('discuss') || q.includes('project') || q.includes('quote') || q.includes('price') || q.includes('pricing') || q.includes('hire') || q.includes('cost') || q.includes('contact') || q.includes('email')) {
        reply = "We would love to discuss your technology initiatives! You can chat directly with our team on WhatsApp at <strong>+91 6366850605</strong>, submit an inquiry through our project discussion form, or email us at <a href='mailto:contact@thekolli.com' style='color:var(--lq-teal); text-decoration:underline;'>contact@thekolli.com</a>. We support both international milestone engagements (USD) and regional contracts.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: waInquiryUrl });
        actions.push({ label: "Open Project Consultation Form", action: "modal_consultation" });
        suggestions = ["+91 6366850605", "Tell me about KLORA", "Tell me about KLAB", "Our Process"];
      }
      // 8. Process / Methodology
      else if (q.includes('process') || q.includes('methodology') || q.includes('how do you work') || q.includes('workflow')) {
        reply = "Our delivery process follows a disciplined 6-stage lifecycle:<br><br>1. <strong>Discover:</strong> Understand goals, requirements, and constraints.<br>2. <strong>Define:</strong> Scope, architecture boundaries, and milestones.<br>3. <strong>Design:</strong> Technical systems and user experience.<br>4. <strong>Build:</strong> Manageable, reviewed delivery cycles.<br>5. <strong>Verify:</strong> Rigorous quality assurance and testing.<br>6. <strong>Deliver:</strong> Deployment, documentation, and long-term support.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: waInquiryUrl });
        actions.push({ label: "Discuss a Project", action: "modal_consultation" });
        suggestions = ["Software Development", "What is KLORA?", "Contact Engineering"];
      }
      // 9. Staff augmentation / Outsourcing clarification
      else if (q.includes('outsourcing') || q.includes('staff augmentation') || q.includes('hire developers') || q.includes('dedicated team')) {
        reply = "THE KOLLI is a <strong>product-led technology company</strong>. Rather than providing resource outsourcing, body shopping, or dedicated staff augmentation, we take end-to-end engineering ownership to build proprietary solutions, enterprise software architectures, and automated systems tailored to your goals.";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: waInquiryUrl });
        actions.push({ label: "Discuss Your Project", action: "modal_consultation" });
        suggestions = ["What are your core services?", "Explore Products", "Contact Team"];
      }
      // 10. Greeting / General
      else if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('klara') || q.includes('who are you') || q.includes('help')) {
        reply = "Hello! I am <strong>KLARA</strong>, the AI intelligence concierge for THE KOLLI. I'm here to help you learn about our proprietary software products (<strong>KLAB AI Browser</strong>, <strong>KLERP ERP</strong>, <strong>KLAI</strong>, <strong>KLORA AI Marketing</strong>), our client engineering services, or help you connect with our leadership team on WhatsApp (+91 6366850605). How can I assist you?";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: "https://wa.me/916366850605?text=Hi%20THE%20KOLLI,%20I%20am%20reaching%20out%20via%20KLARA." });
        suggestions = ["What is KLORA AI Marketing?", "What is KLAB AI Browser?", "Tell me about KLERP", "Discuss a Project"];
      }
      // Default Fallback
      else {
        reply = "Thank you for asking! At THE KOLLI, we combine proprietary software product development (KLAB AI Browser, KLERP ERP, KLAI, KLORA) with specialized client services in Software Development, Cloud Infrastructure, and AI Automation.<br><br>Would you like to explore one of our products, learn about our services, or send an inquiry to our team on WhatsApp (+91 6366850605)?";
        actions.push({ label: "+91 6366850605", action: "whatsapp", url: waInquiryUrl });
        actions.push({ label: "Discuss Your Project", action: "modal_consultation" });
        actions.push({ label: "Explore Products", action: "navigate", url: "/products/index.html" });
        suggestions = ["What is KLORA?", "What is KLAB AI Browser?", "Tell me about KLERP ERP", "Our Services"];
      }

      // Record chat in data/chats.json
      const chatsPath = path.join(DATA_DIR, 'chats.json');
      const chatList = readJsonFile(chatsPath, []);
      chatList.unshift({
        timestamp: new Date().toISOString(),
        query: userMsg,
        responseSnippet: reply.substring(0, 120),
        ip: req.socket.remoteAddress
      });
      if (chatList.length > 500) chatList.length = 500;
      writeJsonFile(chatsPath, chatList);

      return sendJson(res, 200, {
        success: true,
        reply,
        actions,
        suggestions
      });
    } catch (err) {
      console.error('Error handling /api/chat:', err);
      return sendJson(res, 500, { success: false, errors: ['Server error processing chat request.'] });
    }
  }

  if ((pathname === '/api/status' || pathname === '/api/health') && req.method === 'GET') {
    return sendJson(res, 200, { status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  }

  // Static File Serving
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(BASE_DIR, safePath);

  // If path is a directory (e.g. /services, /products, /insights), check for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    }
  }

  // Support clean URLs: if /about or /what-we-do or /services/software-development is requested, look for .html
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const page404 = path.join(BASE_DIR, '404.html');
      if (fs.existsSync(page404)) {
        res.writeHead(404, {
          ...SECURITY_HEADERS,
          'Content-Type': 'text/html; charset=utf-8'
        });
        fs.createReadStream(page404).pipe(res);
      } else {
        res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found - KLABS</title></head><body><h1>404 Not Found</h1></body></html>`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    let cacheControl = 'no-cache, no-store, must-revalidate';
    if (['.png', '.jpg', '.svg', '.ico', '.woff2', '.woff'].includes(ext)) {
      cacheControl = 'public, max-age=86400, immutable';
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 THE KOLLI Web Application Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
