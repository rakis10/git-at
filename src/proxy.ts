import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/constants';

// Centrálny gate (Next 16 Proxy, býv. Middleware): bez platnej admin cookie
// presmeruj /dashboard/* na /login. Server Actions si naďalej volajú requireAdmin()
// (defense-in-depth — Proxy je len optimistický redirect, nie session authority).
export function proxy(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
