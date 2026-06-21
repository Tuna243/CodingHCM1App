'use client';

import { getTeacherCode } from '@/lib/appscript';
import {
  fetchUniformCampaign,
  getUniformCampaign,
  persistUniformTeacherUpdate,
  UNIFORM_SETTINGS_EVENT,
  UNIFORM_SIZES,
  uniformSummary,
  type UniformCampaign,
  type UniformSize,
} from '@/lib/uniformStore';
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Ruler,
  Shirt,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import UniformPoloPreview from './UniformPoloPreview';

const SIZE_ROWS = {
  nam: [
    ['A · Vai', 42, 44, 46, 47, 49, 51, 53],
    ['B · Vòng ngực', 96, 100, 104, 108, 112, 116, 120],
    ['C · Dài áo', 69, 71, 73, 75, 77, 79, 81],
  ],
  nu: [
    ['A · Vai', 33, 35, 37, 39, 41, 43, 45],
    ['B · Vòng ngực', 82, 86, 88, 92, 96, 100, 104],
    ['C · Dài áo', 58, 60, 62, 64, 66, 68, 70],
  ],
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#c9ded7] bg-[#eef7f3] px-2.5 py-1 text-xs font-semibold text-[#1d584e]">
      {status}
    </span>
  );
}

export default function ScreenUniform() {
  const [campaign, setCampaign] = useState<UniformCampaign>(() => getUniformCampaign());
  const [saved, setSaved] = useState(false);
  const teacherCode = getTeacherCode() ?? '';
  const currentTeacher = campaign.teachers.find((teacher) => teacher.code === teacherCode);
  const summary = useMemo(() => uniformSummary(campaign), [campaign]);

  useEffect(() => {
    const reloadLocal = () => setCampaign(getUniformCampaign());
    const reloadRemote = () => {
      void fetchUniformCampaign().then(setCampaign).catch(() => undefined);
    };
    reloadRemote();
    const interval = window.setInterval(reloadRemote, 5000);
    window.addEventListener(UNIFORM_SETTINGS_EVENT, reloadLocal);
    window.addEventListener('storage', reloadLocal);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(UNIFORM_SETTINGS_EVENT, reloadLocal);
      window.removeEventListener('storage', reloadLocal);
    };
  }, []);

  const updateCurrentTeacher = async (patch: {
    selectedSize?: UniformSize | '';
    extraQuantity?: number;
    received?: boolean;
  }) => {
    if (!currentTeacher) return;
    try {
      setCampaign(await persistUniformTeacherUpdate(currentTeacher.code, patch));
      setSaved(true);
    } catch {
      setSaved(false);
    }
    window.setTimeout(() => setSaved(false), 1800);
  };

  const confirmTeacherReceipt = (teacherCodeToUpdate: string, received: boolean) => {
    void persistUniformTeacherUpdate(teacherCodeToUpdate, { received })
      .then(setCampaign)
      .catch(() => undefined);
  };

  const extraRemaining = Math.max(0, campaign.extraSlots - summary.extraOrdered);
  const freeRemaining = Math.max(0, campaign.freeSlots - summary.freeRegistered);
  const canChooseSize =
    campaign.isOpen &&
    ((currentTeacher?.eligibleFree && (Boolean(currentTeacher.selectedSize) || freeRemaining > 0)) ||
      Boolean(currentTeacher?.extraQuantity));
  const teacherExtraCapacity = Math.min(
    3,
    extraRemaining + (currentTeacher?.extraQuantity ?? 0),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="page-eyebrow text-[#3a7a6e]">Teaching Operations</p>
        <h1 className="page-title gradient-text mt-2">Đồng phục giáo viên</h1>
        <p className="page-lead mt-3 max-w-3xl text-slate-600">
          Chọn size, đăng ký áo được cấp hoặc mua thêm và xác nhận sau khi nhận áo.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Shirt, label: 'Đợt hiện tại', value: campaign.name },
          { icon: Users, label: 'Đã chọn size', value: `${summary.freeRegistered}/${campaign.freeSlots || '—'}` },
          { icon: ShoppingBag, label: 'Slot mua thêm còn lại', value: `${extraRemaining}/${campaign.extraSlots || '—'}` },
          { icon: Clock3, label: 'Hạn đăng ký', value: campaign.deadline || 'Chưa thiết lập' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#c9ded7] bg-white p-4 shadow-sm">
            <item.icon className="h-5 w-5 text-[#1d584e]" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#3a7a6e]">{item.label}</p>
            <p className="mt-1 font-semibold text-[#1e293b]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className={campaign.isOpen ? 'grid gap-6 lg:grid-cols-[0.9fr_1.1fr]' : 'grid gap-6'}>
        <UniformPoloPreview />
        {campaign.isOpen && (
          <div className="rounded-3xl border border-[#c9ded7] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a6e]">Đăng ký cá nhân</p>
              <h2 className="section-title mt-1 text-[#1e293b]">
                {currentTeacher ? `${currentTeacher.name} · ${currentTeacher.code}` : 'Chưa có trong danh sách đợt áo'}
              </h2>
              {currentTeacher && <p className="mt-1 text-sm text-[#3a7a6e]">{currentTeacher.center}</p>}
            </div>
            {currentTeacher && <StatusBadge status={currentTeacher.status} />}
          </div>

          {!currentTeacher ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#c9ded7] bg-[#eef7f3] p-6 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-[#1d584e]" />
              <p className="mt-3 font-semibold text-[#1e293b]">Admin chưa thêm mã giáo viên của bạn vào đợt áo.</p>
              <p className="mt-1 text-sm text-[#3a7a6e]">Vui lòng kiểm tra lại khi danh sách được cập nhật.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <fieldset disabled={!canChooseSize}>
                <legend className="label-text text-[#1e293b]">Size áo</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {UNIFORM_SIZES.map((size) => (
                    <label key={size} className="cursor-pointer">
                      <input
                        type="radio"
                        name="uniform-size"
                        value={size}
                        checked={currentTeacher.selectedSize === size}
                        onChange={() => void updateCurrentTeacher({ selectedSize: size })}
                        className="peer sr-only"
                      />
                      <span className="flex min-h-11 items-center justify-center rounded-xl border border-[#c9ded7] bg-white text-sm font-bold text-[#1e293b] transition-colors peer-checked:border-[#1d584e] peer-checked:bg-[#1d584e] peer-checked:text-white">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#c9ded7] bg-[#eef7f3] p-4">
                  <p className="text-sm font-bold text-[#1d584e]">Áo được cấp</p>
                  <p className="mt-1 text-sm text-[#1e293b]">
                    {currentTeacher.eligibleFree ? `${currentTeacher.freeQuota} áo` : 'Không thuộc danh sách cấp miễn phí'}
                  </p>
                </div>
                <label className="rounded-2xl border border-[#c9ded7] bg-white p-4">
                  <span className="text-sm font-bold text-[#1d584e]">Mua thêm · {campaign.extraPrice.toLocaleString('vi-VN')}đ/áo</span>
                  <select
                    value={currentTeacher.extraQuantity}
                    disabled={!campaign.isOpen || (extraRemaining === 0 && currentTeacher.extraQuantity === 0)}
                    onChange={(event) => void updateCurrentTeacher({ extraQuantity: Number(event.target.value) })}
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#c9ded7] bg-white px-3 text-sm text-[#1e293b] outline-none focus:border-[#1d584e]"
                  >
                    {Array.from({ length: teacherExtraCapacity + 1 }, (_, quantity) => quantity).map((quantity) => (
                      <option key={quantity} value={quantity}>{quantity} áo</option>
                    ))}
                  </select>
                </label>
              </div>

              {(currentTeacher.status === 'Đã có áo' || currentTeacher.status === 'Đã nhận áo') && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#6cc3a0] bg-[#eef7f3] p-4">
                  <input
                    type="checkbox"
                    checked={currentTeacher.received}
                    onChange={(event) => void updateCurrentTeacher({ received: event.target.checked })}
                    className="mt-1 h-5 w-5 accent-[#1d584e]"
                  />
                  <span>
                    <strong className="block text-sm text-[#1e293b]">Tôi xác nhận đã nhận áo</strong>
                    <span className="mt-1 block text-xs text-[#3a7a6e]">Chỉ tick sau khi đã nhận và kiểm tra đúng size, đúng số lượng.</span>
                  </span>
                </label>
              )}

              {saved && (
                <p className="flex items-center gap-2 text-sm font-semibold text-[#1d584e]">
                  <CheckCircle2 className="h-4 w-4" /> Đã lưu lựa chọn.
                </p>
              )}
            </div>
          )}
          </div>
        )}
      </section>

      <section className="min-w-0 overflow-hidden rounded-3xl border border-[#c9ded7] bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex items-center gap-3">
          <Ruler className="h-5 w-5 text-[#1d584e]" />
          <div>
            <h2 className="section-title text-[#1e293b]">Bảng size áo polo</h2>
            <p className="text-sm text-[#3a7a6e]">Đơn vị cm · sai số may và độ co giãn khoảng ±1 cm.</p>
          </div>
        </div>
        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-2">
          {([
            ['Nam', SIZE_ROWS.nam],
            ['Nữ', SIZE_ROWS.nu],
          ] as const).map(([label, rows]) => (
            <div key={label} className="min-w-0">
              <p className="mb-2 text-sm font-bold text-[#1d584e]">Size {label}</p>
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                {UNIFORM_SIZES.map((size, sizeIndex) => (
                  <article
                    key={size}
                    className="min-w-0 rounded-2xl border border-[#c9ded7] bg-[#f8fafc] p-3"
                  >
                    <p className="text-center text-sm font-bold text-[#1d584e]">Size {size}</p>
                    <dl className="mt-2 space-y-1.5">
                      {rows.map((row) => (
                        <div key={row[0]} className="flex items-center justify-between gap-2 text-xs">
                          <dt className="min-w-0 truncate text-[#3a7a6e]">{row[0]}</dt>
                          <dd className="shrink-0 font-semibold text-[#1e293b]">{row[sizeIndex + 1]} cm</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
              <div className="data-table-shell hidden sm:block">
                <table className="app-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Thông số</th>
                      {UNIFORM_SIZES.map((size) => <th key={size}>{size}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-3xl border border-[#c9ded7] bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h2 className="section-title text-[#1e293b]">Danh sách đợt áo</h2>
            <p className="text-sm text-[#3a7a6e]">Chỉ hiển thị thông tin cần thiết cho việc cấp phát.</p>
          </div>
          <StatusBadge status={`${campaign.teachers.length} giáo viên`} />
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          {campaign.teachers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9ded7] bg-[#eef7f3] p-4 text-sm font-semibold text-[#1d584e]">
              Admin chưa import danh sách giáo viên cho đợt này.
            </div>
          ) : campaign.teachers.map((teacher) => (
            <article key={teacher.code} className="min-w-0 rounded-2xl border border-[#c9ded7] bg-[#f8fafc] p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-[#1e293b]">{teacher.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#3a7a6e]">{teacher.code} · {teacher.center}</p>
                </div>
                <div className="shrink-0">
                  {(teacher.status === 'Đã có áo' || teacher.status === 'Đã nhận áo') ? (
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#6cc3a0] bg-[#eef7f3] px-3 py-2">
                      <input
                        type="checkbox"
                        checked={teacher.received}
                        onChange={(event) => confirmTeacherReceipt(teacher.code, event.target.checked)}
                        className="h-5 w-5 accent-[#1d584e]"
                      />
                      <span className="text-xs font-semibold text-[#1d584e]">
                        {teacher.received ? 'Đã nhận áo' : 'Xác nhận đã nhận'}
                      </span>
                    </label>
                  ) : (
                    <StatusBadge status={teacher.status} />
                  )}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[#c9ded7] pt-3 text-center">
                <div>
                  <dt className="text-xs text-[#3a7a6e]">Size</dt>
                  <dd className="mt-1 text-sm font-bold text-[#1e293b]">{teacher.selectedSize || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#3a7a6e]">Được cấp</dt>
                  <dd className="mt-1 text-sm font-bold text-[#1e293b]">{teacher.eligibleFree ? teacher.freeQuota : 0}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#3a7a6e]">Mua thêm</dt>
                  <dd className="mt-1 text-sm font-bold text-[#1e293b]">{teacher.extraQuantity}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <div className="data-table-shell mt-4 hidden md:block">
          <table className="app-table min-w-[760px]">
            <thead>
              <tr>
                <th>Mã GV</th>
                <th>Họ tên</th>
                <th>Cơ sở</th>
                <th>Size</th>
                <th>Được cấp</th>
                <th>Mua thêm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {campaign.teachers.length === 0 ? (
                <tr><td colSpan={7}>Admin chưa import danh sách giáo viên cho đợt này.</td></tr>
              ) : campaign.teachers.map((teacher) => (
                <tr key={teacher.code}>
                  <td>{teacher.code}</td>
                  <td>{teacher.name}</td>
                  <td>{teacher.center}</td>
                  <td>{teacher.selectedSize || '—'}</td>
                  <td>{teacher.eligibleFree ? teacher.freeQuota : 0}</td>
                  <td>{teacher.extraQuantity}</td>
                  <td>
                    {(teacher.status === 'Đã có áo' || teacher.status === 'Đã nhận áo') ? (
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-[#6cc3a0] bg-[#eef7f3] px-3 py-2">
                        <input
                          type="checkbox"
                          checked={teacher.received}
                          onChange={(event) => confirmTeacherReceipt(teacher.code, event.target.checked)}
                          className="h-5 w-5 accent-[#1d584e]"
                        />
                        <span className="text-xs font-semibold text-[#1d584e]">
                          {teacher.received ? 'Đã nhận áo' : 'Xác nhận đã nhận'}
                        </span>
                      </label>
                    ) : (
                      <StatusBadge status={teacher.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
