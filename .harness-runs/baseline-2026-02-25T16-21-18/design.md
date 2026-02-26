# Technical Design Document: Virtual Snack Game

## 1. Overview

### Purpose
The Virtual Snack Game is a casual, offline-first browser-based game for children aged 8–14. Players collect virtual cookies and beverages, discover pairing combinations, and progress through a collection-based gameplay loop. The game emphasizes discovery and collection without real-world monetization, advertisements, or personal data collection.

### Key Design Principles
- **Offline-First**: All game logic and content are client-side; no backend dependencies
- **Child-Safe**: COPPA-compliant; no personal data collection, ads, or monetization
- **Accessible**: WCAG AA compliant with keyboard navigation and screen reader support
- **Responsive**: Optimized for desktop, tablet, and mobile viewports
- **Performant**: Sub-3-second initial load; 300 ms interaction response time
- **Persistent**: Automatic progress saving with manual reset capability

### Target Audience
Children aged 8–14; casual, discovery-driven gameplay with low barrier to entry.

---

## 2. Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   UI Components  │  │   Game Logic     │                 │
│  │  (PlayArea,      │  │  (GameEngine,    │                 │
│  │   Collection,    │  │   PairingSystem) │                 │
│  │   Settings)      │  │                  │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └─────────────┬───────┘                            │
│                         │                                    │
│           ┌─────────────▼──────────────┐                     │
│           │   Redux State Management   │                     │
│           │  (Store, Reducers,        │                     │
│           │   Selectors, Middleware)  │                     │
│           └─────────────┬──────────────┘                     │
│                         │                                    │
│           ┌─────────────▼──────────────┐                     │
│           │   Persistence Layer       │                     │
│           │  (Storage Manager)        │                     │
│           └─────────────┬──────────────┘                     │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Browser  │
                    │ localStorage│
                    │ / IndexedDB│
                    └───────────┘
```

### 2.2 Data Flow

```
User Interaction (Click Cookie)
          ↓
    React Event Handler
          ↓
    Dispatch Redux Action
          ↓
    Reducer Updates State
          ↓
    Selector Derives Data
          ↓
    Components Re-render
          ↓
    Middleware Triggers Persistence
          ↓
    Storage Manager Writes to localStorage
```

### 2.3 Core Layers

#### **Presentation Layer**
- React components for UI rendering
- Responsive CSS modules for styling
- Accessibility enhancements (ARIA labels, keyboard handlers)

#### **State Management Layer**
- Redux store for centralized state
- Reducers for game logic (consumption, unlocking, inventory)
- Selectors for derived state (completion %, available cookies)
- Middleware for side effects (persistence, audio triggers)

#### **Game Logic Layer**
- `GameEngine`: Handles turn/action resolution
- `PairingSystem`: Evaluates cookie–beverage compatibility
- `ProgressionEngine`: Manages unlocks and milestones

#### **Persistence Layer**
- `StorageManager`: Abstracts localStorage and IndexedDB
- Auto-save middleware that triggers after critical actions
- Migration utilities for future schema updates

---

## 3. Component Breakdown

### 3.1 UI Component Hierarchy

```
App
├── MainMenu
│   ├── StartButton
│   └── SettingsButton
├── PlayArea
│   ├── CookieDisplay (active cookie)
│   │   └── CookieImage
│   └── ActionButtons
│       ├── EatButton
│       └── PairingSelector
│           └── BeverageOption[]
├── CollectionScreen
│   ├── CookieCollection
│   │   └── CookieCard[] (discovered, locked)
│   ├── BeverageCollection
│   │   └── BeverageCard[] (discovered, locked)
│   └── CompletionMeter
├── PairingFeedback
│   ├── CompatibilityBadge (good/okay/unusual)
│   ├── PointsDisplay
│   └── AudioFeedback
└── Settings
    ├── ResetButton
    ├── VolumeToggle
    └── AccessibilityOptions
```

### 3.2 Component Specifications

#### **App Component**
Main router and state provider.

```typescript
interface AppProps {
  // No props; uses Redux provider
}

const App: React.FC<AppProps> = () => {
  const [gameState] = useAppDispatch();
  
  return (
    <Provider store={store}>
      <div className="app" role="main">
        <ErrorBoundary>
          {gameState === 'menu' && <MainMenu />}
          {gameState === 'playing' && <PlayArea />}
          {gameState === 'collection' && <CollectionScreen />}
          {gameState === 'settings' && <Settings />}
        </ErrorBoundary>
      </div>
    </Provider>
  );
};
```

#### **PlayArea Component**
Central gameplay interface.

```typescript
interface PlayAreaProps {}

const PlayArea: React.FC<PlayAreaProps> = () => {
  const dispatch = useAppDispatch();
  const { currentCookie, selectedBeverage, score } = useAppSelector(
    state => state.game
  );

  const handleEatCookie = () => {
    if (currentCookie && selectedBeverage) {
      dispatch(consumePairing({
        cookieId: currentCookie.id,
        beverageId: selectedBeverage.id
      }));
    }
  };

  return (
    <div className="play-area" role="region" aria-label="Play Area">
      <div className="score-display" aria-live="polite">
        Score: {score}
      </div>
      
      <CookieDisplay cookie={currentCookie} />
      
      <PairingSelector />
      
      <button
        onClick={handleEatCookie}
        className="eat-button"
        aria-label={`Eat ${currentCookie?.name}`}
      >
        Eat Cookie
      </button>
      
      <PairingFeedback />
    </div>
  );
};
```

#### **CookieDisplay Component**
Renders the current interactive cookie.

```typescript
interface CookieDisplayProps {
  cookie: Cookie | null;
}

const CookieDisplay: React.FC<CookieDisplayProps> = ({ cookie }) => {
  if (!cookie) return <div>Loading next cookie...</div>;

  return (
    <div className="cookie-display">
      <img
        src={`/assets/cookies/${cookie.id}.png`}
        alt={`${cookie.name} cookie`}
        className="cookie-image"
      />
      <h2>{cookie.name}</h2>
      <p className="cookie-description">{cookie.description}</p>
    </div>
  );
};
```

#### **PairingSelector Component**
Allows beverage selection with compatibility hints.

```typescript
interface PairingSelectorProps {}

const PairingSelector: React.FC<PairingSelectorProps> = () => {
  const dispatch = useAppDispatch();
  const { beverages, selectedBeverage, currentCookie } = useAppSelector(
    state => state.game
  );

  const getCompatibility = (
    cookieId: string,
    beverageId: string
  ): 'good' | 'okay' | 'unusual' => {
    return pairingSystem.evaluate(cookieId, beverageId);
  };

  return (
    <fieldset className="pairing-selector">
      <legend>Choose a beverage:</legend>
      {beverages.map(beverage => {
        const compatibility = getCompatibility(
          currentCookie!.id,
          beverage.id
        );
        
        return (
          <label key={beverage.id} className="beverage-option">
            <input
              type="radio"
              name="beverage"
              value={beverage.id}
              checked={selectedBeverage?.id === beverage.id}
              onChange={() => dispatch(selectBeverage(beverage.id))}
              aria-label={`${beverage.name} - ${compatibility} pairing`}
            />
            <span className={`badge badge-${compatibility}`}>
              {beverage.name}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
};
```

#### **CollectionScreen Component**
Displays discovered items and completion progress.

```typescript
interface CollectionScreenProps {}

const CollectionScreen: React.FC<CollectionScreenProps> = () => {
  const { cookies, beverages, pairingsCompleted } = useAppSelector(
    state => state.collection
  );

  const completionPercentage = useMemo(() => {
    const total = cookies.length * beverages.length;
    return Math.round((pairingsCompleted.length / total) * 100);
  }, [cookies, beverages, pairingsCompleted]);

  return (
    <div className="collection-screen" role="region" aria-label="Collection">
      <div className="completion-meter" aria-live="polite">
        Collection: {completionPercentage}% complete
        <ProgressBar value={completionPercentage} max={100} />
      </div>

      <section className="cookie-collection">
        <h2>Cookies Discovered: {cookies.length}</h2>
        <div className="grid">
          {cookies.map(cookie => (
            <CookieCard
              key={cookie.id}
              cookie={cookie}
              discovered={cookie.discovered}
            />
          ))}
        </div>
      </section>

      <section className="beverage-collection">
        <h2>Beverages Discovered: {beverages.length}</h2>
        <div className="grid">
          {beverages.map(beverage => (
            <BeverageCard
              key={beverage.id}
              beverage={beverage}
              discovered={beverage.discovered}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
```

#### **Settings Component**
Game configuration and progress management.

```typescript
interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const dispatch = useAppDispatch();
  const { volume } = useAppSelector(state => state.settings);

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure? This will delete all your progress.'
      )
    ) {
      dispatch(resetGameProgress());
    }
  };

  return (
    <div className="settings-screen" role="region" aria-label="Settings">
      <h2>Settings</h2>

      <fieldset>
        <legend>Volume</legend>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={e =>
            dispatch(setVolume(parseInt(e.currentTarget.value)))
          }
          aria-label="Volume control"
        />
      </fieldset>

      <fieldset>
        <legend>Accessibility</legend>
        <label>
          <input
            type="checkbox"
            onChange={e =>
              dispatch(setReducedMotion(e.currentTarget.checked))
            }
          />
          Reduce Motion
        </label>
      </fieldset>

      <button onClick={handleReset} className="reset-button danger">
        Reset Progress
      </button>

      <button
        onClick={() => dispatch(navigateTo('menu'))}
        className="back-button"
      >
        Back to Menu
      </button>
    </div>
  );
};
```

---

## 4. Data Models

### 4.1 Core Entities

#### **Cookie Model**

```typescript
interface Cookie {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'special';
  unlockedAt?: number; // Timestamp when first discovered
  category?: 'chocolate' | 'fruity' | 'spicy' | 'nutty' | 'vanilla';
}

interface CookieState extends Cookie {
  discovered: boolean;
  timesConsumed: number;
}
```

#### **Beverage Model**

```typescript
interface Beverage {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  color: string; // For visual representation
}

interface BeverageState extends Beverage {
  discovered: boolean;
  timesConsumed: number;
}
```

#### **Pairing Model**

```typescript
interface Pairing {
  cookieId: string;
  beverageId: string;
  compatibility: 'good' | 'okay' | 'unusual';
  pointsModifier: number; // Multiplier: good=1.5x, okay=1x, unusual=0.5x
}

interface PairingRecord {
  cookieId: string;
  beverageId: string;
  consumedAt: number; // Timestamp
  points: number;
}
```

#### **Game State Model**

```typescript
interface GameState {
  // Current session
  currentCookie: Cookie | null;
  selectedBeverage: Beverage | null;
  score: number;
  
  // Collections
  cookies: CookieState[];
  beverages: BeverageState[];
  pairingHistory: PairingRecord[];
  
  // Progression
  level: number;
  nextUnlockThreshold: number;
  unlockedCookies: Set<string>;
  unlockedBeverages: Set<string>;
  
  // UI State
  screen: 'menu' | 'playing' | 'collection' | 'settings';
  lastFeedback: {
    type: 'good' | 'okay' | 'unusual' | null;
    pointsEarned: number;
    timestamp: number;
  };
}

interface Settings {
  volume: number; // 0–100
  reducedMotion: boolean;
  screenReaderMode: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
}

interface AppState {
  game: GameState;
  settings: Settings;
}
```

### 4.2 Static Content

#### **Cookie Content Library**

```typescript
const COOKIE_LIBRARY: Record<string, Cookie> = {
  'chocolate-chip': {
    id: 'chocolate-chip',
    name: 'Chocolate Chip Cookie',
    description: 'A classic with melty chocolate chips.',
    imageUrl: '/assets/cookies/chocolate-chip.png',
    rarity: 'common',
    category: 'chocolate',
  },
  'double-chocolate': {
    id: 'double-chocolate',
    name: 'Double Chocolate Cookie',
    description: 'Extra chocolatey for chocolate lovers!',
    imageUrl: '/assets/cookies/double-chocolate.png',
    rarity: 'uncommon',
    category: 'chocolate',
  },
  'snickerdoodle': {
    id: 'snickerdoodle',
    name: 'Snickerdoodle',
    description: 'Cinnamon sugar goodness.',
    imageUrl: '/assets/cookies/snickerdoodle.png',
    rarity: 'common',
    category: 'vanilla',
  },
  'peanut-butter': {
    id: 'peanut-butter',
    name: 'Peanut Butter Cookie',
    description: 'Creamy and nutty.',
    imageUrl: '/assets/cookies/peanut-butter.png',
    rarity: 'uncommon',
    category: 'nutty',
  },
  'oatmeal-raisin': {
    id: 'oatmeal-raisin',
    name: 'Oatmeal Raisin Cookie',
    description: 'Wholesome oats and sweet raisins.',
    imageUrl: '/assets/cookies/oatmeal-raisin.png',
    rarity: 'common',
    category: 'vanilla',
  },
  'strawberry-shortcake': {
    id: 'strawberry-shortcake',
    name: 'Strawberry Shortcake Cookie',
    description: 'Fruity and sweet.',
    imageUrl: '/assets/cookies/strawberry-shortcake.png',
    rarity: 'uncommon',
    category: 'fruity',
  },
  'mint-chocolate': {
    id: 'mint-chocolate',
    name: 'Mint Chocolate Cookie',
    description: 'Cool mint with dark chocolate.',
    imageUrl: '/assets/cookies/mint-chocolate.png',
    rarity: 'uncommon',
    category: 'chocolate',
  },
  'spiced-gingerbread': {
    id: 'spiced-gingerbread',
    name: 'Spiced Gingerbread Cookie',
    description: 'Warm spices in every bite.',
    imageUrl: '/assets/cookies/gingerbread.png',
    rarity: 'uncommon',
    category: 'spicy',
  },
  'white-chocolate-macadamia': {
    id: 'white-chocolate-macadamia',
    name: 'White Chocolate Macadamia',
    description: 'Tropical nuts and white chocolate.',
    imageUrl: '/assets/cookies/white-choc-macadamia.png',
    rarity: 'rare',
    category: 'nutty',
  },
  'rainbow-sprinkle': {
    id: 'rainbow-sprinkle',
    name: 'Rainbow Sprinkle Cookie',
    description: 'Colorful fun in cookie form!',
    imageUrl: '/assets/cookies/rainbow-sprinkle.png',
    rarity: 'rare',
    category: 'vanilla',
  },
};
```

#### **Beverage Content Library**

```typescript
const BEVERAGE_LIBRARY: Record<string, Beverage> = {
  'milk': {
    id: 'milk',
    name: 'Milk',
    description: 'Classic and creamy.',
    imageUrl: '/assets/beverages/milk.png',
    color: '#FFFEF0',
  },
  'chocolate-milk': {
    id: 'chocolate-milk',
    name: 'Chocolate Milk',
    description: 'Rich and chocolatey.',
    imageUrl: '/assets/beverages/chocolate-milk.png',
    color: '#8B6F47',
  },
  'strawberry-milk': {
    id: 'strawberry-milk',
    name: 'Strawberry Milk',
    description: 'Sweet strawberry flavor.',
    imageUrl: '/assets/beverages/strawberry-milk.png',
    color: '#FF69B4',
  },
  'orange-juice': {
    id: 'orange-juice',
    name: 'Orange Juice',
    description: 'Fresh citrus.',
    imageUrl: '/assets/beverages/orange-juice.png',
    color: '#FFA500',
  },
  'apple-juice': {
    id: 'apple-juice',
    name: 'Apple Juice',
    description: 'Crisp and refreshing.',
    imageUrl: '/assets/beverages/apple-juice.png',
    color: '#D4A574',
  },
  'root-beer': {
    id: 'root-beer',
    name: 'Root Beer',
    description: 'Sweet and fizzy.',
    imageUrl: '/assets/beverages/root-beer.png',
    color: '#8B4513',
  },
  'water': {
    id: 'water',
    name: 'Water',
    description: 'Pure and simple.',
    imageUrl: '/assets/beverages/water.png',
    color: '#E0F7FF',
  },
};
```

#### **Pairing Compatibility Matrix**

```typescript
const PAIRING_MATRIX: Record<string, Record<string, Pairing>> = {
  'chocolate-chip': {
    'milk': { cookieId: 'chocolate-chip', beverageId: 'milk', compatibility: 'good', pointsModifier: 1.5 },
    'chocolate-milk': { cookieId: 'chocolate-chip', beverageId: 'chocolate-milk', compatibility: 'okay', pointsModifier: 1.0 },
    'orange-juice': { cookieId: 'chocolate-chip', beverageId: 'orange-juice', compatibility: 'unusual', pointsModifier: 0.5 },
    // ... more pairings
  },
  // ... more cookies
};

function getPairingCompatibility(
  cookieId: string,
  beverageId: string
): Pairing | null {
  return PAIRING_MATRIX[cookieId]?.[beverageId] ?? null;
}
```

---

## 5. Technology Choices

### 5.1 Core Framework & Libraries

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **UI Framework** | React 18+ | Component-based, efficient rendering, large ecosystem. Native support for hooks simplifies state management. |
| **Language** | TypeScript (strict mode) | Type safety, better IDE support, reduced runtime errors. Meets NFR-10. |
| **State Management** | Redux Toolkit | Predictable state mutations, Redux DevTools integration, built-in immutability patterns. Ideal for turn-based games. |
| **Styling** | CSS Modules + SASS | Scoped styles prevent global conflicts. SASS variables support theming. |
| **Storage** | localStorage + IndexedDB | localStorage for small JSON state; IndexedDB for future asset caching. |
| **Testing** | Jest + React Testing Library | Industry standard; focused on behavior testing; supports component and reducer unit tests. |
| **Build Tool** | Vite | Fast HMR, optimized bundle size, native ES modules. Meets NFR-3 (<500 KB gzipped). |
| **Package Manager** | pnpm | Faster installs, efficient monorepo support, lower disk usage. |

### 5.2 Project Structure

```
virtual-snack-game/
├── public/
│   ├── assets/
│   │   ├── cookies/
│   │   │   ├── chocolate-chip.png
│   │   │   └── ... (9+ cookie images)
│   │   ├── beverages/
│   │   │   ├── milk.png
│   │   │   └── ... (6+ beverage images)
│   │   └── audio/
│   │       ├── eat-sound.mp3
│   │       ├── unlock-sound.mp3
│   │       └── feedback-beep.mp3
│   └── index.html
├── src/
│   ├── app/
│   │   ├── store.ts              # Redux store configuration
│   │   └── hooks.ts              # App-specific hooks (useAppDispatch, etc.)
│   ├── components/
│   │   ├── App/
│   │   ├── PlayArea/
│   │   ├── CollectionScreen/
│   │   ├── CookieDisplay/
│   │   ├── PairingSelector/
│   │   ├── PairingFeedback/
│   │   ├── Settings/
│   │   └── MainMenu/
│   ├── features/
│   │   ├── game/
│   │   │   ├── gameSlice.ts      # Redux slice for game state
│   │   │   ├── gameSelectors.ts  # Memoized selectors
│   │   │   └── gameThunks.ts     # Async actions
│   │   ├── collection/
│   │   │   ├── collectionSlice.ts
│   │   │   └── collectionSelectors.ts
│   │   └── settings/
│   │       └── settingsSlice.ts
│   ├── services/
│   │   ├── pairingSystem.ts      # Pairing logic
│   │   ├── progressionEngine.ts  # Unlock logic
│   │   ├── storageManager.ts     # localStorage/IndexedDB abstraction
│   │   └── audioManager.ts       # Sound effects
│   ├── data/
│   │   ├── cookies.ts            # Cookie library
│   │   ├── beverages.ts          # Beverage library
│   │   └── pairingMatrix.ts      # Compatibility definitions
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── usePairing.ts
│   │   └── usePersistence.ts
│   ├── styles/
│   │   ├── index.scss
│   │   ├── variables.scss        # CSS variables for theming
│   │   └── accessibility.scss
│   ├── utils/
│   │   ├── localStorage.ts       # Storage utilities
│   │   ├── migration.ts          # Schema migration helpers
│   │   └── validators.ts         # Data validation
│   ├── types/
│   │   └── index.ts              # Shared TypeScript definitions
│   └── main.tsx                  # Entry point
├── tests/
│   ├── features/
│   │   ├── game/
│   │   │   └── gameSlice.test.ts
│   │   └── collection/
│   │       └── collectionSlice.test.ts
│   ├── services/
│   │   ├── pairingSystem.test.ts
│   │   └── storageManager.test.ts
│   └── components/
│       └── PlayArea.test.tsx
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions for CI/CD
├── vite.config.ts
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md
```

### 5.3 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "@vitejs/plugin-react": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "sass": "^1.60.0"
  }
}
```

### 5.4 Storage Strategy

#### **localStorage Schema**

```typescript
interface StorageSchema {
  version: number; // For migrations
  game: {
    cookies: CookieState[];
    beverages: BeverageState[];
    pairingHistory: PairingRecord[];
    score: number;
    level: number;
  };
  settings: Settings;
  metadata: {
    lastSaved: number; // Timestamp
    playerId: string;  // Anonymous UUID
  };
}
```

#### **Storage Manager Implementation**

```typescript
class StorageManager {
  private readonly STORAGE_KEY = 'vsg_game_state';
  private readonly CURRENT_VERSION = 1;

  save(state: AppState): void {
    const payload: StorageSchema = {
      version: this.CURRENT_VERSION,
      game: state.game,
      settings: state.settings,
      metadata: {
        lastSaved: Date.now(),
        playerId: this.getOrCreatePlayerId(),
      },
    };
    
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch (error) {
      if (error instanceof DOMException && 
          error.code === 22) { // QuotaExceededError
        console.warn('Storage quota exceeded; clearing old data.');
        this.clearOldData();
        this.save(state); // Retry
      } else {
        console.error('Storage error:', error);
      }
    }
  }

  load(): AppState | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const parsed: StorageSchema = JSON.parse(data);
      
      if (parsed.version !== this.CURRENT_VERSION) {
        return this.migrateSchema(parsed);
      }

      return {
        game: parsed.game,
        settings: parsed.settings,
      };
    } catch (error) {
      console.error('Load error:', error);
      return null;
    }
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private migrateSchema(oldSchema: any): AppState {
    // Implement forward-compatible migrations
    console.log(`Migrating storage from v${oldSchema.version}`);
    // ... migration logic
    return oldSchema as AppState;
  }

  private getOrCreatePlayerId(): string {
    let playerId = localStorage.getItem('vsg_player_id');
    if (!playerId) {
      playerId = this.generateUUID();
      localStorage.setItem('vsg_player_id', playerId);
    }
    return playerId;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
```

### 5.5 Persistence Middleware

```typescript
import { Middleware } from '@reduxjs/toolkit';
import { storageManager } from '../services/storageManager';

let saveTimeout: NodeJS.Timeout;

export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);
  
  // Debounce saves to avoid excessive writes
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const state = store.getState();
    storageManager.save(state);
  }, 500);

  return result;
};
```

### 5.6 Initialization & Hydration

```typescript
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import gameReducer from './features/game/gameSlice';
import collectionReducer from './features/collection/collectionSlice';
import settingsReducer from './features/settings/settingsSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';
import { storageManager } from './services/storageManager';

// Load persisted state
const persistedState = storageManager.load();

export const store = configureStore({
  reducer: {
    game: gameReducer,
    collection: collectionReducer,
    settings: settingsReducer,
  },
  preloadedState: persistedState || undefined,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializable