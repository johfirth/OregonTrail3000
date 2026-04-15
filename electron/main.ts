import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu-action', 'new-game'),
        },
        { type: 'separator' },
        {
          label: 'Save Game',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu-action', 'save-game'),
        },
        {
          label: 'Load Game',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu-action', 'load-game'),
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Game',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow?.webContents.send('menu-action', 'open-settings'),
        },
        { type: 'separator' },
        {
          label: 'Difficulty: Cadet',
          type: 'radio',
          checked: false,
          click: () => mainWindow?.webContents.send('menu-action', 'difficulty-cadet'),
        },
        {
          label: 'Difficulty: Astronaut',
          type: 'radio',
          checked: true,
          click: () => mainWindow?.webContents.send('menu-action', 'difficulty-astronaut'),
        },
        {
          label: 'Difficulty: Commander',
          type: 'radio',
          checked: false,
          click: () => mainWindow?.webContents.send('menu-action', 'difficulty-commander'),
        },
        {
          label: 'Difficulty: Ironman',
          type: 'radio',
          checked: false,
          click: () => mainWindow?.webContents.send('menu-action', 'difficulty-ironman'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'NASA Modern Theme',
          type: 'radio',
          checked: true,
          click: () => mainWindow?.webContents.send('menu-action', 'theme-nasa'),
        },
        {
          label: 'Retro 80s Theme',
          type: 'radio',
          checked: false,
          click: () => mainWindow?.webContents.send('menu-action', 'theme-retro'),
        },
        { type: 'separator' },
        {
          label: 'Font Size: Small',
          type: 'radio',
          click: () => mainWindow?.webContents.send('menu-action', 'font-small'),
        },
        {
          label: 'Font Size: Medium',
          type: 'radio',
          checked: true,
          click: () => mainWindow?.webContents.send('menu-action', 'font-medium'),
        },
        {
          label: 'Font Size: Large',
          type: 'radio',
          click: () => mainWindow?.webContents.send('menu-action', 'font-large'),
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'How to Play',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'How to Play — Artemis Trail',
              message: 'How to Play Artemis Trail',
              detail: `OBJECTIVE
Lead your crew from Earth to the Moon and establish a lunar colony.

MISSION PREP
Allocate your budget across 6 resources: Propulsion (fuel), Life Support (food/O₂), Spare Parts, Shielding, Medical, and Budget Reserve. Balance is key — overspend on fuel and you'll starve; hoard supplies and you won't make it to orbit.

GAMEPLAY
Each turn: manage consumption, face random events, and make tough decisions. Use keyboard shortcuts (1-9) to select actions, arrow keys to navigate.

PHASES
1. Mission Prep → 2. Launch → 3. Lunar Transit → 4. Gateway Station → 5. Descent → 6. Surface Ops → 7. Colony

EVA CHALLENGES
On the surface, EVAs test your skills — type a word quickly or answer space trivia. Speed and knowledge determine your success.

GATEWAY STATION
Dock to resupply at marked-up prices. Worth it if you're running low, but you lose fuel docking.

TIPS
• Standard consumption is safest for most players
• Always keep some spare parts for emergencies
• Shielding protects against solar flares — don't skip it
• Medical supplies prevent crew deaths from illness
• Save often (Ctrl+S) on Cadet/Astronaut difficulty`,
              buttons: ['Got it!'],
            });
          },
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Keyboard Shortcuts',
              detail: `NAVIGATION
1-9        Select numbered action
↑ / ↓      Navigate action list
Enter      Confirm selection
Escape     Cancel / go back

GAME
Ctrl+S     Save game
Ctrl+O     Load game
Ctrl+N     New game
Ctrl+,     Open settings

EVA CHALLENGES
Type the word shown and press Enter (typing challenge)
1-4        Select answer (trivia challenge)

MENU
Alt+F      File menu
Alt+G      Game menu
Alt+V      View menu
Alt+H      Help menu`,
              buttons: ['OK'],
            });
          },
        },
        { type: 'separator' },
        {
          label: 'About the Difficulty Levels',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Difficulty Levels',
              message: 'Difficulty Levels',
              detail: `CADET (Recommended for first-time players)
Budget: 800 CR • Fewer events • Generous timers
Win rate: ~72% • Learn the mechanics safely

ASTRONAUT (Standard challenge)
Budget: 600 CR • Normal events • Standard timers
Win rate: ~41% • The way it was meant to be played

COMMANDER (For veterans)
Budget: 450 CR • Frequent events • Tight timers
Win rate: ~20% • Every decision matters

IRONMAN (Ultimate challenge)
Budget: 400 CR • Maximum events • Short timers • No saves
Win rate: ~8% • One shot at glory`,
              buttons: ['OK'],
            });
          },
        },
        {
          label: 'About Space Trivia',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Space Trivia',
              message: 'Space Trivia Challenges',
              detail: `During EVA surface operations, you may face trivia questions about:

• Lunar Missions — Apollo program, Moon landings, astronauts
• NASA History — Founding, milestones, rockets, space stations
• Space Science — Moon facts, orbital mechanics, radiation
• Artemis Program — SLS, Orion, Gateway, lunar south pole

Questions are Teen Jeopardy level — challenging but fair.
Correct answers improve your EVA outcome.
Timer scales by difficulty (10-30 seconds).

There are 40 unique questions — no repeats in a single game!`,
              buttons: ['OK'],
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Game Website (GitHub)',
          click: () => shell.openExternal('https://github.com/johfirth/OregonTrail3000'),
        },
        { type: 'separator' },
        {
          label: 'About Artemis Trail',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Artemis Trail',
              message: 'Artemis Trail v0.1.0',
              detail: `The Oregon Trail... TO THE MOON

An Oregon Trail-style text adventure game set as a NASA Artemis lunar mission. Built with TypeScript, React, and Electron using GitHub Copilot's agentic development workflow with 15 specialized AI agents.

Inspired by the original Oregon Trail (1978) by Don Rawitsch, Bill Heinemann, and Paul Dillenberger.

© 2026 Built with Copilot`,
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  // macOS gets the app name as the first menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow(): void {
  const iconPath = join(__dirname, '../../resources/icon.svg');

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Artemis Trail',
    backgroundColor: '#061A40',
    icon: iconPath,
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
  createMenu();
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
