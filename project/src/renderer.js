let selectedFormat = 'mp4';
let selectedFolder = '';
let isDownloading = false;

// DOM Elements
const urlInput = document.getElementById('url');
const formatButtons = document.querySelectorAll('.format-btn');
const folderPath = document.getElementById('folderPath');
const selectFolderBtn = document.getElementById('selectFolder');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const openFolderBtn = document.getElementById('openFolderBtn');
const warningMessage = document.getElementById('warningMessage');

// Initialize
async function init() {
    // Check if yt-dlp exists
    const ytDlpExists = await window.electronAPI.checkYtDlp();
    if (!ytDlpExists) {
        warningMessage.classList.remove('hidden');
        downloadBtn.disabled = true;
        return;
    }

    // Get default folder
    try {
        selectedFolder = await window.electronAPI.getDefaultFolder();
        updateFolderDisplay();
    } catch (error) {
        console.error('Error getting default folder:', error);
    }
}

// Update folder display
function updateFolderDisplay() {
    if (selectedFolder) {
        const parts = selectedFolder.split('\\');
        const displayPath = parts.slice(-2).join(' → ');
        folderPath.textContent = displayPath;
    }
}

// Format selection
formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isDownloading) return;
        
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
    });
});

// Folder selection
selectFolderBtn.addEventListener('click', async () => {
    if (isDownloading) return;
    
    try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            selectedFolder = folder;
            updateFolderDisplay();
        }
    } catch (error) {
        showStatus('error', 'Gabim në zgjedhjen e dosjes: ' + error.message);
    }
});

// Download functionality
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
        showStatus('error', 'Ju lutem fusni një URL të vlefshme YouTube');
        return;
    }
    
    if (!selectedFolder) {
        showStatus('error', 'Ju lutem zgjidhni një dosje për shkarkim');
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        showStatus('error', 'URL nuk është e vlefshme për YouTube');
        return;
    }
    
    await startDownload(url, selectedFormat, selectedFolder);
});

// Open folder
openFolderBtn.addEventListener('click', () => {
    if (selectedFolder) {
        window.electronAPI.openFolder(selectedFolder);
    }
});

// Validate YouTube URL
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
}

// Show status
function showStatus(type, message) {
    status.classList.remove('hidden');
    statusMessage.textContent = message;
    
    // Hide all icons
    document.querySelectorAll('.status-icon svg').forEach(icon => {
        icon.classList.add('hidden');
    });
    
    // Show appropriate icon
    if (type === 'downloading') {
        document.querySelector('.spinner').classList.remove('hidden');
        progressBar.classList.remove('hidden');
    } else if (type === 'success') {
        document.querySelector('.success-icon').classList.remove('hidden');
        progressBar.classList.add('hidden');
        openFolderBtn.classList.remove('hidden');
    } else if (type === 'error') {
        document.querySelector('.error-icon').classList.remove('hidden');
        progressBar.classList.add('hidden');
    }
}

// Hide status
function hideStatus() {
    status.classList.add('hidden');
    progressBar.classList.add('hidden');
    openFolderBtn.classList.add('hidden');
}

// Start download
async function startDownload(url, format, outputPath) {
    isDownloading = true;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Duke shkarkuar...';
    
    showStatus('downloading', 'Duke filluar shkarkimin...');
    
    // Listen for progress updates
    window.electronAPI.onDownloadProgress((data) => {
        showStatus('downloading', data.message);
        if (data.progress) {
            progressFill.style.width = data.progress + '%';
        }
    });
    
    try {
        const result = await window.electronAPI.downloadVideo({
            url,
            format,
            outputPath
        });
        
        showStatus('success', result.message);
        
        // Reset form after successful download
        setTimeout(() => {
            urlInput.value = '';
            hideStatus();
        }, 5000);
        
    } catch (error) {
        console.error('Download error:', error);
        showStatus('error', 'Gabim gjatë shkarkimit: ' + error.message);
        
        setTimeout(() => {
            hideStatus();
        }, 5000);
    } finally {
        isDownloading = false;
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Shkarkoni
        `;
        
        // Remove progress listener
        window.electronAPI.removeDownloadProgressListener();
    }
}

// Initialize app
init();