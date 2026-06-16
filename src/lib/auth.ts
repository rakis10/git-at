import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'admin_token';

/** True ak má request platnú admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token) && token === process.env.ADMIN_TOKEN;
}

/** Hodí Unauthorized ak request nemá platnú admin cookie. Volá sa na začiatku každej write akcie. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized');
  }
}
