import React from 'react';
import { ShieldCheck, Heart, Sparkles, School } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📐</span>
            <span className="font-extrabold text-white text-base tracking-tight">MATH STORY AI</span>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded">2026</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Xưởng sáng tạo câu chuyện Toán học bằng Trí tuệ Nhân tạo dành cho học sinh tiểu học.
            Giải pháp đổi mới phương pháp dạy học theo Chương trình GDPT 2018.
          </p>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <School className="w-4 h-4 text-sky-400" />
            <span>Trường Tiểu học Đặng Trần Côn — Lớp 2A2</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Tác giả & Thông điệp giáo dục</h4>
          <p className="text-slate-300 font-semibold mb-1">
            Tác giả giải pháp: <span className="text-amber-400 font-bold">HOÀNG DIỆU HƯƠNG</span>
          </p>
          <p className="italic text-sky-300 text-xs mb-3 bg-sky-950/60 p-2.5 rounded-xl border border-sky-800/60">
            "Một bài toán – Một câu chuyện – Một thử thách tư duy – Một hành trình tiến bộ."
          </p>
          <p className="text-[11px] text-slate-400">
            Bản quyền giải pháp sáng kiến kinh nghiệm & phần mềm giáo dục năm 2026.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tiêu chuẩn an toàn & Sư phạm</span>
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>✓ Tuyệt đối bảo mật thông tin và danh tính học sinh tiểu học</li>
            <li>✓ Kiểm định toán học xác định (Deterministic Engine) độc lập</li>
            <li>✓ Không sử dụng hình ảnh hay nội dung độc hại với trẻ em</li>
            <li>✓ Phản hồi sư phạm khích lệ, không chê bai khi học sinh làm sai</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
        MATH STORY AI © 2026 — Sản phẩm nghiên cứu và ứng dụng thực tiễn tại Trường Tiểu học Đặng Trần Côn.
      </div>
    </footer>
  );
};
