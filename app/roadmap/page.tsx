'use client';

/**
 * Public roadmap page — accessible at /roadmap
 * Có sidebar đầy đủ, share được link cho mentor mới
 */

import Screen11 from '@/app/components/Screen11';
import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    function handleScreenChange(screen: string) {
        if (screen === 'screen11') return;
        router.push(`/?screen=${screen}`);
    }

    return (
        <div className="flex min-h-screen bg-[var(--palette-background)] text-[var(--palette-text)]">
            {/* Sidebar — desktop only (mobile dùng bottom nav trong component) */}
            <Sidebar
                activeScreen="screen11"
                onScreenChange={handleScreenChange}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(p => !p)}
            />

            {/* Main content — đẩy sang phải trên desktop, full width trên mobile */}
            <main className={cn(
                "flex-1 min-w-0 min-h-screen relative transition-all duration-300",
                isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
            )}>
                {/* pb-20 để tránh bị bottom nav che trên mobile */}
                <div className="p-4 md:p-8 pb-20 md:pb-8 h-full">
                    <Screen11 onNavigate={handleScreenChange} />
                </div>
            </main>
        </div>
    );
}
