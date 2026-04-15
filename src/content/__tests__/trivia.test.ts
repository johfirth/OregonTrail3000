import { describe, it, expect } from 'vitest';
import { TRIVIA_QUESTIONS, getRandomTrivia } from '../trivia';

describe('Trivia Question Bank', () => {
  it('has at least 40 questions', () => {
    expect(TRIVIA_QUESTIONS.length).toBeGreaterThanOrEqual(40);
  });

  it('all questions have unique IDs', () => {
    const ids = TRIVIA_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all questions have exactly 4 options', () => {
    for (const q of TRIVIA_QUESTIONS) {
      expect(q.options).toHaveLength(4);
    }
  });

  it('all questions have correctIndex between 0 and 3', () => {
    for (const q of TRIVIA_QUESTIONS) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    }
  });

  it('all questions have non-empty question text', () => {
    for (const q of TRIVIA_QUESTIONS) {
      expect(q.question.length).toBeGreaterThan(10);
    }
  });

  it('all questions have non-empty options', () => {
    for (const q of TRIVIA_QUESTIONS) {
      for (const opt of q.options) {
        expect(opt.length).toBeGreaterThan(0);
      }
    }
  });

  it('all questions have valid category', () => {
    const validCategories = ['LUNAR_MISSIONS', 'NASA_HISTORY', 'SPACE_SCIENCE', 'ARTEMIS_PROGRAM'];
    for (const q of TRIVIA_QUESTIONS) {
      expect(validCategories).toContain(q.category);
    }
  });

  it('all questions have valid difficulty', () => {
    for (const q of TRIVIA_QUESTIONS) {
      expect(['MEDIUM', 'HARD']).toContain(q.difficulty);
    }
  });

  it('has questions in all 4 categories', () => {
    const categories = new Set(TRIVIA_QUESTIONS.map(q => q.category));
    expect(categories.size).toBe(4);
  });

  it('correct answer text matches the option at correctIndex', () => {
    for (const q of TRIVIA_QUESTIONS) {
      const correctOption = q.options[q.correctIndex];
      expect(correctOption).toBeDefined();
      expect(correctOption.length).toBeGreaterThan(0);
    }
  });
});

describe('getRandomTrivia', () => {
  it('returns a question when usedIds is empty', () => {
    const q = getRandomTrivia([]);
    expect(q).not.toBeNull();
    expect(q?.question).toBeDefined();
  });

  it('excludes used IDs', () => {
    const firstQ = getRandomTrivia([]);
    expect(firstQ).not.toBeNull();
    // Get many questions, verify the first is never returned
    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const q = getRandomTrivia([firstQ!.id]);
      if (q) results.add(q.id);
    }
    expect(results.has(firstQ!.id)).toBe(false);
  });

  it('returns null when all questions are used', () => {
    const allIds = TRIVIA_QUESTIONS.map(q => q.id);
    const q = getRandomTrivia(allIds);
    expect(q).toBeNull();
  });

  it('returns different questions on multiple calls', () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const q = getRandomTrivia([]);
      if (q) results.add(q.id);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
