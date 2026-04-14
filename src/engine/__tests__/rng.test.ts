import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';

describe('Seeded RNG', () => {
  it('produces deterministic results with same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const seq1 = Array.from({ length: 20 }, () => rng1.next());
    const seq2 = Array.from({ length: 20 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different results with different seeds', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(999);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = createRng(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt returns values within range (inclusive)', () => {
    const rng = createRng(456);
    const results = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const v = rng.nextInt(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      results.add(v);
    }
    // Should hit all values in range over 500 iterations
    expect(results.size).toBe(5);
  });

  it('nextInt handles single-value range', () => {
    const rng = createRng(789);
    for (let i = 0; i < 10; i++) {
      expect(rng.nextInt(5, 5)).toBe(5);
    }
  });

  it('chance(1.0) always returns true', () => {
    const rng = createRng(100);
    for (let i = 0; i < 100; i++) {
      expect(rng.chance(1.0)).toBe(true);
    }
  });

  it('chance(0) always returns false', () => {
    const rng = createRng(200);
    for (let i = 0; i < 100; i++) {
      expect(rng.chance(0)).toBe(false);
    }
  });

  it('chance(0.5) returns mix of true and false', () => {
    const rng = createRng(300);
    let trueCount = 0;
    const total = 1000;
    for (let i = 0; i < total; i++) {
      if (rng.chance(0.5)) trueCount++;
    }
    // Should be roughly 50% — allow wide margin
    expect(trueCount).toBeGreaterThan(300);
    expect(trueCount).toBeLessThan(700);
  });

  it('getSeed returns the original seed', () => {
    const rng = createRng(42);
    expect(rng.getSeed()).toBe(42);
    rng.next();
    rng.next();
    expect(rng.getSeed()).toBe(42);
  });
});
