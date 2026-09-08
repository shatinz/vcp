/**
 * Visual Click Prompt (VCP) - Chrome Web Store Package Builder
 * Validates manifest, creates clean dist/vcp-extension.zip without development artifacts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const extDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(distDir, 'vcp-chrome-extension.zip');

console.log('📦 Starting Chrome Web Store package generation...');

// 1. Validate manifest exists and is valid JSON
const manifestPath = path.join(extDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Missing extension/manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`✓ Validated manifest.json: "${manifest.name}" v${manifest.version}`);

// 2. Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Remove old zip if present
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// 3. Verify all required assets exist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'content.css',
  'drawing-layer.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

for (const rel of requiredFiles) {
  const full = path.join(extDir, rel);
  if (!fs.existsSync(full)) {
    console.error(`❌ Required file missing: extension/${rel}`);
    process.exit(1);
  }
}
console.log(`✓ All ${requiredFiles.length} required extension files verified.`);

// 4. Create clean zip archive using PowerShell Compress-Archive
try {
  const psCmd = `powershell -Command "Compress-Archive -Path '${extDir}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  const stats = fs.statSync(zipPath);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`\n🎉 Successfully packaged Chrome Web Store bundle!`);
  console.log(`📍 Archive: ${zipPath}`);
  console.log(`📊 Size: ${sizeKb} KB`);
  console.log(`🚀 Ready for upload to: https://chrome.google.com/webstore/devconsole\n`);
} catch (err) {
  console.error('❌ Failed to create zip archive:', err.message);
  process.exit(1);
}
