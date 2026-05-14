const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const WebSocket = require('ws');

let mainWindow;
let tray;
let ws;

const BACKEND_URL = 'ws://localhost:8000/ws/voice';

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png')); // We'll need an icon file
  const contextMenu = Menu.buildFromTemplate([
    { label: 'AlterEGO: Active', enabled: false },
    { type: 'separator' },
    { label: 'Show Overlay', click: () => mainWindow.show() },
    { label: 'Hide Overlay', click: () => mainWindow.hide() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('AlterEGO AI Assistant');
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 150,
    x: width - 420,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.setIgnoreMouseEvents(true); // Allow clicking through if needed
}

function connectBackend() {
  ws = new WebSocket(BACKEND_URL);

  ws.on('open', () => {
    console.log('Connected to AlterEGO Backend');
    if (mainWindow) mainWindow.webContents.send('status', 'connected');
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (mainWindow) {
        mainWindow.webContents.send('backend-msg', msg);
        
        // Show window on wake word
        if (msg.type === 'wake_word_detected') {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    } catch (e) {
      // Might be binary audio data
    }
  });

  ws.on('close', () => {
    console.log('Disconnected from backend. Retrying...');
    setTimeout(connectBackend, 3000);
  });
}

app.whenReady().then(() => {
  createTray();
  createWindow();
  connectBackend();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
