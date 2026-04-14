# Text Adventure Design Patterns

A reference guide for common design patterns in text-based adventure games. Use these patterns as building blocks when designing new games.

---

## 1. Core Loop Patterns

### Turn-Based Progression
The most common structure for text adventures. Each turn, the player:
1. **Observes** — see current state (location, resources, time)
2. **Decides** — choose an action from available options
3. **Resolves** — the game processes the action and generates outcomes
4. **Advances** — time/distance/state moves forward

**When to use**: Journey games, survival games, any game with discrete time steps.
**Example**: Oregon Trail — each turn is 2 weeks of travel.

### Hub-and-Spoke Exploration
The player has a central location (hub) and explores connected areas (spokes). Each spoke may have sub-locations, items, NPCs, or events.

**When to use**: Mystery games, dungeon crawlers, open-world exploration.
**Example**: Zork — the house and underground passages.

### Linear Narrative with Branches
A primarily linear story with decision points that create branches. Branches may reconverge or lead to different endings.

**When to use**: Story-driven games, visual novel-style adventures.
**Example**: Choose Your Own Adventure books, Twine games.

---

## 2. Resource Management Patterns

### Fixed Budget Allocation
Players start with a fixed budget and must allocate resources before the game begins. This creates meaningful trade-offs from the first decision.

**Key elements**:
- Total budget is fixed (zero-sum)
- Resources have interdependencies (food → health, ammo → hunting → food)
- No "correct" allocation — multiple viable strategies

### Consumable Resources
Resources that deplete through use or time. Creates tension and drives decision-making.

**Common consumable resources**:
- Food (consumed each turn, affects health)
- Ammunition (consumed in combat/hunting)
- Health/hit points (depleted by events, restored by items)
- Time (the ultimate non-renewable resource)
- Money (spent at trading posts/shops)

### Renewable Resources
Resources that can be replenished through player action (hunting, trading, crafting).

**Design consideration**: Renewable resources should have **costs** (time, other resources, risk) to prevent infinite loops.

---

## 3. Event System Patterns

### Weighted Random Events
Events drawn from a probability table. Each event has a weight determining its likelihood.

**Key design principles**:
- Weight events by impact: high-impact events should be rare
- Include at least one positive event to create hope
- Vary event types: resource loss, resource gain, story beats, skill challenges
- Some events should be contextual (only occur in specific locations or conditions)

### Contextual Events
Events that only trigger based on game state (location, resources, time, previous events).

**Examples**:
- Mountain events only in mountain zones
- Starvation warnings when food is low
- Cold weather events in winter months
- Foreshadowing events that set up later encounters

### Cascading Consequences
One event triggers or modifies future events. Creates emergent narrative.

**Examples**:
- An ox injury reduces speed for the rest of the game
- A stolen item forces the player to find a replacement
- Helping an NPC leads to them helping you later

---

## 4. Encounter Patterns

### Risk-Reward Encounters
The player must choose between a safe option and a risky option with higher potential reward.

**Key elements**:
- Clear presentation of risk level
- Reward proportional to risk
- Occasional subversion (safe option backfires, risky option pays off)

### Skill Challenges
Encounters that test player skill (typing speed, memory, pattern recognition) rather than strategic choice.

**Design considerations**:
- Provide difficulty scaling based on player-declared skill level
- Allow graceful failure (partial success, not just pass/fail)
- Don't overuse — skill challenges should punctuate, not dominate

### NPC Interactions
Encounters with non-player characters. Can be trading, dialogue, quests, or combat.

**NPC types**:
- **Merchants** — buy/sell resources, provide market information
- **Guides** — offer route advice, weather warnings, local knowledge
- **Travelers** — share stories, provide quests, trade rumors
- **Antagonists** — bandits, hostile forces, rival parties
- **Helpers** — rescue the player, share resources, provide services

---

## 5. Difficulty Patterns

### Escalating Difficulty
The game gets progressively harder. This maintains challenge as players gain experience.

**Techniques**:
- Increase event severity over time
- Introduce new event types in later stages
- Reduce resource availability
- Add environmental hazards (mountains, winter weather)

### Feast-or-Famine Pacing
Alternating periods of abundance and scarcity. Creates emotional rhythm.

**Example**: Easy early game → challenging middle → desperate final stretch → triumph at arrival.

### Difficulty Through Depletion
Resources naturally deplete faster than they can be replenished. The game is a race against entropy.

**Key balance point**: The game should be winnable with good strategy but feel tight. Players should arrive at the destination with depleted but non-zero resources.

---

## 6. Narrative Patterns

### Journey Narrative
The story IS the journey. Progression is measured in distance/time, not plot points.

**Key elements**:
- Named landmarks as milestones
- Changing environments (plains → rivers → mountains → valleys)
- Seasonal progression
- Historical/geographical grounding

### Diary/Log Format
The game presents as a diary or log entry. Each turn adds a new entry.

**Benefits**: Creates a persistent narrative record, encourages roleplay, provides natural save points.

### Procedural Storytelling
The narrative emerges from the combination of random events, player choices, and game state.

**Design goal**: No two playthroughs should feel the same, but all should feel coherent and meaningful.

---

## 7. Failure & Death Patterns

### Memorable Death
Death is presented in a memorable, sometimes humorous way. Encourages replaying rather than frustration.

**Examples**:
- Oregon Trail's funeral sequence
- "You have died of dysentery"
- Epitaph generation

### Gradual Decline
Rather than sudden death, the player's situation deteriorates gradually. They can see the end coming and try to prevent it.

**Warning signs**: Low food warnings, injury notifications, weather alerts.

### Multiple Failure Modes
Different ways to fail based on which resource runs out first. Creates variety in failure and teaches different strategies.

**Common failure modes**: Starvation, exposure, combat death, illness, time running out.

---

## 8. Replayability Patterns

### Randomized Events
Each playthrough encounters different events in different orders.

### Multiple Viable Strategies
No single "correct" approach. Supports different play styles:
- **Cautious**: Heavy provisioning, avoid risks
- **Aggressive**: Light packing, hunt frequently, take risks
- **Social**: Trade heavily, interact with NPCs
- **Speed**: Maximize travel, minimize stops

### Unlockable Content
Content that only appears after certain conditions are met across playthroughs.

### Scoring System
A numerical score that encourages optimization and replayability.

---

## 9. User Interface Patterns (Text-Based)

### Status Display
Show current game state at the start of each turn. Keep it compact but complete.

```
=== Day 45 | Mile 892 / 2040 ===
Food: 234    Ammo: 350    Clothing: $45    Supplies: $22    Cash: $120
Health: Good    Weather: Clear    Terrain: Plains
```

### Choice Menus
Present numbered options for player input. Always include what each option costs.

```
What would you like to do?
  (1) Continue on the trail
  (2) Hunt for food (-1 day, requires 40+ bullets)
  (3) Rest and recover (-1 day, heals minor ailments)
  (4) Check supplies
```

### Event Narration
Describe events in second person, present tense for immediacy.

```
A rider approaches from the east. They appear to be friendly,
waving a white cloth. But something about their posture
seems tense...

What do you do?
  (1) Wave them over
  (2) Keep your distance
  (3) Ready your rifle
```

### Progress Visualization (ASCII)
Use simple ASCII art to show journey progress.

```
Independence ====>========|=================> Oregon City
                          ^
                     You are here (Mile 892)
```

---

## 10. Modern Enhancements for Classic Patterns

### Save/Load System
Classic text adventures had no saves. Modern versions should support:
- Auto-save at each turn
- Manual save slots
- Ironman mode (no saves) as an option

### Accessibility
- Screen reader compatibility
- Adjustable text speed
- Color-blind friendly status indicators
- Difficulty options (easy/normal/hard/ironman)

### Analytics-Friendly Design
Design events and choices to generate interesting data:
- What percentage of players survived?
- Most common cause of death?
- Average journey length?
- Most popular strategies?

### Extensibility
Design systems to be data-driven for easy modding:
- Events defined in data files (JSON/YAML), not hardcoded
- Locations loaded from content files
- Item/resource definitions externalized
- Plugin system for custom events/encounters
