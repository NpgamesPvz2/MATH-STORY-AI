import React, { useState, useEffect } from 'react';
import { Volume2, Star, Award, Heart, CheckCircle2, Flame } from 'lucide-react';

interface CartoonAnimatedVideoProps {
  sceneNumber: number;
  isPlaying: boolean;
  dialogue: string;
  mathData: string;
  onTimeUpdate?: (seconds: number) => void;
  // Dynamic fields propagated from preceding subsystems
  num1?: number;
  num2?: number;
  result?: number;
  operation?: string;
  unit?: string;
  characterName?: string;
  character2Name?: string;
  isSingleCharacter?: boolean;
  problemTitle?: string;
}

export const CartoonAnimatedVideo: React.FC<CartoonAnimatedVideoProps> = ({
  sceneNumber,
  isPlaying,
  dialogue,
  mathData,
  num1,
  num2,
  result,
  operation = 'CỘNG',
  unit,
  characterName = 'Bé Lan',
  character2Name = '',
  isSingleCharacter = false,
  problemTitle,
}) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  // Single character detection: either explicit prop or empty/none/duplicate second character
  const singleCharMode = Boolean(
    isSingleCharacter ||
    !character2Name ||
    character2Name.trim() === '' ||
    character2Name.trim().toLowerCase() === 'none' ||
    character2Name.trim().toLowerCase() === characterName?.trim().toLowerCase()
  );

  // Extract numbers and units dynamically if not passed directly
  const numbersInMath = (mathData.match(/\d+/g) || []).map(Number);
  const n1 = num1 ?? (numbersInMath[0] || 25);
  const n2 = num2 ?? (numbersInMath[1] || 17);
  const op = operation;
  const res = result ?? (numbersInMath[2] || (op === 'TRỪ' ? Math.max(n1, n2) - Math.min(n1, n2) : op === 'NHÂN' ? n1 * n2 : n1 + n2));
  const u = unit || (mathData.includes('gà') ? 'con gà' : mathData.includes('trứng') ? 'quả trứng' : mathData.includes('cây') ? 'cây' : mathData.includes('hoa') ? 'bông hoa' : mathData.includes('bi') ? 'viên bi' : 'quả cam');
  const charName = characterName || 'Bé Lan';
  const char2 = character2Name || '';
  const isChar2Robot = char2.toLowerCase().includes('robot') || char2.toLowerCase().includes('tô-bốt');
  const isChar2Boy = char2.toLowerCase().includes('minh') || char2.toLowerCase().includes('nam') || char2.toLowerCase().includes('hải') || char2.toLowerCase().includes('tuấn');
  const char2Icon = isChar2Robot ? '🤖' : isChar2Boy ? '👦' : '👩';

  const isChar1Boy = charName.toLowerCase().includes('nam') || charName.toLowerCase().includes('minh') || charName.toLowerCase().includes('hải') || charName.toLowerCase().includes('tuấn');
  const isChar1Adult = charName.toLowerCase().includes('bác') || charName.toLowerCase().includes('ông') || charName.toLowerCase().includes('bà') || charName.toLowerCase().includes('cô');
  const char1Icon = isChar1Adult ? (charName.toLowerCase().includes('bà') || charName.toLowerCase().includes('cô') ? '👵' : '👨‍🌾') : isChar1Boy ? '👦' : '👧';

  // Dynamic icon for items
  let itemIcon = '🍊';
  const uLower = u.toLowerCase();
  if (uLower.includes('gà')) itemIcon = '🐔';
  else if (uLower.includes('trứng')) itemIcon = '🥚';
  else if (uLower.includes('cây')) itemIcon = '🌳';
  else if (uLower.includes('hoa')) itemIcon = '🌸';
  else if (uLower.includes('bi')) itemIcon = '🔵';
  else if (uLower.includes('táo')) itemIcon = '🍎';
  else if (uLower.includes('sách') || uLower.includes('vở')) itemIcon = '📚';

  const opSign = op === 'TRỪ' ? '-' : op === 'NHÂN' ? '×' : op === 'CHIA' ? ':' : '+';

  // High-frequency animation ticker for 3D physics, breathing, and eye blinks
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % 120);
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isBlinking = animationFrame % 35 === 0 || animationFrame % 35 === 1;
  const isLeftSpeaking = isPlaying && Boolean(dialogue) && (singleCharMode || sceneNumber === 1 || sceneNumber === 3) && (animationFrame % 8 < 4);
  const isRightSpeaking = !singleCharMode && isPlaying && Boolean(dialogue) && (sceneNumber === 2) && (animationFrame % 8 < 4);
  const waveAngle = Math.sin(animationFrame * 0.15) * 18;
  const bounceY = Math.sin(animationFrame * 0.12) * 4;
  const robotHoverY = Math.cos(animationFrame * 0.15) * 8;

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-400 via-amber-50 to-amber-200 overflow-hidden select-none flex flex-col justify-between p-4 shadow-inner">
      {/* 3D Dynamic Ambient Stage Lighting & Kitchen Environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft volumetric sunlight rays from top-left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-yellow-300/40 via-amber-200/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-4 left-6 text-3xl filter drop-shadow-[0_4px_12px_rgba(255,200,0,0.6)] animate-bounce duration-1000">
          ☀️
        </div>

        {/* 3D Cozy Kitchen Arched Window */}
        <div className="absolute top-3 right-8 w-44 h-36 bg-gradient-to-b from-sky-200 to-sky-100 rounded-t-full border-4 border-amber-900/60 shadow-2xl overflow-hidden backdrop-blur-xs">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/40 to-transparent" />
          {/* Distant green hills outside window */}
          <div className="absolute -bottom-4 -left-6 w-32 h-20 bg-emerald-500 rounded-full opacity-90 shadow-inner" />
          <div className="absolute -bottom-6 -right-6 w-36 h-24 bg-emerald-600 rounded-full opacity-90 shadow-inner" />
          {/* Window pane mullions */}
          <div className="absolute inset-y-0 left-1/2 w-1.5 bg-amber-900/60 shadow-xs" />
          <div className="absolute inset-x-0 top-1/2 h-1.5 bg-amber-900/60 shadow-xs" />
          <div className="absolute top-2 right-4 text-xs animate-pulse">🕊️</div>
        </div>

        {/* 3D Warm Oak Kitchen Dining Table with realistic bevel & depth */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-amber-950 via-amber-800 to-amber-700 border-t-6 border-amber-900 shadow-[0_-12px_30px_rgba(0,0,0,0.4)] flex flex-col justify-start">
          {/* Surface wood highlight */}
          <div className="w-full h-3 bg-gradient-to-r from-amber-500/30 via-yellow-200/40 to-amber-500/30 shadow-inner" />
          <div className="w-full h-1 bg-amber-900/80" />
        </div>
      </div>

      {/* Main 3D Puppetry Stage */}
      <div className={`relative z-10 flex-1 flex items-end ${singleCharMode ? 'justify-center gap-10 md:gap-20' : 'justify-around'} px-4 pb-10`}>
        {/* CHARACTER 1: (3D Pixar Style Character Puppet - Speaks all dialogue in single char mode) */}
        <div
          className="flex flex-col items-center transition-transform duration-300"
          style={{ transform: `translateY(${bounceY}px)` }}
        >
          {/* 3D Speech Bubble with Depth */}
          {singleCharMode ? (
            <div className="mb-2 bg-white text-slate-900 text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-400 max-w-[240px] text-center relative filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] animate-pulse-subtle">
              <div className="text-[10px] text-amber-800 uppercase tracking-wider font-extrabold mb-0.5">
                🗣️ {charName}:
              </div>
              <span>
                {dialogue || (
                  sceneNumber === 1
                    ? `${itemIcon} Mình đang có ${n1} ${u} nè!`
                    : sceneNumber === 2
                    ? `Các bạn giúp mình xem: ${op === 'TRỪ' ? 'Bớt đi' : 'Có thêm'} ${n2} ${u} thì còn bao nhiêu ${u}?`
                    : `🎉 ${n1} ${opSign} ${n2} = ${res} ${u}! Hoan hô các bạn!`
                )}
              </span>
              {/* Bubble Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-400 transform rotate-45" />
            </div>
          ) : sceneNumber !== 2 ? (
            <div className="mb-2 bg-white text-slate-900 text-xs font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-amber-400 max-w-[220px] text-center relative filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] animate-pulse-subtle">
              {sceneNumber === 1 && (dialogue || `${itemIcon} Mình đang có ${n1} ${u} nè!`)}
              {sceneNumber === 3 && (dialogue || `🎉 ${n1} ${opSign} ${n2} = ${res} ${u}! Hoan hô các bạn!`)}
              {/* Bubble Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-400 transform rotate-45" />
            </div>
          ) : (
            <div className="mb-2 bg-sky-100 text-sky-950 text-[11px] font-black px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-sky-300 max-w-[190px] text-center relative animate-pulse">
              <span>🤔 {charName} chăm chú lắng nghe {char2.toLowerCase()}...</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-sky-100 border-r-2 border-b-2 border-sky-300 transform rotate-45" />
            </div>
          )}

          {/* 3D Character Model: Bé Lan / Character 1 */}
          <div className="relative w-36 h-48 flex flex-col items-center">
            {/* 3D Hair with Twin Pigtails */}
            <div className="relative w-26 h-26">
              {!isChar1Boy && !isChar1Adult && (
                <>
                  {/* Left Pigtail */}
                  <div
                    className="absolute -left-5 top-2 w-9 h-14 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 rounded-full transition-transform duration-200 shadow-md origin-top-right"
                    style={{ transform: `rotate(${-25 + waveAngle * 0.5}deg)` }}
                  >
                    <div className="w-2 h-6 bg-amber-800/40 rounded-full ml-1 mt-2" />
                  </div>
                  <div className="absolute -left-2 top-5 w-4.5 h-4.5 bg-red-600 rounded-full border-2 border-red-800 shadow-sm" title="Nơ đỏ" />

                  {/* Right Pigtail */}
                  <div
                    className="absolute -right-5 top-2 w-9 h-14 bg-gradient-to-bl from-amber-950 via-amber-900 to-amber-950 rounded-full transition-transform duration-200 shadow-md origin-top-left"
                    style={{ transform: `rotate(${25 - waveAngle * 0.5}deg)` }}
                  >
                    <div className="w-2 h-6 bg-amber-800/40 rounded-full ml-1 mt-2" />
                  </div>
                  <div className="absolute -right-2 top-5 w-4.5 h-4.5 bg-red-600 rounded-full border-2 border-red-800 shadow-sm" title="Nơ đỏ" />
                </>
              )}

              {/* 3D Head Sphere with Skin Radiance */}
              <div className="relative z-10 w-26 h-26 mx-auto bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200 rounded-full border-3 border-amber-300 shadow-[0_8px_20px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center overflow-hidden">
                {/* Hair Bangs with 3D Gloss */}
                <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-amber-950 to-amber-900 rounded-b-3xl shadow-inner">
                  <div className="w-12 h-2 bg-amber-800/40 rounded-full mx-auto mt-1" />
                </div>

                {/* Big Anime Eyes with Pixar Eye Reflections */}
                <div className="flex gap-4.5 mt-5">
                  {isBlinking ? (
                    <>
                      <div className="w-4.5 h-1.5 bg-slate-900 rounded-full" />
                      <div className="w-4.5 h-1.5 bg-slate-900 rounded-full" />
                    </>
                  ) : (
                    <>
                      <div className="w-4.5 h-6 bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 rounded-full relative shadow-inner">
                        <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                        <div className="w-1 h-1 bg-sky-300 rounded-full absolute bottom-1 left-1" />
                      </div>
                      <div className="w-4.5 h-6 bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 rounded-full relative shadow-inner">
                        <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                        <div className="w-1 h-1 bg-sky-300 rounded-full absolute bottom-1 left-1" />
                      </div>
                    </>
                  )}
                </div>

                {/* Soft Rosy Cheeks */}
                <div className="flex gap-9 -mt-0.5">
                  <div className="w-4 h-3 bg-rose-400/80 rounded-full blur-2xs" />
                  <div className="w-4 h-3 bg-rose-400/80 rounded-full blur-2xs" />
                </div>

                {/* 3D Animated Mouth (Moves when speaking) */}
                <div
                  className={`transition-all duration-150 bg-rose-600 border border-rose-700 shadow-inner ${
                    isLeftSpeaking
                      ? 'w-5 h-4 rounded-full mt-0.5'
                      : 'w-6 h-3 rounded-b-full border-t-0 mt-1'
                  }`}
                >
                  {isLeftSpeaking && <div className="w-2 h-1 bg-rose-300 rounded-full mx-auto mt-0.5" />}
                </div>
              </div>
            </div>

            {/* 3D Torso & Clothes */}
            <div className="-mt-3.5 w-22 h-24 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-2xl border-2 border-amber-600 shadow-lg flex flex-col items-center justify-start p-1 relative">
              {/* Cute Peter-Pan collar with no text inside character */}
              <div className="flex gap-1 mt-0.5">
                <div className="w-4 h-3 bg-white rounded-b-full border border-amber-300 shadow-2xs" />
                <div className="w-4 h-3 bg-white rounded-b-full border border-amber-300 shadow-2xs" />
              </div>
              <div className="w-2 h-2 rounded-full bg-white/90 border border-amber-600/40 shadow-2xs mt-2" />

              {/* 3D Animated Arms */}
              <div
                className="absolute -left-3 top-3 w-5 h-11 bg-gradient-to-b from-amber-200 to-amber-100 rounded-full border border-amber-300 shadow-md origin-top"
                style={{ transform: `rotate(${-20 + waveAngle}deg)` }}
              />
              <div
                className="absolute -right-3 top-3 w-5 h-11 bg-gradient-to-b from-amber-200 to-amber-100 rounded-full border border-amber-300 shadow-md origin-top"
                style={{ transform: `rotate(${sceneNumber === 3 ? -waveAngle * 2 : 20 - waveAngle}deg)` }}
              />
            </div>

            {/* Skirt & 3D Red Sneakers */}
            <div className="-mt-1 flex gap-3">
              <div className="w-5.5 h-6 bg-gradient-to-b from-sky-600 to-sky-800 rounded-b-lg border border-sky-950 shadow-md flex items-end justify-center">
                <div className="w-6 h-2.5 bg-red-600 rounded-full border border-white" />
              </div>
              <div className="w-5.5 h-6 bg-gradient-to-b from-sky-600 to-sky-800 rounded-b-lg border border-sky-950 shadow-md flex items-end justify-center">
                <div className="w-6 h-2.5 bg-red-600 rounded-full border border-white" />
              </div>
            </div>
          </div>
          <span className="text-xs font-black text-slate-900 bg-white px-3.5 py-0.5 rounded-full shadow-md mt-1 border-2 border-amber-300 flex items-center gap-1">
            <span>{char1Icon}</span> <span>{charName}</span>
          </span>
        </div>

        {/* CENTER: 3D TABLE BASKET WITH DYNAMIC ITEMS & 3D PHYSICS COUNTER */}
        <div className="flex flex-col items-center z-20">
          {/* 3D Woven Wicker Basket with Ambient Occlusion */}
          <div className="relative w-60 h-38 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-b-[50px] border-4 border-amber-950 p-3 shadow-[0_16px_30px_rgba(0,0,0,0.5)] flex flex-wrap gap-1.5 items-center justify-center overflow-hidden">
            {/* Basket Weave Pattern Highlights */}
            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-amber-500/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-2 bg-amber-950/60" />
            <div className="absolute inset-y-0 right-0 w-2 bg-amber-950/60" />

            {/* 3D Glossy Items with Highlight */}
            {Array.from({ length: sceneNumber === 1 ? Math.min(16, n1) : sceneNumber === 2 ? Math.min(22, n2) : Math.min(26, res) }).map((_, i) => (
              <div
                key={i}
                className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-300 border border-amber-700 shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center text-xs animate-bounce"
                style={{
                  animationDuration: `${1.4 + (i % 6) * 0.2}s`,
                  transform: `scale(${0.9 + (i % 4) * 0.05})`,
                }}
              >
                {/* 3D Specular Shine Highlight */}
                <div className="absolute top-1 left-1.5 w-2 h-2 bg-white/70 rounded-full blur-2xs" />
                <span className="opacity-95 text-[12px]">{itemIcon}</span>
              </div>
            ))}
          </div>

          {/* 3D Cast Shadow of the Basket */}
          <div className="w-52 h-4 bg-black/50 rounded-full blur-xs mt-1" />
        </div>

        {/* CHARACTER 2: ONLY RENDERED IF NOT IN SINGLE CHARACTER MODE */}
        {!singleCharMode && (
          <div
            className="flex flex-col items-center transition-all duration-500"
            style={{ transform: `translateY(${bounceY * 0.8}px)` }}
          >
            {/* Right Character Speech Bubble */}
            <div className="mb-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-white max-w-[240px] text-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative animate-pulse">
              {sceneNumber === 1 && (
                <>
                  <div className="text-[10px] text-amber-950/80 uppercase tracking-wider font-extrabold mb-0.5">
                    🌸 {char2}:
                  </div>
                  <span>{char2} vui vẻ ngắm nhìn {charName} chuẩn bị {n1} {u}!</span>
                </>
              )}
              {sceneNumber === 2 && (
                <>
                  <div className="text-[10px] text-amber-950/80 uppercase tracking-wider font-extrabold mb-0.5">
                    🗣️ {char2}:
                  </div>
                  <span>{dialogue || `${char2} cho thêm ${charName} ${n2} ${u} nữa. Hỏi ${charName} có tất cả bao nhiêu ${u}?`}</span>
                </>
              )}
              {sceneNumber === 3 && (
                <>
                  <div className="text-[10px] text-amber-950/80 uppercase tracking-wider font-extrabold mb-0.5">
                    🎉 {char2}:
                  </div>
                  <span>Tuyệt vời quá! {charName} đã tính ra đúng {res} {u}!</span>
                </>
              )}
              {/* Bubble Tail pointing to right character */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-orange-400 border-r-2 border-b-2 border-white transform rotate-45" />
            </div>

            {/* 3D Puppet Model for Character 2 (Consistent in all scenes) */}
            {isChar2Robot ? (
              /* 3D Robot Puppet */
              <div className="relative w-24 h-26 rounded-3xl bg-gradient-to-b from-sky-200 via-sky-400 to-blue-600 border-4 border-sky-300 shadow-[0_12px_24px_rgba(2,132,199,0.4)] flex flex-col items-center justify-center p-2">
                <div className="absolute -top-4 w-1.5 h-4 bg-sky-300" />
                <div className="absolute -top-6 w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)] animate-ping" />
                <div className="w-16 h-10 bg-slate-950 rounded-xl border border-cyan-400/80 flex items-center justify-around px-2 shadow-inner">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                </div>
                <div className="mt-2 w-8 h-3 rounded-full bg-cyan-400/50 border border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
            ) : (
              /* 3D Mother Puppet (or Friendly Adult Character) */
              <div className="relative w-38 h-54 flex flex-col items-center">
                {/* Hair & Face */}
                <div className="w-26 h-26 bg-gradient-to-b from-amber-950 to-amber-900 rounded-full overflow-hidden shadow-xl flex items-center justify-center">
                  <div className="w-22 h-22 bg-gradient-to-b from-amber-100 to-orange-100 rounded-full border-2 border-amber-300 flex flex-col items-center justify-center relative">
                    {/* Eyes */}
                    <div className="flex gap-4.5 mt-2">
                      <div className="w-3.5 h-4.5 bg-slate-900 rounded-full relative">
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                      <div className="w-3.5 h-4.5 bg-slate-900 rounded-full relative">
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                    {/* Rosy blush */}
                    <div className="flex gap-7 mt-0.5">
                      <div className="w-3.5 h-2 bg-rose-300/80 rounded-full" />
                      <div className="w-3.5 h-2 bg-rose-300/80 rounded-full" />
                    </div>
                    {/* Animated Mouth */}
                    <div
                      className={`transition-all duration-150 bg-rose-600 border border-rose-700 shadow-inner ${
                        isRightSpeaking
                          ? 'w-5 h-4 rounded-full mt-0.5 animate-pulse'
                          : 'w-6 h-2.5 border-b-2 border-rose-600 rounded-full mt-0.5'
                      }`}
                    >
                      {isRightSpeaking && <div className="w-2 h-1 bg-rose-300 rounded-full mx-auto mt-0.5" />}
                    </div>
                  </div>
                </div>

                {/* 3D Floral Dress with Apron (Clean, no text inside) */}
                <div className="-mt-3.5 w-26 h-30 bg-gradient-to-b from-rose-300 via-rose-400 to-rose-500 rounded-2xl border-2 border-rose-300 shadow-xl flex flex-col items-center justify-start pt-2 relative">
                  <div className="w-12 h-3.5 bg-white/80 rounded-b-full border border-rose-200 shadow-2xs mb-2" />
                  <div className="w-16 h-14 bg-white/30 rounded-xl border border-white/50 shadow-inner flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-200/90 shadow-2xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Character 2 name badge: only character name, no annotation */}
            <span className="text-xs font-black text-slate-900 bg-white px-3.5 py-0.5 rounded-full shadow-md mt-1 border-2 border-rose-300 flex items-center gap-1">
              <span>{char2Icon}</span> <span>{char2}</span>
            </span>
          </div>
        )}
      </div>

      {/* Subtitle Dialogue Box with Sound & Glowing Text */}
      <div className="relative z-20 bg-slate-950/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border-2 border-amber-400/40 text-center text-white shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400 shrink-0">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span className="text-[11px] font-bold">Lời thoại:</span>
        </div>
        <p className="text-xs md:text-sm font-black text-amber-200 drop-shadow flex-1">
          "{dialogue}"
        </p>
        <div className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md font-bold shrink-0 border border-amber-500/30">
          3D AUDIO VIỆT NAM
        </div>
      </div>
    </div>
  );
};
