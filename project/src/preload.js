const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getDefaultFolder: () => ipcRenderer.invoke('get-default-folder'),
  downloadVideo: (data) => ipcRenderer.invoke('download-video', data),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  checkYtDlp: () => ipcRenderer.invoke('check-ytdlp'),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, data) => callback(data));
  },
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners('download-progress');
  }
});