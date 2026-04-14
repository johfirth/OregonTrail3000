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
ipcMain.handle('save-game', async (_event, data: string) => {
  // TODO: Implement filesystem save
  console.log('Save game requested');
  return { success: true };
});

ipcMain.handle('load-game', async () => {
  // TODO: Implement filesystem load
  console.log('Load game requested');
  return { success: false, data: null };
});
