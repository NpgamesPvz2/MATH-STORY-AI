import React from 'react';
import {
  Sparkles,
  BookOpen,
  Film,
  Users,
  Palette,
  Mic,
  Gamepad2,
  CheckCircle2,
  BarChart3,
  HelpCircle,
  Video,
  GraduationCap,
  Layers,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'home'
  | 'analysis'
  | 'storyboard'
  | 'characters'
  | 'reviewScript'
  | 'audio'
  | 'interactive'
  | 'personalized'
  | 'moderation'
  | 'library';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: 'teacher' | 'student';
  setUserRole: (role: 'teacher' | 'student') => void;
  apiStatus: {
    geminiConfigured: boolean;
    deterministicMathEngineReady: boolean;
  };
  onOpenFlowGuide: () => void;
  selectedGrade?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  apiStatus,
  onOpenFlowGuide,
  selectedGrade = 'Lớp 2',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      {/* Top Banner with Author Credentials */}
      <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-amber-500 text-white text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-wide uppercase bg-white/20 px-2 py-0.5 rounded-full text-[11px] backdrop-blur-xs">
              Sáng kiến giáo dục 2026
            </span>
            <span>
              Tác giả giải pháp: <strong className="underline decoration-amber-300 font-bold">HOÀNG DIỆU HƯƠNG</strong> — Lớp <strong>2A2</strong> — Trường <strong>TIỂU HỌC ĐẶNG TRẦN CÔN</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="italic hidden md:inline text-sky-100">
              "Một bài toán – Một câu chuyện – Một thử thách tư duy – Một hành trình tiến bộ."
            </span>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full text-[11px]">
              <span className={`w-2 h-2 rounded-full ${apiStatus.geminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{apiStatus.geminiConfigured ? 'Gemini AI Đã kết nối' : 'Động cơ Toán học Xác định'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-400 to-amber-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-sky-600">
              📐
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-700 via-teal-700 to-amber-600 bg-clip-text text-transparent">
                MATH STORY AI
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              Xưởng sáng tạo câu chuyện Toán học bằng Trí tuệ Nhân tạo
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switch */}
        <div className="flex items-center gap-2">
          {/* Quick Flow Guide button */}
          <button
            onClick={onOpenFlowGuide}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-sky-600" />
            <span>Quy trình Google Flow</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setUserRole('teacher')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                userRole === 'teacher'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Giáo viên</span>
            </button>
            <button
              onClick={() => {
                setUserRole('student');
                setActiveTab('interactive');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                userRole === 'student'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Học sinh (Học tương tác)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Scrollable Navigation Bar */}
      <div className="bg-sky-50/50 border-t border-sky-100 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1 min-w-max text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'home' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            Tổng quan
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'analysis' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Nhập & Phân tích</span>
          </button>

          <button
            onClick={() => setActiveTab('storyboard')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'storyboard' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>2. Biên kịch AI</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'characters' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Nhân vật</span>
          </button>

          <button
            onClick={() => setActiveTab('reviewScript')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'reviewScript' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Xem lại kịch bản</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'audio' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>5. Giọng đọc AI</span>
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-extrabold transition-colors ${
              activeTab === 'interactive'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 bg-amber-100/80 hover:bg-amber-200/80'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>6. Video & Âm thanh</span>
            <span className="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">TRỌNG TÂM</span>
          </button>

          <button
            onClick={() => setActiveTab('personalized')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'personalized' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>7. Cá nhân hóa 3 mức</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'moderation' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>8. Kiểm duyệt</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'library' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>9. Học liệu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
