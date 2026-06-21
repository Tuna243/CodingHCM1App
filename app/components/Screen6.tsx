/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { Building2, DollarSign, FileText, Link as LinkIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from "./ui/button";

interface NavItem {
  url: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Quy trình & Đăng ký',
    items: [
      {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLScZuVAlACc1Pnoz7GU85xkwTdcHdJh6vMdbeYJwEIaxeE_q2Q/viewform',
        title: 'Đăng ký lịch làm',
        icon: FileText
      }
    ]
  },
  {
    title: 'Lịch cơ sở',
    items: [
      {
        url: 'https://docs.google.com/spreadsheets/d/1qjqo6nrQKegFPzu4t8D4W2Q5-fJ829ghNvTDWjRD1r4/edit?gid=0#gid=0',
        title: 'Cơ sở HCM1',
        icon: Building2
      }
    ]
  },
  {
    title: 'Feedback & Lương',
    items: [
      {
        url: 'https://docs.google.com/forms/d/1O_-_olXKQAR85nV49lauK-_76J6xyxVDqptBcOq-h0s/preview',
        title: 'Feedback lương',
        icon: DollarSign
      }
    ]
  }
];

export default function Screen6() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [showIframe, setShowIframe] = useState(false);
  const navItems = navSections.flatMap((section) => section.items);

  // Optimize URL for Google Sheets/Forms
  const getOptimizedUrl = (url: string) => {
    // Keep Google Sheets on the direct edit URL
    if (url.includes('docs.google.com/spreadsheets')) {
      // Extract sheet ID and gid from URL
      const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const gidMatch = url.match(/[#&]gid=(\d+)/);
      
      if (sheetIdMatch && gidMatch) {
        const sheetId = sheetIdMatch[1];
        const gid = gidMatch[1];
        // Use the direct edit URL
        return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=${gid}#gid=${gid}`;
      }
      // If we can't extract, return original URL
      return url;
    }
    // For Google Forms and other URLs, return as is
    return url;
  };

  // Auto-open first item on mount
  useEffect(() => {
    const firstItem = navSections[0]?.items[0];
    if (firstItem) {
      openLink(firstItem.url, firstItem.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLink = (url: string, title: string) => {
    const optimizedUrl = getOptimizedUrl(url);
    setActiveUrl(optimizedUrl);
    setActiveTitle(title);
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
    setActiveUrl(null);
    setActiveTitle('');
  };

  return (
    <div className="relative flex h-[calc(100dvh-60px)] w-full min-w-0 flex-col overflow-hidden md:h-screen md:flex-row">
      {/* Sidebar */}
      <div className="hidden h-screen w-52 flex-shrink-0 overflow-y-auto border-r border-[#c9ded7] bg-white/95 backdrop-blur-md md:block">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-[#c9ded7]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#eef7f3] border border-[#c9ded7]">
                <LinkIcon className="h-4 w-4 text-[#1d584e]" />
              </div>
              <h1 className="text-base font-bold text-[#1d584e]">
                Link Mentor
              </h1>
            </div>
            <p className="text-xs text-[#3a7a6e] ml-12 leading-relaxed">
              Truy cập nhanh các liên kết
            </p>
          </div>

          <div className="space-y-4">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1.5">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6cc3a0] to-transparent"></div>
                  <h3 className="text-xs font-semibold text-[#1d584e] uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6cc3a0] to-transparent"></div>
                </div>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => openLink(item.url, item.title)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded border transition-all",
                        "bg-white border-[#c9ded7]",
                        "hover:bg-[#eef7f3] hover:border-[#6cc3a0] hover:translate-x-1",
                        activeUrl === item.url && "bg-[#eef7f3] border-[#3a7a6e]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#1d584e] flex-shrink-0" />
                      <span className="font-medium text-xs text-[#1e293b] truncate">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile link selector */}
      <div className="shrink-0 border-b border-[#c9ded7] bg-white px-3 py-3 md:hidden">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9ded7] bg-[#eef7f3]">
            <LinkIcon className="h-4 w-4 text-[#1d584e]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#1d584e]">Link Mentor</h1>
            <p className="text-xs text-[#3a7a6e]">Chọn liên kết cần mở</p>
          </div>
        </div>
        <label className="sr-only" htmlFor="mentor-link-select">Chọn liên kết Mentor</label>
        <select
          id="mentor-link-select"
          value={activeTitle}
          onChange={(event) => {
            const item = navItems.find((candidate) => candidate.title === event.target.value);
            if (item) openLink(item.url, item.title);
          }}
          className="min-h-11 w-full rounded-xl border border-[#c9ded7] bg-white px-3 text-sm font-semibold text-[#1e293b] outline-none focus:border-[#1d584e] focus:ring-2 focus:ring-[#6cc3a0]/30"
        >
          {navSections.map((section) => (
            <optgroup key={section.title} label={section.title}>
              {section.items.map((item) => (
                <option key={item.title} value={item.title}>{item.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Main Content Area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!showIframe ? (
          <div className="flex items-center justify-center flex-1" style={{ height: '100%' }}>
            <div className="text-center">
              <LinkIcon className="h-16 w-16 text-[#6cc3a0] mx-auto mb-4 opacity-70" />
              <h2 className="text-xl font-semibold text-[#1e293b] mb-2">
                Chọn một liên kết từ menu bên trái
              </h2>
              <p className="text-sm text-[#3a7a6e]">
                Để xem nội dung
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col bg-white flex-1" style={{ height: '100%' }}>
            {/* Iframe Header */}
            <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#3a7a6e] bg-[#1d584e] px-3 py-2.5 backdrop-blur-md sm:px-4">
              <h2 className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-white">
                <LinkIcon className="h-4 w-4" />
                <span className="truncate">{activeTitle}</span>
              </h2>
              <Button
                onClick={closeIframe}
                size="sm"
                className="h-8 shrink-0 border border-white/20 bg-white/10 px-2 text-xs text-white hover:bg-[#3a7a6e]"
              >
                <X className="h-3 w-3 mr-1" />
                Đóng
              </Button>
            </div>

            {/* Iframe container */}
            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
              {activeUrl && (
                <iframe
                  key={activeUrl}
                  src={activeUrl}
                  className="border-none"
                  title={activeTitle}
                  allow="clipboard-read; clipboard-write; fullscreen"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

