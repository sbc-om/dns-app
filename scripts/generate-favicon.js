#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

let pngToIco;
try {
  pngToIco = require('png-to-ico');
  if (pngToIco && typeof pngToIco !== 'function' && typeof pngToIco.default === 'function') {
    pngToIco = pngToIco.default;
  }
} catch {
  pngToIco = null;
}

const inputBlack = path.join(__dirname, '../public/logo-black.png');
const inputWhite = path.join(__dirname, '../public/logo-white.png');

const outputIco = path.join(__dirname, '../public/favicon.ico');
const outputFavicon16 = path.join(__dirname, '../public/favicon-16x16.png');
const outputFavicon32 = path.join(__dirname, '../public/favicon-32x32.png');
const outputFaviconDark16 = path.join(__dirname, '../public/favicon-dark-16x16.png');
const outputFaviconDark32 = path.join(__dirname, '../public/favicon-dark-32x32.png');

console.log('🎨 Generating favicons from logo-black.png and logo-white.png...\n');

// Check if logo sources exist
if (!fs.existsSync(inputBlack)) {
  console.error('❌ Error: logo-black.png not found in public directory');
  process.exit(1);
}

if (!fs.existsSync(inputWhite)) {
  console.error('❌ Error: logo-white.png not found in public directory');
  process.exit(1);
}

async function generatePng(inputFile, size, outputFile) {
  await sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(outputFile);
}

async function main() {
  console.log('🔹 Creating PNG favicons...');
  await generatePng(inputBlack, 16, outputFavicon16);
  await generatePng(inputBlack, 32, outputFavicon32);
  await generatePng(inputWhite, 16, outputFaviconDark16);
  await generatePng(inputWhite, 32, outputFaviconDark32);
  console.log('✅ Generated: favicon-16x16.png, favicon-32x32.png');
  console.log('✅ Generated: favicon-dark-16x16.png, favicon-dark-32x32.png');

  if (!pngToIco) {
    console.log('\n⚠️ png-to-ico is not installed, skipping favicon.ico generation.');
    console.log('   Install it with: npm i -D png-to-ico');
    return;
  }

  console.log('\n🔹 Creating favicon.ico...');
  const icoBuffer = await pngToIco([outputFavicon16, outputFavicon32]);
  fs.writeFileSync(outputIco, icoBuffer);
  console.log('✅ Generated: favicon.ico');

  console.log('\n🎉 Favicons generated successfully!\n');
}

main().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});
