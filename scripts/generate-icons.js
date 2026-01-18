#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appleTouchSize = 180;
const faviconSizes = [16, 32];

const inputFile = path.join(__dirname, '../public/logo-black.png');
const inputWhite = path.join(__dirname, '../public/logo-white.png');
const outputDir = path.join(__dirname, '../public/icons');
const appleTouchOutputFile = path.join(__dirname, '../public/apple-touch-icon.png');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons and favicons...\n');

// Check if logo files exist
if (!fs.existsSync(inputFile)) {
  console.error('❌ Error: logo-black.png not found in public directory');
  process.exit(1);
}

if (!fs.existsSync(inputWhite)) {
  console.warn('⚠️  Warning: logo-white.png not found, using logo-black.png for all icons');
}

// Generate icons
Promise.all([
  // Generate PWA icons
  ...sizes.map(size => {
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
  }),
  
  // Generate favicons
  ...faviconSizes.map(size => {
    const outputFile = path.join(__dirname, `../public/favicon-${size}x${size}.png`);
    console.log(`🌐 Creating favicon-${size}x${size}.png...`);
    
    return sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputFile)
      .then(() => {
        console.log(`✅ Generated: favicon-${size}x${size}.png`);
      })
      .catch(err => {
        console.error(`❌ Error generating favicon-${size}x${size}:`, err);
      });
  })
])
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
  console.log('\n🎉 All icons and favicons generated successfully!');
  console.log(`📁 PWA Icons saved to: ${outputDir}`);
  console.log(`📁 Favicons saved to: ${path.join(__dirname, '../public')}\n`);
  console.log('💡 Tip: Run the generate-favicon script to create favicon.ico file');
})
.catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
