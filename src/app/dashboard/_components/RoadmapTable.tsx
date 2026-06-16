import { updateItemStatus } from '../actions';
import { ROADMAP_STATUSES, type RoadmapItem, type RoadmapStatus } from '@/db/schema';
import { BlockButton } from './BlockButton';

const STATUS_STYLES: Record<RoadmapStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  blocked: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};

function StatusBadge({ status }: { status: RoadmapStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function RoadmapTable({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">Žiadne roadmap items. Pridaj prvý vyššie.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="font-medium">{item.title}</span>
              </div>
              {item.description && (
                <p className="mt-0.5 text-sm text-zinc-500">{item.description}</p>
              )}
              {item.status === 'blocked' && item.roadblockDescription && (
                <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  🚧 {item.roadblockDescription}
                </p>
              )}
            </div>
            <BlockButton itemId={item.id} />
          </div>

          {/* progress bar */}
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                style={{ width: `${item.progressPercentage}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs tabular-nums text-zinc-500">
              {item.progressPercentage}%
            </span>
          </div>

          {/* status + progress update */}
          <form action={updateItemStatus} className="flex items-center gap-2">
            <input type="hidden" name="itemId" value={item.id} />
            <select
              name="status"
              defaultValue={item.status}
              className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            >
              {ROADMAP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              name="progress"
              type="number"
              min={0}
              max={100}
              defaultValue={item.progressPercentage}
              className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Update
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
