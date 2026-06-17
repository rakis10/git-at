import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { projects as projectsTable, roadmapItems, weeklyChangelogs } from '@/db/schema';
import { isAdmin } from '@/lib/auth';
import { logout } from '../login/actions';
import { RoadmapItemForm } from './_components/RoadmapItemForm';
import { RoadmapTable } from './_components/RoadmapTable';
import { ProjectForm } from './_components/ProjectForm';
import { ProjectCard } from './_components/ProjectCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!(await isAdmin())) {
    redirect('/login');
  }

  const [projects, items, changelogs] = await Promise.all([
    db.select().from(projectsTable).orderBy(projectsTable.name),
    db.select().from(roadmapItems).orderBy(desc(roadmapItems.createdAt)),
    db.select().from(weeklyChangelogs).orderBy(desc(weeklyChangelogs.createdAt)),
  ]);

  // najnovší changelog per projekt (changelogs sú zoradené desc, prvý výskyt = najnovší)
  const latestChangelog = new Map<number, (typeof changelogs)[number]>();
  for (const c of changelogs) {
    if (!latestChangelog.has(c.projectId)) latestChangelog.set(c.projectId, c);
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dev-Command Center</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-400 hover:text-zinc-600">
            Odhlásiť
          </button>
        </form>
      </header>

      {/* Pridať projekt */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Projekty</h2>
        <ProjectForm />
      </section>

      {projects.length > 0 && <RoadmapItemForm projects={projects} />}

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Roadmap */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Roadmap</h2>
          <RoadmapTable items={items} />
        </section>

        {/* GitHub commity + changelog per projekt */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            GitHub & Changelog
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-zinc-500">Pridaj projekt vyššie.</p>
          ) : (
            projects.map((p) => {
              const cl = latestChangelog.get(p.id);
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  changelogMarkdown={cl?.generatedMarkdown ?? null}
                  changelogWeek={cl?.weekNumber ?? null}
                />
              );
            })
          )}
        </aside>
      </div>
    </main>
  );
}
