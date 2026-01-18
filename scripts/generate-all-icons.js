#!/usr/bin/env node

/**
 * Comprehensive Icon Generator for DNA App
 * Generates all required icons and favicons for web, PWA, and mobile platforms
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  input: {
    black: path.join(__dirname, '../public/logo-black.png'),
    white: path.join(__dirname, '../public/logo-white.png'),
    svg: path.join(__dirname, '../public/DNA-Logo.svg'),
  },
  output: {
    icons: path.join(__dirname, '../public/icons'),
    public: path.join(__dirname, '../public'),
  },
  sizes: {
    pwa: [72, 96, 128, 144, 152, 192, 384, 512],
    favicon: [16, 32],
    apple: 180,
  }
};

// Ensure output directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.output.icons)) {
    fs.mkdirSync(CONFIG.output.icons, { recursive: true });
  }
}

// Check if required source files exist
function validateSources() {
  const required = [CONFIG.input.black];
  const missing = required.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.error('❌ Error: Required source files not found:');
    missing.forEach(file => console.error(`   - ${path.basename(file)}`));
    process.exit(1);
  }
  
  if (!fs.existsSync(CONFIG.input.white)) {
    console.warn('⚠️  Warning: logo-white.png not found, using logo-black.png for all variations');
  }
  
  if (!fs.existsSync(CONFIG.input.svg)) {
    console.warn('⚠️  Warning: DNA-Logo.svg not found');
  }
}

// Generate a single icon
async function generateIcon(input, size, output, options = {}) {
  const {
    background = { r: 255, g: 255, b: 255, alpha: 0 },
    fit = 'contain',
  } = options;
  
  try {
    await sharp(input)
      .resize(size, size, { fit, background })
      .png()
      .toFile(output);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${path.basename(output)}:`, error.message);
    return false;
  }
}

// Main generation function
async function generateAllIcons() {
  console.log('🎨 DNA Icon Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  ensureDirectories();
  validateSources();
  
  const tasks = [];
  let successCount = 0;
  let failCount = 0;
  
  // PWA Icons
  console.log('📱 Generating PWA Icons...');
  for (const size of CONFIG.sizes.pwa) {
    const outputFile = path.join(CONFIG.output.icons, `icon-${size}x${size}.png`);
    console.log(`   → ${size}x${size}px`);
    tasks.push(
      generateIcon(CONFIG.input.black, size, outputFile)
        .then(success => success ? successCount++ : failCount++)
    );
  }
  
  // Favicons
  console.log('\n🌐 Generating Favicons...');
  for (const size of CONFIG.sizes.favicon) {
    const outputFile = path.join(CONFIG.output.public, `favicon-${size}x${size}.png`);
    console.log(`   → favicon-${size}x${size}.png`);
    tasks.push(
      generateIcon(CONFIG.input.black, size, outputFile)
        .then(success => success ? successCount++ : failCount++)
    );
  }
  
  // Apple Touch Icon
  console.log('\n🍎 Generating Apple Touch Icon...');
  const appleOutputFile = path.join(CONFIG.output.public, 'apple-touch-icon.png');
  console.log(`   → ${CONFIG.sizes.apple}x${CONFIG.sizes.apple}px`);
  tasks.push(
    generateIcon(CONFIG.input.black, CONFIG.sizes.apple, appleOutputFile)
      .then(success => success ? successCount++ : failCount++)
  );
  
  // Wait for all tasks to complete
  await Promise.all(tasks);
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Successfully generated: ${successCount} icons`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} icons`);
  }
  
  console.log('\n📁 Output locations:');
  console.log(`   • PWA Icons: ${CONFIG.output.icons}`);
  console.log(`   • Favicons: ${CONFIG.output.public}`);
  
  console.log('\n💡 Next steps:');
  console.log('   1. Verify icons in /public/icons/ directory');
  console.log('   2. Run: npm run favicon (to generate favicon.ico)');
  console.log('   3. Test PWA installation on mobile devices');
  console.log('');
}

// Run the generator
generateAllIcons().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
