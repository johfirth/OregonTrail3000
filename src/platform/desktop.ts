// Desktop (Electron) save manager — uses IPC to main process filesystem
import type { SaveManager } from './save-manager';

export class DesktopSaveManager implements SaveManager {
  async save(key: string, data: string): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.saveGame(JSON.stringify({ key, data }));
      return result.success;
    }
    return false;
  }

  async load(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.loadGame();
      return result.data;
    }
    return null;
  }

  async delete(_key: string): Promise<boolean> {
    // TODO: Implement
    return false;
  }

  async listSaves(): Promise<string[]> {
    // TODO: Implement
    return [];
  }
}
