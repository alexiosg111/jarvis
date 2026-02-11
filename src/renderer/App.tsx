import React, { useState, useEffect } from 'react';
import { AGENTS, Task, Plan, formatPlanForExport } from '../shared/config';

declare global {
  interface Window {
    electronAPI: {
      openAgentBrowser: (agent: string, task: string, plan: string) => Promise<{ success: boolean; error?: string }>;
      getUserDataPath: () => Promise<string>;
      readUserData: () => Promise<{ tasks: Task[]; plans: Plan[]; history: any[] } | null>;
      writeUserData: (data: { tasks?: Task[]; plans?: Plan[]; history?: any[] }) => Promise<void>;
    };
  }
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [taskInput, setTaskInput] = useState('');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<Task[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Autosave every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveUserData();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentTask, plans, history]);

  const loadUserData = async () => {
    try {
      const data = await window.electronAPI.readUserData();
      if (data) {
        setHistory(data.tasks || []);
        setPlans(data.plans || []);
        if (data.tasks && data.tasks.length > 0) {
          setCurrentTask(data.tasks[0]);
          setTaskInput(data.tasks[0].description);
        }
      }
    } catch (err) {
      showToast('Failed to load saved data', 'error');
    }
  };

  const saveUserData = async () => {
    try {
      const tasks = currentTask ? [currentTask] : [];
      await window.electronAPI.writeUserData({
        tasks,
        plans,
        history,
      });
    } catch (err) {
      console.error('Failed to save user data:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSetTask = () => {
    if (!taskInput.trim()) {
      showToast('Please enter a task description', 'error');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      description: taskInput,
      timestamp: Date.now(),
    };

    setCurrentTask(newTask);
    setPlans([]);
    setHistory((prev) => [newTask, ...prev]);
    showToast('Task set successfully', 'success');
    saveUserData();
  };

  const handleOpenAgent = async (agent: string, plan: Plan) => {
    if (!currentTask) {
      showToast('Please set a task first', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.openAgentBrowser(agent, currentTask.description, plan.content);
      if (result.success) {
        showToast(`Opening ${agent}...`, 'success');
      } else {
        showToast(result.error || 'Failed to open agent', 'error');
      }
    } catch (err) {
      showToast('Failed to open agent browser', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleExportPlan = (plan: Plan) => {
    if (!currentTask) return;

    const exportText = formatPlanForExport(plan, currentTask);
    handleCopyToClipboard(exportText);
  };

  const handleExportAll = () => {
    if (!currentTask || plans.length === 0) {
      showToast('No plans to export', 'error');
      return;
    }

    const allPlans = plans
      .map((plan) => formatPlanForExport(plan, currentTask!))
      .join('\n\n' + '='.repeat(50) + '\n\n');

    handleCopyToClipboard(allPlans);
  };

  const handleLoadFromHistory = (task: Task) => {
    setCurrentTask(task);
    setTaskInput(task.description);
    // Load plans associated with this task
    const taskPlans = plans.filter((p) => p.taskId === task.id);
    setPlans(taskPlans);
    showToast('Task loaded from history', 'success');
  };

  const handleClearTask = () => {
    setCurrentTask(null);
    setTaskInput('');
    setPlans([]);
    showToast('Task cleared', 'success');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Set task
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSetTask();
      }
      // Ctrl/Cmd + E: Export all plans
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportAll();
      }
      // Ctrl/Cmd + N: Clear task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleClearTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskInput, currentTask, plans]);

  return (
    <div className="app-container">
      <div className="header">
        <h1>jarvis-hub</h1>
        <p>Multi-agent planning flow with unified prompt configuration</p>
      </div>

      <div className="content">
        <div className="left-panel">
          <div className="task-section">
            <h2 className="section-title">Task Description</h2>
            <textarea
              className="textarea task-input"
              placeholder="Enter your task here..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              disabled={!!currentTask}
            />
            <div className="button-group">
              {!currentTask ? (
                <>
                  <button className="button" onClick={handleSetTask}>
                    Set Task (Ctrl+Enter)
                  </button>
                  <button className="button button-secondary" onClick={handleLoadFromHistory.bind(null, history[0])} disabled={!history.length}>
                    Load Last Task
                  </button>
                </>
              ) : (
                <>
                  <button className="button button-secondary" onClick={handleClearTask}>
                    Clear Task (Ctrl+N)
                  </button>
                  <button className="button button-secondary" onClick={() => setTaskInput(currentTask.description)}>
                    Edit Task
                  </button>
                </>
              )}
            </div>
          </div>

          {currentTask && (
            <div className="plans-section">
              <h2 className="section-title">Plans</h2>
              <div className="plans-list">
                {plans.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No plans yet. Add plans manually to compare agent outputs.</p>
                ) : (
                  plans.map((plan) => (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-header">
                        <span className="plan-agent">{plan.agent}</span>
                        <span className="plan-time">
                          {new Date(plan.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="plan-content">{plan.content}</div>
                      <div className="plan-actions">
                        <button
                          className="button button-small"
                          onClick={() => handleOpenAgent(plan.agent, plan)}
                          disabled={isLoading}
                        >
                          Open in {plan.agent}
                        </button>
                        <button
                          className="button button-small button-secondary"
                          onClick={() => handleCopyToClipboard(plan.content)}
                        >
                          Copy
                        </button>
                        <button
                          className="button button-small button-secondary"
                          onClick={() => handleExportPlan(plan)}
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {plans.length > 0 && (
                <button className="button button-secondary" onClick={handleExportAll}>
                  Export All Plans (Ctrl+E)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="history-section">
            <h2 className="section-title">Task History</h2>
            <div className="history-list">
              {history.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No task history yet.</p>
              ) : (
                history.map((task) => (
                  <div
                    key={task.id}
                    className="history-item"
                    onClick={() => handleLoadFromHistory(task)}
                  >
                    <div className="history-item-title">{task.description.slice(0, 100)}</div>
                    <div className="history-item-time">
                      {new Date(task.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {currentTask && (
            <div>
              <h2 className="section-title">Quick Actions</h2>
              <div className="button-group">
                {AGENTS.map((agent) => (
                  <button
                    key={agent.name}
                    className="button"
                    onClick={() => {
                      if (plans.length > 0) {
                        handleOpenAgent(agent.name, plans[0]);
                      } else {
                        showToast('Add a plan first', 'error');
                      }
                    }}
                    disabled={isLoading || plans.length === 0}
                  >
                    Open {agent.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
