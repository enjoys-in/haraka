import { Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';

const MonacoEditor = lazy(async () => {
  const mod = await import('@monaco-editor/react');
  return { default: mod.default };
});

type MonacoCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'typescript' | 'json' | 'ini' | 'plaintext';
  height?: number;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
};

export function MonacoCodeEditor({
  value,
  onChange,
  language,
  height = 320,
  className,
  placeholder,
  readOnly = false,
}: MonacoCodeEditorProps) {
  return (
    <div className={cn('overflow-hidden rounded-md border border-input', className)}>
      <Suspense
        fallback={<div className="px-3 py-2 text-xs text-muted-foreground">Loading editor…</div>}
      >
        <MonacoEditor
          height={height}
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={(v) => onChange(v ?? '')}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 13,
            lineNumbersMinChars: 3,
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </Suspense>
      {!value && placeholder && (
        <div className="pointer-events-none -mt-10 px-4 pb-2 text-xs text-muted-foreground/70">
          {placeholder}
        </div>
      )}
    </div>
  );
}
