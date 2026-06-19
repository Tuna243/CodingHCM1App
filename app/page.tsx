/**
 * Coding HCM1 teaching support app
 */

'use client';

import { getTeacherCode, setTeacherCode } from '@/lib/appscript';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import FeedbackButton from './components/FeedbackButton';
import Screen1 from './components/Screen1';
import Screen11 from './components/Screen11';
import Screen2 from './components/Screen2';
import Screen4 from './components/Screen4';
import Screen6 from './components/Screen6';
import Sidebar from './components/Sidebar';
import StatisticsButton from './components/StatisticsButton';
import TeacherCodeModal from './components/TeacherCodeModal';
import { usePageTracking } from './hooks/usePageTracking';

// Keyboard mapping - định nghĩa ngoài component để không tạo lại mỗi render
const KEY_TO_SCREEN: Record<string, string> = {
  '1': 'screen1',
  '2': 'screen2',
  '3': 'screen4',
  '4': 'screen6',
};

// Screens cần full height
const FULLSCREEN_SCREENS = ['screen6'];

// Style cho screen ẩn - dùng visibility để browser skip rendering
const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  contentVisibility: 'hidden',
  contain: 'layout style paint',
};

// Style cho screen hiện
const visibleStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  visibility: 'visible',
  transform: 'translateZ(0)', // Force GPU layer
  contain: 'layout style paint',
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('screen1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [loadedScreens, setLoadedScreens] = useState<Set<string>>(() => new Set(['screen1']));

  // Đọc ?screen= query param khi navigate từ /roadmap về
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (screen) {
      setActiveScreen(screen);
      setLoadedScreens(prev => {
        const next = new Set(prev);
        next.add(screen);
        return next;
      });
      // Xoá query param khỏi URL mà không reload
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Check if teacher code exists
  useEffect(() => {
    const teacherCode = getTeacherCode();
    console.log('🔍 Checking teacher code:', teacherCode);
    if (!teacherCode) {
      setShowTeacherModal(true);
    }
  }, []);

  // Handle teacher code submission
  const handleTeacherCodeSubmit = (code: string) => {
    console.log('✅ Setting teacher code:', code);
    setTeacherCode(code);
    setShowTeacherModal(false);
    // Trigger a re-render to start tracking with new teacher code
    // Force screen to re-track by changing state
    const currentScreen = activeScreen;
    setActiveScreen('');
    setTimeout(() => setActiveScreen(currentScreen), 0);
  };

  // Track page views
  usePageTracking(activeScreen);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleScreenChange = useCallback((screen: string) => {
    setActiveScreen(screen);
    setLoadedScreens(prev => {
      if (prev.has(screen)) return prev;
      const next = new Set(prev);
      next.add(screen);
      return next;
    });
  }, []);

  // Keyboard shortcuts - optimized
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      const screen = KEY_TO_SCREEN[event.key];
      if (screen) handleScreenChange(screen);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleScreenChange]);

  // Memoize container class
  const isFullscreen = FULLSCREEN_SCREENS.includes(activeScreen);

  return (
    <>
      {/* Teacher Code Modal */}
      {showTeacherModal && (
        <TeacherCodeModal onSubmit={handleTeacherCodeSubmit} />
      )}

      <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <Sidebar
          activeScreen={activeScreen}
          onScreenChange={handleScreenChange}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <main
          className={cn(
            "flex-1 min-w-0 min-h-screen relative",
            isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
          )}
          style={{ transition: 'margin-left 0.15s ease-out' }}
        >
          <div className={cn("relative h-full pb-16 md:pb-0", isFullscreen ? "p-0 h-screen" : "p-4 md:p-8")}>
            {/* Screen 1 */}
            {loadedScreens.has('screen1') && (
              <div style={activeScreen === 'screen1' ? visibleStyle : hiddenStyle}>
                <Screen1 />
              </div>
            )}

            {/* Screen 2 */}
            {loadedScreens.has('screen2') && (
              <div style={activeScreen === 'screen2' ? visibleStyle : hiddenStyle}>
                <Screen2 />
              </div>
            )}

            {/* Screen 4 */}
            {loadedScreens.has('screen4') && (
              <div style={activeScreen === 'screen4' ? visibleStyle : hiddenStyle}>
                <Screen4 />
              </div>
            )}

            {/* Screen 6 */}
            {loadedScreens.has('screen6') && (
              <div style={activeScreen === 'screen6' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen6 />
              </div>
            )}

            {/* Screen 11 - Lộ trình ứng viên */}
            {loadedScreens.has('screen11') && (
              <div style={activeScreen === 'screen11' ? visibleStyle : hiddenStyle}>
                <Screen11 onNavigate={handleScreenChange} />
              </div>
            )}
          </div>

          {/* Action Buttons - Always visible */}
          <StatisticsButton />
          <FeedbackButton currentScreen={activeScreen} />
        </main>
      </div>
    </>
  );
}
