#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appleTouchSize = 180;

const inputFile = path.join(__dirname, '../public/logo-black.png');
const outputDir = path.join(__dirname, '../public/icons');
const appleTouchOutputFile = path.join(__dirname, `../public/apple-touch-icon.png`);

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons from logo-black.png...\n');

// Check if logo-black.png exists
if (!fs.existsSync(inputFile)) {
  console.error('❌ Error: logo-black.png not found in public directory');
  process.exit(1);
}

// Generate icons
Promise.all(
  sizes.map(size => {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    console.log(`📱 Creating ${size}x${size} icon...`);
    
    return sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputFile)
      .then(() => {
        console.log(`✅ Generated: icon-${size}x${size}.png`);
      })
      .catch(err => {
        console.error(`❌ Error generating ${size}x${size}:`, err);
      });
  })
)
.then(() => {
  console.log(`\n🍎 Creating Apple touch icon (${appleTouchSize}x${appleTouchSize})...`);
  return sharp(inputFile)
    .resize(appleTouchSize, appleTouchSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(appleTouchOutputFile);
})
.then(() => {
  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Icons saved to: ${outputDir}\n`);
})
.catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
