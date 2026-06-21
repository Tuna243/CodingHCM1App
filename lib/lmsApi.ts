import type { LmsSessionData } from '@/lib/lmsSession';
import { createHash } from 'crypto';

const LMS_API_URL = 'https://lms-api.mindx.edu.vn/graphql';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY?.trim() ?? '';
const CHECKPOINT_SESSIONS = new Set([5, 9, 14]);
const PRODUCT_SESSIONS = new Set([13, 14]);
const ABSENT_STATUSES = new Set(['ABSENT', 'ABSENT_WITH_NOTICE']);

interface FirebaseLoginResult {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  displayName?: string;
}

interface LmsTeacher {
  id: string;
  fullName?: string;
  email?: string;
}

interface LmsStudent {
  _id: string;
  activeInClass: boolean;
  student?: {
    id: string;
    fullName?: string;
  };
}

interface LmsAttendance {
  _id?: string;
  status?: string;
  comment?: string | null;
  sendCommentStatus?: string | null;
  commentByAreas?: Array<{
    content?: string | null;
    grade?: number | null;
    checkpoint?: {
      checkpointScore?: number | null;
      practiceScore?: number | null;
    } | null;
  }> | null;
  commentStatus?: {
    feedback?: string | null;
    status?: string | null;
  } | null;
  student?: {
    id: string;
  } | null;
}

interface LmsSlot {
  _id: string;
  index?: number;
  endTime?: string;
  summary?: string | null;
  studentAttendance?: LmsAttendance[];
}

interface LmsClass {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  level?: string;
  course?: { name?: string };
  centre?: { name?: string };
  teachers?: Array<{ teacher?: LmsTeacher }>;
  students?: LmsStudent[];
  slots?: LmsSlot[];
}

interface LmsStudentWork {
  id: string;
  status?: string | null;
  studentId?: string | null;
  classSessionId?: string | null;
  classSessionNumber?: number | null;
  classId?: string | null;
  deletedAt?: string | null;
  isDeleted?: string | boolean | null;
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

export interface PersonalLmsTask {
  type: 'comment' | 'product';
  session: number;
  deadline: string;
  issue: 'overdue' | 'soon' | 'missing' | 'partial';
  missingStudents: Array<{
    name: string;
    absent: boolean;
  }>;
}

export interface PersonalLmsClass {
  id: string;
  name: string;
  status: string;
  course: string;
  center: string;
  level: string;
  startDate: string;
  endDate: string;
  completedSessions: number;
  reviewedSessions: number;
  tasks: PersonalLmsTask[];
}

export interface PersonalLmsDashboard {
  teacher: {
    id: string;
    name: string;
  };
  classes: PersonalLmsClass[];
  summary: {
    totalClasses: number;
    classesNeedAction: number;
    overdueTasks: number;
    soonTasks: number;
  };
  updatedAt: string;
}

export function hashTeacherEmail(email: string) {
  return createHash('sha256').update(email.trim().toLocaleLowerCase('en')).digest('hex');
}

function emailLocalPart(value: string) {
  return value.trim().toLocaleLowerCase('en').split('@')[0] || '';
}

export function hashTeacherEmailLocalPart(email: string) {
  return createHash('sha256').update(emailLocalPart(email)).digest('hex');
}

function readEmailFromFirebaseToken(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      email?: string;
    };
    return decoded.email?.trim() ?? '';
  } catch {
    return '';
  }
}

function requireFirebaseApiKey() {
  if (!FIREBASE_API_KEY) {
    throw new Error('FIREBASE_API_KEY chưa được cấu hình.');
  }
  return FIREBASE_API_KEY;
}

async function graphQl<T>(
  query: string,
  token: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(LMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => '');
        let detail = '';
        try {
          const parsed = JSON.parse(responseText) as {
            errors?: Array<{ message?: string }>;
            message?: string;
          };
          detail = parsed.errors?.[0]?.message || parsed.message || '';
        } catch {
          detail = responseText.slice(0, 240);
        }
        console.error('[LMS GraphQL]', response.status, detail || 'Không có nội dung lỗi.');
        throw new Error(isLmsNotFoundMessage(detail) ? 'LMS_NOT_FOUND' : 'LMS_UPSTREAM_ERROR');
      }

      const result = (await response.json()) as GraphQlResponse<T>;
      if (result.errors?.length) {
        const detail = result.errors[0]?.message || '';
        console.error('[LMS GraphQL]', detail || 'LMS không thể xử lý yêu cầu.');
        throw new Error(isLmsNotFoundMessage(detail) ? 'LMS_NOT_FOUND' : 'LMS_UPSTREAM_ERROR');
      }
      if (!result.data) throw new Error('LMS không trả về dữ liệu.');
      return result.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Không thể kết nối LMS.');
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
      }
    }
  }

  throw lastError ?? new Error('Không thể kết nối LMS.');
}

function isLmsNotFoundError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return isLmsNotFoundMessage(message);
}

function isLmsNotFoundMessage(message: string) {
  return /\bNOT_FOUND\b/i.test(message) || /\bnot found\b/i.test(message);
}

export async function firebaseLogin(email: string, password: string) {
  const apiKey = requireFirebaseApiKey();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return { ok: false as const, error: 'Email hoặc mật khẩu LMS không đúng.' };
  }

  const data = (await response.json()) as FirebaseLoginResult;
  const expiresIn = Number.parseInt(data.expiresIn || '3600', 10);
  return {
    ok: true as const,
    token: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
    teacherId: data.localId,
    teacherName: data.displayName?.trim() || email.split('@')[0] || 'Giáo viên',
  };
}

async function firebaseRefresh(refreshToken: string) {
  const apiKey = requireFirebaseApiKey();
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
    },
  );

  if (!response.ok) return null;
  const data = (await response.json()) as {
    id_token: string;
    refresh_token?: string;
    expires_in?: string;
  };
  const expiresIn = Number.parseInt(data.expires_in || '3600', 10);
  return {
    token: data.id_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
  };
}

export async function getValidLmsToken(session: LmsSessionData) {
  if (!session.token) return null;
  if (session.expiresAt && Date.now() < session.expiresAt) return session.token;
  if (!session.refreshToken) return null;

  const refreshed = await firebaseRefresh(session.refreshToken);
  if (!refreshed) return null;
  Object.assign(session, refreshed);
  return refreshed.token;
}

export async function getCurrentLmsTeacher(token: string) {
  const data = await graphQl<{
    me?: { id: string; fullName?: string };
  }>(`{ me { id fullName } }`, token);

  if (!data.me?.id) throw new Error('Không xác định được giáo viên từ tài khoản LMS.');
  return {
    id: data.me.id,
    name: data.me.fullName?.trim() || 'Giáo viên',
  };
}

function stripHtml(value?: string | null) {
  return (value ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasMeaningfulText(value?: string | null) {
  const text = stripHtml(value);
  return Boolean(text && !/^[.,;:!?…\-–—/\\|*_=+~`'"]+$/.test(text));
}

function hasStudentComment(attendance?: LmsAttendance) {
  if (!attendance) return false;
  const sendStatus = attendance.sendCommentStatus?.toUpperCase();
  const reviewStatus = attendance.commentStatus?.status?.toUpperCase();
  const completedStatuses = new Set([
    'SENT',
    'SUBMITTED',
    'WAITING_FOR_APPROVAL',
    'PENDING_APPROVAL',
    'APPROVED',
    'PUBLISHED',
    'COMPLETED',
  ]);

  return Boolean(
    (sendStatus && completedStatuses.has(sendStatus)) ||
      (reviewStatus && completedStatuses.has(reviewStatus)) ||
      hasMeaningfulText(attendance.comment) ||
      hasMeaningfulText(attendance.commentStatus?.feedback) ||
      attendance.commentByAreas?.some(
        (area) =>
          hasMeaningfulText(area.content) ||
          area.grade != null ||
          area.checkpoint?.checkpointScore != null ||
          area.checkpoint?.practiceScore != null,
      ),
  );
}

function hasSubmittedProduct(work?: LmsStudentWork) {
  if (!work) return false;
  const status = work.status?.toUpperCase();
  const deleted = work.deletedAt || work.isDeleted === true || work.isDeleted === 'true';
  if (deleted || status === 'REJECTED' || status === 'DELETED') return false;
  return Boolean(status && status !== 'DRAFT');
}

function attendanceForStudent(
  enrollment: LmsStudent,
  attendances: LmsAttendance[],
) {
  return attendances.find(
    (attendance) =>
      attendance._id === enrollment._id ||
      attendance.student?.id === enrollment.student?.id,
  );
}

function workForStudent(enrollment: LmsStudent, works: LmsStudentWork[]) {
  return works.find(
    (work) =>
      (work.studentId === enrollment.student?.id || work.studentId === enrollment._id) &&
      hasSubmittedProduct(work),
  );
}

function reviewDeadline(endTime: string, session: number) {
  const hours = CHECKPOINT_SESSIONS.has(session) ? 48 : 24;
  return new Date(new Date(endTime).getTime() + hours * 60 * 60 * 1000);
}

function taskIssue(
  deadline: Date,
  now: number,
  partial: boolean,
): PersonalLmsTask['issue'] {
  const remaining = deadline.getTime() - now;
  if (partial) return 'partial';
  if (remaining <= 0) return 'overdue';
  if (remaining <= 24 * 60 * 60 * 1000) return 'soon';
  return 'missing';
}

function classToPersonalView(
  item: LmsClass,
  now: number,
  productWorks: Map<string, LmsStudentWork[]>,
): PersonalLmsClass {
  const activeStudents = (item.students ?? []).filter((student) => student.activeInClass);
  const uniqueSlots = Array.from(
    new Map((item.slots ?? []).map((slot) => [slot._id, slot])).values(),
  ).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  let completedSessions = 0;
  let reviewedSessions = 0;
  const tasks: PersonalLmsTask[] = [];

  for (const slot of uniqueSlots) {
    if (!slot.endTime || new Date(slot.endTime).getTime() >= now) continue;
    completedSessions += 1;
    const session = (slot.index ?? 0) + 1;
    const attendances = slot.studentAttendance ?? [];
    const missingStudents = CHECKPOINT_SESSIONS.has(session)
      ? activeStudents.flatMap((student) => {
          const attendance = attendanceForStudent(student, attendances);
          const absent = ABSENT_STATUSES.has(attendance?.status?.toUpperCase() ?? '');
          if (absent) return [];
          if (hasStudentComment(attendance)) return [];
          return [{
            name: student.student?.fullName?.trim() || `Học viên ${student._id.slice(-4)}`,
            absent: false,
          }];
        })
      : [];

    const commentComplete = CHECKPOINT_SESSIONS.has(session)
      ? missingStudents.length === 0
      : hasMeaningfulText(slot.summary);

    if (commentComplete) {
      reviewedSessions += 1;
    } else {
      const deadline = reviewDeadline(slot.endTime, session);
      const issue = taskIssue(
        deadline,
        now,
        missingStudents.length > 0 && hasMeaningfulText(slot.summary),
      );

      tasks.push({
        type: 'comment',
        session,
        deadline: deadline.toISOString(),
        issue,
        missingStudents,
      });
    }

    if (PRODUCT_SESSIONS.has(session)) {
      const works = [
        ...(slot._id ? productWorks.get(`${item.id}:slot:${slot._id}`) ?? [] : []),
        ...(productWorks.get(`${item.id}:session:${session}`) ?? []),
      ];
      const productMissingStudents = activeStudents.flatMap((student) => {
        const attendance = attendanceForStudent(student, attendances);
        const absent = ABSENT_STATUSES.has(attendance?.status?.toUpperCase() ?? '');
        if (absent || workForStudent(student, works)) return [];
        return [{
          name: student.student?.fullName?.trim() || `Học viên ${student._id.slice(-4)}`,
          absent: false,
        }];
      });

      if (productMissingStudents.length > 0) {
        const deadline = reviewDeadline(slot.endTime, session);
        tasks.push({
          type: 'product',
          session,
          deadline: deadline.toISOString(),
          issue: taskIssue(deadline, now, false),
          missingStudents: productMissingStudents,
        });
      }
    }
  }

  tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return {
    id: item.id,
    name: item.name,
    status: item.status,
    course: item.course?.name?.trim() || 'Coding',
    center: item.centre?.name?.trim() || '',
    level: item.level?.trim() || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    completedSessions,
    reviewedSessions,
    tasks,
  };
}

async function fetchStudentWorksByClassIds(token: string, classIds: string[]) {
  if (!classIds.length) return new Map<string, LmsStudentWork[]>();

  try {
    const data = await graphQl<{
      findAllStudentWorks?: { data?: LmsStudentWork[] };
    }>(`query ($classIds: [String!]) {
      findAllStudentWorks(payload: { classId_in: $classIds }) {
        data {
          id
          status
          studentId
          classSessionId
          classSessionNumber
          classId
          deletedAt
          isDeleted
        }
      }
    }`, token, { classIds });

    const works = data.findAllStudentWorks?.data ?? [];
    const bySession = new Map<string, LmsStudentWork[]>();
    for (const work of works) {
      if (!work.classId) continue;
      const keys = [
        work.classSessionId ? `${work.classId}:slot:${work.classSessionId}` : '',
        work.classSessionNumber ? `${work.classId}:session:${work.classSessionNumber}` : '',
      ].filter(Boolean);
      for (const key of keys) {
        const current = bySession.get(key) ?? [];
        current.push(work);
        bySession.set(key, current);
      }
    }
    return bySession;
  } catch (error) {
    console.warn('[LMS] Không tải được dữ liệu sản phẩm học viên.', error);
    return new Map<string, LmsStudentWork[]>();
  }
}

async function fetchClassesByStatus(token: string, status: 'RUNNING' | 'CLOSED') {
  try {
    const data = await graphQl<{
      classes?: { data?: LmsClass[] };
    }>(`{
      classes(payload: { pageIndex: 0, itemsPerPage: 200, status_equals: "${status}" }) {
        data {
          id name status startDate endDate level
          course { name }
          centre { name }
          teachers { teacher { id fullName email } }
          students { _id activeInClass student { id fullName } }
          slots {
            _id index endTime summary
            studentAttendance {
              _id status comment sendCommentStatus
              commentByAreas {
                content grade
                checkpoint { checkpointScore practiceScore }
              }
              commentStatus { feedback status }
              student { id }
            }
          }
        }
      }
    }`, token);

    return data.classes?.data ?? [];
  } catch (error) {
    if (isLmsNotFoundError(error)) {
      console.warn(`[LMS] Không tìm thấy dữ liệu lớp ${status}; tiếp tục với danh sách rỗng.`);
      return [];
    }
    throw error;
  }
}

export async function getPersonalLmsDashboard(
  token: string,
  teacher: { id: string; name: string; emailHash?: string },
): Promise<PersonalLmsDashboard> {
  const [running, closed] = await Promise.all([
    fetchClassesByStatus(token, 'RUNNING'),
    fetchClassesByStatus(token, 'CLOSED'),
  ]);
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  const tokenEmail = readEmailFromFirebaseToken(token);
  const tokenEmailLocalHash = tokenEmail
    ? hashTeacherEmailLocalPart(tokenEmail)
    : '';
  const teacherMatches = (candidate?: LmsTeacher) =>
    Boolean(
      candidate &&
      (
        candidate.id === teacher.id ||
        (
          teacher.emailHash &&
          candidate.email &&
          hashTeacherEmail(candidate.email) === teacher.emailHash
        ) ||
        (
          tokenEmailLocalHash &&
          candidate.email &&
          hashTeacherEmailLocalPart(candidate.email) === tokenEmailLocalHash
        )
      ),
    );
  const matchedTeacher = [...running, ...closed]
    .flatMap((item) => item.teachers ?? [])
    .map((entry) => entry.teacher)
    .find(teacherMatches);
  const resolvedTeacher = {
    id: matchedTeacher?.id || teacher.id,
    name: matchedTeacher?.fullName?.trim() || teacher.name,
  };
  const rawPersonalClasses = [...running, ...closed]
    .filter((item) =>
      item.teachers?.some((entry) => teacherMatches(entry.teacher)),
    )
    .filter((item) =>
      item.status !== 'CLOSED' ||
      (item.endDate && new Date(item.endDate).getTime() >= recentCutoff),
    )
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  const productWorks = await fetchStudentWorksByClassIds(
    token,
    rawPersonalClasses.map((item) => item.id),
  );
  const personalClasses = rawPersonalClasses
    .map((item) => classToPersonalView(item, Date.now(), productWorks))
    .sort((a, b) => {
      const aUrgent = a.tasks[0] ? new Date(a.tasks[0].deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bUrgent = b.tasks[0] ? new Date(b.tasks[0].deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aUrgent - bUrgent || a.name.localeCompare(b.name, 'vi');
    });

  const allTasks = personalClasses.flatMap((item) => item.tasks);
  return {
    teacher: resolvedTeacher,
    classes: personalClasses,
    summary: {
      totalClasses: personalClasses.length,
      classesNeedAction: personalClasses.filter((item) => item.tasks.length > 0).length,
      overdueTasks: allTasks.filter((task) => task.issue === 'overdue').length,
      soonTasks: allTasks.filter((task) => task.issue === 'soon').length,
    },
    updatedAt: new Date().toISOString(),
  };
}
