'use client';

import { MousePointer2, Rotate3D, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const UniformPoloScene = dynamic(() => import('./UniformPoloScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center text-sm font-semibold text-[#3a7a6e]">
      Đang dựng mô hình 3D…
    </div>
  ),
});

export default function UniformPoloPreview() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-[#c9ded7] bg-gradient-to-br from-white via-[#eef7f3] to-white shadow-sm">
      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#3a7a6e]">
          <Rotate3D className="h-4 w-4" /> Mô hình 3D
        </p>
        <p className="mt-1 text-sm text-[#1e293b]">Polo đen Teaching MindX</p>
      </div>

      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <UniformPoloScene resetKey={resetKey} />
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap">
        <div className="pointer-events-none flex items-center gap-2 rounded-full border border-[#c9ded7] bg-white/90 px-4 py-2 text-xs font-semibold text-[#1d584e] shadow-sm backdrop-blur">
          <MousePointer2 className="h-4 w-4" />
          Kéo để xoay · Cuộn để zoom
        </div>
        <button
          type="button"
          onClick={() => setResetKey((value) => value + 1)}
          aria-label="Đặt lại góc nhìn 3D"
          title="Đặt lại góc nhìn"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9ded7] bg-white/90 text-[#1d584e] shadow-sm backdrop-blur transition-colors hover:bg-[#eef7f3]"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
