import { getValidLmsToken } from '@/lib/lmsApi';
import { getLmsSession } from '@/lib/lmsSession';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  try {
    const session = await getLmsSession();
    const token = await getValidLmsToken(session);
    if (!token || !session.teacherId) {
      session.destroy();
      return NextResponse.json(
        { authenticated: false },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }
    await session.save();
    return NextResponse.json({
      authenticated: true,
      teacher: {
        id: session.teacherId,
        name: session.teacherName || 'Giáo viên',
      },
    }, { headers: PRIVATE_NO_STORE });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: PRIVATE_NO_STORE },
    );
  }
}
