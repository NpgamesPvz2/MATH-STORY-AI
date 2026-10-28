import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Key,
  UserCheck,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface StudentItem {
  id: string;
  code: string;
  name: string;
  classId: string;
  status: 'Đang hoạt động' | 'Chưa kích hoạt';
  completedLessons: number;
}

interface StudentManagementProps {
  isDemoMode: boolean;
  onToggleDemoMode: (isDemo: boolean) => void;
  onSelectStudentForInteraction: (studentCode: string, studentName: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  isDemoMode,
  onToggleDemoMode,
  onSelectStudentForInteraction,
}) => {
  const [realPinRequired, setRealPinRequired] = useState(false);
  const [schoolApproved, setSchoolApproved] = useState(false);

  // Demo simulated students for competition/showcase
  const demoStudents: StudentItem[] = [
    { id: 'hs-1', code: 'HS-2A2-01', name: 'Trần Minh Anh', classId: '2A2', status: 'Đang hoạt động', completedLessons: 4 },
    { id: 'hs-2', code: 'HS-2A2-02', name: 'Nguyễn Bảo Nam', classId: '2A2', status: 'Đang hoạt động', completedLessons: 3 },
    { id: 'hs-3', code: 'HS-2A2-03', name: 'Lê Linh Đan', classId: '2A2', status: 'Đang hoạt động', completedLessons: 5 },
    { id: 'hs-4', code: 'HS-2A2-04', name: 'Vũ Đức Khang', classId: '2A2', status: 'Đang hoạt động', completedLessons: 3 },
    { id: 'hs-5', code: 'HS-2A2-05', name: 'Phạm Tuệ Mẫn', classId: '2A2', status: 'Đang hoạt động', completedLessons: 4 },
    { id: 'hs-6', code: 'HS-2A2-06', name: 'Hoàng Quang Huy', classId: '2A2', status: 'Đang hoạt động', completedLessons: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-teal-100 text-teal-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 11: Quản Lý Học Sinh & Bảo Mật Quyền Riêng Tư
            </h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
              Lớp 2A2 — TH Đặng Trần Côn
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tách biệt rõ rệt giữa Chế độ Trình diễn (Demo dự thi) và Chế độ Triển khai thực tế theo tiêu chuẩn an toàn dữ liệu trẻ em.
          </p>
        </div>

        {/* Mode switcher banner */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => onToggleDemoMode(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDemoMode
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌟 Chế độ Trình diễn (Demo)
          </button>
          <button
            onClick={() => onToggleDemoMode(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isDemoMode
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏫 Chế độ Triển khai thực tế
          </button>
        </div>
      </div>

      {/* Mode Details Box */}
      {isDemoMode ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Đang ở Chế độ Trình diễn (Demo Mode)</span>
          </div>
          <p className="leading-relaxed">
            Sử dụng danh sách học sinh giả lập của lớp 2A2 để thuyết trình, minh họa cuộc thi Đổi mới Sáng tạo Giáo dục năm 2026. Mọi thao tác trả lời câu hỏi và thống kê điểm số không ảnh hưởng đến dữ liệu thực của học sinh.
          </p>
        </div>
      ) : (
        <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-5 space-y-3 text-xs text-sky-950">
          <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
            <Lock className="w-5 h-5 text-sky-600" />
            <span>Chế độ Triển khai Thực tế (Production Class Mode)</span>
          </div>
          <p className="leading-relaxed text-sky-900">
            Học sinh đăng nhập bằng Mã định danh ẩn danh (Student ID) hoặc Mã PIN lớp học do giáo viên cấp. Tuân thủ nghiêm ngặt Luật Trẻ em Việt Nam: không công khai hình ảnh thật và không chia sẻ kết quả cá nhân ra ngoài.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="confirmSchool"
              checked={schoolApproved}
              onChange={(e) => setSchoolApproved(e.target.checked)}
              className="rounded text-sky-600"
            />
            <label htmlFor="confirmSchool" className="font-bold text-sky-900 cursor-pointer">
              Nhà trường đã xác nhận quy trình bảo vệ dữ liệu học sinh lớp 2A2 năm học 2025-2026.
            </label>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Danh sách học sinh lớp 2A2 ({isDemoMode ? 'Giả lập' : 'Thực tế'})</span>
          </h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            Sĩ số: 6 học sinh đại diện
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-3 rounded-l-xl">Mã học sinh</th>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Lớp</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Bài học đã làm</th>
                <th className="p-3 rounded-r-xl text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {demoStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-sky-700">{st.code}</td>
                  <td className="p-3 font-extrabold text-slate-900">{st.name}</td>
                  <td className="p-3 text-slate-600">{st.classId}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {st.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{st.completedLessons} bài</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectStudentForInteraction(st.code, st.name)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-colors shadow-2xs"
                    >
                      Đóng vai học sinh này
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
