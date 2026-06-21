import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
  return NextResponse.json(
    { authenticated },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
