import { shell } from 'electron';

export function openUrlWithOrchestrator(url: string): void {
  shell.openExternal(url).catch((err) => {
    console.error('Failed to open URL:', err);
    throw new Error(`Failed to open URL in browser: ${err.message}`);
  });
}

export async function openAgentBrowser(
  agent: string,
  task: string,
  plan: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { buildPromptUrl } = await import('../shared/config');
    const url = buildPromptUrl(agent, task, plan);
    openUrlWithOrchestrator(url);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
