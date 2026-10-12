const fs = require('fs');
const path = require('path');

const root = __dirname;
const output = path.join(root, 'dist');

// Clean and recreate dist
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

// Copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Items to copy into dist
const itemsToCopy = [
  'assets',
  'css',
  'js',
  'products',
  'services',
  'insights',
  'data',
  '404.html',
  'about.html',
  'careers.html',
  'contact.html',
  'faq.html',
  'index.html',
  'privacy.html',
  'security.html',
  'terms.html',
  'what-we-do.html',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest'
];

for (const item of itemsToCopy) {
  const src = path.join(root, item);
  const dest = path.join(output, item);
  if (fs.existsSync(src)) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copyDirSync(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log(`[BUILD SUCCESS] Successfully compiled entire website into dist/`);
