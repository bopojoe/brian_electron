const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendWebhook: (data) => ipcRenderer.invoke('send-webhook', data),
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config), // Add this
    openConfigWindow: () => ipcRenderer.invoke('open-config-window'),
    saveNewButton: (button) => ipcRenderer.invoke('save-new-button', button),
    onRefreshButtons: (callback) => ipcRenderer.on('refresh-buttons', callback),
    
});

