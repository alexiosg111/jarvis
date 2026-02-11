export interface AgentConfig {
  name: string;
  url: string;
  requiresQuery: boolean;
}

export interface Task {
  id: string;
  description: string;
  timestamp: number;
}

export interface Plan {
  id: string;
  taskId: string;
  content: string;
  agent: string;
  timestamp: number;
}

export const AGENTS: AgentConfig[] = [
  {
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    requiresQuery: true,
  },
  {
    name: 'z.ai',
    url: 'https://z.ai',
    requiresQuery: true,
  },
  {
    name: 'Comet',
    url: 'https://comet.openeuler.org',
    requiresQuery: true,
  },
];

const MAX_URL_LENGTH = 2000;

export function buildPromptUrl(
  agent: string,
  task: string,
  plan: string
): string {
  const agentConfig = AGENTS.find((a) => a.name === agent);
  if (!agentConfig) {
    throw new Error(`Unknown agent: ${agent}`);
  }

  const prompt = `Task: ${task}\n\nPlan: ${plan}`;
  const encodedPrompt = encodeURIComponent(prompt);

  if (encodedPrompt.length > MAX_URL_LENGTH) {
    throw new Error('Prompt is too long to send via URL. Please shorten your task or plan.');
  }

  if (!agentConfig.requiresQuery) {
    return agentConfig.url;
  }

  return `${agentConfig.url}?prompt=${encodedPrompt}`;
}

export function formatPlanForExport(plan: Plan, task: Task): string {
  return `Task: ${task.description}\n\nPlan (from ${plan.agent}):\n${plan.content}\n\nGenerated: ${new Date(plan.timestamp).toISOString()}`;
}

export function validateTaskInput(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Task description is required' };
  }
  if (description.length > 10000) {
    return { valid: false, error: 'Task description is too long (max 10000 characters)' };
  }
  return { valid: true };
}

export function validatePlanInput(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Plan content is required' };
  }
  if (content.length > 50000) {
    return { valid: false, error: 'Plan content is too long (max 50000 characters)' };
  }
  return { valid: true };
}
