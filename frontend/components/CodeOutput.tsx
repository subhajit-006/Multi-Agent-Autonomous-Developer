'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CodeFile {
  filename: string;
  language: string;
  content: string;
}

interface CodeOutputProps {
  files: CodeFile[];
}

const tokenizeCode = (code: string) => {
  if (!code) return '';
  let encoded = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return encoded
    .replace(/(\/\/.*$)/gm, '<span class="text-[var(--text-muted)] italic">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-[var(--text-muted)] italic">$1</span>')
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="text-[#6B9E6B]">$1</span>')
    .replace(
      /\b(import|export|const|let|var|function|return|if|else|for|while|class|extends|interface|type|public|private|static|async|await|switch|case|default|break|true|false|null|undefined)\b/g, 
      '<span class="text-[var(--accent)]">$1</span>'
    )
    .replace(/\b(\d+)\b/g, '<span class="text-[#F59E0B]">$1</span>');
};

const CodeOutput = ({ files }: CodeOutputProps) => {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Loading/Empty Skeleton State
  if (!files || files.length === 0) {
    return (
      <div className="w-full bg-[#0A0A0A] border border-[var(--border)] flex flex-col font-mono h-[500px] 2xl:h-full" style={{ borderRadius: 0 }}>
        <div className="flex w-full items-end gap-1 bg-[var(--bg-secondary)] border-b border-[var(--border)] pt-2 px-2">
          <div className="h-10 w-32 bg-[var(--bg-card)] skeleton" style={{ borderRadius: '4px 4px 0 0' }} />
          <div className="h-10 w-24 bg-[var(--bg-card)] skeleton" style={{ borderRadius: '4px 4px 0 0' }} />
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[var(--border)]">
          <div className="h-4 w-48 bg-[var(--border-light)] skeleton" />
          <div className="h-6 w-24 bg-[var(--border-light)] skeleton" />
        </div>
        <div className="w-full flex-1 p-6 flex flex-col gap-4 bg-[#0A0A0A]">
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 h-3 bg-[var(--border)] opacity-30 skeleton" />
            <div className="h-3 w-1/2 bg-[var(--border)] skeleton" />
          </div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 h-3 bg-[var(--border)] opacity-30 skeleton" />
            <div className="h-3 w-3/4 bg-[var(--border)] skeleton" />
          </div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 h-3 bg-[var(--border)] opacity-30 skeleton" />
            <div className="h-3 w-2/3 bg-[var(--border)] skeleton" />
          </div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 h-3 bg-[var(--border)] opacity-30 skeleton" />
            <div className="h-3 w-5/6 bg-[var(--border)] skeleton" />
          </div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 h-3 bg-[var(--border)] opacity-30 skeleton" />
            <div className="h-3 w-1/3 bg-[var(--border)] skeleton" />
          </div>
        </div>
      </div>
    );
  }

  const activeFile = files[activeTabIdx] || files[0];
  const fileLines = activeFile.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#0A0A0A] lg:border-l border-[var(--border)] flex flex-col font-mono" style={{ borderRadius: 0 }}>
      {/* File Tabs Bar */}
      <div className="flex w-full items-end gap-1 bg-[var(--bg-secondary)] border-b border-[var(--border)] pt-2 px-2 overflow-x-auto no-scrollbar">
        {files.map((f, idx) => {
          const isActive = idx === activeTabIdx;
          return (
            <button
              key={f.filename}
              onClick={() => setActiveTabIdx(idx)}
              aria-label={`View file ${f.filename}`}
              className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors flex-shrink-0 min-h-[44px] ${
                isActive 
                  ? 'border-[var(--accent)] text-[var(--text-primary)] bg-[#0A0A0A]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent focus:outline-none focus-visible:border-[var(--accent)]'
              }`}
              style={{ borderRadius: '4px 4px 0 0' }}
            >
              {f.filename}
            </button>
          );
        })}
      </div>

      {/* Action Row & Metadata */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-[#0A0A0A] border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[var(--accent)] text-[13px] font-bold">
            {activeFile.filename}
          </span>
          <span className="text-[var(--border-light)] hidden sm:inline">|</span>
          <span className="text-[var(--text-muted)] text-[12px]">
            {fileLines.length} lines &middot; {activeFile.language}
          </span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider min-h-[44px] focus:outline-none focus-visible:text-[var(--accent)]"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button 
            aria-label="Push to GitHub"
            className="px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0A0A0A] text-[11px] uppercase tracking-wider transition-colors active:scale-[0.98] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
          >
            Push to GitHub &nearr;
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="w-full relative bg-[#0A0A0A] overflow-x-auto flex-1 overflow-y-auto">
        <div className="min-w-max pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeFile.filename} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {fileLines.map((line, index) => {
                const highlightedHTML = tokenizeCode(line);
                return (
                  <motion.div
                    key={`${activeFile.filename}-${index}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: Math.min(index * 0.005, 1), 
                      duration: 0.1, 
                      ease: 'easeOut' 
                    }}
                    className="flex items-start leading-[1.6] text-[13px] group hover:bg-[#111111]/50"
                  >
                    <div className="w-[48px] flex-shrink-0 text-right pr-3 pl-1 select-none text-[var(--text-muted)] border-r border-[var(--border)]/50 bg-[#0A0A0A] group-hover:text-[var(--text-secondary)] transition-colors">
                      {index + 1}
                    </div>
                    <div 
                      className="pl-4 pr-6 whitespace-pre font-mono"
                      dangerouslySetInnerHTML={{ __html: highlightedHTML || ' ' }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CodeOutput;
