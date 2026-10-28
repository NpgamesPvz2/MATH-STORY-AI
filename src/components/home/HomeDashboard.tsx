import React from 'react';
import {
  Sparkles,
  BookOpen,
  Film,
  Users,
  Mic,
  Gamepad2,
  CheckCircle2,
  BarChart3,
  Video,
  Layers,
  ArrowRight,
  ShieldCheck,
  School,
  Play,
  Award,
} from 'lucide-react';
import { ActiveTab } from '../common/Header';
import { ProjectLesson } from '../../types/mathStory';

interface HomeDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  sampleProject: ProjectLesson;
  onOpenSampleProject?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  sampleProject,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner with 3D Educational Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-teal-600 to-amber-500 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase">
              Sáng Kiến Giáo Dục Ứng Dụng AI Năm 2026
            </span>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-xs font-black">
              Tiểu Học Đặng Trần Côn
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            MATH STORY AI
          </h1>
          <p className="text-lg md:text-xl font-extrabold text-amber-200">
            XƯỞNG SÁNG TẠO CÂU CHUYỆN TOÁN HỌC BẰNG TRÍ TUỆ NHÂN TẠO
          </p>

          <p className="text-sm md:text-base text-sky-100 italic leading-relaxed bg-black/20 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10">
            "Một bài toán – Một câu chuyện – Một thử thách tư duy – Một hành trình tiến bộ."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('analysis')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-800 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Bắt Đầu: Phân Tích Bài Toán Mới (Phân hệ 1)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Sample Lesson Card */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-3xl shadow-md shrink-0">
            🍊
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                BÀI TOÁN TIÊU BIỂU (1 NHÂN VẬT)
              </span>
              <span className="text-xs text-amber-800 font-bold">Bé Lan</span>
            </div>
            <h3 className="text-lg font-black text-amber-950">
              Bài toán những quả cam (Phép cộng có nhớ: 25 + 17 = 42 quả cam)
            </h3>
            <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
              "Lan có 25 quả cam. Lan được tặng thêm 17 quả cam. Hỏi Lan có tất cả bao nhiêu quả cam?"
              Đã xác định 1 nhân vật, mô hình toán học phù hợp và kịch bản 3 cảnh phong cách Hoạt hình 3D dễ thương (16:9).
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('analysis')}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Vào Phân Tích Bài Toán Này</span>
        </button>
      </div>

      {/* Re-indexed Subsystems (Phân hệ 1 to 9) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">
            Quy Trình 9 Phân Hệ Sáng Tạo Câu Chuyện Toán Học
          </h2>
          <span className="text-xs text-slate-500">Chuẩn sư phạm GDPT 2018 &bull; Tỉ lệ 16:9 &bull; Prompt tiếng Việt</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Phân hệ 1 */}
          <div
            onClick={() => onNavigate('analysis')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📐
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                Phân Hệ 1: Phân Tích Cấu Trúc Bài Toán
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Xác định nhân vật trong đề bài, dữ kiện và phép tính. Tạo mô hình toán học phù hợp (Cộng, Trừ, Nhân, Chia). Giới hạn tối đa 2 nhân vật.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
              <span>Bắt đầu quy trình</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 2 */}
          <div
            onClick={() => onNavigate('storyboard')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🎬
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                Phân Hệ 2: Biên Kịch Storyboard AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kế thừa nhân vật từ Phân hệ 1, chọn Phong cảnh, tạo kịch bản 3 cảnh và có nút tạo lại toàn bộ Prompt tiếng Việt theo phong cảnh mới.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Biên kịch 3 cảnh</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 3 */}
          <div
            onClick={() => onNavigate('characters')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-teal-600 transition-colors">
                Phân Hệ 3: Nhân Vật &amp; Hồ Sơ Tạo Sinh 3D
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chỉ hiển thị các nhân vật liên quan từ Phân hệ 1 cùng các mô tả ngoại hình, trang phục 3D dễ thương được AI tạo sinh.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span>Hồ sơ nhân vật</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 4 (MỚI) */}
          <div
            onClick={() => onNavigate('reviewScript')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                Phân Hệ 4: Xem Lại Kịch Bản &amp; Prompt
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tổng hợp toàn bộ Prompt từ Phân hệ 1, 2, 3 bằng 100% tiếng Việt (16:9). Kiểm tra chặn kịch bản nếu có nhiều hơn 2 nhân vật.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Phân hệ mới</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 5 */}
          <div
            onClick={() => onNavigate('audio')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-pink-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-pink-600 transition-colors">
                Phân Hệ 5: Tạo Giọng Đọc AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chuyên biệt tạo giọng đọc AI sư phạm cho từng cảnh, tinh gọn và tối ưu hóa theo đúng chuẩn tiếng Việt thiếu nhi.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-600">
              <span>Giọng nói AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 6 */}
          <div
            onClick={() => onNavigate('interactive')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🎬
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                Phân Hệ 6: Tạo Video &amp; Âm Thanh Hoàn Chỉnh
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lấy Prompt từ Phân hệ 4 để tạo video và âm thanh từ Phân hệ 5. Sau khi tạo xong mới phát toàn bộ video kết hợp tương tác.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Trọng tâm video</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 7 */}
          <div
            onClick={() => onNavigate('personalized')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🌟
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                Phân Hệ 7: Cá Nhân Hóa 3 Mức Độ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rèn luyện kiến thức toán học thích ứng: Củng cố (Mức 1), Vận dụng (Mức 2) và Mở rộng sáng tạo (Mức 3).
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Học tập thích ứng</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 8 */}
          <div
            onClick={() => onNavigate('moderation')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                Phân Hệ 8: Giáo Viên Kiểm Duyệt Sư Phạm
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nghiệm thu 10 tiêu chí sư phạm nghiêm ngặt, cập nhật ngày phê duyệt hôm nay và xuất bản bài học.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
              <span>10 tiêu chí</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Phân hệ 9 */}
          <div
            onClick={() => onNavigate('library')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-teal-600 transition-colors">
                Phân Hệ 9: Thư Viện Học Liệu &amp; Phiếu In
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kho bài học lưu trữ đề bài, kịch bản, phiếu học tập in ấn (Worksheet) và đường link chia sẻ có phân quyền.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span>Thư viện &amp; Phiếu bài</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Author & Solution Credentials Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tác giả giải pháp</span>
          <h4 className="text-base font-black text-amber-400">HOÀNG DIỆU HƯƠNG</h4>
          <p className="text-slate-300">Giáo viên chủ nhiệm tiểu học</p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Đơn vị công tác</span>
          <h4 className="text-base font-black text-white">TRƯỜNG TIỂU HỌC ĐẶNG TRẦN CÔN</h4>
          <p className="text-slate-300">Năm thực hiện: 2026</p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mục tiêu giải pháp</span>
          <h4 className="text-base font-black text-emerald-400">Đổi Mới Dạy Toán Tiểu Học</h4>
          <p className="text-slate-300">Chuyển hóa bài toán khô khan thành câu chuyện hoạt hình 3D dễ thương</p>
        </div>
      </div>
    </div>
  );
};
