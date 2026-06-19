import {
  ADMIN_COOKIE,
  createAdminSession,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD chưa được cấu hình.' },
      { status: 503 },
    );
  }

  const { password } = await request.json();
  if (!verifyAdminPassword(String(password ?? ''))) {
    return NextResponse.json({ error: 'Mật khẩu không đúng!' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
