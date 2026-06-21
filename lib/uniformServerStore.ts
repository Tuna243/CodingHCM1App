import 'server-only';

import { del, get, list, put } from '@vercel/blob';
import {
  DEFAULT_UNIFORM_CAMPAIGN,
  type UniformCampaign,
  type UniformStatus,
  type UniformTeacher,
} from './uniformStore';

const UNIFORM_PREFIX = 'uniform-campaign/';

function normalizeStatus(status: string): UniformStatus {
  if (status === 'Đã đặt áo') return 'Đã có áo';
  if (['Chưa đăng ký', 'Đã đăng ký', 'Đã có áo', 'Đã nhận áo'].includes(status)) {
    return status as UniformStatus;
  }
  return 'Chưa đăng ký';
}

export function sanitizeUniformCampaign(value: Partial<UniformCampaign>): UniformCampaign {
  const teachers = Array.isArray(value.teachers)
    ? value.teachers.flatMap<UniformTeacher>((teacher) => {
        if (!teacher?.code || !teacher?.name) return [];
        return [{
          code: String(teacher.code),
          name: String(teacher.name),
          center: String(teacher.center ?? ''),
          eligibleFree: Boolean(teacher.eligibleFree),
          freeQuota: Math.max(0, Number(teacher.freeQuota) || 0),
          selectedSize: teacher.selectedSize ?? '',
          extraQuantity: Math.max(0, Number(teacher.extraQuantity) || 0),
          received: Boolean(teacher.received),
          status: normalizeStatus(String(teacher.status ?? 'Chưa đăng ký')),
        }];
      })
    : DEFAULT_UNIFORM_CAMPAIGN.teachers;

  return {
    id: String(value.id ?? DEFAULT_UNIFORM_CAMPAIGN.id),
    name: String(value.name ?? DEFAULT_UNIFORM_CAMPAIGN.name),
    deadline: String(value.deadline ?? ''),
    isOpen: Boolean(value.isOpen),
    freeSlots: Math.max(0, Number(value.freeSlots) || 0),
    extraSlots: Math.max(0, Number(value.extraSlots) || 0),
    extraPrice: Math.max(0, Number(value.extraPrice) || 0),
    teachers,
  };
}

export async function readUniformCampaign(): Promise<UniformCampaign> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return DEFAULT_UNIFORM_CAMPAIGN;

  const result = await list({ prefix: UNIFORM_PREFIX, limit: 100 });
  const latest = [...result.blobs].sort(
    (left, right) => right.uploadedAt.getTime() - left.uploadedAt.getTime(),
  )[0];
  if (!latest) return DEFAULT_UNIFORM_CAMPAIGN;

  const blob = await get(latest.url, { access: 'private' });
  if (!blob?.stream) return DEFAULT_UNIFORM_CAMPAIGN;
  const parsed = await new Response(blob.stream).json() as Partial<UniformCampaign>;
  return sanitizeUniformCampaign(parsed);
}

export async function writeUniformCampaign(campaign: UniformCampaign) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  await put(
    `${UNIFORM_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`,
    JSON.stringify(sanitizeUniformCampaign(campaign)),
    { access: 'private', contentType: 'application/json' },
  );

  const result = await list({ prefix: UNIFORM_PREFIX, limit: 100 });
  const obsolete = [...result.blobs]
    .sort((left, right) => right.uploadedAt.getTime() - left.uploadedAt.getTime())
    .slice(20)
    .map((blob) => blob.url);
  if (obsolete.length) await del(obsolete);
}
