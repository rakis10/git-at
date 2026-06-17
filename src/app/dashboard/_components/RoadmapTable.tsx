import type { RoadmapItem } from '@/db/schema';
import { RoadmapRow } from './RoadmapRow';

export function RoadmapTable({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">Žiadne roadmap items. Pridaj prvý vyššie.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <RoadmapRow key={item.id} item={item} />
      ))}
    </ul>
  );
}
