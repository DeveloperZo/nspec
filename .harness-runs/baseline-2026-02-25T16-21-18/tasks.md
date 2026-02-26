# Implementation Plan — Virtual Snack Game

## Phase 1: Project Setup & Infrastructure

- [ ] Initialize Vite project with React + TypeScript template (S)
  - [ ] Create project directory structure
  - [ ] Install core dependencies (React, Redux Toolkit, React-Redux)
  - [ ] Configure TypeScript strict mode
  - [ ] Set up .gitignore and version control

- [ ] Configure build pipeline and tooling (M)
  - [ ] Set up Vite configuration (vite.config.ts)
  - [ ] Configure TypeScript (tsconfig.json)
  - [ ] Set up SASS/SCSS support
  - [ ] Configure CSS Modules
  - [ ] Optimize bundle size targets (<500 KB gzipped)

- [ ] Set up testing infrastructure (M)
  - [ ] Install Jest and React Testing Library
  - [ ] Configure Jest (jest.config.js)
  - [ ] Create test utilities and helpers
  - [ ] Set up test directory structure
  - [ ] Add GitHub Actions CI/CD workflow

- [ ] Create project documentation (S)
  - [ ] Write comprehensive README.md
  - [ ] Document setup instructions
  - [ ] Add development guidelines
  - [ ] Create CONTRIBUTING.md

- [ ] Set up package.json scripts (S)
  - [ ] dev: Vite dev server
  - [ ] build: Production build
  - [ ] test: Jest test suite
  - [ ] test:watch: Watch mode testing
  - [ ] type-check: TypeScript validation
  - [ ] lint: ESLint configuration

---

## Phase 2: Data Models & Type Definitions

- [ ] Define core TypeScript types (M)
  - [ ] Create `src/types/index.ts` with all interfaces
  - [ ] Define Cookie, Beverage, Pairing models
  - [ ] Define GameState and AppState interfaces
  - [ ] Define Settings interface
  - [ ] Create discriminated unions for state variants

- [ ] Create static content libraries (M)
  - [ ] Implement Cookie library in `src/data/cookies.ts`
    - [ ] Add 10+ unique cookie definitions
    - [ ] Include metadata (rarity, category, descriptions)
    - [ ] Create TypeScript validation helpers
  - [ ] Implement Beverage library in `src/data/beverages.ts`
    - [ ] Add 7+ unique beverage definitions
    - [ ] Include color codes for visual representation
  - [ ] Create pairing compatibility matrix in `src/data/pairingMatrix.ts`
    - [ ] Define all cookie–beverage combinations
    - [ ] Assign compatibility scores (good/okay/unusual)
    - [ ] Set points modifiers per pairing

- [ ] Create type validation utilities (S)
  - [ ] Implement runtime type guards
  - [ ] Create validation schemas (Zod or custom)
  - [ ] Test type safety with sample data

---

## Phase 3: Core Services & Game Logic

- [ ] Implement PairingSystem service (M)
  - [ ] Create `src/services/pairingSystem.ts`
  - [ ] Implement `evaluate(cookieId, beverageId)` method
  - [ ] Return compatibility level (good/okay/unusual)
  - [ ] Calculate points multiplier based on pairing
  - [ ] Unit test all pairing combinations

- [ ] Implement ProgressionEngine service (M)
  - [ ] Create `src/services/progressionEngine.ts`
  - [ ] Track unlock thresholds and milestones
  - [ ] Determine which items unlock at score levels
  - [ ] Handle discovery logic for new items
  - [ ] Unit test progression calculations

- [ ] Implement StorageManager service (M)
  - [ ] Create `src/services/storageManager.ts`
  - [ ] Implement `save(state)` method with localStorage
  - [ ] Implement `load()` method with error handling
  - [ ] Implement `reset()` method for factory reset
  - [ ] Handle QuotaExceededError gracefully
  - [ ] Create migration utilities for schema versioning
  - [ ] Unit test storage operations

- [ ] Implement AudioManager service (S)
  - [ ] Create `src/services/audioManager.ts`
  - [ ] Implement `playSound(soundId, volume)` method
  - [ ] Support muting based on settings
  - [ ] Create audio asset references
  - [ ] Unit test volume control

- [ ] Create utility functions (S)
  - [ ] `src/utils/localStorage.ts` — localStorage helpers
  - [ ] `src/utils/migration.ts` — Schema migration logic
  - [ ] `src/utils/validators.ts` — Data validation functions

---

## Phase 4: Redux State Management Setup

- [ ] Configure Redux store (M)
  - [ ] Create `src/app/store.ts` with Redux store configuration
  - [ ] Configure middleware pipeline
  - [ ] Set up Redux DevTools integration
  - [ ] Create store initialization with preloadedState
  - [ ] Implement error handling in store

- [ ] Create persistence middleware (M)
  - [ ] Create `src/middleware/persistenceMiddleware.ts`
  - [ ] Implement debounced saving (500ms)
  - [ ] Trigger on critical actions
  - [ ] Handle storage errors gracefully
  - [ ] Unit test middleware

- [ ] Create app hooks (S)
  - [ ] Create `src/app/hooks.ts`
  - [ ] Export `useAppDispatch()` typed hook
  - [ ] Export `useAppSelector()` typed hook
  - [ ] Test hook type inference

---

## Phase 5: Redux Slices & Reducers

- [ ] Create game slice (L)
  - [ ] Create `src/features/game/gameSlice.ts`
  - [ ] Define initial state with seed data
  - [ ] Implement actions:
    - [ ] `consumePairing(cookieId, beverageId)`
    - [ ] `selectBeverage(beverageId)`
    - [ ] `drawNextCookie()`
    - [ ] `incrementScore(points)`
    - [ ] `updateLevel(level)`
  - [ ] Create extraReducers for async thunks
  - [ ] Create unit tests for all reducers
  - [ ] Test state immutability

- [ ] Create collection slice (L)
  - [ ] Create `src/features/collection/collectionSlice.ts`
  - [ ] Define initial state with empty collection
  - [ ] Implement actions:
    - [ ] `discoverCookie(cookieId)`
    - [ ] `discoverBeverage(beverageId)`
    - [ ] `recordPairing(cookieId, beverageId, points)`
    - [ ] `markCookieConsumed(cookieId)`
    - [ ] `markBeverageConsumed(beverageId)`
  - [ ] Create unit tests
  - [ ] Test collection update logic

- [ ] Create settings slice (M)
  - [ ] Create `src/features/settings/settingsSlice.ts`
  - [ ] Define initial state
  - [ ] Implement actions:
    - [ ] `setVolume(volume: number)`
    - [ ] `setReducedMotion(enabled: boolean)`
    - [ ] `setScreenReaderMode(enabled: boolean)`
    - [ ] `setTextSize(size: 'normal' | 'large' | 'extra-large')`
  - [ ] Create unit tests
  - [ ] Validate setting ranges

- [ ] Create selectors for all slices (L)
  - [ ] Create `src/features/game/gameSelectors.ts`
    - [ ] `selectCurrentCookie()`
    - [ ] `selectSelectedBeverage()`
    - [ ] `selectScore()`
    - [ ] `selectLevel()`
    - [ ] `selectUnlockedCookies()`
    - [ ] `selectUnlockedBeverages()`
    - [ ] Memoize all selectors with createSelector
  - [ ] Create `src/features/collection/collectionSelectors.ts`
    - [ ] `selectAllCookies()`
    - [ ] `selectAllBeverages()`
    - [ ] `selectPairingHistory()`
    - [ ] `selectCompletionPercentage()`
    - [ ] `selectDiscoveredCookies()`
  - [ ] Test selector memoization

---

## Phase 6: Custom Hooks

- [ ] Create useLocalStorage hook (M)
  - [ ] Create `src/hooks/useLocalStorage.ts`
  - [ ] Implement storage getter/setter
  - [ ] Handle errors gracefully
  - [ ] Sync across browser tabs
  - [ ] Unit test with jsdom

- [ ] Create usePairing hook (S)
  - [ ] Create `src/hooks/usePairing.ts`
  - [ ] Return pairing compatibility helper
  - [ ] Memoize compatibility calculations
  - [ ] Unit test

- [ ] Create usePersistence hook (M)
  - [ ] Create `src/hooks/usePersistence.ts`
  - [ ] Trigger auto-save on state changes
  - [ ] Handle save failures
  - [ ] Provide manual save trigger
  - [ ] Unit test

- [ ] Create useGameEngine hook (M)
  - [ ] Create `src/hooks/useGameEngine.ts`
  - [ ] Orchestrate game flow
  - [ ] Handle turn progression
  - [ ] Manage game state transitions
  - [ ] Unit test game loop

---

## Phase 7: UI Components — Main Structure

- [ ] Create App component (M)
  - [ ] Create `src/components/App/App.tsx`
  - [ ] Implement Redux Provider wrapper
  - [ ] Set up error boundary
  - [ ] Implement screen routing logic
  - [ ] Handle initial hydration from storage
  - [ ] Add accessibility landmarks

- [ ] Create ErrorBoundary component (M)
  - [ ] Create `src/components/ErrorBoundary/ErrorBoundary.tsx`
  - [ ] Catch React rendering errors
  - [ ] Display user-friendly error UI
  - [ ] Log errors to console (dev only)
  - [ ] Provide reset button
  - [ ] Unit test with error scenarios

- [ ] Create MainMenu component (M)
  - [ ] Create `src/components/MainMenu/MainMenu.tsx`
  - [ ] Display welcome message
  - [ ] Implement "Start Game" button
  - [ ] Implement "View Collection" button
  - [ ] Implement "Settings" button
  - [ ] Add keyboard navigation
  - [ ] Style with CSS Modules
  - [ ] Unit test navigation

- [ ] Create Styles foundation (M)
  - [ ] Create `src/styles/index.scss` — main stylesheet
  - [ ] Create `src/styles/variables.scss` — CSS variables & theme
  - [ ] Create `src/styles/accessibility.scss` — WCAG AA styles
  - [ ] Define color palette for cookies/beverages
  - [ ] Define responsive breakpoints
  - [ ] Set up motion-safe media queries
  - [ ] Test dark mode/light mode themes

---

## Phase 8: UI Components — Gameplay

- [ ] Create PlayArea component (L)
  - [ ] Create `src/components/PlayArea/PlayArea.tsx`
  - [ ] Display current score
  - [ ] Render active cookie display
  - [ ] Render beverage selector
  - [ ] Render "Eat Cookie" button
  - [ ] Wire Redux dispatch actions
  - [ ] Add ARIA labels and live regions
  - [ ] Keyboard navigation (Tab, Enter, Arrow keys)
  - [ ] Unit test interactions
  - [ ] CSS Module: `src/components/PlayArea/PlayArea.module.scss`

- [ ] Create CookieDisplay component (M)
  - [ ] Create `src/components/CookieDisplay/CookieDisplay.tsx`
  - [ ] Display cookie image
  - [ ] Display cookie name and description
  - [ ] Show rarity badge
  - [ ] Add alt text for images
  - [ ] Responsive sizing
  - [ ] Unit test with various cookies
  - [ ] CSS Module

- [ ] Create PairingSelector component (L)
  - [ ] Create `src/components/PairingSelector/PairingSelector.tsx`
  - [ ] Render beverage radio button group
  - [ ] Display compatibility hints (good/okay/unusual)
  - [ ] Color-code badges by compatibility
  - [ ] Show points multiplier on hover
  - [ ] Handle selection state
  - [ ] Keyboard accessible (Tab, Arrow, Space, Enter)
  - [ ] Unit test all beverages
  - [ ] CSS Module

- [ ] Create PairingFeedback component (M)
  - [ ] Create `src/components/PairingFeedback/PairingFeedback.tsx`
  - [ ] Display last pairing result
  - [ ] Show compatibility badge (good/okay/unusual)
  - [ ] Animate points earned
  - [ ] Trigger audio feedback
  - [ ] Auto-dismiss after 2 seconds
  - [ ] Announce to screen readers with aria-live
  - [ ] CSS Module with animations

---

## Phase 9: UI Components — Collection & Progress

- [ ] Create CollectionScreen component (L)
  - [ ] Create `src/components/CollectionScreen/CollectionScreen.tsx`
  - [ ] Display completion percentage
  - [ ] Render progress bar with aria-label
  - [ ] Display cookie grid (discovered & locked)
  - [ ] Display beverage grid (discovered & locked)
  - [ ] Implement tab switching or scroll layout
  - [ ] Show item counts
  - [ ] Unit test selectors integration
  - [ ] CSS Module

- [ ] Create CookieCard component (M)
  - [ ] Create `src/components/CookieCard/CookieCard.tsx`
  - [ ] Display cookie image or placeholder
  - [ ] Show name (hidden if locked)
  - [ ] Show rarity level
  - [ ] Show consumption count
  - [ ] Lock overlay for undiscovered items
  - [ ] Responsive grid item
  - [ ] CSS Module

- [ ] Create BeverageCard component (M)
  - [ ] Create `src/components/BeverageCard/BeverageCard.tsx`
  - [ ] Display beverage image or placeholder
  - [ ] Show name (hidden if locked)
  - [ ] Show consumption count
  - [ ] Lock overlay for undiscovered items
  - [ ] Color-coded background from beverage data
  - [ ] CSS Module

- [ ] Create CompletionMeter component (S)
  - [ ] Create `src/components/CompletionMeter/CompletionMeter.tsx`
  - [ ] Display percentage text
  - [ ] Render progress bar
  - [ ] Add aria-valuenow, aria-valuemin, aria-valuemax
  - [ ] Color gradient based on percentage
  - [ ] CSS Module

---

## Phase 10: UI Components — Settings & Navigation

- [ ] Create Settings component (M)
  - [ ] Create `src/components/Settings/Settings.tsx`
  - [ ] Volume slider (0–100)
  - [ ] Reduced Motion checkbox
  - [ ] Screen Reader Mode toggle
  - [ ] Text Size selector (normal/large/extra-large)
  - [ ] Reset Progress button with confirmation
  - [ ] Back to Menu button
  - [ ] Wire Redux dispatch for all settings
  - [ ] Add ARIA labels to all controls
  - [ ] Unit test settings persistence
  - [ ] CSS Module

- [ ] Create shared navigation header (S)
  - [ ] Create `src/components/Header/Header.tsx`
  - [ ] Display current screen title
  - [ ] Show navigation breadcrumbs
  - [ ] Implement accessible skip links
  - [ ] CSS Module

- [ ] Create modal/dialog components (M)
  - [ ] Create `src/components/Modal/Modal.tsx` — base component
  - [ ] Create `src/components/ConfirmDialog/ConfirmDialog.tsx`
  - [ ] Implement focus trapping
  - [ ] Implement ESC to close
  - [ ] Add role="alertdialog"
  - [ ] Unit test accessibility

---

## Phase 11: Asset Preparation & Optimization

- [ ] Create asset directory structure (S)
  - [ ] Create `public/assets/cookies/` directory
  - [ ] Create `public/assets/beverages/` directory
  - [ ] Create `public/assets/audio/` directory
  - [ ] Create `public/assets/icons/` directory

- [ ] Optimize and prepare cookie images (M)
  - [ ] Source or create 10+ cookie PNG images
  - [ ] Optimize to <50 KB each
  - [ ] Set consistent dimensions (200x200 px)
  - [ ] Create locked/placeholder versions
  - [ ] Test on multiple DPI screens

- [ ] Optimize and prepare beverage images (M)
  - [ ] Source or create 7+ beverage PNG images
  - [ ] Optimize to <40 KB each
  - [ ] Set consistent dimensions (150x200 px)
  - [ ] Create locked/placeholder versions
  - [ ] Test on multiple DPI screens

- [ ] Prepare audio assets (S)
  - [ ] Record/source eat sound effect (~30 KB)
  - [ ] Record/source unlock sound effect (~30 KB)
  - [ ] Record/source UI feedback beep (~20 KB)
  - [ ] Export as MP3 (8 kHz mono)
  - [ ] Test audio playback across browsers

- [ ] Create favicon and branding (S)
  - [ ] Design favicon (cookie-themed)
  - [ ] Create multiple formats (ico, png)
  - [ ] Set up manifest.json for PWA

---

## Phase 12: Styling & Theming

- [ ] Implement CSS variable system (M)
  - [ ] Define colors (primary, secondary, neutral)
  - [ ] Define typography scale
  - [ ] Define spacing scale
  - [ ] Define shadows and transitions
  - [ ] Define breakpoints
  - [ ] Test CSS variable support

- [ ] Implement responsive design (M)
  - [ ] Mobile-first CSS (< 480px)
  - [ ] Tablet layout (480–1024px)
  - [ ] Desktop layout (> 1024px)
  - [ ] Test on real devices
  - [ ] Verify touch targets (min 44px)
  - [ ] Test image scaling

- [ ] Implement accessibility styles (M)
  - [ ] High contrast mode support (prefers-contrast)
  - [ ] Reduced motion support (prefers-reduced-motion)
  - [ ] Focus indicators for keyboard navigation
  - [ ] Large text mode support
  - [ ] Color-blind friendly palette
  - [ ] Test with accessibility inspector

- [ ] Create component-specific styles (L)
  - [ ] PlayArea.module.scss
  - [ ] CookieDisplay.module.scss
  - [ ] PairingSelector.module.scss
  - [ ] CollectionScreen.module.scss
  - [ ] Settings.module.scss
  - [ ] MainMenu.module.scss
  - [ ] Test CSS Module scoping

---

## Phase 13: Integration & State Flow

- [ ] Wire game flow end-to-end (L)
  - [ ] Connect MainMenu → PlayArea transition
  - [ ] Implement cookie drawing logic
  - [ ] Wire pairing selection to Redux
  - [ ] Implement consume action flow
  - [ ] Handle score calculation
  - [ ] Track consumption history
  - [ ] Test complete game loop

- [ ] Implement progression logic (M)
  - [ ] Wire ProgressionEngine to game actions
  - [ ] Unlock new items on score thresholds
  - [ ] Dispatch discovery actions
  - [ ] Test unlock sequences

- [ ] Implement persistence integration (M)
  - [ ] Hydrate Redux state from storage on app load
  - [ ] Trigger storage saves via middleware
  - [ ] Test auto-save debouncing
  - [ ] Verify data persists across page reloads

- [ ] Implement audio integration (S)
  - [ ] Wire AudioManager to pairing feedback
  - [ ] Play sounds on discover, consume, unlock
  - [ ] Respect volume setting
  - [ ] Respect mute setting
  - [ ] Test sound playback

- [ ] Implement collection tracking (M)
  - [ ] Track discovered items
  - [ ] Track consumption counts
  - [ ] Calculate completion percentage
  - [ ] Wire to CollectionScreen display
  - [ ] Test collection state updates

---

## Phase 14: Accessibility Compliance (WCAG AA)

- [ ] Implement keyboard navigation (M)
  - [ ] Test Tab key navigation through all screens
  - [ ] Implement Arrow key navigation in lists
  - [ ] Implement Enter/Space for buttons
  - [ ] Verify focus trap in modals
  - [ ] Test ESC to close dialogs
  - [ ] Verify logical tab order
  - [ ] Document keyboard shortcuts

- [ ] Implement ARIA labels and roles (M)
  - [ ] Add role="main" to main content
  - [ ] Add role="region" to major sections
  - [ ] Add aria-labels to all buttons
  - [ ] Add aria-live to dynamic content
  - [ ] Add aria-describedby where needed
  - [ ] Add aria-hidden to decorative elements
  - [ ] Test with screen reader (NVDA/JAWS)

- [ ] Test color contrast ratios (S)
  - [ ] Verify foreground/background contrast >= 4.5:1 (normal text)
  - [ ] Verify >= 3:1 (large text, UI components)
  - [ ] Use contrast checker tool
  - [ ] Fix low-contrast elements

- [ ] Test with accessibility tools (M)
  - [ ] Run axe DevTools on all pages
  - [ ] Run WAVE browser extension
  - [ ] Run Lighthouse accessibility audit
  - [ ] Fix flagged issues
  - [ ] Document accessibility decisions

- [ ] Test with assistive tech (M)
  - [ ] Test with NVDA screen reader (Windows)
  - [ ] Test with JAWS if available
  - [ ] Test with VoiceOver (macOS/iOS)
  - [ ] Verify button labels are announced
  - [ ] Verify form fields are announced correctly
  - [ ] Verify dynamic updates are announced

- [ ] Test with reduced motion setting (S)
  - [ ] Disable all animations when prefers-reduced-motion set
  - [ ] Verify functionality is preserved
  - [ ] Test on Windows (Settings > Ease of Access > Display)
  - [ ] Test on macOS (System Preferences > Accessibility > Display)

---

## Phase 15: Performance Optimization

- [ ] Optimize bundle size (L)
  - [ ] Run `npm run build` and analyze bundle
  - [ ] Target < 500 KB gzipped
  - [ ] Code-split components if needed
  - [ ] Remove unused dependencies
  - [ ] Tree-shake unused code
  - [ ] Use Vite's visualizer plugin
  - [ ] Profile with Webpack Bundle Analyzer

- [ ] Optimize images (M)
  - [ ] Use WebP format with PNG fallback
  - [ ] Create responsive image variants (1x, 2x)
  - [ ] Lazy-load images below fold
  - [ ] Use CSS background-image for sprites
  - [ ] Compress with ImageOptim or TinyPNG
  - [ ] Test on slow connections

- [ ] Optimize React rendering (M)
  - [ ] Memoize components with React.memo where needed
  - [ ] Use useMemo for expensive selectors
  - [ ] Use useCallback for event handlers
  - [ ] Verify no unnecessary re-renders (React DevTools Profiler)
  - [ ] Profile with Lighthouse

- [ ] Optimize storage operations (S)
  - [ ] Minimize localStorage writes (debounce to 500ms)
  - [ ] Compress state before storage if needed
  - [ ] Test with large game histories
  - [ ] Measure save/load timing

- [ ] Set up performance budgets (S)
  - [ ] Target < 3-second initial load (FCP)
  - [ ] Target 300ms interaction response time (INP)
  - [ ] Target < 2.5s LCP
  - [ ] Target CLS < 0.1
  - [ ] Monitor with Web Vitals library

---

## Phase 16: Testing

- [ ] Write reducer unit tests (L)
  - [ ] Test `gameSlice` all actions
  - [ ] Test `collectionSlice` all actions
  - [ ] Test `settingsSlice` all actions
  - [ ] Test state immutability
  - [ ] Test edge cases (empty state, duplicate actions)
  - [ ] Achieve > 90% reducer coverage

- [ ] Write service unit tests (L)
  - [ ] Test `PairingSystem.evaluate()` all combinations
  - [ ] Test `ProgressionEngine` unlock logic
  - [ ] Test `StorageManager.save()` and `load()`
  - [ ] Test migration logic
  - [ ] Test error handling
  - [ ] Achieve > 85% service coverage

- [ ] Write component unit tests (L)
  - [ ] Test `App` mounting and routing
  - [ ] Test `PlayArea` interactions
  - [ ] Test `PairingSelector` with all beverages
  - [ ] Test `CollectionScreen` data display
  - [ ] Test `Settings` form interactions
  - [ ] Mock Redux with react-redux hooks
  - [ ] Achieve > 80% component coverage

- [ ] Write integration tests (M)
  - [ ] Test game flow: Menu → Play → Pairing → Score
  - [ ] Test persistence: Save → Reload → Verify
  - [ ] Test progression: Score → Unlock → Discover
  - [ ] Test collection tracking
  - [ ] Use integration test scenarios

- [ ] Write accessibility tests (M)
  - [ ] Test keyboard navigation
  - [ ] Test ARIA labels with jest-axe
  - [ ] Test form accessibility
  - [ ] Test focus management
  - [ ] Run axe-core in tests

- [ ] Set up continuous integration (M)
  - [ ] Create GitHub Actions workflow
  - [ ] Run tests on all PRs
  - [ ] Generate coverage reports
  - [ ] Deploy on successful merge
  - [ ] Add badges to README

---

## Phase 17: Cross-Browser & Device Testing

- [ ] Test on Chrome/Chromium (M)
  - [ ] Desktop Chrome latest
  - [ ] Mobile Chrome (Android)
  - [ ] Verify all features work
  - [ ] Test performance with DevTools

- [ ] Test on Firefox (M)
  - [ ] Desktop Firefox latest
  - [ ] Mobile Firefox (Android)
  - [ ] Test CSS compatibility
  - [ ] Verify audio playback

- [ ] Test on Safari (M)
  - [ ] Desktop Safari latest (macOS)
  - [ ] Mobile Safari (iOS)
  - [ ] Test localStorage (iOS 11+ quota)
  - [ ] Test touch interactions

- [ ] Test on Edge (M)
  - [ ] Edge latest version
  - [ ] Verify compatibility
  - [ ] Test CSS variables support

- [ ] Test on mobile devices (M)
  - [ ] iPhone 12/13 (Safari)
  - [ ] Android flagship (Chrome)
  - [ ] Tablet (iPad, Android tablet)
  - [ ] Test touch targets
  - [ ] Test rotation handling

- [ ] Test on different screen sizes (S)
  - [ ] 320px width (small phone)
  - [ ] 480px width (phone)
  - [ ] 768px width (tablet)
  - [ ] 1024px+ (desktop)
  - [ ] Verify layouts adapt

---

## Phase 18: Child Safety & COPPA Compliance

- [ ] Audit data collection (S)
  - [ ] Verify NO personal data collection
  - [ ] Verify NO IP logging
  - [ ] Verify NO cookies for tracking
  - [ ] Verify NO third-party tracking
  - [ ] Document compliance measures

- [ ] Audit content (M)
  - [ ] Verify appropriate for ages 8–14
  - [ ] Review all text for age-appropriateness
  - [ ] Review all images for age-appropriateness
  - [ ] Verify no ads or sponsored content
  - [ ] Verify no in-app monetization

- [ ] Create privacy policy (S)
  - [ ] State "No personal data collection"
  - [ ] State "Offline-first, no external requests"
  - [ ] State "No cookies or tracking"
  - [ ] Make readable for children
  - [ ] Include in app and repository

- [ ] Create terms of use (S)
  - [ ] Document appropriate use
  - [ ] Age-appropriate language
  - [ ] Include in app

- [ ] Document offline-first architecture (S)
  - [ ] Verify zero external API calls
  - [ ] Verify zero CDN dependencies
  - [ ] Verify assets are bundled
  - [ ] Document in README

---

## Phase 19: Documentation & Deployment Prep

- [ ] Create user documentation (M)
  - [ ] Write game rules / tutorial
  - [ ] Screenshot annotations
  - [ ] Keyboard navigation guide
  - [ ] Accessibility features guide
  - [ ] Troubleshooting FAQ

- [ ] Create developer documentation (M)
  - [ ] Architecture overview
  - [ ] Redux state shape diagram
  - [ ] Data model explanations
  - [ ] Service layer documentation
  - [ ] Component structure guide
  - [ ] Testing guidelines
  - [ ] Contribution workflow

- [ ] Create deployment guide (S)
  - [ ] Build process documentation
  - [ ] Hosting options (GitHub Pages, Vercel, etc.)
  - [ ] Environment variables guide
  - [ ] Deployment checklist

- [ ] Create CHANGELOG (S)
  - [ ] Document all features
  - [ ] Document all fixes
  - [ ] Include version history

- [ ] Add release notes (S)
  - [ ] Write v1.0 release notes
  - [ ] Highlight key features
  - [ ] Include credits/acknowledgments

---

## Phase 20: Final Testing & Refinement

- [ ] Perform end-to-end UAT (L)
  - [ ] Test complete game loop (5+ playthroughs)
  - [ ] Test all screens and transitions
  - [ ] Test reset functionality
  - [ ] Test persistence (close/reopen browser)
  - [ ] Test on target devices
  - [ ] Document any issues

- [ ] Perform stress testing (M)
  - [ ] Play for 30+ minutes continuously
  - [ ] Verify no memory leaks
  - [ ] Verify no state corruption
  - [ ] Test with many pairing records
  - [ ] Verify localStorage quota handling

- [ ] Perform security audit (S)
  - [ ] Check for XSS vulnerabilities
  - [ ] Verify sanitized user inputs
  - [ ] Check for localStorage injection
  - [ ] Run npm audit for dependency vulnerabilities

- [ ] Fix bugs and performance issues (L)
  - [ ] Triage and prioritize issues
  - [ ] Fix critical bugs
  - [ ] Optimize slow operations
  - [ ] Polish UI animations
  - [ ] Improve error messages

- [ ] Conduct final accessibility review (M)
  - [ ] Re-test with screen reader
  - [ ] Re-test keyboard navigation
  - [ ] Re-run axe-core audit
  - [ ] Re-check contrast ratios
  - [ ] Test on real assistive devices

- [ ] Polish visuals and animations (M)
  - [ ] Refine pairing feedback animations
  - [ ] Improve unlock/discovery animations
  - [ ] Smooth collection grid transitions
  - [ ] Polish button hover/active states
  - [ ] Test animations with reduced motion

---

## Phase 21: Launch Preparation

- [ ] Set up production build (S)
  - [ ] Run `npm run build`
  - [ ] Verify bundle size < 500 KB gzipped
  - [ ] Test production build locally
  - [ ] Verify source maps (if needed)

- [ ] Choose and configure hosting (M)
  - [ ] Evaluate hosting options (GitHub Pages, Vercel, Netlify)
  - [ ] Configure domain/subdomain
  - [ ] Set up HTTPS
  - [ ] Configure cache headers
  - [ ] Test CDN performance

- [ ] Set up monitoring (S)
  - [ ] Add Web Vitals tracking (optional, privacy-safe)
  - [ ] Set up error logging (Sentry or similar, optional)
  - [ ] Monitor downtime

- [ ] Create landing page (S)
  - [ ] Write game description
  - [ ] Create screenshots/demo
  - [ ] Link to privacy policy
  - [ ] Link to terms of use
  - [ ] Add "Play Now" button

- [ ] Submit to app directories (M)
  - [ ] Create GitHub repository with full source
  - [ ] Write comprehensive README
  - [ ] Tag v1.0 release
  - [ ] Create releases page with changelog
  - [ ] Consider listing on itch.io (web games)

---

## Phase 22: Post-Launch & Maintenance

- [ ] Monitor stability (Ongoing)
  - [ ] Track error logs daily
  - [ ] Monitor performance metrics
  - [ ] Gather user feedback
  - [ ] Fix critical issues immediately

- [ ] Gather feedback (Ongoing)
  - [ ] Monitor GitHub issues
  - [ ] Respond to user questions
  - [ ] Document feature requests

- [ ] Plan v1.1 improvements (M)
  - [ ] Review feedback
  - [ ] Prioritize next features (multiplayer hints, more content)
  - [ ] Create roadmap
  - [ ] Plan next release

- [ ] Maintain documentation (Ongoing)