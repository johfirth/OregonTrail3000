---
applyTo: "src/**,electron/**"
---

# Development Instructions

When working on source code in the `src/` or `electron/` folders, follow these guidelines:

## Architecture Principles

- **Separation of concerns** — game logic (`src/engine/`), game systems (`src/systems/`), content (`src/content/`), UI (`src/ui/`), platform-specific (`electron/`, `src/platform/`)
- **Pure TypeScript engine** — ZERO DOM or Electron dependencies in `src/engine/` and `src/systems/`
- **Extensibility** — Electron desktop AND web browser from the same `src/` codebase
- **Data-driven** — game content in JSON files, not hardcoded
- **Testable** — all game logic unit-testable with Vitest, no UI needed
- **Platform abstraction** — save/load uses filesystem (desktop) or localStorage (web)

## Design-First Workflow

1. **Read the game design documents** in `game-design/` before implementing any feature
2. **Follow the design exactly** — if the design is unclear, ask for clarification rather than guessing
3. **Reference `game-design/game-mechanics-mission.md`** for specific numbers and balance

## Project Structure

```
electron/           # Electron main process (desktop only)
src/
├── engine/         # Core game engine (pure TS, no DOM)
├── systems/        # Game systems (pure TS)
├── content/        # JSON data files + schemas
├── ui/             # React components (shared Electron + web)
├── platform/       # Platform abstraction (save manager)
└── index.tsx       # App entry point
```

## Code Rules

- Use TypeScript strict mode
- Use modern ES2022+ features
- React functional components + hooks only (no class components)
- Prefer composition over inheritance
- No `any` types — use proper generics and union types
- All game content in JSON, validated against TypeScript types at load time

## Build & Test Commands

- `npm run dev` — Electron desktop (dev mode with HMR)
- `npm run dev:web` — Web browser (Vite dev server)
- `npm run build:desktop` — Package .exe/.dmg/.AppImage
- `npm run build:web` — Static web build for Docker
- `npm run test` — Run Vitest tests
- `npm run docker:build` — Build Docker container

## Testing

- Use Vitest for all tests
- Engine and systems tests: pure unit tests, no DOM required
- UI tests: React Testing Library
- Content tests: validate JSON against schemas
- Aim for 80%+ coverage on engine and systems

## Platform-Specific Code

- NEVER import Electron APIs in `src/` (except `src/platform/desktop.ts`)
- Use the platform abstraction layer for save/load
- The preload script in `electron/` bridges IPC for desktop features
- Check `import.meta.env.MODE` to detect Electron vs web at runtime
