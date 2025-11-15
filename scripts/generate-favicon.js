#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../public/logo.png');
const outputFile = path.join(__dirname, '../public/favicon.ico');

console.log('🎨 Generating favicon.ico from logo.png...\n');

// Check if logo.png exists
if (!fs.existsSync(inputFile)) {
  console.error('❌ Error: logo.png not found in public directory');
  process.exit(1);
}

// Generate favicon (32x32 is standard for favicon.ico)
sharp(inputFile)
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .png()
  .toFile(outputFile.replace('.ico', '.png'))
  .then(() => {
    console.log('✅ Generated: favicon.png');
    console.log('\n🎉 Favicon generated successfully!');
    console.log('📝 Note: Rename favicon.png to favicon.ico manually if needed\n');
  })
  .catch(err => {
    console.error('❌ Error generating favicon:', err);
    process.exit(1);
  });
