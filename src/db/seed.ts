/**
 * Seed jeden projekt + pár roadmap items na otestovanie dashboardu.
 * Spustenie: `npm run db:seed` (vyžaduje vyplnené .env.local + `npm run db:push`).
 */
import { db } from './index';
import { projects, roadmapItems } from './schema';

async function main() {
  const [proj] = await db
    .insert(projects)
    .values({ name: 'Dev-Command Center', githubRepo: 'vercel/next.js' })
    .returning();

  await db.insert(roadmapItems).values([
    { projectId: proj.id, title: 'Drizzle schéma + Turso', status: 'done', progressPercentage: 100 },
    {
      projectId: proj.id,
      title: 'Dashboard UI',
      status: 'in_progress',
      progressPercentage: 60,
      description: 'Roadmap tabuľka + commit panel',
    },
    {
      projectId: proj.id,
      title: 'Render deploy',
      status: 'blocked',
      progressPercentage: 0,
      roadblockDescription: 'Čakám na produkčný Turso auth token',
    },
  ]);

  console.log(`Seed OK — projekt #${proj.id} + 3 roadmap items.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
