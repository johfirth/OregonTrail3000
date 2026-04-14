---
applyTo: "src/**"
---

# Development Instructions

When working on source code in the `src/` folder, follow these guidelines:

## Architecture Principles

- **Separation of concerns** — keep game logic, data, and presentation in separate modules
- **Extensibility** — design for future UI/GUI layers (web, terminal, desktop)
- **Data-driven design** — game content (events, locations, items) should be defined in data files, not hardcoded
- **Testability** — all game logic should be unit-testable without UI dependencies

## Design-First Workflow

1. **Read the game design documents** in `game-design/` before implementing any feature
2. **Follow the design exactly** — if the design is unclear, ask for clarification rather than guessing
3. **Update implementation notes** in design documents if you discover constraints the designer should know about

## Code Style

- Use modern language features (ES2022+, Python 3.12+, etc.)
- Prefer composition over inheritance
- Use strong typing where available
- Write self-documenting code with minimal but meaningful comments

## Game Engine Architecture (Target)

```
src/
├── engine/          # Core game engine (state machine, event loop, turn management)
├── systems/         # Game systems (resources, combat, trading, travel, weather)
├── content/         # Game content data (events, locations, items, NPCs)
├── ui/              # Presentation layer (terminal UI first, web UI later)
└── utils/           # Shared utilities
```
