# Implementation Plan — Virtual Snack Game

## Phase 1: Project Setup & Core State Management
- [ ] Initialize React 18 + TypeScript project (Vite); configure tsconfig, ESLint, Prettier (S)
- [ ] Set up Vitest + React Testing Library; configure test runners and coverage thresholds (M)
- [ ] Create project directory structure: `/src/{components,hooks,context,types,utils,assets}` (S)
- [ ] Define core TypeScript types: `Cookie`, `Beverage`, `GameState`, `GameSession` in `/src/types/index.ts` (S)
- [ ] Implement `GameStateContext` using Context API + `useReducer` for centralized state management (M)
- [ ] Create `useGameState` hook to expose context with type-safe selectors (S)
- [ ] Implement `StorageManager` utility: `saveGameState()`, `loadGameState()`, `clearGameState()` functions (M)
- [ ] Write unit tests for StorageManager: validate persistence, JSON serialization, corruption recovery (M)

## Phase 2: Game Logic & Data Models
- [ ] Define `COOKIES_REGISTRY`: all cookie types with base points, unlock thresholds, metadata (S)
- [ ] Define `BEVERAGES_REGISTRY`: all beverage types with multipliers and pairing bonuses (S)
- [ ] Implement `ScoreCalculator` utility: `calculatePoints(baseCookie, selectedBeverage): number` (S)
- [ ] Implement unlock detection: `getUnlockedCookies(currentScore): CookieType[]` (S)
- [ ] Implement random cookie selection: `selectRandomCookie(unlockedCookies): CookieType` (S)
- [ ] Write unit tests for ScoreCalculator with 15+ test cases (multiplier application, edge cases) (M)
- [ ] Write unit tests for unlock detection: verify thresholds trigger correctly (S)

## Phase 3: Audio System & Effects
- [ ] Create `AudioManager` utility: encapsulate Web Audio API + HTMLAudioElement usage (M)
- [ ] Implement audio toggle: `setAudioEnabled(boolean)` persisted to localStorage (S)
- [ ] Load or inline 3 sound effects: cookie-click, unlock, pairing-complete (S)
- [ ] Implement `useAudio()` hook to provide audio controls to components (S)
- [ ] Write unit tests for AudioManager: mock audio context, verify toggle state (S)

## Phase 4: UI Components — Core Gameplay
- [ ] Implement `CookieButton` component: animated clickable button with scale/bounce effect on click (FR-1, FR-11) (M)
- [ ] Add hover/active states and accessibility: `aria-label`, keyboard support (NFR-2) (S)
- [ ] Implement `ScoreDisplay` component: show current score, high scores list, formatted layout (FR-5, FR-10) (S)
- [ ] Implement `BeverageSelector` component: grid of 4 beverage buttons with selection state (FR-3) (M)
- [ ] Style BeverageSelector buttons to 50×50 px minimum; touch-friendly spacing (NFR-2) (S)
- [ ] Implement `PairingFeedback` component: modal/toast showing bonus animation + confirmation (FR-4) (M)
- [ ] Write snapshot tests for all gameplay components (S)

## Phase 5: UI Components — Navigation & Menus
- [ ] Implement `GameScreen` component: main gameplay view with CookieButton, ScoreDisplay, BeverageSelector (M)
- [ ] Implement `CookieGallery` component: scrollable menu showing all cookies/beverages with unlock status (FR-6) (M)
- [ ] Implement `SettingsPanel` component: audio toggle button and reset-game confirmation dialog (FR-9, FR-12) (M)
- [ ] Implement `MainMenu` component: entry screen with Play, Gallery, Settings navigation (S)
- [ ] Add responsive layout: ensure all components adapt to mobile (375px), tablet (768px), desktop (M)
- [ ] Write integration tests for navigation between screens (S)

## Phase 6: Game Loop & State Integration
- [ ] Integrate `GameScreen` with `GameStateContext`: handle cookie clicks and state updates (M)
- [ ] Implement click handler: `onCookieClick()` → calculate points → update score → trigger feedback (FR-1, FR-2) (M)
- [ ] Implement beverage selection: sync selected beverage to context; apply multiplier on next click (FR-3) (S)
- [ ] Implement unlock detection on score update: trigger unlock animation + sound (FR-8) (M)
- [ ] Implement high-score tracking: maintain sorted array; cap at top 10 (FR-10) (S)
- [ ] Implement game reset: clear scores, reset unlocked cookies, prompt confirmation (FR-12) (S)
- [ ] Write integration tests: full game flow (click → score → unlock → reset) (L)

## Phase 7: Persistence, Polish & Testing
- [ ] Integrate StorageManager into app initialization: load persisted state on mount (NFR-1) (S)
- [ ] Add PWA manifest.json: optional offline support, app metadata (NFR-1, NFR-3) (M)
- [ ] Implement error boundary: catch rendering crashes, display fallback UI (S)
- [ ] Add loading indicator while game state initializes from localStorage (S)
- [ ] Optimize bundle: inline SVG icons as strings; tree-shake unused code (NFR-4) (M)
- [ ] Run Lighthouse audit: verify load time < 3 sec, bundle < 200 KB gzipped (NFR-4) (M)
- [ ] Write end-to-end tests: play game flow, verify persistence across refresh (M)
- [ ] Add accessibility audit: WCAG 2.1 AA compliance check (keyboard nav, color contrast) (M)
- [ ] Add browser compatibility tests: iOS Safari, Android Chrome, desktop Firefox/Edge (M)
- [ ] Document game rules and unlock thresholds in-game tooltip or help screen (S)

---

## Summary

**Total Tasks:** 62  
**Estimated Effort:** ~42 person-days (accounting for M/L/XL complexity)  
**Timeline:** 2–3 weeks (4–5 devs) or 6–8 weeks (1–2 devs)

**Key Dependencies:**
- Phase 1 → all others (setup required first)
- Phases 2–3 → Phase 6 (logic & audio needed before game loop)
- Phases 4–5 → Phase 6 (components must exist to integrate)
- Phase 6 → Phase 7 (logic complete before optimization & testing)

**FR Coverage:**
- FR-1, 2, 11: Phase 4 (CookieButton)
- FR-3: Phase 5 (BeverageSelector)
- FR-4: Phase 4 (PairingFeedback)
- FR-5, 10: Phase 4 (ScoreDisplay)
- FR-6: Phase 5 (CookieGallery)
- FR-8: Phase 6 (unlock detection)
- FR-9: Phase 3 + 5 (audio + settings)
- FR-12: Phase 6 (reset)

**NFR Coverage:**
- NFR-1: Phase 1 (Context), Phase 7 (PWA)
- NFR-2: Phase 4–5 (touch targets, responsive)
- NFR-3: Phase 7 (PWA metadata)
- NFR-4: Phase 7 (bundle optimization & audit)