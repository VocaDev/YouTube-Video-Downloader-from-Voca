ipcMain.handle('download-video', async (event, { url, format, outputPath }) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();
    const ffmpegPath = path.join(__dirname, '../bin/ffmpeg.exe');

    if (!checkYtDlp()) {
      reject(new Error('yt-dlp nuk u gjet. Ju lutem sigurohuni që yt-dlp.exe është në dosjen bin/'));
      return;
    }

    if (!fs.existsSync(ffmpegPath)) {
      reject(new Error('ffmpeg nuk u gjet. Ju lutem vendosni ffmpeg.exe në dosjen bin/'));
      return;
    }

    let args;

    if (format === 'mp3') {
      // MP3 extraction
      args = [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
      ];
    } else {
      // Full MP4 merge (H.264 + AAC) compatible with Windows Media Player
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
        resolve({ success: true, message: 'Shkarkimi u përfundua me sukses!' });
      } else {
        reject(new Error(error || 'Gabim gjatë shkarkimit'));
      }
    });

    ytProcess.on('error', (err) => {
      reject(new Error(`Gabim në ekzekutimin e yt-dlp: ${err.message}`));
    });
  });
});
