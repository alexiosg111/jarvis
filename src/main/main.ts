import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import {
  DEFAULT_STATE,
  ExportPlanResponse,
  LoadStateResponse,
  OpenProviderRequest,
  OpenProviderResponse,
  PersistedState,
  PromptDraft,
  PromptHistoryItem,
  SaveStateResponse
} from "../shared/config";
import { isDev } from "./isDev";
import { openPromptInProvider } from "./orchestrator";

const getStatePath = () => path.join(app.getPath("userData"), "jarvis-hub.json");

const coerceString = (value: unknown) => (typeof value === "string" ? value : "");

const toDraft = (value: unknown): PromptDraft => ({
  task: coerceString((value as PromptDraft | undefined)?.task),
  context: coerceString((value as PromptDraft | undefined)?.context),
  constraints: coerceString((value as PromptDraft | undefined)?.constraints),
  successCriteria: coerceString((value as PromptDraft | undefined)?.successCriteria),
  timeline: coerceString((value as PromptDraft | undefined)?.timeline),
  resources: coerceString((value as PromptDraft | undefined)?.resources),
  finalPlan: coerceString((value as PromptDraft | undefined)?.finalPlan)
});

const toHistoryItem = (value: unknown): PromptHistoryItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as PromptHistoryItem;
  const label = coerceString(raw.label);
  const createdAt = coerceString(raw.createdAt);

  if (!label || !createdAt) {
    return null;
  }

  return {
    id: coerceString(raw.id) || crypto.randomUUID(),
    label,
    createdAt,
    draft: toDraft(raw.draft)
  };
};

const sanitizeState = (value: unknown): PersistedState => {
  if (!value || typeof value !== "object") {
    return DEFAULT_STATE;
  }

  const raw = value as PersistedState;
  const history = Array.isArray(raw.history)
    ? raw.history
        .map(toHistoryItem)
        .filter((item): item is PromptHistoryItem => item !== null)
    : [];

  return {
    version: typeof raw.version === "number" ? raw.version : DEFAULT_STATE.version,
    draft: toDraft(raw.draft),
    history
  };
};

const readState = async (): Promise<PersistedState> => {
  try {
    const content = await fs.readFile(getStatePath(), "utf-8");
    return sanitizeState(JSON.parse(content));
  } catch (error) {
    return DEFAULT_STATE;
  }
};

const writeState = async (state: PersistedState) => {
  await fs.writeFile(getStatePath(), JSON.stringify(state, null, 2));
};

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  if (isDev()) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle(
  "open-provider",
  async (_event, payload: OpenProviderRequest): Promise<OpenProviderResponse> => {
    if (!payload || typeof payload !== "object") {
      return { ok: false, error: "Invalid request." };
    }

    if (typeof payload.prompt !== "string" || typeof payload.providerId !== "string") {
      return { ok: false, error: "Invalid request payload." };
    }

    return openPromptInProvider(payload.providerId, payload.prompt);
  }
);

ipcMain.handle("load-state", async (): Promise<LoadStateResponse> => {
  try {
    const state = await readState();
    return { ok: true, state };
  } catch (error) {
    return { ok: false, error: "Failed to load saved state." };
  }
});

ipcMain.handle(
  "save-state",
  async (_event, payload: PersistedState): Promise<SaveStateResponse> => {
    try {
      const sanitized = sanitizeState(payload);
      await writeState(sanitized);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Failed to save state." };
    }
  }
);

ipcMain.handle(
  "export-plan",
  async (_event, content: string): Promise<ExportPlanResponse> => {
    if (typeof content !== "string" || !content.trim()) {
      return { ok: false, error: "There is no plan content to export." };
    }

    const result = await dialog.showSaveDialog({
      title: "Export plan",
      defaultPath: "jarvis-plan.md",
      filters: [{ name: "Markdown", extensions: ["md"] }]
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, error: "Export cancelled." };
    }

    await fs.writeFile(result.filePath, content, "utf-8");
    return { ok: true, path: result.filePath };
  }
);
