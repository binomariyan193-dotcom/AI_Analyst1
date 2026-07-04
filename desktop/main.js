const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');
const { spawn } = require('child_process');
const path = require('path');

// Determine if we are running the compiled .exe or in development mode
const isProd = app.isPackaged;
const frontendPath = isProd 
  ? path.join(process.resourcesPath, 'frontend')
  : path.join(__dirname, '../frontend/out');

const loadURL = serve({ directory: frontendPath });

let mainWindow;
let backendProcess;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const port = 8000;
  console.log(`Starting backend on port ${port}`);

  const backendExePath = isProd 
    ? path.join(process.resourcesPath, 'backend-api.exe')
    : path.join(__dirname, '../backend/dist/backend-api.exe');

  backendProcess = spawn(backendExePath, [], {
    env: { ...process.env, PORT: port.toString() }
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Err: ${data}`));

  // Give backend 3 seconds to spin up, then load frontend
  setTimeout(async () => {
    await loadURL(mainWindow);
  }, 3000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendProcess) {
    // Terminate backend process when electron app closes
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
