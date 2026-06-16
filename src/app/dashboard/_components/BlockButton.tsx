'use client';

import { useState } from 'react';
import { setBlocked } from '../actions';

export function BlockButton({ itemId }: { itemId: number }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-amber-400 px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
      >
        Block
      </button>
    );
  }

  return (
    <form action={setBlocked} className="flex items-center gap-1">
      <input type="hidden" name="itemId" value={itemId} />
      <input
        name="roadblock"
        required
        autoFocus
        placeholder="Roadblock…"
        className="w-40 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
      >
        Uložiť
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-1 text-xs text-zinc-400 hover:text-zinc-600"
      >
        ✕
      </button>
    </form>
  );
}
