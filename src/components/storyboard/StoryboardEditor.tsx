import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  Volume2,
  ArrowRight,
  Camera,
  Layers,
  Users,
} from 'lucide-react';
import {
  CharacterProfile,
  MathAnalysisResult,
  Scene,
  Storyboard,
  StoryTheme,
} from '../../types/mathStory';
import { generateStoryboardScript } from '../../services/api';

const THEMES: { id: StoryTheme; label: string; icon: string }[] = [
  { id: 'Gia đình và cuộc sống', label: 'Gia đình & Cuộc sống', icon: '🏡' },
  { id: 'Trường học vui vẻ', label: 'Trường học vui vẻ', icon: '🏫' },
  { id: 'Khu vườn Toán học', label: 'Khu vườn Toán học', icon: '🌻' },
  { id: 'Siêu thị mini', label: 'Siêu thị mini', icon: '🛒' },
  { id: 'Thế giới động vật', label: 'Thế giới động vật', icon: '🦊' },
  { id: 'Phiêu lưu cùng robot AI', label: 'Phiêu lưu cùng Robot AI', icon: '🤖' },
  { id: 'Cổ tích Toán học', label: 'Cổ tích Toán học', icon: '🏰' },
  { id: 'Thành phố thông minh', label: 'Thành phố thông minh', icon: '🚀' },
];

export function buildVietnameseScenePrompts(
  theme: StoryTheme,
  mainChar: string,
  secondChar: string,
  num1: number,
  num2: number,
  res: number,
  calc: string,
  unit: string,
  op: string
) {
  const charLead = secondChar ? `Nhân vật ${mainChar} và ${secondChar}` : `Nhân vật ${mainChar}`;

  let scene1Img = `Hoạt hình 3D dễ thương, phong cách Pixar. Nhân vật ${mainChar} tươi cười rạng rỡ trong không gian ${theme}, đang vui vẻ chăm sóc và chuẩn bị ${num1} ${unit}. Ánh sáng ấm áp rực rỡ, góc nhìn điện ảnh 16:9, màu sắc tươi vui chuẩn giáo dục tiểu học.`;
  let scene1Motion = `Góc máy quay từ từ lia sang phải, ${mainChar} tươi cười vẫy tay chào các bạn học sinh với nét mặt hân hoan, chuyển động mượt mà điện ảnh 16:9.`;

  let scene2Img = `Hoạt hình 3D dễ thương. ${charLead} nghiêng đầu suy nghĩ tò mò, tay đặt lên cằm, bên cạnh xuất hiện thêm ${num2} ${unit}. Biểu tượng dấu hỏi chấm phát sáng lấp lánh màu phấn ấm áp, tỷ lệ khung hình 16:9.`;
  let scene2Motion = `Nhân vật nghiêng đầu với biểu cảm tò mò suy nghĩ, góc máy quay zoom chậm vào khung hình câu hỏi tương tác, dừng chuyển động để chờ câu trả lời, tỷ lệ 16:9.`;

  if (op.includes('TRỪ') || op === '-') {
    scene2Img = `Hoạt hình 3D dễ thương. ${charLead} trong bối cảnh ${theme}, quan sát ${num2} ${unit} được bớt đi hoặc bán đi, nét mặt suy ngẫm hỏi các bạn nhỏ số lượng còn lại, tỷ lệ 16:9.`;
    scene2Motion = `Góc máy cận cảnh chậm rãi hướng về rổ đồ vật có phần được bớt đi, nhân vật mỉm cười đặt câu hỏi tương tác cho học sinh, tỷ lệ 16:9.`;
  } else if (op.includes('NHÂN') || op === '×') {
    scene2Img = `Hoạt hình 3D dễ thương. Nhân vật ${mainChar} chỉ tay vào ${num1} nhóm đều nhau, mỗi nhóm có đúng ${num2} ${unit}, ánh sáng rực rỡ vui nhộn, tỷ lệ 16:9.`;
    scene2Motion = `Góc máy lia qua từng nhóm đồ vật bằng nhau, nhân vật mỉm cười đố vui học sinh phép tính nhân, tỷ lệ 16:9.`;
  }

  let scene3Img = `Hoạt hình 3D dễ thương, phong cách Pixar. ${charLead} reo hò ăn mừng chiến thắng, giơ hai tay lên cao, các ngôi sao pháo hoa lấp lánh rơi xuống, không khí rộn ràng ngày hội, đáp số ${calc} hiển thị rõ nét trên màn hình, tỷ lệ 16:9.`;
  let scene3Motion = `Nhân vật nhảy cẫng lên ăn mừng chiến thắng với nụ cười rạng rỡ, pháo hoa giấy màu sắc rơi lấp lánh xung quanh, góc máy chuyển động tưng bừng chúc mừng học sinh, tỷ lệ 16:9.`;

  return {
    scene1: { imagePrompt: scene1Img, motionPrompt: scene1Motion },
    scene2: { imagePrompt: scene2Img, motionPrompt: scene2Motion },
    scene3: { imagePrompt: scene3Img, motionPrompt: scene3Motion },
  };
}

interface StoryboardEditorProps {
  analysis: MathAnalysisResult | null;
  characters: CharacterProfile[];
  currentStoryboard: Storyboard | null;
  onStoryboardSaved: (storyboard: Storyboard) => void;
  onOpenFlowGuideWithPrompt: (prompt: string, sceneTitle: string) => void;
  onGoToCharacters?: () => void;
}

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
  analysis,
  characters,
  currentStoryboard,
  onStoryboardSaved,
  onOpenFlowGuideWithPrompt,
  onGoToCharacters,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>(
    currentStoryboard?.theme || 'Gia đình và cuộc sống'
  );
  const [duration, setDuration] = useState<number>(currentStoryboard?.durationSeconds || 45);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(currentStoryboard);
  const [loading, setLoading] = useState(false);
  const [editingSceneIdx, setEditingSceneIdx] = useState<number | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  // Nhân vật đã được xác định từ Phân hệ 1
  const extractedChars = analysis?.charactersInProblem && analysis.charactersInProblem.length > 0
    ? analysis.charactersInProblem
    : ['Bé Lan'];
  const mainChar = extractedChars[0] || 'Bé Lan';
  const secondChar = extractedChars.length > 1 ? extractedChars[1] : '';

  const num1 = analysis?.num1 ?? analysis?.deterministicCheck?.numbers?.[0] ?? 25;
  const num2 = analysis?.num2 ?? analysis?.deterministicCheck?.numbers?.[1] ?? 17;
  const op = analysis?.operation || analysis?.deterministicCheck?.operation || 'CỘNG';
  const unit = analysis?.unit || analysis?.deterministicCheck?.unit || 'quả cam';
  const res = analysis?.result ?? (op.includes('TRỪ') ? Math.max(num1, num2) - Math.min(num1, num2) : num1 + num2);
  const calc = analysis?.calculation || `${num1} + ${num2} = ${res}`;

  // Keep local storyboard state synchronized when project or analysis changes
  React.useEffect(() => {
    if (currentStoryboard) {
      setStoryboard(currentStoryboard);
      if (currentStoryboard.theme) {
        setSelectedTheme(currentStoryboard.theme);
      }
      if (currentStoryboard.durationSeconds) {
        setDuration(currentStoryboard.durationSeconds);
      }
    }
  }, [currentStoryboard, analysis]);

  // Generate Script using AI or structured engine
  const handleGenerateScript = async () => {
    if (!analysis) return;
    setLoading(true);
    try {
      const result = await generateStoryboardScript(
        analysis.problemStatement,
        analysis,
        selectedTheme,
        duration,
        mainChar
      );
      // Ensure all prompts are 100% in Vietnamese, 16:9, Hoạt hình 3D dễ thương
      const vietPrompts = buildVietnameseScenePrompts(selectedTheme, mainChar, secondChar, num1, num2, res, calc, unit, op);
      const updatedScenes = result.scenes.map((s, idx) => {
        const vp = idx === 0 ? vietPrompts.scene1 : idx === 1 ? vietPrompts.scene2 : vietPrompts.scene3;
        // Mỗi lời thoại chỉ có một nhân vật nói và AI tự chọn ai sẽ nói lời thoại nào
        const chosenSpeaker = idx === 1 && secondChar ? secondChar : mainChar;
        return {
          ...s,
          imagePrompt: vp.imagePrompt,
          motionPrompt: vp.motionPrompt,
          characters: [chosenSpeaker],
        };
      });

      const finalSb: Storyboard = {
        ...result,
        theme: selectedTheme,
        durationSeconds: duration,
        style: 'Hoạt hình 3D dễ thương',
        scenes: updatedScenes,
      };

      setStoryboard(finalSb);
      onStoryboardSaved(finalSb);
      setIsApproved(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NÚT MỚI YÊU CẦU: Cho phép người dùng tạo lại prompt cả 3 cảnh sau khi chọn lại 'Phong cảnh & Thời lượng kịch bản'
  const handleRegeneratePromptsAllScenes = () => {
    if (!storyboard) return;
    const vietPrompts = buildVietnameseScenePrompts(selectedTheme, mainChar, secondChar, num1, num2, res, calc, unit, op);
    const updatedScenes = storyboard.scenes.map((s, idx) => {
      const vp = idx === 0 ? vietPrompts.scene1 : idx === 1 ? vietPrompts.scene2 : vietPrompts.scene3;
      // Mỗi lời thoại chỉ có một nhân vật nói và AI tự chọn ai sẽ nói lời thoại nào
      const chosenSpeaker = idx === 1 && secondChar ? secondChar : mainChar;
      return {
        ...s,
        duration: idx === 1 ? Math.round(duration * 0.4) : Math.round(duration * 0.3),
        setting: `Không gian ngập tràn ánh nắng ấm áp theo phong cảnh ${selectedTheme}`,
        characters: [chosenSpeaker],
        imagePrompt: vp.imagePrompt,
        motionPrompt: vp.motionPrompt,
      };
    });

    const updatedStoryboard: Storyboard = {
      ...storyboard,
      theme: selectedTheme,
      durationSeconds: duration,
      style: 'Hoạt hình 3D dễ thương',
      scenes: updatedScenes,
    };

    setStoryboard(updatedStoryboard);
    onStoryboardSaved(updatedStoryboard);
    setRegenerateSuccess(true);
    setTimeout(() => setRegenerateSuccess(false), 3000);
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleSceneChange = (sceneIdx: number, field: keyof Scene, value: any) => {
    if (!storyboard) return;
    const updatedScenes = [...storyboard.scenes];
    updatedScenes[sceneIdx] = {
      ...updatedScenes[sceneIdx],
      [field]: value,
    };
    const updated = { ...storyboard, scenes: updatedScenes };
    setStoryboard(updated);
    onStoryboardSaved(updated);
  };

  const handleApproveStoryboard = () => {
    if (!storyboard) return;
    setIsApproved(true);
    onStoryboardSaved(storyboard);
  };

  const handleExportJSON = () => {
    if (!storyboard) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storyboard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kich-ban-toan-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
              <Film className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 2: Biên Kịch Câu Chuyện &amp; Storyboard AI
            </h2>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
              Khung hình 16:9 • Hoạt hình 3D dễ thương • Prompt 100% tiếng Việt
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kịch bản được thiết lập hoàn toàn tự động từ nhân vật và phép tính của Phân hệ 1. Cảnh 2 tạm dừng tạo thử thách tương tác và KHÔNG làm lộ kết quả.
          </p>
        </div>

        {storyboard && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất kịch bản (JSON)</span>
            </button>
            <button
              onClick={handleApproveStoryboard}
              className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl shadow transition-all cursor-pointer ${
                isApproved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproved ? 'Đã duyệt kịch bản' : 'Duyệt kịch bản'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Configuration Bar: Sửa 'Cấu hình phong cách' thành 'Phong cảnh' */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
            Phong cảnh &amp; Thời lượng kịch bản
          </h3>
          <span className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
            Nhân vật tự động từ Phân hệ 1: {extractedChars.join(', ')}
          </span>
        </div>

        {/* 8 Themes Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Phong cảnh:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedTheme === t.id
                    ? 'bg-sky-50 border-sky-500 shadow-xs ring-2 ring-sky-300'
                    : 'border-slate-200 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <p className="text-[11px] font-extrabold text-slate-800 leading-tight line-clamp-1">
                  {t.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Action Buttons Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 items-end">
          {/* Nhân vật cố định từ Phân hệ 1 (Đã bỏ dropdown) */}
          <div className="md:col-span-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 block uppercase">
              Nhân vật trong kịch bản (Lấy từ Phân hệ 1):
            </span>
            <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
              <Users className="w-4 h-4 text-sky-600" />
              <span>{extractedChars.join(' & ')}</span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Đã tự động kế thừa nhân vật từ đề bài Phân hệ 1.
            </p>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Thời lượng mục tiêu:
            </label>
            <div className="flex gap-2">
              {[30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setDuration(sec)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    duration === sec
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Nút Tạo lại Prompt cả 3 cảnh sau khi chọn lại Phong cảnh */}
          <div className="md:col-span-5 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRegeneratePromptsAllScenes}
              disabled={!storyboard}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
              <span>Tạo Lại Prompt Cả 3 Cảnh</span>
            </button>

            <button
              onClick={handleGenerateScript}
              disabled={loading || !analysis}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang biên kịch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tạo Kịch Bản Mới</span>
                </>
              )}
            </button>
          </div>
        </div>

        {regenerateSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã tạo lại và cập nhật toàn bộ Prompt 3 cảnh bằng tiếng Việt theo phong cảnh "{selectedTheme}" thành công!</span>
          </div>
        )}
      </div>

      {/* Storyboard Scenes Display */}
      {storyboard ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {storyboard.scenes.map((scene, idx) => {
              const isInteractiveScene = Boolean(scene.interactiveQuestion);
              const isEditing = editingSceneIdx === idx;

              return (
                <div
                  key={scene.sceneNumber}
                  className={`bg-white rounded-3xl border-2 transition-all shadow-sm overflow-hidden flex flex-col ${
                    isInteractiveScene
                      ? 'border-amber-400 ring-2 ring-amber-100'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {/* Scene Card Header */}
                  <div
                    className={`p-4 flex items-center justify-between text-white ${
                      isInteractiveScene
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-sky-600 to-teal-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                        {scene.sceneNumber}
                      </span>
                      <h4 className="font-extrabold text-xs truncate max-w-[180px]">
                        {scene.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{scene.duration}s</span>
                    </div>
                  </div>

                  {/* Scene Start Image Preview */}
                  {scene.imageUrl && (
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-100">
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-2 bg-black/70 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-md font-bold">
                        16:9 • Hoạt hình 3D dễ thương
                      </span>
                    </div>
                  )}

                  {/* Scene Body */}
                  <div className="p-4 space-y-3.5 flex-1 text-xs">
                    {/* Setting & Action */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Bối cảnh &amp; Hành động:
                      </span>
                      {isEditing ? (
                        <textarea
                          value={scene.setting}
                          onChange={(e) => handleSceneChange(idx, 'setting', e.target.value)}
                          className="w-full text-xs p-2 border rounded bg-slate-50 font-medium"
                          rows={2}
                        />
                      ) : (
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {scene.setting}
                        </p>
                      )}
                    </div>

                    {/* Dialogue */}
                    <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                      <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-sky-800 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Lời thoại:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">Người nói:</span>
                          <select
                            value={scene.characters[0] || mainChar}
                            onChange={(e) => handleSceneChange(idx, 'characters', [e.target.value])}
                            className="bg-white border border-sky-300 text-sky-950 font-black text-xs rounded-lg px-2 py-0.5 cursor-pointer shadow-xs focus:ring-1 focus:ring-sky-500 outline-none"
                          >
                            {extractedChars.map((charName) => (
                              <option key={charName} value={charName}>
                                {charName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={scene.dialogue}
                          onChange={(e) => handleSceneChange(idx, 'dialogue', e.target.value)}
                          className="w-full text-xs p-2 border rounded bg-white font-medium"
                          rows={2}
                        />
                      ) : (
                        <p className="italic text-slate-800 font-semibold leading-relaxed">
                          "{scene.dialogue.replace(/\s*\([hH]oặc[^)]*\)/g, '')}"
                        </p>
                      )}
                    </div>

                    {/* Math Data Badge */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Dữ kiện:</span>
                      <span className="font-bold text-slate-800">{scene.mathData}</span>
                    </div>

                    {/* Interactive Question Box if scene 2 */}
                    {isInteractiveScene && scene.interactiveQuestion && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            Tạm dừng tương tác
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold">Điểm dừng: giây thứ 15</span>
                        </div>
                        <p className="font-extrabold text-amber-950 text-xs">
                          {scene.interactiveQuestion.question}
                        </p>
                        <div className="space-y-1">
                          {scene.interactiveQuestion.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg text-[11px] font-semibold border ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-white border-amber-200 text-slate-700'
                              }`}
                            >
                              {opt.label} {opt.isCorrect && '✓ (Đáp án đúng)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompts for Image & Video (VIẾT BẰNG TIẾNG VIỆT) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {/* Image prompt (Vietnamese) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center gap-1">
                            <Camera className="w-3 h-3 text-sky-600" />
                            <span>Prompt tạo ảnh (Tiếng Việt - 16:9 3D):</span>
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => handleCopyPrompt(scene.imagePrompt, `img-${idx}`)}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedPromptId === `img-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Chép</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            value={scene.imagePrompt}
                            onChange={(e) => handleSceneChange(idx, 'imagePrompt', e.target.value)}
                            className="w-full text-[11px] p-2.5 rounded-xl bg-slate-900 text-amber-200 font-mono border-2 border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed"
                            rows={3}
                            placeholder="Chỉnh sửa prompt tạo ảnh 3D cho cảnh này..."
                          />
                        ) : (
                          <div className="bg-slate-900 text-amber-200 p-2.5 rounded-xl font-mono text-[10px] leading-relaxed max-h-20 overflow-y-auto no-scrollbar">
                            {scene.imagePrompt}
                          </div>
                        )}
                      </div>

                      {/* Video Motion prompt (Vietnamese) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center gap-1">
                            <Film className="w-3 h-3 text-purple-600" />
                            <span>Prompt chuyển động video (Tiếng Việt):</span>
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => handleCopyPrompt(scene.motionPrompt, `mot-${idx}`)}
                              className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedPromptId === `mot-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Chép</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            value={scene.motionPrompt}
                            onChange={(e) => handleSceneChange(idx, 'motionPrompt', e.target.value)}
                            className="w-full text-[11px] p-2.5 rounded-xl bg-slate-900 text-sky-200 font-mono border-2 border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed"
                            rows={2}
                            placeholder="Chỉnh sửa prompt chuyển động video cho cảnh này..."
                          />
                        ) : (
                          <div className="bg-slate-900 text-sky-200 p-2.5 rounded-xl font-mono text-[10px] leading-relaxed max-h-16 overflow-y-auto no-scrollbar">
                            {scene.motionPrompt}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scene Card Footer Actions */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setEditingSceneIdx(isEditing ? null : idx)}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                        isEditing
                          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      <span>{isEditing ? 'Lưu chỉnh sửa cảnh' : 'Chỉnh sửa cảnh & Prompt'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">16:9 • 3D dễ thương</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Next Step Link */}
          {onGoToCharacters && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Đã hoàn tất kịch bản phân cảnh. Hãy chuyển sang <strong>Phân hệ 3 (Hồ sơ nhân vật)</strong> để kích hoạt nhân vật liên quan đến bài toán.
              </span>
              <button
                onClick={onGoToCharacters}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Chuyển Sang Nhân Vật (Phân hệ 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Film className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h4 className="font-extrabold text-slate-700 text-base">Chưa có kịch bản storyboard</h4>
          <p className="text-xs max-w-md mx-auto text-slate-500 leading-relaxed">
            Chọn phong cảnh mong muốn ở trên, sau đó bấm nút <strong>"Tạo Kịch Bản Mới"</strong> để biên kịch 3 phân cảnh chi tiết cho bài toán.
          </p>
        </div>
      )}
    </div>
  );
};
