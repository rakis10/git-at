import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let _db: LibSQLDatabase<typeof schema> | null = null;

function getDb(): LibSQLDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL nie je nastavené');
  if (url.includes('your-db')) {
    throw new Error(
      'TURSO_DATABASE_URL je stále placeholder z .env.example — doplň reálnu Turso DB URL (turso db show <db> --url alebo z web dashboardu).',
    );
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  _db = drizzle(client, { schema });
  return _db;
}

// Lazy proxy — vytvorí klienta až pri prvom použití, aby import nemal side-efekty
// (inak by `next build` padol pri collect page data bez env premenných).
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
