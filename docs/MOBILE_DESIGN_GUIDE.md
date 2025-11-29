# Mobile-First Design Guide for DNA App

This document explains the mobile-first, professional design patterns implemented in the DNA App.

## Overview

The DNA App is optimized for mobile devices with professional UI patterns, smooth animations, and touch-friendly interactions. All components follow mobile-first design principles with progressive enhancement for larger screens.

---

## Core Mobile Features

### 1. **Responsive Dashboard Layout**

The dashboard includes:
- **Desktop**: Collapsible sidebar with full navigation
- **Mobile**: Slide-out sidebar + Bottom navigation bar for quick access
- **Touch-optimized**: 44px minimum touch targets throughout

**Location**: `src/components/DashboardLayoutClient.tsx`

Key features:
- Body scroll lock when mobile menu is open
- Smooth slide animations
- Backdrop blur overlay
- Auto-close menu on route change

### 2. **Mobile Bottom Navigation**

A persistent bottom navigation bar on mobile devices provides quick access to key features.

**Location**: `src/components/MobileBottomNav.tsx`

Features:
- Always visible on mobile (hidden on desktop)
- Shows 5 most important navigation items
- Active state indicators
- Safe area insets for notched devices
- Role-based filtering

### 3. **Page Layout Components**

Reusable components for consistent mobile-friendly pages:

**Location**: `src/components/ui/page-layout.tsx`

Components:
- `<PageContainer>` - Responsive container with mobile padding
- `<PageHeader>` - Mobile-optimized page headers with back button support
- `<PageCard>` - Professional card component
- `<PageGrid>` - Responsive grid layouts
- `<PageSection>` - Section dividers with titles

**Example Usage**:
```tsx
import { PageContainer, PageHeader, PageCard } from '@/components/ui/page-layout';

export default function MyPage() {
  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="Page Title"
        description="Page description"
        backButton={<BackButton />}
        action={<AddButton />}
      />
      
      <PageCard>
        {/* Your content */}
      </PageCard>
    </PageContainer>
  );
}
```

---

## Mobile-First CSS Utilities

### Touch-Friendly Classes

**Location**: `src/app/globals.css`

#### Touch Targets
```css
.touch-target        /* Minimum 44x44px for accessibility */
touch-manipulation   /* Optimizes touch response */
```

#### Active States
```css
.active-scale        /* Scale down on press (active:scale-95) */
.active-opacity      /* Fade on press */
.active-brightness   /* Darken on press */
```

#### Safe Area Support (for notched devices)
```css
.safe-top            /* Padding for top notch */
.safe-bottom         /* Padding for home indicator */
.safe-area           /* All safe area insets */
```

#### Mobile Containers
```css
.mobile-container    /* Responsive padding (px-4 sm:px-6 lg:px-8) */
.mobile-section      /* Responsive vertical spacing */
.mobile-gap          /* Responsive gap utility */
```

#### Professional Cards
```css
.card-mobile         /* Basic mobile card */
.card-elevated       /* Card with shadow */
.card-interactive    /* Card with press effect */
```

#### Mobile Typography
```css
.text-mobile-sm      /* text-sm sm:text-base */
.text-mobile-base    /* text-base sm:text-lg */
.text-mobile-lg      /* text-lg sm:text-xl lg:text-2xl */
.text-mobile-xl      /* text-xl sm:text-2xl lg:text-3xl */
.text-mobile-2xl     /* text-2xl sm:text-3xl lg:text-4xl */
```

#### Responsive Grids
```css
.grid-mobile-1       /* 1 col → 2 col → 3 col */
.grid-mobile-2       /* 2 col → 3 col → 4 col */
.grid-mobile-auto    /* Auto-fill grid with min 280px */
```

#### Mobile Buttons (Apply directly with Tailwind)
```tsx
// Primary button
className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg font-medium text-sm sm:text-base bg-[#FF5F02] text-white hover:bg-[#FF5F02]/90 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5F02] focus-visible:ring-offset-2 min-h-11 touch-manipulation"

// Secondary button
className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg font-medium text-sm sm:text-base bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 min-h-11 touch-manipulation"

// Outline button
className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg font-medium text-sm sm:text-base border-2 border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5F02] focus-visible:ring-offset-2 min-h-11 touch-manipulation"
```

#### Mobile Inputs (Apply directly with Tailwind)
```tsx
className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#FF5F02] focus:border-transparent transition-all duration-200 min-h-11 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
```

---

## Animations

### Available Animations

All animations are optimized for 60fps performance:

```css
.animate-slide-in-bottom  /* Slide up from bottom */
.animate-slide-in-left    /* Slide in from left */
.animate-slide-in-right   /* Slide in from right */
.animate-scale-in         /* Scale in effect */
.animate-bounce-slow      /* Gentle bounce */
.animate-wiggle          /* Playful wiggle */
.animate-float           /* Floating effect */
```

### Transition Utilities
```css
.transition-base     /* 0.2s ease-in-out */
.transition-smooth   /* 0.3s cubic-bezier */
.transition-bounce   /* 0.4s bounce easing */
```

---

## Design Patterns

### 1. Mobile Header Pattern

```tsx
<header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl">
  <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 gap-2">
    {/* Mobile menu button */}
    <Button className="lg:hidden min-w-10 active-scale">
      <Menu />
    </Button>
    
    {/* Logo */}
    <div className="flex items-center gap-2">
      <img className="h-7 sm:h-8 shrink-0" />
      <h1 className="text-base md:text-lg truncate">Title</h1>
    </div>
    
    {/* Actions */}
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      <Button className="min-w-9 sm:min-w-10 active-scale" />
    </div>
  </div>
</header>
```

### 2. Mobile Sidebar Pattern

```tsx
{/* Mobile overlay */}
{isOpen && (
  <div 
    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in"
    onClick={onClose}
  />
)}

{/* Sidebar */}
<aside className={cn(
  "lg:hidden fixed top-0 bottom-0 z-50 bg-white transition-all duration-300",
  "w-[85vw] max-w-[320px]",
  isOpen ? "translate-x-0" : "-translate-x-full",
  "left-0" // Use right-0 for RTL
)}>
  {/* Content */}
</aside>
```

### 3. Mobile Card Grid

```tsx
<PageGrid columns={3}>
  {items.map(item => (
    <PageCard key={item.id} className="card-interactive">
      {/* Card content */}
    </PageCard>
  ))}
</PageGrid>
```

### 4. Mobile Form

```tsx
<form className="space-y-4 sm:space-y-6">
  <div>
    <label className="text-sm font-medium">Label</label>
    <input className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#FF5F02] transition-all min-h-11 touch-manipulation" />
  </div>
  
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <Button className="px-4 py-2.5 rounded-lg font-medium bg-[#FF5F02] text-white hover:bg-[#FF5F02]/90 active:scale-95 transition-all min-h-11 flex-1">Submit</Button>
    <Button className="px-4 py-2.5 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-95 transition-all min-h-11 flex-1">Cancel</Button>
  </div>
</form>
```

---

## Responsive Breakpoints

Following Tailwind CSS defaults:

- `xs`: 475px (custom, use with `@screen xs`)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile-first approach**: Base styles are for mobile, use breakpoint prefixes for larger screens.

```tsx
className="text-sm sm:text-base lg:text-lg"
```

---

## Best Practices

### ✅ DO:

1. **Use minimum 44x44px touch targets** for buttons and interactive elements
2. **Add active states** with `active-scale` or `active:scale-95`
3. **Use responsive spacing** with `mobile-container`, `mobile-section`
4. **Optimize for touch** with `touch-manipulation` class
5. **Support safe areas** on notched devices with `safe-bottom`
6. **Use PageContainer** for consistent page layouts
7. **Add loading states** with skeleton classes
8. **Test on actual mobile devices** (not just browser DevTools)

### ❌ DON'T:

1. **Don't use hover-only interactions** - they don't work on touch
2. **Don't create small touch targets** - minimum 36px, ideally 44px
3. **Don't forget RTL support** - test with Arabic locale
4. **Don't use fixed pixels** for spacing - use responsive utilities
5. **Don't block scroll** unless intentional (like modals)
6. **Don't use text smaller than 14px** on mobile (accessibility)
7. **Don't ignore safe areas** on mobile devices

---

## Testing Checklist

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test in landscape orientation
- [ ] Test with large text (accessibility settings)
- [ ] Test on notched devices (safe areas)
- [ ] Test touch interactions (tap, swipe, pinch)
- [ ] Test offline mode (PWA)
- [ ] Test with slow 3G connection
- [ ] Test RTL layout (Arabic locale)
- [ ] Test keyboard navigation

---

## Performance Tips

1. **Use CSS transforms** for animations (GPU accelerated)
2. **Lazy load images** with `loading="lazy"`
3. **Minimize JavaScript** for interactions
4. **Use `will-change` sparingly** (only during animation)
5. **Optimize images** for mobile (WebP, responsive images)
6. **Reduce motion** for users with motion sensitivity

---

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- Focus indicators are visible (`focus-ring` utility)
- Color contrast meets WCAG AA standards
- Screen reader support with proper ARIA labels
- Keyboard navigation supported
- Respects `prefers-reduced-motion`

---

## Examples in Codebase

See these files for implementation examples:

- `src/components/DashboardLayoutClient.tsx` - Mobile layout
- `src/components/DashboardSidebar.tsx` - Mobile sidebar
- `src/components/DashboardHeader.tsx` - Mobile header
- `src/components/MobileBottomNav.tsx` - Bottom navigation
- `src/components/NewSessionClient.tsx` - Mobile page example
- `src/components/ui/page-layout.tsx` - Layout components

---

## Support

For questions or improvements, refer to the project's Copilot Instructions at `.github/copilot-instructions.md`.

**Remember**: Mobile-first means designing for mobile devices first, then enhancing for larger screens. This ensures the best experience for the majority of users.
