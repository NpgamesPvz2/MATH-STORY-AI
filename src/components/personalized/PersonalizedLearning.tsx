import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ErrorType, ProjectLesson } from '../../types/mathStory';
import { BaseTenBlocksVisual, OrangeCounterVisual } from '../common/DeterministicVisuals';

interface PersonalizedLearningProps {
  project: ProjectLesson;
  onGoToModeration: () => void;
}

export const PersonalizedLearning: React.FC<PersonalizedLearningProps> = ({
  project,
  onGoToModeration,
}) => {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);
  const [tier1Answer, setTier1Answer] = useState<string | null>(null);
  const [tier2Answer, setTier2Answer] = useState<string>('');
  const [tier3Answer, setTier3Answer] = useState<string | null>(null);
  const [diagnosedError, setDiagnosedError] = useState<ErrorType | null>(null);

  const num1 = project.mathAnalysis?.num1 ?? 25;
  const num2 = project.mathAnalysis?.num2 ?? 17;
  const op = project.mathAnalysis?.operation || 'CỘNG';
  const unit = project.mathAnalysis?.unit || 'quả cam';
  const result = project.mathAnalysis?.result ?? 42;
  const calc = project.mathAnalysis?.calculation || `${num1} + ${num2} = ${result}`;
  const charName = project.storyboard?.scenes?.[0]?.characters?.[0] || 'Bé Lan';

  // Handle Tier 1
  const handleTier1Submit = (choice: string) => {
    setTier1Answer(choice);
    if (choice === 'correct') {
      setDiagnosedError('KHÔNG_CÓ');
    } else {
      setDiagnosedError('SAI_LỰA_CHỌN_PHÉP_TÍNH');
    }
  };

  // Handle Tier 2 (Word problem full solution)
  const handleTier2Check = () => {
    const text = tier2Answer.trim().toLowerCase();
    if (!text) return;
    const resStr = String(result);
    if (text.includes(resStr)) {
      setDiagnosedError('KHÔNG_CÓ');
    } else {
      setDiagnosedError('SAI_TÍNH_TOÁN');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 7: Cá Nhân Hóa Học Tập Theo 3 Mức Độ
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
              Khung CT GDPT 2018
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống phân hóa bài tập thích ứng: Củng cố (Mức 1), Vận dụng (Mức 2) và Mở rộng sáng tạo (Mức 3). Chẩn đoán lỗi sai sư phạm và đề xuất hỗ trợ kịp thời.
          </p>
        </div>
      </div>

      {/* 3 Tier Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTier(1)}
          className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            activeTier === 1
              ? 'bg-sky-50 border-sky-500 shadow-sm ring-2 ring-sky-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-200 text-sky-800">
              Mức 1
            </span>
            <span className="text-xs text-slate-400 font-bold">Củng Cố</span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">Nhận Biết & Phép Tính Cơ Bản</h3>
          <p className="text-xs text-slate-500 mt-1">
            Nhận diện dữ kiện 'thêm vào', tính nhẩm phép cộng có nhớ trong phạm vi 100.
          </p>
        </button>

        <button
          onClick={() => setActiveTier(2)}
          className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            activeTier === 2
              ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-800">
              Mức 2
            </span>
            <span className="text-xs text-slate-400 font-bold">Vận Dụng</span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">Giải Bài Toán Có Lời Văn</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tự viết câu lời giải, thiết lập phép tính và ghi rõ danh số kèm kiểm tra đáp số.
          </p>
        </button>

        <button
          onClick={() => setActiveTier(3)}
          className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            activeTier === 3
              ? 'bg-purple-50 border-purple-500 shadow-sm ring-2 ring-purple-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-200 text-purple-800">
              Mức 3
            </span>
            <span className="text-xs text-slate-400 font-bold">Mở Rộng</span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">Sáng Tạo & Tình Huống Thực Tế</h3>
          <p className="text-xs text-slate-500 mt-1">
            Thay đổi số liệu, đặt đề bài toán tương tự và so sánh các cách tính nhanh.
          </p>
        </button>
      </div>

      {/* Tier Content Area */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        {activeTier === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Mức 1 – Củng cố: Nhận biết từ khóa và phép tính</span>
              </h3>
              <span className="text-xs text-sky-700 bg-sky-50 px-3 py-1 rounded-full font-bold">
                Mục tiêu: Đạt chuẩn kiến thức nền tảng
              </span>
            </div>

            <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-3">
              <p className="text-xs font-extrabold text-slate-800">
                Câu hỏi: Trong bài toán "{project.problemText || `Có ${num1} và ${num2} ${unit}`}", để tìm kết quả em chọn phép tính nào?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'correct', label: `Thực hiện phép tính đúng: ${calc.split('=')[0].trim()}` },
                  { key: 'wrong', label: `Thực hiện phép tính khác: ${num1} ${op.includes('TRỪ') ? '+' : '-'} ${num2}` },
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleTier1Submit(opt.key)}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      tier1Answer === opt.key
                        ? opt.key === 'correct'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Rèn luyện kỹ năng thực hiện phép tính:</h4>
              <p className="text-xs text-slate-600">
                Thực hiện phép tính: <span className="font-mono font-black text-sky-800">{calc}</span> ({unit}).
              </p>
            </div>
          </div>
        )}

        {activeTier === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Mức 2 – Vận dụng: Trình bày bài giải hoàn chỉnh</span>
              </h3>
              <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full font-bold">
                Mục tiêu: Kỹ năng diễn đạt & giải toán có lời văn
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700">
                Hãy viết câu lời giải, phép tính và đáp số cho bài toán của {charName} vào ô bên dưới:
              </p>
              <textarea
                value={tier2Answer}
                onChange={(e) => setTier2Answer(e.target.value)}
                placeholder={`Bài giải:\n${charName} có số ${unit} là:\n${calc} (${unit})\nĐáp số: ${result} ${unit}.`}
                rows={4}
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 font-mono bg-slate-50"
              />
              <button
                onClick={handleTier2Check}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow cursor-pointer"
              >
                Kiểm tra bài giải
              </button>
            </div>
          </div>
        )}

        {activeTier === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Mức 3 – Mở rộng: Sáng tạo bài toán & Đổi mới dữ kiện</span>
              </h3>
              <span className="text-xs text-purple-800 bg-purple-50 px-3 py-1 rounded-full font-bold">
                Mục tiêu: Phát triển tư duy toán học nâng cao
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-2">
                <h4 className="font-extrabold text-purple-950">Thử thách 3.1: Đổi dữ kiện số lớn hơn</h4>
                <p className="text-slate-700 leading-relaxed">
                  "Nếu mẹ cho Lan thêm 28 quả cam thay vì 17 quả, hỏi Lan có tất cả bao nhiêu quả?"
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-purple-200 font-mono font-bold text-purple-900">
                  Phép tính: 25 + 28 = 53 (quả cam)
                </div>
              </div>

              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 space-y-2">
                <h4 className="font-extrabold text-teal-950">Thử thách 3.2: Đổi sang bài toán thực tế về Tiền hoặc Khối lượng</h4>
                <p className="text-slate-700 leading-relaxed">
                  "Bé Lan có 25 nghìn đồng, mẹ cho Lan thêm 17 nghìn đồng để mua bút chì và vở viết. Hỏi Lan có tất cả bao nhiêu nghìn đồng?"
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-teal-200 font-mono font-bold text-teal-900">
                  Phép tính: 25 + 17 = 42 (nghìn đồng)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Error Analysis & Smart Pedagogical Recommendation */}
        {diagnosedError && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Chẩn đoán sư phạm & Đề xuất thích ứng từ hệ thống:</span>
            </h4>

            {diagnosedError === 'KHÔNG_CÓ' ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Kết quả xuất sắc:</strong> Học sinh nắm vững dữ kiện, lựa chọn chính xác phép cộng và thực hiện phép tính có nhớ thành thạo. Sẵn sàng cho thử thách Mức 3.
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Dạng lỗi phát hiện: {diagnosedError}</span>
                </div>
                <p className="text-slate-700">
                  {diagnosedError === 'SAI_LỰA_CHỌN_PHÉP_TÍNH' &&
                    'Học sinh có xu hướng nhìn lướt chưa phân tích kỹ từ khóa "cho thêm". Đề xuất: Cho học sinh thao tác với rổ cam trực quan để thấy số lượng tăng lên.'}
                  {diagnosedError === 'SAI_TÍNH_TOÁN' &&
                    'Học sinh bị lỗi quên nhớ ở hàng chục (5 + 7 = 12 viết 2 nhưng quên nhớ 1 vào 2 + 1). Đề xuất: Sử dụng mô hình thanh 10 que tính.'}
                  {diagnosedError === 'SAI_ĐƠN_VỊ' &&
                    'Học sinh quên ghi đơn vị "quả cam" ở phép tính hoặc câu trả lời. Đề xuất nhắc nhở danh số.'}
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-600 italic">
                  * Hệ thống không dán nhãn năng lực cố định cho trẻ mà cung cấp bài tập tương thích để tiến bộ qua từng lần rèn luyện.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar like Phân hệ 1 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Đã hoàn thành các mức độ cá nhân hóa. Chuyển sang <strong>Phân hệ 8</strong> để giáo viên thực hiện kiểm duyệt 10 tiêu chí sư phạm.
        </div>
        <button
          onClick={onGoToModeration}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>Sang Bảng Giáo Viên Kiểm Duyệt (Phân hệ 8)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
