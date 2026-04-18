'use client';

import React, { useReducer, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from '@/components/Nav';
import AgentPanel, { AgentPhase, AgentStatus } from '@/components/AgentPanel';
import LogStream, { LogEntry, LogEntryType } from '@/components/LogStream';
import CodeOutput, { CodeFile } from '@/components/CodeOutput';
import { runPipeline, PipelineEvent } from '@/lib/api';
import { runMockPipeline } from '@/lib/mockPipeline';

// --- CSS-based Confetti Particle Component --- //
const ConfettiRain = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; delay: number; color: string; duration: number }[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#E8821A', '#F59E0B', '#F5F0E8', '#3D3A35'];
      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: -10,
        delay: Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 1.5 + Math.random() * 2
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
          animate={{ 
            opacity: [1, 1, 0], 
            y: ['0vh', '100vh'],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)] 
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute w-2 h-3"
          style={{ 
            left: `${p.left}%`, 
            top: `${p.top}%`, 
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </div>
  );
};
// ------------------------------------------ //

type ScopeLevel = 'Minimal' | 'Standard' | 'Full';

interface AppState {
  appStatus: 'idle' | 'running' | 'done' | 'error';
  prompt: string;
  scope: ScopeLevel;
  progress: number;
  elapsedTime: number;
  agents: AgentPhase[];
  logs: LogEntry[];
  files: CodeFile[];
}

type AppAction =
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_SCOPE'; payload: ScopeLevel }
  | { type: 'START_PIPELINE' }
  | { type: 'UPDATE_AGENT'; payload: { id: string; status: AgentStatus; summary?: string; logObj?: string } }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'ADD_LOG'; payload: Omit<LogEntry, 'id'> }
  | { type: 'SET_FILES'; payload: CodeFile[] }
  | { type: 'TICK_TIME' }
  | { type: 'FINISH_PIPELINE' }
  | { type: 'ERROR_PIPELINE' };

const initialAgents: AgentPhase[] = [
  { id: 'planner', name: 'Planner', status: 'idle', logs: [] },
  { id: 'architect', name: 'Architect', status: 'idle', logs: [] },
  { id: 'developer', name: 'Developer', status: 'idle', logs: [] },
  { id: 'debugger', name: 'Debugger', status: 'idle', logs: [] },
  { id: 'tester', name: 'Tester', status: 'idle', logs: [] },
];

const initialState: AppState = {
  appStatus: 'idle',
  prompt: '',
  scope: 'Standard',
  progress: 0,
  elapsedTime: 0,
  agents: initialAgents,
  logs: [],
  files: [],
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const getTimeString = () => new Date().toTimeString().split(' ')[0];

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROMPT': return { ...state, prompt: action.payload };
    case 'SET_SCOPE': return { ...state, scope: action.payload };
    case 'START_PIPELINE':
      return { 
        ...state, 
        appStatus: 'running', 
        progress: 0, 
        elapsedTime: 0,
        agents: state.agents.map(a => ({ ...a, status: 'idle', logs: [], summary: undefined })),
        logs: [],
        files: [],
      };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map(a => {
          if (a.id === action.payload.id) {
            return {
              ...a,
              status: action.payload.status,
              summary: action.payload.summary || a.summary,
              logs: action.payload.logObj ? [...a.logs, action.payload.logObj] : a.logs
            };
          }
          return a;
        }),
      };
    case 'ADD_LOG': return { ...state, logs: [...state.logs, { ...action.payload, id: generateId() }] };
    case 'SET_FILES': return { ...state, files: action.payload };
    case 'UPDATE_PROGRESS': return { ...state, progress: action.payload };
    case 'TICK_TIME': return { ...state, elapsedTime: state.elapsedTime + 1 };
    case 'FINISH_PIPELINE': return { ...state, appStatus: 'done', progress: 100 };
    case 'ERROR_PIPELINE': return { ...state, appStatus: 'error' };
    default: return state;
  }
}

export default function AppPage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    // Graceful check for Demo Query Param without Next Router Suspense triggers locally
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsDemoMode(urlParams.get('demo') === 'true');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (state.prompt.trim() && state.appStatus !== 'running') {
          handleStartPipeline();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.prompt, state.appStatus]);

  useEffect(() => {
    if (state.appStatus === 'running') {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK_TIME' }), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.appStatus]);

  const mapSSEStatusToLogType = (status: string, output?: string): LogEntryType => {
    if (status === 'error') return 'error';
    if (status === 'done') return 'success';
    if (output && output.includes('```')) return 'code';
    if (status === 'pipeline_complete') return 'success';
    return 'info';
  };

  const handleStartPipeline = () => {
    if (!state.prompt.trim()) return;
    if (streamRef.current) streamRef.current.cancel();

    dispatch({ type: 'START_PIPELINE' });
    dispatch({ 
      type: 'ADD_LOG', 
      payload: { timestamp: getTimeString(), agent: 'system', message: `Initializing webhook payload: Scope [${state.scope}]...`, type: 'info' } 
    });

    const stream = isDemoMode ? runMockPipeline(state.prompt, state.scope) : runPipeline(state.prompt, state.scope);
    streamRef.current = stream;

    stream.subscribe(
      (data: PipelineEvent) => {
        if (data.status === 'pipeline_complete') {
          if (data.files && data.files.length > 0) dispatch({ type: 'SET_FILES', payload: data.files });
          dispatch({ type: 'FINISH_PIPELINE' });
          dispatch({ 
            type: 'ADD_LOG', 
            payload: { timestamp: getTimeString(), agent: 'system', message: 'Pipeline executed successfully.', type: 'success' } 
          });
          return;
        }

        dispatch({ 
          type: 'UPDATE_AGENT', 
          payload: { 
            id: data.agent.toLowerCase(), 
            status: data.status,
            logObj: data.output || data.message,
            summary: data.status === 'done' ? 'Completed' : undefined
          } 
        });

        dispatch({
          type: 'ADD_LOG',
          payload: {
            timestamp: getTimeString(),
            agent: data.agent,
            message: data.output || data.message,
            type: mapSSEStatusToLogType(data.status, data.output)
          }
        });

        const agentPhaseMap: Record<string, number> = { planner: 20, architect: 40, developer: 60, debugger: 80, tester: 100 };
        if (data.status === 'done' && data.agent) {
          const prog = agentPhaseMap[data.agent.toLowerCase()] || state.progress;
          dispatch({ type: 'UPDATE_PROGRESS', payload: prog });
        }

        if (data.files && data.files.length > 0) {
          dispatch({ type: 'SET_FILES', payload: data.files });
        }
      },
      (err) => {
        dispatch({ type: 'ERROR_PIPELINE' });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: getTimeString(), agent: 'system', message: 'SSE connection dropped or pipeline failed.', type: 'error' }});
      }
    );
  };

  const handleExportZip = () => { if (state.files.length > 0) alert('ZIP generation initialized.'); };

  const examples = ["Student dashboard with auth", "REST API for a todo app", "Landing page for a SaaS product"];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-body text-[var(--text-primary)]">

      {/* Fixed Nav - always on top */}
      <Nav />
      <ConfettiRain active={state.appStatus === 'done'} />

      {/* Spacer pushes all content below the fixed Nav (nav height ~72px desktop) */}
      <div className="pt-[72px] flex flex-col flex-1">

        {/* Demo Mode Banner - inside scroll flow, below Nav */}
        <AnimatePresence>
          {isDemoMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="w-full bg-[var(--accent)] text-[#0A0A0A] px-4 py-2 flex items-center justify-center border-b border-[var(--border)] z-30 text-center"
            >
              <span className="font-display font-bold text-[12px] md:text-[13px] uppercase tracking-[0.1em]">
                DEMO MODE ACTIVATED — Simulated Pipeline Running (NO API KEY REQ)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-header: sticky below nav. top-0 because the outer div already starts below nav */}
        <div className="sticky top-0 z-40 bg-[rgba(10,10,10,0.92)] border-b border-[var(--border)] backdrop-blur-md">
          <div className="w-full px-4 md:px-6 flex items-center justify-between h-14 max-w-[1920px] mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/" aria-label="Go back" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] transition-colors flex items-center justify-center font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                &larr;
              </Link>
              <span className="font-display font-medium text-[15px] md:text-[16px] text-[var(--text-primary)] truncate">
                {isDemoMode ? 'Project (Demo Version)' : 'New Project'}
              </span>
            </div>

            <button
              onClick={handleExportZip}
              disabled={state.appStatus !== 'done'}
              aria-label="Export generated files to ZIP"
              className="px-4 py-1.5 min-h-[44px] border border-[var(--border)] text-[var(--text-primary)] text-[12px] uppercase tracking-wider font-mono hover:bg-[var(--bg-card)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Export ZIP
            </button>
          </div>
        </div>

      <main className="flex-1 w-full flex flex-col items-center overflow-x-hidden">
        <AnimatePresence>
          {state.appStatus === 'done' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="w-full bg-[var(--accent)] text-[#0A0A0A] px-4 md:px-6 py-4 flex items-center justify-center border-b border-[#0A0A0A]"
            >
              <span className="font-display font-bold text-[14px] md:text-[15px] uppercase tracking-wider text-center">
                Pipeline complete in {(state.elapsedTime / 10).toFixed(1)}s &middot; {state.files.length} files generated
              </span>
            </motion.div>
          )}

          {state.appStatus === 'error' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="w-full bg-[#C0524A] text-white px-4 md:px-6 py-4 flex items-center justify-center border-b border-[#0A0A0A]"
            >
              <span className="font-display font-bold text-[14px] md:text-[15px] uppercase tracking-wider text-center">
                Pipeline encountered a fatal error. Check the logs.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-[1920px] px-0 flex-1 grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-12 auto-rows-min md:border-x border-[var(--border)] relative z-10 shadow-2xl">
          
          <div className="col-span-1 lg:col-span-5 2xl:col-span-4 px-4 sm:px-6 md:px-8 py-8 md:py-10 flex flex-col bg-[var(--bg-primary)] lg:border-r border-[var(--border)]">
            <h1 className="font-display font-bold text-[clamp(28px,4vw,40px)] text-[var(--text-primary)] leading-[1.1] tracking-tight mb-8">
              What do you want to build?
            </h1>
            <div className="relative mb-8">
              <textarea
                value={state.prompt}
                onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
                disabled={state.appStatus === 'running'}
                aria-label="Prompt input area"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-body text-[15px] md:text-[16px] leading-[1.6] p-4 md:p-5 pb-10 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)] transition-colors resize-y"
                style={{ minHeight: '160px', borderRadius: 0 }}
                placeholder="Describe your project idea... e.g. 'A student dashboard with login...'"
              />
              <div className="absolute bottom-3 right-4 font-mono text-[10px] text-[var(--text-muted)] hidden sm:block">
                Cmd/Ctrl + Enter to run
              </div>
            </div>

            <div className="flex flex-col gap-6 mb-10 w-full">
              <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                <span className="font-display font-semibold text-[14px] text-[var(--text-secondary)] uppercase tracking-wider min-w-[60px]">
                  Scope:
                </span>
                <div className="flex flex-row overflow-hidden border border-[var(--border)] bg-[var(--border)]" style={{ borderRadius: 0 }}>
                  {(['Minimal', 'Standard', 'Full'] as ScopeLevel[]).map((level) => {
                    const isActive = state.scope === level;
                    return (
                      <button
                        key={level}
                        disabled={state.appStatus === 'running'}
                        onClick={() => dispatch({ type: 'SET_SCOPE', payload: level })}
                        aria-pressed={isActive}
                        className={`flex-1 px-2 md:px-4 py-2 min-h-[44px] font-display text-[12px] md:text-[13px] uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:z-10 relative ${
                          isActive 
                            ? 'bg-[var(--accent)] text-[#0A0A0A] font-bold' 
                            : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                        }`}
                        style={{ borderRadius: 0 }}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {state.appStatus === 'error' ? (
                <button
                  onClick={handleStartPipeline}
                  aria-label="Retry pipeline"
                  className="w-full relative min-h-[56px] flex items-center justify-center bg-[#C0524A] text-white font-display font-bold text-[16px] md:text-[18px] uppercase tracking-[0.1em] hover:bg-[#A3433C] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C0524A]/50"
                  style={{ borderRadius: 0 }}
                >
                  Retry Pipeline ↺
                </button>
              ) : (
                <button
                  disabled={!state.prompt.trim() || state.appStatus === 'running'}
                  onClick={handleStartPipeline}
                  aria-label="Start pipeline execution"
                  className={`w-full relative min-h-[56px] flex items-center justify-center text-[#0A0A0A] font-display font-bold text-[16px] md:text-[18px] uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/50 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDemoMode ? 'bg-[#F5F0E8] hover:bg-white' : 'bg-[var(--accent)] hover:bg-[#F59E0B]'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {state.appStatus === 'running' ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center gap-1">
                        <motion.div className="w-1.5 h-1.5 bg-[#0A0A0A]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-1.5 h-1.5 bg-[#0A0A0A]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 bg-[#0A0A0A]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                      </div>
                      WORKING...
                    </div>
                  ) : (
                    isDemoMode ? 'Start Demo Pipeline →' : 'Start Pipeline →'
                  )}
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <span className="font-body text-[13px] text-[var(--text-muted)]">Try an example:</span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch({ type: 'SET_PROMPT', payload: ex })}
                    disabled={state.appStatus === 'running'}
                    className="px-3 py-1.5 min-h-[44px] border border-[var(--border)] text-[var(--text-secondary)] font-body text-[12px] hover:border-[var(--border-light)] hover:text-[var(--text-primary)] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    style={{ borderRadius: 0 }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-7 2xl:col-span-4 flex flex-col 2xl:border-r border-[var(--border)] bg-[var(--bg-primary)]">
            <div className="flex-1 max-h-[1000px] lg:max-h-full">
              <AgentPanel agents={state.agents} progress={state.progress} elapsedTime={state.elapsedTime} />
            </div>
            <div className="border-t border-[var(--border)]">
              <LogStream entries={state.logs} isRunning={state.appStatus === 'running'} />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-12 2xl:col-span-4 flex flex-col bg-[#0A0A0A] border-t lg:border-t-0 border-[var(--border)] lg:min-h-[500px]">
            <CodeOutput files={state.files} />
          </div>

        </div>
      </main>
      </div>{/* end pt-[72px] spacer */}
    </div>
  );
}
