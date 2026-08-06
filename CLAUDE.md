# CLAUDE.md — Curate (Name TBD)

This file orients any Claude instance working on this codebase. Read it before making structural or design decisions. Keep it updated to reflect the *actual current state* of the project, not the aspirational plan — the source brief (`CurateApp.md`) is the vision doc; this file is the working reality.

## What this app is

A mobile-first PWA where photographers arrange photos on a virtual gallery wall and publish it as an immersive, shareable exhibition. Two modes: **Creator** (builds walls) and **Visitor** (browses/views walls). Full spec lives in `CurateApp.md` — treat that as the product source of truth, this file as the build source of truth.

## Case study notes

Tai's broader goal for this project is a product design case study for job hunting, not just a shipped app. A gitignored `notes/` folder at the project root (never committed — private, not app documentation) captures the reasoning behind decisions as they happen, since that's the material a case study actually needs and it's easy to lose once a feature ships.

- **Whenever a nontrivial product, design, or technical decision gets made during a session** — a scope call, a tradeoff, a "why this pattern over that one," a pivot after testing — add an entry to `notes/decisions-log.md` (context → decision → reasoning → tradeoffs/alternatives). Do this in the same session the decision happens, not retroactively.
- `notes/case-study-outline.md` holds the skeleton for the eventual case study and points to where each section's material comes from (including this log). No need to fill it in proactively — just keep it in mind if a session produces something that obviously belongs in a specific section.
- This is separate from this file's "Current status" section, which tracks build state for continuity, not reasoning for an audience — keep both current, they serve different purposes.

## Ground rules

- **Never co-sign git commits or pushes as Claude.** Do not add `Co-Authored-By: Claude` (or any Anthropic/Claude attribution) to commit messages, and do not include Claude in PR descriptions, comments, or any other GitHub-visible metadata. Tai doesn't want Claude to show up anywhere in the GitHub history/UI — the only trace of Claude's involvement should be this file and Tai's own references to it.
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

> **Cost note:** this is a portfolio project, not aiming for scale — free tiers should cover it entirely. Vercel/Netlify hosting is free at this traffic level (custom domain optional, ~$10-15/yr if wanted). Firebase and Supabase free tiers (whichever gets picked) are both sized well above portfolio-level usage. Only revisit pricing if traffic becomes real/sustained, which isn't the goal here.
- **Build tooling:** Vite + React Router (SPA), plain JS (no TypeScript)

> ⚠️ The brief lists Firebase/Supabase as "or" — this is an open decision. Flag it to Tai rather than picking silently.

> **Interim local persistence:** until the Firebase/Supabase call is made, the app runs entirely against the browser's IndexedDB (`src/data/db.js`) — photo blobs and wall/user JSON, no network calls. All UI components talk only to `src/data/wallStore.js`, never to IndexedDB directly, so swapping in a real backend later means reimplementing that one module's functions, not touching components. This means walls only exist on the device/browser that created them — fine for local iteration, not for sharing a link with someone else yet.

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

Full MVP flow (minus Auth) is scaffolded and builds cleanly (`npm run dev`, `npm run build`). Not yet interactively tested in a real browser by Claude (no browser tool available this session) — needs a hands-on pass by Tai on both a phone and desktop before trusting the gesture feel.

- [ ] Storage/DB provider decision (Firebase vs Supabase) — still open; app runs on local IndexedDB in the meantime (see Tech stack note above)
- [x] `MobileLayout` scaffolded — bottom nav (mobile) / left rail (desktop, `lg:` breakpoint)
- [x] `PhotoUploader` built — file input, up to 12 photos, writes to IndexedDB
- [x] `WallCanvas` — touch drag (Pointer Events, snap-to-center/edges/neighbors)
- [x] `WallCanvas` — pinch resize (two-pointer, scales from center via `transform`)
- [x] `StyleSheet` bottom sheet — wall color, frame style, spacing; becomes persistent side panel at `lg:`
- [x] `GalleryViewer` — full-wall view, expand/swipe-nav/swipe-dismiss/pinch-zoom/double-tap-like
- [x] `DiscoveryFeed` — 2-col masonry (CSS columns), infinite scroll via IntersectionObserver
- [x] `PhotographerProfile` — single local mock user (`src/data/currentUser.js`), doubles as "your walls" dashboard
- [x] `ShareWall` — Web Share API with Clipboard fallback
- [x] PWA manifest + service worker (`vite-plugin-pwa`, `generateSW` mode)

**Known simplifications from the brief** (scope calls made this pass, flagged for Tai to revisit):
- Responsive behavior is a single `lg:` (1024px) cutover (bottom sheet ↔ side panel), not the brief's 4-tier breakpoint table — simpler for a first pass, easy to add `md:`/`sm:` tuning later once tested on real devices.
- No pull-to-refresh gesture on the discovery feed — a custom pointer-based pull gesture risked breaking native scroll; feed re-fetches on navigation instead.
- No undo (two-finger tap) on the canvas — not in the MVP must-have list, skipped to avoid scope creep.
- Haptic feedback on snap skipped — explicitly a Week 3+ nice-to-have in the brief.
