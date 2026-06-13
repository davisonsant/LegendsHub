const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { initializeGameFiles } = require(path.join(__dirname, 'init-game-files.cjs'));

// Inicializar pasta databases e game_assets com seus indexadores adicionais
initializeGameFiles();

// Registrar Handlers de IPC para manipulação direta de arquivos no modo Desktop
ipcMain.handle('fs:list-databases', async () => {
  try {
    const dbDir = path.join(process.cwd(), 'databases');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const files = fs.readdirSync(dbDir);
    return files.filter(f => f.endsWith('.db') || f.endsWith('.json'));
  } catch (err) {
    console.error('Erro ao listar bancos de dados no disco:', err);
    return ['default.db'];
  }
});

/**
 * Recovers image base64 representations from BLOB-like properties.
 */
function processPayloadImages(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const traverse = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    // Check if it looks like an entity with image fields
    const rawBlob = obj.logo_blob || obj.face_blob || obj.badge_blob || obj.avatar_blob || obj.image_blob || obj.image_base64 || obj.base64Image || obj.logoUrl || obj.photoUrl || obj.photo_url;
    if (rawBlob) {
      if (typeof rawBlob === 'string' && rawBlob.startsWith('data:')) {
        obj.base64Image = rawBlob;
        obj.image_base64 = rawBlob;
      } else if (Buffer.isBuffer(rawBlob)) {
        const base64Str = `data:image/png;base64,${rawBlob.toString('base64')}`;
        obj.base64Image = base64Str;
        obj.image_base64 = base64Str;
      } else if (typeof rawBlob === 'string' && !rawBlob.includes('/') && rawBlob.length > 100) {
        const base64Str = `data:image/png;base64,${rawBlob}`;
        obj.base64Image = base64Str;
        obj.image_base64 = base64Str;
      } else {
        obj.base64Image = rawBlob;
        obj.image_base64 = rawBlob;
      }
    }

    for (const key of Object.keys(obj)) {
      if (obj[key] && typeof obj[key] === 'object') {
        traverse(obj[key]);
      }
    }
  };

  traverse(payload);
  return payload;
}

ipcMain.handle('fs:load-database', async (event, filename) => {
  try {
    const filepath = path.join(process.cwd(), 'databases', filename);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    const parsed = JSON.parse(content);
    return processPayloadImages(parsed);
  } catch (err) {
    console.error(`Erro ao carregar o banco de dados ${filename} de disco:`, err);
    return null;
  }
});

ipcMain.handle('fs:save-database', async (event, filename, data) => {
  try {
    const dbDir = path.join(process.cwd(), 'databases');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const filepath = path.join(dbDir, filename);
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(filepath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error(`Erro ao salvar banco de dados ${filename} no disco:`, err);
    return false;
  }
});

ipcMain.handle('fs:delete-database', async (event, filename) => {
  try {
    if (filename.toLowerCase() === 'default.db') return false; // Proteger banco de dados original
    const filepath = path.join(process.cwd(), 'databases', filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Erro ao deletar banco de dados ${filename} do disco:`, err);
    return false;
  }
});

ipcMain.handle('fs:check-asset', async (event, category, id) => {
  // Revertido qualquer verificação local de arquivo de imagem. Apenas retornamos nulo para priorizar a leitura do banco de dados/base64
  return null;
});

ipcMain.handle('fs:save-asset', async (event, category, id, dataUrl) => {
  // RESTRUTURAÇÃO COMPLETA: Sem escrita no File System físico local de fotos. Retornamos true simulando sucesso de gravação.
  return true;
});

ipcMain.handle('fs:update-index', async (event, category, id, name) => {
  // 100% DB-driven: Sem atualizar arquivos indexadores txt locais.
  return true;
});

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    title: "LegendsHub Manager",
    icon: path.join(__dirname, 'dist', 'favicon.ico'), // Will use fallback if not found
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Check if we are in development mode
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Prevent navigation to external links in the same frame; open them in user's default browser instead
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Remove default browser menu bar for a clean, gaming-console-like UI
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
