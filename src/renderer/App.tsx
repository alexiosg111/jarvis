import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  AGENT_ROLES,
  buildMultiAgentPrompt,
  DEFAULT_DRAFT,
  DEFAULT_STATE,
  MAX_URL_LENGTH,
  PersistedState,
  PromptDraft,
  PromptHistoryItem,
  ProviderId,
  PROVIDERS
} from "../shared/config";

type Toast = {
  message: string;
  tone?: "error" | "success";
};

const HISTORY_LIMIT = 20;

const App = () => {
  const [draft, setDraft] = useState<PromptDraft>(DEFAULT_DRAFT);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<ProviderId>("kimi");
  const hasLoaded = useRef(false);

  const prompt = useMemo(
    () =>
      buildMultiAgentPrompt({
        task: draft.task,
        context: draft.context,
        constraints: draft.constraints,
        successCriteria: draft.successCriteria,
        timeline: draft.timeline,
        resources: draft.resources
      }),
    [draft]
  );

  const promptLength = prompt.length;

  const showToast = useCallback((message: string, tone?: Toast["tone"]) => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const load = async () => {
      if (!window.electronAPI) {
        return;
      }

      const response = await window.electronAPI.loadState();
      if (response.ok && response.state) {
        setDraft(response.state.draft);
        setHistory(response.state.history);
      } else {
        setDraft(DEFAULT_STATE.draft);
      }

      hasLoaded.current = true;
    };

    load();
  }, []);

  useEffect(() => {
    if (!window.electronAPI || !hasLoaded.current) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const state: PersistedState = {
        version: 1,
        draft,
        history
      };
      const response = await window.electronAPI.saveState(state);
      if (response.ok) {
        setLastSavedAt(new Date().toLocaleTimeString());
      } else if (response.error) {
        showToast(response.error, "error");
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [draft, history, showToast]);

  const updateField = (field: keyof PromptDraft) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDraft((prev) => ({ ...prev, [field]: value }));
    };

  const handleOpenProvider = useCallback(
    async (providerId: ProviderId) => {
      setActiveProvider(providerId);

      if (!draft.task.trim()) {
        showToast("Add a primary task before launching.", "error");
        return;
      }

      if (!window.electronAPI) {
        showToast("Electron bridge not available.", "error");
        return;
      }

      const response = await window.electronAPI.openProvider({
        providerId,
        prompt
      });

      if (!response.ok) {
        showToast(response.error ?? "Failed to open provider.", "error");
        return;
      }

      showToast(`Opened ${PROVIDERS[providerId].label}.`, "success");
    },
    [draft.task, prompt, showToast]
  );

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard.`, "success");
      } catch (error) {
        showToast("Clipboard copy failed.", "error");
      }
    },
    [showToast]
  );

  const handleExport = useCallback(async () => {
    if (!draft.finalPlan.trim()) {
      showToast("Add plan content before exporting.", "error");
      return;
    }

    if (!window.electronAPI) {
      showToast("Electron bridge not available.", "error");
      return;
    }

    const response = await window.electronAPI.exportPlan(draft.finalPlan);

    if (!response.ok) {
      showToast(response.error ?? "Export failed.", "error");
      return;
    }

    showToast(`Plan exported to ${response.path}.`, "success");
  }, [draft.finalPlan, showToast]);

  const handleSaveHistory = useCallback(() => {
    const trimmedTask = draft.task.trim();
    const label = trimmedTask ? trimmedTask : "Untitled task";
    const entry: PromptHistoryItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label,
      draft: { ...draft }
    };

    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
    showToast("Snapshot saved to history.", "success");
  }, [draft, showToast]);

  const handleLoadHistory = (entry: PromptHistoryItem) => {
    setDraft(entry.draft);
    showToast(`Loaded snapshot: ${entry.label}`, "success");
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setDraft(DEFAULT_DRAFT);
    showToast("Draft cleared.", "success");
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleOpenProvider("kimi");
      }

      if (event.ctrlKey && event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        handleOpenProvider("zai");
      }

      if (event.ctrlKey && event.altKey && event.key === "Enter") {
        event.preventDefault();
        handleOpenProvider("comet");
      }

      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveHistory();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleOpenProvider, handleSaveHistory]);

  const providerButtons = Object.values(PROVIDERS);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Jarvis Hub</h1>
          <p className="app__subtitle">
            Multi-agent planning console for orchestrating Kimi, Z.ai, and Comet.
          </p>
        </div>
        <div className="header__row">
          <span className="tag">Active: {PROVIDERS[activeProvider].label}</span>
          {lastSavedAt && <span className="tag">Autosaved {lastSavedAt}</span>}
          <span className="tag">Prompt length: {promptLength} / {MAX_URL_LENGTH}</span>
          {promptLength > MAX_URL_LENGTH && (
            <span className="tag">Shorten prompt to avoid URL limits</span>
          )}
        </div>
        <div className="header__row">
          {providerButtons.map((provider) => (
            <button
              key={provider.id}
              className="button button--primary"
              type="button"
              onClick={() => handleOpenProvider(provider.id)}
            >
              Open in {provider.label}
            </button>
          ))}
          <button className="button" type="button" onClick={handleSaveHistory}>
            Save snapshot (Ctrl+S)
          </button>
          <button className="button button--ghost" type="button" onClick={handleReset}>
            Clear draft
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2 className="panel__title">Task Intake</h2>
          <div className="field">
            <label htmlFor="task">Primary task</label>
            <textarea
              id="task"
              value={draft.task}
              onChange={updateField("task")}
              placeholder="Describe the core objective."
            />
          </div>
          <div className="field">
            <label htmlFor="context">Background & context</label>
            <textarea
              id="context"
              value={draft.context}
              onChange={updateField("context")}
              placeholder="Share relevant background, stakeholders, or constraints."
            />
          </div>
          <div className="field">
            <label htmlFor="constraints">Constraints & must-haves</label>
            <textarea
              id="constraints"
              value={draft.constraints}
              onChange={updateField("constraints")}
              placeholder="Budget, deadlines, technical constraints, etc."
            />
          </div>
          <div className="field">
            <label htmlFor="successCriteria">Success criteria</label>
            <textarea
              id="successCriteria"
              value={draft.successCriteria}
              onChange={updateField("successCriteria")}
              placeholder="How will you know the plan is successful?"
            />
          </div>
          <div className="field">
            <label htmlFor="timeline">Timeline considerations</label>
            <textarea
              id="timeline"
              value={draft.timeline}
              onChange={updateField("timeline")}
              placeholder="Key milestones or timing expectations."
            />
          </div>
          <div className="field">
            <label htmlFor="resources">Available resources</label>
            <textarea
              id="resources"
              value={draft.resources}
              onChange={updateField("resources")}
              placeholder="Teams, tools, budgets, data sources, etc."
            />
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Prompt & Plan Output</h2>
          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={() => handleCopy(prompt, "Prompt")}
            >
              Copy prompt
            </button>
            <button
              className="button"
              type="button"
              onClick={() => handleCopy(draft.finalPlan, "Plan")}
            >
              Copy plan
            </button>
            <button className="button" type="button" onClick={handleExport}>
              Export plan
            </button>
          </div>
          <div className="prompt-preview">{prompt}</div>
          <div className="field">
            <label htmlFor="finalPlan">Final plan output</label>
            <textarea
              id="finalPlan"
              value={draft.finalPlan}
              onChange={updateField("finalPlan")}
              placeholder="Paste or refine the final plan here after generating it."
            />
          </div>
          <div className="meta">
            Shortcut: Ctrl+Enter (Kimi), Ctrl+Shift+Enter (Z.ai), Ctrl+Alt+Enter (Comet)
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Prompt Roles & History</h2>
          <div className="meta">
            Multi-agent roles: {AGENT_ROLES.map((role) => role.name).join(", ")}
          </div>
          <div className="history-list">
            {history.length === 0 && (
              <div className="meta">No saved snapshots yet.</div>
            )}
            {history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div>
                  <strong>{entry.label}</strong>
                  <div className="meta">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="history-item__actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => handleLoadHistory(entry)}
                  >
                    Load
                  </button>
                  <button
                    className="button button--danger"
                    type="button"
                    onClick={() => handleDeleteHistory(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
