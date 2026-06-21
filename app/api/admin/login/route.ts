import {
  ADMIN_COOKIE,
  createAdminSession,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD chưa được cấu hình.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!verifyAdminPassword(String(password ?? ''))) {
    return NextResponse.json(
      { error: 'Mật khẩu không đúng!' },
      { status: 401, headers: PRIVATE_NO_STORE },
    );
  }

  const response = NextResponse.json({ success: true }, { headers: PRIVATE_NO_STORE });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
