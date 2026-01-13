const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  onSystemIdleTime: (callback) => {
    ipcRenderer.on("system-idle-time", (event, seconds) => {
      callback(seconds);
    });
  },
  // Add other IPC methods here if needed
});
