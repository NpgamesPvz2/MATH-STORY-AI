import React, { useState } from 'react';
import {
  Users,
  Plus,
  Sparkles,
  ShieldCheck,
  Check,
  User,
  Heart,
  Volume2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { CharacterProfile, MathAnalysisResult } from '../../types/mathStory';
import { createCharacter } from '../../services/api';

interface CharacterLibraryProps {
  characters: CharacterProfile[];
  analysis?: MathAnalysisResult | null;
  selectedCharId: string;
  onSelectCharacter: (charId: string) => void;
  onCharacterAdded: (newChar: CharacterProfile) => void;
  onGoToReviewScript?: () => void;
  selectedGrade?: string;
}

export function generateProfileForName(name: string): CharacterProfile {
  const isFemale = /mẹ|bà|lan|mai|linh|cúc|hoa|nữ|cô/i.test(name);
  const isAdult = /bác|chú|cô|mẹ|bà|bố|ông|giáo viên/i.test(name);
  const isRobot = /robot|rô-bốt|tô-bốt/i.test(name);

  return {
    id: `char-auto-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    role: isAdult ? 'Nhân vật trong bài toán' : 'Học sinh tiểu học',
    age: isAdult ? 35 : isRobot ? 2 : 7,
    gender: isRobot ? 'Robot' : isFemale ? 'Nữ' : 'Nam',
    appearance: isAdult
      ? `${name} hiền hậu, nụ cười ấm áp, phong cách Hoạt hình 3D dễ thương chuẩn Pixar.`
      : isRobot
      ? `${name} robot bầu bĩnh màu xanh dương, màn hình hiển thị số học phát sáng ngộ nghĩnh.`
      : `Bạn nhỏ ${name} thông minh, mắt to tròn sáng ngời, nụ cười tươi tắn, phong cách 3D đáng yêu.`,
    outfit: isAdult
      ? 'Trang phục đời thường ấm cúng, màu sắc tươi tắn trang nhã.'
      : isRobot
      ? 'Vỏ kim loại bóng loáng, cánh tay nam châm hút số học.'
      : 'Đồng phục học sinh tiểu học năng động, gọn gàng, sạch đẹp.',
    personality: 'Thân thiện, chăm chỉ, yêu thích các câu chuyện toán học và luôn hỗ trợ bạn bè.',
    voiceStyle: isAdult
      ? 'Giọng người lớn truyền cảm, chuẩn mực sư phạm (Kore)'
      : isFemale
      ? 'Giọng bé gái trong trẻo, hồn nhiên, vui tươi (Aoede)'
      : 'Giọng bé trai hoạt bát, rõ ràng, tự tin (Puck)',
    fromCurrentProblem: true,
  };
}

export const CharacterLibrary: React.FC<CharacterLibraryProps> = ({
  characters,
  analysis,
  selectedCharId,
  onSelectCharacter,
  onCharacterAdded,
  onGoToReviewScript,
  selectedGrade = 'Lớp 2',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState(`Học sinh ${selectedGrade}`);
  const [age, setAge] = useState(7);
  const [gender, setGender] = useState('Nữ');
  const [appearance, setAppearance] = useState('');
  const [outfit, setOutfit] = useState('');
  const [personality, setPersonality] = useState('');
  const [voiceStyle, setVoiceStyle] = useState('Giọng thiếu nhi trong trẻo, vui tươi');
  const [loading, setLoading] = useState(false);

  // YÊU CẦU: Chỉ hiển thị các nhân vật liên quan từ phân hệ 1 cùng mô tả được tạo sinh
  const problemChars = analysis?.charactersInProblem && analysis.charactersInProblem.length > 0
    ? analysis.charactersInProblem
    : ['Bé Lan'];

  // Match existing characters or generate profiles for those extracted in Phân hệ 1
  const displayedCharacters: CharacterProfile[] = problemChars.map((pName) => {
    const matched = characters.find(
      (c) => c.name.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched) {
      const cleanRole = matched.role.replace(/lớp\s*2A[0-9]|2A[0-9]/gi, 'tiểu học');
      return { ...matched, role: cleanRole, fromCurrentProblem: true };
    }
    return generateProfileForName(pName);
  });

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const newChar = await createCharacter({
        name,
        role,
        age: Number(age),
        gender,
        appearance: appearance || 'Đáng yêu, hoạt hình 3D phong cách Pixar',
        outfit: outfit || 'Đồng phục học sinh tiểu học dễ thương',
        personality: personality || 'Chăm ngoan, yêu thích khám phá môn Toán',
        voiceStyle,
      });
      onCharacterAdded(newChar);
      setShowAddModal(false);
      setName('');
      setAppearance('');
      setOutfit('');
      setPersonality('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
              Phân Hệ 3: Nhân Vật Trong Bài Toán &amp; Hồ Sơ Tạo Sinh 3D
            </h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
              Chỉ hiển thị nhân vật từ Phân hệ 1
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống lọc chính xác và chỉ hiển thị các nhân vật có mặt trong bài toán ở Phân hệ 1 cùng các thuộc tính diện mạo, trang phục được AI tạo sinh theo phong cách Hoạt hình 3D dễ thương.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 leading-relaxed">
          <strong>Đồng bộ nhân vật với Phân hệ 1:</strong> Hiện tại bài toán xuất hiện <strong>{displayedCharacters.length} nhân vật ({problemChars.join(', ')})</strong>. Toàn bộ hồ sơ ngoại hình, trang phục bên dưới được sử dụng làm Character Seed để tạo Prompt tiếng Việt nhất quán ở Phân hệ 4.
        </div>
      </div>

      {/* Character Cards Grid: CHỈ HIỂN THỊ CÁC NHÂN VẬT TỪ PHÂN HỆ 1 - TỰ ĐỘNG KÍCH HOẠT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCharacters.map((char) => {
          return (
            <div
              key={char.id}
              className="bg-white rounded-3xl p-5 border-2 border-emerald-400 ring-2 ring-emerald-100 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 p-0.5 shadow-sm">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
                        {char.gender === 'Robot' ? '🤖' : char.gender === 'Nữ' ? '👧' : '👦'}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                        <span>{char.name}</span>
                        <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-0.5 rounded-full font-black shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Từ đề bài</span>
                        </span>
                      </h3>
                      <p className="text-[11px] text-teal-700 font-bold">
                        {char.role} ({char.age} tuổi)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Đã kích hoạt</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      3D Hoạt hình
                    </span>
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">
                      Ngoại hình &amp; Tóc (Phong cách 3D dễ thương):
                    </span>
                    <p className="text-slate-800 font-medium">{char.appearance}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">
                      Trang phục &amp; Màu sắc chủ đạo:
                    </span>
                    <p className="text-slate-800 font-medium">{char.outfit}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">
                      Tính cách &amp; Giọng nói AI:
                    </span>
                    <p className="text-slate-800 font-medium mb-1">{char.personality}</p>
                    <p className="text-[11px] text-sky-700 italic flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>{char.voiceStyle}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button: Đã tự động kích hoạt */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectCharacter(char.id)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tự động kích hoạt cho bài toán</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      {onGoToReviewScript && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            Đã hoàn tất cấu hình nhân vật. Hãy chuyển sang <strong>Phân hệ 4 (Xem lại kịch bản)</strong> để xem toàn bộ Prompt được tổng hợp từ Phân hệ 1, 2, 3.
          </span>
          <button
            onClick={onGoToReviewScript}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Chuyển Sang Xem Lại Kịch Bản (Phân hệ 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
