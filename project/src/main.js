const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    maximizable: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Get yt-dlp path
function getYtDlpPath() {
  const isDev = process.argv.includes('--dev');
  
  if (isDev) {
    // In development, look for yt-dlp in bin folder
    return path.join(__dirname, '../bin/yt-dlp.exe');
  } else {
    // In production, look in resources
    return path.join(process.resourcesPath, 'bin/yt-dlp.exe');
  }
}

// Check if yt-dlp exists
function checkYtDlp() {
  const ytDlpPath = getYtDlpPath();
  return fs.existsSync(ytDlpPath);
}

// IPC Handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Zgjidhni dosjen për shkarkim'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-default-folder', () => {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const defaultFolder = path.join(desktopPath, 'YouTube Videos');
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(defaultFolder)) {
    fs.mkdirSync(defaultFolder, { recursive: true });
  }
  
  return defaultFolder;
});

ipcMain.handle('download-video', async (event, { url, format, outputPath }) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();
    
    if (!checkYtDlp()) {
      reject(new Error('yt-dlp nuk u gjet. Ju lutem sigurohuni që yt-dlp.exe është në dosjen bin/'));
      return;
    }

    let args;
    if (format === 'mp3') {
      args = [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    } else {
      args = [
        '-f', 'best[height<=720]',
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    }

    const process = spawn(ytDlpPath, args);
    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.includes('[download]') && line.includes('%')) {
          const match = line.match(/(\d+\.?\d*)%/);
          if (match) {
            const progress = parseFloat(match[1]);
            event.sender.send('download-progress', { progress, message: line.trim() });
          }
        }
      }
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: 'Shkarkimi u përfundua me sukses!' });
      } else {
        reject(new Error(error || 'Gabim gjatë shkarkimit'));
      }
    });

    process.on('error', (err) => {
      reject(new Error(`Gabim në ekzekutimin e yt-dlp: ${err.message}`));
    });
  });
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath);
});

ipcMain.handle('check-ytdlp', () => {
  return checkYtDlp();
});