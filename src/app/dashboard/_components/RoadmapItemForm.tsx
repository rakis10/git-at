import { createRoadmapItem } from '../actions';
import type { Project } from '@/db/schema';

export function RoadmapItemForm({ projects }: { projects: Project[] }) {
  return (
    <form
      action={createRoadmapItem}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Projekt
        <select
          name="projectId"
          required
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
        Title
        <input
          name="title"
          required
          placeholder="Čo treba spraviť"
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
        Popis
        <input
          name="description"
          placeholder="voliteľné"
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex w-20 flex-col gap-1 text-xs text-zinc-500">
        % progres
        <input
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={0}
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
      >
        + Pridať
      </button>
    </form>
  );
}
