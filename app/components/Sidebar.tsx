/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { getSessionId, getUserAgent, getUserId, isAppsScriptConfigured, trackLocalPageView, trackPageView } from '@/lib/appscript';
import { cn } from "@/lib/utils";
import { ExternalLink, GraduationCap, Link as LinkIcon, Menu, MessageSquare, QrCode, Search, Shirt, TrendingUp, X } from "lucide-react";
import { useState } from 'react';

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'screenLms', label: 'Lớp của tôi', icon: GraduationCap, shortcut: '5' },
  { id: 'screen1', label: 'Giáo trình', icon: QrCode, shortcut: '1' },
  { id: 'screen2', label: 'Tìm phiếu', icon: Search, shortcut: '2' },
  { id: 'screen4', label: 'Nhận xét Zalo', icon: MessageSquare, shortcut: '3' },
  { id: 'screen6', label: 'Link Mentor', icon: LinkIcon, shortcut: '4' },
  { id: 'screenUniform', label: 'Đồng phục giáo viên', icon: Shirt, shortcut: 'U' },
  { id: 'screen11', label: 'Lộ trình ứng viên', icon: TrendingUp, shortcut: 'L', href: '/roadmap' },
  { id: 'deal', label: 'Chỉ số deal lương', icon: ExternalLink, shortcut: 'D', href: 'https://tmsmindx.vercel.app/' },
];

// Items hiển thị trên mobile bottom nav (tối đa 5)
const MOBILE_NAV_ITEMS = ['screen1', 'screen2', 'screen4', 'screen6'];

export default function Sidebar({ activeScreen, onScreenChange, isCollapsed, onToggle }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleDealClick() {
    try {
      try { trackLocalPageView('deal'); } catch { }
      (async () => {
        try {
          if (isAppsScriptConfigured()) {
            const userId = getUserId();
            const sessionId = getSessionId();
            const userAgent = getUserAgent();
            await trackPageView({ screen: 'deal', userId, sessionId, userAgent });
          }
        } catch { }
      })();
    } catch { }
  }

  function handleMobileSelect(id: string) {
    onScreenChange(id);
    setMobileOpen(false);
  }

  // ── Shared item renderer ──────────────────────────────────────────────────
  function renderItem(item: typeof menuItems[0], compact = false) {
    const Icon = item.icon;
    const isActive = activeScreen === item.id;
    const cls = cn(
      "relative flex min-h-11 w-full cursor-pointer items-center rounded-lg text-sm font-medium transition-colors",
      compact ? "justify-center px-0 py-2.5" : "justify-start gap-3 px-3 py-2.5 text-left",
      isActive
        ? "bg-[#1d584e] text-white shadow-lg"
        : "text-[#1e293b] hover:bg-[#eef7f3] hover:text-[#1d584e]"
    );

    if (item.href) {
      const isExternal = item.href.startsWith('http');
      return (
        <a key={item.id} href={item.href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          onClick={() => { if (item.id === 'deal') handleDealClick(); }}
          className={cls} title={compact ? `${item.label} (${item.shortcut})` : undefined}>
          <Icon className="h-5 w-5 shrink-0" />
          {!compact && (
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
          )}
        </a>
      );
    }

    return (
      <button key={item.id}
        onClick={() => onScreenChange(item.id)}
        className={cls}
        title={compact ? `${item.label} (${item.shortcut})` : undefined}>
        <Icon className="h-5 w-5 shrink-0" />
        {!compact && (
          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (md+)
      ═══════════════════════════════════════════════════════════════════ */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 h-full border-r border-[#c9ded7] bg-white/95 backdrop-blur-md text-[#1e293b] transition-all duration-300 z-40 flex-col shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-[#c9ded7] transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          {!isCollapsed ? (
            <>
              <h2 className="text-lg font-semibold gradient-text">Coding HCM1</h2>
              <button onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3a7a6e] hover:bg-[#eef7f3] hover:text-[#1d584e] transition-colors"
                aria-label="Thu gọn sidebar">
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3a7a6e] hover:bg-[#eef7f3] hover:text-[#1d584e] transition-colors mx-auto"
              aria-label="Mở rộng sidebar">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map(item => renderItem(item, isCollapsed))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[#c9ded7] mt-auto">
            <p className="text-xs text-center text-slate-500 leading-relaxed">
              Made by<br />
              <span className="text-[#1d584e] font-semibold">Nguyễn Hoàng Tuấn</span><br />
              <span className="text-[#3a7a6e]">Lưu hành nội bộ HCM1</span>
            </p>
          </div>
        )}
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE — BOTTOM NAV BAR + SLIDE-UP DRAWER
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Overlay khi drawer mở */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Slide-up drawer (toàn bộ menu) */}
      <div className={cn(
        "md:hidden fixed bottom-[60px] left-0 right-0 z-50 bg-white border-t border-[#c9ded7] transition-transform duration-300 ease-in-out max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-2xl",
        mobileOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#c9ded7]">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            if (item.href) {
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => { if (item.id === 'deal') handleDealClick(); setMobileOpen(false); }}
                  className={cn("flex min-h-11 cursor-pointer items-center justify-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    isActive ? "bg-[#1d584e] text-white" : "text-[#1e293b] hover:bg-[#eef7f3]")}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              );
            }
            return (
              <button key={item.id} onClick={() => handleMobileSelect(item.id)}
                className={cn("flex min-h-11 w-full cursor-pointer items-center justify-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                  isActive ? "bg-[#1d584e] text-white" : "text-[#1e293b] hover:bg-[#eef7f3]")}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom nav bar cố định */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-[#c9ded7] backdrop-blur-md flex items-center">
        {menuItems.filter(i => MOBILE_NAV_ITEMS.includes(i.id)).map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => { onScreenChange(item.id); setMobileOpen(false); }}
              className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors",
                isActive ? "text-[#1d584e]" : "text-[#3a7a6e] hover:text-[#1d584e]")}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium leading-tight truncate max-w-full">{item.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#1d584e]" />}
            </button>
          );
        })}
        {/* Nút mở drawer */}
        <button onClick={() => setMobileOpen(o => !o)}
          className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors",
            mobileOpen ? "text-[#1d584e]" : "text-[#3a7a6e] hover:text-[#1d584e]")}>
          <Menu className="w-5 h-5" />
          <span className="text-xs font-medium">Thêm</span>
        </button>
      </nav>
    </>
  );
}
