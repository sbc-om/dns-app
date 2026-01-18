# DNA - Discover Natural Ability

A bilingual (English/Arabic) Progressive Web App for talent intelligence in youth sports.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Create admin user
npm run create-admin

# Generate icons and favicons
npm run assets

# Start development server (runs on port 3016)
npm run dev
```

Open [http://localhost:3016](http://localhost:3016) with your browser.

---

## Essential Commands

### Development

```bash
npm run dev              # Start development server (port 3016)
npm run dev:webpack      # Start with Webpack (disable Turbopack)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database

```bash
npm run db:init          # Initialize LMDB database
npm run db:reset         # Reset database to admin only
npm run create-admin     # Create new admin user
```

### Assets (Icons & Favicons)

```bash
npm run icons            # Generate all PWA icons
npm run favicon          # Generate favicon.ico
npm run assets           # Generate all icons and favicons
```

### Legacy Commands

```bash
npm run generate-icons        # Same as: npm run icons
npm run generate-favicon      # Same as: npm run favicon
npm run generate-all-assets   # Same as: npm run assets
```

---

## Documentation

- 📖 [Full Documentation](./documentation/README.md)
- 🎨 [Icons & Favicon Guide](./docs/ICONS_GUIDE.md) | [راهنمای فارسی](./docs/ICONS_GUIDE_FA.md)
- 🏗️ [Architecture](./documentation/architecture.md)
- 🔐 [Authentication & Permissions](./documentation/auth-permissions.md)
- 🌍 [Routing & i18n](./documentation/routing-i18n.md)
- 🎨 [UI Guidelines](./documentation/ui-guidelines.md)
- 📱 [Mobile Design Guide](./docs/MOBILE_DESIGN_GUIDE.md)
- 🚀 [Deployment](./documentation/deployment.md)

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: LMDB (file-based)
- **UI**: shadcn/ui + Tailwind CSS
- **Animation**: Framer Motion
- **i18n**: Bilingual (English/Arabic) with RTL support
- **PWA**: @ducanh2912/next-pwa

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes (en/ar)
│   ├── api/               # API routes
│   └── offline/           # PWA offline fallback
├── components/            # React components
├── lib/                   # Core libraries
│   ├── auth/             # Authentication
│   ├── db/               # LMDB repositories
│   └── i18n/             # Internationalization
├── locales/              # Translation files (en.json, ar.json)
└── config/               # Configuration files

public/
├── icons/                # PWA icons (generated)
├── favicon.ico           # Browser favicon (generated)
├── apple-touch-icon.png  # iOS icon (generated)
└── manifest.json         # PWA manifest

scripts/
├── generate-all-icons.js # Icon generation (NEW)
├── generate-favicon.js   # Favicon generation
└── init-db.ts           # Database initialization
```

---

## Features

- ✅ **Bilingual**: Full support for English and Arabic (RTL)
- ✅ **PWA**: Installable, offline-capable
- ✅ **Dark Mode**: Game-like UI with animations
- ✅ **Role-Based Access**: Dynamic permissions system
- ✅ **Multi-Academy**: Support for multiple academies/schools
- ✅ **Player Profiles**: Comprehensive player tracking
- ✅ **Assessment System**: 7 physical tests with stages
- ✅ **Badges & Medals**: Gamification elements
- ✅ **Responsive**: Mobile-first design

---

## Icons & Favicon System

### Generated Files

All icons are auto-generated from `public/logo-black.png`:

- **PWA Icons**: 8 sizes (72x72 to 512x512) in `public/icons/`
- **Favicons**: 16x16, 32x32, and favicon.ico
- **Apple Touch Icon**: 180x180 for iOS devices
- **Dark Mode**: Separate dark mode favicons

### Regenerate Icons

When updating the logo:

```bash
# 1. Replace source file
cp new-logo.png public/logo-black.png

# 2. Generate all icons
npm run assets

# 3. Verify output
ls -la public/icons/
ls -la public/favicon*
```

See [ICONS_GUIDE.md](./docs/ICONS_GUIDE.md) for detailed documentation.

---

## Environment Variables

Create `.env.local`:

```env
# JWT Secret (required)
JWT_SECRET=your-secret-key-here

# Port (optional, defaults to 3016)
PORT=3016

# Node Environment
NODE_ENV=development
```

---

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# The app runs on port 4040 (configured in docker-compose.yml)
```

### Production

```bash
# Build
npm run build

# Start production server
npm run start
```

See [DEPLOYMENT.md](./documentation/deployment.md) for details.

---

## Contributing

1. Follow the [Copilot Instructions](./.github/copilot-instructions.md)
2. All code must be in English (no Persian/Arabic in code)
3. Use translation files for localized content
4. Follow the game-like UI/UX guidelines
5. Test on both desktop and mobile

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [LMDB](https://github.com/kriszyp/lmdb-js)

---

## License

Proprietary - Discover Natural Ability © 2026

---

*Built with ❤️ for youth sports*
