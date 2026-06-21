'use client';

import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    ClipboardCheck,
    DollarSign,
    ExternalLink, FileText,
    PlayCircle,
    Star,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

// ─── NavBtn — nút điều hướng tới màn hình khác trong app ────────────────────
function NavBtn({ screen, label, onNavigate }: { screen: string; label: string; onNavigate?: (s: string) => void }) {
    if (!onNavigate) return null;
    return (
        <button onClick={() => onNavigate(screen)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100">
            <PlayCircle className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}

// ─── Resource Card (Link dạng card) ──────────────────────────────────────────
type RC = { href: string; icon: LucideIcon; label: string; desc?: string; color?: string };
function ResourceCard({ href, icon: Icon, label, desc, color = 'blue' }: RC) {
    const colors: Record<string, string> = {
        blue: 'bg-sky-50 border-sky-200 text-sky-800 hover:border-sky-300 hover:bg-sky-100',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100',
        amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-300 hover:bg-amber-100',
        violet: 'bg-violet-50 border-violet-200 text-violet-800 hover:border-violet-300 hover:bg-violet-100',
        slate: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100',
    };
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className={`flex items-start gap-3 rounded-xl border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}>
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                {desc && <p className="text-xs opacity-70 mt-0.5 leading-relaxed">{desc}</p>}
            </div>
            <ExternalLink className="w-3 h-3 ml-auto mt-0.5 flex-shrink-0 opacity-50" />
        </a>
    );
}

// ─── Callout ─────────────────────────────────────────────────────────────────
function Callout({ icon, text, color = 'amber' }: { icon: string; text: string; color?: string }) {
    const c: Record<string, string> = {
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
        blue: 'bg-sky-50 border-sky-200 text-sky-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    };
    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${c[color]}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="text-sm leading-relaxed">{text}</p>
        </div>
    );
}

// ─── Step Item ───────────────────────────────────────────────────────────────
function Step({ n, title, children, last = false }: { n: number; title: string; children: React.ReactNode; last?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 text-sm font-bold text-white shadow-md">{n}</div>
                {!last && <div className="my-1 w-px flex-1 bg-sky-200" />}
            </div>
            <div className="min-w-0 flex-1 pb-7">
                <p className="mb-3 text-lg font-bold leading-tight text-slate-900">{title}</p>
                <div className="space-y-3 rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-sm md:p-5">{children}</div>
            </div>
        </div>
    );
}

// ─── Checklist ───────────────────────────────────────────────────────────────
function Check({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2">
            {items.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    );
}

// ─── Collapsible Rubric Table — responsive ────────────────────────────────────
type RubricRow = { criterion: string; s5: string; s4: string; s3: string; s2: string; s1: string };
const SCORE_META = [
    { key: 's5', label: '5⭑', cls: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 's4', label: '4⭑', cls: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { key: 's3', label: '3⭑', cls: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { key: 's2', label: '2⭑', cls: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { key: 's1', label: '1⭑', cls: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
] as const;

function RubricTable({ groupLabel, color, rows }: { groupLabel: string; color: string; rows: RubricRow[] }) {
    const [open, setOpen] = useState(false);
    const labelCls: Record<string, string> = {
        indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400',
    };
    return (
        <div className="overflow-hidden rounded-xl border border-sky-200 bg-white">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-sky-50">
                <span className={`text-xs font-bold uppercase tracking-wider ${labelCls[color] ?? 'text-slate-400'}`}>{groupLabel}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                    {rows.length} tiêu chí
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
            </button>
            {open && (
                <>
                    {/* Mobile: card per criterion */}
                    <div className="md:hidden divide-y divide-white/5 border-t border-white/10">
                        {rows.map((r, i) => (
                            <div key={i} className="p-3 space-y-1.5">
                                <p className="text-white text-sm font-semibold mb-2">{r.criterion}</p>
                                {SCORE_META.map(({ key, label, cls, bg }) => (
                                    <div key={key} className={`flex gap-2.5 rounded-lg border px-2.5 py-1.5 ${bg}`}>
                                        <span className={`text-xs font-bold flex-shrink-0 w-6 ${cls}`}>{label}</span>
                                        <span className="text-xs text-slate-300 leading-relaxed">{r[key]}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="data-table-shell hidden md:block">
                        <table className="app-table rubric-table">
                            <thead>
                                <tr>
                                    <th className="w-1/4">Tiêu chí</th>
                                    {SCORE_META.map(({ label, cls }) => (
                                        <th key={label} className={`text-center ${cls}`}>{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i}>
                                        <td className="font-semibold text-slate-900">{r.criterion}</td>
                                        {SCORE_META.map(({ key }) => (
                                            <td key={key}>{r[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Rubric Data ─────────────────────────────────────────────────────────────
const RUBRIC_10: RubricRow[] = [
    { criterion: 'Tác phong sư phạm', s5: 'Chuẩn mực, tự tin, ngôn ngữ cơ thể linh hoạt, truyền cảm hứng', s4: 'Chỉn chu, phong thái tự tin, truyền đạt rõ ràng', s3: 'Nghiêm túc nhưng đôi lúc còn lúng túng trong thể hiện', s2: 'Tác phong chưa ổn định, thiếu sự lưu loát', s1: 'Thiếu chỉn chu, biểu hiện thiếu tự tin khi đứng lớp' },
    { criterion: 'Phát triển chuyên môn', s5: 'Nắm vững chuẩn đầu ra lộ trình, khai thác sâu kiến thức cốt lõi', s4: 'Nắm chắc chuẩn đầu ra, linh hoạt điều chỉnh kịch bản phù hợp', s3: 'Hiểu kiến thức nền tảng, giải đáp được thắc mắc cơ bản', s2: 'Phụ thuộc kịch bản, chưa có khả năng mở rộng vấn đề', s1: 'Chưa nắm vững nền tảng chuyên môn yêu cầu' },
    { criterion: 'Kế hoạch bài dạy', s5: 'Thiết kế sáng tạo, cá nhân hóa theo từng nhóm năng lực học sinh', s4: 'Chuẩn bị chu đáo, có sự điều chỉnh và bổ sung phù hợp', s3: 'Tuân thủ giáo án mẫu, chưa có nội dung mở rộng', s2: 'Nắm qua cấu trúc bài nhưng chưa làm chủ kịch bản', s1: 'Thiếu sự chuẩn bị cho tiết học' },
    { criterion: 'Quản lý thời lượng', s5: 'Tối ưu phân bổ, xử lý linh hoạt thời gian trước các tình huống', s4: 'Phân bổ hợp lý, chủ động điểu chỉnh nhịp độ lớp học', s3: 'Theo sát dự kiến nhưng thiếu linh hoạt khi cần điều chỉnh', s2: 'Cố gắng bám sát nhưng thường xuyên quá thời gian', s1: 'Mất kiểm soát trong việc quản lý thời lượng bài học' },
    { criterion: 'Tổ chức hoạt động', s5: 'Hoạt động sáng tạo, kích thích 100% học sinh tham gia tích cực', s4: 'Format phù hợp độ tuổi, duy trì không khí lớp học sôi nổi', s3: 'Đảm bảo yêu cầu cơ bản, mức độ tương tác chưa cao', s2: 'Có triển khai hoạt động nhưng chưa phù hợp đối tượng', s1: 'Lớp học thụ động, thiếu không khí giáo dục tích cực' },
    { criterion: 'Kỹ năng đặt câu hỏi', s5: 'Vận dụng thuần thục câu hỏi gợi mở, kích thích tư duy phản biện', s4: 'Phối hợp tốt câu hỏi đóng - mở trong quá trình dẫn dắt', s3: 'Biết cách đặt câu hỏi nhưng định hướng chưa thực sự rõ ràng', s2: 'Sử dụng đơn điệu, chủ yếu là câu hỏi đóng (Có/Không)', s1: 'Ít tương tác hỏi đáp hoặc câu hỏi đi chệch trọng tâm' },
    { criterion: 'Sử dụng thiết bị', s5: 'Làm chủ công nghệ, vận dụng linh hoạt nhiều học liệu điện tử', s4: 'Thao tác thành thạo, đáp ứng tốt yêu cầu bài giảng', s3: 'Sử dụng đúng cách nhưng thao tác đôi lúc còn chậm', s2: 'Gặp lúng túng khi điều khiển thiết bị/công cụ dạy học', s1: 'Chưa có kỹ năng sử dụng công cụ/thiết bị hỗ trợ' },
    { criterion: 'Kỹ năng giao tiếp', s5: 'Ngôn từ chuyên nghiệp, linh hoạt trong tương tác đa chiều', s4: 'Truyền đạt mạch lạc, kết nối tốt với học sinh/phụ huynh', s3: 'Giao tiếp rõ ràng nhưng thiếu điểm nhấn, chưa sâu sắc', s2: 'Cách nói chuyện rập khuôn, tương tác chỉ mang tính một chiều', s1: 'Diễn đạt ấp úng, thiếu khả năng duy trì cuộc hội thoại' },
    { criterion: 'Định hướng học tập', s5: 'Lộ trình chi tiết, đề xuất giải pháp cá nhân hóa cho từng học sinh', s4: 'Định hướng rõ, sát với năng lực biểu hiện của cá nhân học sinh', s3: 'Có mục tiêu chung nhưng chưa linh hoạt theo từng nhóm đối tượng', s2: 'Đưa ra lời khuyên chung chung, thiếu tính thực tiễn', s1: 'Chưa có khả năng tư vấn hướng phát triển cho học sinh' },
    { criterion: 'Xử lý tình huống', s5: 'Tuyệt đối bản lĩnh, biến khó khăn thành tình huống giáo dục', s4: 'Giải quyết ổn thỏa, duy trì nhịp độ ổn định của tiết học', s3: 'Xử lý xong vấn đề nhưng còn khiên cưỡng, thiếu tự nhiên', s2: 'Bị động trước tình huống, gây ảnh hưởng tiến trình dạy', s1: 'Mất bình tĩnh, không kiểm soát được vấn đề phát sinh' },
];

const RUBRIC_A: RubricRow[] = [
    { criterion: '1. Kế hoạch bài dạy', s5: 'Thiết kế xuất sắc, sáng tạo, cá nhân hóa linh hoạt theo học sinh', s4: 'Chuẩn bị chu đáo, có sự bổ sung nội dung mở rộng phù hợp', s3: 'Tuân thủ đúng giáo án mẫu, chưa có thành tố mở rộng', s2: 'Nắm được cấu trúc cơ bản nhưng chưa làm chủ kịch bản', s1: 'Thiếu sự chuẩn bị, chưa nghiên cứu kỹ kịch bản giảng dạy' },
    { criterion: '2. Mục tiêu bài học', s5: 'Xác định rõ ràng, đo lường được, 100% học sinh đạt chuẩn đầu ra', s4: 'Cụ thể, bám sát năng lực học sinh, có tiêu chí đánh giá rõ ràng', s3: 'Mục tiêu phù hợp nhưng định lượng kết quả còn chung chung', s2: 'Có mục tiêu định hướng nhưng vượt quá khả năng tiếp thu của học sinh', s1: 'Xác định sai trọng tâm bài học hoặc không khả thi với thời lượng' },
    { criterion: '3. Thiết kế học liệu (Slide)', s5: 'Bố cục chặt chẽ, thẩm mỹ cao, khai thác tối đa sự chú ý của học sinh', s4: 'Trình bày khoa học, nhất quán, hiệu ứng hình ảnh hỗ trợ tốt', s3: 'Nội dung đầy đủ, sắp xếp bố cục mang tính cơ bản', s2: 'Trình bày nội dung được nhưng logic sắp xếp chưa thực sự tối ưu', s1: 'Slide thiếu tính liên kết, thông tin dàn trải, khó theo dõi' },
    { criterion: '4. Phương tiện & Thiết bị', s5: 'Vận dụng sáng tạo, truyền cảm hứng để học sinh chủ động khám phá', s4: 'Sử dụng hợp lý, kích thích được sự hứng thú học tập', s3: 'Sử dụng đúng mục đích, liên hệ được với nội dung cốt lõi', s2: 'Có đưa vào tiết học nhưng phương pháp khai thác chưa hiệu quả', s1: 'Bỏ qua việc sử dụng thiết bị/học liệu hỗ trợ' },
    { criterion: '5. Nền tảng công cụ', s5: 'Làm chủ thao tác, khéo léo kết nối kiến thức cũ, ứng dụng xuất sắc', s4: 'Thao tác chuẩn xác, phục vụ trơn tru cho tiến trình bài giảng', s3: 'Thao tác đúng kỹ thuật nhưng chưa tạo được sự liên kết nhịp nhàng', s2: 'Có sự nhầm lẫn trong một vài kiến thức/thao tác nền tảng', s1: 'Kiến thức công cụ sơ sài, chưa đáp ứng yêu cầu bộ môn' },
];

const RUBRIC_B: RubricRow[] = [
    { criterion: '6. Năng lực diễn giải', s5: 'Hình tượng hóa sinh động, gần gũi bao quát trọn vẹn mô hình 5W1H', s4: 'Diễn đạt khúc chiết, cấu trúc mạch lạc, truyền tải đủ 5W1H', s3: 'Cung cấp đủ 5W1H nhưng quá trình lập luận chưa thực sự chặt chẽ', s2: 'Diễn giải cồng kềnh, thiếu hệ thống, chưa làm rõ thông điệp 5W1H', s1: 'Truyền đạt sai lệch, dài dòng, lấp lấp trong quá trình trình bày' },
    { criterion: '7. Kỹ năng làm mẫu', s5: 'Trình diễn trực quan xuất sắc, đồng bộ hoàn hảo giữa thao tác và lời giảng', s4: 'Thao tác minh họa rõ ràng, kết hợp giải thích cặn kẽ từng bước', s3: 'Làm mẫu trực quan, học sinh có thể quan sát và làm theo', s2: 'Minh họa chưa thực sự chuẩn xác hoặc gây khó hiểu cho học sinh', s1: 'Bỏ qua bước làm mẫu công cụ/thiết bị' },
    { criterion: '8. Kiểm tra đánh giá', s5: 'Hệ thống câu hỏi sắc bén, đánh giá đa chiều năng lực toàn lớp', s4: 'Tần suất hỏi đáp tốt, tuy nhiên màng đánh giá chưa hoàn toàn bao phủ', s3: 'Đáp ứng số lượng câu hỏi tiêu chuẩn nhưng tần suất phân bổ thưa', s2: 'Sử dụng sai mục đích loại câu hỏi (đóng/mở) trong các tình huống', s1: 'Lớp học thụ động, vắng bóng các câu hỏi kiểm tra nhận thức' },
    { criterion: '9. Tổ chức trải nghiệm', s5: 'Triển khai học tập qua trải nghiệm sâu sắc, giáo viên bám sát tiến độ', s4: 'Hoạt động củng cố tốt mục tiêu, tuy nhiên công tác giám sát chưa sát sao', s3: 'Có tác dụng bổ trợ nhưng buông lỏng việc theo dõi quá trình thực thi', s2: 'Tổ chức mang tính hình thức, hiệu quả cộng hưởng vào bài chưa rõ', s1: 'Bỏ qua hoạt động hoặc triển khai sai lệch bản chất giáo dục' },
    { criterion: '10. Kết quả hoạt động', s5: 'Tỷ lệ đạt mục tiêu xuất sắc (>80%), không khí lớp bùng nổ năng lượng', s4: 'Đa số hoàn thành (50–80%), mức độ hưởng ứng ở mức khá', s3: 'Hoàn thành cơ bản (>50%), chưa khơi gợi được sự phấn khích tích cực', s2: 'Không đạt được kỳ vọng bổ trợ kiến thức đề ra ban đầu', s1: 'Chưa tiến hành đánh giá hoặc hoạt động đi chệch hướng' },
    { criterion: '11. Chuỗi bài thực hành', s5: 'Mục tiêu tinh tế, quy hoạch độ khó tịnh tiến, trợ lực hoàn hảo cho dự án', s4: 'Xác lập đích đến rõ ràng, tịnh tiến tốt nhưng kết nối dự án cuối bị hạn chế', s3: 'Hỗ trợ việc hoàn thiện dự án nhưng thiết kế thiếu tính phân cấp độ khó', s2: 'Giao nhiệm vụ dàn trải, thiếu lớp lang và không có mục đích rõ rệt', s1: 'Để trống thời gian thực hành hoặc nhiệm vụ rời rạc vô nghĩa' },
    { criterion: '12. Quản trị thực hành', s5: 'Bao quát toàn diện, điều phối nhịp nhàng, can thiệp hỗ trợ đúng thời điểm', s4: 'Theo sát tiến độ làm việc, cung cấp hỗ trợ chuyên môn kịp lúc', s3: 'Có quan sát nhưng phản ứng chậm hoặc làm thay phần việc của học sinh', s2: 'Công tác giám sát lỏng lẻo, thiếu chiều sâu tương tác', s1: 'Thả nổi lớp học trong thời lượng thực hành' },
    { criterion: '13. Đánh giá sản phẩm', s5: 'Chữa bài thấu đáo, phân tích tư duy đảo ngược; 100% học sinh tự nghiệm lý', s4: 'Trình chiếu đáp án chuẩn; học sinh tiếp thu và tự chỉnh sửa hoàn thiện', s3: 'Học sinh nắm bắt được vấn đề cốt lõi và tự khắc phục được một phần', s2: 'Có chữa bài chung nhưng thiếu khâu rà soát, nghiệm thu cá nhân', s1: 'Biết lỗi sai nhưng bỏ qua bước đúc kết và sửa chửa' },
    { criterion: '14. Trò chơi học tập (Gamification)', s5: 'Hòa quyện vào bài, phân phối độ căng thẳng hợp lý, 100% tập trung', s4: 'Mô phỏng kiến thức tốt, thu hút sự hưởng ứng của toàn bộ học sinh', s3: 'Bám vào bài học nhưng tính phổ quát thấp, chỉ một nhóm nhỏ tham gia', s2: 'Trò chơi mang tính giải trí đơn thuần, rời rạc với kiến thức trọng tâm', s1: 'Không tổ chức game hoá hoặc triển khai sai mục đích sư phạm' },
    { criterion: '15. Tổng kết Game hoá', s5: 'Tạo động lực cạnh tranh lành mạnh; giáo viên khéo léo đúc kết bài học', s4: 'Khơi dậy được sự hào hứng nhưng khâu chốt kiến thức còn mờ nhạt', s3: 'Thiếu yếu tố kịch tính, giáo viên bỏ quên công đoạn đúc kết hệ thống', s2: 'Game diễn ra khiên cưỡng, nghèo nàn cả về cảm xúc lẫn kiến thức', s1: 'Không có hoạt động tổng kết trò chơi' },
];

const RUBRIC_C: RubricRow[] = [
    { criterion: '16. Năng lực truyền cảm', s5: 'Chất giọng truyền cảm, nhấn nhá thu hút, kiến tạo cảm xúc học tập', s4: 'Diễn đạt lưu loát, tạo được sợ kết nối tự nhiên với nội dung bài học', s3: 'Trình bày dễ hiểu, trôi chảy, không mắc lỗi ngập ngừng', s2: 'Cách nói chuyện ngập ngừng, vấp váp nhiều lần', s1: 'Lối diễn đạt rối rắm, gây khó khăn cho việc tiếp nhận thông tin' },
    { criterion: '17. Phong thái sư phạm', s5: 'Tỏa sáng tự tin, biên độ ngôn ngữ cơ thể phát huy tác dụng xuất sắc', s4: 'Làm chủ bục giảng, sử dụng phi ngôn ngữ chuẩn mực', s3: 'Thể hiện được sự tự tin nhưng phong thái đôi lúc chưa thực sự chuẩn', s2: 'Duy trì ở mức cơ bản, bộc lộ sự thiếu tự tin nhất định', s1: 'Rụt rè, thu mình, thiếu định hình phong cách người giáo viên' },
    { criterion: '18. Quản trị thời gian', s5: 'Điều phối thời lượng hoàn hảo, ứng biến nhạy bén trước các sự cố', s4: 'Cân đối hợp lý thời lượng cho từng chuỗi hoạt động', s3: 'Kết thúc đúng giờ nhưng phân bổ cục bộ chưa thực sự mượt mà', s2: 'Vi phạm nguyên tắc thời gian tại nhiều phân đoạn', s1: 'Phá vỡ hoàn toàn khung giới hạn thời lượng quy định' },
    { criterion: '19. Cơ chế tưởng thưởng', s5: 'Kích hoạt động lực bên trong; bộ máy khen thưởng điều phồi lớp cực tốt', s4: 'Cộng trừ điểm hợp lý nhưng chưa tối ưu được hiệu ứng hành vi', s3: 'Ghi nhận nỗ lực thường xuyên nhưng hệ thống điểm số thiếu chặt chẽ', s2: 'Có ban phát lời khen nhưng tần suất mờ nhạt, thiếu điểm nhấn', s1: 'Tuyệt đối không áp dụng bất kỳ hình thức khích lệ nào' },
    { criterion: '20. Kiểm soát lớp chéo', s5: 'Siết chặt kỷ luật song song nhóm đang tham gia và nhóm đang quan sát', s4: 'Tạo lập sợi dây liên kết chặt chẽ sự chú ý giữa 2 phổ học sinh', s3: 'Biết cách thiết kế nhiệm vụ phụ cho nhóm đang nằm ngoài hoạt động chính', s2: 'Có giao việc nhưng bỏ ngỏ khâu kiểm duyệt kết quả đầu ra', s1: 'Bỏ mặc hoàn toàn nhóm học sinh không nằm trong luồng hoạt động' },
    { criterion: '21. Hoạt động nhóm', s5: 'Học sinh phân vai chủ động, cỗ máy làm việc nhóm vận hành trơn tru', s4: 'Logic chia nhóm hợp lý, toàn bộ thành viên đều phát huy được giá trị', s3: 'Sắp xếp ổn thỏa nhưng chưa đẩy được hiệu suất hợp tác lên cao', s2: 'Áp dụng mô hình nhóm sai lệch với đặc điểm thực tế của lớp', s1: 'Không có tư duy tổ chức học tập cộng tác' },
    { criterion: '22. Hiệu lệnh tập trung', s5: 'Triển khai tín hiệu nhất quán với tần suất hợp lý, thu hồi chú ý lập tức', s4: 'Sử dụng nhịp nhàng, tạo thói quen tốt nhưng hiệu quả chưa đạt 100%', s3: 'Phát hiệu lệnh đúng lúc nhưng chưa duy trì thành nếp thường xuyên', s2: 'Có dùng khẩu lệnh nhưng thất bại trong việc kéo lại sự tập trung', s1: 'Không thiết lập được hệ thống quy tắc thu hút sự chú ý' },
    { criterion: '23. Phản xạ sư phạm', s5: 'Nhạy bén tháo gỡ vấn đề, khéo léo biến cố thành cơ hội thay đổi bầu không khí', s4: 'Bình tĩnh giải quyết thuyết phục nhưng tốc độ phản ứng hơi chậm', s3: 'Quản trị được rủi ro nhưng cách xử lý còn thiếu độ uyển chuyển', s2: 'Nhận diện được sự cố nhưng bế tắc trong việc tìm hướng giải quyết', s1: 'Đầu hàng trước các diễn biến phát sinh bất ngờ' },
    { criterion: '24. Mức độ kỷ luật', s5: 'Sử dụng thuần thục ngôn ngữ phi lời nói để duy trì trật tự vô hình', s4: 'Giám sát gắt gao, chặt đứt nhanh gọn các tín hiệu gây rối', s3: 'Áp dụng khung tiêu chuẩn kỷ luật, kiểm soát được >50% lớp', s2: 'Có đặt ra nội quy nhưng buông lỏng công tác giám sát thực thi', s1: 'Mất hoàn toàn khả năng làm chủ trật tự lớp học' },
    { criterion: '25. Sinh quyển lớp học', s5: 'Xây dựng môi trường lý tưởng: tự chủ, bùng nổ năng lượng tích cực', s4: 'Bảo toàn được nhịp điệu trơn tru, không khí học tập cởi mở, vui vẻ', s3: 'Nhịp độ duy trì ở mức an toàn, thái độ học sinh hòa nhã', s2: 'Nhiệt độ lớp thường xuyên hạ thấp, thiếu vắng sinh khí học tập', s1: 'Khung cảnh hỗn loạn, thiếu thốn định hướng sư phạm' },
    { criterion: '26. Kết nối Đa chiều', s5: 'Cảm âm tinh tế nguyện vọng của học sinh; tỏa sáng chuyên nghiệp trước phụ huynh', s4: 'Giao tiếp tương tác tốt với học sinh; trao đổi thông tin minh bạch với phụ huynh', s3: 'Duy trì kết nối ổn định với học sinh; còn e ngại trong việc tiếp xúc phụ huynh', s2: 'Hội thoại một chiều xơ cứng; né tránh các tương tác với phụ huynh', s1: 'Rào cản ngôn ngữ trầm trọng; khiếm khuyết hoàn toàn bộ kỹ năng đối ngoại' },
];

// ─── Phase Tabs ───────────────────────────────────────────────────────────────
const PHASES = [
    { id: 'p1', emoji: '①', label: 'Cấp tài khoản', sub: 'Quan sát → Duyệt giảng' },
    { id: 'p2', emoji: '②', label: 'Sau khi có LMS', sub: 'TA → Duyệt giảng LEC' },
    { id: 'p3', emoji: '③', label: 'Làm LEC', sub: 'Giáo viên đứng lớp' },
    { id: 'p4', emoji: '④', label: 'LEC → Super Mentor', sub: 'LEC → BGK' },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function Screen11({ onNavigate }: { onNavigate?: (screen: string) => void }) {
    const [phase, setPhase] = useState('p1');

    return (
        <div className="roadmap-page mx-auto max-w-6xl px-1 pb-16 sm:px-2">

            {/* Header */}
            <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-sm md:p-8">
                <p className="page-eyebrow mb-2 text-sky-700">Coding HCM1 · Teacher Journey</p>
                <h1 className="page-title gradient-text">Lộ trình Ứng viên → LEC</h1>
                <p className="page-lead mt-3 max-w-3xl text-slate-600">Từng bước từ quan sát lớp học, duyệt giảng đến khi đứng lớp chính thức và phát triển thành Super Mentor.</p>

                {/* Journey bar */}
                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                        { label: 'Ứng viên', c: 'bg-slate-100 text-slate-700 border-slate-200' },
                        { label: '→', c: 'text-slate-400 bg-transparent border-transparent px-0' },
                        { label: 'Quan sát', c: 'bg-sky-50 text-sky-700 border-sky-200' },
                        { label: '→', c: 'text-slate-400 bg-transparent border-transparent px-0' },
                        { label: 'Duyệt giảng', c: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { label: '→', c: 'text-slate-400 bg-transparent border-transparent px-0' },
                        { label: 'TA', c: 'bg-violet-50 text-violet-700 border-violet-200' },
                        { label: '→', c: 'text-slate-400 bg-transparent border-transparent px-0' },
                        { label: 'LEC', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { label: '→', c: 'text-slate-400 bg-transparent border-transparent px-0' },
                        { label: 'Super Mentor', c: 'bg-amber-50 text-amber-700 border-amber-200' },
                    ].map((s, i) => (
                        <span key={i} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${s.c}`}>{s.label}</span>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 -mx-1 mb-8 mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-sky-100 bg-white/95 p-2 shadow-lg shadow-sky-900/5 backdrop-blur md:grid-cols-4">
                {PHASES.map(p => (
                    <button key={p.id} onClick={() => setPhase(p.id)}
                        className={`min-w-0 rounded-xl border px-3 py-3 text-left transition-all md:px-4
              ${phase === p.id
                                ? 'roadmap-phase-active border-sky-600 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800'}`}>
                        <div className="truncate text-sm font-bold md:text-base">{p.emoji} {p.label}</div>
                        <div className={`mt-1 hidden text-xs leading-snug sm:block ${phase === p.id ? 'text-white' : 'text-slate-500'}`}>{p.sub}</div>
                    </button>
                ))}
            </div>

            {/* ══ PHASE 1 ══════════════════════════════════════════════════════════ */}
            {phase === 'p1' && (
                <div className="space-y-1">
                    <Step n={1} title="Quan sát lớp học — 5 buổi">
                        <div className="space-y-4 mb-4">
                            {/* Lớp học */}
                            <div>
                                <p className="font-bold text-emerald-300 mb-2">📚 Đối với Lớp học (thông thường)</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>Liên hệ Leader để xin thông tin lớp học (mã lớp &amp; khung giờ) để tham gia quan sát: <a href="https://zalo.me/0337061506" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 font-medium">Zalo Leader</a></span>
                                    </li>
                                </ul>
                            </div>

                            {/* Lớp Trải Nghiệm */}
                            <div>
                                <p className="font-bold text-violet-300 mb-2">🎯 Đối với Ca Trải nghiệm (Trial)</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                                        <span>Chủ động xem lịch trải nghiệm ở bên dưới và thông báo xác nhận với Leader.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Quy định chung */}
                            <div className="pt-2 border-t border-white/5">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>Khi đến lớp, chủ động giới thiệu với GV phụ trách.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>Tham gia trực tiếp, quan sát cách GV dạy, quản lý lớp &amp; tương tác với học viên. Điền form sau mỗi buổi.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Tài liệu & lịch trải nghiệm</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard href="https://drive.google.com/file/d/1xTWTOjqB6tZIl4Xc7YBPQaOgLdXbfmbr/view" icon={ClipboardCheck} label="Form quan sát" desc="Điền sau mỗi buổi" color="blue" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1qjqo6nrQKegFPzu4t8D4W2Q5-fJ829ghNvTDWjRD1r4/edit" icon={Calendar} label="Lịch trải nghiệm HCM1" desc="Qua tab: Observe để điền tên ứng viên" color="slate" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1DRASt1UR8drUTLH-WGvguJRWudq3Z02eicwxxmPphek/edit" icon={Calendar} label="Lịch trải nghiệm HCM4" desc="Qua tab: Observe để điền tên ứng viên" color="slate" />
                        </div>
                    </Step>

                    <Step n={2} title="Tham gia quan sát ca trải nghiệm (Trial)">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quan sát GV chính làm 3 việc trong buổi trải nghiệm</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { t: '① Giới thiệu', d: 'Cách GV tự giới thiệu bản thân, mời HS giới thiệu để tạo tương tác.' },
                                { t: '② Dẫn dắt', d: 'Cách GV dựa vào sở thích HS để kết nối vào nội dung bài học.' },
                                { t: '③ Giảng dạy', d: 'Cách giáo viên hướng dẫn hứng thú với giáo trình và theo đúng timeline của giáo trình.' },
                            ].map(item => (
                                <div key={item.t} className="rounded-xl bg-indigo-900/20 border border-indigo-500/20 p-3">
                                    <p className="text-indigo-300 font-bold text-xs mb-1">{item.t}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">Quan sát GV chính làm 4 bước sau buổi trải nghiệm</p>
                        <div className="space-y-2">
                            {/* ① Trao đổi với Tư vấn */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">①</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Trao đổi với Tư vấn</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Báo cáo thái độ &amp; năng lực HS trước khi gặp phụ huynh.</p>
                                </div>
                            </div>

                            {/* ② Nhận xét với Phụ huynh */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">②</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Nhận xét với Phụ huynh</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Phản hồi kết quả học của HS theo đúng hướng dẫn.</p>
                                    <a href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/v.-quy-trinh-van-hanh-buoi-trai-nghiem/quy-trinh-mot-ca-trai-nghiem/huong-dan-nhan-xet-voi-phu-huynh" target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-3 h-3" />Hướng dẫn
                                    </a>
                                </div>
                            </div>

                            {/* ③ Điền phiếu đánh giá — NavBtn tới screen2 */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">③</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-sm">Điền phiếu đánh giá năng lực HS</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Điền form sau trải nghiệm. Check lại phiếu tại mục 2 trong app.</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <a href="https://forms.office.com/pages/responsepage.aspx?id=oAYARH-DxUGWTsVLZQsVNRdxoHOrh4tAlfWX5PKv_NxUQVhJTDFWV1RaV1gwQzBaRklDU1hJQVFHSi4u" target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                                            <ExternalLink className="w-3 h-3" />Form phiếu TN
                                        </a>
                                        <NavBtn screen="screen2" label="Mở màn hình Tìm phiếu" onNavigate={onNavigate} />
                                    </div>
                                </div>
                            </div>

                            {/* ④ Cập nhật kết quả lên LMS */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">④</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Cập nhật kết quả lên LMS</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Ghi kết quả vào hệ thống LMS sau buổi.</p>
                                    <a href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/v.-quy-trinh-van-hanh-buoi-trai-nghiem/quy-trinh-mot-ca-trai-nghiem/huong-dan-danh-gia-ket-qua-trai-nghiem-tren-lms" target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-3 h-3" />Hướng dẫn LMS
                                    </a>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Tài liệu buổi trải nghiệm</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                            <ResourceCard href="https://docs.google.com/presentation/d/1RCD9a3IATcrGwY2AQObbqBxRknhQuIu5/edit" icon={Video} label="Slide quy trình Trial" desc="Đọc kỹ để nắm rõ quy trình" color="violet" />
                            <ResourceCard href="https://mindxcom-my.sharepoint.com/:x:/r/personal/rdk12_drive_mindx_com_vn/_layouts/15/Doc.aspx?sourcedoc=%7B0B16E25A-AA34-4E96-96C9-447E81C6CF77%7D&file=%5BR%26D%20K12%20-%20CMS%5D%20T%E1%BB%95ng%20h%E1%BB%A3p%20file%20l%C6%B0u%20tr%E1%BB%AF%20h%E1%BB%8Dc%20li%E1%BB%87u.xlsx&action=default&mobileredirect=true" icon={BookOpen} label="Giáo trình mới" desc="Dùng để trình chiếu trong buổi học" color="emerald" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1VxhunGGaUk2schjQzF0vxwquNWdEdR42z6DnDFL2McY/edit" icon={BookOpen} label="Giáo trình cũ" desc="Dùng để học tiền duyệt giảng, trước khi có tài khoản truy cập giáo trình chính thức" color="slate" />
                        </div>
                    </Step>

                    <Step n={3} title="Duyệt giảng với Leader → Được cấp tài khoản">
                        <Callout icon="💡" text="Chủ động nhắn Leader thời gian rảnh để được sắp xếp buổi duyệt!" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Leader kiểm tra 3 mục</p>
                        <Check items={[
                            'Trả lời câu hỏi về những gì đã quan sát trong lớp học',
                            'Thực hành lại đầy đủ 1 ca trải nghiệm',
                            'Giải thích sự khác nhau giữa các câu lệnh lập trình từng khóa Coding',
                        ]} />
                        <Callout
                            icon="!"
                            text="Lưu ý: Mong muốn giảng dạy khối nào sẽ cần duyệt giảng với Leader của khối đó. Ví dụ: nếu muốn dạy thêm Robotics, giáo viên cần duyệt giảng với Leader Robotics."
                            color="blue"
                        />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Rubric đánh giá — 10 tiêu chí (thang 1→5)</p>
                        <RubricTable groupLabel="10 tiêu chí duyệt giảng lần 1" color="indigo" rows={RUBRIC_10} />
                    </Step>

                    <Step n={4} title="Đăng ký thông tin giáo viên với HR" last>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Hoàn thành biểu mẫu thông tin giáo viên sau khi duyệt giảng để HR tiếp nhận và xử lý hồ sơ.
                        </p>
                        <ResourceCard
                            href="https://docs.google.com/forms/d/e/1FAIpQLSe-Ad6CpCq5I-o3qRTzmGnslAhk_IcvaX1rlNTo2uI8LDJ7nQ/viewform"
                            icon={FileText}
                            label="Mở form đăng ký thông tin giáo viên"
                            desc="Giáo viên cung cấp đầy đủ các thông tin như CCCD, số tài khoản để nhà trường sử dụng làm hợp đồng dịch vụ và phiếu thanh toán thù lao"
                            color="emerald"
                        />
                    </Step>
                </div>
            )}

            {/* ══ PHASE 2 ══════════════════════════════════════════════════════════ */}
            {phase === 'p2' && (
                <div className="space-y-1">
                    <Step n={1} title="Làm kiểm tra Coding Technical đầu vào">
                        <Callout
                            icon="!"
                            text="Đề kiểm tra gồm 3 môn: Scratch, GameMaker và Web. Hoàn thành bài kiểm tra trước khi liên hệ Teacher Coordinator."
                            color="blue"
                        />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tài liệu tham khảo</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <ResourceCard href="https://scratch-tutorial.readthedocs.io/fr/latest/1_intro/intro.html" icon={BookOpen} label="Scratch" desc="Tài liệu ôn tập" color="amber" />
                            <ResourceCard href="https://manual.gamemaker.io/monthly/en/#t=Content.htm" icon={BookOpen} label="GameMaker" desc="Tài liệu ôn tập" color="blue" />
                            <ResourceCard href="https://www.w3schools.com/js/default.asp" icon={BookOpen} label="Web / JavaScript" desc="Tài liệu ôn tập" color="emerald" />
                        </div>
                        <ResourceCard href="https://timer.addonforge.com/timer/1FAIpQLSfTOu3XwojvVZF1wgVLNwNMHgDqr49FdXlpZu-X79UXyAcZ6A" icon={ClipboardCheck} label="Bắt đầu bài kiểm tra Technical" desc="Mở đề kiểm tra Coding đầu vào" color="violet" />
                    </Step>

                    <Step n={2} title="Liên hệ TC (Teacher Coordinator)">
                        <p className="text-sm text-slate-600">Nhắn tin giới thiệu tới Teacher Coordinator qua <a href="https://zalo.me/0385914843" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-700 underline hover:text-sky-800">Zalo 0385914843</a>:</p>
                        <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 font-mono text-sm text-slate-300 leading-relaxed">
                            &quot;Em tên [Tên], mã LMS [mã], ứng tuyển giảng dạy bộ môn Coding và đã hoàn thành bài kiểm tra Technical đầu vào.&quot;
                        </div>
                    </Step>

                    <Step n={3} title="3 việc cần làm mỗi tuần">
                        <div className="space-y-3">
                            {[
                                {
                                    n: '1', t: 'Đăng ký lịch làm', d: 'Điền form đăng ký trước mỗi tuần. Nhớ update môn học có thể trải nghiệm, giờ bận và lý do cụ thể — giúp TC dễ nắm và điều chỉnh khung giờ cho phù hợp.', cards: [
                                        { href: 'https://docs.google.com/forms/d/e/1FAIpQLScZuVAlACc1Pnoz7GU85xkwTdcHdJh6vMdbeYJwEIaxeE_q2Q/viewform', icon: ClipboardCheck, label: 'Form đăng ký lịch', color: 'emerald' },
                                    ]
                                },
                                {
                                    n: '2', t: 'Kiểm tra lịch cơ sở (18h mỗi ngày)', d: 'Vào 18h xem có ca trực không → vào LMS check giáo trình để chuẩn bị.', cards: [
                                        { href: 'https://docs.google.com/spreadsheets/d/1qjqo6nrQKegFPzu4t8D4W2Q5-fJ829ghNvTDWjRD1r4/edit', icon: Calendar, label: 'Lịch HCM1', color: 'blue' },
                                        { href: 'https://docs.google.com/spreadsheets/d/1DRASt1UR8drUTLH-WGvguJRWudq3Z02eicwxxmPphek/edit', icon: Calendar, label: 'Lịch HCM4', color: 'blue' },
                                    ]
                                },
                                {
                                    n: '3', t: 'Kiểm tra công & phản hồi lương', d: 'Nếu thiếu công → điền sheet để TC đảm bảo quyền lợi.', cards: [
                                        { href: 'https://docs.google.com/spreadsheets/d/1jow0T_fuAiWRGUOjp22euWRg0Blh5Ix-Y5Z9AiD7Q-s/edit', icon: DollarSign, label: 'Sheet feedback lương', color: 'amber' },
                                        { href: 'https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/huong-dan-kiem-tra-cong-luong', icon: FileText, label: 'H.dẫn kiểm tra công', color: 'blue' },
                                    ]
                                },
                            ].map(item => (
                                <div key={item.n} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.n}</span>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{item.t}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{item.d}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9">
                                        {item.cards.map(c => <ResourceCard key={c.href} {...c} icon={c.icon} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien" icon={BookOpen} label="📖 Quy trình quy định dành cho GV" desc="Đọc đầy đủ — quan trọng!" color="violet" />
                    </Step>

                    <Step n={4} title="Đầu việc TA có thể tham gia">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-emerald-900/15 border border-emerald-500/20 p-4">
                                <p className="font-bold text-emerald-300 mb-1.5">🧑‍💻 Trợ giảng lớp học</p>
                                <p className="text-slate-400 text-xs leading-relaxed mb-2">Hỗ trợ lớp có trên 9 học viên — tuỳ mức handle của GV đứng lớp.</p>
                                <ul className="space-y-1.5 text-xs text-slate-300">
                                    <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" /> Trao đổi với LEC về tình hình học của lớp để có việc có thể hỗ trợ kịp thời.</li>
                                    <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" /> Soạn quizz để hỗ trợ giáo viên đứng lớp ôn lại bài tập cho con.</li>
                                    <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" /> Chuẩn bị kit với LEC để đảm bảo timeline buổi học.</li>
                                    <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" /> Nhận xét lớp học để đảm bảo luôn nắm tình hình học của các con.</li>
                                    <li className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" /> Mềm mỏng giải quyết các vấn đề và trao đổi với giáo viên để đưa ra giải pháp hợp lý.</li>
                                </ul>
                            </div>
                            <div className="rounded-xl bg-blue-900/15 border border-blue-500/20 p-4">
                                <p className="font-bold text-blue-300 mb-1.5">🎯 Dạy ca trải nghiệm</p>
                                <p className="text-slate-400 text-xs leading-relaxed mb-2">Hướng dẫn học sinh trải nghiệm theo đúng giáo trình.</p>
                                <ResourceCard href="https://docs.google.com/presentation/d/1RCD9a3IATcrGwY2AQObbqBxRknhQuIu5/edit" icon={Video} label="Slide trial" color="blue" />
                            </div>
                        </div>
                    </Step>

                    <Step n={5} title="Duyệt giảng lên LEC (Giáo viên đứng lớp)" last>
                        <Callout icon="🎯" text="Mục tiêu giai đoạn TA: chuẩn bị đủ kiến thức để được duyệt giảng lên LEC!" />
                        <Callout icon="⏱️" text="Buổi duyệt giảng kéo dài 15–20 phút — thực hành dạy thử 1 phần bài học trước BGK/Leader." color="blue" />
                        <Check items={[
                            'Đăng ký vào group duyệt giảng trên Zalo',
                            'Hoàn thành tập huấn sư phạm trước khi duyệt giảng',
                            'Soạn slide theo mẫu K12',
                            'Thực hành dạy nhiều lần trước khi duyệt',
                        ]} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard
                                href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/teaching-roadmap/quy-trinh-quy-dinh-dao-tao-dau-vao/tap-huan-su-pham"
                                icon={BookOpen}
                                label="Tập huấn sư phạm"
                                desc="Bài tập E-learning sư phạm tiền duyệt giảng"
                                color="emerald"
                            />
                            <ResourceCard href="https://drive.google.com/file/d/1At4vzPyq1JZJpbcnBTaulzkMv12moh--/view" icon={Video} label="Slide mẫu K12" desc="Dành cho khoá K12" color="blue" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Rubric đánh giá LEC — 26 tiêu chí (thang 1→5)</p>
                        <div className="space-y-2">
                            <RubricTable groupLabel="A — Đánh giá sự chuẩn bị (tiêu chí 1–5)" color="indigo" rows={RUBRIC_A} />
                            <RubricTable groupLabel="B — Phương pháp giảng dạy (tiêu chí 6–15)" color="emerald" rows={RUBRIC_B} />
                            <RubricTable groupLabel="C — Kỹ năng sư phạm (tiêu chí 16–26)" color="amber" rows={RUBRIC_C} />
                        </div>
                    </Step>
                </div>
            )}

            {/* ══ PHASE 3 ══════════════════════════════════════════════════════════ */}
            {phase === 'p3' && (
                <div className="space-y-1">
                    <Step n={1} title="Tiêu chí đứng lớp">
                        <Check items={[
                            'Giữ trật tự được các con trong quá trình học.',
                            'Tạo hứng thú cho các con trong quá trình học.',
                            'Có phần khen thưởng động viên khi con học, điểm tích lũy là phần quan trọng giúp ghi nhận khả năng và tạo động lực cho các con.',
                            'Đi xung quanh quan sát học viên đang làm có đúng thời lượng không, kiểm tra câu lệnh lập trình chuẩn không để nắm được năng lực của từng bạn.',
                        ]} />
                    </Step>

                    <Step n={2} title="Quy trình & Timeline một buổi học (2h)">
                        <div className="data-table-shell mt-2">
                            <table className="app-table timeline-table">
                                <thead>
                                    <tr>
                                        <th className="w-28">Thời gian</th>
                                        <th className="w-1/4">Bước</th>
                                        <th>Nội dung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-section">
                                        <td rowSpan={3}>Trước</td>
                                        <td>Chấm bài tập về nhà</td>
                                        <td>Chấm bài và nhắc nhở học viên, phụ huynh hoàn thành đầy đủ bài tập được giao.</td>
                                    </tr>
                                    <tr>
                                        <td>Xem trước nội dung môn học</td>
                                        <td>Chủ động xem trước khóa học và bài học để nắm tổng quan, đầu ra, nội dung và kiến thức cần truyền đạt.</td>
                                    </tr>
                                    <tr>
                                        <td>Tham gia lớp học</td>
                                        <td>Sắp xếp lịch trình để có mặt trước giờ dạy tối thiểu 10 phút, bảo đảm thời gian chuẩn bị giáo trình và tài liệu.</td>
                                    </tr>
                                    <tr>
                                        <td rowSpan={4}>Trong</td>
                                        <td>Gửi đánh giá khảo sát học viên</td>
                                        <td>Gửi khảo sát đánh giá cho học viên vào buổi 4 và buổi 8 của học phần.</td>
                                    </tr>
                                    <tr>
                                        <td>Sửa bài tập về nhà</td>
                                        <td>Hướng dẫn học viên sửa bài tập về nhà và giải đáp các nội dung còn vướng mắc.</td>
                                    </tr>
                                    <tr>
                                        <td>Giảng dạy</td>
                                        <td>Giảng dạy nội dung theo giáo trình và Teaching Guide.</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng kết nội dung buổi học</td>
                                        <td>Ôn lại kiến thức chính, kiểm tra mức độ tiếp thu và hướng dẫn nhiệm vụ tiếp theo.</td>
                                    </tr>
                                    <tr>
                                        <td rowSpan={2}>Sau</td>
                                        <td>Trao đổi vấn đề</td>
                                        <td>Thông báo lại với cấp quản lý và vận hành các vấn đề quan trọng để phối hợp xử lý, nếu có.</td>
                                    </tr>
                                    <tr>
                                        <td>Nhận xét buổi học</td>
                                        <td>Thực hiện nhận xét sau buổi học trên LMS và Zalo.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 rounded-xl border border-[#c9ded7] bg-[#eef7f3] p-4">
                            <p className="text-sm font-bold text-[#1d584e]">Khi học viên phát sinh vấn đề về thái độ hoặc năng lực</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#1e293b]">
                                <li>Giáo viên linh động xử lý dựa trên chuyên môn và kỹ năng sư phạm.</li>
                                <li>Thông báo với TE/Leader và CS để kịp thời trao đổi với phụ huynh và có phương án hỗ trợ.</li>
                            </ul>
                        </div>
                    </Step>

                    <Step n={3} title="Đánh giá năng lực và chỉ số lương (TP & Completion Rate)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                                <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-2"><Star className="w-4 h-4" /> Chỉ số TP (Khảo sát Buổi 4 & 8)</h3>
                                <p className="text-sm text-slate-300 mb-2">Thực hiện khảo sát trên form để lấy điểm TP (ảnh hưởng lương). Thang điểm xếp loại (Tối đa: 5):</p>
                                <ul className="space-y-1 text-xs text-slate-400 mb-3 ml-2 list-disc list-inside">
                                    <li>Mức 1: &lt; 3.6 điểm</li>
                                    <li>Mức 2: 3.6 - 3.8 điểm</li>
                                    <li>Mức 3: 3.8 - 4.0 điểm</li>
                                    <li>Mức 4: 4.0 - 4.4 điểm</li>
                                    <li>Mức 5: &ge; 4.4 điểm</li>
                                </ul>
                                <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/vi.-quy-trinh-van-hanh-lop-hoc/quy-trinh-mot-buoi-giang-day/huong-dan-khao-sat-danh-gia-cua-hoc-vien-tren-lms-va-denise" icon={FileText} label="Form Khảo sát" color="amber" />
                            </div>
                            
                            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                                <h3 className="font-bold text-emerald-300 flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4" /> Completion Rate (Buổi 14)</h3>
                                <p className="text-sm text-slate-300 mb-2">Đo lường số lượng học viên hoàn thành đến cuối khóa học:</p>
                                <ul className="space-y-1 text-xs text-slate-400 mb-3 ml-2 list-disc list-inside">
                                    <li>Mức 1: &lt; 80%</li>
                                    <li>Mức 2: 80% - 85%</li>
                                    <li>Mức 3: 85% - 90%</li>
                                    <li>Mức 4: 90% - 95%</li>
                                    <li>Mức 5: &ge; 95%</li>
                                </ul>
                                <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/chi-so-danh-gia#danh-gia-bac-luong-giao-vien-dua-tren-diem-tu-cac-tieu-chi" icon={DollarSign} label="Cách tính điểm lương" color="emerald" />
                            </div>
                        </div>

                    </Step>
                    
                    <Step n={4} title="Tài liệu & Quy định Vận hành" last>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/vi.-quy-trinh-van-hanh-lop-hoc/quy-trinh-mot-buoi-giang-day" icon={BookOpen} label="Quy trình Vận hành lớp học" desc="Tổng hợp quy trình giảng dạy." color="violet" />
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/vi.-quy-trinh-van-hanh-lop-hoc/quy-trinh-mot-buoi-giang-day/huong-dan-cach-viet-nhan-xet-buoi-hoc" icon={FileText} label="HD viết nhận xét" desc="Dành cho Zalo & LMS" color="violet" />
                        </div>
                    </Step>
                </div>
            )}

            {/* ══ PHASE 4 ══════════════════════════════════════════════════════════ */}
            {phase === 'p4' && (
                <div className="space-y-1">
                    <Step n={1} title="Kết quả sau khi lên LEC">
                        <Check items={[
                            'Đứng giảng dạy chính thức tại lớp',
                            'Tham gia review quá trình dạy sau 6 tháng làm việc',
                            'Leader đánh giá và phản hồi để giáo viên cải thiện chất lượng giảng dạy',
                        ]} />
                        <Callout icon="📌" text="Trong 6 tháng đầu: sẵn sàng hỗ trợ tất cả tình huống và không ngừng học hỏi để đạt kết quả tốt nhất." color="blue" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Tài liệu lương</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/chi-tiet-luong" icon={DollarSign} label="Chi tiết bảng lương" color="emerald" />
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/dieu-kien-danh-gia-luong" icon={ClipboardCheck} label="Điều kiện đánh giá" color="blue" />
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/chi-so-danh-gia" icon={Star} label="Chỉ số đánh giá" color="amber" />
                        </div>
                    </Step>

                    <Step n={2} title="Vai trò BGK Demo Coding → Trở thành Super Mentor" last>
                        {/* Roadmap */}
                        <div className="flex flex-col gap-0">
                            {[
                                { icon: '🟢', label: 'LEC đứng lớp ổn định' },
                                { icon: '📚', label: 'Nắm vững giáo trình & bộ môn' },
                                { icon: '📝', label: 'Đề xuất duyệt giảng Super Mentor với Leader' },
                                { icon: '🎓', label: 'Đào tạo chuyên sâu & leader duyệt' },
                                { icon: '⚖️', label: 'Tham gia vai trò BGK Demo Coding' },
                                { icon: '⭐', label: 'Super Mentor', highlight: true },
                            ].map((item, i, arr) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg mt-0.5">{item.icon}</span>
                                        {i < arr.length - 1 && <div className="w-px h-5 bg-white/15 my-0.5" />}
                                    </div>
                                    <p className={`text-sm py-1 ${item.highlight ? 'text-amber-300 font-bold text-base' : 'text-slate-300'}`}>{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <Callout
                            icon="🎮"
                            text="Trong Demo Coding, học sinh trình bày và vận hành sản phẩm; BGK nhận xét, đặt câu hỏi để học sinh bảo vệ dự án hoặc giải thích thử thách đã thực hiện."
                            color="blue"
                        />

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">1. Mở đầu và nội quy buổi Demo</p>
                        <Check items={[
                            'Không làm việc riêng, đùa giỡn hoặc gây mất trật tự trong phần trình bày của bạn.',
                            'Khuyến khích học sinh tương tác và trải nghiệm sản phẩm của các bạn demo.',
                            'Không tự ý ra ngoài nếu không thực sự cần thiết.',
                        ]} />

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">2. Quy trình cho mỗi phần Demo</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { ph: '① Học sinh Demo', d: 'Trình bày ý tưởng, quá trình thực hiện và trực tiếp vận hành sản phẩm Coding.' },
                                { ph: '② BGK hỏi & nhận xét', d: 'Đặt câu hỏi mở để học sinh bảo vệ dự án, giải thích lựa chọn và thử thách đã xử lý.' },
                                { ph: '③ Kết thúc tích cực', d: 'Ghi nhận nỗ lực và nói: “Chúc mừng con đã hoàn thành phần trình bày.”' },
                            ].map(item => (
                                <div key={item.ph} className="rounded-xl border border-amber-500/20 bg-amber-900/15 p-3">
                                    <p className="mb-1 text-xs font-bold text-amber-300">{item.ph}</p>
                                    <p className="text-xs leading-relaxed text-slate-400">{item.d}</p>
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">3. Đặt câu hỏi theo Bloom Taxonomy</p>
                        <Callout icon="!" text="Hạn chế câu hỏi Có/Không. Ưu tiên: Như thế nào? Vì sao? Để làm gì? Tại sao?" />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {[
                                { level: 'Dễ — Nhận diện', detail: 'Gọi tên, định nghĩa, mô tả quá trình, màu sắc hoặc thành phần.' },
                                { level: 'Trung bình — Hiểu & vận dụng', detail: 'Giải thích cách dùng kiến thức để tạo chức năng hoặc xử lý yêu cầu.' },
                                { level: 'Khó — Phân tích', detail: 'Phân tích nguyên nhân, lỗi, lựa chọn kỹ thuật và cách cải tiến sản phẩm.' },
                                { level: 'Câu hỏi sao — Mở rộng', detail: '“Thay vì cách này, con còn cách nào khác?” hoặc đề xuất một phương án mới.' },
                            ].map(item => (
                                <div key={item.level} className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                                    <p className="text-sm font-bold text-sky-800">{item.level}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">4. Trọng tâm đánh giá Demo Coding</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {[
                                {
                                    title: 'Thuyết trình',
                                    items: ['Giọng nói và phong thái tự tin', 'Không phụ thuộc hoàn toàn vào slide', 'Body language và tương tác', 'Slide rõ nội dung, bố cục, màu sắc và phông chữ'],
                                },
                                {
                                    title: 'Sản phẩm Coding',
                                    items: ['Giao diện, hình ảnh và âm thanh phù hợp', 'Menu, điều hướng, hướng dẫn, cài đặt và hiệu ứng', 'Chức năng chính, tính năng ẩn và lỗi còn tồn tại', 'Khả năng đọc lỗi và thực hiện hotfix'],
                                },
                                {
                                    title: 'Ý tưởng & kiến thức',
                                    items: ['Ý tưởng và quá trình làm việc', 'Kiến thức dùng để tạo từng chức năng', 'Lý do lựa chọn giải pháp', 'Cải tiến của khóa Advance so với sản phẩm Basic'],
                                },
                            ].map(group => (
                                <div key={group.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                    <p className="mb-2 text-sm font-bold text-emerald-300">{group.title}</p>
                                    <ul className="space-y-1.5">
                                        {group.items.map(item => (
                                            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                                                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">5. Công thức nhận xét và tổng kết</p>
                        <div className="flex flex-wrap gap-2">
                            {['Ghi nhận', 'Nêu hạn chế', 'Cách khắc phục & góp ý', 'Khích lệ'].map(t => (
                                <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">{t}</span>
                            ))}
                        </div>
                        <Check items={[
                            'Cuối buổi, nhận xét chung theo nhóm đa số và thiểu số; tránh nêu cá nhân theo hướng tiêu cực.',
                            'Giới thiệu ngắn về khóa học tiếp theo và học sinh sẽ học gì ở cấp độ tiếp theo.',
                        ]} />

                        <div className="mt-2 grid grid-cols-1 gap-2">
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1kdpTbzzLll2U7U9x0gRoM4HZPgNlHKxXLTuSMbaTtW4/edit?gid=20309811#gid=20309811" icon={ClipboardCheck} label="Bộ câu hỏi BGK mẫu" desc="Tham khảo trước buổi Demo Coding" color="amber" />
                        </div>

                        <Callout icon="💡" text="Đề xuất với Leader để có buổi duyệt giảng và đào tạo chuyên sâu — đây là bước cuối để đạt role Super Mentor." />
                    </Step>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 border-t border-white/10 pt-6">
                <p className="text-slate-500 text-xs text-center mb-3">Thông tin liên hệ Bộ phận Chuyên môn (Leader / Teacher Coordinator)</p>
                <div className="mx-auto grid max-w-md grid-cols-1 gap-2">
                    <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien" icon={BookOpen} label="📖 Quy chế & Nghiệp vụ" desc="Hệ thống văn bản hiện hành" color="blue" />
                </div>
            </div>

        </div>
    );
}
