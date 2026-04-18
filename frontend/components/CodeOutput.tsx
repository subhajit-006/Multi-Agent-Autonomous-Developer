'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CodeFile {
  filename: string;
  language: string;
  content: string;
}

interface CodeOutputProps {
  files: CodeFile[];
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FileTreeNode[];
}

const buildFileTree = (files: CodeFile[]): FileTreeNode[] => {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.filename.split('/').filter(Boolean);
    let current = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = i === parts.length - 1;

      let existing = current.find((node) => node.name === part && node.type === (isFile ? 'file' : 'folder'));
      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        };
        current.push(existing);
      }

      if (!isFile) {
        current = existing.children ?? [];
      }
    }
  }

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    const folders = nodes
      .filter((n) => n.type === 'folder')
      .map((n) => ({ ...n, children: sortNodes(n.children ?? []) }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const leafFiles = nodes
      .filter((n) => n.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...folders, ...leafFiles];
  };

  return sortNodes(root);
};

const tokenizeCode = (code: string) => {
  if (!code) return '';
  let encoded = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return encoded
    .replace(/(\/\/.*$)/gm, '<span class="text-[var(--text-muted)] italic">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-[var(--text-muted)] italic">$1</span>')
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="text-[var(--accent-dim)]">$1</span>')
    .replace(
      /\b(import|export|const|let|var|function|return|if|else|for|while|class|extends|interface|type|public|private|static|async|await|switch|case|default|break|true|false|null|undefined)\b/g, 
      '<span class="text-[var(--accent)]">$1</span>'
    )
    .replace(/\b(\d+)\b/g, '<span class="text-[var(--accent)]">$1</span>');
};

const CodeOutput = ({ files }: CodeOutputProps) => {
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (files.length === 0) {
      setActiveFilePath('');
      return;
    }
    if (!files.some((f) => f.filename === activeFilePath)) {
      setActiveFilePath(files[0].filename);
    }
  }, [files, activeFilePath]);

  const fileTree = useMemo(() => buildFileTree(files), [files]);

  useEffect(() => {
    const topLevelFolders = fileTree
      .filter((node) => node.type === 'folder')
      .map((node) => node.path);
    setOpenFolders(new Set(topLevelFolders));
  }, [fileTree]);

  useEffect(() => {
    if (!activeFilePath) return;
    const parts = activeFilePath.split('/').filter(Boolean);
    if (parts.length <= 1) return;

    const parentFolders: string[] = [];
    let curr = '';
    for (let i = 0; i < parts.length - 1; i++) {
      curr = curr ? `${curr}/${parts[i]}` : parts[i];
      parentFolders.push(curr);
    }

    setOpenFolders((prev) => {
      const next = new Set(prev);
      parentFolders.forEach((folder) => next.add(folder));
      return next;
    });
  }, [activeFilePath]);

  // Loading/Empty Skeleton State
  if (!files || files.length === 0) {
    return (
      <div className="w-full bg-[var(--bg-primary)] border border-[var(--border)] flex flex-col font-mono h-[500px] 2xl:h-full" style={{ borderRadius: 0 }}>
        <div className="flex w-full items-end gap-1 bg-[var(--bg-secondary)] border-b border-[var(--border)] pt-2 px-2">
          <div className="h-10 w-32 bg-[var(--bg-card)] skeleton" style={{ borderRadius: '4px 4px 0 0' }} />
          <div className="h-10 w-24 bg-[var(--bg-card)] skeleton" style={{ borderRadius: '4px 4px 0 0' }} />
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <div className="h-4 w-48 bg-[var(--border-light)] skeleton" />
          <div className="h-6 w-24 bg-[var(--border-light)] skeleton" />
        </div>
        <div className="w-full flex-1 p-6 flex flex-col gap-4 bg-[var(--bg-primary)]">
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

  const activeFile = files.find((f) => f.filename === activeFilePath) || files[0];
  const fileLines = activeFile.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (nodes: FileTreeNode[], depth = 0): React.ReactNode => {
    return nodes.map((node) => {
      const isFile = node.type === 'file';
      const isActive = isFile && node.path === activeFile.filename;
      const isOpen = openFolders.has(node.path);

      if (isFile) {
        return (
          <button
            key={node.path}
            onClick={() => setActiveFilePath(node.path)}
            className={`w-full text-left px-2 py-1.5 text-[12px] border border-transparent min-h-[36px] ${
              isActive
                ? 'bg-[var(--accent)]/12 text-[var(--accent)] border-[var(--accent)]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
            style={{ paddingLeft: `${8 + depth * 14}px` }}
            title={node.path}
          >
            {node.name}
          </button>
        );
      }

      return (
        <div key={node.path}>
          <button
            onClick={() => {
              setOpenFolders((prev) => {
                const next = new Set(prev);
                if (next.has(node.path)) {
                  next.delete(node.path);
                } else {
                  next.add(node.path);
                }
                return next;
              });
            }}
            className="w-full text-left px-2 py-1 min-h-[32px] text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/50 flex items-center gap-2"
            style={{ paddingLeft: `${8 + depth * 14}px` }}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} folder ${node.name}`}
          >
            <span className="w-3 inline-flex items-center justify-center text-[10px]">
              {isOpen ? '▾' : '▸'}
            </span>
            <span>{node.name}</span>
          </button>
          {isOpen && node.children && node.children.length > 0 ? renderTree(node.children, depth + 1) : null}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full bg-[var(--bg-primary)] lg:border-l border-[var(--border)] flex flex-col md:flex-row font-mono" style={{ borderRadius: 0 }}>
      {/* IDE-like File Explorer */}
      <aside className="w-full md:w-[300px] md:min-w-[240px] md:max-w-[340px] border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="px-3 py-2 border-b border-[var(--border)] text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
          Explorer
        </div>
        <div className="max-h-[240px] md:max-h-none md:h-full overflow-y-auto py-2">
          {renderTree(fileTree)}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Action Row & Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <span className="text-[var(--accent)] text-[13px] font-bold truncate max-w-full">
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
              className="px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--ink-on-accent)] text-[11px] uppercase tracking-wider transition-colors active:scale-[0.98] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
            >
              Push to GitHub &nearr;
            </button>
          </div>
        </div>

        {/* Code Display Area */}
        <div className="w-full relative bg-[var(--bg-primary)] overflow-x-auto flex-1 overflow-y-auto">
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
                      className="flex items-start leading-[1.6] text-[13px] group hover:bg-[var(--bg-secondary)]/50"
                    >
                      <div className="w-[48px] flex-shrink-0 text-right pr-3 pl-1 select-none text-[var(--text-muted)] border-r border-[var(--border)]/50 bg-[var(--bg-primary)] group-hover:text-[var(--text-secondary)] transition-colors">
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
    </div>
  );
};

export default CodeOutput;
