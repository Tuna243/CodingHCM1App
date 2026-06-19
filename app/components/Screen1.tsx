'use client';

import {
  CONTENT_SETTINGS_EVENT,
  getContentSettings,
} from '@/lib/contentSettings';
import {
  BookOpen,
  CircleHelp,
  ExternalLink,
  FileSpreadsheet,
  MessageSquareWarning,
  QrCode,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const CURRICULUM_GUIDES = [
  {
    title: 'Hướng dẫn truy cập giáo trình giảng dạy',
    description: 'Xem quy trình mở và sử dụng đúng kho giáo trình dành cho giáo viên.',
    url: 'https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/huong-dan-truy-cap-giao-trinh-giang-day',
    icon: CircleHelp,
  },
  {
    title: 'Hướng dẫn phản ánh giáo trình giảng dạy',
    description: 'Gửi phản ánh khi phát hiện nội dung học liệu cần kiểm tra hoặc điều chỉnh.',
    url: 'https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/vi.-quy-trinh-van-hanh-lop-hoc/quy-trinh-mot-buoi-giang-day/huong-dan-phan-anh-giao-trinh-giang-day#quy-trinh',
    icon: MessageSquareWarning,
  },
] as const;

export default function Screen1() {
  const [curriculumUrl, setCurriculumUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const loadSettings = () => setCurriculumUrl(getContentSettings().curriculumUrl);
    loadSettings();
    window.addEventListener(CONTENT_SETTINGS_EVENT, loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener(CONTENT_SETTINGS_EVENT, loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  useEffect(() => {
    if (!curriculumUrl) return;
    QRCode.toDataURL(curriculumUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#075985', light: '#ffffff' },
    }).then(setQrCode);
  }, [curriculumUrl]);

  return (
    <div className="relative flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="text-center">
        <p className="page-eyebrow mb-2 text-sky-700">
          Coding HCM1
        </p>
        <h1 className="page-title gradient-text mb-3">
          Giáo trình Coding
        </h1>
        <p className="page-lead mx-auto max-w-2xl text-slate-600">
          Truy cập kho học liệu Coding tập trung và tạo mã QR để mở nhanh trên thiết bị lớp học.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="glass-card">
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <CardTitle className="text-slate-900">Kho học liệu Coding K12</CardTitle>
            <CardDescription className="text-slate-600">
              File tổng hợp học liệu chính thức trên Microsoft SharePoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 flex-none text-sky-700" />
                <div>
                  <p className="font-semibold text-slate-900">Giáo trình hiện hành</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Nội dung được mở trong tab mới để giữ nguyên quyền truy cập Microsoft 365.
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="h-12 w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-base text-white hover:from-sky-700 hover:to-cyan-600"
              onClick={() => window.open(curriculumUrl, '_blank', 'noopener,noreferrer')}
              disabled={!curriculumUrl}
            >
              <ExternalLink className="h-5 w-5" />
              Mở giáo trình Coding
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-slate-900">
              <QrCode className="h-5 w-5 text-sky-700" />
              QR truy cập nhanh
            </CardTitle>
            <CardDescription className="text-slate-600">
              Quét bằng điện thoại hoặc máy tính bảng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto flex aspect-square max-w-[280px] items-center justify-center rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
              {qrCode ? (
                <img src={qrCode} alt="QR giáo trình Coding" className="h-full w-full" />
              ) : (
                <QrCode className="h-16 w-16 animate-pulse text-sky-200" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mx-auto w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="section-title text-slate-900">
            Hướng dẫn sử dụng giáo trình
          </CardTitle>
          <CardDescription className="text-slate-600">
            Quy trình chính thức dành cho giáo viên Coding.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {CURRICULUM_GUIDES.map(({ title, description, url, icon: Icon }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-36 items-start gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-semibold leading-snug text-slate-900">{title}</span>
                  <ExternalLink className="mt-0.5 h-4 w-4 flex-none text-sky-600" />
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                  {description}
                </span>
              </span>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
