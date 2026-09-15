import { app, BrowserWindow, ipcMain, shell, clipboard, nativeImage, dialog, globalShortcut } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { getCadWindows, captureSourceById, capturePrimaryScreen } from './screen-capture';

process.env.DIST_ELECTRON = path.join(__dirname, '..');
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

let mainWindow: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'V6 Render — Universal 3D Studio',
    width: 1200,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#09090b',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#09090b',
      symbolColor: '#e4e4e7',
      height: 36,
    },
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows cross-origin API calls to V6 Render cloud backend
    },
  });

  if (url) {
    mainWindow.loadURL(url);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexHtml);
  }

  // Register global hotkey to capture viewport from anywhere (Ctrl+Shift+R)
  try {
    globalShortcut.register('CommandOrControl+Shift+R', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('trigger-viewport-capture');
      }
    });
  } catch (err) {
    console.error('Failed to register global shortcut:', err);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ─── IPC HANDLERS ─────────────────────────────────────────────────────────────

// Get all running CAD/3D software windows
ipcMain.handle('get-cad-windows', async () => {
  try {
    return await getCadWindows();
  } catch (err: any) {
    console.error('get-cad-windows error:', err);
    return [];
  }
});

// Capture a specific window by sourceId
ipcMain.handle('capture-window', async (_, sourceId: string) => {
  try {
    return await captureSourceById(sourceId);
  } catch (err: any) {
    console.error('capture-window error:', err);
    throw err;
  }
});

// Capture primary display screen
ipcMain.handle('capture-screen', async () => {
  try {
    return await capturePrimaryScreen();
  } catch (err: any) {
    console.error('capture-screen error:', err);
    throw err;
  }
});

// Copy base64 image directly to Windows/Mac clipboard
ipcMain.handle('copy-image-to-clipboard', async (_, dataUrl: string) => {
  try {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
    return true;
  } catch (err) {
    console.error('copy-image-to-clipboard error:', err);
    return false;
  }
});

// Save image to local disk
ipcMain.handle('save-image-file', async (_, { dataUrl, defaultName }: { dataUrl: string; defaultName?: string }) => {
  if (!mainWindow) return false;
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save V6 Render 4K Output',
      defaultPath: defaultName || `v6-render-${Date.now()}.jpg`,
      filters: [
        { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
        { name: 'PNG Image', extensions: ['png'] },
      ],
    });

    if (canceled || !filePath) return false;

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (err) {
    console.error('save-image-file error:', err);
    return false;
  }
});

// Open external URL in user's default browser
ipcMain.handle('open-external-url', async (_, targetUrl: string) => {
  if (targetUrl) {
    await shell.openExternal(targetUrl);
  }
});
