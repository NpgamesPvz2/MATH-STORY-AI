export type MathTopic =
  | 'Phép cộng có nhớ trong phạm vi 100'
  | 'Phép trừ có nhớ trong phạm vi 100'
  | 'Bảng nhân 2 và Bảng nhân 5'
  | 'Bảng chia 2 và Bảng chia 5'
  | 'Bài toán có lời văn (Thêm vào - Bớt đi)'
  | 'Bài toán nhiều hơn - ít hơn'
  | 'Đo độ dài (cm, dm, m, km)'
  | 'Khối lượng và Dung tích (kg, lít)'
  | 'Thời gian, đồng hồ và lịch'
  | 'Tiền Việt Nam (đồng)'
  | 'Hình học trực quan (Điểm, đoạn thẳng, khối trụ, khối cầu)'
  | 'Tình huống Toán học trong đời sống';

export type StoryTheme =
  | 'Gia đình và cuộc sống'
  | 'Trường học vui vẻ'
  | 'Khu vườn Toán học'
  | 'Siêu thị mini'
  | 'Thế giới động vật'
  | 'Phiêu lưu cùng robot AI'
  | 'Cổ tích Toán học'
  | 'Thành phố thông minh';

export type IllustrationStyle =
  | 'Hoạt hình 3D dễ thương'
  | 'Tranh truyện thiếu nhi'
  | 'Minh họa sách giáo khoa'
  | 'Hoạt hình 2D'
  | 'Đất nặn 3D'
  | 'Phong cách giấy cắt'
  | 'Tranh màu nước';

export type AspectRatio = '16:9' | '1:1' | '4:3' | '9:16';

export type QuestionType =
  | 'CHỌN_PHÉP_TÍNH'
  | 'CHỌN_ĐÁP_ÁN'
  | 'NHẬP_KẾT_QUẢ'
  | 'KÉO_THẢ_ĐỒ_VẬT'
  | 'ĐIỀN_SỐ_CÒN_THIẾU'
  | 'SẮP_XẾP_BƯỚC_GIẢI'
  | 'GIẢI_THÍCH_BẰNG_LỜI'
  | 'CHỌN_HÌNH_MINH_HỌA';

export interface QuestionOption {
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface InteractiveQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  resultCalculation: string;
  hintStep1: string;
  hintStep2: string;
  itemsToCount?: number;
  expectedNumber?: number;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  duration: number; // in seconds
  setting: string;
  characters: string[];
  action: string;
  dialogue: string;
  soundFx: string;
  mathData: string;
  imagePrompt: string;
  motionPrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  interactiveQuestion?: InteractiveQuestion | null;
}

export interface Storyboard {
  theme: StoryTheme;
  durationSeconds: number;
  style: IllustrationStyle;
  scenes: Scene[];
  combinedPrompt?: string; // Prompt kịch bản kết hợp toàn bộ 3 cảnh dùng cho Phân hệ 6
  bgMusic?: string; // 'vui-tuoi' | 'diu-dang' | 'kham-pha' | 'khong-nhac'
  bgVolume?: number; // 0 to 100
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  age: number;
  gender: string;
  appearance: string;
  outfit: string;
  personality: string;
  voiceStyle: string;
  avatarUrl?: string;
  isPreset?: boolean;
  fromCurrentProblem?: boolean;
}

export interface DeterministicMathCheck {
  numbers: number[];
  operation: string;
  calculation: string;
  result: number | null;
  unit: string;
  explanation: string;
  groupUnit?: string;
  hasEnoughData: boolean;
  isValid: boolean;
  validationMessage?: string;
  charactersInProblem?: string[];
}

export interface MathAnalysisResult {
  problemStatement: string;
  givenData: string[];
  target: string;
  mathematicalRelation: string;
  operation: string;
  calculation: string;
  result: number | null;
  unit: string;
  groupUnit?: string;
  num1?: number;
  num2?: number;
  problemType?: string;
  topic?: string;
  knowledgeGoal: string;
  commonMistakes: string[];
  guidingQuestions: string[];
  deterministicCheck?: DeterministicMathCheck;
  verifiedByDeterministicCode: boolean;
  status: 'CHỜ_PHÊ_DUYỆT' | 'ĐÃ_DUYỆT_PHÂN_TÍCH' | 'YÊU_CẦU_CHỈNH_SỬA';
  teacherNotes?: string;
  grade?: string;
  isValid?: boolean;
  validationMessage?: string;
  charactersInProblem?: string[];
  hasExcessCharacters?: boolean;
  problemCode?: string;
}

export type ModerationStatus =
  | 'BẢN_NHÁP'
  | 'ĐANG_CHỈNH_SỬA'
  | 'CHỜ_DUYỆT'
  | 'ĐÃ_DUYỆT'
  | 'ĐÃ_XUẤT_BẢN';

export interface ModerationChecklist {
  curriculumCompliant: boolean; // 1. Bám sát SGK GDPT 2018
  dataAccurate: boolean; // 2. Dữ kiện chính xác
  calculationVerified: boolean; // 3. Phép tính chính xác
  dialogueAppropriate: boolean; // 4. Lời thoại trong sáng theo lứa tuổi
  imageSafe: boolean; // 5. Hình ảnh an toàn thiếu nhi
  characterConsistent: boolean; // 6. Nhân vật nhất quán
  audioClear: boolean; // 7. Âm thanh rõ, nhịp độ vừa phải
  questionEngaging: boolean; // 8. Câu hỏi kích thích tư duy
  pedagogicalFeedback: boolean; // 9. Phản hồi sư phạm nhẹ nhàng
  trialTested: boolean; // 10. Đã chạy thử nghiệm
  status: ModerationStatus;
  approvedBy?: string;
  approvedDate?: string;
}

export interface GeminiEvaluationResult {
  overallScore: number;
  overallAssessment: string;
  criteriaResults: Record<string, { pass: boolean; feedback: string }>;
  recommendations: string[];
}

export interface ProjectLesson {
  id: string;
  title: string;
  grade: string;
  classId: string;
  school: string;
  author: string;
  isSample: boolean;
  topic: MathTopic | string;
  problemText: string;
  mathAnalysis: MathAnalysisResult;
  storyboard: Storyboard;
  moderationChecklist: ModerationChecklist;
  problemCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ErrorType =
  | 'KHÔNG_CÓ'
  | 'SAI_DỮ_KIỆN'
  | 'SAI_LỰA_CHỌN_PHÉP_TÍNH'
  | 'SAI_TÍNH_TOÁN'
  | 'SAI_ĐƠN_VỊ'
  | 'THIẾU_LỜI_GIẢI'
  | 'CHƯA_HIỂU_TÌNH_HUỐNG';

export interface StudentSubmission {
  id: string;
  projectId: string;
  studentCode: string;
  studentName: string;
  chosenOption: string;
  isCorrect: boolean;
  attemptCount: number;
  timeTakenSeconds: number;
  errorType: ErrorType;
  isDemo: boolean;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalProjects: number;
  publishedProjects: number;
  totalSubmissions: number;
  accuracyRate: number;
  errorDistribution: Record<string, number>;
  recentSubmissions: StudentSubmission[];
}
