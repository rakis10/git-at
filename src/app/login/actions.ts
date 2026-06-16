'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE } from '@/lib/auth';

export async function login(formData: FormData) {
  const token = String(formData.get('token') ?? '');

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    redirect('/login?error=1');
  }

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dní
  });

  redirect('/dashboard');
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/login');
}
