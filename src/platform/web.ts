// Web (browser) save manager — uses localStorage
import type { SaveManager } from './save-manager';

const SAVE_PREFIX = 'artemis_trail_save_';

export class WebSaveManager implements SaveManager {
  async save(key: string, data: string): Promise<boolean> {
    try {
      localStorage.setItem(SAVE_PREFIX + key, data);
      return true;
    } catch {
      return false;
    }
  }

  async load(key: string): Promise<string | null> {
    return localStorage.getItem(SAVE_PREFIX + key);
  }

  async delete(key: string): Promise<boolean> {
    localStorage.removeItem(SAVE_PREFIX + key);
    return true;
  }

  async listSaves(): Promise<string[]> {
    const saves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SAVE_PREFIX)) {
        saves.push(key.slice(SAVE_PREFIX.length));
      }
    }
    return saves;
  }
}
