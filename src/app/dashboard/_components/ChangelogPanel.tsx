'use client';

import { useState, useTransition } from 'react';
import { generateChangelog } from '../actions';

export function ChangelogPanel({
  projectId,
  initialMarkdown,
  initialWeek,
}: {
  projectId: number;
  initialMarkdown: string | null;
  initialWeek: number | null;
}) {
  const [markdown, setMarkdown] = useState<string | null>(initialMarkdown);
  const [week, setWeek] = useState<number | null>(initialWeek);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        const md = await generateChangelog(projectId);
        setMarkdown(md);
        setWeek(null); // čerstvo vygenerované — týždeň je aktuálny
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chyba pri generovaní');
      }
    });
  }

  async function handleCopy() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {pending ? 'Generujem…' : '✨ Generate Changelog'}
        </button>
        {markdown && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {copied ? 'Skopírované ✓' : 'Copy .md'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {markdown && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-2 text-xs leading-relaxed dark:bg-zinc-900">
          {markdown}
        </pre>
      )}

      {!markdown && !error && (
        <p className="text-xs text-zinc-400">Zatiaľ žiadny changelog.</p>
      )}

      {markdown && week != null && (
        <p className="text-xs text-zinc-400">Posledný uložený — týždeň {week}.</p>
      )}
    </div>
  );
}
