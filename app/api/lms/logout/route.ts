import { getLmsSession } from '@/lib/lmsSession';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getLmsSession();
  session.destroy();
  return NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
