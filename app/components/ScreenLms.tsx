'use client';

import type {
  PersonalLmsClass,
  PersonalLmsDashboard,
  PersonalLmsTask,
} from '@/lib/lmsApi';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Eye,
  LogIn,
  LogOut,
  RefreshCw,
  School,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

type AuthState = 'checking' | 'logged_out' | 'logged_in';

const ISSUE_LABELS: Record<PersonalLmsTask['issue'], string> = {
  overdue: 'Quá hạn',
  soon: 'Sắp hạn',
  partial: 'Thiếu nhận xét học viên',
  missing: 'Chưa nhận xét',
};

function taskLabel(task: PersonalLmsTask) {
  if (task.type === 'product') return 'Thiếu nộp sản phẩm';
  return ISSUE_LABELS[task.issue];
}

function missingStudentsLabel(task: PersonalLmsTask) {
  return task.type === 'product'
    ? 'Học viên chưa nộp sản phẩm'
    : 'Học viên chưa có nhận xét';
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function taskTone(issue: PersonalLmsTask['issue']) {
  if (issue === 'overdue') return 'border-amber-400 bg-amber-50 text-amber-900';
  if (issue === 'soon') return 'border-[#ffd166] bg-[#fff8e5] text-[#6b5000]';
  if (issue === 'partial') return 'border-[#6cc3a0] bg-[#eef7f3] text-[#1d584e]';
  return 'border-[#c9ded7] bg-white text-[#1e293b]';
}

function statusLabel(status: PersonalLmsClass['status']) {
  return status === 'RUNNING' ? 'Đang học' : 'Đã kết thúc';
}

function nextTask(item: PersonalLmsClass) {
  return item.tasks[0];
}

function classDetailHash(item: PersonalLmsClass) {
  return `#lms-class-${encodeURIComponent(item.id)}`;
}

function buildTaskText(data: PersonalLmsDashboard) {
  const lines = [
    `VIỆC LMS CỦA ${data.teacher.name.toLocaleUpperCase('vi')}`,
    `Cập nhật: ${new Date(data.updatedAt).toLocaleString('vi-VN')}`,
    '',
  ];

  const classes = data.classes.filter((item) => item.tasks.length > 0);
  if (!classes.length) return `${lines.join('\n')}Không có việc LMS cần xử lý.`;

  classes.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} · ${item.center}`);
    item.tasks.forEach((task) => {
      const students = task.missingStudents.length
        ? ` · Thiếu: ${task.missingStudents.map((student) =>
            `${student.name}${student.absent ? ' (vắng)' : ''}`).join(', ')}`
        : '';
      lines.push(
        `   - B${task.session}: ${taskLabel(task)} · Hạn ${formatDateTime(task.deadline)}${students}`,
      );
    });
  });
  return lines.join('\n');
}

function ClassDetailModal({
  item,
  onClose,
}: {
  item: PersonalLmsClass | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item || !mounted || typeof document === 'undefined') return null;

  const complete = item.tasks.length === 0;

  return createPortal(
    <div
      aria-labelledby="lms-class-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-6"
      role="dialog"
    >
      <a
        href="#lms-classes"
        aria-label="Đóng chi tiết lớp"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative max-h-[88vh] w-full overflow-hidden rounded-t-3xl border border-[#c9ded7] bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#c9ded7] bg-[#f8fafc] p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a6e]">Chi tiết lớp</p>
            <h3 id="lms-class-detail-title" className="mt-1 text-xl font-bold text-[#1e293b]">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-[#3a7a6e]">
              {[item.course, item.level, item.center].filter(Boolean).join(' · ')}
            </p>
          </div>
          <a
            href="#lms-classes"
            aria-label="Đóng chi tiết lớp"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#c9ded7] bg-white p-0 text-[#1d584e] transition-colors hover:bg-[#eef7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d584e] focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </a>
        </div>

        <div className="max-h-[calc(88vh-86px)] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Trạng thái', value: statusLabel(item.status) },
              { label: 'Tiến độ nhận xét', value: `${item.reviewedSessions}/${item.completedSessions} buổi` },
              { label: 'Việc cần xử lý', value: item.tasks.length },
            ].map((entry) => (
              <div key={entry.label} className="rounded-2xl border border-[#c9ded7] bg-[#f8fafc] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a6e]">{entry.label}</p>
                <p className="mt-2 text-lg font-bold text-[#1e293b]">{entry.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            {complete ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#6cc3a0] bg-[#eef7f3] p-4 text-[#1d584e]">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-bold">Đã hoàn thành các nhận xét hiện tại</p>
                  <p className="mt-1 text-sm">Chưa có đầu việc LMS cần xử lý cho lớp này.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {item.tasks.map((task) => (
                  <div
                    key={`${item.id}-${task.session}`}
                    className={`rounded-2xl border p-4 ${taskTone(task.issue)}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">
                        Buổi {task.session} · {taskLabel(task)}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-[#b42318]">
                        <Clock3 className="h-4 w-4" />
                        Hạn {formatDateTime(task.deadline)}
                      </p>
                    </div>
                    {task.missingStudents.length > 0 && (
                      <div className="mt-3 border-t border-current/15 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {missingStudentsLabel(task)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {task.missingStudents.map((student) => (
                            <span
                              key={`${task.session}-${student.name}`}
                              className="rounded-full border border-current/20 bg-white/70 px-2.5 py-1 text-xs font-semibold"
                            >
                              {student.name}{student.absent ? ' · Vắng' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ClassesTable({
  items,
  onView,
}: {
  items: PersonalLmsClass[];
  onView: (item: PersonalLmsClass) => void;
}) {
  return (
    <div className="data-table-shell">
      <table className="app-table min-w-[66rem]">
        <thead>
          <tr>
            <th scope="col">Lớp</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Chương trình</th>
            <th scope="col">Cơ sở</th>
            <th scope="col">Tiến độ</th>
            <th scope="col">Việc cần xử lý</th>
            <th scope="col">Hạn gần nhất</th>
            <th scope="col">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const task = nextTask(item);
            return (
              <tr key={item.id}>
                <td>
                  <div className="max-w-[14rem]">
                    <p className="font-bold text-[#1e293b]">{item.name}</p>
                    <p className="mt-1 text-xs font-semibold text-[#3a7a6e]">{item.level || 'Chưa có level'}</p>
                  </div>
                </td>
                <td>
                  <span className="inline-flex rounded-full border border-[#c9ded7] bg-white px-2.5 py-1 text-xs font-bold text-[#1d584e]">
                    {statusLabel(item.status)}
                  </span>
                </td>
                <td>
                  <p className="max-w-[13rem] font-semibold">{item.course}</p>
                </td>
                <td>
                  <p className="max-w-[12rem]">{item.center || 'Chưa có cơ sở'}</p>
                </td>
                <td>
                  <span className="font-bold text-[#1d584e]">
                    {item.reviewedSessions}/{item.completedSessions}
                  </span>
                  <span className="ml-1 text-xs font-semibold text-[#3a7a6e]">buổi</span>
                </td>
                <td>
                  {item.tasks.length ? (
                    <span className="inline-flex rounded-full border border-[#ffd166] bg-[#fff8e5] px-2.5 py-1 text-xs font-bold text-[#6b5000]">
                      {item.tasks.length} việc
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-[#6cc3a0] bg-[#eef7f3] px-2.5 py-1 text-xs font-bold text-[#1d584e]">
                      Hoàn tất
                    </span>
                  )}
                </td>
                <td>
                  {task ? (
                    <div>
                      <p className="font-bold text-[#b42318]">{formatDateTime(task.deadline)}</p>
                      <p className="mt-1 text-xs font-semibold text-[#3a7a6e]">
                        B{task.session} · {taskLabel(task)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-[#3a7a6e]">Không có</span>
                  )}
                </td>
              <td>
                <a
                  href={classDetailHash(item)}
                  onClick={() => onView(item)}
                  aria-label={`Xem chi tiết lớp ${item.name}`}
                  title="Xem chi tiết lớp"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#c9ded7] bg-white text-[#1d584e] transition-colors hover:bg-[#eef7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d584e] focus-visible:ring-offset-2"
                >
                  <Eye className="h-4 w-4" />
                </a>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default function ScreenLms() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [data, setData] = useState<PersonalLmsDashboard | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedClass, setSelectedClass] = useState<PersonalLmsClass | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/lms/dashboard', { cache: 'no-store' });
      if (response.status === 401) {
        setAuthState('logged_out');
        setData(null);
        return;
      }
      const result = (await response.json()) as PersonalLmsDashboard & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Không thể tải dữ liệu LMS.');
      setData(result);
      setAuthState('logged_in');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu LMS.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/lms/me', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          setAuthState('logged_out');
          return;
        }
        setAuthState('logged_in');
        void loadDashboard();
      })
      .catch(() => setAuthState('logged_out'));
  }, [loadDashboard]);

  const login = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu LMS.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/lms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Đăng nhập không thành công.');
      setPassword('');
      setAuthState('logged_in');
      await loadDashboard();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/lms/logout', { method: 'POST' });
    setData(null);
    setSelectedClass(null);
    setAuthState('logged_out');
  };

  const copyTasks = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(buildTaskText(data));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const actionClasses = useMemo(
    () => data?.classes.filter((item) => item.tasks.length > 0) ?? [],
    [data],
  );
  const closeClassDetail = useCallback(() => {
    setSelectedClass(null);
    if (typeof window === 'undefined' || !window.location.hash.startsWith('#lms-class-')) return;
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  useEffect(() => {
    if (!data) return;

    const openClassFromHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#lms-class-')) {
        setSelectedClass(null);
        return;
      }
      const found = data.classes.find((item) => classDetailHash(item) === hash);
      if (found) setSelectedClass(found);
    };

    openClassFromHash();
    window.addEventListener('hashchange', openClassFromHash);
    return () => window.removeEventListener('hashchange', openClassFromHash);
  }, [data]);

  if (authState === 'checking') {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center text-[#3a7a6e]">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3 text-sm font-semibold">Đang kiểm tra phiên LMS...</p>
        </div>
      </div>
    );
  }

  if (authState === 'logged_out') {
    return (
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="page-eyebrow text-[#3a7a6e]">Cá nhân hóa theo tài khoản LMS</p>
          <h1 className="page-title gradient-text mt-2">Lớp của tôi</h1>
          <p className="page-lead mt-3 max-w-3xl text-slate-600">
            Xem riêng các lớp bạn phụ trách, các buổi còn thiếu nhận xét và thời hạn cần xử lý.
          </p>
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-[#c9ded7] bg-white shadow-sm">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d584e] text-white">
                <LogIn className="h-6 w-6" />
              </div>
              <CardTitle className="section-title mt-3 text-[#1e293b]">
                Đăng nhập LMS MindX
              </CardTitle>
              <p className="text-sm text-[#3a7a6e]">
                Sử dụng tài khoản LMS của chính bạn. Ứng dụng không lưu mật khẩu.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block">
                <span className="label-text text-[#1e293b]">Email LMS</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void login();
                  }}
                  autoComplete="username"
                  placeholder="email@mindx.net.vn"
                  className="mt-2 h-12"
                />
              </label>
              <label className="block">
                <span className="label-text text-[#1e293b]">Mật khẩu</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void login();
                  }}
                  autoComplete="current-password"
                  className="mt-2 h-12"
                />
              </label>
              {error && (
                <p className="rounded-xl border border-[#ffd166] bg-[#fff8e5] p-3 text-sm font-semibold text-[#6b5000]">
                  {error}
                </p>
              )}
              <Button
                type="button"
                onClick={() => void login()}
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#1d584e] text-base text-white hover:bg-[#17483f]"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <LogIn />}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập và xem lớp'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[
              {
                icon: UserRound,
                title: 'Chỉ dữ liệu của bạn',
                text: 'Server nhận diện tài khoản LMS và loại bỏ mọi lớp không có bạn trong danh sách giáo viên.',
              },
              {
                icon: Clock3,
                title: 'Ưu tiên đúng hạn',
                text: 'Buổi 1–4, 6–8 và 10–13 có hạn 24 giờ; buổi 5, 9 và 14 có hạn 48 giờ. Học viên vắng không cần nhận xét.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#c9ded7] bg-white p-4 shadow-sm">
                <item.icon className="h-5 w-5 text-[#1d584e]" />
                <p className="mt-3 font-bold text-[#1e293b]">{item.title}</p>
                <p className="mt-1 text-sm text-[#3a7a6e]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-eyebrow text-[#3a7a6e]">Dashboard cá nhân</p>
          <h1 className="page-title gradient-text mt-2">
            {data ? `Lớp của ${data.teacher.name}` : 'Lớp của tôi'}
          </h1>
          <p className="page-lead mt-3 max-w-3xl text-slate-600">
            Các lớp đang học và lớp vừa kết thúc trong 30 ngày, sắp theo đầu việc cần xử lý trước.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyTasks()}
            disabled={!data}
            className="min-h-11 border-[#c9ded7] text-[#1d584e]"
          >
            {copied ? <CheckCircle2 /> : <ClipboardCopy />}
            {copied ? 'Đã copy' : 'Copy việc cần làm'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="min-h-11 border-[#c9ded7] text-[#1d584e]"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Làm mới
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void logout()}
            className="min-h-11 border-[#c9ded7] text-[#1d584e]"
          >
            <LogOut />
            Đăng xuất LMS
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[#ffd166] bg-[#fff8e5] p-4 text-sm font-semibold text-[#6b5000]">
          {error}
        </div>
      )}

      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {[
              { icon: School, label: 'Lớp của tôi', value: data.summary.totalClasses },
              { icon: AlertTriangle, label: 'Lớp cần xử lý', value: data.summary.classesNeedAction },
              { icon: Clock3, label: 'Việc quá hạn', value: data.summary.overdueTasks },
              { icon: RefreshCw, label: 'Sắp hạn 24 giờ', value: data.summary.soonTasks },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#c9ded7] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
                <item.icon className="h-4 w-4 text-[#1d584e] sm:h-5 sm:w-5" />
                <p className="mt-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wider text-[#3a7a6e] sm:mt-3 sm:min-h-0">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold leading-none text-[#1e293b] sm:text-3xl">{item.value}</p>
              </div>
            ))}
          </section>

          {data.classes.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-[#c9ded7] bg-white p-8 text-center shadow-sm">
              <School className="mx-auto h-10 w-10 text-[#1d584e]" />
              <h2 className="section-title mt-4 text-[#1e293b]">Chưa tìm thấy lớp của bạn</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#3a7a6e]">
                LMS chưa trả về lớp đang học hoặc lớp vừa kết thúc có tài khoản của bạn trong danh sách giáo viên.
              </p>
            </section>
          ) : (
            <section id="lms-classes" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="section-title text-[#1e293b]">Ưu tiên xử lý</h2>
                  <p className="mt-1 text-sm text-[#3a7a6e]">
                    {actionClasses.length
                      ? `${actionClasses.length} lớp đang có đầu việc.`
                      : 'Tất cả lớp hiện đã hoàn thành nhận xét.'}
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#3a7a6e]">
                  Cập nhật {new Date(data.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <ClassesTable items={data.classes} onView={setSelectedClass} />
            </section>
          )}
          <ClassDetailModal item={selectedClass} onClose={closeClassDetail} />
        </>
      )}
    </div>
  );
}
