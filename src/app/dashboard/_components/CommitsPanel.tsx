'use client';

import { useState, useTransition } from 'react';
import { fetchAndSyncCommits } from '../actions';
import type { CommitSummary } from '@/lib/github';

export function CommitsPanel({
  projectId,
  repo,
}: {
  projectId: number;
  repo: string;
}) {
  const [commits, setCommits] = useState<CommitSummary[] | null>(null);
  const [storedTotal, setStoredTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFetch() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetchAndSyncCommits(projectId);
        setCommits(res.commits);
        setStoredTotal(res.storedTotal);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chyba pri fetchi');
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleFetch}
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {pending ? 'Sťahujem…' : 'Fetch GitHub & Sync'}
      </button>

      <p className="text-xs text-zinc-400">
        {repo}
        {storedTotal != null && ` · ${storedTotal} uložených v DB`}
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {commits && commits.length === 0 && (
        <p className="text-sm text-zinc-500">Žiadne commity za posledných 7 dní.</p>
      )}

      {commits && commits.length > 0 && (
        <ul className="flex flex-col gap-1">
          {commits.map((c) => (
            <li key={c.sha} className="text-sm">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {c.sha}
              </a>{' '}
              <span>{c.message}</span>
              <span className="text-zinc-400">
                {' '}
                — {c.author}
                {c.date ? `, ${c.date.slice(0, 10)}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
