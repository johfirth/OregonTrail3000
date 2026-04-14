# OregonTrail3000 — Architecture Overview

> This document describes the high-level architecture for future development. The game is currently in the **design phase** — see `game-design/` for design documents.

## Design Philosophy

- **Separation of concerns**: Game logic, content, and presentation are independent layers
- **Data-driven content**: Events, locations, items, and NPCs are defined in data files, not hardcoded
- **Extensible presentation**: The game engine supports multiple frontends (terminal, web, desktop)
- **Testable core**: All game logic is unit-testable without UI dependencies

## Target Architecture

```
┌─────────────────────────────────────────────┐
│                Presentation Layer            │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Terminal   │ │ Web UI   │ │ Desktop    │  │
│  │ (Phase 1)  │ │ (Future) │ │ (Future)   │  │
│  └─────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│        └─────────────┼─────────────┘         │
│                      │                       │
├──────────────────────┼───────────────────────┤
│              Game Engine API                 │
│                      │                       │
│  ┌───────────────────┼───────────────────┐   │
│  │            Core Engine                │   │
│  │  ┌──────────┐ ┌──────────┐           │   │
│  │  │ State    │ │ Event    │           │   │
│  │  │ Machine  │ │ Loop     │           │   │
│  │  └──────────┘ └──────────┘           │   │
│  │  ┌──────────┐ ┌──────────┐           │   │
│  │  │ Turn     │ │ Save/    │           │   │
│  │  │ Manager  │ │ Load     │           │   │
│  │  └──────────┘ └──────────┘           │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌───────────────────────────────────────┐   │
│  │           Game Systems                │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │Resource│ │Combat  │ │Travel  │    │   │
│  │  │Manager │ │System  │ │System  │    │   │
│  │  └────────┘ └────────┘ └────────┘    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │Trading │ │Weather │ │Health  │    │   │
│  │  │System  │ │System  │ │System  │    │   │
│  │  └────────┘ └────────┘ └────────┘    │   │
│  └───────────────────────────────────────┘   │
│                                              │
├──────────────────────────────────────────────┤
│              Content Layer                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Events   │ │Locations │ │ Items &  │     │
│  │ (JSON)   │ │ (JSON)   │ │ NPCs     │     │
│  └──────────┘ └──────────┘ └──────────┘     │
└──────────────────────────────────────────────┘
```

## Technology Stack (Planned)

- **Language**: TypeScript (for cross-platform compatibility and type safety)
- **Runtime**: Node.js (terminal) / Browser (web UI)
- **Build**: Modern ES modules with bundler support
- **Testing**: Vitest or Jest
- **Content format**: JSON/YAML data files for game content
- **Future UI**: React or similar for web frontend

## Source Directory Structure (Planned)

```
src/
├── engine/          # Core game engine
│   ├── state.ts     # Game state management
│   ├── events.ts    # Event loop and dispatching
│   ├── turns.ts     # Turn management
│   └── save.ts      # Save/load system
├── systems/         # Game systems
│   ├── resources.ts # Resource management
│   ├── combat.ts    # Combat/hunting mechanics
│   ├── travel.ts    # Travel and distance
│   ├── trading.ts   # Fort/trading mechanics
│   ├── weather.ts   # Weather system
│   └── health.ts    # Health and illness
├── content/         # Game content data
│   ├── events.json  # Event definitions
│   ├── locations.json # Location data
│   └── items.json   # Item definitions
├── ui/              # Presentation layer
│   ├── terminal/    # Terminal UI (Phase 1)
│   └── web/         # Web UI (Future)
└── index.ts         # Entry point
```

## Key Design Decisions

1. **TypeScript over Python**: Better type safety, runs in browser for future web UI
2. **Data-driven content**: Easy to modify game content without code changes
3. **State machine core**: Clean game flow management, supports save/load
4. **Event system**: Decoupled event handling for extensibility
