'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type LogEntryType = 'info' | 'success' | 'error' | 'code';

export interface LogEntry {
  id: string;
  timestamp: string; // e.g. "14:22:05"
  agent: string; // Fixed width to 12 chars
  message: string;
  type: LogEntryType;
}

interface LogStreamProps {
  entries: LogEntry[];
  isRunning: boolean;
}

const LogStream = ({ entries, isRunning }: LogStreamProps) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  // Color mapping based on entry type
  const getTypeClasses = (type: LogEntryType) => {
    switch (type) {
      case 'success':
        return 'text-[var(--accent)]';
      case 'error':
        return 'text-[var(--accent-dim)] bg-[var(--accent)]/10 px-1';
      case 'code':
        return 'text-[var(--text-primary)] bg-[var(--accent)]/10 px-1 border-l-2 border-[var(--accent)] ml-[-2px]';
      case 'info':
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  return (
    <div className="w-full bg-[var(--bg-primary)] border border-[var(--border)] flex flex-col font-mono" style={{ borderRadius: 0 }}>
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="text-[11px] text-[var(--accent)] uppercase tracking-widest font-bold">
          LIVE LOG
        </div>
        
        {/* Auto-scroll Toggle */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAutoScroll(!autoScroll)}>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
            Auto-Scroll
          </span>
          <div className="w-6 h-3 bg-[var(--bg-primary)] border border-[var(--border)] relative flex items-center transition-colors px-[1px]">
            <motion.div 
              className={`w-2 h-2 ${autoScroll ? 'bg-[var(--accent)]' : 'bg-[var(--border-light)]'}`}
              animate={{ x: autoScroll ? 12 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Log Body */}
      <div 
        ref={containerRef}
        className="w-full h-[320px] overflow-y-auto px-4 py-4 text-[13px] leading-relaxed relative flex flex-col"
      >
        {entries.length === 0 ? (
          <div className="text-[var(--text-muted)] h-full flex items-center justify-center opacity-70">
            <span className="animate-[cursorBlink_1s_step-end_infinite]">Waiting for pipeline to start_</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-full flex items-start gap-3 justify-start mb-1.5"
              >
                {/* Timestamp */}
                <span className="text-[var(--text-muted)] flex-shrink-0 text-[11px] mt-[1px]">
                  [{entry.timestamp}]
                </span>
                
                {/* Agent Name */}
                <span className="text-[var(--accent)] flex-shrink-0 w-[12ch] text-left truncate">
                  {entry.agent}
                </span>
                
                {/* Message */}
                <span className={`flex-1 break-words whitespace-pre-wrap ${getTypeClasses(entry.type)}`}>
                  {entry.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Live Running Indicator */}
        {isRunning && (
          <div className="w-full flex items-start gap-3 mt-2">
             <span className="text-[var(--text-muted)] flex-shrink-0 text-[11px] mt-[1px] opacity-0">
                [00:00:00]
              </span>
              <span className="text-[var(--accent)] flex-shrink-0 w-[12ch] opacity-0 text-left">
                Running
              </span>
             <span className="inline-block w-2.5 h-4 bg-[var(--text-secondary)] animate-[cursorBlink_1s_step-end_infinite] translate-y-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogStream;
