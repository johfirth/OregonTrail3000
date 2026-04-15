# Repository-Wide Copilot Instructions — Artemis Trail

## Project Overview

Artemis Trail is an Oregon Trail-style text-based adventure game set as a NASA Artemis lunar mission. Built with TypeScript, React, and Electron, it runs as both an installable desktop app (.exe/.dmg/.AppImage) and a containerized web app (Docker/nginx).

**Tech Stack**: TypeScript, React 19, electron-vite, electron-builder, Playwright, Vitest, Docker

## Agent Delegation Model

**CRITICAL: Always delegate work to specialized agents instead of doing it yourself or using general-purpose agents.**

This project uses 15 specialized agents. When a task comes in, identify which agent(s) should handle it and delegate to them. Each agent has specific ownership, tools, and expertise.

### Agent Roster

| Agent | File | Owns | Specialty |
|---|---|---|---|
| **Game Designer** | `game-designer.agent.md` | `game-design/` | Game design documents (.md only, never code) |
| **Engine Developer** | `game-engine-dev.agent.md` | `src/engine/` | State machine, turns, events, save/load, RNG |
| **Systems Developer** | `game-systems-dev.agent.md` | `src/systems/` | Resources, health, EVA, trading, landing, weather, scoring |
| **Content Developer** | `game-content-dev.agent.md` | `src/content/` | JSON/TS content data, schemas, validation |
| **UI Developer** | `game-ui-dev.agent.md` | `src/ui/` | React components, screens, hooks, styling |
| **Infra Developer** | `game-infra-dev.agent.md` | `electron/`, configs | Electron, Vite, Docker, CI/CD, build pipeline |
| **Security Developer** | `security-dev.agent.md` | Security-related files | Security fixes only — never changes gameplay |
| **QA: Gameplay** | `qa-gameplay.agent.md` | `tests/e2e/gameplay*` | Full game loop testing, win/loss paths |
| **QA: Events** | `qa-events.agent.md` | `tests/e2e/events*` | Event system testing, choices, chains |
| **QA: UI** | `qa-ui.agent.md` | `tests/e2e/ui*` | Screen rendering, navigation, styling |
| **QA: Edge Cases** | `qa-edge-cases.agent.md` | `tests/e2e/edge*` | Save/load, boundaries, state consistency |
| **QA: Accessibility** | `qa-accessibility.agent.md` | `tests/e2e/accessibility*` | WCAG 2.1 compliance, axe-core audits |
| **QA: Security** | `qa-security.agent.md` | `tests/e2e/security*` | XSS, injection, CSP, Electron security |
| **QA: UX** | `qa-ux.agent.md` | `tests/e2e/ux-review*` | Menu flow, discoverability, UX friction |
| **PR Reviewer** | `qa-pr-reviewer.agent.md` | Pull requests | Code review, test verification, merge approval |

### Agent Skills & Tools Reference

#### Development Agents
| Agent | Primary Skills | Tools | When to Use |
|---|---|---|---|
| Engine Dev | TypeScript, state machines, game logic | terminal, git, npm, code-search | Core engine changes, new commands, state modifications |
| Systems Dev | Game systems, balance tuning | terminal, git, npm, code-search | Resource/health/EVA/trading/landing/weather/scoring changes |
| Content Dev | Data modeling, JSON schemas | terminal, git, code-search | Event data, crew data, narrative text changes |
| UI Dev | React, CSS, accessibility, Playwright | terminal, git, npm, playwright | Screen components, styling, keyboard nav, theme changes |
| Infra Dev | Docker, Electron, CI/CD, nginx | terminal, git, npm, docker | Build pipeline, deployment, packaging, config |
| Security Dev | OWASP, CSP, input validation | terminal, git, npm, code-search | Security-only fixes, never gameplay |

#### QA Agents
| Agent | Testing Specialty | Tools | Test Files |
|---|---|---|---|
| QA Gameplay | Full game loop, win/loss paths | playwright, docker | tests/e2e/gameplay*, full-playthrough* |
| QA Events | Event triggers, choices, chains | playwright, docker | tests/e2e/events* |
| QA UI | Rendering, navigation, themes | playwright, docker | tests/e2e/ui*, retro-theme* |
| QA Edge Cases | Save/load, boundaries, RNG | playwright, docker | tests/e2e/edge-cases* |
| QA Accessibility | WCAG 2.1, axe-core, contrast | playwright, axe-core, docker | tests/e2e/accessibility* |
| QA Security | XSS, injection, Electron | playwright, docker | tests/e2e/security* |
| QA UX | Menus, flow, discoverability | playwright, docker | tests/e2e/ux-review* |

#### Review Agents
| Agent | Review Type | Scope |
|---|---|---|
| PR Reviewer | Code review, test verification | Pull requests before merge |
| Game Designer | Game design documents | game-design/ folder only, .md files only |

### Subagent Delegation — MANDATORY

**⚠️ CRITICAL: ALWAYS use specialized agents. NEVER use general-purpose agents when a specialized agent exists.**

#### Delegation Decision Tree
1. Is this a game design task? → **Game Designer** agent
2. Is this an engine/state change? → **Engine Dev** agent
3. Is this a UI/screen change? → **UI Dev** agent
4. Is this a build/deploy issue? → **Infra Dev** agent
5. Is this a security fix? → **Security Dev** agent
6. Is this testing? → Use the appropriate **QA agent** (Gameplay/Events/UI/Edge Cases/A11y/Security/UX)
7. Is this a code review? → **PR Reviewer** agent
8. Does it touch multiple areas? → Dispatch MULTIPLE specialized agents in parallel
9. Is it truly novel and doesn't fit any agent? → Only THEN use general-purpose

#### Fleet Patterns
- **Testing sprint**: Dispatch all 7 QA agents in parallel, each testing their specialty
- **Bug fix cycle**: QA agent finds bug → files issue → Dev agent fixes → QA re-tests
- **Feature work**: Designer creates doc → Dev agents implement → QA agents test → PR Reviewer merges

### Delegation Rules

1. **Never use general-purpose agents when a specialized agent exists** — delegate to the right agent
2. **Parallelize independent work** — if a task touches engine + UI, dispatch both agents simultaneously
3. **Respect ownership boundaries** — Engine Dev doesn't touch `src/ui/`, UI Dev doesn't touch `src/engine/`
4. **QA agents use Playwright MCP** — they have live browser automation via the Playwright MCP server
5. **Game Designer writes only .md files** — never code, never tests
6. **Security Developer fixes vulnerabilities only** — never changes gameplay, mechanics, or content
7. **Chain dependencies** — if UI depends on engine changes, dispatch Engine Dev first, then UI Dev
8. **PR Reviewer reviews all PRs** — add review comment with test results before merging
9. **File GitHub issues for all bugs** — QA agents file with details, Dev agents comment with fix details

### When to Use Which Agent

| Task | Agent(s) |
|---|---|
| "Add a new event" | Content Dev (data) + Engine Dev (if new mechanics) |
| "Fix a UI bug" | UI Dev |
| "Change resource balance" | Content Dev (constants) or Engine Dev (formulas) |
| "Add a new screen" | UI Dev |
| "Fix build/deploy" | Infra Dev |
| "Test the game" | QA agents (all 7 in parallel) |
| "Design a new feature" | Game Designer → then Dev agents to implement |
| "Update difficulty" | Engine Dev (types.ts constants) |
| "Fix a security issue" | Security Dev |
| "Accessibility audit" | QA: Accessibility → then UI Dev or Security Dev to fix |
| "Security audit" | QA: Security → then Security Dev to fix |
| "Review a PR" | PR Reviewer |

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
4. Test suites: gameplay, accessibility (axe-core), keyboard navigation, security (XSS/injection), UI rendering
5. Electron tests: `npx playwright test --project=electron`

## Project Structure

```
.github/
├── agents/              # 15 specialized agent definitions
├── instructions/        # Scoped instructions (game-design, development)
├── references/          # Oregon Trail source, design patterns
└── copilot-instructions.md  # THIS FILE — repo-wide rules

electron/                # Electron desktop shell (main.ts, preload.ts)
nginx.conf               # Security-hardened nginx config (CSP, security headers)
Dockerfile               # Non-root nginx container
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

### Build Checklist — MANDATORY after ANY code change

**⚠️ CRITICAL: You MUST rebuild ALL targets after ANY code change, bug fix, or test fix. The game runs from built artifacts (dist/web for Docker, out/ for Electron, dist/desktop for exe). If you change source code but don't rebuild, users will see the OLD version. NEVER skip this step.**

Run these commands in order after every code change:
1. `npx tsc --noEmit` — verify TypeScript compiles
2. `npm run build:web` — rebuild web static files
3. `docker stop artemis-trail; docker rm artemis-trail` — remove old container
4. `docker build -t artemis-trail .` — rebuild Docker image
5. `docker run -d -p 8080:80 --name artemis-trail artemis-trail` — start new container
6. `npx electron-vite build` — rebuild Electron renderer
7. Remove old Electron build: `Remove-Item -Recurse -Force dist/desktop -ErrorAction SilentlyContinue`
8. `npm rebuild app-builder-bin` — ensure builder binary is fresh
9. `$env:CSC_IDENTITY_AUTO_DISCOVERY="false"; npx electron-builder --win dir --config electron-builder.yml --config.win.signAndEditExecutable=false` — build Electron exe
10. `npx vitest run` — run unit tests (187 tests)
11. `npx playwright test --project=headed` — run E2E tests against Docker
12. `npx playwright test --project=electron` — run Electron tests
13. `git add . && git commit && git push origin master` — push to GitHub

**If you skip rebuilding, the deployed game will NOT reflect your code changes.**

## Communication Between Agents

- `game-design/` is the shared collaboration folder — designers write, developers read
- `src/engine/types.ts` is the contract file — all agents reference it for types
- Agents should generate narrative entries for every significant game action
- When updating types, ALL dependent agents must be notified
