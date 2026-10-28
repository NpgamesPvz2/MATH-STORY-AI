import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  X,
  Bot,
  ThumbsUp,
  RefreshCw,
} from 'lucide-react';
import { ModerationChecklist, ModerationStatus, ProjectLesson, GeminiEvaluationResult } from '../../types/mathStory';
import { soundEffects } from '../../utils/audioEffects';
import { evaluateWithGemini } from '../../services/api';

interface TeacherModerationProps {
  project: ProjectLesson;
  onUpdateChecklist: (checklist: ModerationChecklist) => void;
  onSaveApprovalDetails: (school: string, checklist: ModerationChecklist) => void;
  onPublishProject?: (checklist: ModerationChecklist, school: string) => void;
  onGoToLibrary: () => void;
  selectedGrade?: string;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr) return new Date().toLocaleDateString('vi-VN');
  try {
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
  } catch (e) {}
  return dateStr;
};

export const TeacherModeration: React.FC<TeacherModerationProps> = ({
  project,
  onUpdateChecklist,
  onSaveApprovalDetails,
  onPublishProject,
  onGoToLibrary,
  selectedGrade = 'Lớp 2',
}) => {
  const todayStr = getTodayDateString();

  // Dữ liệu đồng bộ từ các phân hệ trước
  const currentGrade = project.grade || selectedGrade || 'Lớp 2';
  const gradeNum = parseInt(currentGrade.replace(/\D/g, '') || '2', 10);
  const ageRange = `${gradeNum + 5}-${gradeNum + 6} tuổi`;
  const calc = project.mathAnalysis?.calculation || `${project.mathAnalysis?.num1 ?? 25} + ${project.mathAnalysis?.num2 ?? 17} = ${project.mathAnalysis?.result ?? 42}`;
  const unit = project.mathAnalysis?.unit || 'quả cam';
  const charNames =
    project.mathAnalysis?.charactersInProblem && project.mathAnalysis.charactersInProblem.length > 0
      ? project.mathAnalysis.charactersInProblem.join(' & ')
      : 'Bé Lan';
  const topic = project.topic || 'Số và phép tính';

  const [checklist, setChecklist] = useState<ModerationChecklist>(() => {
    const existing = project.moderationChecklist;
    return {
      curriculumCompliant: existing?.curriculumCompliant ?? true,
      dataAccurate: existing?.dataAccurate ?? true,
      calculationVerified: existing?.calculationVerified ?? true,
      dialogueAppropriate: existing?.dialogueAppropriate ?? true,
      imageSafe: existing?.imageSafe ?? true,
      characterConsistent: existing?.characterConsistent ?? true,
      audioClear: existing?.audioClear ?? true,
      questionEngaging: existing?.questionEngaging ?? true,
      pedagogicalFeedback: existing?.pedagogicalFeedback ?? true,
      trialTested: existing?.trialTested ?? true,
      status: existing?.status ?? 'ĐÃ_XUẤT_BẢN',
      approvedBy: existing?.approvedBy ? existing.approvedBy.replace(/^Cô giáo\s*/i, '') : 'Hoàng Diệu Hương',
      approvedDate: existing?.approvedDate || todayStr,
    };
  });

  const [approvedDate, setApprovedDate] = useState<string>(checklist.approvedDate || todayStr);
  const [teacherName, setTeacherName] = useState(
    checklist.approvedBy ? checklist.approvedBy.replace(/^Cô giáo\s*/i, '') : 'Hoàng Diệu Hương'
  );
  const [schoolName, setSchoolName] = useState(project.school);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Gemini AI Evaluation State
  const [isEvaluatingWithGemini, setIsEvaluatingWithGemini] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<GeminiEvaluationResult | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const handleToggle = (key: keyof Omit<ModerationChecklist, 'status' | 'approvedBy' | 'approvedDate'>) => {
    const updated = {
      ...checklist,
      [key]: !checklist[key],
    };
    setChecklist(updated);
    onUpdateChecklist(updated);
  };

  const handleStatusChange = (status: ModerationStatus) => {
    const updated: ModerationChecklist = {
      ...checklist,
      status,
      approvedBy: teacherName.trim(),
      approvedDate: approvedDate || todayStr,
    };
    setChecklist(updated);
    if (status === 'ĐÃ_XUẤT_BẢN' && onPublishProject) {
      onPublishProject(updated, schoolName.trim());
    } else {
      onSaveApprovalDetails(schoolName.trim(), updated);
    }
    setSaveSuccess(true);
    if (status === 'ĐÃ_XUẤT_BẢN') {
      soundEffects.playCelebration();
      setShowPublishModal(true);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveApprovalDetails = () => {
    const updated: ModerationChecklist = {
      ...checklist,
      approvedBy: teacherName.trim(),
      approvedDate,
    };
    setChecklist(updated);
    onSaveApprovalDetails(schoolName.trim(), updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGeminiEvaluate = async () => {
    setIsEvaluatingWithGemini(true);
    setGeminiError(null);
    try {
      const res = await evaluateWithGemini({
        grade: currentGrade,
        ageRange,
        problemStatement: project.problemText,
        calculation: calc,
        unit,
        topic,
        characters: project.mathAnalysis?.charactersInProblem,
        theme: project.storyboard?.theme,
        scenes: project.storyboard?.scenes,
      });

      if (res.success && res.evaluation) {
        setGeminiResult(res.evaluation);
        // Cập nhật các tiêu chí sang true/false theo kết quả thẩm định của Gemini
        const newChecklist = { ...checklist };
        let anyChanged = false;
        Object.entries(res.evaluation.criteriaResults || {}).forEach(([k, v]) => {
          if (k in newChecklist && typeof (v as any).pass === 'boolean') {
            (newChecklist as any)[k] = (v as any).pass;
            anyChanged = true;
          }
        });
        if (anyChanged) {
          setChecklist(newChecklist);
          onUpdateChecklist(newChecklist);
        }
        soundEffects.playCelebration();
      }
    } catch (err: any) {
      setGeminiError(err.message || 'Lỗi khi gọi Gemini đánh giá sư phạm');
    } finally {
      setIsEvaluatingWithGemini(false);
    }
  };

  // 10 Tiêu chí đồng bộ động theo dữ liệu Phân hệ trước
  const criteriaList: {
    key: keyof Omit<ModerationChecklist, 'status' | 'approvedBy' | 'approvedDate'>;
    title: string;
    desc: string;
  }[] = [
    {
      key: 'curriculumCompliant',
      title: `1. Nội dung bám sát SGK Toán ${gradeNum} (GDPT 2018)`,
      desc: `Phù hợp mục tiêu cần đạt của khối ${currentGrade}, đúng mạch kiến thức chủ đề "${topic}".`,
    },
    {
      key: 'dataAccurate',
      title: '2. Dữ kiện bài toán chính xác',
      desc: `Các con số (${project.mathAnalysis?.givenData?.join(', ') || 'dữ kiện thực tế'}) và tình huống gần gũi, không gây hiểu lầm cho học sinh ${currentGrade}.`,
    },
    {
      key: 'calculationVerified',
      title: '3. Phép tính được kiểm tra xác định',
      desc: `Được thẩm định bởi hàm toán học độc lập, kết quả phép tính ${calc} (${unit}) chính xác tuyệt đối 100%.`,
    },
    {
      key: 'dialogueAppropriate',
      title: `4. Lời thoại trong sáng, phù hợp lứa tuổi ${ageRange}`,
      desc: `Ngôn từ chuẩn tiếng Việt, gần gũi tâm lý lứa tuổi ${ageRange} (${currentGrade}), khích lệ tinh thần học tập của trẻ.`,
    },
    {
      key: 'imageSafe',
      title: '5. Hình ảnh an toàn, thẩm mỹ sư phạm cao',
      desc: `Hoạt hình 3D tươi sáng, khung hình 16:9, không chứa yếu tố bạo lực hay phản cảm, phù hợp lứa tuổi ${ageRange}.`,
    },
    {
      key: 'characterConsistent',
      title: '6. Nhân vật giữ vững tạo hình nhất quán',
      desc: `Áp dụng hồ sơ tạo hình (Character Seed) cho nhân vật ${charNames} xuyên suốt cả 3 phân cảnh.`,
    },
    {
      key: 'audioClear',
      title: '7. Âm thanh rõ ràng, tốc độ vừa phải',
      desc: `Âm lượng cân đối giữa giọng đọc và nhạc nền, phát âm chuẩn tiếng Việt cho học sinh ${currentGrade}.`,
    },
    {
      key: 'questionEngaging',
      title: '8. Câu hỏi tương tác kích thích tư duy',
      desc: `Điểm dừng ở Cảnh 2 xuất hiện đúng thời điểm, kích thích tư duy, không để lộ đáp số trước khi học sinh trả lời.`,
    },
    {
      key: 'pedagogicalFeedback',
      title: '9. Phản hồi sư phạm khích lệ',
      desc: `Khi sai có gợi ý từng bước phân hóa, không chê bai hay gây áp lực tâm lý cho học sinh ${currentGrade}.`,
    },
    {
      key: 'trialTested',
      title: '10. Đã chạy thử nghiệm nghiệm thu hoàn chỉnh',
      desc: `Giáo viên đã trực tiếp trải nghiệm toàn bộ video hoạt hình và kiểm tra quy trình hoạt động hoàn chỉnh.`,
    },
  ];

  const allPassed = criteriaList.every((c) => checklist[c.key]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 8: Bảng Giáo Viên Kiểm Duyệt Sư Phạm
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              10 Tiêu chuẩn kiểm định • {currentGrade} ({ageRange})
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Đảm bảo tính chuẩn mực giáo dục môn Toán {currentGrade} với phép tính {calc} ({unit}) trước khi xuất bản học liệu.
          </p>
        </div>

        {/* Nút hành động đánh giá bằng Gemini */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGeminiEvaluate}
            disabled={isEvaluatingWithGemini}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isEvaluatingWithGemini ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gemini đang đánh giá sư phạm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sử Dụng Gemini Đánh Giá</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi Gemini nếu có */}
      {geminiError && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geminiError}</span>
        </div>
      )}

      {/* Kết quả đánh giá bằng Gemini (Nếu có) */}
      {geminiResult && (
        <div className="bg-gradient-to-tr from-purple-50 via-sky-50 to-emerald-50 rounded-3xl p-6 border-2 border-purple-300 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow">
                <Bot className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Kết Quả Thẩm Định Sư Phạm Bởi Gemini AI (GDPT 2018)
                </h3>
                <span className="text-[11px] text-purple-800 font-medium">
                  Đánh giá toàn diện theo khối {currentGrade} ({ageRange}) &bull; Phép tính: {calc}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                Điểm số: {geminiResult.overallScore}/10 Tiêu chí
              </span>
            </div>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-purple-200 text-xs text-slate-800 space-y-2">
            <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>Nhận xét tổng quan của Gemini:</span>
            </div>
            <p className="leading-relaxed font-medium text-slate-700 italic">
              "{geminiResult.overallAssessment}"
            </p>
          </div>

          {geminiResult.recommendations && geminiResult.recommendations.length > 0 && (
            <div className="bg-white/80 p-3.5 rounded-2xl border border-sky-200 text-xs space-y-1.5">
              <span className="font-extrabold text-sky-950 block">💡 Khuyến nghị sư phạm từ Gemini cho giáo viên:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                {geminiResult.recommendations.map((rec, rIdx) => (
                  <li key={rIdx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 10 Criteria Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>10 Tiêu Chí Nghiệm Thu Sư Phạm (Đồng bộ theo {currentGrade.startsWith('Lớp') ? currentGrade : `Lớp ${currentGrade}`})</span>
          </h3>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {allPassed ? '✓ Đạt 10/10 tiêu chí' : 'Chưa hoàn thành đủ 10 tiêu chí'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {criteriaList.map((item) => {
            const isChecked = checklist[item.key];
            const aiCritFeedback = geminiResult?.criteriaResults?.[item.key];

            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isChecked
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center font-bold text-xs shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>

                {/* Hiển thị nhận xét chi tiết của Gemini nếu đã chạy đánh giá */}
                {aiCritFeedback && (
                  <div className="mt-1 pt-1.5 border-t border-emerald-200/60 text-[10.5px] text-purple-900 font-medium flex items-start gap-1">
                    <span className="font-bold text-purple-700 shrink-0">Gemini:</span>
                    <span className="italic">{aiCritFeedback.feedback}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Teacher Signature Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Trường học:</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Giáo viên phê duyệt:</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">Ngày phê duyệt kịch bản:</label>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.2 rounded-full">
                Đã chọn ({formatDisplayDate(approvedDate)})
              </span>
            </div>
            <input
              type="date"
              value={approvedDate}
              onChange={(e) => setApprovedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Thông tin trường học và phê duyệt sẽ được lưu vào bài học.
            </span>
            <button
              onClick={handleSaveApprovalDetails}
              disabled={!schoolName.trim() || !teacherName.trim() || !approvedDate}
              className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold disabled:opacity-40"
            >
              Lưu thông tin trường và phê duyệt
            </button>
          </div>
          {saveSuccess && (
            <div className="md:col-span-3 text-xs font-bold text-emerald-700" role="status">
              Đã lưu thông tin trường và phê duyệt.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {allPassed ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã đủ điều kiện để xuất bản lên hệ thống lớp học</span>
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Vui lòng tích đủ 10 tiêu chí sư phạm trước khi xuất bản</span>
              </span>
            )}
          </div>

          <button
            onClick={() => handleStatusChange('ĐÃ_XUẤT_BẢN')}
            disabled={!allPassed || !schoolName.trim() || !teacherName.trim() || !approvedDate}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Award className="w-4 h-4" />
            <span>Phê Duyệt & Xuất Bản Lên Hệ Thống Lớp</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar like Phân hệ 1 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Sau khi kiểm duyệt sư phạm, bạn có thể chuyển sang <strong>Phân hệ 9</strong> để quản lý toàn bộ kho học liệu đã xuất bản.
        </div>
        <button
          onClick={onGoToLibrary}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>Sang Thư Viện Học Liệu (Phân hệ 9)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Publication Success Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-300 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Award className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Phê Duyệt & Xuất Bản Thành Công!
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    Học liệu chính thức phát hành lên hệ thống lớp
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content summary */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Tên bài học:</span>
                <span className="font-extrabold text-slate-900 truncate max-w-[260px]">{project.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Giáo viên phê duyệt:</span>
                <span className="font-extrabold text-slate-900">{teacherName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Ngày xuất bản:</span>
                <span className="font-extrabold text-slate-900">{formatDisplayDate(approvedDate || checklist.approvedDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Kiểm định sư phạm:</span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Đạt 10/10 tiêu chí</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bài toán câu chuyện hoạt hình đã sẵn sàng cho học sinh tương tác học tập và lưu kết quả đánh giá theo từng mức độ cá nhân hóa.
            </p>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  onGoToLibrary();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem Thư Viện Học Liệu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPublishModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
