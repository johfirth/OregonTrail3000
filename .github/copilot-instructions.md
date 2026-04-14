# Repository-Wide Copilot Instructions — Artemis Trail

## Project Overview

Artemis Trail is an Oregon Trail-style text-based adventure game set as a NASA Artemis lunar mission. Built with TypeScript, React, and Electron, it runs as both an installable desktop app (.exe/.dmg/.AppImage) and a containerized web app (Docker/nginx).

**Tech Stack**: TypeScript, React 19, electron-vite, electron-builder, Playwright, Vitest, Docker

## Agent Delegation Model

**CRITICAL: Always delegate work to specialized agents instead of doing it yourself or using general-purpose agents.**

This project uses 10 specialized agents. When a task comes in, identify which agent(s) should handle it and delegate to them. Each agent has specific ownership, tools, and expertise.

### Agent Roster

| Agent | File | Owns | Specialty |
|---|---|---|---|
| **Game Designer** | `game-designer.agent.md` | `game-design/` | Game design documents (.md only, never code) |
| **Engine Developer** | `game-engine-dev.agent.md` | `src/engine/` | State machine, turns, events, save/load, RNG |
| **Systems Developer** | `game-systems-dev.agent.md` | `src/systems/` | Resources, health, EVA, trading, landing, weather, scoring |
| **Content Developer** | `game-content-dev.agent.md` | `src/content/` | JSON/TS content data, schemas, validation |
| **UI Developer** | `game-ui-dev.agent.md` | `src/ui/` | React components, screens, hooks, styling |
| **Infra Developer** | `game-infra-dev.agent.md` | `electron/`, configs | Electron, Vite, Docker, CI/CD, build pipeline |
| **QA: Gameplay** | `qa-gameplay.agent.md` | `tests/e2e/gameplay*` | Full game loop testing, win/loss paths |
| **QA: Events** | `qa-events.agent.md` | `tests/e2e/events*` | Event system testing, choices, chains |
| **QA: UI** | `qa-ui.agent.md` | `tests/e2e/ui*` | Screen rendering, navigation, styling |
| **QA: Edge Cases** | `qa-edge-cases.agent.md` | `tests/e2e/edge*` | Save/load, boundaries, state consistency |

### Delegation Rules

1. **Never use general-purpose agents when a specialized agent exists** — delegate to the right agent
2. **Parallelize independent work** — if a task touches engine + UI, dispatch both agents simultaneously
3. **Respect ownership boundaries** — Engine Dev doesn't touch `src/ui/`, UI Dev doesn't touch `src/engine/`
4. **QA agents use Playwright MCP** — they have live browser automation via the Playwright MCP server
5. **Game Designer writes only .md files** — never code, never tests
6. **Chain dependencies** — if UI depends on engine changes, dispatch Engine Dev first, then UI Dev

### When to Use Which Agent

| Task | Agent(s) |
|---|---|
| "Add a new event" | Content Dev (data) + Engine Dev (if new mechanics) |
| "Fix a UI bug" | UI Dev |
| "Change resource balance" | Content Dev (constants) or Engine Dev (formulas) |
| "Add a new screen" | UI Dev |
| "Fix build/deploy" | Infra Dev |
| "Test the game" | QA agents (all 4 in parallel) |
| "Design a new feature" | Game Designer → then Dev agents to implement |
| "Update difficulty" | Engine Dev (types.ts constants) |

## MCP Server Configuration

The project uses the Playwright MCP server for browser automation in QA testing.

**Config location**: `.vscode/mcp.json`

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "type": "stdio"
    }
  }
}
```

### QA Testing Workflow

1. Start the game: `npm run dev:web` (Vite dev server on localhost:5173)
   — OR — `docker run -p 8080:80 artemis-trail` (Docker container)
2. QA agents connect via Playwright MCP to automate browser testing
3. E2E tests live in `tests/e2e/` and run with `npx playwright test`
4. Tests validate: title screen → mission prep → launch → transit → gateway → landing → surface → colony/defeat

## Project Structure

```
.github/
├── agents/              # 10 specialized agent definitions
├── instructions/        # Scoped instructions (game-design, development)
├── references/          # Oregon Trail source, design patterns
└── copilot-instructions.md  # THIS FILE — repo-wide rules

electron/                # Electron desktop shell (main.ts, preload.ts)
src/
├── engine/              # Pure TS game engine (no DOM/Electron deps)
├── systems/             # 7 game systems
├── content/             # Game content data (events, crew, narrative)
├── ui/                  # React UI (works in Electron + browser)
└── platform/            # Platform abstraction (save manager)

tests/e2e/               # Playwright E2E tests
game-design/             # Game design documents (shared collaboration folder)
docs/                    # Architecture documentation
```

## Key Conventions

### Code
- TypeScript strict mode throughout
- Game engine is pure TS — ZERO DOM or Electron dependencies
- React functional components + hooks only
- All game content in TypeScript data files (type-safe)
- Platform-specific code isolated in `electron/` and `src/platform/`

### Game Design
- All design docs are `.md` files in `game-design/`
- Design docs are the single source of truth for game mechanics
- Development agents read from `game-design/` before implementing

### Testing
- Unit tests: Vitest (`npm test`)
- E2E tests: Playwright (`npx playwright test`)
- QA agents use Playwright MCP for live browser automation
- Test before committing — `npx tsc --noEmit && npm test && npx playwright test`

### Building & Deploying
- Web: `npm run build:web` → `docker build -t artemis-trail .` → `docker run -p 8080:80 artemis-trail`
- Desktop: `npm run build:desktop` → installers in `dist/desktop/`
- Dev: `npm run dev:web` (browser) or `npm run dev` (Electron)

### Build Checklist (ALWAYS do ALL of these after code changes)
1. `npx tsc --noEmit` — verify TypeScript compiles
2. `npm run build:web` — rebuild web static files
3. `docker stop artemis-trail && docker rm artemis-trail` — remove old container
4. `docker build -t artemis-trail .` — rebuild Docker image
5. `docker run -d -p 8080:80 --name artemis-trail artemis-trail` — start new container
6. `npx electron-vite build` — rebuild Electron renderer
7. Remove old Electron build: `Remove-Item -Recurse -Force dist/desktop -ErrorAction SilentlyContinue`
8. Build new Electron exe: `$env:CSC_IDENTITY_AUTO_DISCOVERY="false"; npx electron-builder --win portable --config electron-builder.yml --config.win.signAndEditExecutable=false`
9. `npx playwright test --project=headed` — run E2E tests against Docker container

## Communication Between Agents

- `game-design/` is the shared collaboration folder — designers write, developers read
- `src/engine/types.ts` is the contract file — all agents reference it for types
- Agents should generate narrative entries for every significant game action
- When updating types, ALL dependent agents must be notified
