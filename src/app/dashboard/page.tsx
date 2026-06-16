import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { projects as projectsTable, roadmapItems } from '@/db/schema';
import { isAdmin } from '@/lib/auth';
import { logout } from '../login/actions';
import { RoadmapItemForm } from './_components/RoadmapItemForm';
import { RoadmapTable } from './_components/RoadmapTable';
import { CommitsPanel } from './_components/CommitsPanel';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!(await isAdmin())) {
    redirect('/login');
  }

  const [projects, items] = await Promise.all([
    db.select().from(projectsTable).orderBy(projectsTable.name),
    db.select().from(roadmapItems).orderBy(desc(roadmapItems.createdAt)),
  ]);

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

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
          Žiadne projekty v DB. Pridaj projekt (napr. cez Turso CLI alebo seed skript) — viď
          README.
        </p>
      ) : (
        <RoadmapItemForm projects={projects} />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Roadmap */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Roadmap</h2>
          <RoadmapTable items={items} />
        </section>

        {/* GitHub commity per projekt */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            GitHub commity (7 dní)
          </h2>
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className="text-sm font-medium">{p.name}</span>
              <CommitsPanel projectId={p.id} repo={p.githubRepo} />
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
