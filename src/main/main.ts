import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';

const DEV_URL = 'http://localhost:5173';
const GITHUB_REPO = 'https://github.com/ClaudieFaukan/EquiMac';
const GITHUB_RELEASES = `${GITHUB_REPO}/releases`;
const GITHUB_DOCS = `${GITHUB_REPO}/wiki`;
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
      // Fallback: open releases page
      shell.openExternal(GITHUB_RELEASES);
    }
  } else {
    shell.openExternal(GITHUB_RELEASES);
  }
}

// Menu bar
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: app.name,
    submenu: [
      { role: 'about', label: 'A propos d\'EquiMac' },
      {
        label: 'Rechercher des mises a jour...',
        click: () => checkForUpdates(),
      },
      { type: 'separator' },
      { role: 'hide', label: 'Masquer EquiMac' },
      { role: 'hideOthers', label: 'Masquer les autres' },
      { role: 'unhide', label: 'Tout afficher' },
      { type: 'separator' },
      { role: 'quit', label: 'Quitter EquiMac' },
    ],
  },
  {
    label: 'Edition',
    submenu: [
      { role: 'undo', label: 'Annuler' },
      { role: 'redo', label: 'Retablir' },
      { type: 'separator' },
      { role: 'cut', label: 'Couper' },
      { role: 'copy', label: 'Copier' },
      { role: 'paste', label: 'Coller' },
      { role: 'selectAll', label: 'Tout selectionner' },
    ],
  },
  {
    label: 'Fenetre',
    submenu: [
      { role: 'minimize', label: 'Reduire' },
      { role: 'zoom', label: 'Zoom' },
      { role: 'togglefullscreen', label: 'Plein ecran' },
      { type: 'separator' },
      { role: 'close', label: 'Fermer' },
    ],
  },
  {
    label: 'Aide',
    submenu: [
      {
        label: 'Documentation',
        click: () => shell.openExternal(GITHUB_DOCS),
      },
      {
        label: 'Raccourcis clavier',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Raccourcis clavier',
            message: 'Raccourcis clavier EquiMac',
            detail: [
              'Cmd+Z          Annuler',
              'Cmd+Shift+Z    Retablir',
              'Cmd+C          Copier le range',
              'Cmd+V          Coller un range',
              'Cmd+N          Vider la grille',
              'Cmd+Clic       Selectionner un groupe',
              '1-9            Changer de joueur',
              'Echap          Fermer la heatmap',
            ].join('\n'),
          });
        },
      },
      { type: 'separator' },
      {
        label: 'Signaler un bug...',
        click: () => shell.openExternal(GITHUB_ISSUES),
      },
      {
        label: 'Contacter / Discussions...',
        click: () => shell.openExternal(GITHUB_DISCUSSIONS),
      },
      {
        label: 'Nouveautes (Changelog)',
        click: () => shell.openExternal(GITHUB_RELEASES),
      },
      { type: 'separator' },
      {
        label: 'Page GitHub',
        click: () => shell.openExternal(GITHUB_REPO),
      },
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

  // Auto-check for updates on launch (packaged only)
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
