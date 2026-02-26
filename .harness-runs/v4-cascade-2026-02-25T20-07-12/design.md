# Technical Design Document — Virtual Snack Game

## Overview

Virtual Snack Game is a client-side React + TypeScript application delivering an offline-capable clicking game for children ages 8–14. Players consume virtual cookies paired with beverages to earn points. All state persists to localStorage; no backend or network calls occur post-load. The design prioritizes simplicity, type safety, and mobile responsiveness.

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         React App (TypeScript)          │
├─────────────────────────────────────────┤
│ Presentation Layer (Components)         │
│  ├─ GameScreen                          │
│  ├─ CookieDisplay                       │
│  ├─ BeverageSelector                    │
│  └─ ScoreBoard                          │
├─────────────────────────────────────────┤
│ State Management (Context + Hooks)      │
│  └─ GameContext (score, cookies, etc.)  │
├─────────────────────────────────────────┤
│ Utilities & Services                    │
│  ├─ StorageService (localStorage)       │
│  ├─ AudioService (sound effects)        │
│  └─ GameLogic (scoring, pairing)        │
├─────────────────────────────────────────┤
│ Assets (bundled)                        │
│  ├─ Cookie images                       │
│  ├─ Audio files                         │
│  └─ Styles                              │
└─────────────────────────────────────────┘
```

### State Management

Use React Context API with `useReducer` for predictable state transitions. No Redux or third-party store needed for this scope.

**GameContext** holds:
- `score` (number)
- `currentCookie` (Cookie or null)
- `selectedBeverage` (Beverage or null)
- `unlockedCookies` (array of cookie types)
- `soundEnabled` (boolean)
- `gameHistory` (array of past sessions)

---

## Component Breakdown

### Core Components

| Component | Responsibility | Props/State |
|-----------|----------------|------------|
| **GameScreen** | Main container; orchestrates layout and game flow | `gameState`, `dispatch` |
| **CookieDisplay** | Renders clickable cookie; handles tap/click events | `currentCookie`, `onConsume` |
| **BeverageSelector** | Displays beverage options; manages selection | `selected`, `onSelect` |
| **ScoreBoard** | Displays current score and session info | `score`, `onReset` |
| **PairingFeedback** | Shows transient visual/text feedback on pairing | `cookie`, `beverage`, `visible` |
| **CookieGallery** | Shows all available/unlocked cookie types (menu) | `unlockedCookies` |
| **SettingsMenu** | Toggle audio, reset game, view history | `soundEnabled`, `onToggleSound` |

### Component Interaction Example

```typescript
// Simplified flow
<GameScreen>
  <CookieDisplay 
    cookie={currentCookie} 
    onConsume={handleConsume}
  />
  <BeverageSelector 
    selected={selectedBeverage} 
    onSelect={setSelectedBeverage}
  />
  <PairingFeedback 
    visible={showFeedback} 
    feedback={lastFeedback}
  />
  <ScoreBoard score={score} onReset={handleReset} />
</GameScreen>
```

---

## Data Models

### Type Definitions

```typescript
// Cookie types
type CookieType = 'chocolate-chip' | 'sugar' | 'oatmeal' | 'peanut-butter';

interface Cookie {
  id: CookieType;
  name: string;
  basePoints: number;
  imageUrl: string;
  unlockedAt?: number; // timestamp or session count
}

// Beverage types
type BeverageType = 'milk' | 'root-beer' | 'water' | 'juice';

interface Beverage {
  id: BeverageType;
  name: string;
  imageUrl: string;
  pairingBonus: Record<CookieType, number>; // bonus points per cookie
}

// Game state
interface GameState {
  score: number;
  currentCookie: Cookie | null;
  selectedBeverage: Beverage | null;
  unlockedCookies: CookieType[];
  soundEnabled: boolean;
  sessionStartedAt: number; // timestamp
}

// Persisted data
interface GameProgress {
  totalScore: number;
  sessions: Array<{
    date: number;
    score: number;
    duration: number;
  }>;
  unlockedCookies: CookieType[];
}
```

### LocalStorage Schema

```json
{
  "snack-game:progress": {
    "totalScore": 1250,
    "sessions": [...],
    "unlockedCookies": ["chocolate-chip", "sugar"]
  },
  "snack-game:settings": {
    "soundEnabled": true
  }
}
```

---

## Technology Choices

### Core Dependencies

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **React 18** | UI framework | Standard, performant, type-safe |
| **TypeScript 5** | Type safety | Catches errors early; improves DX |
| **Vite** | Build tool | Fast bundling, sub-3s load target |
| **CSS Modules / Tailwind** | Styling | Lightweight, scoped styles |
| **Local Storage API** | Persistence | No external dependency; sufficient for 5–10 MB data |

### No External Dependencies for:
- State management (use Context API + useReducer)
- Animation (use CSS transitions / `react-transition-group` if needed, but prefer CSS)
- Audio playback (native `HTMLAudioElement`)
- Data validation (simple type guards in TypeScript)

### Build & Deployment

- **Vite config** to bundle all assets (images, audio) into the app
- **Service Worker** (optional) for offline caching; not required if all assets load on first visit
- **Static hosting** (Netlify, Vercel, GitHub Pages)

---

## Key Implementation Notes

### Offline Capability

- Bundle all cookie images and audio files using Vite's asset handling
- Preload audio on app init
- localStorage persists score/progress; page refresh restores state automatically

### Mobile-Friendly Hit Targets

- CookieDisplay component sized to ≥ 44×44 px (CSS `min-width`, `min-height`)
- Tap event handlers on both click and touch events
- Use `pointer-events: auto` for clickable regions

### Scoring & Pairing Logic

```typescript
function calculatePairingScore(
  cookie: Cookie,
  beverage: Beverage | null
): number {
  let points = cookie.basePoints;
  if (beverage) {
    const bonus = beverage.pairingBonus[cookie.id] || 0;
    points += bonus;
    playPairingSound(cookie, beverage);
  }
  return points;
}
```

### Unlock Mechanics

Unlock new cookies at score milestones (e.g., every 500 points). Store in GameState and persist to localStorage.

---

## Success Criteria

- ✓ Game loads in < 3 seconds on 4G
- ✓ Clickable cookies consume and score points immediately
- ✓ Score persists across page refreshes
- ✓ Touch targets ≥ 44×44 px on mobile
- ✓ All assets bundled; no runtime network calls
- ✓ Type-safe TypeScript throughout; no `any`