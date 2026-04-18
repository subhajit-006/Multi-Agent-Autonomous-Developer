'use client';

import { useMemo } from 'react';

import type { CodeFile } from '@/components/CodeOutput';

interface LivePreviewPanelProps {
  files: CodeFile[];
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const ENTRY_FILE_PATTERNS = [
  /(^|\/)index\.html$/i,
  /(^|\/)page\.html$/i,
];

const TSX_ENTRY_PATTERNS = [
  /(^|\/)app\/page\.tsx$/i,
  /(^|\/)pages\/index\.tsx$/i,
];

const REACT_JS_ENTRY_PATTERNS = [
  /(^|\/)app\/page\.(jsx|js)$/i,
  /(^|\/)pages\/index\.(jsx|js)$/i,
  /(^|\/)index\.(jsx|js)$/i,
];

const extractDefaultExportName = (content: string): string | null => {
  const fnNamed = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
  if (fnNamed?.[1]) return fnNamed[1];

  const defaultIdentifier = content.match(/export\s+default\s+([A-Za-z0-9_]+)\s*;?/);
  if (defaultIdentifier?.[1]) return defaultIdentifier[1];

  return null;
};

const extractNamedExports = (content: string): string[] => {
  const names = new Set<string>();
  const exportRegex = /export\s+(?:const|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    names.add(match[1]);
  }

  return Array.from(names);
};

const parseNamedImportSpecifiers = (specifiers: string): Array<{ imported: string; local: string }> => {
  return specifiers
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const asMatch = part.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (asMatch) {
        return { imported: asMatch[1], local: asMatch[2] };
      }
      return { imported: part, local: part };
    });
};

const buildImportPrelude = (content: string): string => {
  const importRegex = /^import\s+(.+?)\s+from\s+['\"]([^'\"]+)['\"];?\s*$/gm;
  const statements: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const clause = match[1].trim();
    const source = match[2].trim();

    if (/\.(css|scss|sass|less)$/i.test(source)) continue;

    const sourceLiteral = JSON.stringify(source);

    if (source === 'react') {
      if (clause.startsWith('* as ')) {
        const ns = clause.replace('* as ', '').trim();
        statements.push(`const ${ns} = React;`);
        continue;
      }

      if (clause.startsWith('{') && clause.endsWith('}')) {
        const named = parseNamedImportSpecifiers(clause.slice(1, -1));
        for (const item of named) {
          statements.push(`const ${item.local} = React[${JSON.stringify(item.imported)}];`);
        }
        continue;
      }

      if (clause.includes('{')) {
        const defaultPart = clause.slice(0, clause.indexOf('{')).replace(',', '').trim();
        const namedPart = clause.slice(clause.indexOf('{') + 1, clause.lastIndexOf('}'));

        if (defaultPart && defaultPart !== 'React') {
          statements.push(`const ${defaultPart} = React;`);
        }

        const named = parseNamedImportSpecifiers(namedPart);
        for (const item of named) {
          statements.push(`const ${item.local} = React[${JSON.stringify(item.imported)}];`);
        }
        continue;
      }

      if (clause !== 'React') {
        statements.push(`const ${clause} = React;`);
      }
      continue;
    }

    if (source === 'react-dom') {
      if (clause !== 'ReactDOM') {
        statements.push(`const ${clause} = ReactDOM;`);
      }
      continue;
    }

    const resolveExpr = `__previewResolveImportedValue(${sourceLiteral})`;

    if (clause.startsWith('* as ')) {
      const ns = clause.replace('* as ', '').trim();
      statements.push(`const ${ns} = ${resolveExpr};`);
      continue;
    }

    if (clause.startsWith('{') && clause.endsWith('}')) {
      const named = parseNamedImportSpecifiers(clause.slice(1, -1));
      for (const item of named) {
        statements.push(
          `const ${item.local} = __previewResolveBinding(${JSON.stringify(item.local)}, __previewGetNamed(${sourceLiteral}, ${JSON.stringify(item.imported)}));`
        );
      }
      continue;
    }

    if (clause.includes('{')) {
      const defaultPart = clause.slice(0, clause.indexOf('{')).replace(',', '').trim();
      const namedPart = clause.slice(clause.indexOf('{') + 1, clause.lastIndexOf('}'));

      if (defaultPart) {
        statements.push(
          `const ${defaultPart} = __previewResolveBinding(${JSON.stringify(defaultPart)}, __previewGetDefault(${sourceLiteral}) || __previewGetNamed(${sourceLiteral}, ${JSON.stringify(defaultPart)}));`
        );
      }

      const named = parseNamedImportSpecifiers(namedPart);
      for (const item of named) {
        statements.push(
          `const ${item.local} = __previewResolveBinding(${JSON.stringify(item.local)}, __previewGetNamed(${sourceLiteral}, ${JSON.stringify(item.imported)}));`
        );
      }
      continue;
    }

    statements.push(
      `const ${clause} = __previewResolveBinding(${JSON.stringify(clause)}, __previewGetDefault(${sourceLiteral}) || __previewGetNamed(${sourceLiteral}, ${JSON.stringify(clause)}));`
    );
  }

  return statements.join('\n');
};

const buildModuleRegistration = (moduleId: string, defaultName: string | null, namedExports: string[]): string => {
  const normalizedId = moduleId.replace(/\\/g, '/');
  const withoutExt = normalizedId.replace(/\.[^/.]+$/, '');
  const basename = withoutExt.split('/').pop() || withoutExt;
  const keys = Array.from(new Set([normalizedId, withoutExt, basename]));

  const lines: string[] = [];
  for (const key of keys) {
    const keyLiteral = JSON.stringify(key);
    lines.push(`__previewModules[${keyLiteral}] = __previewModules[${keyLiteral}] || {};`);

    if (defaultName) {
      lines.push(
        `if (typeof ${defaultName} !== 'undefined') __previewModules[${keyLiteral}].default = ${defaultName};`
      );
    }

    for (const name of namedExports) {
      lines.push(`if (typeof ${name} !== 'undefined') __previewModules[${keyLiteral}][${JSON.stringify(name)}] = ${name};`);
    }
  }

  return lines.join('\n');
};

const transpileModuleForPreview = (
  content: string,
  options?: { moduleId?: string; registerModule?: boolean }
): string => {
  const cssAliasRegex = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"][^'"]+\.(css|scss|sass|less)['"];?\s*$/gm;
  const cssAliases = new Set<string>();
  let aliasMatch: RegExpExecArray | null;

  while ((aliasMatch = cssAliasRegex.exec(content)) !== null) {
    cssAliases.add(aliasMatch[1]);
  }

  const cssShim = Array.from(cssAliases)
    .map(
      (alias) =>
        `const ${alias} = new Proxy({}, { get: function (_, key) { return String(key); } });`
    )
    .join('\n');

  const importPrelude = buildImportPrelude(content);
  const defaultName = extractDefaultExportName(content);
  const namedExports = extractNamedExports(content);

  const transformed = content
    .replace(/^import\s.+$/gm, '')
    .replace(/export\s+default\s*\(\s*/g, 'const PreviewApp = (')
    .replace(/export\s+default\s+\(\s*\)\s*=>/g, 'const PreviewApp = () =>')
    .replace(/export\s+default\s+async\s+\(\s*\)\s*=>/g, 'const PreviewApp = async () =>')
    .replace(/export\s+default\s+function\s*\(/g, 'const PreviewApp = function(')
    .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
    .replace(/export\s+default\s+[A-Za-z0-9_]+\s*;?/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s*\{[^}]*\};?/g, '');

  const registryCode = options?.registerModule && options.moduleId
    ? buildModuleRegistration(options.moduleId, defaultName, namedExports)
    : '';

  const moduleBody = [cssShim, importPrelude, transformed, registryCode].filter(Boolean).join('\n');
  return `(function () {\n${moduleBody}\n})();`;
};

const makeSrcDoc = (files: CodeFile[]): string => {
  const htmlFile = files.find((f) => ENTRY_FILE_PATTERNS.some((pattern) => pattern.test(f.filename)));
  const cssFiles = files.filter((f) => f.filename.endsWith('.css'));
  const jsFiles = files.filter((f) => /\.(js|mjs)$/i.test(f.filename));

  if (htmlFile) {
    return `<!doctype html>
<html>
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<style>${cssFiles.map((f) => f.content).join('\n')}</style>
</head>
<body>
${htmlFile.content}
<script>${jsFiles.map((f) => f.content).join('\n')}</script>
</body>
</html>`;
  }

  const pageReact = files.find(
    (f) =>
      TSX_ENTRY_PATTERNS.some((pattern) => pattern.test(f.filename)) ||
      REACT_JS_ENTRY_PATTERNS.some((pattern) => pattern.test(f.filename))
  );

  if (pageReact) {
    const supportReactFiles = files.filter((f) => {
      if (!/\.(tsx|jsx|js)$/i.test(f.filename)) return false;
      if (f.filename === pageReact.filename) return false;
      if (/(^|\/)(tests?|__tests__)(\/|$)/i.test(f.filename)) return false;
      if (/\.(test|spec)\.(tsx|jsx|js)$/i.test(f.filename)) return false;
      if (/(^|\/)api(\/|$)/i.test(f.filename)) return false;
      if (/(^|\/)server(\/|$)/i.test(f.filename)) return false;
      return true;
    });
    const supportCode = supportReactFiles
      .map((file) =>
        transpileModuleForPreview(file.content, {
          moduleId: file.filename,
          registerModule: true,
        })
      )
      .join('\n\n');
    const pageCode = transpileModuleForPreview(pageReact.content, {
      moduleId: pageReact.filename,
      registerModule: true,
    });
    const normalizedPageId = pageReact.filename.replace(/\\/g, '/');
    const pageIdNoExt = normalizedPageId.replace(/\.[^/.]+$/, '');
    const pageBasename = pageIdNoExt.split('/').pop() || pageIdNoExt;
    const previewMount = [
      `const __previewEntry = __previewGetDefault(${JSON.stringify(normalizedPageId)})`,
      `  || __previewGetDefault(${JSON.stringify(pageIdNoExt)})`,
      `  || __previewGetDefault(${JSON.stringify(pageBasename)});`,
      `const PreviewApp = __previewEntry || (typeof PreviewApp !== 'undefined' ? PreviewApp : undefined);`,
    ].join('\n');
    const runtimeSource = [
      'const __previewModules = window.__previewModules || (window.__previewModules = {});',
      'const __previewResolveModule = (source) => {',
      "  const direct = __previewModules[source] || __previewModules[source.replace(/\\.[^/.]+$/, '')];",
      '  if (direct) return direct;',
      '',
      "  const basename = source.split('/').pop() || source;",
      "  const basenameNoExt = basename.replace(/\\.[^/.]+$/, '');",
      '  return __previewModules[basename] || __previewModules[basenameNoExt] || {};',
      '};',
      'const __previewGetDefault = (source) => {',
      '  const mod = __previewResolveModule(source);',
      '  return mod.default;',
      '};',
      'const __previewGetNamed = (source, name) => {',
      '  const mod = __previewResolveModule(source);',
      '  return mod[name];',
      '};',
      "const __previewResolveImportedValue = (source) => {",
      "  if (source === 'react') return React;",
      "  if (source === 'react-dom') return ReactDOM;",
      "  if (source === 'next/link') return { default: Link };",
      "  if (source === 'next/head') return { default: Head };",
      "  if (source === 'next/image') return { default: Image };",
      '  return __previewResolveModule(source);',
      '};',
      'const __previewResolveBinding = (name, value) => {',
      "  if (typeof value !== 'undefined') return value;",
      "  if (name === 'React') return React;",
      "  if (name === 'ReactDOM') return ReactDOM;",
      "  if (typeof React !== 'undefined' && typeof React[name] !== 'undefined') return React[name];",
      '',
      "  if (/^[A-Z]/.test(name)) {",
      '    return function MissingComponent() {',
      "      return React.createElement('div', {",
      '        style: {',
      "          padding: '10px 12px',",
      "          border: '1px dashed #5f6f1d',",
      "          color: '#a8ba59',",
      "          margin: '6px 0',",
      "          fontSize: '12px',",
      "          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'",
      '        }',
      "      }, name + ' (preview placeholder)');",
      '    };',
      '  }',
      '',
      '  return value;',
      '};',
      '',
      "const Link = ({ href, children, ...props }) => React.createElement('a', { href: href || '#', ...props }, children);",
      'const Head = () => null;',
      "const Image = ({ src, alt, ...props }) => React.createElement('img', { src: src || '', alt: alt || '', ...props });",
      '',
      supportCode,
      '',
      pageCode,
      '',
      previewMount,
      '',
      "if (typeof PreviewApp === 'function') {",
      "  const root = ReactDOM.createRoot(document.getElementById('root'));",
      "  root.render(React.createElement(PreviewApp));",
      '} else {',
      "  document.getElementById('errors').textContent = 'No default page component found for live preview.';",
      '}',
    ].join('\n');

    return `<!doctype html>
<html>
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<style>
body { margin: 0; font-family: ui-sans-serif, system-ui; background: #0a0f0a; color: #ddffd9; }
#root { min-height: 100vh; }
.error-box { padding: 16px; color: #ff8a8a; font-size: 13px; white-space: pre-wrap; }
</style>
<script crossorigin src=\"https://unpkg.com/react@18/umd/react.development.js\"></script>
<script crossorigin src=\"https://unpkg.com/react-dom@18/umd/react-dom.development.js\"></script>
</head>
<body>
<div id=\"root\"></div>
<div id=\"errors\" class=\"error-box\"></div>
<script>
window.addEventListener('error', function (event) {
  var box = document.getElementById('errors');
  var source = event.filename ? (' @ ' + event.filename + ':' + event.lineno + ':' + event.colno) : '';
  var message = event.error?.stack || event.error?.message || event.message || 'Unknown error';
  box.textContent = 'Preview runtime error: ' + message + source;
});
window.addEventListener('unhandledrejection', function (event) {
  var box = document.getElementById('errors');
  var reason = event.reason?.stack || event.reason?.message || String(event.reason || 'Unknown promise rejection');
  box.textContent = 'Preview runtime error: ' + reason;
});
</script>
<script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script>
try {
  const __previewSource = ${JSON.stringify(runtimeSource)};
  const compiled = Babel.transform(__previewSource, {
    presets: ['env', 'typescript', 'react'],
    filename: 'preview.tsx',
    sourceType: 'script',
    compact: false,
  }).code;
  (0, eval)(compiled);
} catch (err) {
  var box = document.getElementById('errors');
  box.textContent = 'Preview runtime error: ' + (err?.stack || err?.message || String(err));
}
</script>
</body>
</html>`;
  }

  return `<!doctype html>
<html>
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<style>
body { margin: 0; padding: 16px; background: #0b140c; color: #ddffd9; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
h2 { margin: 0 0 10px; font-size: 16px; color: #d4ff33; }
ul { margin: 0; padding-left: 18px; }
li { margin-bottom: 8px; color: #97d89b; }
</style>
</head>
<body>
<h2>Live Preview</h2>
<p>No renderable frontend entry was found yet.</p>
<ul>
${files.map((f) => `<li>${escapeHtml(f.filename)}</li>`).join('')}
</ul>
</body>
</html>`;
};

export default function LivePreviewPanel({ files }: LivePreviewPanelProps) {
  const srcDoc = useMemo(() => makeSrcDoc(files), [files]);

  return (
    <section className="w-full border-t border-[var(--border)] bg-[var(--bg-primary)] flex flex-col min-h-[280px]">
      <header className="px-4 py-2 border-b border-[var(--border)] text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
        Live Preview
      </header>
      <div className="flex-1 bg-white">
        <iframe
          title="Live generated UI preview"
          sandbox="allow-scripts"
          className="w-full h-full min-h-[280px]"
          srcDoc={srcDoc}
        />
      </div>
    </section>
  );
}
