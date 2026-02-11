import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  openAgentBrowser: (agent: string, task: string, plan: string) => Promise<{ success: boolean; error?: string }>;
  getUserDataPath: () => Promise<string>;
  readUserData: () => Promise<{ tasks: any[]; plans: any[]; history: any[] } | null>;
  writeUserData: (data: { tasks?: any[]; plans?: any[]; history?: any[] }) => Promise<void>;
}

const electronAPI: ElectronAPI = {
  openAgentBrowser: (agent: string, task: string, plan: string) =>
    ipcRenderer.invoke('open-agent-browser', agent, task, plan),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  readUserData: () => ipcRenderer.invoke('read-user-data'),
  writeUserData: (data) => ipcRenderer.invoke('write-user-data', data),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
