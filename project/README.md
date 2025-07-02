# YouTube Downloader Desktop App

A desktop application for downloading YouTube videos and audio using Electron and yt-dlp.

## Features

- Download YouTube videos in MP4 format
- Extract audio in MP3 format
- Choose custom download folder
- Real-time download progress
- Clean, modern interface
- Cross-platform support (Windows, Mac, Linux)

## Prerequisites

Before running the application, you need to download yt-dlp:

1. Go to [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Download the appropriate version for your system:
   - Windows: `yt-dlp.exe`
   - Mac/Linux: `yt-dlp`
3. Create a `bin` folder in the project root
4. Place the downloaded file in the `bin` folder

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Download yt-dlp (see Prerequisites above)

## Development

Run the app in development mode:
```bash
npm run dev
```

## Building

Build the app for distribution:
```bash
npm run build
```

This will create installers in the `dist` folder.

## Project Structure

```
youtube-downloader-desktop/
├── src/
│   ├── main.js          # Main Electron process
│   ├── preload.js       # Preload script for security
│   ├── renderer.js      # Frontend JavaScript
│   ├── index.html       # Main UI
│   └── styles.css       # Styling
├── bin/
│   └── yt-dlp.exe       # yt-dlp executable (you need to add this)
├── assets/
│   └── icon.png         # App icon
└── package.json
```

## Usage

1. Launch the application
2. Paste a YouTube URL
3. Choose format (MP4 for video, MP3 for audio only)
4. Select download folder (defaults to Desktop/YouTube Videos)
5. Click "Shkarkoni" (Download)
6. Wait for download to complete
7. Click "Hapni dosjen" to open the download folder

## Notes

- The app requires an internet connection to download videos
- Make sure you have permission to download the content
- Large videos may take longer to download
- The app will create a "YouTube Videos" folder on your Desktop by default

## Troubleshooting

If you see "yt-dlp nuk u gjet" (yt-dlp not found):
1. Make sure you've downloaded yt-dlp
2. Place it in the `bin` folder
3. Restart the application

## License

MIT License