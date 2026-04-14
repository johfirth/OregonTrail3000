# Oregon Trail — Game Mechanics Analysis

An annotated analysis of the original Oregon Trail BASIC source code (1978, Creative Computing magazine) by Don Rawitsch, Bill Heinemann, and Paul Dillenberger. This document breaks down every game system for use as reference material in designing modern text-based adventure games.

## Source

- **Original**: BASIC 3.1 for CDC Cyber 70/73-26 mainframe
- **Published**: Creative Computing magazine, May–June 1978
- **Authors**: Bill Heinemann (programming), Don Rawitsch (research/narrative), Paul Dillenberger (programming)
- **License**: Public domain (published in magazine without restrictive license)

---

## 1. Starting Conditions & Resource Model

### Initial Budget
- Player starts with **$900 total**
- **$200 is pre-spent** on the wagon → **$700 available** for purchases

### Resources (Variables)
| Resource | Variable | Starting Range | Purpose |
|----------|----------|---------------|---------|
| Oxen | `A` | $200–$300 | Speed/travel distance per turn |
| Food | `F` | $0+ | Survival; eating options affect health |
| Ammunition | `B` | $0+ (×50 bullets per $1) | Hunting, combat with riders/bandits/animals |
| Clothing | `C` | $0+ | Cold weather protection (mountains) |
| Misc. Supplies | `M1` | $0+ | Medicine, repairs — prevents death from illness |
| Cash | `T` | $0–$700 remaining | Purchasing at forts (2/3 value) |

### Key Design Insight
The budget allocation is a **zero-sum strategic decision** — spending more on oxen means faster travel but less food/ammo. This creates meaningful trade-offs from the very first interaction.

---

## 2. Turn Structure

Each turn represents **2 weeks** of travel. The sequence is:

1. **Status display** — show mileage, resources
2. **Doctor's bill** — $20 if injured or ill (auto-deducted)
3. **Action choice**:
   - At fort turns: (1) Stop at fort, (2) Hunt, (3) Continue
   - Non-fort turns: (1) Hunt, (2) Continue
4. **Eating choice** — (1) Poorly, (2) Moderately, (3) Well
5. **Travel distance** — calculated from oxen quality + randomness
6. **Random events** — one event per turn from a weighted table
7. **Mountain check** — if past mile 950, mountain hazards apply
8. **Illness check** — based on eating quality and conditions

### Travel Distance Formula
```
distance = 200 + (oxen_spent - 220) / 5 + random(0-10)
```

Spending the max $300 on oxen gives: `200 + 16 + rand` ≈ 216–226 miles/turn.
Spending the min $200 gives: `200 - 4 + rand` ≈ 196–206 miles/turn.

**Design insight**: The difference is subtle (~20 miles/turn) — about 1 extra turn over the full journey. This rewards min-maxers without punishing casual players.

---

## 3. Fort Trading System

- Forts appear on **alternating turns** (flag `X1` toggles)
- Items at forts cost **50% more** (player gets 2/3 value per dollar)
- Fort stops cost **45 miles** of progress (penalty for stopping)
- Players can buy food, ammo, clothing, or misc. supplies

**Design insight**: Forts create a **risk-reward tradeoff** — you lose progress but can resupply. Players who over-provision at the start waste money; players who under-provision must stop at forts and lose time.

---

## 4. Hunting System

### Shooting Mechanic
- Player is shown a random word: "BANG", "BLAM", "POW", or "WHAM"
- Player must type it as fast as possible
- Response time (in seconds) determines outcome
- Player's self-declared skill level (1–5) adjusts the difficulty

### Hunting Outcomes
| Response Time | Result | Food Gained | Ammo Used |
|--------------|--------|-------------|-----------|
| ≤ 1 second | "Right between the eyes!" | 52 + random(0-6) | 10 + random(0-4) |
| Fast enough | "Nice shot—good eatin'!" | 48 - 2×time | 10 + 3×time |
| Too slow | "You missed—dinner got away" | 0 | 0 |

- Hunting costs **45 miles** of progress
- Requires **40+ bullets** to attempt

**Design insight**: The typing mechanic was innovative for 1971 — it introduced a **real-time skill element** into a turn-based game. The skill level self-assessment adds a meta-game of honesty.

---

## 5. Rider/Bandit Encounters

### Encounter Generation
- Probability is distance-based: `RND * 10 * ((mile/100 - 4)² + 72) / ((mile/100 - 4)² + 12)`
- Riders appear more frequently in the middle of the journey

### Hostility
- 80% chance riders are hostile, 20% friendly
- But there's a 20% chance the hostility indicator is **wrong** (deception!)

### Tactics
| Tactic | If Hostile | If Friendly |
|--------|-----------|-------------|
| (1) Run | Lose supplies, ammo, oxen quality; gain 20 miles | Lose less; gain 15 miles |
| (2) Attack | Shooting mechanic; may get knifed | Lose some supplies/ammo |
| (3) Continue | 80% chance of fight | Nothing happens |
| (4) Circle wagons | Shooting mechanic; lose 25 miles | Lose 20 miles |

**Design insight**: The deception mechanic (hostility indicator can be wrong) creates genuine **uncertainty and tension**. Players can't simply trust what they see — a brilliant design choice that mirrors real frontier uncertainty.

---

## 6. Random Event System

The game uses a **weighted random table** with 16 possible events:

| Event | Probability | Effect |
|-------|------------|--------|
| Wagon breakdown | 6% | Lose time, supplies |
| Ox leg injury | 5% | Permanent speed reduction |
| Daughter breaks arm | 2% | Lose time, supplies |
| Ox wanders off | 2% | Lose time |
| Son gets lost | 2% | Lose time |
| Unsafe water | 5% | Lose time |
| Heavy rains (or cold weather past mile 950) | 10% | Lose food, ammo, supplies, time |
| Bandits attack | 3% | Shooting mechanic; lose ammo, supplies, oxen |
| Fire in wagon | 2% | Lose food, ammo, supplies, time |
| Heavy fog | 5% | Lose time |
| Poisonous snake | 2% | Lose ammo, supplies; die if no medicine |
| Wagon swamped at river | 10% | Lose food, clothing, time |
| Wild animals attack | 10% | Shooting mechanic; lose food, clothing, ammo |
| Hail storm | 5% | Lose time, ammo, supplies |
| Illness (eating-dependent) | 26% | Severity based on eating quality |
| Helpful Indians | 5% | Gain food (+14) |

**Design insight**: Events are **not equally likely** — illness dominates at 26%, making food/eating strategy crucial. The helpful event (Indians sharing food) is the only positive random outcome, creating a primarily hostile world where survival feels earned.

---

## 7. Illness & Death System

### Illness Probability
- Based on **eating quality** and **clothing** (in cold weather)
- Eating poorly dramatically increases illness risk
- Three severity levels: mild, bad, serious

### Death Conditions
1. **Starvation** — food reaches 0
2. **No medicine for snakebite** — misc. supplies < 0 after snake event
3. **Massacred by riders** — ammo runs out during combat
4. **Pneumonia** — illness without medicine (not injury-related)
5. **Injuries** — injury flag set + can't afford doctor or no medicine
6. **Blizzard** — too long on the trail (turn 20+)

### Death Sequence (Memorable!)
When the player dies, the game asks:
1. "Would you like a minister?"
2. "Would you like a fancy funeral?"
3. "Would you like us to inform your next of kin?"
   - If NO: "But your Aunt Sadie in St. Louis is really worried about you"
   - If YES: "That will be $4.50 for the telegraph charge"

**Design insight**: The death sequence is **darkly humorous** — a masterful tonal choice that softens the sting of failure and encourages replaying. It's still quoted and meme'd 50+ years later.

---

## 8. Mountain Passage (Mile 950+)

### South Pass (first crossing)
- 80% chance of passing safely ("no snow")
- 20% chance of blizzard

### Blue Mountains (mile 1700+)
- 70% chance of passing safely
- 30% chance of blizzard

### Mountain Events
- Getting lost (10% chance) — lose 60 miles
- Wagon damage (11% chance) — lose supplies, ammo, time
- Slow going (remaining) — lose 45 + random(0-50) miles

**Design insight**: Mountains serve as a **difficulty spike** in the final third. The game gets harder as you approach the goal — classic tension building.

---

## 9. Victory Condition

- Reach **2040 miles** (Oregon City)
- Final turn is prorated based on remaining distance
- Victory message includes:
  - Exact arrival date (day of week + calendar date)
  - Final resource inventory
  - Congratulations from President James K. Polk

---

## 10. Key Design Patterns for Modern Adaptation

1. **Zero-sum resource allocation** — budget constraints force meaningful initial choices
2. **Risk-reward travel decisions** — speed vs. safety at every turn
3. **Weighted random events** — not pure randomness; frequency tuned for game feel
4. **Deception mechanics** — hostility indicators can lie
5. **Escalating difficulty** — mountains create a final challenge
6. **Dark humor in failure** — death is memorable, not punishing
7. **Real-time skill injection** — the shooting mechanic breaks up turn-based pacing
8. **Historical grounding** — real dates, real geography, real challenges
9. **Resource interdependence** — food affects health, ammo enables hunting for food, clothing affects mountain survival
10. **Emergent narrative** — no two playthroughs are identical due to event randomization
