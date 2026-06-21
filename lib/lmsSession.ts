import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface LmsSessionData {
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  teacherId?: string;
  teacherName?: string;
  teacherEmailHash?: string;
}

const DEVELOPMENT_SECRET = 'coding-hcm1-local-lms-session-secret-2026';

function sessionPassword() {
  const configured = process.env.LMS_SESSION_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV !== 'production') return DEVELOPMENT_SECRET;
  throw new Error('LMS_SESSION_SECRET chưa được cấu hình.');
}

function sessionOptions(): SessionOptions {
  return {
    password: sessionPassword(),
    cookieName: 'coding_hcm1_lms_session',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getLmsSession(): Promise<IronSession<LmsSessionData>> {
  return getIronSession<LmsSessionData>(await cookies(), sessionOptions());
}
