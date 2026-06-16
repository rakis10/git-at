import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold">Dev-Command Center</h1>
        <p className="text-sm text-zinc-500">Zadaj ADMIN_TOKEN pre prístup k zápisu.</p>
      </div>

      <form action={login} className="flex flex-col gap-3">
        <input
          type="password"
          name="token"
          placeholder="ADMIN_TOKEN"
          autoFocus
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-500">Nesprávny token.</p>}
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          Prihlásiť
        </button>
      </form>
    </main>
  );
}
