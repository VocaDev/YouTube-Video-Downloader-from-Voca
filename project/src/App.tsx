import React, { useState } from 'react';
import { Download, Youtube, Folder, CheckCircle, AlertCircle, Loader, FolderOpen } from 'lucide-react';

interface DownloadStatus {
  status: 'idle' | 'downloading' | 'success' | 'error';
  message: string;
  progress?: number;
}

function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp4');
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({ status: 'idle', message: '' });
  const [selectedFolder, setSelectedFolder] = useState('Desktop → YouTube Videos');

  const handleFolderSelect = () => {
    // In the actual Electron app, this will open a folder dialog
    // For demo purposes, we'll simulate folder selection
    const folders = [
      'Desktop → YouTube Videos',
      'Documents → Downloads',
      'Downloads → YouTube',
      'Music → YouTube Audio',
      'Videos → YouTube Videos'
    ];
    const randomFolder = folders[Math.floor(Math.random() * folders.length)];
    setSelectedFolder(randomFolder);
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setDownloadStatus({ status: 'error', message: 'Ju lutem fusni një URL të vlefshme YouTube' });
      return;
    }

    setDownloadStatus({ status: 'downloading', message: 'Duke filluar shkarkimin...', progress: 0 });

    // Simulate download progress
    const intervals = [
      { progress: 20, message: 'Duke analizuar videon...' },
      { progress: 40, message: 'Duke shkarkuar...' },
      { progress: 70, message: 'Duke përpunuar...' },
      { progress: 90, message: `Duke ruajtur në ${selectedFolder}...` },
      { progress: 100, message: 'Shkarkimi u përfundua me sukses!' }
    ];

    for (const interval of intervals) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDownloadStatus({ 
        status: 'downloading', 
        message: interval.message, 
        progress: interval.progress 
      });
    }

    setDownloadStatus({ 
      status: 'success', 
      message: `Video u shkarkua në formatin ${format.toUpperCase()} në dosjen "${selectedFolder}"!` 
    });
    
    setTimeout(() => setDownloadStatus({ status: 'idle', message: '' }), 3000);
  };

  const getStatusIcon = () => {
    switch (downloadStatus.status) {
      case 'downloading': return <Loader className="w-5 h-5 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">YouTube Downloader</h1>
          <p className="text-gray-600 text-sm">Shkarkoni video dhe audio nga YouTube</p>
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            URL e YouTube
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200"
            disabled={downloadStatus.status === 'downloading'}
          />
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Zgjidhni formatin
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('mp4')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                format === 'mp4'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              disabled={downloadStatus.status === 'downloading'}
            >
              <div className="text-center">
                <div className="font-semibold">MP4</div>
                <div className="text-xs opacity-75">Video + Audio</div>
              </div>
            </button>
            <button
              onClick={() => setFormat('mp3')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                format === 'mp3'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              disabled={downloadStatus.status === 'downloading'}
            >
              <div className="text-center">
                <div className="font-semibold">MP3</div>
                <div className="text-xs opacity-75">Vetëm Audio</div>
              </div>
            </button>
          </div>
        </div>

        {/* Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosja e shkarkimit
          </label>
          <button
            onClick={handleFolderSelect}
            className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-between text-left"
            disabled={downloadStatus.status === 'downloading'}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{selectedFolder}</span>
            </div>
            <FolderOpen className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloadStatus.status === 'downloading' || !url.trim()}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4"
        >
          <Download className="w-5 h-5" />
          {downloadStatus.status === 'downloading' ? 'Duke shkarkuar...' : 'Shkarkoni'}
        </button>

        {/* Status Display */}
        {downloadStatus.status !== 'idle' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-gray-700">
                {downloadStatus.message}
              </span>
            </div>
            {downloadStatus.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadStatus.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Download Location Info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Folder className="w-4 h-4" />
            <span className="text-xs font-medium">
              Skedarët do të ruhen në: {selectedFolder}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;