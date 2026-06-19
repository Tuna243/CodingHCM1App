import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'coding_hcm1_admin';

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? '';
}

export function isAdminPasswordConfigured() {
  return adminPassword().length > 0;
}

export function verifyAdminPassword(candidate: string) {
  const expected = Buffer.from(adminPassword());
  const received = Buffer.from(candidate);
  return (
    expected.length > 0 &&
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export function createAdminSession() {
  return createHmac('sha256', adminPassword()).update('coding-hcm1-admin-session').digest('hex');
}

export function verifyAdminSession(value?: string) {
  if (!value || !isAdminPasswordConfigured()) return false;
  const expected = Buffer.from(createAdminSession());
  const received = Buffer.from(value);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
