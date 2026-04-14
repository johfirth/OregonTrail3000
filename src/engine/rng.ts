// Seeded Random Number Generator — deterministic PRNG (mulberry32)

export interface Rng {
  next(): number;
  nextInt(min: number, max: number): number;
  chance(probability: number): boolean;
  getSeed(): number;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number): Rng {
  const raw = mulberry32(seed);

  return {
    next(): number {
      return raw();
    },

    nextInt(min: number, max: number): number {
      return Math.floor(raw() * (max - min + 1)) + min;
    },

    chance(probability: number): boolean {
      return raw() < probability;
    },

    getSeed(): number {
      return seed;
    },
  };
}
