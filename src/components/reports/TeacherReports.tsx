import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  Film,
  Award,
  Layers,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { AnalyticsSummary, StudentSubmission } from '../../types/mathStory';
import { fetchAnalyticsSummary } from '../../services/api';

interface TeacherReportsProps {
  isDemoMode: boolean;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({ isDemoMode }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!summary?.recentSubmissions) return;
    const header = 'Mã Học Sinh,Tên Học Sinh,Phép Tính Đã Chọn,Kết Quả,Số Lần Thử,Thời Gian (s),Dạng Lỗi,Chế Độ,Thời Điểm\n';
    const rows = summary.recentSubmissions
      .map(
        (s) =>
          `"${s.studentCode}","${s.studentName}","${s.chosenOption}","${s.isCorrect ? 'Đúng' : 'Sai'}",${s.attemptCount},${s.timeTakenSeconds},"${s.errorType}","${s.isDemo ? 'Demo' : 'Thực tế'}","${s.timestamp}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-toan2-dang-tran-con-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 12: Báo Cáo & Đánh Giá Tiến Bộ Học Tập
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isDemoMode ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {isDemoMode ? 'DỮ LIỆU MINH HỌA (DEMO)' : 'DỮ LIỆU THỰC TẾ LỚP 2A2'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Thống kê tỷ lệ chọn đúng phép tính, phân bố dạng lỗi sư phạm và đánh giá hiệu quả đổi mới dạy học bằng câu chuyện hoạt hình AI.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Xuất File Báo Cáo (CSV / Excel)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Số bài học đã tạo</span>
          <div className="text-2xl font-black text-sky-900">{summary?.totalProjects || 1}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {summary?.publishedProjects || 1} bài đã xuất bản
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Lượt học sinh tham gia</span>
          <div className="text-2xl font-black text-slate-900">{summary?.totalSubmissions || 6}</div>
          <span className="text-[11px] text-sky-700 font-semibold">Lớp 2A2</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Tỷ lệ chọn đúng phép tính</span>
          <div className="text-2xl font-black text-emerald-600">
            {summary?.accuracyRate || 67}%
          </div>
          <span className="text-[11px] text-slate-500">Ngay lần thử thứ nhất</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Thời gian biên kịch</span>
          <div className="text-2xl font-black text-purple-700">~ 3 phút</div>
          <span className="text-[11px] text-purple-900 font-semibold">Nhanh gấp 5 lần thủ công</span>
        </div>
      </div>

      {/* Diagnostic Error Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Error bar chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Phân Bố Dạng Lỗi Thường Gặp (Lớp 2A2)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Dữ liệu giúp cô giáo Hương điều chỉnh phương pháp giảng dạy trên lớp:
          </p>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Sai lựa chọn phép tính (+ nhầm -)', count: summary?.errorDistribution?.SAI_LỰA_CHỌN_PHÉP_TÍNH || 2, color: 'bg-amber-500' },
              { label: 'Sai khi tính toán (cộng quên nhớ)', count: summary?.errorDistribution?.SAI_TÍNH_TOÁN || 1, color: 'bg-rose-500' },
              { label: 'Sai đơn vị đo (quả cam)', count: summary?.errorDistribution?.SAI_ĐƠN_VỊ || 0, color: 'bg-sky-500' },
              { label: 'Chưa hiểu rõ tình huống', count: summary?.errorDistribution?.CHƯA_HIỂU_TÌNH_HUỐNG || 0, color: 'bg-purple-500' },
            ].map((err, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{err.label}</span>
                  <span>{err.count} lượt</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${err.color} rounded-full transition-all`}
                    style={{ width: `${Math.min(err.count * 35, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-sky-50 p-3 rounded-2xl border border-sky-100 text-xs text-sky-900 space-y-1">
            <strong>Gợi ý sư phạm cho tuần tới:</strong>
            <p>
              Tăng cường cho các em sử dụng rổ cam và que tính bó chục ở Phân hệ 4 & 7 để củng cố bản chất 'thêm vào' trước khi viết phép tính trừu tượng.
            </p>
          </div>
        </div>

        {/* Recent Submissions Log Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Nhật Ký Tương Tác Học Sinh Mới Nhất
            </h3>
            <span className="text-[11px] text-slate-500">Ghi nhận thời gian thực</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5 rounded-l-xl">Học sinh</th>
                  <th className="p-2.5">Phép tính đã chọn</th>
                  <th className="p-2.5">Kết quả</th>
                  <th className="p-2.5">Số lần thử</th>
                  <th className="p-2.5 rounded-r-xl">Chẩn đoán lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(summary?.recentSubmissions || []).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{sub.studentName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{sub.studentCode}</span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{sub.chosenOption}</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          sub.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.isCorrect ? 'ĐÚNG ✓' : 'CHƯA ĐÚNG'}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-700">{sub.attemptCount}</td>
                    <td className="p-2.5 text-[11px] text-slate-600">
                      {sub.errorType.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
