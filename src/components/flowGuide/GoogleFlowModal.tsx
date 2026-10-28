import React from 'react';
import { X, Copy, ExternalLink, Download, Upload, Check, Video, AlertTriangle, ArrowRight } from 'lucide-react';

interface GoogleFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptToCopy?: string;
  startImageUrl?: string;
  sceneTitle?: string;
}

export const GoogleFlowModal: React.FC<GoogleFlowModalProps> = ({
  isOpen,
  onClose,
  promptToCopy,
  startImageUrl,
  sceneTitle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const defaultPrompt = promptToCopy || 'Hoạt hình 3D dễ thương, phong cách Pixar. Nhân vật tươi cười rạng rỡ trong không gian ấm cúng, chuyển động mượt mà điện ảnh, tỷ lệ khung hình 16:9, màu sắc trong sáng chuẩn giáo dục thiếu nhi.';

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Video className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Quy trình Tạo Video với Google Flow</h3>
              <p className="text-xs text-sky-100">Hướng dẫn xuất prompt và nhập clip MP4 cho giáo viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Notice box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">Quy định kết nối hệ thống:</p>
              Google Flow & VideoFX hiện chưa cung cấp Public REST API tự động cho tài khoản thường. 
              Vì vậy, MATH STORY AI áp dụng quy trình chuẩn đã được kiểm chứng: <strong>Xuất Prompt → Tạo trên Google Flow → Nhập clip trở lại</strong>.
            </div>
          </div>

          {sceneTitle && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center justify-between">
              <span>Đang thao tác cho: <strong>{sceneTitle}</strong></span>
              <span className="text-[11px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">Khung hình 16:9</span>
            </div>
          )}

          {/* 4 Steps */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">1</span>
              Bước 1: Sao chép Video Prompt đã tối ưu hóa
            </h4>
            <div className="relative bg-slate-900 rounded-2xl p-3 text-slate-200 text-xs font-mono">
              <div className="pr-20 max-h-24 overflow-y-auto">{defaultPrompt}</div>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-sans font-bold px-3 py-1.5 rounded-xl shadow transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">2</span>
              Bước 2: Tải ảnh bắt đầu đã chọn trong Phân hệ 4 (Start Frame)
            </h4>
            <p className="text-xs text-slate-600">
              Quy chuẩn tạo video: <strong>Video phải được tạo từ ảnh bắt đầu đã chọn trong Phân hệ 4</strong> làm khung hình gốc (First Frame / Start Image) để giữ trọn vẹn bối cảnh và tạo hình nhân vật.
            </p>
            {startImageUrl ? (
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-sky-300">
                <img src={startImageUrl} alt="Ảnh bắt đầu từ Phân hệ 4" className="w-24 h-14 object-cover rounded-xl border border-slate-300 shadow-sm" />
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-sky-950 block">✓ Đã nạp ảnh bắt đầu từ Phân hệ 4</span>
                  <a
                    href={startImageUrl}
                    download="anh-bat-dau-phan-he-4.png"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-white border border-sky-300 hover:bg-sky-50 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải ảnh bắt đầu này về máy để tạo video</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic bg-slate-100 p-2.5 rounded-xl">
                (Chưa có ảnh đầu cảnh, vui lòng chọn hoặc tạo ảnh ở Phân hệ 4 trước)
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
              Bước 3: Mở Google Flow & Render clip
            </h4>
            <p className="text-xs text-slate-600">
              Truy cập Google Flow / VideoFX trên tab mới, dán prompt và ảnh, chọn thời lượng 5s-10s và xuất file MP4.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">4</span>
              Bước 4: Nhập clip MP4 trở lại MATH STORY AI
            </h4>
            <p className="text-xs text-slate-600">
              Tại Phân hệ 5 (Studio Video), chọn cảnh tương ứng và bấm nút <strong>"Tải video clip lên"</strong> để hệ thống ghép nối vào kịch bản và đồng bộ điểm dừng câu hỏi tương tác.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Giữ nguyên bản quyền giáo dục Trường TH Đặng Trần Côn</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Đã hiểu quy trình
          </button>
        </div>
      </div>
    </div>
  );
};
