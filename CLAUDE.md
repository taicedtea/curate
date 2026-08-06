# CLAUDE.md — Curate (Name TBD)

This file orients any Claude instance working on this codebase. Read it before making structural or design decisions. Keep it updated to reflect the *actual current state* of the project, not the aspirational plan — the source brief (`CurateApp.md`) is the vision doc; this file is the working reality.

## What this app is

A mobile-first PWA where photographers arrange photos on a virtual gallery wall and publish it as an immersive, shareable exhibition. Two modes: **Creator** (builds walls) and **Visitor** (browses/views walls). Full spec lives in `CurateApp.md` — treat that as the product source of truth, this file as the build source of truth.

## Ground rules

- **Ask before creating new files or new dependencies.** Especially before adding a canvas/animation library, auth provider, or backend service not already listed below.
- **Touch-first, always.** Every interaction is designed for a thumb on a phone screen first. Mouse/keyboard behavior (Flow C) is an *enhancement layer* on top of the touch implementation, never a separate parallel build.
- **Don't build ahead of current scope.** MVP scope is Week 1–2 items only (see brief). Nice-to-haves are explicitly deferred — don't scaffold for them prematurely (e.g. don't wire up auth just because "Follow" will need it later).
- **This doc reflects reality.** When a component, decision, or constraint changes, update this file in the same session — don't let it drift into a stale prescriptive template.

## Design → Code coordination

This section is the bridge between design decisions and their functional implementation. Update it as design choices firm up.

| Design element | Implementation implication |
|---|---|
| Wall canvas (portrait rectangle, freeform layout) | Absolute-positioned `<div>`s with CSS `transform`, not `<canvas>`/WebGL — better mobile perf, easier hit-testing for touch |
| Bottom sheets (style panel, not modals) | Build one reusable `<BottomSheet>` primitive; every panel (color, frame, spacing) is a variant of it, not a bespoke component |
| Snap guides on drag | Snap logic lives with the drag handler, not the visual guide — guide is a derived/rendered state, not the source of truth |
| Thumb-zone CTAs (bottom 25% of screen) | Primary actions (Publish, Add Photos) are fixed-position, not scrolled-away in a header |
| Desktop breakpoint (>1024px) | Same components, added affordances (hover states, keyboard listeners, corner-handle resize) — not a separate desktop component tree |

When you (Tai) hand off a Figma frame or interaction spec, describe it here or in the PR/commit so the mapping from design intent → code pattern stays legible to future sessions.

## Tech stack (current)

- **Frontend:** React + Tailwind CSS
- **Gestures:** native touch events preferred; Hammer.js only if native handling proves insufficient for pinch/multi-touch
- **Canvas/layout:** absolute-positioned divs + CSS transforms
- **Storage:** Firebase Storage *or* Supabase Storage — **decide and lock in before building the uploader**, don't build against both
- **DB:** Firebase Firestore *or* Supabase — must match storage choice
- **Auth:** deferred (not MVP) — Firebase Auth planned (email + Google + Apple)
- **Hosting:** Vercel or Netlify
- **PWA:** manifest.json + service worker, install prompt, offline viewing of previously opened walls

> ⚠️ The brief lists Firebase/Supabase as "or" — this is an open decision. Flag it to Tai rather than picking silently.

## Data model

Match `WALL` and `USER` shapes exactly as defined in `CurateApp.md` § Data Model. If a field needs to change (e.g. adding `rotation` to a photo object for tilt effects), update both this file and the brief together.

## Component build order (do not reorder without discussion)

1. `MobileLayout` — responsive shell + bottom nav
2. `PhotoUploader` — tap-to-select from camera roll
3. `WallCanvas` — touch drag + pinch, absolute positioning
4. `StyleSheet` — bottom sheet: color/frame/spacing
5. `GalleryViewer` — full-screen, swipe, pinch, double-tap
6. `DiscoveryFeed` — masonry grid, infinite scroll
7. `PhotographerProfile`
8. Auth flow
9. `ShareWall` — copy link + Web Share API

Each component should be functional and touch-tested on a real breakpoint (<480px) before moving to the next.

## Explaining code back to Tai

Tai is a product/architectural designer with a few years of web dev experience (HTML/CSS/JS/React, some Python/C++) — not a beginner, not a specialist. When explaining code in this project:

- Be concise. Skip fundamentals-level explanation of React/JS syntax.
- Focus on *why a pattern was chosen* and *how it maps to the design intent* (e.g. "this uses `transform: scale()` instead of resizing `width/height` because it's cheaper to animate on mobile — matches the pinch-resize gesture you spec'd").
- Flag trade-offs plainly (performance vs. fidelity, native feel vs. build complexity) rather than picking silently and explaining after the fact.

## Current status

_(Update this section as work progresses — this is the single most important part of the file to keep honest.)_

- [ ] Storage/DB provider decision (Firebase vs Supabase)
- [ ] `MobileLayout` scaffolded
- [ ] `PhotoUploader` built
- [ ] `WallCanvas` — touch drag
- [ ] `WallCanvas` — pinch resize
- [ ] `StyleSheet` bottom sheet
- [ ] `GalleryViewer`
- [ ] `DiscoveryFeed`
- [ ] `PhotographerProfile`
- [ ] PWA manifest + service worker
