import { app, BrowserWindow } from 'electron';
import path from 'path';

const DEV_URL = 'http://localhost:5173';

function createWindow() {
  const win = new BrowserWindow({
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
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    // Dev mode: load from Vite dev server with retry
    const loadDevURL = () => {
      win.loadURL(DEV_URL).catch(() => {
        setTimeout(loadDevURL, 500);
      });
    };
    loadDevURL();
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
