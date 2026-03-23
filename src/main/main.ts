import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';

const DEV_URL = 'http://localhost:5173';
const GITHUB_REPO = 'https://github.com/ClaudieFaukan/EquiMac';
const GITHUB_RELEASES = `${GITHUB_REPO}/releases`;
const GITHUB_DOCS = `${GITHUB_REPO}/blob/main/docs/guide-utilisateur.md`;
const GITHUB_ISSUES = `${GITHUB_REPO}/issues`;
const GITHUB_DISCUSSIONS = `${GITHUB_REPO}/discussions`;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#18181b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    const loadDevURL = () => {
      mainWindow?.loadURL(DEV_URL).catch(() => {
        setTimeout(loadDevURL, 500);
      });
    };
    loadDevURL();
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

function checkForUpdates() {
  if (app.isPackaged) {
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdatesAndNotify();
    } catch {
      shell.openExternal(GITHUB_RELEASES);
    }
  } else {
    shell.openExternal(GITHUB_RELEASES);
  }
}

const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: app.name,
    submenu: [
      { role: 'about', label: 'About EquiMac' },
      { label: 'Check for Updates...', click: () => checkForUpdates() },
      { type: 'separator' },
      {
        label: 'Language / Langue',
        submenu: [
          { label: 'English', click: () => mainWindow?.webContents.executeJavaScript('localStorage.setItem("equimac-lang","en"); location.reload()') },
          { label: 'Francais', click: () => mainWindow?.webContents.executeJavaScript('localStorage.setItem("equimac-lang","fr"); location.reload()') },
        ],
      },
      { type: 'separator' },
      { role: 'hide', label: 'Hide EquiMac' },
      { role: 'hideOthers', label: 'Hide Others' },
      { role: 'unhide', label: 'Show All' },
      { type: 'separator' },
      { role: 'quit', label: 'Quit EquiMac' },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo', label: 'Undo' },
      { role: 'redo', label: 'Redo' },
      { type: 'separator' },
      { role: 'cut', label: 'Cut' },
      { role: 'copy', label: 'Copy' },
      { role: 'paste', label: 'Paste' },
      { role: 'selectAll', label: 'Select All' },
    ],
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize', label: 'Minimize' },
      { role: 'zoom', label: 'Zoom' },
      { role: 'togglefullscreen', label: 'Full Screen' },
      { type: 'separator' },
      { role: 'close', label: 'Close' },
    ],
  },
  {
    label: 'Help',
    submenu: [
      { label: 'Documentation', click: () => shell.openExternal(GITHUB_DOCS) },
      {
        label: 'Keyboard Shortcuts',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Keyboard Shortcuts',
            message: 'EquiMac Keyboard Shortcuts',
            detail: [
              'Cmd+Z          Undo',
              'Cmd+Shift+Z    Redo',
              'Cmd+C          Copy range',
              'Cmd+V          Paste range',
              'Cmd+N          Clear grid',
              'Cmd+Click      Select group',
              '1-9            Switch player',
              'Esc            Close heatmap',
            ].join('\n'),
          });
        },
      },
      { type: 'separator' },
      { label: 'Report a Bug...', click: () => shell.openExternal(GITHUB_ISSUES) },
      { label: 'Contact / Discussions...', click: () => shell.openExternal(GITHUB_DISCUSSIONS) },
      { label: 'What\'s New (Changelog)', click: () => shell.openExternal(GITHUB_RELEASES) },
      { type: 'separator' },
      { label: 'GitHub Page', click: () => shell.openExternal(GITHUB_REPO) },
    ],
  },
];

if (!app.isPackaged) {
  template.push({
    label: 'Dev',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ],
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  if (app.isPackaged) {
    setTimeout(() => checkForUpdates(), 5000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
