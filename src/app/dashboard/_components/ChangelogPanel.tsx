'use client';

import { useState, useTransition } from 'react';
import { generateChangelog, type ChangelogEntry } from '../actions';

function downloadMarkdown(entry: ChangelogEntry) {
  const blob = new Blob([entry.markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `changelog-tyzden-${entry.weekNumber}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function EntryView({ entry }: { entry: ChangelogEntry }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(entry.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {copied ? 'Skopírované ✓' : 'Copy .md'}
        </button>
        <button
          type="button"
          onClick={() => downloadMarkdown(entry)}
          className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Download .md
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-2 text-xs leading-relaxed dark:bg-zinc-900">
        {entry.markdown}
      </pre>
    </div>
  );
}

export function ChangelogPanel({
  projectId,
  initialHistory,
}: {
  projectId: number;
  initialHistory: ChangelogEntry[]; // najnovší prvý
}) {
  const [history, setHistory] = useState<ChangelogEntry[]>(initialHistory);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        const entry = await generateChangelog(projectId);
        setHistory((prev) => [entry, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chyba pri generovaní');
      }
    });
  }

  const latest = history[0];
  const older = history.slice(1);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="self-start rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {pending ? 'Generujem…' : '✨ Generate Changelog'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!latest && !error && <p className="text-xs text-zinc-400">Zatiaľ žiadny changelog.</p>}

      {latest && (
        <>
          <p className="text-xs text-zinc-400">
            Týždeň {latest.weekNumber} · {latest.createdAt.slice(0, 10)}
          </p>
          <EntryView entry={latest} />
        </>
      )}

      {older.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700">
            História ({older.length})
          </summary>
          <div className="mt-2 flex flex-col gap-3">
            {older.map((entry, i) => (
              <div key={`${entry.weekNumber}-${entry.createdAt}-${i}`} className="flex flex-col gap-1">
                <p className="text-zinc-400">
                  Týždeň {entry.weekNumber} · {entry.createdAt.slice(0, 10)}
                </p>
                <EntryView entry={entry} />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
