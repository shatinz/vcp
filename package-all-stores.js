/**
 * Visual Click Prompt (VCP) - Multi-Store Free Packaging Engine
 * Generates tailored production packages for 100% free extension stores:
 * 1. Microsoft Edge Add-ons (partner.microsoft.com - $0 Free)
 * 2. Mozilla Firefox Add-ons (addons.mozilla.org - $0 Free)
 * 3. Opera Add-ons (addons.opera.com - $0 Free)
 * 4. Google Chrome Web Store / Direct CRX distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const extDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');
const stagingDir = path.join(distDir, 'staging');

console.log('================================================================================');
console.log('📦 VCP Multi-Store Package Builder (Free Stores & Direct Distribution)');
console.log('================================================================================\n');

// 1. Validate extension directory & manifest
const manifestPath = path.join(extDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Missing extension/manifest.json');
  process.exit(1);
}

const baseManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`✓ Base manifest verified: "${baseManifest.name}" v${baseManifest.version}`);

// Ensure dist and staging directories
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Required extension files
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
console.log(`✓ All ${requiredFiles.length} core extension files verified.\n`);

// Helper to copy directory recursively
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

// Helper to zip directory using PowerShell
function createZip(sourceDir, zipFile) {
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${zipFile}' -Force"`;
  execSync(psCmd, { stdio: 'pipe' });
  const stats = fs.statSync(zipFile);
  return (stats.size / 1024).toFixed(1);
}

const results = [];

// --- 1. Microsoft Edge Add-ons (100% Free Store) ---
console.log('🔨 [1/4] Building Microsoft Edge Add-ons package ($0 Free)...');
const edgeDir = path.join(stagingDir, 'edge');
copyDirSync(extDir, edgeDir);
const edgeZip = path.join(distDir, 'vcp-edge-extension.zip');
const edgeSize = createZip(edgeDir, edgeZip);
results.push({
  store: 'Microsoft Edge Add-ons (Free Store)',
  file: 'dist/vcp-edge-extension.zip',
  size: `${edgeSize} KB`,
  url: 'https://partner.microsoft.com/dashboard/microsoftedge',
  cost: '$0 (100% Free)'
});
console.log(`    --> Generated: dist/vcp-edge-extension.zip (${edgeSize} KB)`);

// --- 2. Mozilla Firefox Add-ons / AMO (100% Free Store) ---
console.log('🔨 [2/4] Building Mozilla Firefox Add-ons (AMO) package ($0 Free)...');
const firefoxDir = path.join(stagingDir, 'firefox');
copyDirSync(extDir, firefoxDir);

// Inject Firefox-specific Gecko ID & WebExtensions MV3 settings
const firefoxManifest = JSON.parse(JSON.stringify(baseManifest));
firefoxManifest.browser_specific_settings = {
  gecko: {
    id: "vcp-bridge@shatinz.github.io",
    strict_min_version: "109.0"
  }
};
// Firefox MV3 background script compatibility
firefoxManifest.background = {
  scripts: ["background.js"]
};

fs.writeFileSync(
  path.join(firefoxDir, 'manifest.json'),
  JSON.stringify(firefoxManifest, null, 2),
  'utf8'
);

const firefoxZip = path.join(distDir, 'vcp-firefox-extension.zip');
const firefoxSize = createZip(firefoxDir, firefoxZip);
results.push({
  store: 'Mozilla Firefox Add-ons AMO (Free Store)',
  file: 'dist/vcp-firefox-extension.zip',
  size: `${firefoxSize} KB`,
  url: 'https://addons.mozilla.org/developers/',
  cost: '$0 (100% Free)'
});
console.log(`    --> Generated: dist/vcp-firefox-extension.zip (${firefoxSize} KB)`);

// --- 3. Opera Add-ons (100% Free Store) ---
console.log('🔨 [3/4] Building Opera Add-ons package ($0 Free)...');
const operaDir = path.join(stagingDir, 'opera');
copyDirSync(extDir, operaDir);
const operaZip = path.join(distDir, 'vcp-opera-extension.zip');
const operaSize = createZip(operaDir, operaZip);
results.push({
  store: 'Opera Add-ons (Free Store)',
  file: 'dist/vcp-opera-extension.zip',
  size: `${operaSize} KB`,
  url: 'https://addons.opera.com/developer/',
  cost: '$0 (100% Free)'
});
console.log(`    --> Generated: dist/vcp-opera-extension.zip (${operaSize} KB)`);

// --- 4. Google Chrome Web Store & Direct Unpacked ---
console.log('🔨 [4/4] Building Google Chrome Web Store / Direct load package...');
const chromeDir = path.join(stagingDir, 'chrome');
copyDirSync(extDir, chromeDir);
const chromeZip = path.join(distDir, 'vcp-chrome-extension.zip');
const chromeSize = createZip(chromeDir, chromeZip);
results.push({
  store: 'Google Chrome Web Store / GitHub Releases',
  file: 'dist/vcp-chrome-extension.zip',
  size: `${chromeSize} KB`,
  url: 'https://chrome.google.com/webstore/devconsole',
  cost: '$5 one-time or $0 via Direct Load'
});
console.log(`    --> Generated: dist/vcp-chrome-extension.zip (${chromeSize} KB)`);

// Clean staging directory
try {
  fs.rmSync(stagingDir, { recursive: true, force: true });
} catch (e) {}

// Print summary table
console.log('\n================================================================================');
console.log('🎉 ALL PACKAGES SUCCESSFULLY BUILT!');
console.log('================================================================================\n');

console.table(results.map(r => ({
  'Target Store': r.store,
  'Package Archive': r.file,
  'Size': r.size,
  'Developer Fee': r.cost,
  'Developer Portal': r.url
})));

console.log('\n📖 Review FREE_STORES_PUBLISHING.md for copy-paste descriptions and submission guides.');
