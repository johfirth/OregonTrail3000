# Repository-Wide Copilot Instructions — OregonTrail3000

## Project Overview

OregonTrail3000 is a modern text-based adventure game framework inspired by the original Oregon Trail (1971/1978). The project uses a collaborative agentic workflow where specialized agents handle different aspects of the project.

## Agent Collaboration Model

- **Game Design agents** produce `.md` files in the `game-design/` folder
- **Development agents** read from `game-design/` and implement in `src/`
- **All design documents live in `game-design/`** — this is the single source of truth for game design

## Key Conventions

### Game Design Documents
- All game design documents are Markdown (`.md`) files stored in `game-design/`
- Use the templates in `game-design/templates/` as starting points
- Design documents should be self-contained and readable without code context
- Cross-reference other design documents using relative links

### Code (Future Development)
- Source code goes in `src/`
- Use modern TypeScript/Python patterns designed for extensibility
- Architecture should support future UI/GUI layers (web, terminal, desktop)
- Keep game logic separate from presentation layer

### Reference Material
- The `.github/references/` folder contains historical reference material
- The original Oregon Trail BASIC source (1978) is included for study
- Reference material informs design but does not constrain it

## Communication Between Agents

- The `game-design/` folder is the primary communication channel between design and development agents
- Design agents write documents; development agents read them
- If a design document is unclear or incomplete, development agents should request clarification rather than making assumptions
