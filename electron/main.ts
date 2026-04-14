import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Artemis Trail',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for platform-specific features
const MAX_SAVE_SIZE = 1024 * 1024; // 1 MB

ipcMain.handle('save-game', async (_event, data: unknown) => {
  try {
    if (typeof data !== 'string') {
      return { success: false, error: 'Invalid save data: expected a string.' };
    }
    if (data.length > MAX_SAVE_SIZE) {
      return { success: false, error: 'Save data exceeds maximum allowed size.' };
    }
    // TODO: Implement filesystem save
    console.log('Save game requested');
    return { success: true };
  } catch (err) {
    console.error('save-game error:', err);
    return { success: false, error: 'An unexpected error occurred while saving.' };
  }
});

ipcMain.handle('load-game', async () => {
  try {
    // TODO: Implement filesystem load
    console.log('Load game requested');
    return { success: false, data: null };
  } catch (err) {
    console.error('load-game error:', err);
    return { success: false, data: null, error: 'An unexpected error occurred while loading.' };
  }
});
