export type ProviderId = "kimi" | "zai" | "comet";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  baseUrl: string;
  queryParam: string;
  appName?: string;
  description: string;
}

export interface OpenProviderRequest {
  providerId: ProviderId;
  prompt: string;
}

export interface OpenProviderResponse {
  ok: boolean;
  error?: string;
  url?: string;
}

export interface SaveStateResponse {
  ok: boolean;
  error?: string;
}

export interface LoadStateResponse {
  ok: boolean;
  error?: string;
  state?: PersistedState;
}

export interface ExportPlanResponse {
  ok: boolean;
  error?: string;
  path?: string;
}

export const MAX_URL_LENGTH = 1900;

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  kimi: {
    id: "kimi",
    label: "Kimi",
    baseUrl: "https://kimi.moonshot.cn/",
    queryParam: "prompt",
    description: "Moonshot Kimi chat"
  },
  zai: {
    id: "zai",
    label: "Z.ai",
    baseUrl: "https://chat.z.ai/",
    queryParam: "q",
    description: "Z.ai chat"
  },
  comet: {
    id: "comet",
    label: "Comet",
    baseUrl: "https://www.perplexity.ai/",
    queryParam: "q",
    description: "Perplexity Comet browser",
    appName: "Comet"
  }
};

export const AGENT_ROLES = [
  {
    name: "Planner",
    focus: "Decompose the task into phases, dependencies, and success criteria."
  },
  {
    name: "Risk Analyst",
    focus: "Surface assumptions, risks, and open questions that need validation."
  },
  {
    name: "Builder",
    focus: "Propose concrete execution steps, tools, and artifacts."
  },
  {
    name: "Synthesizer",
    focus: "Merge the best ideas into a concise, prioritized plan."
  }
];

export interface PromptInputs {
  task: string;
  context: string;
  constraints: string;
  successCriteria: string;
  timeline: string;
  resources: string;
}

export interface PromptDraft extends PromptInputs {
  finalPlan: string;
}

export const DEFAULT_DRAFT: PromptDraft = {
  task: "",
  context: "",
  constraints: "",
  successCriteria: "",
  timeline: "",
  resources: "",
  finalPlan: ""
};

export interface PromptHistoryItem {
  id: string;
  createdAt: string;
  label: string;
  draft: PromptDraft;
}

export interface PersistedState {
  version: number;
  draft: PromptDraft;
  history: PromptHistoryItem[];
}

export const DEFAULT_STATE: PersistedState = {
  version: 1,
  draft: DEFAULT_DRAFT,
  history: []
};

const formatSection = (label: string, value: string) =>
  value.trim() ? `### ${label}\n${value.trim()}\n` : "";

export const buildMultiAgentPrompt = (inputs: PromptInputs) => {
  const roleLines = AGENT_ROLES.map(
    (role, index) => `${index + 1}. ${role.name}: ${role.focus}`
  ).join("\n");

  return [
    "You are Jarvis Hub, orchestrating a multi-agent planning flow.",
    "Coordinate the following roles and synthesize a final plan:",
    roleLines,
    "",
    "Use the context below:",
    formatSection("Task", inputs.task),
    formatSection("Context", inputs.context),
    formatSection("Constraints", inputs.constraints),
    formatSection("Success Criteria", inputs.successCriteria),
    formatSection("Timeline", inputs.timeline),
    formatSection("Resources", inputs.resources),
    "",
    "Output a concise plan with headings:",
    "- Overview",
    "- Milestones",
    "- Risks & Mitigations",
    "- Immediate Next Actions",
    "- Open Questions",
    "",
    "Be decisive, actionable, and prioritize clarity."
  ]
    .filter(Boolean)
    .join("\n");
};

export const buildProviderUrl = (providerId: ProviderId, prompt: string) => {
  const provider = PROVIDERS[providerId];
  const url = new URL(provider.baseUrl);
  url.searchParams.set(provider.queryParam, prompt);
  return url.toString();
};
