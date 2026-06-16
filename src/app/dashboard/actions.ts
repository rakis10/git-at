'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { roadmapItems, projects, ROADMAP_STATUSES, type RoadmapStatus } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { fetchRecentCommits, type CommitSummary } from '@/lib/github';

function clampProgress(v: unknown): number {
  return Math.min(100, Math.max(0, Math.round(Number(v) || 0)));
}

/** Vytvorí nový roadmap item (status 'todo'). Volané ako form action. */
export async function createRoadmapItem(formData: FormData) {
  await requireAdmin();

  const projectId = Number(formData.get('projectId'));
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const progress = clampProgress(formData.get('progress'));

  if (!projectId || !title) throw new Error('projectId a title sú povinné');

  await db.insert(roadmapItems).values({
    projectId,
    title,
    description,
    status: 'todo',
    progressPercentage: progress,
  });

  revalidatePath('/dashboard');
}

/** Označí item ako 'blocked' + uloží konkrétny roadblock popis. Volané ako form action. */
export async function setBlocked(formData: FormData) {
  await requireAdmin();

  const itemId = Number(formData.get('itemId'));
  const roadblock = String(formData.get('roadblock') ?? '').trim();

  if (!itemId || !roadblock) throw new Error('itemId a roadblock sú povinné');

  await db
    .update(roadmapItems)
    .set({ status: 'blocked', roadblockDescription: roadblock })
    .where(eq(roadmapItems.id, itemId));

  revalidatePath('/dashboard');
}

/** Zmení status + progress itemu. Pri odblokovaní vyčistí roadblock popis. Volané ako form action. */
export async function updateItemStatus(formData: FormData) {
  await requireAdmin();

  const itemId = Number(formData.get('itemId'));
  const status = String(formData.get('status') ?? '') as RoadmapStatus;
  const progress = clampProgress(formData.get('progress'));

  if (!itemId || !ROADMAP_STATUSES.includes(status)) {
    throw new Error('neplatný itemId alebo status');
  }

  await db
    .update(roadmapItems)
    .set({
      status,
      progressPercentage: status === 'done' ? 100 : progress,
      // pri prechode mimo 'blocked' vyčisti roadblock
      roadblockDescription: status === 'blocked' ? undefined : null,
    })
    .where(eq(roadmapItems.id, itemId));

  revalidatePath('/dashboard');
}

/** "Fetch GitHub & Sync" — vytiahne commity za 7 dní pre projekt. Vracia ich do UI. */
export async function fetchAndSyncCommits(projectId: number): Promise<CommitSummary[]> {
  await requireAdmin();

  const [proj] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!proj) throw new Error('projekt neexistuje');

  return fetchRecentCommits(proj.githubRepo, 7);
}
