import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ authenticated });
}
