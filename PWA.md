# PWA Features

This application is a Progressive Web App (PWA) with the following features:

## ✨ Features

### 📱 Installable
- Can be installed on desktop and mobile devices
- Add to home screen on iOS/Android
- Standalone app experience

### 🔄 Offline Support
- Works offline with cached content
- Custom offline page
- Service worker for caching strategies

### 🎨 App Icons
- Generated from logo.png
- Multiple sizes for different devices:
  - 72x72, 96x96, 128x128, 144x144
  - 152x152, 192x192, 384x384, 512x512
- Apple touch icons
- Favicon

### 📋 Manifest
- App name: DNA Web App
- Theme color: #0070f3
- Display mode: standalone
- Orientation: portrait-primary

### 🚀 Performance
- Service worker for caching
- Fast loading times
- Optimized assets

## 🛠️ Development

### Generate Assets

```bash
# Generate all PWA icons from logo.png
npm run generate-icons

# Generate favicon
npm run generate-favicon

# Generate all assets at once
npm run generate-all-assets
```

### Testing PWA

1. Build the app:
```bash
npm run build
npm start
```

2. Open in browser and check:
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Lighthouse audit for PWA score

### iOS Installation

1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android Installation

1. Open in Chrome
2. Tap menu (three dots)
3. Select "Install app" or "Add to Home Screen"

## 📝 Configuration Files

- `next.config.ts` - PWA configuration with next-pwa
- `public/manifest.json` - Web app manifest
- `src/app/layout.tsx` - PWA metadata and meta tags
- `src/components/PWAInstallPrompt.tsx` - Install prompt component

## 🔧 Scripts

All icon generation scripts are in `scripts/` directory:
- `generate-icons.js` - Generate all app icons
- `generate-favicon.js` - Generate favicon

## 📚 Resources

- [Next.js PWA Guide](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Workers](https://web.dev/service-workers-cache-storage/)
