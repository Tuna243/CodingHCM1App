import { NextResponse } from 'next/server';

const SHEET_ID = '11t0Rf18SkKG9bvlVjFJNRkXTWA5yZ0aLR_dpPAjNLAU';
const SHEET_GID = '1209418142';
const ALLOWED_CENTERS = ['Phan Văn Trị', 'Tô Ký', 'Quang Trung', 'Phan Xích Long'];

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Sheet responded ${response.status}`);

    const rows = parseCsv(await response.text());
    const headers = rows.shift() ?? [];
    const index = (name: string) => headers.indexOf(name);

    const teachers = rows
      .filter((row) => {
        const center = row[index('Centers')] ?? '';
        const status = (row[index('Status (update)')] ?? '').toLowerCase();
        return (
          row[index('Khối final')] === 'Coding' &&
          status === 'active' &&
          ALLOWED_CENTERS.some((allowed) => center.includes(allowed))
        );
      })
      .map((row) => ({
        name: (row[index('Full name')] ?? '').replace(/^\uFEFF/, ''),
        code: row[index('Code')] ?? '',
        center: row[index('Centers')] ?? '',
      }))
      .filter((teacher) => teacher.name && teacher.code)
      .filter(
        (teacher, position, all) =>
          all.findIndex((item) => item.code === teacher.code) === position,
      )
      .sort((a, b) => a.center.localeCompare(b.center, 'vi') || a.name.localeCompare(b.name, 'vi'));

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Unable to load teacher directory', error);
    return NextResponse.json(
      { teachers: [], error: 'Không thể tải danh sách giáo viên lúc này.' },
      { status: 502 },
    );
  }
}
