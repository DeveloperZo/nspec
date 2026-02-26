# Implementation Plan — Virtual Snack Game

## Phase 1: Project Setup & Type Definitions

- [ ] Initialize Vite + React 18 + TypeScript project scaffold (S)
- [ ] Configure Vite for asset bundling (images, audio files) (S)
- [ ] Set up Tailwind CSS or CSS Modules for styling (S)
- [ ] Create `src/types/index.ts` with Cookie, Beverage, GameState, GameProgress interfaces (M)
- [ ] Define type guards for cookie/beverage validation (S)
- [ ] Set up ESLint + TypeScript strict mode; verify no `any` types (S)

**Phase 1 Subtotal: 6 tasks**

---

## Phase 2: State Management & Storage Layer

- [ ] Create `GameContext` with `useReducer` and action type definitions (M)
  - Actions: `CONSUME_COOKIE`, `SELECT_BEVERAGE`, `ADD_SCORE`, `UNLOCK_COOKIE`, `RESET_GAME`, `TOGGLE_SOUND`
- [ ] Implement `StorageService` with localStorage read/write for `snack-game:progress` and `snack-game:settings` (M)
- [ ] Implement state hydration on app init (read from localStorage, fallback to defaults) (M)
- [ ] Create `useGameState()` hook that wraps context consumption (S)
- [ ] Add persistence middleware: auto-save to localStorage after state mutations (M)
- [ ] Write unit tests for GameContext reducer (M)
- [ ] Write unit tests for StorageService (M)

**Phase 2 Subtotal: 7 tasks**

---

## Phase 3: Core Game Logic & Services

- [ ] Create `GameLogic` module with `calculatePairingScore()` function (FR: Scoring & Pairing Logic) (M)
- [ ] Implement unlock mechanics: determine unlocked cookies based on score thresholds (M)
- [ ] Create `AudioService` with preload, play, and mute methods for sound effects (M)
  - Bundle audio files for: cookie consumption, pairing bonus, unlock event
- [ ] Create cookie & beverage catalog (constants): define 4 cookie types × 4 beverages with points/bonuses (S)
- [ ] Implement score calculation tests covering base points + pairing bonuses (M)
- [ ] Add session tracking: track session start time, duration, and per-session score (S)

**Phase 3 Subtotal: 6 tasks**

---

## Phase 4: Component Implementation — Core UI

- [ ] Create `GameScreen` layout component (main container, orchestrates children) (M)
- [ ] Create `CookieDisplay` component with click/touch event handlers (M)
  - Ensure ≥ 44×44 px clickable area
  - Dispatch `CONSUME_COOKIE` action on click
- [ ] Create `BeverageSelector` component (radio/button group for 4 beverages) (M)
  - Dispatch `SELECT_BEVERAGE` action on selection
- [ ] Create `ScoreBoard` component (displays score, session info, reset button) (S)
- [ ] Create `PairingFeedback` component (transient visual feedback on pairing event) (M)
  - Show feedback text & animate out after 2 seconds
- [ ] Add responsive grid layout for GameScreen (mobile-first, Tailwind or CSS Modules) (S)

**Phase 4 Subtotal: 6 tasks**

---

## Phase 5: Secondary Components & Features

- [ ] Create `CookieGallery` component (menu showing unlocked/locked cookies) (M)
- [ ] Create `SettingsMenu` component with toggle audio & view history (M)
- [ ] Create `SessionHistory` subcomponent (display past sessions in SettingsMenu) (S)
- [ ] Implement cookie progression animations (fade-in/scale on unlock) (S)
- [ ] Add visual indicator (lock icon, dimmed state) for locked cookies in gallery (S)
- [ ] Create `InfoModal` or inline help text for game rules (young audience UX) (S)

**Phase 5 Subtotal: 6 tasks**

---

## Phase 6: Integration, Testing & Polish

- [ ] Integrate all components into full app flow; wire GameContext to all consumers (L)
  - GameScreen → CookieDisplay, BeverageSelector, ScoreBoard, PairingFeedback
  - SettingsMenu → toggle audio, reset, view history
  - CookieGallery → display unlocked/locked state
- [ ] End-to-end flow test: click cookie → select beverage → verify score update & persistence (M)
- [ ] Test localStorage persistence across page refreshes (M)
- [ ] Test mobile responsiveness: touch events, 44×44 px hit targets on iOS/Android browsers (M)
- [ ] Verify audio preload and playback on init; test mute/unmute flow (M)
- [ ] Performance audit: bundle size analysis, Vite load time < 3s on 4G simulation (M)
- [ ] Add loading state & asset preload feedback (spinner, progress) (S)
- [ ] Audit TypeScript: ensure strict mode, no `any` types, all exports typed (S)

**Phase 6 Subtotal: 8 tasks**

---

## Phase 7: Assets & Final Assembly

- [ ] Create/optimize cookie SVG or PNG assets (4 cookie types) & add to `public/` (M)
- [ ] Create/optimize beverage SVG or PNG assets (4 beverage types) & add to `public/` (M)
- [ ] Create audio files or source from royalty-free library: consumption, pairing bonus, unlock sounds (M)
- [ ] Vite asset bundling test: verify all images/audio are inlined or cache-busted correctly (S)
- [ ] Create favicon and app metadata (title, description, OG tags) (S)
- [ ] Test on real mobile devices (iOS Safari, Chrome Android) — click/touch, layout, persistence (M)
- [ ] Final smoke test: fresh browser session, play through unlock milestone, verify all features (S)

**Phase 7 Subtotal: 7 tasks**

---

## Summary

**Total Tasks: 46**  
**Estimated Effort:**
- S (< 2h): 13 tasks
- M (2–4h): 26 tasks
- L (4–8h): 1 task
- XL (> 8h): 0 tasks

**Total Man-Hours (mid-point):** ~75 hours (18–20 dev days at 8h/day)

**Key Dependencies:**
1. Phases 1–2 must complete before Phases 3–4 (foundation)
2. Phase 3 (game logic) runs parallel to Phase 4 (UI)
3. Phase 5 depends on Phase 4; Phase 6 integrates all prior work
4. Phase 7 (assets) can run in parallel with Phase 6 after initial asset specs are finalized

**Coverage:**
- FR: Scoring & Pairing Logic (Phase 3, Task 1)
- FR: Offline Capability (Phase 2, Task 3 + Phase 7, Task 4)
- FR: Mobile Responsiveness (Phase 4, Task 3 + Phase 6, Task 4)
- FR: Persistence (Phase 2, Task 2 + Phase 6, Task 3)
- FR: Type Safety (Phase 1, Tasks 3–5 + Phase 6, Task 8)