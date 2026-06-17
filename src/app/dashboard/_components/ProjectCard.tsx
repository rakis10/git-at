'use client';

import { useState } from 'react';
import type { Project } from '@/db/schema';
import { updateProject, deleteProject, type ChangelogEntry } from '../actions';
import { CommitsPanel } from './CommitsPanel';
import { ChangelogPanel } from './ChangelogPanel';

export function ProjectCard({
  project,
  changelogHistory,
}: {
  project: Project;
  changelogHistory: ChangelogEntry[];
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      {editing ? (
        <form
          action={updateProject}
          onSubmit={() => setEditing(false)}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="id" value={project.id} />
          <input
            name="name"
            defaultValue={project.name}
            required
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            name="githubRepo"
            defaultValue={project.githubRepo}
            required
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              Uložiť
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600"
            >
              Zrušiť
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-sm font-medium">{project.name}</span>
            <span className="block truncate text-xs text-zinc-400">{project.githubRepo}</span>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <form
              action={deleteProject}
              onSubmit={(e) => {
                if (!confirm(`Zmazať projekt "${project.name}" a všetky jeho dáta?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={project.id} />
              <button
                type="submit"
                className="rounded border border-red-300 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
              >
                Del
              </button>
            </form>
          </div>
        </div>
      )}

      <CommitsPanel projectId={project.id} repo={project.githubRepo} />
      <ChangelogPanel projectId={project.id} initialHistory={changelogHistory} />
    </div>
  );
}
