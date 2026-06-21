'use client';

import {
  DEFAULT_UNIFORM_CAMPAIGN,
  fetchUniformCampaign,
  getUniformCampaign,
  normalizeUniformSize,
  persistUniformCampaign,
  uniformSummary,
  type UniformCampaign,
  type UniformTeacher,
} from '@/lib/uniformStore';
import { FileUp, Save, Shirt, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function findHeaderRow(rows: string[][]) {
  return rows.findIndex((row) =>
    row.some((cell) => cell.replace(/\s+/g, ' ').trim().toLowerCase().includes('mã giáo viên')),
  );
}

function normalizeHeader(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function parseExtraQuantity(note: string, totalQuantity: number) {
  if (!normalizeHeader(note).includes('mua thêm')) return 0;
  const explicitQuantity = note.match(/mua\s*thêm\s*\+?\s*(\d+)/i);
  return explicitQuantity ? Number(explicitQuantity[1]) : totalQuantity;
}

export default function UniformAdminPanel() {
  const [campaign, setCampaign] = useState<UniformCampaign>(() => getUniformCampaign());
  const [message, setMessage] = useState('');
  const summary = useMemo(() => uniformSummary(campaign), [campaign]);

  useEffect(() => {
    void fetchUniformCampaign()
      .then(setCampaign)
      .catch(() => setMessage('Không thể tải dữ liệu đồng phục từ máy chủ.'));
  }, []);

  const save = async () => {
    try {
      const savedCampaign = await persistUniformCampaign(campaign);
      setCampaign(savedCampaign);
      setMessage('Đã lưu cấu hình đợt áo.');
    } catch {
      setMessage('Không thể lưu cấu hình. Vui lòng đăng nhập lại Admin.');
    }
    window.setTimeout(() => setMessage(''), 2200);
  };

  const updateTeacher = (code: string, patch: Partial<UniformTeacher>) => {
    setCampaign((current) => {
      const nextCampaign = {
        ...current,
        teachers: current.teachers.map((teacher) =>
        teacher.code === code ? { ...teacher, ...patch } : teacher,
        ),
      };
      void persistUniformCampaign(nextCampaign)
        .then(setCampaign)
        .catch(() => setMessage('Không thể đồng bộ trạng thái lên máy chủ.'));
      return nextCampaign;
    });
    setMessage('Đã cập nhật trạng thái giáo viên.');
    window.setTimeout(() => setMessage(''), 1800);
  };

  const importCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    const headerIndex = findHeaderRow(rows);
    if (headerIndex < 0) {
      setMessage('Không tìm thấy dòng tiêu đề danh sách giáo viên.');
      return;
    }
    const headers = rows[headerIndex].map(normalizeHeader);
    const findIndex = (...terms: string[]) => headers.findIndex((header) => terms.some((term) => header.includes(term)));
    const findExactIndex = (...terms: string[]) => headers.findIndex((header) => terms.includes(header));
    const codeIndex = findIndex('mã giáo viên', 'mã gv');
    const nameIndex = findIndex('họ tên', 'full name');
    const centerIndex = findIndex('khu vực làm việc', 'cơ sở', 'center');
    const firstIndex = findIndex('cấp lần đầu');
    const scheduledIndex = findIndex('cấp thêm');
    const quantityIndex = findExactIndex('số lượng', 'số lượng áo');
    const sizeIndex = findIndex('size áo', 'size');
    const noteIndex = findExactIndex('note', 'ghi chú');

    if (codeIndex < 0 || nameIndex < 0 || quantityIndex < 0) {
      setMessage('CSV cần có cột mã giáo viên, họ tên và số lượng.');
      return;
    }

    const existing = new Map(campaign.teachers.map((teacher) => [teacher.code, teacher]));
    const imported = rows.slice(headerIndex + 1).flatMap<UniformTeacher>((row) => {
      const code = (row[codeIndex] ?? '').trim();
      const name = (row[nameIndex] ?? '').trim();
      if (!code || !name) return [];
      const previous = existing.get(code);
      const eligibleFree =
        (row[firstIndex] ?? '').toUpperCase() === 'TRUE' ||
        (row[scheduledIndex] ?? '').toUpperCase() === 'TRUE';
      const totalQuantity = Math.max(0, Number(row[quantityIndex] ?? 0) || 0);
      const extraQuantity = parseExtraQuantity(row[noteIndex] ?? '', totalQuantity);
      const freeQuota = eligibleFree ? Math.max(0, totalQuantity - extraQuantity) : 0;
      return [{
        code,
        name,
        center: (row[centerIndex] ?? '').trim(),
        eligibleFree,
        freeQuota,
        selectedSize: previous?.selectedSize || normalizeUniformSize(row[sizeIndex] ?? ''),
        extraQuantity,
        received: previous?.received ?? false,
        status: previous?.status ?? 'Chưa đăng ký',
      }];
    });

    const deduplicated = Array.from(new Map(imported.map((teacher) => [teacher.code, teacher])).values());
    setCampaign((current) => ({ ...current, teachers: deduplicated }));
    setMessage(`Đã đọc ${deduplicated.length} giáo viên. Không lưu số điện thoại hoặc dữ liệu HR.`);
  };

  return (
    <section className="rounded-2xl border border-[#c9ded7] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#eef7f3] p-2 text-[#1d584e]"><Shirt className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">Đợt đồng phục giáo viên</h2>
          <p className="text-sm text-[#3a7a6e]">Thiết lập quota và import danh sách cấp áo.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="label-text text-[#1e293b]">Tên đợt</span>
          <Input className="mt-2" value={campaign.name} onChange={(event) => setCampaign({ ...campaign, name: event.target.value })} />
        </label>
        <label>
          <span className="label-text text-[#1e293b]">Hạn đăng ký</span>
          <Input className="mt-2" type="date" value={campaign.deadline} onChange={(event) => setCampaign({ ...campaign, deadline: event.target.value })} />
        </label>
        <label>
          <span className="label-text text-[#1e293b]">Slot cấp miễn phí</span>
          <Input className="mt-2" type="number" min={0} value={campaign.freeSlots} onChange={(event) => setCampaign({ ...campaign, freeSlots: Number(event.target.value) })} />
        </label>
        <label>
          <span className="label-text text-[#1e293b]">Slot mua thêm</span>
          <Input className="mt-2" type="number" min={0} value={campaign.extraSlots} onChange={(event) => setCampaign({ ...campaign, extraSlots: Number(event.target.value) })} />
        </label>
        <label>
          <span className="label-text text-[#1e293b]">Giá mua thêm/áo</span>
          <Input className="mt-2" type="number" min={0} step={1000} value={campaign.extraPrice} onChange={(event) => setCampaign({ ...campaign, extraPrice: Number(event.target.value) })} />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[#c9ded7] p-3 md:mt-7">
          <input type="checkbox" checked={campaign.isOpen} onChange={(event) => setCampaign({ ...campaign, isOpen: event.target.checked })} className="h-5 w-5 accent-[#1d584e]" />
          <span className="text-sm font-semibold text-[#1e293b]">Mở đăng ký</span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#c9ded7] bg-[#eef7f3] px-4 py-2 text-sm font-semibold text-[#1d584e] hover:border-[#6cc3a0]">
          <FileUp className="h-4 w-4" /> Import CSV
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importCsv(file);
            event.currentTarget.value = '';
          }} />
        </label>
        <Button onClick={() => void save()} className="min-h-11 bg-[#1d584e] text-white hover:bg-[#3a7a6e]">
          <Save className="h-4 w-4" /> Lưu cấu hình
        </Button>
        <Button
          variant="outline"
          onClick={() => setCampaign({ ...DEFAULT_UNIFORM_CAMPAIGN })}
          className="min-h-11 border-[#c9ded7] text-[#1d584e]"
        >
          <Trash2 className="h-4 w-4" /> Tạo lại đợt
        </Button>
      </div>

      {message && <p className="mt-3 text-sm font-semibold text-[#1d584e]">{message}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ['Giáo viên', campaign.teachers.length],
          ['Đã chọn size', summary.freeRegistered],
          ['Áo mua thêm', summary.extraOrdered],
          ['Đã nhận', summary.received],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#c9ded7] bg-[#eef7f3] p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a6e]">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#1d584e]">{value}</p>
          </div>
        ))}
      </div>

      <div className="data-table-shell mt-5">
        <table className="app-table min-w-[760px]">
          <thead>
            <tr>
              <th>Mã GV</th><th>Họ tên</th><th>Cơ sở</th><th>Đủ điều kiện cấp</th><th>Quota</th><th>Size</th><th>Mua thêm</th><th>Đã nhận</th>
            </tr>
          </thead>
          <tbody>
            {campaign.teachers.length === 0 ? (
              <tr><td colSpan={8}>Import CSV để tạo danh sách giáo viên.</td></tr>
            ) : campaign.teachers.map((teacher) => (
              <tr key={teacher.code}>
                <td>{teacher.code}</td><td>{teacher.name}</td><td>{teacher.center}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={teacher.eligibleFree}
                    onChange={(event) => updateTeacher(teacher.code, {
                      eligibleFree: event.target.checked,
                      freeQuota: event.target.checked ? Math.max(1, teacher.freeQuota) : 0,
                    })}
                    className="h-5 w-5 accent-[#1d584e]"
                    aria-label={`Cho phép cấp áo miễn phí cho ${teacher.name}`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={teacher.freeQuota}
                    onChange={(event) => updateTeacher(teacher.code, { freeQuota: Number(event.target.value) })}
                    className="w-20 rounded-lg border border-[#c9ded7] bg-white px-2 py-1 text-sm"
                    aria-label={`Quota áo của ${teacher.name}`}
                  />
                </td>
                <td>{teacher.selectedSize || '—'}</td><td>{teacher.extraQuantity}</td>
                <td>
                  <select
                    value={teacher.status}
                    onChange={(event) => updateTeacher(teacher.code, {
                      status: event.target.value as UniformTeacher['status'],
                      received: false,
                    })}
                    className="min-h-10 rounded-lg border border-[#c9ded7] bg-white px-2 text-sm"
                    aria-label={`Trạng thái áo của ${teacher.name}`}
                  >
                    {teacher.status === 'Đã nhận áo' && (
                      <option value="Đã nhận áo" disabled>Đã nhận áo · GV xác nhận</option>
                    )}
                    {['Chưa đăng ký', 'Đã đăng ký', 'Đã có áo'].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
