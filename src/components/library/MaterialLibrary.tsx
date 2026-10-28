import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Copy,
  Eye,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  User,
  School,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  FileText,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import { ProjectLesson } from '../../types/mathStory';

interface MaterialLibraryProps {
  projects: ProjectLesson[];
  activeProjectId: string;
  onSelectProject: (project: ProjectLesson) => void;
  onGoToInteractivePlayer: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const GRADE_TOPICS_MAP: Record<string, string[]> = {
  'Khối 1': [
    'Đếm, đọc, viết, so sánh số trong phạm vi 100',
    'Phép cộng không nhớ trong phạm vi 100',
    'Phép trừ không nhớ trong phạm vi 100',
    'Bài toán thực tế đơn giản có lời văn',
    'Đo độ dài (cm, gang tay)',
    'Thời gian: Ngày trong tuần, xem đồng hồ',
    'Hình học trực quan (Hình vuông, tròn, tam giác, chữ nhật)',
  ],
  'Khối 2': [
    'Phép cộng có nhớ trong phạm vi 100',
    'Phép trừ có nhớ trong phạm vi 100',
    'Bảng nhân 2 và Bảng nhân 5',
    'Bảng chia 2 và Bảng chia 5',
    'Bài toán có lời văn (Thêm vào - Bớt đi)',
    'Bài toán nhiều hơn - ít hơn',
    'Đo độ dài (cm, dm, m, km)',
    'Khối lượng và Dung tích (kg, lít)',
    'Thời gian, đồng hồ và lịch',
    'Tiền Việt Nam (đồng)',
    'Hình học trực quan (Điểm, đoạn thẳng, khối trụ, khối cầu)',
    'Tình huống Toán học trong đời sống',
  ],
  'Khối 3': [
    'Phép cộng, trừ các số có ba chữ số (có nhớ)',
    'Bảng nhân và Bảng chia từ 3 đến 9',
    'Bài toán giải bằng hai bước tính',
    'Gấp một số lên nhiều lần, giảm đi một số lần',
    'Đo lường (mm, g, ml, nhiệt độ)',
    'Chu vi và diện tích hình chữ nhật, hình vuông',
    'Góc vuông, góc không vuông',
    'Số La Mã và xem đồng hồ chính xác',
  ],
  'Khối 4': [
    'Phép cộng, trừ các số có nhiều chữ số',
    'Nhân, chia với số có hai chữ số',
    'Phân số và các phép tính với phân số',
    'Tìm số trung bình cộng, tổng và hiệu',
    'Hình bình hành, hình thoi',
    'Đo lường (tạ, tấn, yến, giây, thế kỷ)',
  ],
  'Khối 5': [
    'Phân số thập phân và Số thập phân',
    'Cộng, trừ, nhân, chia số thập phân',
    'Tỉ số phần trăm và ứng dụng',
    'Hình tam giác, hình thang, hình tròn',
    'Hình hộp chữ nhật, hình lập phương',
    'Toán chuyển động đều (Vận tốc, Quãng đường, Thời gian)',
  ],
};

export const MaterialLibrary: React.FC<MaterialLibraryProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onGoToInteractivePlayer,
  onDeleteProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [showWorksheetModal, setShowWorksheetModal] = useState<ProjectLesson | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectLesson | null>(null);
  const [shareCopied, setShareCopied] = useState<string | null>(null);

  const handleGradeFilterChange = (newGrade: string) => {
    setSelectedGradeFilter(newGrade);
    if (newGrade !== 'all') {
      const allowedTopics = GRADE_TOPICS_MAP[newGrade] || [];
      if (selectedTopic !== 'all' && !allowedTopics.includes(selectedTopic)) {
        setSelectedTopic('all');
      }
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.problemText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTopic =
      selectedTopic === 'all' ||
      (p.topic && (
        p.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        selectedTopic.toLowerCase().includes(p.topic.toLowerCase())
      ));

    const matchGrade =
      selectedGradeFilter === 'all' ||
      (p.grade && (
        p.grade.toLowerCase().includes(selectedGradeFilter.toLowerCase()) ||
        p.grade.replace('Lớp', 'Khối').toLowerCase().includes(selectedGradeFilter.toLowerCase()) ||
        p.grade.replace('Khối', 'Lớp').toLowerCase().includes(selectedGradeFilter.toLowerCase()) ||
        (selectedGradeFilter === 'Khối 1' && p.grade.includes('1')) ||
        (selectedGradeFilter === 'Khối 2' && p.grade.includes('2')) ||
        (selectedGradeFilter === 'Khối 3' && p.grade.includes('3')) ||
        (selectedGradeFilter === 'Khối 4' && p.grade.includes('4')) ||
        (selectedGradeFilter === 'Khối 5' && p.grade.includes('5'))
      )) ||
      (!p.grade && selectedGradeFilter === 'Khối 2');

    return matchSearch && matchTopic && matchGrade;
  });

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}?lesson=${id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(id);
    setTimeout(() => setShareCopied(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 9: Thư Viện Học Liệu &amp; Kho Dự Án Toán
            </h2>
            <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
              Lưu trữ trọn gói kịch bản, video &amp; phiếu bài tập
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Quản lý, tái sử dụng, chia sẻ liên trường và xuất phiếu học tập in ấn cho học sinh tiểu học theo từng chủ đề.
          </p>
        </div>

        <button
          onClick={onGoToInteractivePlayer}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Trải Nghiệm Học Liệu Tương Tác</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên bài, nội dung đề toán hoặc tác giả..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGradeFilter}
            onChange={(e) => handleGradeFilterChange(e.target.value)}
            className="w-full sm:w-44 text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="Khối 1">Khối 1</option>
            <option value="Khối 2">Khối 2</option>
            <option value="Khối 3">Khối 3</option>
            <option value="Khối 4">Khối 4</option>
            <option value="Khối 5">Khối 5</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full sm:w-64 text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
          >
            {selectedGradeFilter === 'all' ? (
              <>
                <option value="all">Tất cả chủ đề Toán</option>
                {Object.entries(GRADE_TOPICS_MAP).map(([gradeName, topics]) => (
                  <optgroup key={gradeName} label={`--- ${gradeName} ---`}>
                    {topics.map((t) => (
                      <option key={`${gradeName}-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            ) : (
              <>
                <option value="all">Tất cả chủ đề ({selectedGradeFilter})</option>
                {(GRADE_TOPICS_MAP[selectedGradeFilter] || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const isSelected = activeProjectId === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 ring-2 ring-sky-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header tags & Mã số bài toán */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        p.isSample
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {p.isSample ? 'BÀI MINH HỌA' : 'ĐÃ XUẤT BẢN'}
                    </span>
                    <span className="font-mono text-[10px] font-black text-sky-950 bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-300 shadow-2xs">
                      Mã số: {p.problemCode || p.mathAnalysis?.problemCode || (p.id === 'project-cam-sample' ? 'TOAN2-CAM01' : p.id.startsWith('project-') ? `TOAN${p.grade?.replace(/\D/g, '') || '2'}-${p.id.slice(-6).toUpperCase()}` : p.id.toUpperCase())}
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {p.moderationChecklist?.status.replace(/_/g, ' ') || 'ĐÃ DUYỆT'}
                  </span>
                </div>

                {/* Title & Topic & Grade */}
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{p.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-sky-700 font-bold">
                      {p.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-black text-amber-700">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {p.grade
                        ? (p.grade.startsWith('Khối') ? p.grade : p.grade.replace('Lớp', 'Khối'))
                        : 'Khối 2'}
                    </span>
                  </div>
                </div>

                {/* Problem snippet */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
                  "{p.problemText}"
                </div>

                {/* Calculation verification tag */}
                <div className="flex items-center justify-between text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-slate-600 font-bold">Phép tính:</span>
                  <span className="font-mono font-black text-amber-950">
                    {p.mathAnalysis?.calculation || '25 + 17 = 42'}
                  </span>
                </div>

                {/* Author & School metadata */}
                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Tác giả: <strong>{p.author}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <School className="w-3 h-3 text-slate-400" />
                    <span>{p.school}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onSelectProject(p);
                      onGoToInteractivePlayer();
                    }}
                    className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mở bài này</span>
                  </button>

                  <button
                    onClick={() => setShowWorksheetModal(p)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Phiếu in</span>
                  </button>
                </div>

                <button
                  onClick={() => handleShare(p.id)}
                  className="w-full py-1.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {shareCopied === p.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép link chia sẻ bài học!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia sẻ đường dẫn có phân quyền</span>
                    </>
                  )}
                </button>

                {/* Nút xóa bài toán (chỉ hiển thị nếu không phải bài demo) */}
                {!p.isSample && p.id !== 'project-cam-sample' && (
                  <button
                    onClick={() => setProjectToDelete(p)}
                    className="w-full py-1.5 rounded-xl text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa bài toán này</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Worksheet Modal */}
      {showWorksheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-sky-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Phiếu Học Tập Tương Tác & Bài Tập In (Worksheet)
                </h3>
              </div>
              <button
                onClick={() => setShowWorksheetModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Printable Paper Preview */}
            <div className="bg-white p-6 border-2 border-slate-300 rounded-2xl shadow-inner space-y-4 text-slate-900 font-serif">
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  TRƯỜNG TIỂU HỌC ĐẶNG TRẦN CÔN
                </h4>
                <h3 className="text-base font-black uppercase">
                  PHIẾU BÀI TẬP TOÁN: {showWorksheetModal.title}
                </h3>
                <p className="text-xs italic">
                  Chủ đề: {showWorksheetModal.topic} | Mã số bài toán: {showWorksheetModal.problemCode || showWorksheetModal.mathAnalysis?.problemCode || (showWorksheetModal.id === 'project-cam-sample' ? 'TOAN2-CAM01' : showWorksheetModal.id)}
                </p>
                <div className="flex justify-between text-xs pt-2 font-sans">
                  <span>Họ và tên học sinh: .................................................</span>
                  <span>Điểm: ...........</span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <strong>Bài toán:</strong> {showWorksheetModal.problemText}
                </div>

                <div className="border border-slate-300 p-4 rounded-xl min-h-[120px] space-y-2">
                  <div className="text-center font-bold">BÀI GIẢI</div>
                  <div className="text-slate-400 italic">
                    (Học sinh viết câu lời giải, phép tính và đáp số vào các dòng bên dưới)
                  </div>
                  <div className="border-b border-dotted border-slate-300 pt-5"></div>
                  <div className="border-b border-dotted border-slate-300 pt-5"></div>
                  <div className="border-b border-dotted border-slate-300 pt-5"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWorksheetModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Bài Tập</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa bài toán */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">Xác nhận xóa bài toán?</h3>
                <p className="text-xs text-slate-500">Bài toán sẽ được xóa khỏi Thư viện học liệu (Không thể hoàn tác).</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-950 space-y-1">
              <p className="font-black text-slate-900">Tiêu đề: {projectToDelete.title}</p>
              <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{projectToDelete.problemText}"</p>
              <div className="pt-1 flex items-center gap-2 text-[10px] font-bold text-rose-700">
                <span>Khối lớp: {projectToDelete.grade}</span>
                <span>•</span>
                <span>Tác giả: {projectToDelete.author}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteProject?.(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
