# OregonTrail3000 — Architecture Overview

> Electron desktop app + web browser dual build from a shared TypeScript codebase.

## Design Philosophy

- **Separation of concerns**: Game logic, content, and presentation are independent layers
- **Data-driven content**: Events, locations defined in JSON
- **Extensible presentation**: Electron desktop + web browser from shared code
- **Testable core**: Game engine is pure TypeScript, zero DOM/Electron deps
- **Platform abstraction**: Save/load uses filesystem on desktop, localStorage in browser

## Dual Build Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Build Targets                        │
│  ┌─────────────────┐     ┌─────────────────────────┐ │
│  │ Electron Desktop│     │ Web (Docker/nginx)      │ │
│  │ .exe .dmg .AppImage│  │ Static build + container│ │
│  └────────┬────────┘     └───────────┬─────────────┘ │
│           └──────────┬───────────────┘               │
│                      │                                │
│  ┌───────────────────┼──────────────────────────┐    │
│  │          electron/ (Desktop Only)             │    │
│  │  main.ts — Electron main process              │    │
│  │  preload.ts — IPC bridge                      │    │
│  │  Platform-specific: filesystem save, updates  │    │
│  └───────────────────┼──────────────────────────┘    │
│                      │                                │
├──────────────────────┼────────────────────────────────┤
│              Shared Codebase (src/)                   │
│                      │                                │
│  ┌───────────────────┼──────────────────────────┐    │
│  │            React UI Layer (src/ui/)            │    │
│  │  Game screens, menus, status displays         │    │
│  │  Works in both Electron window and browser    │    │
│  └───────────────────┼──────────────────────────┘    │
│                      │                                │
│  ┌───────────────────┼──────────────────────────┐    │
│  │         Game Engine API (src/engine/)          │    │
│  │  Commands in → State + Actions + Narrative out│    │
│  │  Pure TypeScript — NO DOM, NO Electron        │    │
│  │  State machine, turns, events, save/load      │    │
│  └───────────────────┼──────────────────────────┘    │
│                      │                                │
│  ┌───────────────────┼──────────────────────────┐    │
│  │        Game Systems (src/systems/)             │    │
│  │  Resources, Health, EVA, Trading, Weather     │    │
│  │  Pure TypeScript — plugs into engine          │    │
│  └───────────────────┼──────────────────────────┘    │
│                      │                                │
├──────────────────────┼────────────────────────────────┤
│           Content Layer (src/content/)                │
│  events.json, locations.json, crew.json, narrative   │
│  TypeScript schemas for validation                   │
└──────────────────────────────────────────────────────┘
```

## Technology Stack

- **Language**: TypeScript (strict mode)
- **UI Framework**: React 18+
- **Desktop**: Electron + electron-vite
- **Packaging**: electron-builder (.exe, .dmg, .AppImage)
- **Auto-update**: electron-updater via GitHub Releases
- **Web build**: Vite → static files → Docker (nginx)
- **Testing**: Vitest
- **Content**: JSON data files with TypeScript type validation
- **Build tool**: electron-vite (integrates Vite into Electron)

## Project Structure

```
OregonTrail3000/
├── electron/                 # Electron-specific (desktop only)
│   ├── main.ts              # Main process — window, IPC, auto-update
│   └── preload.ts           # Preload script — IPC bridge to renderer
├── src/                     # Shared codebase (Electron + Web)
│   ├── engine/              # Core game engine (pure TS)
│   │   ├── types.ts         # All type definitions and interfaces
│   │   ├── state.ts         # Game state management
│   │   ├── turns.ts         # Turn processing loop
│   │   ├── events.ts        # Event dispatcher + probability engine
│   │   ├── phases.ts        # Phase transitions
│   │   ├── rng.ts           # Seeded RNG for deterministic play
│   │   ├── save.ts          # Save/load with version migration
│   │   └── index.ts         # Engine API barrel export
│   ├── systems/             # Game systems
│   │   ├── resources.ts     # Resource management (6 resources)
│   │   ├── health.ts        # Crew health + morale
│   │   ├── eva.ts           # EVA missions + skill challenges
│   │   ├── trading.ts       # Gateway trading
│   │   ├── landing.ts       # Landing site selection + descent
│   │   ├── weather.ts       # Solar weather system
│   │   ├── scoring.ts       # Victory scoring
│   │   └── index.ts         # Systems barrel export
│   ├── content/             # Game content data
│   │   ├── schemas/         # TypeScript type definitions for content
│   │   ├── events.json      # 24 weighted events
│   │   ├── locations.json   # 14 locations + 5 landing sites
│   │   ├── crew.json        # 5 crew members
│   │   ├── narrative.json   # All narrative text
│   │   └── index.ts         # Content loader + validation
│   ├── ui/                  # React UI (shared)
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Game screens (title, prep, game, victory, etc.)
│   │   ├── hooks/           # React hooks for engine integration
│   │   ├── App.tsx          # Root app component
│   │   └── index.tsx        # Entry point
│   └── platform/            # Platform abstraction
│       ├── save-manager.ts  # Abstract save interface
│       ├── desktop.ts       # Filesystem save (Electron)
│       └── web.ts           # localStorage save (browser)
├── game-design/             # Design documents (read-only for devs)
├── .github/                 # Copilot agents + instructions
├── Dockerfile               # Web deployment (nginx + static build)
├── electron-builder.yml     # Desktop packaging config
├── electron.vite.config.ts  # Electron + Vite config
├── vite.config.ts           # Web-only Vite config
├── vitest.config.ts         # Test config
├── tsconfig.json            # TypeScript config
├── package.json             # Project config + scripts
└── README.md
```

## Build Scripts

```json
{
  "dev": "electron-vite dev",
  "dev:web": "vite",
  "build:desktop": "electron-vite build && electron-builder",
  "build:web": "vite build",
  "test": "vitest",
  "docker:build": "vite build && docker build -t lunar-colony-3000 .",
  "docker:run": "docker run -p 8080:80 lunar-colony-3000"
}
```

## Engine API Contract

```typescript
// Engine accepts commands, returns state — never touches DOM or Electron
interface GameEngine {
  createGame(config: GameConfig): GameState;
  executeCommand(state: GameState, command: GameCommand): GameResult;
  getAvailableActions(state: GameState): GameAction[];
  saveGame(state: GameState): SaveData;
  loadGame(data: SaveData): GameState;
}
```

## Key Design Decisions

1. **Electron-first, web-compatible**: Desktop app for distribution, web for accessibility
2. **Pure TypeScript engine**: Testable, portable, no platform coupling
3. **electron-vite**: Modern Electron DX with HMR and fast builds
4. **electron-builder**: Cross-platform packaging to .exe/.dmg/.AppImage
5. **Platform abstraction layer**: Save/load adapts to filesystem (desktop) or localStorage (web)
6. **Data-driven content**: JSON files loaded at runtime, validated against TS types
7. **Deterministic engine**: Seeded RNG enables testing and replay
