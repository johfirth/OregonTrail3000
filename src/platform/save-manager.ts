// Platform-agnostic save manager interface

export interface SaveManager {
  save(key: string, data: string): Promise<boolean>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<boolean>;
  listSaves(): Promise<string[]>;
}
