import { createProject } from '../actions';
import { SubmitButton } from './SubmitButton';

export function ProjectForm() {
  return (
    <form action={createProject} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
        Názov projektu
        <input
          name="name"
          required
          placeholder="Môj projekt"
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
        GitHub repo
        <input
          name="githubRepo"
          required
          placeholder="owner/repo alebo URL"
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <SubmitButton className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900">
        + Projekt
      </SubmitButton>
    </form>
  );
}
