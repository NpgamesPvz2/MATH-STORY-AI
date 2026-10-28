import React, { useState } from 'react';
import {
  Layers,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Film,
  Users,
  Camera,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { CharacterProfile, MathAnalysisResult, Storyboard } from '../../types/mathStory';
import { generateCombinedScriptPrompt } from '../../utils/promptGenerator';

interface ReviewScriptProps {
  analysis: MathAnalysisResult | null;
  storyboard: Storyboard | null;
  characters: CharacterProfile[];
  onGoToAudioStudio: () => void;
  onGoToAnalysis: () => void;
  selectedGrade?: string;
}

export const ReviewScript: React.FC<ReviewScriptProps> = ({
  analysis,
  storyboard,
  characters,
  onGoToAudioStudio,
  onGoToAnalysis,
  selectedGrade = 'Lớp 2',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const charactersList = analysis?.charactersInProblem && analysis.charactersInProblem.length > 0
    ? analysis.charactersInProblem
    : ['Bé Lan', 'Mẹ'];
  const hasMoreThanTwoCharacters = charactersList.length > 2;

  const scenes = storyboard?.scenes || [];

  // Sinh prompt của 3 cảnh trước rồi kết hợp chúng thành prompt kịch bản tổng thể dùng cho Phân hệ 6
  const combinedScriptPrompt = storyboard?.combinedPrompt || generateCombinedScriptPrompt({
    grade: selectedGrade || analysis?.grade || 'Lớp 2',
    theme: storyboard?.theme || 'Gia đình và cuộc sống',
    topic: analysis?.topic,
    problemStatement: analysis?.problemStatement || '',
    calculation: analysis?.calculation || '',
    characters: charactersList,
    scenes: scenes,
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Khi sao chép toàn bộ prompt thì lấy chính prompt kịch bản kết hợp này
  const handleCopyAllPrompts = () => {
    navigator.clipboard.writeText(combinedScriptPrompt);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  const handleDownloadScriptFile = () => {
    const fullContent =
      `KỊCH BẢN TOÁN HỌC & PROMPT KỊCH BẢN KẾT HỢP 3 CẢNH (MATH STORY AI)\n` +
      `Khối lớp: ${selectedGrade}\n` +
      `Đề bài: ${analysis?.problemStatement || ''}\n` +
      `Phép tính: ${analysis?.calculation || ''}\n` +
      `Nhân vật: ${charactersList.join(', ')}\n` +
      `Phong cảnh: ${storyboard?.theme || 'Gia đình & Cuộc sống'}\n` +
      `Phong cách: Hoạt hình 3D dễ thương | Tỷ lệ: 16:9\n\n` +
      `======================================================================\n` +
      `PROMPT KỊCH BẢN KẾT HỢP DÙNG CHO PHÂN HỆ 6:\n` +
      `======================================================================\n` +
      combinedScriptPrompt;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kich-ban-va-prompt-ket-hop-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 4: Xem Lại Kịch Bản &amp; Tổng Hợp Toàn Bộ Prompt
            </h2>
            <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
              Khung hình 16:9 • Hoạt hình 3D dễ thương • Prompt tiếng Việt
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Xem lại toàn diện dữ liệu được tích hợp từ Phân hệ 1, 2, 3 và toàn bộ Prompt tạo ảnh &amp; video 3D bằng tiếng Việt trước khi tạo giọng nói và dựng video.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end md:ml-auto gap-2">
          <button
            onClick={handleCopyAllPrompts}
            disabled={hasMoreThanTwoCharacters}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            {allCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
            <span>{allCopied ? 'Đã sao chép tất cả!' : 'Sao chép toàn bộ Prompt'}</span>
          </button>

          <button
            onClick={handleDownloadScriptFile}
            disabled={hasMoreThanTwoCharacters}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Tải file kịch bản (.txt)</span>
          </button>
        </div>
      </div>

      {/* RÀNG BUỘC NGHIÊM NGẶT: NẾU XÁC ĐỊNH > 2 NHÂN VẬT THÌ KHÔNG CHO PHÉP LÊN KỊCH BẢN Ở PHÂN HỆ 4 */}
      {hasMoreThanTwoCharacters ? (
        <div className="bg-rose-50 border-3 border-rose-500 rounded-3xl p-8 space-y-4 text-rose-950 shadow-xl animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
              ⛔
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
                KHÔNG CHO PHÉP LÊN KỊCH BẢN VÌ ĐỀ BÀI CÓ {charactersList.length} NHÂN VẬT (&gt; 2 NHÂN VẬT)
              </h3>
              <p className="text-sm font-semibold leading-relaxed">
                Đề bài xác định có các nhân vật: <strong className="underline decoration-rose-600">{charactersList.join(', ')}</strong> ({charactersList.length} nhân vật).
              </p>
              <div className="bg-white p-4 rounded-2xl border border-rose-300 text-xs text-rose-900 space-y-2">
                <p className="font-extrabold text-sm">
                  📌 Quy định hệ thống của ứng dụng:
                </p>
                <ul className="list-disc list-inside space-y-1 font-medium text-slate-800">
                  <li>Chỉ cho phép tối đa <strong>2 nhân vật</strong> để đảm bảo tính đồng bộ tạo hình 3D, chuyển động và chất lượng video AI.</li>
                  <li>Do phát hiện nhiều hơn 2 nhân vật, hệ thống <strong>chặn không cho phép lên kịch bản ở Phân hệ 4</strong>.</li>
                  <li>Do đó, sẽ <strong>không có video ở Phân hệ 6</strong> cho bài toán này.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-rose-200">
            <span className="text-xs text-rose-800 italic">
              * Vui lòng quay lại Phân hệ 1 để chỉnh sửa nội dung bài toán chỉ gồm tối đa 2 nhân vật.
            </span>
            <button
              onClick={onGoToAnalysis}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Quay Lại Phân Hệ 1 Để Chỉnh Sửa Đề Bài</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* HỢP LỆ: <= 2 NHÂN VẬT -> HIỂN THỊ TOÀN BỘ THÔNG TIN VÀ PROMPT */
        <div className="space-y-6">
          {/* Summary Panels: Phân hệ 1, 2, 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Panel 1: Từ Phân hệ 1 */}
            <div className="bg-white rounded-3xl p-5 border-2 border-sky-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Dữ Liệu Từ Phân Hệ 1</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ✓ {charactersList.length} nhân vật (≤ 2)
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Khối lớp:</span>
                  <span className="font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {selectedGrade || analysis?.grade || 'Lớp 2'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Đề bài:</span>
                  <p className="font-semibold text-slate-900 line-clamp-3 italic">
                    "{analysis?.problemStatement}"
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-500">Nhân vật:</span>
                  <span className="font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {charactersList.join(' & ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Phép tính:</span>
                  <span className="font-mono font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {analysis?.calculation || `${analysis?.num1 ?? 25} + ${analysis?.num2 ?? 17} = ${analysis?.result ?? 42}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
                  <span className="font-bold text-slate-500">Mã số:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {analysis?.problemCode || 'TOAN2-CAM01'}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2: Từ Phân hệ 2 */}
            <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-600" />
                  <span>Cấu Hình Từ Phân Hệ 2</span>
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  {scenes.length} Phân cảnh
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Phong cảnh:</span>
                  <span className="font-extrabold text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {storyboard?.theme || 'Gia đình & Cuộc sống'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Thời lượng:</span>
                  <span className="font-bold text-slate-900">{storyboard?.durationSeconds || 45} giây (16:9)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Phong cách:</span>
                  <span className="font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {storyboard?.style || 'Hoạt hình 3D dễ thương'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Tỷ lệ khung hình:</span>
                  <span className="font-black text-slate-900">16:9 Widescreen</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Từ Phân hệ 3 - Đồng bộ Profile thật */}
            <div className="bg-white rounded-3xl p-5 border-2 border-teal-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                <span className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Hồ Sơ Nhân Vật Phân Hệ 3</span>
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Đồng bộ Seed
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {charactersList.slice(0, 2).map((cName, cIdx) => {
                  const matchedProfile = characters.find(
                    (c) => c.name.toLowerCase().includes(cName.toLowerCase()) || cName.toLowerCase().includes(c.name.toLowerCase())
                  );
                  return (
                    <div key={cIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">{cName}</span>
                        <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                          {matchedProfile ? `${matchedProfile.role} (${matchedProfile.age} tuổi)` : cIdx === 0 ? 'Nhân vật chính 7 tuổi' : 'Nhân vật hỗ trợ'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-1 italic">
                        {matchedProfile?.appearance || 'Phong cách Hoạt hình 3D dễ thương chuẩn Pixar'}
                      </p>
                      {matchedProfile?.voiceStyle && (
                        <p className="text-[9.5px] text-sky-700 font-medium truncate">
                          🔊 Giọng: {matchedProfile.voiceStyle}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CHI TIẾT TỪNG PHÂN CẢNH */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 rounded-xl text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Tổng Hợp Toàn Bộ 3 Phân Cảnh (Đồng Bộ Dữ Liệu Phân Hệ 1, 2, 3)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mọi thay đổi về dữ kiện, phép tính, bối cảnh, lời thoại và prompt đều được cập nhật tự động
                  </p>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                16:9 • Hoạt hình 3D dễ thương
              </span>
            </div>

            <div className="space-y-6">
              {scenes.map((scene, idx) => {
                const speakerName = scene.characters?.[0] || charactersList[0] || 'Bé Lan';
                const speakerProfile = characters.find(
                  (c) => c.name.toLowerCase().includes(speakerName.toLowerCase()) || speakerName.toLowerCase().includes(c.name.toLowerCase())
                );

                return (
                  <div
                    key={scene.sceneNumber}
                    className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 space-y-4 hover:border-sky-300 transition-all shadow-2xs"
                  >
                    {/* Scene header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {scene.sceneNumber}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">
                          CẢNH {scene.sceneNumber}: {scene.title.replace(/^cảnh\s*\d+\s*:\s*/i, '')}
                        </h4>
                        <span className="text-[11px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                          {scene.duration}s
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const cleanTitle = scene.title.replace(/^cảnh\s*\d+\s*:\s*/i, '');
                          const fullSceneText =
                            `CẢNH ${scene.sceneNumber}: ${cleanTitle}\n` +
                            `• Bối cảnh: ${scene.setting}\n` +
                            `• Lời thoại (${speakerName}): "${scene.dialogue}"\n` +
                            `• Dữ kiện toán: ${scene.mathData}${scene.interactiveQuestion ? ` (Câu hỏi dừng: ${scene.interactiveQuestion.question})` : ''}\n` +
                            `• Prompt tạo ảnh 3D (16:9): ${scene.imagePrompt}\n` +
                            `• Prompt chuyển động video (16:9): ${scene.motionPrompt}`;
                          handleCopy(fullSceneText, `scene-${idx}`);
                        }}
                        className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-300 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copiedId === `scene-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã chép Đầy Đủ Cảnh {scene.sceneNumber}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép Prompt &amp; Dữ kiện Cảnh {scene.sceneNumber}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bối cảnh & Hành động (Đồng bộ từ Phân hệ 2) */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-extrabold text-purple-900 uppercase text-[10.5px] block">
                        🏛️ Bối cảnh &amp; Hành động (Từ Phân hệ 2):
                      </span>
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        {scene.setting}
                      </p>
                      {scene.action && (
                        <p className="text-[11px] text-slate-600 italic pt-0.5">
                          Hành động nhân vật: {scene.action}
                        </p>
                      )}
                    </div>

                    {/* Dialogue & Math Data (Đồng bộ từ Phân hệ 1 & 2) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500 uppercase text-[10px]">
                            Lời thoại (Người nói: {speakerName}):
                          </span>
                          {speakerProfile && (
                            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.2 rounded">
                              {speakerProfile.role}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 italic leading-relaxed">"{scene.dialogue}"</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          Dữ kiện &amp; Tình huống toán học (Từ Phân hệ 1):
                        </span>
                        <p className="font-black text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-snug">
                          {scene.mathData}
                        </p>
                      </div>
                    </div>

                    {/* Thử thách tương tác câu hỏi dừng (Cảnh 2) */}
                    {scene.interactiveQuestion && (
                      <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            ❓ Thử thách tương tác tại Cảnh 2
                          </span>
                          <span className="text-[10px] font-bold text-amber-900">
                            Phép tính: {analysis?.calculation || scene.interactiveQuestion.resultCalculation}
                          </span>
                        </div>
                        <p className="font-extrabold text-amber-950 text-xs">
                          {scene.interactiveQuestion.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {scene.interactiveQuestion.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl text-[11px] font-bold border ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs'
                                  : 'bg-white border-amber-200 text-slate-700'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {opt.isCorrect && <span className="block text-[9.5px] text-emerald-700 font-black mt-0.5">✓ Đáp án đúng</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 1. Prompt Tạo Ảnh (Tiếng Việt - Đồng bộ từ Phân hệ 2) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          <span>Prompt Tạo Ảnh 3D (Viết bằng tiếng Việt, 16:9, Hoạt hình 3D dễ thương):</span>
                        </span>
                        <button
                          onClick={() => handleCopy(scene.imagePrompt, `img-${idx}`)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `img-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `img-${idx}` ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                      <div className="bg-slate-900 text-amber-300 p-3.5 rounded-2xl font-mono text-xs leading-relaxed border border-amber-500/30">
                        {scene.imagePrompt}
                      </div>
                    </div>

                    {/* 2. Prompt Chuyển Động Video (Tiếng Việt - Đồng bộ từ Phân hệ 2) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-purple-600" />
                          <span>Prompt Chuyển Động Video (Google Flow - Viết bằng tiếng Việt):</span>
                        </span>
                        <button
                          onClick={() => handleCopy(scene.motionPrompt, `mot-${idx}`)}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `mot-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `mot-${idx}` ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                      <div className="bg-slate-900 text-sky-200 p-3.5 rounded-2xl font-mono text-xs leading-relaxed border border-purple-500/30">
                        {scene.motionPrompt}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              ✓ Toàn bộ kịch bản và Prompt đã được kiểm định đạt chuẩn 16:9, phong cách Hoạt hình 3D dễ thương, tiếng Việt và có tối đa 2 nhân vật.
            </div>
            <button
              onClick={onGoToAudioStudio}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp Tục: Sang Tạo Giọng Đọc AI (Phân hệ 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
