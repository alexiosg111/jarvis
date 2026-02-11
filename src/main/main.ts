import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './isDev';
import { openAgentBrowser } from './orchestrator';
import { validateTaskInput, validatePlanInput } from '../shared/config';
import fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'default',
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers with input validation
ipcMain.handle('open-agent-browser', async (_event, agent: string, task: string, plan: string) => {
  // Validate inputs
  const taskValidation = validateTaskInput(task);
  if (!taskValidation.valid) {
    return { success: false, error: taskValidation.error };
  }

  const planValidation = validatePlanInput(plan);
  if (!planValidation.valid) {
    return { success: false, error: planValidation.error };
  }

  // Validate agent
  const validAgents = ['Kimi', 'z.ai', 'Comet'];
  if (!validAgents.includes(agent)) {
    return { success: false, error: `Invalid agent: ${agent}` };
  }

  return await openAgentBrowser(agent, task, plan);
});

ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData');
});

ipcMain.handle('read-user-data', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const dataPath = path.join(userDataPath, 'data.json');

    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // File doesn't exist yet, return null
    if ((err as any)?.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
});

ipcMain.handle('write-user-data', async (_event, data: { tasks?: any[]; plans?: any[]; history?: any[] }) => {
  try {
    const userDataPath = app.getPath('userData');
    await fs.mkdir(userDataPath, { recursive: true });
    const dataPath = path.join(userDataPath, 'data.json');

    let existingData: { tasks: any[]; plans: any[]; history: any[] } = { tasks: [], plans: [], history: [] };

    try {
      const existing = await fs.readFile(dataPath, 'utf-8');
      existingData = JSON.parse(existing);
    } catch (err) {
      // File doesn't exist, use empty data
    }

    if (data.tasks !== undefined) {
      existingData.tasks = data.tasks;
    }
    if (data.plans !== undefined) {
      existingData.plans = data.plans;
    }
    if (data.history !== undefined) {
      existingData.history = data.history;
    }

    await fs.writeFile(dataPath, JSON.stringify(existingData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write user data:', err);
    throw err;
  }
});
