/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { Building2, Calendar, DollarSign, FileText, Link as LinkIcon, X } from 'lucide-react';
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
    title: 'Lịch hàng tuần',
    items: [
      {
        url: 'https://docs.google.com/spreadsheets/d/1UMYNuY1Qetp89hIVjYYG5Zc8MW2yM8e8DMrjy9mzSpw/edit?gid=1016993676#gid=1016993676',
        title: 'Lịch HCM1',
        icon: Calendar
      },
      {
        url: 'https://docs.google.com/spreadsheets/d/1oDwUvol9yS7BrNfdVcq219Gop9ku09gpn-7acF58Tz8/edit?gid=1016993676#gid=1016993676',
        title: 'Lịch HCM4',
        icon: Calendar
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
      },
      {
        url: 'https://docs.google.com/spreadsheets/d/1DRASt1UR8drUTLH-WGvguJRWudq3Z02eicwxxmPphek/edit?gid=0#gid=0',
        title: 'Cơ sở HCM4',
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
  const [isLoaded, setIsLoaded] = useState(false);

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
    setIsLoaded(false);
    const optimizedUrl = getOptimizedUrl(url);
    setActiveUrl(optimizedUrl);
    setActiveTitle(title);
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
    setActiveUrl(null);
    setActiveTitle('');
    setIsLoaded(false);
  };

  return (
    <div 
      className="relative flex w-full overflow-hidden"
      style={{
        height: '100vh',
        width: '100%'
      }}
    >
      {/* Sidebar */}
      <div className="w-52 bg-[rgba(15,23,42,0.95)] backdrop-blur-md border-r border-white/10 overflow-y-auto flex-shrink-0" style={{ height: '100vh' }}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <LinkIcon className="h-4 w-4 text-[#a5b4fc]" />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[#a5b4fc] to-[#c7d2fe] bg-clip-text text-transparent">
                Link Mentor
              </h1>
            </div>
            <p className="text-xs text-[#94a3b8] ml-12 leading-relaxed">
              Truy cập nhanh các liên kết
            </p>
          </div>

          <div className="space-y-4">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1.5">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                  <h3 className="text-xs font-semibold text-[#a5b4fc] uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                </div>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => openLink(item.url, item.title)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded border transition-all",
                        "bg-[rgba(255,255,255,0.05)] border-white/10",
                        "hover:bg-[rgba(99,102,241,0.1)] hover:border-indigo-500/30 hover:translate-x-1",
                        activeUrl === item.url && "bg-[rgba(99,102,241,0.2)] border-indigo-500/50"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#a5b4fc] flex-shrink-0" />
                      <span className="font-medium text-xs text-[#f8fafc] truncate">
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

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden" style={{ height: '100vh' }}>
        {!showIframe ? (
          <div className="flex items-center justify-center flex-1" style={{ height: '100%' }}>
            <div className="text-center">
              <LinkIcon className="h-16 w-16 text-[#a5b4fc] mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-[#cbd5e1] mb-2">
                Chọn một liên kết từ menu bên trái
              </h2>
              <p className="text-sm text-[#94a3b8]">
                Để xem nội dung
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col bg-white flex-1" style={{ height: '100%' }}>
            {/* Iframe Header */}
            <div className="bg-[rgba(15,23,42,0.9)] backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {activeTitle}
              </h2>
              <Button
                onClick={closeIframe}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Đóng
              </Button>
            </div>

            {/* Iframe container */}
            <div className="flex-1 relative overflow-hidden bg-white" style={{ height: 'calc(100vh - 48px)' }}>
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

