import { useState, useEffect } from 'react';

interface KeyboardNavigationOptions {
  /** Number of items to navigate (for arrow keys) */
  itemCount: number;
  /** Called when an item is selected by number key (1-9) or Enter on focused item */
  onSelect: (index: number) => void;
  /** Called when Escape is pressed */
  onEscape?: () => void;
  /** Whether keyboard navigation is active */
  enabled?: boolean;
}

/**
 * Hook for keyboard-driven menu navigation.
 * Supports number keys (1-9) for direct selection, arrow keys for focus,
 * Enter to confirm, and Escape to back out.
 */
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onEscape,
  enabled = true,
}: KeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Number keys 1-9 → directly select action
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < itemCount) {
          e.preventDefault();
          onSelect(idx);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(itemCount - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex < itemCount) {
            onSelect(focusedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, itemCount, onSelect, onEscape, focusedIndex]);

  // Reset focus when item count changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [itemCount]);

  return { focusedIndex, setFocusedIndex };
}
