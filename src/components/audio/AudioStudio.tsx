import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Play,
  Volume2,
  Sparkles,
  CheckCircle2,
  Music,
  Trash2,
  ArrowRight,
  Wand2,
  Square,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { Storyboard } from '../../types/mathStory';
import { soundEffects } from '../../utils/audioEffects';
import { getVoiceConfigForCharacter, speakDialogueWithWebSpeech, CharacterVoiceConfig } from '../../utils/characterVoice';

interface AudioStudioProps {
  storyboard: Storyboard | null;
  onSceneAudioUpdated: (sceneNumber: number, audioUrl: string) => void;
  onBackgroundMusicUpdated?: (bgMusic: string, bgVolume: number) => void;
  onGoToInteractivePlayer: () => void;
}

export function normalizeMathSpeech(text: string): string {
  if (!text) return '';
  let res = text;
  // 1. Remove unnatural parenthetical insertions
  res = res.replace(/\s*\([hH]oặc[^)]*\)/g, '');
  res = res.replace(/\s*\(và các[^)]*\)/g, '');

  // 2. Math operations:
  // Multiplication: 4x5=20, 4 x 5 = 20, 4*5=20, 4 × 5 = 20 -> 4 nhân 5 bằng 20
  res = res.replace(/(\d+)\s*[xX*×]\s*(\d+)\s*=\s*(\d+)/g, '$1 nhân $2 bằng $3');
  res = res.replace(/(\d+)\s*[xX*×]\s*(\d+)/g, '$1 nhân $2');

  // Division: 20:4=5, 20 : 4 = 5, 20 / 4 = 5 -> 20 chia 4 bằng 5
  res = res.replace(/(\d+)\s*[:/]\s*(\d+)\s*=\s*(\d+)/g, '$1 chia $2 bằng $3');
  res = res.replace(/(\d+)\s*[:/]\s*(\d+)/g, '$1 chia $2');

  // Addition: 25 + 17 = 42 -> 25 cộng 17 bằng 42
  res = res.replace(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g, '$1 cộng $2 bằng $3');
  res = res.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 cộng $2');

  // Subtraction: 25 - 17 = 8 -> 25 trừ 17 bằng 8
  res = res.replace(/(\d+)\s*-\s*(\d+)\s*=\s*(\d+)/g, '$1 trừ $2 bằng $3');
  res = res.replace(/(\d+)\s*-\s*(\d+)/g, '$1 trừ $2');

  // Equals: "= 20" -> "bằng 20"
  res = res.replace(/\s*=\s*(\d+)/g, ' bằng $1');

  return res.replace(/\s{2,}/g, ' ').trim();
}

export const AudioStudio: React.FC<AudioStudioProps> = ({
  storyboard,
  onSceneAudioUpdated,
  onBackgroundMusicUpdated,
  onGoToInteractivePlayer,
}) => {
  const scenes = storyboard?.scenes || [];
  const scene1 = scenes.find((s) => s.sceneNumber === 1) || scenes[0];
  const scene2 = scenes.find((s) => s.sceneNumber === 2) || scenes[1];
  const scene3 = scenes.find((s) => s.sceneNumber === 3) || scenes[2];

  // Character voice config states per scene
  const char1Name = scene1?.characters?.[0] || 'Bé Lan';
  const char2Name = scene2?.characters?.[0] || 'Bé Lan';
  const char3Name = scene3?.characters?.[0] || 'Bé Lan';

  const defaultConfig1 = getVoiceConfigForCharacter(char1Name);
  const defaultConfig2 = getVoiceConfigForCharacter(char2Name);
  const defaultConfig3 = getVoiceConfigForCharacter(char3Name);

  const parsePitch = (url?: string, fallback: number = 1.2) => {
    if (url && url.startsWith('web-speech:')) {
      const m = url.match(/pitch=([\d.]+)/);
      if (m) return parseFloat(m[1]);
    }
    return fallback;
  };

  const parseRate = (url?: string, fallback: number = 0.95) => {
    if (url && url.startsWith('web-speech:')) {
      const m = url.match(/rate=([\d.]+)/);
      if (m) return parseFloat(m[1]);
    }
    return fallback;
  };

  const [pitchScene1, setPitchScene1] = useState<number>(() => parsePitch(scene1?.audioUrl, defaultConfig1.pitch));
  const [rateScene1, setRateScene1] = useState<number>(() => parseRate(scene1?.audioUrl, defaultConfig1.rate));

  const [pitchScene2, setPitchScene2] = useState<number>(() => parsePitch(scene2?.audioUrl, defaultConfig2.pitch));
  const [rateScene2, setRateScene2] = useState<number>(() => parseRate(scene2?.audioUrl, defaultConfig2.rate));

  const [pitchScene3, setPitchScene3] = useState<number>(() => parsePitch(scene3?.audioUrl, defaultConfig3.pitch));
  const [rateScene3, setRateScene3] = useState<number>(() => parseRate(scene3?.audioUrl, defaultConfig3.rate));

  const prevCharsRef = useRef({ char1: char1Name, char2: char2Name, char3: char3Name });

  const [currentlySpeakingScene, setCurrentlySpeakingScene] = useState<number | null>(null);
  const [ttsStatusScene, setTtsStatusScene] = useState<Record<number, string>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);

  // Background music state
  const [bgMusic, setBgMusic] = useState<string>(storyboard?.bgMusic || 'vui-tuoi');
  const [bgVolume, setBgVolume] = useState<number>(storyboard?.bgVolume ?? 25);
  const [isPlayingMusicPreview, setIsPlayingMusicPreview] = useState<boolean>(false);

  // Sync background music state when storyboard changes
  useEffect(() => {
    if (storyboard?.bgMusic) setBgMusic(storyboard.bgMusic);
    if (storyboard?.bgVolume !== undefined) setBgVolume(storyboard.bgVolume);
  }, [storyboard?.bgMusic, storyboard?.bgVolume]);

  // Sync default pitch ONLY when character names genuinely change
  useEffect(() => {
    if (prevCharsRef.current.char1 !== char1Name) {
      setPitchScene1(getVoiceConfigForCharacter(char1Name).pitch);
      prevCharsRef.current.char1 = char1Name;
    }
    if (prevCharsRef.current.char2 !== char2Name) {
      setPitchScene2(getVoiceConfigForCharacter(char2Name).pitch);
      prevCharsRef.current.char2 = char2Name;
    }
    if (prevCharsRef.current.char3 !== char3Name) {
      setPitchScene3(getVoiceConfigForCharacter(char3Name).pitch);
      prevCharsRef.current.char3 = char3Name;
    }
  }, [char1Name, char2Name, char3Name]);

  const handleMusicChange = (newMusic: string) => {
    setBgMusic(newMusic);
    onBackgroundMusicUpdated?.(newMusic, bgVolume);
    if (isPlayingMusicPreview) {
      soundEffects.startBackgroundMusic(newMusic, bgVolume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setBgVolume(newVol);
    onBackgroundMusicUpdated?.(bgMusic, newVol);
    if (isPlayingMusicPreview) {
      soundEffects.setBackgroundMusicVolume(newVol);
    }
  };

  const toggleMusicPreview = () => {
    if (isPlayingMusicPreview) {
      soundEffects.stopBackgroundMusic();
      setIsPlayingMusicPreview(false);
    } else {
      soundEffects.startBackgroundMusic(bgMusic, bgVolume);
      setIsPlayingMusicPreview(true);
    }
  };

  useEffect(() => {
    return () => {
      soundEffects.stopBackgroundMusic();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper: Play dialogue with Web Speech API for a specific scene & update scene audio
  const playPreviewForScene = (sceneNumber: number) => {
    const targetScene = scenes.find((s) => s.sceneNumber === sceneNumber);
    if (!targetScene) return;

    let pitch = 1.2;
    let rate = 0.95;
    if (sceneNumber === 1) {
      pitch = pitchScene1;
      rate = rateScene1;
    } else if (sceneNumber === 2) {
      pitch = pitchScene2;
      rate = rateScene2;
    } else if (sceneNumber === 3) {
      pitch = pitchScene3;
      rate = rateScene3;
    }

    // Cập nhật lại âm thanh cảnh khi bấm "Nghe thử giọng"
    const markerUrl = `web-speech:pitch=${pitch}&rate=${rate}`;
    onSceneAudioUpdated(sceneNumber, markerUrl);

    const activeChar = sceneNumber === 1 ? char1Name : sceneNumber === 2 ? char2Name : char3Name;
    setTtsStatusScene((prev) => ({
      ...prev,
      [sceneNumber]: `🔊 Đang phát giọng ${activeChar} (Pitch: ${pitch.toFixed(2)}, Tốc độ: ${rate.toFixed(2)})!`,
    }));

    const spokenText = normalizeMathSpeech(targetScene.dialogue);
    setCurrentlySpeakingScene(sceneNumber);
    soundEffects.duckBackgroundMusic(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    speakDialogueWithWebSpeech(
      spokenText,
      { pitch, rate, volume: 1.0 },
      () => setCurrentlySpeakingScene(sceneNumber),
      () => {
        setCurrentlySpeakingScene(null);
        soundEffects.duckBackgroundMusic(false);
      },
      () => {
        setCurrentlySpeakingScene(null);
        soundEffects.duckBackgroundMusic(false);
      }
    );
  };

  // Helper for confirming/saving voice configuration for a given scene (không phát lại giọng đọc)
  const generateAiAudioForScene = (sceneNumber: number) => {
    const targetScene = scenes.find((s) => s.sceneNumber === sceneNumber);
    if (!targetScene) return;

    let pitch = 1.2;
    let rate = 0.95;
    if (sceneNumber === 1) {
      pitch = pitchScene1;
      rate = rateScene1;
    } else if (sceneNumber === 2) {
      pitch = pitchScene2;
      rate = rateScene2;
    } else if (sceneNumber === 3) {
      pitch = pitchScene3;
      rate = rateScene3;
    }

    // Cập nhật lại âm thanh cảnh khi bấm "Khóa giọng Cảnh X"
    const markerUrl = `web-speech:pitch=${pitch}&rate=${rate}`;
    onSceneAudioUpdated(sceneNumber, markerUrl);

    setTtsStatusScene((prev) => ({
      ...prev,
      [sceneNumber]: `✓ Đã khóa giọng Cảnh ${sceneNumber} (Pitch: ${pitch.toFixed(2)}, Tốc độ: ${rate.toFixed(2)})!`,
    }));

    // Khi Khóa giọng Cảnh thì không phát lại giọng đọc
  };

  // Batch generate all 3 scenes at once
  const handleGenerateAllScenes = () => {
    setIsGeneratingAll(true);
    generateAiAudioForScene(1);
    generateAiAudioForScene(2);
    generateAiAudioForScene(3);
    setTimeout(() => {
      setIsGeneratingAll(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-pink-100 text-pink-700">
              <Mic className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 5: Giọng Đọc Lời Thoại Web Speech API Theo Nhân Vật
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              Chuẩn Web Speech API tiếng Việt • Tự động chỉnh Pitch theo nhân vật
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tạo giọng đọc hoạt hình chạy trực tiếp trên trình duyệt, tùy chỉnh tông giọng (Pitch) cao thấp phù hợp hoàn hảo với nhân vật phát ra lời thoại (Bé Lan, Bác An, Mẹ...).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAllScenes}
            disabled={isGeneratingAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isGeneratingAll ? 'Đang kích hoạt cả 3 cảnh...' : '⚡ Tạo & Khóa Giọng Web Speech Cả 3 Cảnh'}</span>
          </button>
        </div>
      </div>

      {/* Background Music Config Card */}
      <div className="bg-white rounded-3xl p-5 border border-pink-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Nhạc Nền Hoạt Hình Đi Kèm Giọng AI:
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhạc nền sẽ tự động giảm âm lượng (ducking) êm ái khi giọng đọc AI phát lời thoại.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">{bgVolume}%</span>
            <button
              type="button"
              onClick={toggleMusicPreview}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isPlayingMusicPreview
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-200'
              }`}
            >
              {isPlayingMusicPreview ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng nghe</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Nghe thử nhạc</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <select
            value={bgMusic}
            onChange={(e) => handleMusicChange(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="vui-tuoi">🎵 Vui tươi: Bé tập đếm rộn ràng (C major vui nhộn)</option>
            <option value="diu-dang">🌸 Êm dịu: Vườn trường tuổi thơ (Piano êm dịu)</option>
            <option value="kham-pha">🚀 Khám phá: Vùng đất Toán học (Nhịp điệu phiêu lưu)</option>
            <option value="khong-nhac">🔇 Không phát nhạc nền</option>
          </select>

          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-bold whitespace-nowrap">Âm lượng nhạc:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={bgVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-pink-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {storyboard ? (
        /* 3 CARDS: TẠO GIỌNG ĐỌC WEB SPEECH API THEO TỪNG NHÂN VẬT & ĐIỀU CHỈNH PITCH */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* CẢNH 1 */}
          {scene1 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-sky-300 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-black text-slate-900 text-sm">
                      CẢNH 1: {scene1.title.replace(/^cảnh\s*\d+\s*:\s*/i, '')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Khởi đầu
                  </span>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-sky-900 font-extrabold">
                      Nhân vật nói: <strong className="text-sky-950 underline">{char1Name}</strong>
                    </span>
                    <span className="text-[9.5px] font-bold bg-white text-sky-800 px-2 py-0.5 rounded-md border border-sky-200">
                      {defaultConfig1.badge}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 italic bg-white p-2.5 rounded-xl border border-sky-100">
                    "{scene1.dialogue.replace(/\s*\([hH]oặc[^)]*\)/g, '')}"
                  </p>
                </div>

                {/* Web Speech Pitch & Rate Controls */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1.5 text-purple-900">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tông giọng (Pitch) của {char1Name}:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[11px]">
                      {pitchScene1.toFixed(2)} {pitchScene1 >= 1.3 ? '(Trong sáng)' : pitchScene1 <= 0.9 ? '(Trầm ấm)' : '(Vừa phải)'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={pitchScene1}
                    onChange={(e) => setPitchScene1(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                    <span>0.6 (Trầm nam/Bác)</span>
                    <span>1.05 (Người lớn/Mẹ)</span>
                    <span>1.0 (Bé Lan)</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-[11px]">Tốc độ đọc (Rate):</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">
                      {rateScene1.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={rateScene1}
                    onChange={(e) => setRateScene1(parseFloat(e.target.value))}
                    className="w-full accent-slate-600 cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => playPreviewForScene(1)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                        currentlySpeakingScene === 1
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{currentlySpeakingScene === 1 ? 'Đang nói...' : 'Nghe thử giọng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateAiAudioForScene(1)}
                      className="py-2 px-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Khóa giọng Cảnh 1</span>
                    </button>
                  </div>

                  {ttsStatusScene[1] && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                      {ttsStatusScene[1]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CẢNH 2 */}
          {scene2 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-black text-slate-900 text-sm">
                      CẢNH 2: {scene2.title.replace(/^cảnh\s*\d+\s*:\s*/i, '')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Dừng câu hỏi ❓
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-amber-950 font-extrabold">
                      Nhân vật nói: <strong className="text-amber-950 underline">{char2Name}</strong>
                    </span>
                    <span className="text-[9.5px] font-bold bg-white text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                      {defaultConfig2.badge}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 italic bg-white p-2.5 rounded-xl border border-amber-100">
                    "{scene2.dialogue.replace(/\s*\([hH]oặc[^)]*\)/g, '')}"
                  </p>
                </div>

                {/* Web Speech Pitch & Rate Controls */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1.5 text-purple-900">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tông giọng (Pitch) của {char2Name}:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[11px]">
                      {pitchScene2.toFixed(2)} {pitchScene2 >= 1.3 ? '(Trong sáng)' : pitchScene2 <= 0.9 ? '(Trầm ấm)' : '(Vừa phải)'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={pitchScene2}
                    onChange={(e) => setPitchScene2(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                    <span>0.6 (Trầm nam/Bác)</span>
                    <span>1.05 (Người lớn/Mẹ)</span>
                    <span>1.0 (Bé Lan)</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-[11px]">Tốc độ đọc (Rate):</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">
                      {rateScene2.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={rateScene2}
                    onChange={(e) => setRateScene2(parseFloat(e.target.value))}
                    className="w-full accent-slate-600 cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => playPreviewForScene(2)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                        currentlySpeakingScene === 2
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{currentlySpeakingScene === 2 ? 'Đang nói...' : 'Nghe thử giọng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateAiAudioForScene(2)}
                      className="py-2 px-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Khóa giọng Cảnh 2</span>
                    </button>
                  </div>

                  {ttsStatusScene[2] && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                      {ttsStatusScene[2]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CẢNH 3 */}
          {scene3 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-emerald-300 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-black text-slate-900 text-sm">
                      CẢNH 3: {scene3.title.replace(/^cảnh\s*\d+\s*:\s*/i, '')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Kết luận đáp số
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-emerald-950 font-extrabold">
                      Nhân vật nói: <strong className="text-emerald-950 underline">{char3Name}</strong>
                    </span>
                    <span className="text-[9.5px] font-bold bg-white text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                      {defaultConfig3.badge}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 italic bg-white p-2.5 rounded-xl border border-emerald-100">
                    "{scene3.dialogue.replace(/\s*\([hH]oặc[^)]*\)/g, '')}"
                  </p>
                </div>

                {/* Web Speech Pitch & Rate Controls */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1.5 text-purple-900">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tông giọng (Pitch) của {char3Name}:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[11px]">
                      {pitchScene3.toFixed(2)} {pitchScene3 >= 1.3 ? '(Trong sáng)' : pitchScene3 <= 0.9 ? '(Trầm ấm)' : '(Vừa phải)'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={pitchScene3}
                    onChange={(e) => setPitchScene3(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                    <span>0.6 (Trầm nam/Bác)</span>
                    <span>1.05 (Người lớn/Mẹ)</span>
                    <span>1.0 (Bé Lan)</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-[11px]">Tốc độ đọc (Rate):</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">
                      {rateScene3.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={rateScene3}
                    onChange={(e) => setRateScene3(parseFloat(e.target.value))}
                    className="w-full accent-slate-600 cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => playPreviewForScene(3)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                        currentlySpeakingScene === 3
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{currentlySpeakingScene === 3 ? 'Đang nói...' : 'Nghe thử giọng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateAiAudioForScene(3)}
                      className="py-2 px-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Khóa giọng Cảnh 3</span>
                    </button>
                  </div>

                  {ttsStatusScene[3] && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                      {ttsStatusScene[3]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Mic className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h4 className="font-extrabold text-slate-700 text-base">Chưa có kịch bản lời thoại</h4>
          <p className="text-xs max-w-md mx-auto text-slate-500 leading-relaxed">
            Vui lòng hoàn thành kịch bản ở Phân hệ 2 để có lời thoại tạo giọng đọc AI.
          </p>
        </div>
      )}

      {/* Bottom Navigation Bar like Phân hệ 1 */}
      {storyboard && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Đã hoàn thành tạo giọng đọc AI cho các cảnh. Chuyển sang <strong>Phân hệ 6</strong> để tổng hợp video và âm thanh.
          </div>
          <button
            onClick={onGoToInteractivePlayer}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Sang Tạo Video &amp; Âm Thanh (Phân hệ 6)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
