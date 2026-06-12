import { contextBridge, ipcRenderer } from "electron";
import {
  ExportPlanResponse,
  LoadStateResponse,
  OpenProviderRequest,
  OpenProviderResponse,
  PersistedState,
  SaveStateResponse
} from "../shared/config";

const api = {
  openProvider: (payload: OpenProviderRequest): Promise<OpenProviderResponse> =>
    ipcRenderer.invoke("open-provider", payload),
  loadState: (): Promise<LoadStateResponse> => ipcRenderer.invoke("load-state"),
  saveState: (state: PersistedState): Promise<SaveStateResponse> =>
    ipcRenderer.invoke("save-state", state),
  exportPlan: (content: string): Promise<ExportPlanResponse> =>
    ipcRenderer.invoke("export-plan", content)
};

contextBridge.exposeInMainWorld("electronAPI", api);
