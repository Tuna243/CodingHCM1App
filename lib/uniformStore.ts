export const UNIFORM_STORAGE_KEY = 'coding_hcm1_uniform_campaign';
export const UNIFORM_SETTINGS_EVENT = 'coding-hcm1-uniform-updated';

export const UNIFORM_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;
export type UniformSize = (typeof UNIFORM_SIZES)[number];

export type UniformStatus = 'Chưa đăng ký' | 'Đã đăng ký' | 'Đã có áo' | 'Đã nhận áo';

export interface UniformTeacher {
  code: string;
  name: string;
  center: string;
  eligibleFree: boolean;
  freeQuota: number;
  selectedSize: UniformSize | '';
  extraQuantity: number;
  received: boolean;
  status: UniformStatus;
}

export interface UniformCampaign {
  id: string;
  name: string;
  deadline: string;
  isOpen: boolean;
  freeSlots: number;
  extraSlots: number;
  extraPrice: number;
  teachers: UniformTeacher[];
}

const NGUYEN_HOANG_TUAN_TEACHERS: UniformTeacher[] = [
  { code: 'GV03725', name: 'Mã Hải Đăng', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'L', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV03746', name: 'Nguyễn Trí Khôi', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'XL', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV03748', name: 'Lê Trung Min', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: '3XL', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV01417', name: 'Vũ Quốc Anh', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'XL', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV01996', name: 'Nguyễn Anh Tuấn', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'L', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV01394', name: 'Bùi Quang Khải', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'L', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV01201', name: 'Đỗ Trường Vũ', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: 'XL', extraQuantity: 1, received: false, status: 'Đã đăng ký' },
  { code: 'GV02729', name: 'Nguyễn Đức Nghĩa', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: '2XL', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV00575', name: 'Lê Minh Trung', center: 'HCM1', eligibleFree: true, freeQuota: 1, selectedSize: '4XL', extraQuantity: 0, received: false, status: 'Đã đăng ký' },
  { code: 'GV02433', name: 'Nguyễn Phước Long', center: 'HCM1', eligibleFree: false, freeQuota: 0, selectedSize: '4XL', extraQuantity: 2, received: false, status: 'Đã đăng ký' },
];

export const DEFAULT_UNIFORM_CAMPAIGN: UniformCampaign = {
  id: 'teaching-polo-2026-02',
  name: 'Teaching Polo đợt 2 - 2026',
  deadline: '',
  isOpen: false,
  freeSlots: 10,
  extraSlots: 0,
  extraPrice: 70000,
  teachers: NGUYEN_HOANG_TUAN_TEACHERS,
};

export function normalizeUniformSize(value: string): UniformSize | '' {
  const normalized = value.trim().toUpperCase().replace(/^XXL$/, '2XL');
  return UNIFORM_SIZES.includes(normalized as UniformSize) ? (normalized as UniformSize) : '';
}

export function getUniformCampaign(): UniformCampaign {
  if (typeof window === 'undefined') return DEFAULT_UNIFORM_CAMPAIGN;
  try {
    const stored = window.localStorage.getItem(UNIFORM_STORAGE_KEY);
    if (!stored) return DEFAULT_UNIFORM_CAMPAIGN;
    const parsed = JSON.parse(stored) as Partial<UniformCampaign>;
    const teachers = Array.isArray(parsed.teachers)
      ? parsed.teachers.map((teacher) => ({
          ...teacher,
          status: (teacher.status as string) === 'Đã đặt áo' ? 'Đã có áo' : teacher.status,
        })) as UniformTeacher[]
      : [];
    return {
      ...DEFAULT_UNIFORM_CAMPAIGN,
      ...parsed,
      teachers,
    };
  } catch {
    return DEFAULT_UNIFORM_CAMPAIGN;
  }
}

export function saveUniformCampaign(campaign: UniformCampaign) {
  window.localStorage.setItem(UNIFORM_STORAGE_KEY, JSON.stringify(campaign));
  window.dispatchEvent(new CustomEvent(UNIFORM_SETTINGS_EVENT));
}

export async function fetchUniformCampaign(): Promise<UniformCampaign> {
  const response = await fetch('/api/uniform', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to fetch uniform campaign');
  const data = await response.json() as { campaign: UniformCampaign };
  saveUniformCampaign(data.campaign);
  return data.campaign;
}

export async function persistUniformCampaign(campaign: UniformCampaign): Promise<UniformCampaign> {
  saveUniformCampaign(campaign);
  const response = await fetch('/api/uniform', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!response.ok) throw new Error('Unable to persist uniform campaign');
  const data = await response.json() as { campaign: UniformCampaign };
  saveUniformCampaign(data.campaign);
  return data.campaign;
}

export async function persistUniformTeacherUpdate(
  code: string,
  patch: { selectedSize?: UniformSize | ''; extraQuantity?: number; received?: boolean },
): Promise<UniformCampaign> {
  const response = await fetch('/api/uniform', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, ...patch }),
  });
  if (!response.ok) throw new Error('Unable to persist uniform teacher update');
  const data = await response.json() as { campaign: UniformCampaign };
  saveUniformCampaign(data.campaign);
  return data.campaign;
}

export function updateUniformTeacher(
  teacherCode: string,
  updater: (teacher: UniformTeacher) => UniformTeacher,
) {
  const campaign = getUniformCampaign();
  const teachers = campaign.teachers.map((teacher) =>
    teacher.code === teacherCode ? updater(teacher) : teacher,
  );
  saveUniformCampaign({ ...campaign, teachers });
}

export function uniformSummary(campaign: UniformCampaign) {
  const freeRegistered = campaign.teachers.filter(
    (teacher) => teacher.eligibleFree && teacher.selectedSize,
  ).length;
  const extraOrdered = campaign.teachers.reduce(
    (sum, teacher) => sum + teacher.extraQuantity,
    0,
  );
  const received = campaign.teachers.filter((teacher) => teacher.received).length;
  return { freeRegistered, extraOrdered, received };
}
