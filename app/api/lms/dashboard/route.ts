import {
  getPersonalLmsDashboard,
  getValidLmsToken,
} from '@/lib/lmsApi';
import { getLmsSession } from '@/lib/lmsSession';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  try {
    const session = await getLmsSession();
    const token = await getValidLmsToken(session);
    if (!token) {
      session.destroy();
      return NextResponse.json(
        { error: 'Phiên LMS đã hết hạn.' },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }

    if (!session.teacherId || !session.teacherEmailHash) {
      session.destroy();
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập lại để đồng bộ lớp cá nhân.' },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }

    const teacher = {
      id: session.teacherId,
      name: session.teacherName || 'Giáo viên',
      emailHash: session.teacherEmailHash,
    };

    session.teacherId = teacher.id;
    session.teacherName = teacher.name;
    await session.save();

    return NextResponse.json(await getPersonalLmsDashboard(token, teacher), {
      headers: PRIVATE_NO_STORE,
    });
  } catch (error) {
    console.error('Unable to load LMS dashboard', error);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu LMS lúc này.' },
      { status: 502, headers: PRIVATE_NO_STORE },
    );
  }
}
