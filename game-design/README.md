# Game Design — Shared Workspace

This folder is the **shared collaboration space** for all agents working on OregonTrail3000. Game design documents created here are the single source of truth for the game's design.

## Who Uses This Folder

| Agent | Access | Purpose |
|-------|--------|---------|
| **Game Designer** | Read/Write | Creates and updates all design documents |
| **Development Agents** | Read | Reads designs to implement game features |
| **QA/Test Agents** | Read | Reads designs to create test cases |
| **All Agents** | Read | Reviews designs for consistency and completeness |

## Folder Structure

```
game-design/
├── README.md              ← You are here
├── templates/             ← Design document templates (start new docs from these)
│   ├── world-design.md
│   ├── character-design.md
│   ├── event-system.md
│   ├── game-mechanics.md
│   └── narrative-outline.md
└── [design documents]     ← Actual game design documents go here
```

## How to Use

1. **Creating a new design document**: Copy the relevant template from `templates/` and fill it in
2. **Naming convention**: Use kebab-case descriptive names, e.g., `oregon-trail-3000-world-design.md`
3. **Cross-references**: Link to other design documents using relative paths, e.g., `[resource model](./game-mechanics-resources.md)`
4. **Updates**: When updating a document, add a changelog entry at the top noting what changed and why

## Design Document Status

Design documents should include a status in their header:

- **Draft** — work in progress, not ready for implementation
- **Review** — complete draft, ready for feedback
- **Approved** — finalized, ready for implementation
- **Superseded** — replaced by a newer version (link to replacement)
