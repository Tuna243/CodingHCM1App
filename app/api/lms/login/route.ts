import { firebaseLogin, hashTeacherEmail } from '@/lib/lmsApi';
import { getLmsSession } from '@/lib/lmsSession';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu LMS.' },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }

    const result = await firebaseLogin(email, password);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }

    const teacher = {
      id: result.teacherId,
      name: result.teacherName,
    };
    const session = await getLmsSession();
    session.token = result.token;
    session.refreshToken = result.refreshToken;
    session.expiresAt = result.expiresAt;
    session.teacherId = teacher.id;
    session.teacherName = teacher.name;
    session.teacherEmailHash = hashTeacherEmail(email);
    await session.save();

    return NextResponse.json({ teacher }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Unable to login to LMS', error);
    return NextResponse.json(
      { error: 'Không thể đăng nhập LMS lúc này.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }
}
