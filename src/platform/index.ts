import type { SaveManager } from './save-manager';
import { DesktopSaveManager } from './desktop';
import { WebSaveManager } from './web';

export type { SaveManager } from './save-manager';

export function createSaveManager(): SaveManager {
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
  return isElectron ? new DesktopSaveManager() : new WebSaveManager();
}
