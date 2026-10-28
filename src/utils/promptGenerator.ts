/**
 * Tiện ích tạo prompt từng cảnh và kết hợp prompt của cả 3 cảnh thành Prompt Kịch Bản Tổng Thể (Master Prompt)
 * Tỷ lệ: 16:9, Phong cách: Hoạt hình 3D dễ thương chuẩn Pixar, 100% Tiếng Việt
 */

import { Scene, MathAnalysisResult, CharacterProfile } from '../types/mathStory';

export interface PromptGenerationInput {
  grade?: string;
  theme?: string;
  topic?: string;
  problemStatement?: string;
  calculation?: string;
  characters: string[];
  scenes: Scene[];
}

/**
 * Kết hợp prompt của cả 3 cảnh thành một Prompt Kịch Bản Tổng Thể hoàn chỉnh dùng cho Phân hệ 4 & Phân hệ 6
 */
export function generateCombinedScriptPrompt(input: PromptGenerationInput): string {
  const {
    grade = 'Lớp 2',
    theme = 'Gia đình và cuộc sống',
    problemStatement = '',
    calculation = '',
    characters = ['Bé Lan'],
    scenes = [],
  } = input;

  const mainChar = characters[0] || 'Bé Lan';
  const isSingle = characters.length <= 1;
  const characterSummary = isSingle
    ? `Duy nhất 1 nhân vật: ${mainChar}`
    : `Gồm 2 nhân vật: ${characters.join(' và ')}`;

  const scene1 = scenes.find((s) => s.sceneNumber === 1) || scenes[0];
  const scene2 = scenes.find((s) => s.sceneNumber === 2) || scenes[1];
  const scene3 = scenes.find((s) => s.sceneNumber === 3) || scenes[2];

  const combined = `[PROMPT KỊCH BẢN TOÁN HỌC 3D TOÀN DIỆN - MATH STORY AI]
================================================================================
1. THÔNG TIN ĐỒNG BỘ TOÁN HỌC & SƯ PHẠM (GDPT 2018):
- Khối lớp: ${grade}
- Đề bài toán học: "${problemStatement}"
- Phép tính & Kết quả xác định: ${calculation}
- Danh sách nhân vật hiển thị (${characterSummary}): ${characters.join(', ')}
- Không gian & Bối cảnh chủ đạo: ${theme}
- Tỷ lệ khung hình chuẩn hóa: 16:9 Widescreen (1920x1080)
- Phong cách hình ảnh: Hoạt hình 3D dễ thương, ánh sáng điện ảnh ấm áp phong cách Pixar, an toàn và thân thiện với học sinh tiểu học.

================================================================================
2. TỔNG HỢP PROMPT CHI TIẾT CỦA CẢ 3 CẢNH LIÊN TIẾP:

--- [PHÂN CẢNH 1: KHỞI ĐẦU TÌNH HUỐNG & DỮ KIỆN 1] ---
• Thời lượng: ${scene1?.duration || 12} giây
• Bối cảnh: ${scene1?.setting || 'Không gian ấm áp, thân quen'}
• Nhân vật tham gia: ${scene1?.characters?.join(', ') || mainChar}
• Lời thoại nhân vật: "${scene1?.dialogue || ''}"
• Dữ kiện toán học: ${scene1?.mathData || ''}
• PROMPT TẠO ẢNH 3D CẢNH 1:
${scene1?.imagePrompt || ''}
• PROMPT CHUYỂN ĐỘNG VIDEO CẢNH 1:
${scene1?.motionPrompt || ''}

--- [PHÂN CẢNH 2: TÌNH HUỐNG PHÁT SINH & CÂU HỎI TƯƠNG TÁC] ---
• Thời lượng: ${scene2?.duration || 18} giây
• Bối cảnh: ${scene2?.setting || 'Không gian tiếp nối dữ kiện'}
• Nhân vật tham gia: ${scene2?.characters?.join(', ') || mainChar}
• Lời thoại nhân vật: "${scene2?.dialogue || ''}"
• Dữ kiện toán học: ${scene2?.mathData || ''}
${scene2?.interactiveQuestion ? `• Câu hỏi tương tác dừng video: "${scene2.interactiveQuestion.question}"` : ''}
• PROMPT TẠO ẢNH 3D CẢNH 2:
${scene2?.imagePrompt || ''}
• PROMPT CHUYỂN ĐỘNG VIDEO CẢNH 2:
${scene2?.motionPrompt || ''}

--- [PHÂN CẢNH 3: ĂN MỪNG CHIẾN THẮNG & ĐÁP SỐ TRỌN VẸN] ---
• Thời lượng: ${scene3?.duration || 15} giây
• Bối cảnh: ${scene3?.setting || 'Không gian rực rỡ sắc màu'}
• Nhân vật tham gia: ${scene3?.characters?.join(', ') || mainChar}
• Lời thoại nhân vật: "${scene3?.dialogue || ''}"
• Dữ kiện toán học: ${scene3?.mathData || `Đáp số: ${calculation}`}
• PROMPT TẠO ẢNH 3D CẢNH 3:
${scene3?.imagePrompt || ''}
• PROMPT CHUYỂN ĐỘNG VIDEO CẢNH 3:
${scene3?.motionPrompt || ''}

================================================================================
3. CHỈ DẪN KỸ THUẬT RENDER & TẠO VIDEO 16:9 LIỀN MẠCH (SỬ DỤNG CHO PHÂN HỆ 6):
- Tính nhất quán thị giác (Visual Consistency): Giữ nguyên hạt giống tạo hình (Seed), tỉ lệ cơ thể nhân vật, trang phục và bảng màu pastel ấm áp xuyên suốt từ Cảnh 1 sang Cảnh 2 và Cảnh 3.
- Chuyển cảnh camera (Camera Transitions): Sử dụng góc máy lia nhẹ (slow pan) và zoom tinh tế, dừng lại đúng nhịp ở Cảnh 2 để học sinh thao tác giải toán, sau đó bùng nổ hiệu ứng pháo hoa chúc mừng ở Cảnh 3.
- Âm thanh và Khẩu hình (Lip-sync & Audio): Đồng bộ khẩu hình chuyển động nhịp nhàng theo giọng đọc Web Speech API tương ứng với nhân vật phát biểu.
================================================================================`;

  return combined;
}
