const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const http = require('http')

let mainWindow
let pythonProcess
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// ── Spawn Python backend ───────────────────────────────────────────────────
function startPython() {
  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend')

  const script = path.join(backendDir, 'main.py')

  const pythonPaths = [
    'C:\\Users\\MOULI\\AppData\\Local\\Programs\\Python\\Python311\\python.exe',
    'C:\\Python311\\python.exe',
    'python3',
    'python',
  ]

  const trySpawn = (paths) => {
    if (paths.length === 0) {
      console.error('Could not find Python')
      return
    }
    try {
      pythonProcess = spawn(paths[0], [script], {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      pythonProcess.on('error', () => {
        pythonProcess = null
        trySpawn(paths.slice(1))
      })

      pythonProcess.stdout.on('data', d => console.log('[Python]', d.toString().trim()))
      pythonProcess.stderr.on('data', d => console.error('[Python ERR]', d.toString().trim()))
      pythonProcess.on('exit', code => console.log(`[Python] exited with code ${code}`))
    } catch (e) {
      trySpawn(paths.slice(1))
    }
  }

  trySpawn(pythonPaths)
}

function killPython() {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM')
    pythonProcess = null
  }
}

// ── Wait for backend to be ready ──────────────────────────────────────────
function waitForBackend(retries = 60) {
  return new Promise((resolve) => {
    const check = (n) => {
      http.get('http://localhost:8765/ping', (res) => {
        if (res.statusCode === 200) resolve()
        else if (n > 0) setTimeout(() => check(n - 1), 1000)
        else resolve()
      }).on('error', () => {
        if (n > 0) setTimeout(() => check(n - 1), 1000)
        else resolve()
      })
    }
    check(retries)
  })
}

// ── Create window ─────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#080808',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// ── App lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  startPython()

  try {
    await waitForBackend()
  } catch (e) {
    // continue anyway
  }

  createWindow()
})

app.on('window-all-closed', () => {
  killPython()
  app.quit()
})

app.on('will-quit', killPython)

// ── IPC handlers ──────────────────────────────────────────────────────────
ipcMain.on('quit-app', () => {
  killPython()
  app.quit()
})

ipcMain.on('minimize-app', () => mainWindow?.minimize())
ipcMain.on('maximize-app', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})