'use client';

import {
  CONTENT_SETTINGS_EVENT,
  getContentSettings,
} from '@/lib/contentSettings';
import { ExternalLink, MessageSquareText, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function Screen4() {
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    const loadSettings = () => setDocumentUrl(getContentSettings().zaloCommentsUrl);
    loadSettings();
    window.addEventListener(CONTENT_SETTINGS_EVENT, loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener(CONTENT_SETTINGS_EVENT, loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="text-center">
        <p className="page-eyebrow mb-2 text-sky-700">
          Tài liệu giáo viên
        </p>
        <h1 className="page-title gradient-text mb-3">
          Nhận xét Zalo
        </h1>
        <p className="page-lead text-slate-600">
          Mẫu và hướng dẫn gửi nhận xét học tập tới phụ huynh.
        </p>
      </div>

      <Card className="glass-card mx-auto w-full max-w-4xl">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <MessageSquareText className="h-6 w-6" />
          </div>
          <CardTitle className="text-slate-900">Kho mẫu nhận xét Coding</CardTitle>
        </CardHeader>
        <CardContent>
          {documentUrl ? (
            <div className="space-y-4">
              <Button
                className="h-12 w-full bg-gradient-to-r from-cyan-600 to-sky-600 text-white hover:from-cyan-700 hover:to-sky-700"
                onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-5 w-5" />
                Mở tài liệu nhận xét Zalo
              </Button>
              <p className="break-all rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                {documentUrl}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-8 text-center">
              <Settings className="mx-auto mb-3 h-9 w-9 text-sky-500" />
              <p className="font-semibold text-slate-900">Tài liệu đang chờ cập nhật</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
