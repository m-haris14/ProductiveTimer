const { app, BrowserWindow, ipcMain, powerMonitor } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the React app
  // In dev: load localhost
  // In prod: load index.html
  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in dev mode
  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", () => {
  createWindow();

  // Poll system idle state every second and send to renderer
  setInterval(() => {
    if (mainWindow) {
      // getSystemIdleTime returns seconds
      const idleTime = powerMonitor.getSystemIdleTime();
      mainWindow.webContents.send("system-idle-time", idleTime);
    }
  }, 1000);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
