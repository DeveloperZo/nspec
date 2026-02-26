# Technical Design Document — Virtual Snack Game

## Overview

Virtual Snack Game is a browser-based, offline-capable casual game built with React and TypeScript. Players click cookies to earn points, select beverages for bonus feedback, and track scores via local storage. The game requires no backend, prioritizes simplicity, and targets children ages 8–14 with touch-friendly interactions and immediate visual/audio feedback.

**Key Design Principle:** Client-side-only, minimal state, bundled assets, localStorage persistence.

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         React App (Client-Side)         │
├─────────────────────────────────────────┤
│  UI Layer (Components)                  │
│  ├─ GameScreen                          │
│  ├─ BeverageSelector                    │
│  ├─ ScoreDisplay                        │
│  ├─ Menu / Gallery                      │
│  └─ Settings (Audio Toggle)             │
├─────────────────────────────────────────┤
│  State Management (Context / Hooks)     │
│  ├─ GameState (score, currentCookie)    │
│  ├─ AudioState (enabled/disabled)       │
│  └─ StorageManager (persist/restore)    │
├─────────────────────────────────────────┤
│  Browser APIs                           │
│  ├─ localStorage (persist scores)       │
│  ├─ Web Audio API (sound effects)       │
│  └─ Touch/Mouse Events                  │
└─────────────────────────────────────────┘
```

### State Management Strategy

Use React Context + custom hooks to avoid prop drilling. Single source of truth for game state (score, unlocked cookies, high scores, audio setting).

```typescript
interface GameState {
  currentScore: number;
  highScores: number[];
  unlockedCookies: CookieType[];
  selectedBeverage: BeverageType | null;
  audioEnabled: boolean;
  lastSession: { score: number; timestamp: number } | null;
}
```

---

## Component Breakdown

### Core Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `App` | Root; initializes state, loads persisted data | — |
| `GameScreen` | Main gameplay area; renders clickable cookie | `onCookieClick`, `currentCookie` |
| `CookieButton` | Clickable cookie with animation feedback (FR-1, FR-11) | `cookie`, `onClick`, `disabled` |
| `BeverageSelector` | Shows available beverages; tracks selection (FR-3) | `onSelect`, `selected` |
| `PairingFeedback` | Displays animation/confirmation when cookie + beverage consumed (FR-4) | `pairing`, `onComplete` |
| `ScoreDisplay` | Shows current score and high scores (FR-5, FR-10) | `current`, `high` |
| `CookieGallery` | Menu showing all cookie/beverage types (FR-6) | — |
| `SettingsPanel` | Audio toggle and reset game option (FR-9, FR-12) | `onToggleAudio`, `onReset` |

### Interaction Flow

1. **Cookie Click** → Trigger animation + sound (if enabled)
2. **Check Beverage Selection** → If selected, apply bonus multiplier
3. **Update Score** → Add points to state; trigger pairing feedback
4. **Persist to localStorage** → Async after state update
5. **Unlock Check** → If score threshold met, unlock new cookie variety (FR-8)

---

## Data Models

### Core Types

```typescript
// Cookie types with point values
type CookieType = 'chocolate-chip' | 'sugar' | 'oatmeal' | 'gingerbread' | 'double-choc';

interface Cookie {
  id: CookieType;
  name: string;
  basePoints: number;
  icon: string; // SVG data or emoji
  unlockedAt?: number; // score threshold
}

// Beverages with bonus multipliers
type BeverageType = 'milk' | 'water' | 'juice' | 'rootbeer';

interface Beverage {
  id: BeverageType;
  name: string;
  multiplier: number; // e.g., 1.5x for milk with chocolate
  pairingBonus?: (cookie: CookieType) => number; // cookie-specific bonus
  icon: string;
}

// Persistent game session
interface GameSession {
  score: number;
  timestamp: number;
  unlockedCookies: CookieType[];
}

interface LeaderboardEntry {
  score: number;
  date: string;
}
```

### localStorage Schema

```json
{
  "vsg_currentScore": "145",
  "vsg_highScores": "[500, 320, 155, 145]",
  "vsg_unlockedCookies": "[\"chocolate-chip\", \"sugar\"]",
  "vsg_audioEnabled": "true"
}
```

**Rationale:** Flat, minimal keys with `vsg_` prefix to avoid collisions. Store arrays as JSON strings.

---

## Technology Choices

### Framework: React 18 + TypeScript

- **Why:** Declarative rendering, built-in hooks for state, wide ecosystem, suitable for casual games.
- **Justification:** Avoids over-engineered game engines (Phaser, Three.js) for this simple scope; React is sufficient for turn-based clicker mechanics.

### State Management: Context API + `useReducer`

- **Why:** Eliminates Redux boilerplate for a single-feature app; Context handles global game state.
- **Justification:** Simple, no external dependency, sufficient for offline game with minimal state mutations.

### Persistence: localStorage API

- **Why:** Native browser API, no external library required, meets NFR-1 (offline).
- **Justification:** Game data is ~1 KB; well within 5–10 MB localStorage limit.

### Audio: Web Audio API + HTML5 `<audio>`

- **Why:** Lightweight, no external dependency, supports toggle (FR-9).
- **Justification:** Simple sound effects (beeps, chimes) can be inlined or sourced from free libraries.

### Build Tool: Vite or Create React App (CRA)

- **Why:** Fast development, optimized production bundle, meets NFR-4 (3-second load target).
- **Justification:** Vite preferred for smaller bundle size; CRA acceptable if already familiar.

### Styling: CSS-in-JS (Emotion/Styled Components) or Tailwind CSS

- **Why:** Scope styles to components; simplifies responsive design for mobile (NFR-2).
- **Justification:** Avoid global CSS conflicts; Tailwind is lighter for a simple game UI.

### Testing: Vitest + React Testing Library

- **Why:** Unit test game logic (point calculation, unlock thresholds); component snapshot tests.
- **Justification:** Minimal; focus on state transitions and persistence logic.

---

## Key Implementation Notes

### Touch-Friendly Hit Targets (NFR-2)
- CookieButton minimum size: 60×60 px on mobile, ensures >= 44×44 px safe zone.
- BeverageSelector buttons: 50×50 px each, grid layout.

### Bundle Size Target
- Aim for < 150 KB gzipped (includes React, TypeScript runtime).
- Inline SVG icons as strings; avoid image files.
- Lazy-load CookieGallery if needed.

### Offline Capability (NFR-1)
- Bundle all assets (SVG icons, audio) at build time.
- No API calls; no external CDN dependencies.
- Use `manifest.json` (PWA optional) to ensure cacheable resources.

### Score Persistence Detail
- Save immediately after score update (no debounce needed; data is tiny).
- On app load, restore high scores and unlocked cookies; validate before trusting localStorage.

---

## Success Criteria

- ✓ All FR (1–12) and NFR (1–4) requirements met.
- ✓ Page load < 3 seconds; bundle < 200 KB gzipped.
- ✓ 100% TypeScript type coverage on game logic.
- ✓ Playable on iOS Safari, Android Chrome, desktop browsers.
- ✓ localStorage persists across page refreshes and browser restarts.