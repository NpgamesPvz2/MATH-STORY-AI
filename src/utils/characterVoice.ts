/**
 * Tiện ích quản lý giọng đọc Web Speech API với Pitch và Rate tối ưu theo từng nhân vật
 */

export interface CharacterVoiceConfig {
  pitch: number;      // 0.5 - 2.0 (mặc định 1.0)
  rate: number;       // 0.5 - 1.5 (mặc định 0.95 cho tiếng Việt dễ nghe)
  volume: number;     // 0.0 - 1.0
  voiceType: 'child-female' | 'child-male' | 'adult-female' | 'adult-male' | 'narrator';
  label: string;
  badge: string;
}

/**
 * Tự động phân tích tên nhân vật và vai trò để thiết lập pitch và rate tối ưu
 */
export function getVoiceConfigForCharacter(
  characterName: string,
  extraInfo?: { age?: number; gender?: string; role?: string }
): CharacterVoiceConfig {
  const nameLower = (characterName || '').toLowerCase().trim();
  const roleLower = (extraInfo?.role || '').toLowerCase();
  const gender = (extraInfo?.gender || '').toLowerCase();
  const age = extraInfo?.age;

  // 1. Nhận diện người lớn nam (Bác An, Bố, Ông, Thầy giáo, Chú...)
  const isAdultMale =
    nameLower.includes('bác') ||
    nameLower.includes('chú') ||
    nameLower.includes('ông') ||
    nameLower.includes('bố') ||
    nameLower.includes('thầy') ||
    nameLower.includes('bác an') ||
    roleLower.includes('bác nông dân') ||
    roleLower.includes('người lớn') ||
    (gender === 'male' && age !== undefined && age >= 18);

  if (isAdultMale) {
    return {
      pitch: 0.8, // Trầm ấm, chững chạc người lớn
      rate: 0.92,
      volume: 1.0,
      voiceType: 'adult-male',
      label: 'Giọng Nam Trưởng Thành (Bác/Bố/Thầy) - Trầm ấm',
      badge: 'Nam người lớn • Pitch 0.8',
    };
  }

  // 2. Nhận diện người lớn nữ (Mẹ, Cô giáo, Bà, Chị...)
  const isAdultFemale =
    nameLower.includes('mẹ') ||
    nameLower.includes('cô giáo') ||
    nameLower.includes('cô') ||
    nameLower.includes('bà') ||
    roleLower.includes('giáo viên') ||
    roleLower.includes('mẹ') ||
    (gender === 'female' && age !== undefined && age >= 18);

  if (isAdultFemale) {
    return {
      pitch: 1.05, // Vừa phải, dịu dàng, ấm áp
      rate: 0.93,
      volume: 1.0,
      voiceType: 'adult-female',
      label: 'Giọng Nữ Trưởng Thành (Cô giáo/Mẹ) - Dịu dàng',
      badge: 'Nữ người lớn • Pitch 1.05',
    };
  }

  // 3. Nhận diện bé trai (Nam, Minh, Dũng, Tuấn, Bình, Tèo, Tí, Phong...)
  const isBoy =
    nameLower.includes('nam') ||
    nameLower.includes('minh') ||
    nameLower.includes('dũng') ||
    nameLower.includes('tuấn') ||
    nameLower.includes('bình') ||
    nameLower.includes('tèo') ||
    nameLower.includes('tí') ||
    nameLower.includes('phong') ||
    nameLower.includes('khoa') ||
    nameLower.includes('bé trai') ||
    (gender === 'male' && (age === undefined || age < 18));

  if (isBoy) {
    return {
      pitch: 1.25, // Tươi vui, hoạt bát bé trai
      rate: 0.96,
      volume: 1.0,
      voiceType: 'child-male',
      label: 'Giọng Bé Trai - Lanh lợi, khỏe khoắn',
      badge: 'Bé trai • Pitch 1.25',
    };
  }

  // 4. Mặc định hoặc bé gái (Bé Lan, Mai, Hoa, An nữ, Linh, Thảo, Bé...)
  return {
    pitch: 1.0, // Pitch chuẩn, trung tính cho giọng bé gái
    rate: 0.95,
    volume: 1.0,
    voiceType: 'child-female',
    label: 'Giọng Bé Gái (Bé Lan) - Tự nhiên, rõ ràng',
    badge: 'Bé gái • Pitch 1.0',
  };
}

import { soundEffects } from './audioEffects';

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Phát lời thoại bằng Web Speech API với pitch và rate tùy biến
 * Đảm bảo sự khác biệt âm thanh rõ rệt giữa các mức pitch
 */
export function speakDialogueWithWebSpeech(
  text: string,
  config: { pitch?: number; rate?: number; volume?: number } = {},
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  onUtteranceCreated?: (utterance: SpeechSynthesisUtterance) => void,
  onBoundary?: (charIndex: number) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API không được hỗ trợ trên trình duyệt này.');
    return false;
  }

  try {
    // Dừng mọi âm đang phát để không bị chồng tiếng
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      onEnd?.();
      return true;
    }

    const currentPitch = config.pitch ?? 1.2;
    const baseRate = config.rate ?? 0.95;

    // Phát âm tone báo hiệu tần số Pitch qua Web Audio API để người dùng nghe rõ ngay độ cao thấp
    soundEffects.playPitchTone(currentPitch);

    const utterance = new SpeechSynthesisUtterance(text);
    onUtteranceCreated?.(utterance);
    utterance.lang = 'vi-VN';
    utterance.pitch = Math.max(0.5, Math.min(2.0, currentPitch));

    // Điều chỉnh tốc độ và nhịp điệu tỷ lệ với pitch để ngay cả trên trình duyệt mạng
    // (như Chrome remote voice không hỗ trợ đổi tần số trực tiếp) người nghe vẫn phân biệt được:
    // - Pitch trầm (<1.0, Bác An/Bố): nói chậm rãi, trầm ấm, dõng dạc (0.80x - 0.88x)
    // - Pitch vừa (1.05, Mẹ/Cô): chuẩn mực nhẹ nhàng (0.93x)
    // - Pitch cao (1.4 - 1.8, Bé Lan/Trẻ thơ): nói nhanh nhẹn, trong trẻo, hoạt bát (1.08x - 1.25x)
    const pitchOffset = currentPitch - 1.0;
    const dynamicRate = Math.min(1.4, Math.max(0.72, baseRate + pitchOffset * 0.28));
    utterance.rate = dynamicRate;
    utterance.volume = config.volume ?? 1.0;

    // Lựa chọn giọng tối ưu
    const allVoices = loadVoices().length > 0 ? loadVoices() : window.speechSynthesis.getVoices();
    const viVoices = allVoices.filter((v) => v.lang === 'vi-VN' || v.lang.startsWith('vi'));

    if (viVoices.length > 0) {
      if (currentPitch < 1.0) {
        // Tông trầm (người lớn nam): ưu tiên giọng nam nếu có
        const maleVoice = viVoices.find(
          (v) =>
            v.name.toLowerCase().includes('nam') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('an ') ||
            v.name.toLowerCase().includes('bác')
        );
        utterance.voice = maleVoice || viVoices[0];
      } else {
        // Tông cao / nữ / trẻ em: ưu tiên giọng nữ hoặc local voice
        const femaleVoice = viVoices.find(
          (v) =>
            v.name.toLowerCase().includes('hoaimy') ||
            v.name.toLowerCase().includes('linh') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('nu')
        );
        utterance.voice = femaleVoice || viVoices[0];
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onboundary = (event) => {
      onBoundary?.(event.charIndex);
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis lỗi:', e);
      }
      onError?.(e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Không thể phát âm thanh Web Speech:', error);
    onError?.(error);
    onEnd?.();
    return false;
  }
}
