import type {
  ExportPlanResponse,
  LoadStateResponse,
  OpenProviderRequest,
  OpenProviderResponse,
  PersistedState,
  SaveStateResponse
} from "../shared/config";

export {};

declare global {
  interface Window {
    electronAPI?: {
      openProvider: (payload: OpenProviderRequest) => Promise<OpenProviderResponse>;
      loadState: () => Promise<LoadStateResponse>;
      saveState: (state: PersistedState) => Promise<SaveStateResponse>;
      exportPlan: (content: string) => Promise<ExportPlanResponse>;
    };
  }
}
