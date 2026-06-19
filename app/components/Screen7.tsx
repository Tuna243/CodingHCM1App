/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { Calendar, FileText, Mail, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
    title: 'Mail chỉ số',
    items: [
      {
        url: 'https://docs.google.com/spreadsheets/d/1zBNoySRfy8K3lVXGLJT2CUIEWIpv_EXXNSBY13Zc0E8/edit?gid=1037204958#gid=1037204958',
        title: 'Teaching Robotics',
        icon: Mail
      },
      {
        url: 'https://docs.google.com/spreadsheets/d/1Cg45SOg5g9W_AqLnmW10dWoIV7R_kQ7QP6VHltXDyNI/edit?gid=678464926#gid=678464926',
        title: 'Lịch tham gia kiểm tra chuyên sâu',
        icon: Calendar
      },
      {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSeLOGUqWDEyHcBEQIeV3ViFsxirgz824s55qC9yCQErAvCDOQ/viewform',
        title: 'Đăng ký kiểm tra chuyên sâu',
        icon: FileText
      },
      {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLScJQVETL6pk_ApLNkEPMgZntb4ydvOM7wXBi9wJfDxksWw9qg/closedform',
        title: 'Kiểm tra chuyên sâu bổ sung',
        icon: FileText
      }
    ]
  }
];

export default function Screen7() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [showIframe, setShowIframe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Optimize URL for Google Sheets/Forms
  const getOptimizedUrl = useCallback((url: string) => {
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
  }, []);

  const openLink = useCallback((url: string, title: string) => {
    setIsLoaded(false);
    const optimizedUrl = getOptimizedUrl(url);
    setActiveUrl(optimizedUrl);
    setActiveTitle(title);
    setShowIframe(true);
  }, [getOptimizedUrl]);

  // Auto-open first item on mount
  useEffect(() => {
    const firstItem = navSections[0]?.items[0];
    if (firstItem) {
      openLink(firstItem.url, firstItem.title);
    }
  }, [openLink]);

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
                <Mail className="h-4 w-4 text-[#a5b4fc]" />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[#a5b4fc] to-[#c7d2fe] bg-clip-text text-transparent">
                Nhận mail chỉ số
              </h1>
            </div>
            <p className="text-xs text-[#94a3b8] ml-12 leading-relaxed">
              Truy cập các liên kết mail chỉ số
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
                        "w-full flex items-start gap-2 px-2 py-1.5 rounded border transition-all text-left",
                        "bg-[rgba(255,255,255,0.05)] border-white/10",
                        "hover:bg-[rgba(99,102,241,0.1)] hover:border-indigo-500/30 hover:translate-x-1",
                        activeUrl === item.url && "bg-[rgba(99,102,241,0.2)] border-indigo-500/50"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#a5b4fc] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-xs text-[#f8fafc] break-words leading-relaxed flex-1">
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
              <Mail className="h-16 w-16 text-[#a5b4fc] mx-auto mb-4 opacity-50" />
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
                <Mail className="h-4 w-4" />
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

            {/* Iframe Container */}
            <div className="flex-1 relative overflow-hidden bg-white" style={{ height: 'calc(100vh - 48px)' }}>
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Đang tải {activeTitle}...</p>
                  </div>
                </div>
              )}
              {activeUrl && (
                <iframe
                  key={activeUrl}
                  src={activeUrl}
                  className="border-none"
                  title={activeTitle}
                  allow="clipboard-read; clipboard-write; fullscreen"
                  onLoad={() => setIsLoaded(true)}
                  style={{ 
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
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
