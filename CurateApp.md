# CURATE (Name TBD) — Product Brief (Mobile-First)

## Overview
Curate is a mobile-first web platform (PWA) where photographers upload their work, arrange it on a virtual gallery wall, and publish it as a shareable, immersive exhibition. Visitors can browse published walls, enter a full-screen gallery view, and follow photographers. The experience is designed for touch first, with desktop as a secondary power-user mode.

## Core Value Proposition
Photographers shoot on their phones, edit on their phones, and post to Instagram from their phones — but they have no mobile-native way to curate a body of work spatially. Curate is built for the device already in their pocket.

## Two User Modes

### 1. CREATOR (Mobile-First, Desktop-Enhanced)
- Upload photos directly from camera roll (tap to select multiple)
- Arrange photos on a virtual wall canvas optimized for touch:
  - Tap to select, drag to move (one finger)
  - Pinch to resize frames
  - Long-press to enter "arrange mode" with snap guides visible
  - Shake to reset layout (or tap reset button)
  - Haptic feedback on snap (if supported)
- Customize the wall via bottom sheet panels:
  - Wall color: swipeable color chips
  - Frame style: swipeable presets with preview
  - Spacing: horizontal slider with live preview
- Add metadata via native-feeling forms
- Publish: one tap, instant shareable link copied to clipboard
- Dashboard: vertical scroll list of your walls, tap to edit

### 2. VISITOR (Mobile-Native Experience)
- Discovery feed: vertical scroll (like Instagram Explore), 2-column masonry grid
- Tap any wall to enter immersive gallery view
- Immersive gallery view:
  - Full-screen wall display, portrait-optimized
  - Tap any photo to expand to edge-to-edge
  - Swipe left/right to navigate between photos
  - Swipe down to dismiss / return to wall view
  - Pinch to zoom into photo details
  - Double-tap to like (heart animation)
- Photographer profile: vertical scroll, header with avatar + bio, grid of walls below

## Key User Flows

FLOW A — Create a Wall (Mobile)
1. Open app → tap "+" or "Create Wall"
2. Tap "Add Photos" → native photo picker opens → select up to 12
3. Canvas opens with photos auto-arranged in a grid
4. Tap a photo → drag to reposition (snap guides appear as you drag near edges/center)
5. Pinch photo to resize frame
6. Tap "Style" bottom sheet → swipe colors, frames, spacing
7. Tap "Details" → type title, description, name
8. Tap "Preview" → see visitor view
9. Tap "Publish" → link copied to clipboard → share anywhere

FLOW B — Visit a Wall (Mobile)
1. Open app → scroll discovery feed
2. Tap a wall thumbnail
3. Gallery view opens (portrait, full-screen wall)
4. Tap a photo → expands edge-to-edge
5. Swipe left/right → next/previous photo
6. Swipe down → dismiss back to wall view
7. Tap photographer name → profile page
8. Tap "Follow" → count increments

FLOW C — Create a Wall (Desktop)
Same as mobile but with mouse precision:
- Click + drag for positioning
- Scroll wheel or corner handles for resizing
- Keyboard shortcuts: arrow keys nudge selected photo 1px, Delete removes
- Side panel (instead of bottom sheet) for styling controls

## Design Principles
- Touch first, mouse second: every interaction must feel native on a phone
- Thumb-zone optimized: primary actions in bottom 25% of screen
- Bottom sheets over modals: native mobile pattern for controls
- Portrait-optimized: the wall canvas is a vertical rectangle (phone screen ratio)
- Haptic and visual feedback: snaps vibrate, selections highlight
- Dark mode gallery view: immersive viewing with minimal chrome
- One-handed use: upload, arrange, and publish should work with one thumb

## Responsive Breakpoints

| Breakpoint | Target | Key Differences |
|---|---|---|
| < 480px | Phone portrait | Bottom sheets, full-screen canvas, thumb-zone CTAs |
| 480–768px | Phone landscape / small tablet | Side-by-side canvas + controls, 2-column discovery |
| 768–1024px | Tablet | Larger canvas, persistent side panel for styling |
| > 1024px | Desktop | Freeform canvas with mouse precision, hover states, keyboard shortcuts |

## Technical Stack (MVP)
- Frontend: React with Tailwind CSS
- Touch/gestures: Hammer.js or native touch events (drag, pinch, swipe, double-tap)
- Canvas/Layout: Absolute-positioned divs with transform (better mobile performance than HTML5 Canvas)
- Image storage: Firebase Storage or Supabase Storage
- Database: Firebase Firestore or Supabase
- Auth: Firebase Auth (email + Google OAuth + Apple Sign-In for iOS users)
- Hosting: Vercel or Netlify
- PWA: manifest.json, service worker, install prompt, offline support for viewed walls
- Share: Web Share API for native "Share" sheet on mobile

## Data Model (MVP)

WALL
- id (string)
- title (string)
- description (string)
- photographer_id (string)
- photographer_name (string)
- photographer_bio (string)
- photographer_avatar (string)
- wall_color (string)
- frame_style (string)
- frame_spacing (number)
- is_public (boolean)
- created_at (timestamp)
- view_count (number)
- like_count (number)
- photos: array of {
    id, url, x, y, width, height, caption, aspect_ratio
  }

USER
- id
- name
- email
- bio
- avatar_url
- walls_count (number)
- followers_count (number)

## Mobile-Specific Interactions & Gestures

CREATOR CANVAS:
- Tap photo: select (border highlight + subtle scale up)
- Drag selected photo: reposition, release to drop
- Pinch selected photo: resize from center
- Long-press unselected photo: quick menu (delete, bring to front, reset size)
- Tap empty canvas: deselect all
- Two-finger tap: undo last move
- Bottom sheet swipe up: expand styling panel
- Bottom sheet swipe down: collapse

VISITOR GALLERY:
- Tap photo: expand to full-screen
- Swipe left/right: navigate photos
- Swipe down: dismiss expanded photo
- Pinch: zoom into photo
- Double-tap: like (heart burst animation)
- Long-press photo: save to device / share

DISCOVERY FEED:
- Vertical scroll: infinite scroll with lazy loading
- Pull-to-refresh: reload feed
- Tap wall: enter with shared element transition (wall thumbnail expands to gallery view)

## MVP Scope (Week 1–2)

MUST HAVE:
- [ ] Mobile-optimized landing page with discovery feed
- [ ] Photo upload from camera roll / file picker
- [ ] Touch-optimized canvas (tap, drag, pinch to resize)
- [ ] Bottom sheet styling controls (color, frame, spacing)
- [ ] Publish wall + copy shareable link to clipboard
- [ ] Immersive visitor gallery with swipe navigation
- [ ] Photographer profile page
- [ ] PWA installability
- [ ] Responsive across phone, tablet, desktop

NICE TO HAVE (Week 3+):
- [ ] Haptic feedback on snap
- [ ] Web Share API integration
- [ ] Offline viewing of previously opened walls
- [ ] Follow photographer (with auth)
- [ ] Like/save walls
- [ ] Comments
- [ ] Export wall as Instagram carousel
- [ ] Desktop keyboard shortcuts
- [ ] Dark mode toggle

## Component Build Order
1. MobileLayout (responsive shell with bottom nav)
2. PhotoUploader (tap to select from camera roll)
3. WallCanvas (touch drag + pinch, absolute positioning)
4. StyleSheet (bottom sheet with color/frame/spacing controls)
5. GalleryViewer (full-screen, swipe, pinch, double-tap)
6. DiscoveryFeed (masonry grid, infinite scroll)
7. PhotographerProfile
8. Auth flow (sign up / sign in)
9. ShareWall (copy link + Web Share API)

## Design References
- Touch canvas: Instagram Layout app, Canva mobile, Unfold
- Gallery viewing: Apple Photos, VSCO, Google Arts & Culture app
- Discovery feed: Instagram Explore, Are.na mobile
- Bottom sheets: iOS native sheets, Material Design 3
- Creator tools: Milanote mobile, Figma Mirror