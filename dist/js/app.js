/**
 * THE KOLLI — High-Tech Precision Engineering Interactive Engine
 * Inspired by Linear / Vercel Developer Standards & thekolli-website.vercel.app
 * Features:
 * - Ambient ember particle network (Canvas 2D, proximity links, amber highlights)
 * - Cursor spotlight glow (#light) & Reading progress line (#bar)
 * - Dynamic spotlight card tracking (.p --x, --y coordinates)
 * - 3D Ribbon K gyro/mouse tilt
 * - Split typography entrance animations
 * - Interactive horizontal pipeline & vertical evolution path
 * - Concentric division orbit engine (#orb)
 * - KLARA AI Project Assistant with direct WhatsApp forwarding (+91 6366850605)
 * - Consultation modal & contact form integration
 */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PHONE = '916366850605';
const EMAIL = 'thekolli.in@gmail.com';

// ==========================================================================
// 1. Boot Loader Sequence
// ==========================================================================
const ld = $('#ld');
if (ld) {
  document.body.classList.add('ld');
  let pr = 0;
  let loaded = document.readyState === 'complete';
  let fin = false;
  const t0 = performance.now();
  const MIN = RM ? 200 : 1200;

  window.addEventListener('load', () => loaded = true);
  setTimeout(() => loaded = true, 8000);

  (function tk(now) {
    const t = Math.min(1, (now - t0) / MIN);
    let g = 1 - Math.pow(1 - t, 3);
    if (!loaded) g = Math.min(g, 0.9);
    pr += (g * 100 - pr) * 0.14;
    if (g >= 1 && pr > 99.4) pr = 100;

    ld.style.setProperty('--pr', pr.toFixed(2));
    const pc = $('#pc');
    if (pc) pc.textContent = Math.round(pr) + '%';

    if (pr >= 100 && !fin) {
      fin = true;
      setTimeout(() => {
        ld.classList.add('out');
        setTimeout(() => document.body.classList.add('rd'), 400);
        setTimeout(() => {
          document.body.classList.remove('ld');
          ld.remove();
        }, 1600);
      }, 300);
      return;
    }
    requestAnimationFrame(tk);
  })(t0);
}

// ==========================================================================
// 2. Headline Word-Split Animation
// ==========================================================================
const h1 = $('#h1');
if (h1 && !h1.classList.contains('split-done')) {
  h1.classList.add('split-done');
  h1.innerHTML = h1.textContent
    .trim()
    .split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
    .join(' ');
}

// ==========================================================================
// 3. Division Satellite Orbit Engine (#orb)
// ==========================================================================
const orb = $('#orb');
if (orb) {
  const dv = [];
  const fill = (id, arr, r, dir, sp, c) => arr.forEach((t, i) => {
    const e = document.createElement('span');
    e.className = 'dv ' + c;
    e.textContent = t;
    orb.appendChild(e);
    dv.push({ e, r, dir, sp, a: i * 6.2832 / arr.length - 1.5708 });
  });

  fill('#rn', ['Engineering', 'AI', 'Cloud', 'Growth', 'Products', 'Launchpad'], 28, -1, 0.105, 'n');
  fill('#ro', ['Studios', 'Capital', 'Media', 'Labs', 'Ventures'], 46, 1, 0.0785, '');

  (function oo(now) {
    const t = RM ? 0 : now / 1000;
    dv.forEach(d => {
      const a = d.a + d.dir * t * d.sp;
      d.e.style.left = 50 + d.r * Math.cos(a) + '%';
      d.e.style.top = 50 + d.r * Math.sin(a) + '%';
    });
    requestAnimationFrame(oo);
  })(0);
}

// ==========================================================================
// 4. Scroll Tracking: Progress, Sticky Header, Pipelines & Timelines
// ==========================================================================
const onProgress = (box, sel, p) => {
  if (!box) return;
  box.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
  [...box.querySelectorAll(sel)].forEach((n, i, a) => {
    n.classList.toggle('on', p >= (i / (a.length - 1 || 1)) - 0.02);
  });
};

const navLinks = [...$$('nav ul a, .nav-links a')];
const header = $('header');
const bar = $('#bar') || $('#pg');

function handleScroll() {
  const y = window.scrollY;
  const H = document.documentElement.scrollHeight - window.innerHeight;

  if (bar) {
    bar.style.transform = `scaleX(${H > 0 ? y / H : 0})`;
  }

  if (header) {
    header.classList.toggle('s', y > 40);
    header.classList.toggle('scrolled', y > 40);
  }

  const sections = [...$$('main section[id]')];
  const current = sections.filter(sec => sec.getBoundingClientRect().top <= window.innerHeight * 0.35).pop()?.id;

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });

  // Track horizontal pipeline and vertical evolution path
  [['#pipe', 'div'], ['.pipe', 'div'], ['#pth', '.st'], ['.path', '.st']].forEach(([s, c]) => {
    const b = $(s);
    if (b) {
      const r = b.getBoundingClientRect();
      onProgress(b, c, (window.innerHeight * 0.75 - r.top) / (r.height + window.innerHeight * 0.05));
    }
  });
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ==========================================================================
// 5. Reveal Animations via IntersectionObserver
// ==========================================================================
const io = new IntersectionObserver(entries => {
  entries.forEach(x => {
    if (x.isIntersecting) {
      x.target.classList.add('in');
      io.unobserve(x.target);
    }
  });
}, { threshold: 0.12 });

$$('.rv').forEach(e => io.observe(e));

// ==========================================================================
// 6. Pointer Spotlight Coordinates & 3D Ribbon K Emblem Tilt
// ==========================================================================
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let lx = mx;
let ly = my;

window.addEventListener('pointermove', e => {
  mx = e.clientX;
  my = e.clientY;

  // 3D K tilt
  const k = $('#k');
  const kin = $('#kin');
  if (k && kin && !RM) {
    const r = k.getBoundingClientRect();
    const dx = (mx - (r.left + r.width / 2)) / window.innerWidth;
    const dy = (my - (r.top + r.height / 2)) / window.innerHeight;
    kin.style.transform = `rotateY(${dx * 26}deg) rotateX(${-dy * 22}deg)`;
  }
}, { passive: true });

// Dynamic spotlight coordinates on all cards
$$('.p, .proof-card, .service-detail, .panel, .partnership').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', (e.clientX - r.left) + 'px');
    card.style.setProperty('--y', (e.clientY - r.top) + 'px');
  });
});

// Magnetic button micro-reaction
$$('.mag').forEach(b => {
  b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});

// ==========================================================================
// 7. Ambient Ember Particle Network (Canvas 2D)
// ==========================================================================
const cv = $('#fx') || $('#field');
const light = $('#light');

if (cv) {
  const ctx = cv.getContext('2d');
  let W, D, P = [];

  function resizeCanvas() {
    D = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = window.innerWidth * D;
    cv.height = window.innerHeight * D;
    P = Array.from({ length: Math.round(window.innerWidth / 16) }, () => ({
      x: Math.random() * W,
      y: Math.random() * cv.height,
      r: (Math.random() * 1.3 + 0.4) * D,
      v: (Math.random() * 0.25 + 0.08) * D,
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() < 0.35
    }));
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  (function renderNetwork() {
    lx += (mx - lx) * 0.09;
    ly += (my - ly) * 0.09;
    if (light) {
      light.style.transform = `translate(${lx}px, ${ly}px)`;
    }

    ctx.clearRect(0, 0, W, cv.height);

    for (const p of P) {
      if (!RM) {
        p.y -= p.v;
        p.x += Math.sin(p.y / 90 + p.a * 9) * 0.15 * D;
      }
      if (p.y < -5) {
        p.y = cv.height + 5;
        p.x = Math.random() * W;
      }

      const d = Math.hypot(p.x / D - mx, p.y / D - my);
      const g = Math.max(0, 1 - d / 260);

      ctx.fillStyle = p.t
        ? `rgba(226, 164, 90, ${p.a * 0.5 + g})`
        : `rgba(217, 215, 211, ${p.a * 0.28 + g * 0.5})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + g * 1.6), 0, 6.283);
      ctx.fill();

      if (g > 0.4) {
        for (const q of P) {
          const e = Math.hypot(p.x - q.x, p.y - q.y);
          if (e < 90 * D && q !== p) {
            ctx.strokeStyle = `rgba(226, 164, 90, ${(1 - e / (90 * D)) * g * 0.5})`;
            ctx.lineWidth = D * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(renderNetwork);
  })();
}

// ==========================================================================
// 8. Contact Form Handling (Email & WhatsApp Forwarding)
// ==========================================================================
const contactForm = $('#contact-form');
const formStatus = $('#form-status');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const company = data.get('company') || 'Not provided';
    const phone = data.get('phone') || 'Not provided';
    const message = data.get('message') || '';

    const content = [
      `Hello THE KOLLI team,`,
      ``,
      `I have a project enquiry from the website:`,
      `• Name: ${name}`,
      `• Email: ${email}`,
      `• Company: ${company}`,
      `• Phone: ${phone}`,
      ``,
      `• Requirements:`,
      `${message}`
    ].join('\n');

    // Also send directly via WhatsApp
    const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(content)}`;
    
    // Open email client
    const mailtoUrl = `mailto:${EMAIL}?subject=${encodeURIComponent(`New Project Enquiry from ${name}`)}&body=${encodeURIComponent(content)}`;
    
    // Attempt WhatsApp first or fallback
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    
    if (formStatus) {
      formStatus.innerHTML = `✓ Enquiry initiated! Opening WhatsApp &amp; preparing email for <a href="${mailtoUrl}" style="color:var(--am);text-decoration:underline;">${EMAIL}</a>.`;
    }
  });
}

// ==========================================================================
// 9. Mobile Navigation Toggle
// ==========================================================================
const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}

// ==========================================================================
// 10. KLARA AI Project Assistant & Chatbot Widget
// ==========================================================================
(function initKlara() {
  const messages = [];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  // If launcher doesn't exist, create it
  let launcher = $('.chat-launcher');
  if (!launcher) {
    launcher = el('button', 'chat-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open KLARA project assistant');
    launcher.setAttribute('aria-controls', 'chat-panel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = '<span class="chat-launcher-icon" aria-hidden="true"></span><span class="chat-launcher-label">Ask KLARA</span>';
    document.body.appendChild(launcher);
  }

  let panel = $('#chat-panel');
  if (!panel) {
    panel = el('section', 'chat-panel');
    panel.id = 'chat-panel';
    panel.setAttribute('aria-labelledby', 'chat-title');
    panel.setAttribute('aria-label', 'KLARA project assistant');
    panel.hidden = true;

    const header = el('div', 'chat-header');
    const identity = el('div', 'chat-identity');
    const status = el('span', 'chat-status', 'AI CONCIERGE · READY');
    const title = el('h2', '', 'KLARA');
    title.id = 'chat-title';
    identity.append(status, title);
    const close = el('button', 'chat-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close chat');
    header.append(identity, close);

    const log = el('div', 'chat-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');

    const choices = el('div', 'chat-choices');
    const form = el('form', 'chat-form');
    const input = el('input', 'chat-input');
    input.type = 'text';
    input.name = 'message';
    input.maxLength = 1000;
    input.autocomplete = 'off';
    input.placeholder = 'Ask about products, ERP, AI, services...';
    input.setAttribute('aria-label', 'Your message');
    input.required = true;
    const send = el('button', 'chat-send', 'Send');
    send.type = 'submit';
    form.append(input, send);

    const handoff = el('div', 'chat-handoff');
    handoff.hidden = true;
    const whatsapp = el('a', 'chat-whatsapp', 'Send via WhatsApp');
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    const mail = el('a', 'chat-email', 'Send via Email');
    handoff.append(whatsapp, mail);

    panel.append(header, log, choices, form, handoff);
    document.body.appendChild(panel);

    const addMessage = (text, kind) => {
      const bubble = el('p', `chat-message ${kind}`, text);
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
    };

    const updateHandoff = () => {
      if (!messages.length) {
        handoff.hidden = true;
        return;
      }
      const content = ['Hello THE KOLLI team, I have a project enquiry:', ...messages.map(m => `- ${m}`)].join('\n');
      whatsapp.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(content)}`;
      mail.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry from THE KOLLI website')}&body=${encodeURIComponent(content)}`;
      handoff.hidden = false;
    };

    const replyFor = text => {
      const query = text.toLowerCase();
      if (/klerp|erp/.test(query)) {
        return 'KLERP is our modular Enterprise Resource Planning platform. It unifies operations, finance, supply chain, procurement, and billing into one connected system.';
      }
      if (/klab|browser/.test(query)) {
        return 'KLAB is an autonomous AI browser engineered for agentic web workflows, zero-clutter extraction, and multi-tab context synthesis.';
      }
      if (/klai|engine|intelligence/.test(query)) {
        return 'KLAI is our enterprise AI platform deploying intelligent reasoning agents, automated data ingestion, and autonomous workflow pipelines.';
      }
      if (/klora|marketing|ad|seo|geo|campaign/.test(query)) {
        return 'KLORA automates complete digital marketing: autonomous ad campaigns across Meta, Google, and LinkedIn, generative ChatGPT copywriting, SEO & GEO, and AI graphic design.';
      }
      if (/price|pricing|cost|budget|quote/.test(query)) {
        return 'Pricing depends on system scope, custom modules, and integration depth. Click "Send via WhatsApp" below to get a direct quote from our team!';
      }
      if (/contact|whatsapp|phone|number|call/.test(query)) {
        return 'You can reach us directly on WhatsApp at +91 6366850605 or email contact@thekolli.com.';
      }
      return 'Got it! I have recorded your enquiry. Click "Send via WhatsApp" below to forward this conversation directly to our team at +91 6366850605.';
    };

    const submitMessage = text => {
      const msg = text.trim();
      if (!msg) return;
      messages.push(msg);
      addMessage(msg, 'user');
      setTimeout(() => {
        addMessage(replyFor(msg), 'assistant');
        updateHandoff();
      }, 350);
    };

    addMessage('Hello! I am KLARA, your AI concierge at THE KOLLI. How can I help you today?', 'assistant');

    ['What is KLERP?', 'Tell me about KLAB', 'Explore KLORA AI Marketing', 'Discuss a Project'].forEach(text => {
      const choice = el('button', 'chat-choice', text);
      choice.type = 'button';
      choice.addEventListener('click', () => {
        submitMessage(text);
        choices.hidden = true;
      });
      choices.appendChild(choice);
    });

    const setOpen = open => {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      launcher.setAttribute('aria-label', open ? 'Close KLARA' : 'Open KLARA');
      if (open) input.focus();
      else launcher.focus();
    };

    launcher.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitMessage(input.value);
      input.value = '';
      input.focus();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    window.openKlara = () => setOpen(true);
  }
})();

// ==========================================================================
// 11. Consultation Modal Handler
// ==========================================================================
window.openConsultationModal = function() {
  let modal = $('#consultation-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'consultation-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" onclick="closeConsultationModal()" aria-label="Close modal">×</button>
        <h3 class="modal-title">Discuss Your Project</h3>
        <p class="modal-desc">Tell us what you are looking to build. We connect directly on WhatsApp (+91 6366850605) and email.</p>
        <form id="modal-form" class="contact-form">
          <div class="field">
            <label for="m-name">Your Name</label>
            <input type="text" id="m-name" name="name" required placeholder="Alex Mercer">
          </div>
          <div class="field">
            <label for="m-email">Email Address</label>
            <input type="email" id="m-email" name="email" required placeholder="alex@company.com">
          </div>
          <div class="field full">
            <label for="m-service">Service or Product Needed</label>
            <select id="m-service" name="service">
              <option value="KLERP">KLERP — Enterprise Resource Planning</option>
              <option value="KLAB">KLAB — AI Browser</option>
              <option value="KLAI">KLAI — Enterprise AI Platform</option>
              <option value="KLORA">KLORA — AI Digital Marketing</option>
              <option value="Custom Software">Custom Software / Web / App</option>
              <option value="Cloud / DevOps">Cloud & DevOps Infrastructure</option>
            </select>
          </div>
          <div class="field full">
            <label for="m-notes">Project Notes</label>
            <textarea id="m-notes" name="notes" placeholder="Describe the problem, timeline, or scope..."></textarea>
          </div>
          <button type="submit" class="btn mag full" style="width:100%;justify-content:center;">Submit &amp; Connect via WhatsApp</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target === modal) window.closeConsultationModal();
    });

    $('#modal-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#m-name').value;
      const email = $('#m-email').value;
      const service = $('#m-service').value;
      const notes = $('#m-notes').value;

      const text = `Hello THE KOLLI, I would like to discuss a project:\n• Name: ${name}\n• Email: ${email}\n• Interest: ${service}\n• Notes: ${notes}`;
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      window.closeConsultationModal();
    });
  }
  modal.classList.add('active');
};

window.closeConsultationModal = function() {
  const modal = $('#consultation-modal');
  if (modal) modal.classList.remove('active');
};
