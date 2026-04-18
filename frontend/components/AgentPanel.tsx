'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentPhase {
  id: string;
  name: string;
  status: AgentStatus;
  summary?: string;
  logs: string[];
}

export interface AgentPanelProps {
  agents: AgentPhase[];
  progress: number;
  elapsedTime: number;
}

// Same shapes as landing page
const getAgentIcon = (id: string, status: AgentStatus) => {
  const color =
    status === 'idle' ? 'text-[var(--text-muted)]' :
    status === 'error' ? 'text-[var(--accent-dim)]' :
    'text-[var(--accent)]';

  switch (id) {
    case 'planner':
      return (
        <svg className={color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" />
        </svg>
      );
    case 'architect':
      return (
        <svg className={color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
      );
    case 'developer':
      return (
        <svg className={color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" />
        </svg>
      );
    case 'debugger':
      return (
        <svg className={color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case 'tester':
      return (
        <svg className={color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L22 12L12 22L2 12L12 2Z" />
        </svg>
      );
    default:
      return null;
  }
};

const StatusIndicator = ({ status, summary }: { status: AgentStatus; summary?: string }) => {
  if (status === 'idle') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
        <span className="font-body text-[13px] text-[var(--text-muted)]">waiting...</span>
      </div>
    );
  }
  
  if (status === 'running') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-[pulseGlow_1.5s_ease-in-out_infinite]" />
        <span className="font-body text-[13px] text-[var(--accent)]">thinking...</span>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="font-body text-[13px] text-[var(--accent)]">
          {summary || 'completed'}
        </span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-dim)]" />
        <span className="font-body text-[13px] text-[var(--accent-dim)]">error occurred</span>
      </div>
    );
  }

  return null;
};

const AgentPanel = ({ agents, progress, elapsedTime }: AgentPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Format time (e.g. 12.4s)
  const formattedTime = (elapsedTime / 10).toFixed(1) + 's';

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-[var(--bg-primary)] border-l border border-[var(--border)] lg:border-t-0" style={{ borderRadius: 0 }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="font-mono text-[14px] text-[var(--text-muted)] uppercase tracking-widest">
          Pipeline Status
        </div>
        <div className="font-mono text-[14px] text-[var(--accent)]">
          {formattedTime}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-[2px] bg-[var(--bg-secondary)] relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-[var(--accent)]"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.2 }}
        />
      </div>

      {/* Agent Rows */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const isExpanded = expandedId === agent.id;
          
          return (
            <div key={agent.id} className="border-b border-[var(--border)]">
              {/* Row Header */}
              <div 
                className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : agent.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-8 h-8 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-secondary)]">
                    {getAgentIcon(agent.id, agent.status)}
                  </div>
                  
                  {/* Name & Status */}
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-[15px] text-[var(--text-primary)] leading-none">
                      {agent.name}
                    </span>
                    <StatusIndicator status={agent.status} summary={agent.summary} />
                  </div>
                </div>

                {/* Arrow */}
                <div className={`text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9L12 15L18 9" />
                  </svg>
                </div>
              </div>

              {/* Collapsible Output Output block */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[var(--bg-primary)] p-6 border-t border-[var(--border)] border-dashed font-mono text-[12px] text-[var(--text-secondary)] leading-relaxed max-h-[250px] overflow-y-auto">
                      {agent.logs.length === 0 ? (
                        <span className="text-[var(--text-muted)] italic">No output yet...</span>
                      ) : (
                        agent.logs.map((log, idx) => (
                          <div key={idx} className="mb-1 break-words">{log}</div>
                        ))
                      )}
                      
                      {agent.status === 'running' && (
                        <div className="inline-block w-2 h-3 bg-[var(--text-secondary)] ml-1 animate-[cursorBlink_1s_step-end_infinite] translate-y-[2px]" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentPanel;
