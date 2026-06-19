/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { getSessionId, getUserAgent, getUserId, isAppsScriptConfigured, trackLocalPageView, trackPageView } from '@/lib/appscript';
import { cn } from "@/lib/utils";
import { BookOpen, ExternalLink, Link as LinkIcon, Menu, MessageSquare, QrCode, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from 'react';

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'screen1', label: 'Giáo trình', icon: QrCode, shortcut: '1' },
  { id: 'screen2', label: 'Tìm phiếu', icon: Search, shortcut: '2' },
  { id: 'screen4', label: 'Nhận xét Zalo', icon: MessageSquare, shortcut: '3' },
  { id: 'screen5', label: 'Kiểm tra TP', icon: BookOpen, shortcut: '4' },
  { id: 'screen6', label: 'Link Mentor', icon: LinkIcon, shortcut: '5' },
  { id: 'screen11', label: 'Lộ trình ứng viên', icon: TrendingUp, shortcut: 'L', href: '/roadmap' },
  { id: 'deal', label: 'Chỉ số deal lương', icon: ExternalLink, shortcut: 'D', href: 'https://tmsmindx.vercel.app/' },
];

// Items hiển thị trên mobile bottom nav (tối đa 5)
const MOBILE_NAV_ITEMS = ['screen1', 'screen2', 'screen4', 'screen5'];

export default function Sidebar({ activeScreen, onScreenChange, isCollapsed, onToggle }: SidebarProps) {
  const [dealClicks, setDealClicks] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const v = localStorage.getItem('deal_click_count');
      if (v) setDealClicks(parseInt(v, 10));
    } catch { }
  }, []);

  function handleDealClick() {
    try {
      const next = dealClicks + 1;
      localStorage.setItem('deal_click_count', String(next));
      setDealClicks(next);
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
      "w-full flex items-center rounded-lg text-sm font-medium transition-colors relative",
      compact ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
      isActive
        ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
    );

    if (item.href) {
      const isExternal = item.href.startsWith('http');
      return (
        <a key={item.id} href={item.href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          onClick={() => { if (item.id === 'deal') handleDealClick(); }}
          className={cls} title={compact ? `${item.label} (${item.shortcut})` : undefined}>
          <Icon className="h-5 w-5 flex-shrink-0" />
          {!compact && (
            <>
              <span className="truncate flex-1">{item.label}</span>
              <span className={cn("flex items-center justify-center w-6 h-6 rounded text-xs font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-sky-700")}>{item.shortcut}</span>
              {isMounted && item.id === 'deal' && dealClicks > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">Đã bấm</span>
              )}
            </>
          )}
        </a>
      );
    }

    return (
      <button key={item.id}
        onClick={() => onScreenChange(item.id)}
        className={cls}
        style={item.id === 'screen5' && !isActive ? {
          animation: 'borderPulse 2s ease-in-out infinite',
          border: '2px solid', borderColor: 'rgba(99, 102, 241, 0.6)',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
        } : undefined}
        title={compact ? `${item.label} (${item.shortcut})` : undefined}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!compact && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            <span className={cn("flex items-center justify-center w-6 h-6 rounded text-xs font-semibold",
              isActive ? "bg-white/20 text-white" : "bg-[rgba(30,41,59,0.6)] text-[#a5b4fc]")}>{item.shortcut}</span>
          </>
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
        "hidden md:flex fixed left-0 top-0 h-full border-r border-sky-100 bg-white/90 backdrop-blur-md text-slate-900 transition-all duration-300 z-40 flex-col shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-sky-100 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          {!isCollapsed ? (
            <>
              <h2 className="text-lg font-semibold gradient-text">Coding HCM1</h2>
              <button onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                aria-label="Thu gọn sidebar">
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors mx-auto"
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
          <div className="p-4 border-t border-sky-100 mt-auto">
            <p className="text-xs text-center text-slate-500 leading-relaxed">
              Coding HCM1<br />
              <span className="text-sky-700 font-semibold">Nguyễn Hoàng Tuấn</span>
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
        "md:hidden fixed bottom-[60px] left-0 right-0 z-50 bg-white border-t border-sky-100 transition-transform duration-300 ease-in-out max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-2xl",
        mobileOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-100">
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
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-sky-50")}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              );
            }
            return (
              <button key={item.id} onClick={() => handleMobileSelect(item.id)}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-sky-50")}
                style={item.id === 'screen5' && !isActive ? {
                  border: '1.5px solid rgba(99, 102, 241, 0.5)',
                } : undefined}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded",
                  isActive ? "bg-white/20" : "bg-slate-100 text-slate-500")}>{item.shortcut}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom nav bar cố định */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-sky-100 backdrop-blur-md flex items-center">
        {menuItems.filter(i => MOBILE_NAV_ITEMS.includes(i.id)).map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => { onScreenChange(item.id); setMobileOpen(false); }}
              className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors",
                isActive ? "text-sky-600" : "text-slate-500 hover:text-sky-500")}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium leading-tight truncate max-w-full">{item.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-sky-600" />}
            </button>
          );
        })}
        {/* Nút mở drawer */}
        <button onClick={() => setMobileOpen(o => !o)}
          className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors",
            mobileOpen ? "text-sky-600" : "text-slate-500 hover:text-sky-500")}>
          <Menu className="w-5 h-5" />
          <span className="text-xs font-medium">Thêm</span>
        </button>
      </nav>
    </>
  );
}
