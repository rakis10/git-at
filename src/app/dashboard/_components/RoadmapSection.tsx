'use client';

import { useState } from 'react';
import type { RoadmapItem, Project } from '@/db/schema';
import { RoadmapRow } from './RoadmapRow';

export function RoadmapSection({
  items,
  projects,
}: {
  items: RoadmapItem[];
  projects: Project[];
}) {
  const [filter, setFilter] = useState<number | 'all'>('all');

  const filtered = filter === 'all' ? items : items.filter((i) => i.projectId === filter);
  const total = filtered.length;
  const done = filtered.filter((i) => i.status === 'done').length;
  const avg = total
    ? Math.round(filtered.reduce((s, i) => s + i.progressPercentage, 0) / total)
    : 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Roadmap</h2>
        {projects.length > 1 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">Všetky projekty</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* progress rollup */}
      {total > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-zinc-500">
            {done}/{total} hotových · ⌀ {avg}%
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 ? (
        <p className="text-sm text-zinc-500">
          {items.length === 0 ? 'Žiadne roadmap items. Pridaj prvý vyššie.' : 'Žiadne items pre tento filter.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <RoadmapRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
