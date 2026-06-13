const { contextBridge, ipcRenderer } = require('electron');

// Expose minimal desktop bridge utilities if needed in the future
contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  listDatabases: () => ipcRenderer.invoke('fs:list-databases'),
  loadDatabase: (filename) => ipcRenderer.invoke('fs:load-database', filename),
  saveDatabase: (filename, data) => ipcRenderer.invoke('fs:save-database', filename, data),
  deleteDatabase: (filename) => ipcRenderer.invoke('fs:delete-database', filename),
  checkAssetExists: (category, id) => ipcRenderer.invoke('fs:check-asset', category, id),
  saveAsset: (category, id, dataUrl) => ipcRenderer.invoke('fs:save-asset', category, id, dataUrl),
  updateIndex: (category, id, name) => ipcRenderer.invoke('fs:update-index', category, id, name),
  send: (channel, data) => {
    // Whitelisted channels
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
