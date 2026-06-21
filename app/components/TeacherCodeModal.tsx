'use client';

import { UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface TeacherCodeModalProps {
  onSubmit: (teacherCode: string) => void;
}

interface Teacher {
  name: string;
  code: string;
  center: string;
}

export default function TeacherCodeModal({ onSubmit }: TeacherCodeModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teachers')
      .then((response) => response.json())
      .then((data) => setTeachers(data.teachers ?? []))
      .catch(() => setError('Không thể tải danh sách giáo viên.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi');
    if (!keyword) return teachers;
    return teachers.filter((teacher) =>
      `${teacher.name} ${teacher.code} ${teacher.center}`.toLocaleLowerCase('vi').includes(keyword),
    );
  }, [query, teachers]);

  const handleSubmit = () => {
    if (!selectedCode) {
      setError('Vui lòng chọn giáo viên trong danh sách.');
      return;
    }
    onSubmit(selectedCode);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/45 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden border-sky-100 bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <CardHeader className="shrink-0 border-b border-slate-100 p-4 text-center sm:p-6">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 sm:mb-3 sm:h-16 sm:w-16">
            <UserCheck className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <CardTitle className="gradient-text text-xl font-bold sm:text-2xl">
            Coding HCM1
          </CardTitle>
          <CardDescription className="mt-1 text-slate-600 sm:mt-2">
            Chọn thông tin tên của bạn để Leader có thể thống kê lưu lượng truy cập.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-6">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError('');
            }}
            placeholder="Tìm theo tên, mã hoặc cơ sở..."
            className="h-12 border-slate-200 bg-white text-slate-900"
            autoFocus
          />

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-500">Đang tải danh sách giáo viên...</p>
            ) : filteredTeachers.length ? (
              filteredTeachers.map((teacher) => (
                <button
                  type="button"
                  key={teacher.code}
                  onClick={() => {
                    setSelectedCode(teacher.code);
                    setError('');
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedCode === teacher.code
                      ? 'border-sky-500 bg-sky-100'
                      : 'border-transparent bg-white hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{teacher.name}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                      {teacher.code}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{teacher.center}</p>
                </button>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-slate-500">Không tìm thấy giáo viên phù hợp.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">⚠️ {error}</p>}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCode}
            className="h-12 w-full shrink-0 bg-[#1d584e] text-base text-white hover:bg-[#17483f]"
          >
            <UserCheck className="h-5 w-5" />
            Xác nhận giáo viên
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
