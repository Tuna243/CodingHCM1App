import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SHEET_ID = '11t0Rf18SkKG9bvlVjFJNRkXTWA5yZ0aLR_dpPAjNLAU';
const SHEET_GID = '1209418142';
const SUPPLEMENTAL_SHEET_ID = '1qSYlFqVNL3A63vhyHlIAKu9nh0RrkSzuUH62-0WxNz0';
const SUPPLEMENTAL_SHEET_GID = '1098856242';
const ALLOWED_CENTERS = ['Phan Văn Trị', 'Tô Ký', 'Quang Trung', 'Phan Xích Long'];

type SheetRecord = Record<string, string>;

type AdminTeacher = {
  name: string;
  code: string;
  center: string;
  email: string;
  phone: string;
  rankK12: string;
  joinedDate: string;
};

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalizeJoinedDate(value: string) {
  const normalized = value.trim();
  if (!normalized) return '';

  const slashDateMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashDateMatch) {
    const [, firstPart, secondPart, year] = slashDateMatch;
    const firstNumber = Number(firstPart);
    const secondNumber = Number(secondPart);
    const isDayFirst = firstNumber > 12 && secondNumber <= 12;
    const month = isDayFirst ? secondPart : firstPart;
    const day = isDayFirst ? firstPart : secondPart;
    return toIsoDate(year, month, day);
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function toIsoDate(year: string, month: string, day: string) {
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const parsed = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay));

  if (
    parsed.getUTCFullYear() !== numericYear ||
    parsed.getUTCMonth() !== numericMonth - 1 ||
    parsed.getUTCDate() !== numericDay
  ) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeLookup(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function rowToRecord(headers: string[], row: string[]) {
  return headers.reduce<SheetRecord>((record, header, index) => {
    record[normalizeHeader(header)] = (row[index] ?? '').trim();
    return record;
  }, {});
}

function getField(record: SheetRecord, aliases: string[]) {
  for (const alias of aliases) {
    const value = record[normalizeHeader(alias)];
    if (value) return value.trim();
  }
  return '';
}

function getMindxEmail(record: SheetRecord) {
  const email = getField(record, [
    'Work email',
    'Email',
    'Email MindX',
    'MindX email',
    'Email mindx.net.vn',
    'Mail MindX',
  ]);
  return email.toLowerCase().endsWith('@mindx.net.vn') ? email : '';
}

function getTeacherCode(record: SheetRecord) {
  return getField(record, ['Code', 'User name', 'Username', 'Mã giáo viên', 'Mã GV', 'Teacher code']);
}

function getTeacherName(record: SheetRecord) {
  return getField(record, ['Full name', 'Họ và tên', 'Ho ten', 'Name', 'Teacher name', 'Giáo viên']).replace(/^\uFEFF/, '');
}

function getTeacherPhone(record: SheetRecord) {
  return getField(record, ['Phone number', 'SĐT', 'SDT', 'Số điện thoại', 'Phone', 'Mobile']);
}

function getTeacherRank(record: SheetRecord) {
  return getField(record, ['Rank K12 check', 'Rank K12', 'Rank', 'Xếp hạng', 'Rank check']);
}

function getTeacherJoinedDate(record: SheetRecord) {
  return normalizeJoinedDate(
    getField(record, ['Joined date', 'Thời gian onboard', 'Onboard date', 'Ngày onboard', 'Ngày vào làm']),
  );
}

function getTeacherCenter(record: SheetRecord) {
  return getField(record, ['Centers', 'Center', 'Cơ sở', 'Khu vực làm việc', 'Khu vực']);
}

async function fetchSheetRecords(sheetId: string, gid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Sheet responded ${response.status}`);

  const rows = parseCsv(await response.text());
  const headers = rows.shift() ?? [];
  return rows.map((row) => rowToRecord(headers, row));
}

function parsePrimaryTeacher(record: SheetRecord): AdminTeacher {
  const email = getMindxEmail(record);
  return {
    name: getTeacherName(record),
    code: getTeacherCode(record),
    center: getTeacherCenter(record),
    email,
    phone: getTeacherPhone(record),
    rankK12: getTeacherRank(record),
    joinedDate: getTeacherJoinedDate(record),
  };
}

function teacherKeys(teacher: Pick<AdminTeacher, 'name' | 'code' | 'email'>) {
  return [
    teacher.code && `code:${normalizeLookup(teacher.code)}`,
    teacher.email && `email:${normalizeLookup(teacher.email)}`,
    teacher.name && `name:${normalizeLookup(teacher.name)}`,
  ].filter(Boolean) as string[];
}

function createSupplementalIndex(records: SheetRecord[]) {
  const index = new Map<string, Partial<AdminTeacher>>();

  for (const record of records) {
    const supplementalTeacher: Partial<AdminTeacher> = {
      name: getTeacherName(record),
      code: getTeacherCode(record),
      email: getMindxEmail(record),
      phone: getTeacherPhone(record),
      rankK12: getTeacherRank(record),
      joinedDate: getTeacherJoinedDate(record),
    };

    for (const key of teacherKeys({
      name: supplementalTeacher.name ?? '',
      code: supplementalTeacher.code ?? '',
      email: supplementalTeacher.email ?? '',
    })) {
      if (!index.has(key)) index.set(key, supplementalTeacher);
    }
  }

  return index;
}

function findSupplementalTeacher(index: Map<string, Partial<AdminTeacher>>, teacher: AdminTeacher) {
  for (const key of teacherKeys(teacher)) {
    const match = index.get(key);
    if (match) return match;
  }
  return null;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { teachers: [], error: 'Bạn cần đăng nhập Admin.' },
      { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  try {
    const primaryRecords = await fetchSheetRecords(SHEET_ID, SHEET_GID);
    const warnings: string[] = [];
    let supplementalRecords: SheetRecord[] = [];

    try {
      supplementalRecords = await fetchSheetRecords(SUPPLEMENTAL_SHEET_ID, SUPPLEMENTAL_SHEET_GID);
    } catch (supplementalError) {
      console.warn('Unable to load supplemental teacher sheet', supplementalError);
      warnings.push('Sheet bổ sung chưa truy cập được. Vui lòng share/publish sheet để server đọc dữ liệu.');
    }

    const supplementalIndex = createSupplementalIndex(supplementalRecords);

    const teachers = primaryRecords
      .filter((record) => {
        const center = getTeacherCenter(record);
        const status = getField(record, ['Status (update)', 'Status']).toLowerCase();
        return (
          getField(record, ['Khối final', 'Khoi final', 'Course line']) === 'Coding' &&
          status === 'active' &&
          ALLOWED_CENTERS.some((allowedCenter) => center.includes(allowedCenter))
        );
      })
      .map((record) => {
        const teacher = parsePrimaryTeacher(record);
        const supplemental = findSupplementalTeacher(supplementalIndex, teacher);

        if (!supplemental) return teacher;

        return {
          ...teacher,
          email: supplemental.email || teacher.email,
          phone: supplemental.phone || teacher.phone,
          rankK12: supplemental.rankK12 || teacher.rankK12,
          joinedDate: supplemental.joinedDate || teacher.joinedDate,
        };
      })
      .filter((teacher) => teacher.name && teacher.code)
      .filter(
        (teacher, position, allTeachers) =>
          allTeachers.findIndex((candidate) => candidate.code === teacher.code) === position,
      )
      .sort(
        (first, second) =>
          second.joinedDate.localeCompare(first.joinedDate) ||
          first.name.localeCompare(second.name, 'vi'),
      );

    return NextResponse.json(
      {
        teachers,
        sources: {
          primaryRows: primaryRecords.length,
          supplementalRows: supplementalRecords.length,
          supplementalConnected: supplementalRecords.length > 0,
        },
        warnings,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Unable to load admin teacher directory', error);
    return NextResponse.json(
      { teachers: [], error: 'Không thể tải danh sách giáo viên lúc này.' },
      { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
