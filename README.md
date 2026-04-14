# OregonTrail3000

A modern text-based adventure game framework inspired by the original Oregon Trail (1971/1978). This project uses GitHub Copilot's agentic development infrastructure to collaboratively design and build text-based adventure games.

## Project Structure

```
.github/           → Copilot agentic development infrastructure
  agents/          → Custom AI agent definitions
  instructions/    → Scoped instructions for different workstreams
  references/      → Reference material (Oregon Trail source, design patterns)
game-design/       → Shared game design documents (all agents read/write here)
  templates/       → Design document templates
src/               → Game source code (future development)
docs/              → Project documentation
```

## Agents

- **Game Designer** (`@game-designer`) — Specialized in text-based adventure game design. Outputs only `.md` design documents covering world-building, characters, events, mechanics, and narrative.

## Getting Started

1. Review the game design documents in `game-design/`
2. Use the Game Designer agent to create new design documents
3. Development agents can read from `game-design/` to implement the designs

## Reference Material

The original Oregon Trail BASIC source code (1978, Creative Computing magazine) is included in `.github/references/` as public domain reference material. An annotated analysis of its game mechanics is also provided.

## History

The Oregon Trail was originally created in 1971 by Don Rawitsch, Bill Heinemann, and Paul Dillenberger — three student teachers at Carleton College in Minnesota. The full BASIC source was published in the May–June 1978 issue of Creative Computing magazine.

## License

TBD
