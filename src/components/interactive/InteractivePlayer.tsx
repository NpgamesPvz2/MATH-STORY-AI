import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  Smile,
  ShieldCheck,
  Award,
  Layers,
  Wand2,
  Film,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ErrorType,
  InteractiveQuestion,
  ProjectLesson,
  Scene,
} from '../../types/mathStory';
import { submitStudentAnswer } from '../../services/api';
import { BaseTenBlocksVisual, OrangeCounterVisual } from '../common/DeterministicVisuals';
import { CartoonAnimatedVideo } from './CartoonAnimatedVideo';
import { soundEffects } from '../../utils/audioEffects';
import { normalizeMathSpeech } from '../audio/AudioStudio';
import { getVoiceConfigForCharacter, speakDialogueWithWebSpeech } from '../../utils/characterVoice';

interface InteractivePlayerProps {
  project: ProjectLesson;
  isDemoMode: boolean;
  studentName?: string;
  studentCode?: string;
  onGoToPersonalizedTier: () => void;
  onGoToAnalysis?: () => void;
  selectedGrade?: string;
}

export const InteractivePlayer: React.FC<InteractivePlayerProps> = ({
  project,
  isDemoMode,
  studentName,
  studentCode,
  onGoToPersonalizedTier,
  onGoToAnalysis,
  selectedGrade = 'Lớp 2',
}) => {
  const currentGradeName = project.grade || selectedGrade || 'Lớp 2';
  const effectiveStudentName = studentName || `Học sinh ${currentGradeName}`;
  const effectiveStudentCode = studentCode || `HS-${currentGradeName.replace(/\s+/g, '')}-01`;

  const scenes = project.storyboard?.scenes || [];

  // Xác định số lượng nhân vật thực tế trong bài toán
  const rawCharacters = project.mathAnalysis?.charactersInProblem;
  const storyboardChars = project.storyboard?.scenes
    ? Array.from(new Set(project.storyboard.scenes.flatMap((s) => s.characters || []))).filter(Boolean)
    : [];

  const charactersList = rawCharacters?.length ? rawCharacters : storyboardChars;
  const isSingleCharacter = charactersList.length <= 1;
  const effectiveCharactersList = charactersList.length > 0 ? charactersList : ['Bé Lan'];
  const hasMoreThanTwoCharacters = effectiveCharactersList.length > 2;

  const mainCharacterName = effectiveCharactersList[0] || 'Bé Lan';
  const secondCharacterName = isSingleCharacter ? '' : (effectiveCharactersList[1] || '');

  // State: "Sau khi tạo xong thì mới phát toàn bộ"
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateProgress, setGenerateProgress] = useState<number>(0);

  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [dialogueReplayToken, setDialogueReplayToken] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 100
  const [isPausedForQuestion, setIsPausedForQuestion] = useState<boolean>(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [completedStory, setCompletedStory] = useState<boolean>(false);
  const [interactiveMode, setInteractiveMode] = useState<'multiple-choice' | 'drag-drop'>('multiple-choice');
  const [draggedOrangesCount, setDraggedOrangesCount] = useState<number>(project.mathAnalysis?.num1 ?? 25);

  // Audio subsystem states for Gemini TTS and ambient background music
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const dialogueOffsetRef = useRef(0);
  const speechPausedRef = useRef(false);
  const speechRequestIdRef = useRef(0);
  const mediaVolumesRef = useRef(new WeakMap<HTMLMediaElement, number>());
  const theaterRef = useRef<HTMLDivElement>(null);

  // Trigger synthesis of entire video and audio
  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGenerateProgress(10);

    const timer1 = setTimeout(() => setGenerateProgress(40), 400);
    const timer2 = setTimeout(() => setGenerateProgress(75), 800);
    const timer3 = setTimeout(() => {
      setGenerateProgress(100);
      setIsGenerating(false);
      setIsGenerated(true);
      // "Sau khi tạo xong thì mới phát toàn bộ"
      setCurrentSceneIdx(0);
      setSceneProgress(0);
      setIsPausedForQuestion(false);
      setSelectedOptionIdx(null);
      setAnswerState('idle');
      setCompletedStory(false);
      setIsPlaying(true);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      currentUtteranceRef.current = null;
      soundEffects.stopAll();
    };
  }, []);

  const currentScene: Scene | undefined = scenes[currentSceneIdx];
  const question: InteractiveQuestion | null = currentScene?.interactiveQuestion || null;

  const playSceneDialogue = (
    text: string,
    customAudioUrl?: string,
    startAt = 0,
    muted = isAudioMuted,
  ) => {
    if (!text && !customAudioUrl) return;

    const requestId = ++speechRequestIdRef.current;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const speaker = isSingleCharacter
      ? mainCharacterName
      : (currentScene?.characters?.[0] || mainCharacterName);

    // Tự động phân tích và điều chỉnh Pitch theo nhân vật phát ra lời thoại
    const voiceCfg = getVoiceConfigForCharacter(speaker);
    let finalPitch = voiceCfg.pitch;
    let finalRate = voiceCfg.rate;

    // Nhận thông số tùy chỉnh đã lưu từ Phân hệ 5 nếu có
    if (customAudioUrl && customAudioUrl.startsWith('web-speech:')) {
      const matchPitch = customAudioUrl.match(/pitch=([\d.]+)/);
      const matchRate = customAudioUrl.match(/rate=([\d.]+)/);
      if (matchPitch) finalPitch = parseFloat(matchPitch[1]);
      if (matchRate) finalRate = parseFloat(matchRate[1]);
    }

    // Tạo giọng đọc lời thoại bằng Web Speech API và điều chỉnh pitch phù hợp với nhân vật
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
      const spokenText = normalizeMathSpeech(text);
      const resumeOffset = Math.min(startAt, spokenText.length);
      dialogueOffsetRef.current = resumeOffset;
      setIsTtsPlaying(true);
      soundEffects.duckBackgroundMusic(true);

      speakDialogueWithWebSpeech(
        spokenText.slice(resumeOffset),
        { pitch: finalPitch, rate: finalRate, volume: muted ? 0 : 1.0 },
        () => {
          if (speechRequestIdRef.current === requestId) setIsTtsPlaying(true);
        },
        () => {
          if (speechRequestIdRef.current !== requestId) return;
          currentUtteranceRef.current = null;
          setIsTtsPlaying(false);
          if (!isPausedForQuestion) {
            soundEffects.duckBackgroundMusic(false);
          }
        },
        () => {
          if (speechRequestIdRef.current !== requestId) return;
          currentUtteranceRef.current = null;
          setIsTtsPlaying(false);
          soundEffects.duckBackgroundMusic(false);
        },
        (utterance) => {
          if (speechRequestIdRef.current === requestId) {
            currentUtteranceRef.current = utterance;
          }
        },
        (charIndex) => {
          if (speechRequestIdRef.current === requestId) {
            dialogueOffsetRef.current = resumeOffset + charIndex;
          }
        },
      );
    }
  };

  // Scene progression timer during playback
  useEffect(() => {
    let interval: any = null;

    if (isGenerated && isPlaying && !isPausedForQuestion && !completedStory) {
      interval = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev >= 100) {
            if (currentScene?.interactiveQuestion && answerState !== 'correct') {
              setIsPausedForQuestion(true);
              setIsPlaying(false);
              soundEffects.playDingDong();
              return 100;
            }

            if (currentSceneIdx < scenes.length - 1) {
              const nextIdx = currentSceneIdx + 1;
              setCurrentSceneIdx(nextIdx);
              setSceneProgress(0);
              return 0;
            } else {
              setCompletedStory(true);
              setIsPlaying(false);
              soundEffects.playCelebration();
              return 100;
            }
          }
          return prev + 2.5;
        });
      }, 250);
    }

    return () => clearInterval(interval);
  }, [isGenerated, isPlaying, isPausedForQuestion, currentSceneIdx, scenes.length, answerState, completedStory]);

  // Audio dialogue trigger when scene changes after generation
  useEffect(() => {
    if (isGenerated && isPlaying && currentScene && !isPausedForQuestion && !completedStory) {
      playSceneDialogue(currentScene.dialogue, currentScene.audioUrl);
    }
  }, [currentSceneIdx, isGenerated, dialogueReplayToken]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying && !isPausedForQuestion && !completedStory) {
      if (speechPausedRef.current && currentScene) {
        speechPausedRef.current = false;
        playSceneDialogue(currentScene.dialogue, currentScene.audioUrl, dialogueOffsetRef.current);
      } else {
        window.speechSynthesis.resume();
      }
    } else if (isGenerated && window.speechSynthesis.speaking) {
      speechPausedRef.current = true;
      speechRequestIdRef.current += 1;
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
      setIsTtsPlaying(false);
    }
  }, [isGenerated, isPlaying, isPausedForQuestion, completedStory]);

  useEffect(() => {
    soundEffects.setBackgroundMusicMuted(isAudioMuted);
  }, [isAudioMuted]);

  const handlePlaybackToggle = () => {
    const shouldPlay = !isPlaying;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (shouldPlay) {
        if (speechPausedRef.current && currentScene) {
          speechPausedRef.current = false;
          playSceneDialogue(currentScene.dialogue, currentScene.audioUrl, dialogueOffsetRef.current);
        } else {
          window.speechSynthesis.resume();
        }
      } else {
        speechPausedRef.current = true;
        speechRequestIdRef.current += 1;
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
        setIsTtsPlaying(false);
        soundEffects.pauseBackgroundMusic();
      }
    }
    theaterRef.current?.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
      if (shouldPlay) {
        void media.play().catch((error) => console.error('Không thể tiếp tục phát âm thanh video:', error));
      } else {
        media.pause();
      }
    });
    setIsPlaying(shouldPlay);
  };

  const handleMuteToggle = () => {
    const muted = !isAudioMuted;
    setIsAudioMuted(muted);
    soundEffects.setBackgroundMusicMuted(muted);

    if (
      isPlaying &&
      !isPausedForQuestion &&
      !completedStory &&
      currentScene &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking
    ) {
      playSceneDialogue(currentScene.dialogue, currentScene.audioUrl, dialogueOffsetRef.current, muted);
    }

    theaterRef.current?.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
      if (muted) {
        mediaVolumesRef.current.set(media, media.volume);
        media.volume = 0;
      } else {
        media.volume = mediaVolumesRef.current.get(media) ?? 1;
      }
    });
  };

  // Background music loop during playback
  useEffect(() => {
    const bgTheme = project.storyboard?.bgMusic || 'vui-tuoi';
    const bgVol = project.storyboard?.bgVolume ?? 25;

    if (isGenerated && isPlaying && !completedStory && bgTheme !== 'khong-nhac') {
      soundEffects.startBackgroundMusic(bgTheme, bgVol);
      if (isPausedForQuestion || isTtsPlaying) {
        soundEffects.duckBackgroundMusic(true);
      } else {
        soundEffects.duckBackgroundMusic(false);
      }
    } else {
      soundEffects.pauseBackgroundMusic();
    }

    return () => {
      soundEffects.stopBackgroundMusic();
    };
  }, [isGenerated, isPlaying, isPausedForQuestion, completedStory, isTtsPlaying, project.storyboard?.bgMusic, project.storyboard?.bgVolume]);

  const handleSelectOption = async (optionIdx: number) => {
    if (!question) return;
    setSelectedOptionIdx(optionIdx);
    const chosen = question.options[optionIdx];
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    if (chosen.isCorrect) {
      setAnswerState('correct');
      setFeedbackText(chosen.feedback);
      soundEffects.playCelebration();

      await submitStudentAnswer({
        projectId: project.id,
        studentCode: effectiveStudentCode,
        studentName: effectiveStudentName,
        chosenOption: chosen.label,
        isCorrect: true,
        attemptCount: newAttempt,
        timeTakenSeconds: 12,
        errorType: 'KHÔNG_CÓ',
        isDemo: isDemoMode,
      });
    } else {
      setAnswerState('incorrect');
      setFeedbackText(chosen.feedback);
      setCurrentHintLevel((prev) => Math.min(prev + 1, 2));
      soundEffects.playTryAgain();

      await submitStudentAnswer({
        projectId: project.id,
        studentCode: effectiveStudentCode,
        studentName: effectiveStudentName,
        chosenOption: chosen.label,
        isCorrect: false,
        attemptCount: newAttempt,
        timeTakenSeconds: 15,
        errorType: 'SAI_LỰA_CHỌN_PHÉP_TÍNH',
        isDemo: isDemoMode,
      });
    }
  };

  const handleResumeStory = () => {
    dialogueOffsetRef.current = 0;
    speechPausedRef.current = false;
    setIsPausedForQuestion(false);
    setAnswerState('idle');
    setSelectedOptionIdx(null);
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
      setSceneProgress(0);
      setIsPlaying(true);
    } else {
      setCompletedStory(true);
    }
  };

  const handleRestart = () => {
    dialogueOffsetRef.current = 0;
    speechPausedRef.current = false;
    setCurrentSceneIdx(0);
    setDialogueReplayToken((prev) => prev + 1);
    setSceneProgress(0);
    setIsPausedForQuestion(false);
    setSelectedOptionIdx(null);
    setAnswerState('idle');
    setFeedbackText('');
    setCurrentHintLevel(0);
    setAttemptCount(0);
    setCompletedStory(false);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-sky-600 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black backdrop-blur-xs">
              🎬 PHÂN HỆ 6: TẠO VIDEO &amp; ÂM THANH HOÀN CHỈNH
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">{project.title}</h2>
          <p className="text-xs text-amber-100 font-medium">
            Lấy Prompt từ Phân hệ 4 &bull; Lấy Âm thanh từ Phân hệ 5 &bull; Sau khi tạo xong mới phát toàn bộ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInteractiveMode(interactiveMode === 'multiple-choice' ? 'drag-drop' : 'multiple-choice')}
            className="px-3.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
          >
            {interactiveMode === 'multiple-choice' ? 'Chuyển sang đếm trực quan' : 'Chuyển sang trắc nghiệm'}
          </button>
        </div>
      </div>

      {/* RÀNG BUỘC: NẾU CÓ > 2 NHÂN VẬT THÌ KHÔNG CÓ VIDEO Ở PHÂN HỆ 6 */}
      {hasMoreThanTwoCharacters ? (
        <div className="bg-rose-50 border-3 border-rose-500 rounded-3xl p-8 space-y-4 text-rose-950 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            ⛔
          </div>
          <h3 className="text-xl font-black text-rose-900 uppercase">
            KHÔNG CÓ VIDEO Ở PHÂN HỆ 6
          </h3>
          <p className="text-sm font-semibold max-w-lg mx-auto leading-relaxed">
            Bài toán này được xác định có             <strong>{effectiveCharactersList.length} nhân vật ({effectiveCharactersList.join(', ')})</strong>, vượt quá giới hạn tối đa 2 nhân vật theo quy định của hệ thống.
          </p>
          <div className="bg-white p-4 rounded-2xl border border-rose-300 max-w-md mx-auto text-xs text-rose-900">
            Vì không được phép lên kịch bản ở Phân hệ 4 nên không thể tạo video và âm thanh ở Phân hệ 6.
          </div>
          {onGoToAnalysis && (
            <button
              onClick={onGoToAnalysis}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Quay Lại Phân Hệ 1 Chỉnh Sửa Đề Bài</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : !isGenerated ? (
        /* GIAI ĐOẠN 1: CHUẨN BỊ TẠO VIDEO & ÂM THANH (CHƯA TẠO XONG NÊN CHƯA PHÁT) */
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 rounded-xl text-amber-700">
                <Wand2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Tổng Hợp Nguồn Tạo Video (Phân hệ 4) &amp; Âm Thanh Web Speech (Phân hệ 5)
                </h3>
                <p className="text-xs text-slate-500">
                  Sử dụng Prompt Kịch Bản Kết Hợp Cả 3 Cảnh từ Phân hệ 4 và Giọng đọc Web Speech API để sản xuất video 16:9 hoàn chỉnh
                </p>
              </div>
            </div>

            <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
              Chờ tạo để phát
            </span>
          </div>

          {/* Integration Status Grid of 3 Scenes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {scenes.map((s) => {
              const charName = isSingleCharacter ? mainCharacterName : (s.characters?.[0] || mainCharacterName);
              const cfg = getVoiceConfigForCharacter(charName);
              return (
                <div key={s.sceneNumber} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                        {s.sceneNumber}
                      </span>
                      <span className="font-black text-slate-900 text-left">
                        {s.title.replace(/^cảnh\s*\d+\s*:\s*/i, '')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                      Pitch: {cfg.pitch.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block">
                      1. Kịch bản &amp; Lời thoại:
                    </span>
                    <p className="text-[11px] text-slate-800 font-bold italic line-clamp-2">
                      "{s.dialogue}"
                    </p>
                  </div>

                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block">
                      2. Giọng đọc Web Speech API:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-slate-700">
                        {charName} ({cfg.badge.split('•')[0].trim()})
                      </span>
                      {s.audioUrl ? (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Đã có
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Chưa có
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-bold text-sky-950">
                <span>Đang tổng hợp Video 16:9 từ Prompt Kịch Bản Kết Hợp &amp; Giọng đọc Web Speech...</span>
                <span>{generateProgress}%</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden border border-sky-200">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${generateProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50 hover:scale-102"
            >
              <Wand2 className="w-5 h-5 text-amber-200" />
              <span>{isGenerating ? 'Đang tạo video & âm thanh...' : '🎬 Tạo & Ghép Video + Âm Thanh Hoàn Chỉnh'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              * Theo yêu cầu: Sau khi quá trình tạo hoàn tất, toàn bộ video và âm thanh sẽ được phát tự động.
            </p>
          </div>
        </div>
      ) : (
        /* GIAI ĐOẠN 2: ĐÃ TẠO XONG -> MỚI PHÁT TOÀN BỘ VIDEO & ÂM THANH */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã hoàn tất tạo Video 3D (từ Prompt Kết Hợp Phân hệ 4) và Giọng đọc Web Speech (Phân hệ 5)! Đang phát toàn bộ.</span>
            </div>
            <button
              onClick={() => setIsGenerated(false)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tạo lại</span>
            </button>
          </div>

          {/* Main Interactive Screen Theater */}
          <div ref={theaterRef} className="relative bg-slate-950 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl">
            {/* Video / Visual Screen Area (16:9 3D) */}
            <div className="relative aspect-video w-full flex items-center justify-center bg-slate-900">
              {currentScene && (
                <CartoonAnimatedVideo
                  sceneNumber={currentScene.sceneNumber}
                  isPlaying={isPlaying && !isPausedForQuestion}
                  dialogue={currentScene.dialogue}
                  mathData={currentScene.mathData}
                  num1={project.mathAnalysis?.num1}
                  num2={project.mathAnalysis?.num2}
                  result={project.mathAnalysis?.result ?? undefined}
                  operation={project.mathAnalysis?.operation}
                  unit={project.mathAnalysis?.unit}
                  characterName={mainCharacterName}
                  character2Name={secondCharacterName}
                  isSingleCharacter={isSingleCharacter}
                  problemTitle={project.title}
                />
              )}

              {/* INTERACTIVE QUESTION OVERLAY (POPS UP AT SCENE 2) */}
              {isPausedForQuestion && question && (
                <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md p-6 flex flex-col justify-center items-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-w-xl w-full bg-white rounded-3xl p-6 border-4 border-amber-400 shadow-2xl space-y-4 text-slate-800">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                          ❓
                        </span>
                        <h3 className="text-base font-black text-amber-950">
                          THỬ THÁCH TƯ DUY CHO BÉ
                        </h3>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full">
                        {mainCharacterName} đang chờ em giúp!
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 leading-snug">
                      {question.question}
                    </div>

                    <div className="space-y-2.5">
                      {question.options.map((opt, idx) => {
                        const isSelected = selectedOptionIdx === idx;
                        let style = 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white';

                        if (isSelected) {
                          if (answerState === 'correct') {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300';
                          } else if (answerState === 'incorrect') {
                            style = 'border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-300';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full p-3.5 rounded-2xl border-2 text-left font-extrabold text-sm flex items-center justify-between transition-all cursor-pointer shadow-xs ${style}`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && answerState === 'correct' && (
                              <span className="text-emerald-600 font-black">✓ Đúng rồi!</span>
                            )}
                            {isSelected && answerState === 'incorrect' && (
                              <span className="text-amber-600 font-bold">Thử lại nhé</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {answerState === 'correct' && (
                      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                          <Sparkles className="w-5 h-5 text-emerald-600 animate-bounce" />
                          <span>HOAN HÔ EM! CHÍNH XÁC TUYỆT ĐỐI!</span>
                        </div>
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                          {feedbackText}
                        </p>
                        <button
                          onClick={handleResumeStory}
                          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Tiếp Tục Xem Câu Chuyện Kết Thúc</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {answerState === 'incorrect' && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                          <Smile className="w-4 h-4 text-amber-600" />
                          <span>Không sao cả, hãy đọc gợi ý nhé:</span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium">{feedbackText}</p>
                        {currentHintLevel >= 1 && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                            <p className="font-bold">💡 Gợi ý 1: {question.hintStep1}</p>
                            {currentHintLevel >= 2 && (
                              <p className="font-bold text-sky-800">💡 Gợi ý 2: {question.hintStep2}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STORY COMPLETED OVERLAY */}
              {completedStory && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col justify-center items-center animate-in fade-in duration-300 text-white text-center">
                  <div className="max-w-md w-full bg-gradient-to-b from-sky-900 to-slate-900 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-2xl">
                    <div className="text-4xl animate-bounce">🎉🏆</div>
                    <h3 className="text-xl font-black text-amber-300">
                      CHÚC MỪNG EM ĐÃ HOÀN THÀNH BÀI TOÁN!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {mainCharacterName} đã tìm ra đáp án là <strong>{project.mathAnalysis?.result ?? 42} {project.mathAnalysis?.unit ?? 'quả cam'}</strong> bằng phép tính <strong>{project.mathAnalysis?.calculation ? `${project.mathAnalysis.calculation} = ${project.mathAnalysis.result}` : '25 + 17 = 42'}</strong>!
                    </p>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={onGoToPersonalizedTier}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Luyện Tập 3 Mức Độ Cá Nhân Hóa (Phân hệ 7)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleRestart}
                        className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                      >
                        Phát lại toàn bộ video từ đầu
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Playback Control Bar */}
            <div className="bg-slate-900 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlaybackToggle}
                  disabled={isPausedForQuestion || completedStory}
                  className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer shadow"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <span className="font-bold text-slate-300">
                  Cảnh {currentScene?.sceneNumber}: {currentScene?.duration}s
                </span>
                <button
                  onClick={handleMuteToggle}
                  aria-label={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  title={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4 text-pink-300" />}
                </button>
                <button
                  onClick={handleRestart}
                  aria-label="Phát lại từ đầu"
                  title="Phát lại từ đầu"
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-24 mx-2 md:mx-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-300"
                  style={{ width: `${sceneProgress}%` }}
                />
              </div>

              <span className="text-[11px] text-amber-300 font-extrabold">
                {isPausedForQuestion ? 'TẠM DỪNG: CÂU HỎI' : isPlaying ? 'ĐANG PHÁT TOÀN BỘ' : 'TẠM DỪNG'}
              </span>
            </div>
          </div>

          {/* Quick Scene Jump */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Chuyển cảnh nhanh:</span>
            <div className="flex gap-2">
              {scenes.map((s, idx) => (
                <button
                  key={s.sceneNumber}
                  onClick={() => {
                    dialogueOffsetRef.current = 0;
                    speechPausedRef.current = false;
                    setCurrentSceneIdx(idx);
                    setDialogueReplayToken((prev) => prev + 1);
                    setSceneProgress(0);
                    setIsPausedForQuestion(false);
                    setAnswerState('idle');
                    setIsPlaying(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    currentSceneIdx === idx ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cảnh {s.sceneNumber} {s.interactiveQuestion ? '(Dừng hỏi)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternative Interactive Mode: Drag-Drop / Visual Counter */}
      {interactiveMode === 'drag-drop' && isGenerated && !hasMoreThanTwoCharacters && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Thao Tác Trực Quan: Đếm Số Lượng {project.mathAnalysis?.unit || 'quả cam'}
              </h3>
              <p className="text-xs text-slate-500">
                Lúc đầu có {project.mathAnalysis?.num1 ?? 25} {project.mathAnalysis?.unit || 'quả cam'}. Bấm nút để trực quan hóa số lượng và tính toán.
              </p>
            </div>
            <button
              onClick={() => setDraggedOrangesCount(project.mathAnalysis?.num1 ?? 25)}
              className="text-xs text-sky-700 font-bold bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer"
            >
              Đặt lại ban đầu
            </button>
          </div>

          <OrangeCounterVisual
            count={draggedOrangesCount}
            unit={project.mathAnalysis?.unit || 'quả cam'}
            label={`Số lượng hiện tại: ${draggedOrangesCount} ${project.mathAnalysis?.unit || 'quả cam'}`}
          />

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDraggedOrangesCount((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs cursor-pointer"
            >
              + 1 {project.mathAnalysis?.unit || 'đơn vị'}
            </button>
            <button
              onClick={() => setDraggedOrangesCount((prev) => prev + 10)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              + 10 (1 chục)
            </button>
            <button
              onClick={() => setDraggedOrangesCount(project.mathAnalysis?.result ?? 42)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Kết quả chuẩn ({project.mathAnalysis?.result ?? 42})
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar like Phân hệ 1 */}
      {!hasMoreThanTwoCharacters && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Đã hoàn thành tạo và trải nghiệm video hoạt hình bài toán. Chuyển sang <strong>Phân hệ 7</strong> để làm bài tập 3 mức độ.
          </div>
          <button
            onClick={onGoToPersonalizedTier}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Chuyển Sang Cá Nhân Hóa (Phân hệ 7)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
