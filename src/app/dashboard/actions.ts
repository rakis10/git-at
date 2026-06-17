'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  roadmapItems,
  projects,
  weeklyChangelogs,
  ROADMAP_STATUSES,
  type RoadmapStatus,
} from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { fetchRecentCommits, type CommitSummary } from '@/lib/github';
import { generateChangelogMarkdown, isoWeekNumber } from '@/lib/changelog';

function clampProgress(v: unknown): number {
  return Math.min(100, Math.max(0, Math.round(Number(v) || 0)));
}

// normalizuje "owner/repo" alebo plnú GitHub URL na "owner/repo"
function normalizeRepo(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');
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

// ---- Project CRUD ----

export async function createProject(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get('name') ?? '').trim();
  const githubRepo = normalizeRepo(String(formData.get('githubRepo') ?? ''));

  if (!name || !githubRepo) throw new Error('name a githubRepo sú povinné');
  if (!/^[^/]+\/[^/]+$/.test(githubRepo)) {
    throw new Error('githubRepo musí byť v tvare "owner/repo"');
  }

  await db.insert(projects).values({ name, githubRepo });
  revalidatePath('/dashboard');
}

export async function updateProject(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get('id'));
  const name = String(formData.get('name') ?? '').trim();
  const githubRepo = normalizeRepo(String(formData.get('githubRepo') ?? ''));

  if (!id || !name || !githubRepo) throw new Error('id, name a githubRepo sú povinné');

  await db.update(projects).set({ name, githubRepo }).where(eq(projects.id, id));
  revalidatePath('/dashboard');
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get('id'));
  if (!id) throw new Error('id je povinné');

  // FK onDelete: cascade zmaže aj roadmap_items a weekly_changelogs daného projektu
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath('/dashboard');
}

// ---- AI Weekly Changelog ----

/**
 * Vygeneruje changelog pre projekt: commity (7 dní) + roadmap stav → Nemotron 3 Ultra (NVIDIA)
 * → uloží markdown do weekly_changelogs. Vracia vygenerovaný markdown.
 */
export async function generateChangelog(projectId: number): Promise<string> {
  await requireAdmin();

  const [proj] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!proj) throw new Error('projekt neexistuje');

  const [commits, roadmap] = await Promise.all([
    fetchRecentCommits(proj.githubRepo, 7),
    db.select().from(roadmapItems).where(eq(roadmapItems.projectId, projectId)),
  ]);

  const weekNumber = isoWeekNumber(new Date());

  const markdown = await generateChangelogMarkdown({
    projectName: proj.name,
    weekNumber,
    commits,
    roadmap,
  });

  await db.insert(weeklyChangelogs).values({
    projectId,
    weekNumber,
    generatedMarkdown: markdown,
  });

  revalidatePath('/dashboard');
  return markdown;
}
