const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

// ---------------------------------------------------
// 🔹 Create main window
// ---------------------------------------------------
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
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------------------------------------------------
// 🔹 Utility Functions
// ---------------------------------------------------
function getYtDlpPath() {
  const isDev = !app.isPackaged;
  if (isDev) {
    return path.join(__dirname, '../bin/yt-dlp.exe');
  } else {
    return path.join(process.resourcesPath, 'bin', 'yt-dlp.exe');
  }
}

function getFfmpegPath() {
  const isDev = !app.isPackaged;
  if (isDev) {
    return path.join(__dirname, '../bin/ffmpeg.exe');
  } else {
    return path.join(process.resourcesPath, 'bin', 'ffmpeg.exe');
  }
}

function checkYtDlp() {
  return fs.existsSync(getYtDlpPath());
}

function checkFfmpeg() {
  return fs.existsSync(getFfmpegPath());
}

// ---------------------------------------------------
// 🔹 IPC HANDLERS
// ---------------------------------------------------

// Folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Zgjidhni dosjen për shkarkim'
  });
  if (!result.canceled && result.filePaths.length > 0) return result.filePaths[0];
  return null;
});

// Default folder
ipcMain.handle('get-default-folder', () => {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const defaultFolder = path.join(desktopPath, 'YouTube Videos');
  if (!fs.existsSync(defaultFolder)) fs.mkdirSync(defaultFolder, { recursive: true });
  return defaultFolder;
});

// ---------------------------------------------------
// 🔹 MAIN DOWNLOAD LOGIC
// ---------------------------------------------------
ipcMain.handle('download-video', async (event, { url, format, outputPath }) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();
    const ffmpegPath = getFfmpegPath();

    if (!checkYtDlp()) {
      reject(new Error('yt-dlp nuk u gjet. Ju lutem vendosni yt-dlp.exe në dosjen bin/.'));
      return;
    }

    if (!checkFfmpeg()) {
      reject(new Error('ffmpeg nuk u gjet. Ju lutem vendosni ffmpeg.exe në dosjen bin/.'));
      return;
    }

    let args = [];

    if (format === 'mp3') {
      // Extract MP3
      args = [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    } else {
      // Merge video + audio (REAL MP4 playable everywhere)
      args = [
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
        '--merge-output-format', 'mp4',
        '--ffmpeg-location', ffmpegPath,
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    }

    const ytProcess = spawn(ytDlpPath, args);
    let output = '';
    let error = '';

    ytProcess.stdout.on('data', (data) => {
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

    ytProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    ytProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: '✅ Shkarkimi dhe bashkimi përfundoi me sukses!' });
      } else {
        reject(new Error(error || 'Gabim gjatë shkarkimit.'));
      }
    });

    ytProcess.on('error', (err) => {
      reject(new Error(`Gabim në ekzekutimin e yt-dlp: ${err.message}`));
    });
  });
});

// Open folder
ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath);
});

// Check yt-dlp
ipcMain.handle('check-ytdlp', () => {
  return checkYtDlp();
});
