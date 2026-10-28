import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Layers,
  Clock,
  BookOpen,
  Edit3,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { MathAnalysisResult, MathTopic } from '../../types/mathStory';
import { analyzeMathProblem } from '../../services/api';
import { OperationModelSelector } from '../common/DeterministicVisuals';

export const TOPICS_BY_GRADE: Record<string, string[]> = {
  'Lớp 1': [
    'Các số trong phạm vi 10, 20, 100',
    'Phép cộng không nhớ trong phạm vi 100',
    'Phép trừ không nhớ trong phạm vi 100',
    'Bài toán thực tế đơn giản có lời văn',
    'Đo độ dài (cm, gang tay)',
    'Thời gian: Ngày trong tuần, xem đồng hồ',
    'Hình học trực quan (Hình vuông, tròn, tam giác, chữ nhật)',
  ],
  'Lớp 2': [
    'Phép cộng có nhớ trong phạm vi 100',
    'Phép trừ có nhớ trong phạm vi 100',
    'Bảng nhân 2 và Bảng nhân 5',
    'Bảng chia 2 và Bảng chia 5',
    'Bài toán có lời văn (Thêm vào - Bớt đi)',
    'Bài toán nhiều hơn - ít hơn',
    'Đo độ dài (cm, dm, m, km)',
    'Khối lượng và Dung tích (kg, lít)',
    'Thời gian, đồng hồ và lịch',
    'Tiền Việt Nam (đồng)',
    'Hình học trực quan (Điểm, đoạn thẳng, khối trụ, khối cầu)',
    'Tình huống Toán học trong đời sống',
  ],
  'Lớp 3': [
    'Phép cộng, trừ các số có ba chữ số (có nhớ)',
    'Bảng nhân và Bảng chia từ 3 đến 9',
    'Bài toán giải bằng hai bước tính',
    'Gấp một số lên nhiều lần, giảm đi một số lần',
    'Đo lường (mm, g, ml, nhiệt độ)',
    'Chu vi và diện tích hình chữ nhật, hình vuông',
    'Góc vuông, góc không vuông',
    'Số La Mã và xem đồng hồ chính xác',
  ],
  'Lớp 4': [
    'Phép cộng, trừ các số có nhiều chữ số',
    'Nhân, chia với số có hai chữ số',
    'Phân số và các phép tính với phân số',
    'Tìm số trung bình cộng, tổng và hiệu',
    'Hình bình hành, hình thoi',
    'Đo lường (tạ, tấn, yến, giây, thế kỷ)',
  ],
  'Lớp 5': [
    'Phân số thập phân và Số thập phân',
    'Cộng, trừ, nhân, chia số thập phân',
    'Tỉ số phần trăm và ứng dụng',
    'Hình tam giác, hình thang, hình tròn',
    'Hình hộp chữ nhật, hình lập phương',
    'Toán chuyển động đều (Vận tốc, Quãng đường, Thời gian)',
  ],
};

// Trích xuất nhân vật có trong đề bài
export function extractCharactersFromProblem(text: string): string[] {
  const characters: string[] = [];
  const knownKeywords = [
    { pattern: /\b(bé lan|lan)\b/i, name: 'Bé Lan' },
    { pattern: /\b(mẹ|mẹ lan)\b/i, name: 'Mẹ' },
    { pattern: /\b(bác an|ông an)\b/i, name: 'Bác An' },
    { pattern: /\b(bạn nam|bé nam|nam)\b/i, name: 'Bạn Nam' },
    { pattern: /\b(bạn minh|bé minh|minh)\b/i, name: 'Bé Minh' },
    { pattern: /\b(bà ngoại|bà nội|bà)\b/i, name: 'Bà' },
    { pattern: /\b(bố|ba)\b/i, name: 'Bố' },
    { pattern: /\b(cô giáo|cô hương)\b/i, name: 'Cô giáo Hương' },
    { pattern: /\b(bạn mai|mai)\b/i, name: 'Bạn Mai' },
    { pattern: /\b(bạn hải|hải)\b/i, name: 'Bạn Hải' },
    { pattern: /\b(bạn tuấn|tuấn)\b/i, name: 'Bạn Tuấn' },
    { pattern: /\b(bạn linh|linh)\b/i, name: 'Bạn Linh' },
    { pattern: /\b(bạn hoa|hoa)\b/i, name: 'Bạn Hoa' },
    { pattern: /\b(bạn cúc|cúc)\b/i, name: 'Bạn Cúc' },
  ];

  for (const item of knownKeywords) {
    if (item.pattern.test(text)) {
      if (!characters.includes(item.name)) {
        characters.push(item.name);
      }
    }
  }

  if (characters.length === 0) {
    const nameMatch = text.match(/\b(Bạn|Bác|Chú|Cô|Bé|Em)\s+([A-ZÀ-Ỹ][a-zà-ỹ]+)/);
    if (nameMatch) {
      characters.push(`${nameMatch[1]} ${nameMatch[2]}`);
    } else {
      characters.push('Bé Lan');
    }
  }

  return characters;
}

interface MathInputAnalysisProps {
  currentAnalysis: MathAnalysisResult | null;
  onAnalysisApproved: (analysis: MathAnalysisResult) => void;
  onGoToStoryboard: () => void;
  selectedGrade?: string;
  onGradeChange?: (grade: string) => void;
}

export const MathInputAnalysis: React.FC<MathInputAnalysisProps> = ({
  currentAnalysis,
  onAnalysisApproved,
  onGoToStoryboard,
  selectedGrade = 'Lớp 2',
  onGradeChange,
}) => {
  const [grade, setGrade] = useState(currentAnalysis?.grade || selectedGrade || 'Lớp 2');
  const [problemText, setProblemText] = useState(
    currentAnalysis?.problemStatement ||
      'Lan có 25 quả cam. Lan được tặng thêm 17 quả cam. Hỏi Lan có tất cả bao nhiêu quả cam?'
  );
  const [topic, setTopic] = useState<string>('Phép cộng có nhớ trong phạm vi 100');
  const [targetStudentLevel, setTargetStudentLevel] = useState('Đại trà & Cần củng cố');
  const [videoDuration, setVideoDuration] = useState('45');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MathAnalysisResult | null>(currentAnalysis);
  const [teacherEditMode, setTeacherEditMode] = useState(false);
  const [customCalc, setCustomCalc] = useState('');
  const [customResult, setCustomResult] = useState<number | string>('');
  const [problemCode, setProblemCode] = useState<string>(() => {
    return currentAnalysis?.problemCode || 'TOAN2-CAM01';
  });

  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade);
    onGradeChange?.(newGrade);
    const availableTopics = TOPICS_BY_GRADE[newGrade] || TOPICS_BY_GRADE['Lớp 2'];
    setTopic(availableTopics[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProblemText(
        'Đàn gà nhà bà có 34 con gà mái và 18 con gà trống. Hỏi đàn gà nhà bà có tất cả bao nhiêu con gà?'
      );
      setTopic('Phép cộng có nhớ trong phạm vi 100');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = (sampleType: 'cam' | 'ga' | 'nhan' | 'nhieu_nhan_vat') => {
    if (sampleType === 'cam') {
      setProblemCode('TOAN2-CAM01');
      setProblemText(
        'Lan có 25 quả cam. Lan được tặng thêm 17 quả cam. Hỏi Lan có tất cả bao nhiêu quả cam?'
      );
      setTopic('Phép cộng có nhớ trong phạm vi 100');
    } else if (sampleType === 'ga') {
      setProblemCode('TOAN2-GA02');
      setProblemText(
        'Bác An có 50 quả trứng gà. Bác đã bán đi 24 quả trứng. Hỏi bác An còn lại bao nhiêu quả trứng gà?'
      );
      setTopic('Phép trừ có nhớ trong phạm vi 100');
    } else if (sampleType === 'nhan') {
      setProblemCode('TOAN2-NHAN03');
      setProblemText(
        'Bạn Nam trồng được 4 hàng cây bạch đàn, mỗi hàng có 5 cây. Hỏi bạn Nam trồng được tất cả bao nhiêu cây bạch đàn?'
      );
      setTopic('Bảng nhân 2 và Bảng nhân 5');
    } else {
      // Sample with > 2 characters to test rule
      setProblemCode('TOAN2-NHOM04');
      setProblemText(
        'Bé Lan có 15 quả táo. Bạn Nam cho Lan 5 quả táo và Bạn Minh cho Lan thêm 8 quả táo. Hỏi Lan có tất cả bao nhiêu quả táo?'
      );
      setTopic('Bài toán có lời văn (Thêm vào - Bớt đi)');
    }
  };

  useEffect(() => {
    if (currentAnalysis) {
      if (currentAnalysis.problemCode) {
        setProblemCode(currentAnalysis.problemCode);
      }
      const safeOp =
        currentAnalysis.operation ||
        (currentAnalysis.calculation?.includes('-')
          ? 'TRỪ'
          : currentAnalysis.calculation?.includes('×') || currentAnalysis.calculation?.includes('*')
          ? 'NHÂN'
          : currentAnalysis.calculation?.includes(':') || currentAnalysis.calculation?.includes('/')
          ? 'CHIA'
          : 'CỘNG');
      setAnalysis({
        ...currentAnalysis,
        operation: safeOp as any,
      });
      setProblemText(currentAnalysis.problemStatement);
      setCustomCalc(currentAnalysis.calculation);
      setCustomResult(currentAnalysis.result ?? '');
    }
  }, [currentAnalysis]);

  const handleAnalyze = async () => {
    if (!problemText.trim()) {
      setError('Vui lòng nhập nội dung bài toán.');
      return;
    }
    setError(null);
    setLoading(true);

    let text = problemText.trim();
    text = text.replace(/một chục/gi, '10').replace(/1 chục/gi, '10').replace(/hai chục/gi, '20').replace(/2 chục/gi, '20');
    const nums = (text.match(/\d+/g) || []).map(Number);
    const lower = text.toLowerCase();

    // 1. Xác định các nhân vật xuất hiện trong đề bài
    const extractedCharacters = extractCharactersFromProblem(problemText);
    const hasExcessCharacters = extractedCharacters.length > 2;

    if (text.length < 10 || nums.length < 2) {
      const invalidMsg = nums.length < 2
        ? `Bài toán không hợp lệ: Đề bài chỉ có ${nums.length} số liệu. Để biên kịch và giải toán, đề bài cần ít nhất 2 số liệu và câu hỏi cụ thể.`
        : 'Bài toán không hợp lệ: Nội dung đề bài quá ngắn hoặc không đầy đủ thông tin.';
      setError(invalidMsg);
      const invalidAnalysis: MathAnalysisResult = {
        problemCode,
        problemStatement: problemText,
        givenData: nums.map((n) => `Số liệu tìm thấy: ${n}`),
        target: 'Chưa đủ dữ kiện để xác định yêu cầu',
        mathematicalRelation: invalidMsg,
        operation: 'KHÔNG_HỢP_LỆ' as any,
        calculation: 'Chưa thể thực hiện phép tính',
        result: null,
        unit: 'đơn vị',
        isValid: false,
        validationMessage: invalidMsg,
        charactersInProblem: extractedCharacters,
        hasExcessCharacters,
        knowledgeGoal: 'Cần bổ sung đề bài đầy đủ',
        commonMistakes: ['Đề bài thiếu dữ kiện số liệu hoặc không có câu hỏi cần tìm.'],
        guidingQuestions: ['Đề bài đã cho biết những số lượng nào?', 'Bài toán yêu cầu tìm cái gì?'],
        verifiedByDeterministicCode: true,
        status: 'CHỜ_PHÊ_DUYỆT',
      };
      setAnalysis(invalidAnalysis);
      setLoading(false);
      return;
    }

    // 2. Xác định dữ kiện và đơn vị riêng cho từng số liệu
    const a = nums[0];
    const b = nums[1];

    const getNumberUnit = (n: number, fallback: string): string => {
      const rx = new RegExp(`(?:^|\\D)${n}\\s+([a-zA-ZÀ-ỹ\\s]{1,30}?)(?=[,.;:!?]|\\bvà\\b|\\bmỗi\\b|\\bthì\\b|\\bhỏi\\b|\\bđược\\b|\\bcho\\b|\\bbán\\b|\\bbớt\\b|$)`, 'i');
      const m = text.match(rx);
      if (m && m[1]) {
        const w = m[1].trim().toLowerCase();
        if (w.includes('hàng cây')) return 'hàng cây';
        if (w.includes('hàng')) return 'hàng';
        if (w.includes('nhóm')) return 'nhóm';
        if (w.includes('túi')) return 'túi';
        if (w.includes('hộp')) return 'hộp';
        if (w.includes('đĩa')) return 'đĩa';
        if (w.includes('rổ')) return 'rổ';
        if (w.includes('thùng')) return 'thùng';
        if (w.includes('chuồng')) return 'chuồng';
        if (w.includes('bình')) return 'bình';
        if (w.includes('cây')) return 'cây';
        if (w.includes('quả cam') || w.includes('cam')) return 'quả cam';
        if (w.includes('quả trứng') || w.includes('trứng')) return 'quả trứng';
        if (w.includes('quả táo') || w.includes('táo')) return 'quả táo';
        if (w.includes('bông hoa') || w.includes('hoa')) return 'bông hoa';
        if (w.includes('viên bi') || w.includes('bi')) return 'viên bi';
        if (w.includes('con gà') || w.includes('gà')) return 'con gà';
        if (w.includes('học sinh') || w.includes('bạn')) return 'học sinh';
        if (w.includes('quyển sách') || w.includes('quyển vở') || w.includes('vở') || w.includes('sách')) return 'quyển vở';
        if (w.includes('cái kẹo') || w.includes('kẹo')) return 'cái kẹo';
        if (w.includes('cm')) return 'cm';
        if (w.includes('kg')) return 'kg';
        if (w.includes('lít')) return 'lít';
        return m[1].trim();
      }
      return fallback;
    };

    let baseUnit = 'đơn vị';
    if (lower.includes('cây bạch đàn') || lower.includes('cây')) baseUnit = 'cây';
    else if (lower.includes('quả cam') || lower.includes('cam')) baseUnit = 'quả cam';
    else if (lower.includes('quả trứng') || lower.includes('trứng gà') || lower.includes('trứng')) baseUnit = 'quả trứng';
    else if (lower.includes('con gà') || lower.includes('gà')) baseUnit = 'con gà';
    else if (lower.includes('bông hoa') || lower.includes('hoa')) baseUnit = 'bông hoa';
    else if (lower.includes('viên bi') || lower.includes('bi')) baseUnit = 'viên bi';
    else if (lower.includes('quả táo') || lower.includes('táo')) baseUnit = 'quả táo';
    else if (lower.includes('học sinh') || lower.includes('bạn')) baseUnit = 'học sinh';
    else if (lower.includes('quyển sách') || lower.includes('quyển vở') || lower.includes('vở') || lower.includes('sách')) baseUnit = 'quyển vở';
    else if (lower.includes('cái kẹo') || lower.includes('kẹo')) baseUnit = 'cái kẹo';
    else if (lower.includes('cm')) baseUnit = 'cm';
    else if (lower.includes('kg')) baseUnit = 'kg';
    else if (lower.includes('lít')) baseUnit = 'lít';

    const unit1 = getNumberUnit(a, baseUnit);
    const unit2 = getNumberUnit(b, baseUnit);

    const isMul = lower.includes('nhân') || lower.includes('gấp') || ((lower.includes('mỗi') || lower.includes('1 hàng') || lower.includes('mỗi hàng')) && (lower.includes('hàng') || lower.includes('nhóm') || lower.includes('túi') || lower.includes('đĩa') || lower.includes('hộp') || lower.includes('như thế')));
    const isDiv = lower.includes('chia đều') || lower.includes('chia cho') || lower.includes('chia thành') || (lower.includes('chia') && (lower.includes('phần') || lower.includes('bạn') || lower.includes('hàng')));
    const isSub = lower.includes('bớt') || lower.includes('ít hơn') || lower.includes('còn lại') || lower.includes('cho đi') || lower.includes('đã bán') || lower.includes('bán đi') || lower.includes('bán') || lower.includes('trừ');

    // 3. Xác định phép tính thực hiện
    let op = 'CỘNG';
    let resNum = a + b;
    let calcStr = `${a} + ${b} = ${resNum}`;
    let finalUnit = baseUnit;
    let groupUnit: string | undefined = undefined;
    let givenData: string[] = [`${a} ${unit1}`, `${b} ${unit2}`];
    let relationStr = `Vì tìm số lượng tất cả (thêm vào/nhiều hơn) nên ta thực hiện phép cộng: ${calcStr} (${finalUnit}).`;

    if (isMul) {
      op = 'NHÂN';
      resNum = a * b;
      calcStr = `${a} × ${b} = ${resNum}`;
      finalUnit = unit2 !== unit1 ? unit2 : baseUnit;
      groupUnit = unit1;
      const eachUnitLabel = unit1.includes('hàng') ? 'hàng' : unit1.includes('túi') ? 'túi' : unit1.includes('đĩa') ? 'đĩa' : 'nhóm';
      relationStr = `Mỗi nhóm có ${a} (${unit1}), mỗi ${eachUnitLabel} có ${b} ${finalUnit} nên ta thực hiện phép nhân: ${calcStr} (${finalUnit}).`;
      givenData = [
        `${a} ${unit1}`,
        `mỗi ${eachUnitLabel} có ${b} ${finalUnit}`,
      ];
    } else if (isDiv && b !== 0) {
      op = 'CHIA';
      resNum = Math.floor(a / b);
      calcStr = `${a} : ${b} = ${resNum}`;
      finalUnit = unit1;
      groupUnit = unit2;
      relationStr = `Có ${a} (${unit1}) chia đều vào ${b} (${unit2}) nên ta thực hiện phép chia: ${calcStr} (${finalUnit}).`;
      givenData = [
        `${a} ${unit1}`,
        `chia đều vào ${b} ${unit2}`,
      ];
    } else if (isSub) {
      op = 'TRỪ';
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      resNum = big - small;
      calcStr = `${big} - ${small} = ${resNum}`;
      finalUnit = baseUnit;
      relationStr = `Vì có bớt đi, đã bán hoặc tìm số còn lại nên ta thực hiện phép trừ: ${calcStr} (${finalUnit}).`;
      givenData = [
        `${big} ${finalUnit}`,
        `bớt đi ${small} ${finalUnit}`,
      ];
    }

    const instantAnalysis: MathAnalysisResult = {
      problemStatement: problemText,
      givenData,
      target: `Tìm số lượng ${finalUnit} theo yêu cầu bài toán`,
      mathematicalRelation: relationStr,
      operation: op as any,
      calculation: calcStr,
      result: resNum,
      unit: finalUnit,
      groupUnit,
      num1: a,
      num2: b,
      isValid: true,
      validationMessage: '',
      charactersInProblem: extractedCharacters,
      hasExcessCharacters,
      knowledgeGoal: `Rèn luyện khả năng nhận biết dữ kiện, lựa chọn phép tính phù hợp và tính toán chính xác theo chuẩn môn Toán ${grade}.`,
      commonMistakes: [
        'Chọn sai phép tính do đọc lướt từ khóa',
        'Cộng/trừ nhầm khi thực hiện phép tính có nhớ',
        'Quên ghi đơn vị vào đáp số',
      ],
      guidingQuestions: [
        'Bài toán cho em biết những gì?',
        'Bài toán hỏi em điều gì?',
        'Em lựa chọn phép tính nào để giải bài toán?',
      ],
      deterministicCheck: {
        numbers: [a, b],
        operation: op,
        calculation: calcStr,
        result: resNum,
        unit: finalUnit,
        groupUnit,
        explanation: relationStr,
        hasEnoughData: true,
        isValid: true,
        charactersInProblem: extractedCharacters,
      },
      verifiedByDeterministicCode: true,
      problemCode,
      status: 'CHỜ_PHÊ_DUYỆT',
    };

    setAnalysis(instantAnalysis);
    setCustomCalc(calcStr);
    setCustomResult(resNum);
    setLoading(false); // Phân tích tức thì, phản hồi ngay lập tức

    // Gọi AI enrichment ngầm trong background mà không chặn giao diện người dùng
    analyzeMathProblem(problemText, grade, topic, problemCode)
      .then((res) => {
        if (res && res.calculation) {
          setAnalysis((prev) =>
            prev
              ? {
                  ...prev,
                  ...res,
                  problemCode: res.problemCode || problemCode,
                  charactersInProblem: res.charactersInProblem || extractedCharacters,
                  hasExcessCharacters: (res.charactersInProblem || extractedCharacters).length > 2,
                }
              : prev
          );
        }
      })
      .catch((err) => {
        console.warn('Background AI notice:', err);
      });
  };

  const handleApprove = () => {
    if (!analysis || analysis.isValid === false) return;
    const approved: MathAnalysisResult = {
      ...analysis,
      problemCode,
      grade,
      calculation: teacherEditMode ? customCalc : analysis.calculation,
      result: teacherEditMode ? Number(customResult) : analysis.result,
      status: 'ĐÃ_DUYỆT_PHÂN_TÍCH',
    };
    setAnalysis(approved);
    onAnalysisApproved(approved);
  };

  const availableTopics = TOPICS_BY_GRADE[grade] || TOPICS_BY_GRADE['Lớp 2'];
  const charactersList = analysis?.charactersInProblem || [];
  const hasMoreThanTwoCharacters = charactersList.length > 2;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Phân Hệ 1: Phân Tích Cấu Trúc Bài Toán
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              Nhân vật • Dữ kiện • Phép tính & Mô hình
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống tự động xác định nhân vật xuất hiện trong đề bài, bóc tách dữ kiện, xác định phép tính và tạo mô hình toán học phù hợp.
          </p>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Đề mẫu nhanh:</span>
          <button
            onClick={() => handleLoadSample('cam')}
            className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors shadow-2xs cursor-pointer"
          >
            🍊 Quả cam (Lan: 1 NV)
          </button>
          <button
            onClick={() => handleLoadSample('ga')}
            className="text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900 px-3 py-1.5 rounded-xl border border-sky-300 transition-colors shadow-2xs cursor-pointer"
          >
            🥚 Trứng gà (Bác An: 1 NV)
          </button>
          <button
            onClick={() => handleLoadSample('nhan')}
            className="text-xs font-bold bg-teal-100 hover:bg-teal-200 text-teal-900 px-3 py-1.5 rounded-xl border border-teal-300 transition-colors shadow-2xs cursor-pointer"
          >
            🌳 Hàng cây (Nam: 1 NV)
          </button>
          <button
            onClick={() => handleLoadSample('nhieu_nhan_vat')}
            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 px-3 py-1.5 rounded-xl border border-rose-300 transition-colors shadow-2xs cursor-pointer"
          >
            ⚠️ Thử &gt;2 NV (Lan, Nam, Minh)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Nội dung bài toán & Cấu hình</span>
            </h3>

            {/* Khối lớp selection FIRST */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sky-300 bg-sky-50/50 font-bold text-sky-950 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Lớp 1">Lớp 1</option>
                  <option value="Lớp 2">Lớp 2 (Mặc định)</option>
                  <option value="Lớp 3">Lớp 3</option>
                  <option value="Lớp 4">Lớp 4</option>
                  <option value="Lớp 5">Lớp 5</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Thời lượng video:</label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="30">30 giây (3 cảnh gọn)</option>
                  <option value="45">45 giây (Chuẩn sư phạm)</option>
                  <option value="60">60 giây (Mở rộng)</option>
                </select>
              </div>
            </div>

            {/* Chủ đề Toán học selector dynamically filtered by Grade */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Chủ đề Toán học (theo {grade} - CT GDPT 2018):
                </label>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {availableTopics.length} chủ đề
                </span>
              </div>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
              >
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem text area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Đề bài Toán (gõ hoặc dán văn bản):</label>
                <label className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh đề bài (OCR)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Lan có 25 quả cam. Lan được tặng thêm 17 quả cam. Hỏi Lan có tất cả bao nhiêu quả cam?"
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium leading-relaxed bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mức độ học sinh hướng tới:</label>
              <select
                value={targetStudentLevel}
                onChange={(e) => setTargetStudentLevel(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="Đại trà & Cần củng cố">Mức 1: Củng cố & Nhận biết cơ bản</option>
                <option value="Vận dụng tiêu chuẩn">Mức 2: Vận dụng giải toán có lời văn</option>
                <option value="Phát triển tư duy">Mức 3: Nâng cao & Tình huống mở</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang phân tích cấu trúc bài toán...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Phân Tích Cấu Trúc Bài Toán</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysis ? (
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-5 animate-in fade-in duration-200">
              {/* Invalid Warning Banner */}
              {analysis.isValid === false && (
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs shadow-xs">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="font-extrabold text-sm text-red-700 block">
                      ⚠️ BÀI TOÁN KHÔNG HỢP LỆ – KHÔNG THỂ TIẾP TỤC QUY TRÌNH
                    </strong>
                    <p className="text-red-800 font-medium">
                      {analysis.validationMessage || 'Đề bài thiếu dữ kiện số liệu hoặc thông tin cần tìm. Cần ít nhất 2 số liệu và câu hỏi cụ thể.'}
                    </p>
                  </div>
                </div>
              )}

              {/* CRITICAL WARNING: More than 2 characters rule */}
              {hasMoreThanTwoCharacters && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex items-start gap-3 text-rose-950 text-xs shadow-md animate-in fade-in">
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <strong className="font-black text-sm text-rose-900 block uppercase">
                      ⚠️ CẢNH BÁO QUY ĐỊNH: ĐỀ BÀI CÓ {charactersList.length} NHÂN VẬT ({charactersList.join(', ')})
                    </strong>
                    <p className="font-semibold text-rose-800 leading-relaxed">
                      Theo quy định của hệ thống: <strong>Chỉ cho phép tối đa 2 nhân vật</strong> để bảo đảm tính nhất quán trong tạo hình nhân vật và sản xuất video hoạt hình AI.
                    </p>
                    <p className="bg-rose-200/70 p-2 rounded-xl text-rose-950 font-black">
                      ⛔ HỆ THỐNG SẼ KHÔNG CHO PHÉP LÊN KỊCH BẢN Ở PHÂN HỆ 4 VÀ SẼ KHÔNG CÓ VIDEO Ở PHÂN HỆ 6 nếu giữ nguyên nhiều hơn 2 nhân vật.
                    </p>
                    <p className="text-[11px] text-rose-700 italic">
                      * Hướng dẫn: Giáo viên vui lòng sửa lại đề bài ở cột bên trái chỉ gồm tối đa 2 nhân vật (ví dụ: Lan và Mẹ, hoặc chỉ có Bác An) để tiếp tục quy trình tạo video ở Phân hệ 6.
                    </p>
                  </div>
                </div>
              )}

              {/* Header result */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      analysis.isValid === false
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : hasMoreThanTwoCharacters
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : analysis.status === 'ĐÃ_DUYỆT_PHÂN_TÍCH'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {analysis.isValid === false ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>BÀI TOÁN KHÔNG HỢP LỆ</span>
                      </>
                    ) : hasMoreThanTwoCharacters ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>CÓ &gt; 2 NHÂN VẬT (CHẶN PHÂN HỆ 4 &amp; 6)</span>
                      </>
                    ) : analysis.status === 'ĐÃ_DUYỆT_PHÂN_TÍCH' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ĐÃ PHÊ DUYỆT BỞI GIÁO VIÊN</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>CHỜ GIÁO VIÊN DUYỆT</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-700 font-bold font-mono bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    Mã số: {problemCode}
                  </span>
                </div>

                {analysis.isValid !== false && (
                  <button
                    onClick={() => setTeacherEditMode(!teacherEditMode)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{teacherEditMode ? 'Đóng chỉnh sửa' : 'Chỉnh sửa'}</span>
                  </button>
                )}
              </div>

              {/* THREE CORE ELEMENTS REQUIRED BY PHÂN HỆ 1 */}
              <div className="space-y-4">
                {/* 1. Nhân vật xuất hiện trong đề bài */}
                <div className={`p-4 rounded-2xl border-2 space-y-2 ${
                  hasMoreThanTwoCharacters ? 'bg-rose-50/80 border-rose-300' : 'bg-teal-50/70 border-teal-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>1. Nhân vật xuất hiện trong đề bài:</span>
                    </h4>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      hasMoreThanTwoCharacters ? 'bg-rose-200 text-rose-900' : 'bg-teal-200 text-teal-900'
                    }`}>
                      {charactersList.length} nhân vật {hasMoreThanTwoCharacters ? '(Quá giới hạn > 2)' : '(Hợp lệ ≤ 2)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {charactersList.map((charName, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-3 py-1.5 rounded-xl border border-teal-300 text-xs font-black text-teal-950 shadow-2xs flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        <span>{charName}</span>
                      </span>
                    ))}
                  </div>

                  {hasMoreThanTwoCharacters ? (
                    <p className="text-[11px] text-rose-700 font-bold pt-1">
                      ⚠️ Vì có {charactersList.length} nhân vật (&gt; 2 nhân vật), hệ thống sẽ không cho phép lên kịch bản ở Phân hệ 4 và không có video ở Phân hệ 6.
                    </p>
                  ) : (
                    <p className="text-[11px] text-teal-700 font-medium">
                      ✓ Đề bài có {charactersList.length} nhân vật (đạt yêu cầu tối đa 2 nhân vật). Sẽ tự động đưa vào kịch bản Phân hệ 2 và Phân hệ 3.
                    </p>
                  )}
                </div>

                {/* 2 & 3. Dữ kiện & Phép tính thực hiện */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Given & Target */}
                  <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2">
                    <h4 className="font-extrabold text-sky-900 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                      <span>2. Dữ kiện từ đề bài:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-800 font-bold">
                      {analysis.givenData?.map((item, idx) => (
                        <li key={idx}>{item.startsWith('Dữ kiện') ? item : `Dữ kiện ${idx + 1}: ${item}`}</li>
                      ))}
                    </ul>

                    <h4 className="font-extrabold text-sky-900 text-xs pt-2 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Yêu cầu cần tìm:</span>
                    </h4>
                    <p className="text-slate-800 font-semibold">{analysis.target}</p>
                  </div>

                  {/* Operation & Result */}
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                    <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>3. Xác định phép tính thực hiện:</span>
                    </h4>

                    {teacherEditMode ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Phép tính:</label>
                          <input
                            type="text"
                            value={customCalc}
                            onChange={(e) => setCustomCalc(e.target.value)}
                            className="w-full p-1.5 border rounded bg-white text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Đáp số:</label>
                          <input
                            type="number"
                            value={customResult}
                            onChange={(e) => setCustomResult(e.target.value)}
                            className="w-full p-1.5 border rounded bg-white text-xs font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-bold">Phép tính:</span>
                          <span className="font-mono font-black text-amber-950 bg-amber-200/90 px-2.5 py-1 rounded-lg text-sm border border-amber-300">
                            {analysis.calculation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-bold">Loại phép tính:</span>
                          <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {(analysis.operation || '').includes('CỘNG') || analysis.operation === '+'
                              ? 'Phép cộng'
                              : (analysis.operation || '').includes('TRỪ') || analysis.operation === '-'
                              ? 'Phép trừ'
                              : (analysis.operation || '').includes('NHÂN') || analysis.operation === '×'
                              ? 'Phép nhân'
                              : (analysis.operation || '').includes('CHIA') || analysis.operation === ':'
                              ? 'Phép chia'
                              : analysis.operation || 'Phép cộng'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-bold">Đáp số chuẩn:</span>
                          <span className="font-black text-slate-900">
                            {analysis.result !== null ? `${analysis.result} ${analysis.unit}` : 'Chưa có'}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 italic pt-1">
                          {analysis.mathematicalRelation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. TẠO MÔ HÌNH PHÙ HỢP VỚI PHÉP TÍNH THỰC HIỆN */}
              {analysis.isValid !== false && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-sky-600 text-white text-xs font-bold">Mô hình</span>
                    <h4 className="font-black text-slate-900 text-sm">
                      Mô hình toán học trực quan phù hợp với phép tính ({analysis.operation || 'CỘNG'}):
                    </h4>
                  </div>
                  <OperationModelSelector
                    operation={analysis.operation || 'CỘNG'}
                    num1={analysis.num1 ?? 25}
                    num2={analysis.num2 ?? 17}
                    result={analysis.result ?? 42}
                    unit={analysis.unit || 'quả cam'}
                    groupUnit={analysis.groupUnit}
                  />
                </div>
              )}

              {/* Pedagogical goals */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mục tiêu năng lực theo CT GDPT 2018 ({grade}):</span>
                </h4>
                <p className="text-slate-700 leading-relaxed font-medium">{analysis.knowledgeGoal}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 italic">
                  * Yêu cầu quy trình: Giáo viên phê duyệt phân tích trước khi chuyển sang Phân hệ 2.
                </div>

                <div className="flex items-center gap-2">
                  {analysis.isValid === false ? (
                    <span className="text-red-700 bg-red-100 px-4 py-2 rounded-xl text-xs font-bold border border-red-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Đề bài không hợp lệ – Không thể phê duyệt
                    </span>
                  ) : analysis.status !== 'ĐÃ_DUYỆT_PHÂN_TÍCH' ? (
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Phê Duyệt Phân Tích Này</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã duyệt
                      </span>
                      <button
                        onClick={onGoToStoryboard}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Chuyển Sang Biên Kịch (Phân hệ 2)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Calculator className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h4 className="font-extrabold text-slate-700 text-base">Chưa có kết quả phân tích</h4>
              <p className="text-xs max-w-md mx-auto text-slate-500 leading-relaxed">
                Nhập đề bài toán ở cột bên trái hoặc chọn <strong>"Đề mẫu quả cam (25 + 17)"</strong> rồi bấm nút <strong>"Phân Tích Cấu Trúc Bài Toán"</strong> để bắt đầu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
