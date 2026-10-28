/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomeDashboard } from './components/home/HomeDashboard';
import { MathInputAnalysis } from './components/analysis/MathInputAnalysis';
import { StoryboardEditor } from './components/storyboard/StoryboardEditor';
import { CharacterLibrary } from './components/characters/CharacterLibrary';
import { ReviewScript } from './components/reviewScript/ReviewScript';
import { AudioStudio } from './components/audio/AudioStudio';
import { InteractivePlayer } from './components/interactive/InteractivePlayer';
import { PersonalizedLearning } from './components/personalized/PersonalizedLearning';
import { TeacherModeration } from './components/moderation/TeacherModeration';
import { MaterialLibrary } from './components/library/MaterialLibrary';
import { GoogleFlowModal } from './components/flowGuide/GoogleFlowModal';
import {
  CharacterProfile,
  MathAnalysisResult,
  ModerationChecklist,
  ProjectLesson,
  Scene,
  Storyboard,
  StoryTheme,
} from './types/mathStory';
import {
  fetchAppStatus,
  fetchCharacters,
  fetchProjects,
  saveProject,
  updateProject,
  deleteProject,
} from './services/api';
import { soundEffects } from './utils/audioEffects';
import { generateCombinedScriptPrompt } from './utils/promptGenerator';

function getDefaultSceneImage(sceneNumber: number, unit: string = 'quả cam'): string {
  const u = (unit || '').toLowerCase();
  if (u.includes('trứng') || u.includes('gà')) {
    if (sceneNumber === 1) return 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80';
    if (sceneNumber === 2) return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1200&q=80';
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80';
  }
  if (u.includes('cây') || u.includes('hoa')) {
    if (sceneNumber === 1) return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80';
    if (sceneNumber === 2) return 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&q=80';
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80';
  }
  if (sceneNumber === 1) return 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=1200&q=80';
  if (sceneNumber === 2) return 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80';
}

function createStoryboardFromAnalysis(
  analysis: MathAnalysisResult,
  theme: StoryTheme = 'Gia đình và cuộc sống',
  characterName: string = 'Bé Lan',
  grade: string = 'Lớp 2'
): Storyboard {
  const num1 = analysis.num1 ?? analysis.deterministicCheck?.numbers?.[0] ?? 25;
  const num2 = analysis.num2 ?? analysis.deterministicCheck?.numbers?.[1] ?? 17;
  const op = analysis.operation || analysis.deterministicCheck?.operation || 'CỘNG';
  const unit = analysis.unit || analysis.deterministicCheck?.unit || 'quả cam';
  const res = analysis.result ?? analysis.deterministicCheck?.result ?? (op.includes('TRỪ') ? Math.max(num1, num2) - Math.min(num1, num2) : num1 + num2);
  const calc = analysis.calculation || `${num1} + ${num2} = ${res}`;

  const charactersList = analysis.charactersInProblem && analysis.charactersInProblem.length > 0
    ? analysis.charactersInProblem
    : [characterName];
  const isSingleChar = charactersList.length === 1;
  const mainChar = charactersList[0] || characterName;
  const secondChar = isSingleChar ? '' : (charactersList[1] || 'Mẹ');

  let scene1Title = `Cảnh 1: Khởi đầu vui tươi cùng ${mainChar}`;
  let scene1Dialogue = `Chào các bạn nhỏ! Mình đang có ${num1} ${unit} đây này!`;
  let scene1Action = `${mainChar} đang vui vẻ chăm sóc và chuẩn bị ${num1} ${unit}.`;
  let scene1Math = `Dữ kiện 1: ${num1} ${unit}`;

  let scene2Title = `Cảnh 2: Tình huống phát sinh & Câu hỏi tương tác`;
  let scene2Action = `Tình huống xuất hiện với ${num2} ${unit}. ${mainChar} tạm dừng lại để cùng các bạn học sinh suy nghĩ!`;
  let scene2Dialogue = `Bây giờ các bạn hãy giúp mình tìm phép tính đúng nhé!`;
  let scene2Math = `Dữ kiện 2: ${num2} ${unit}`;

  let questionText = `Đố em: Để tìm kết quả bài toán, ta chọn phép tính nào?`;
  let correctLabel = `A. ${num1} + ${num2}`;
  let distractor1 = `B. ${num1} - ${num2}`;
  let distractor2 = `C. ${num1} × ${num2}`;
  let correctFeedback = `Tuyệt vời! Em chọn phép tính rất chính xác!`;
  let hint1 = `Em hãy đọc kỹ câu hỏi của bài toán nhé!`;
  let hint2 = `Quan sát mối quan hệ giữa ${num1} và ${num2} ${unit}.`;

  if (op.includes('TRỪ') || op === '-') {
    scene1Dialogue = `Chào các bạn! Lúc đầu mình có ${num1} ${unit} đấy!`;
    scene2Dialogue = isSingleChar
      ? `Sau đó mình đã bán đi (hoặc bớt) ${num2} ${unit}. Đố các bạn biết mình còn lại bao nhiêu ${unit}?`
      : `Sau đó đã bán đi (hoặc bớt) ${num2} ${unit}. Đố các bạn biết còn lại bao nhiêu ${unit}?`;
    questionText = `Đố em: Muốn biết còn lại bao nhiêu ${unit}, ta thực hiện phép tính gì?`;
    correctLabel = `A. ${num1} - ${num2}`;
    distractor1 = `B. ${num1} + ${num2}`;
    distractor2 = `C. ${num1} : ${num2}`;
    correctFeedback = `Hoan hô em! Muốn tìm phần còn lại ta lấy ${num1} - ${num2}.`;
    hint1 = `Khi bớt đi hoặc bán đi thì số lượng sẽ ít hơn lúc đầu!`;
    hint2 = `Ít hơn thì dùng phép tính trừ (-) em nhé!`;
  } else if (op.includes('NHÂN') || op === '×' || op === '*') {
    scene1Dialogue = `Chào các bạn! Ở đây có ${num1} nhóm (hoặc hàng) ${unit} này!`;
    scene2Dialogue = isSingleChar
      ? `Mỗi nhóm mình xếp đúng ${num2} ${unit}. Đố các bạn biết tất cả có bao nhiêu ${unit}?`
      : `Mỗi nhóm có đúng ${num2} ${unit}. Đố các bạn biết tất cả có bao nhiêu ${unit}?`;
    questionText = `Đố em: Để tính tất cả số ${unit} trong các nhóm đều nhau, ta dùng phép tính nào?`;
    correctLabel = `A. ${num1} × ${num2}`;
    distractor1 = `B. ${num1} + ${num2}`;
    distractor2 = `C. ${num1} - ${num2}`;
    correctFeedback = `Xuất sắc! Lấy nhiều lần bằng nhau ta dùng phép nhân ${num1} × ${num2}.`;
    hint1 = `Mỗi nhóm đều có ${num2} ${unit}, có tất cả ${num1} nhóm!`;
    hint2 = `Lấy nhiều lần bằng nhau thì ta dùng phép tính nhân (×) nhé!`;
  } else if (op.includes('CHIA') || op === ':') {
    scene1Dialogue = `Chào các bạn! Mình có tất cả ${num1} ${unit}!`;
    scene2Dialogue = `Mình muốn chia đều cho ${num2} bạn. Đố các bạn mỗi bạn nhận được bao nhiêu?`;
    questionText = `Đố em: Để chia đều ${num1} ${unit} cho ${num2} phần, ta chọn phép tính nào?`;
    correctLabel = `A. ${num1} : ${num2}`;
    distractor1 = `B. ${num1} - ${num2}`;
    distractor2 = `C. ${num1} + ${num2}`;
    correctFeedback = `Rất giỏi! Chia thành các phần bằng nhau ta thực hiện phép chia ${num1} : ${num2}.`;
    hint1 = `Chia đều vào các phần bằng nhau!`;
    hint2 = `Chia đều thì ta dùng phép tính chia (:) em nhé!`;
  } else {
    scene1Dialogue = `Chào các bạn nhỏ! Mình đang có ${num1} ${unit} đây này!`;
    scene2Dialogue = isSingleChar
      ? `Ôi thích quá, bây giờ mình lại có thêm ${num2} ${unit} nữa! Đố các bạn biết mình có tất cả bao nhiêu?`
      : `Ôi thích quá, bây giờ lại có thêm ${num2} ${unit} nữa! Đố các bạn biết tất cả có bao nhiêu?`;
    questionText = `Đố em: Để biết có tất cả bao nhiêu ${unit}, ta cần chọn phép tính nào?`;
    correctLabel = `A. ${num1} + ${num2}`;
    distractor1 = `B. ${num1} - ${num2}`;
    distractor2 = `C. ${num1} × ${num2}`;
    correctFeedback = `Tuyệt vời! Khi thêm vào hoặc tìm tất cả, ta thực hiện phép tính cộng ${num1} + ${num2}.`;
    hint1 = `Khi có thêm thì số ${unit} nhiều hơn hay ít đi?`;
    hint2 = `Nhiều hơn thì dùng phép tính cộng (+) em nhé!`;
  }

  const generatedScenes: Scene[] = [
    {
      sceneNumber: 1,
      title: scene1Title,
      duration: 12,
      setting: `Không gian ngập tràn ánh nắng ấm áp theo phong cách ${theme}`,
      characters: [mainChar],
      action: scene1Action,
      dialogue: scene1Dialogue,
      soundFx: 'Nhạc nền thiếu nhi vui tươi, tiếng chim ca ríu rít.',
      mathData: scene1Math,
      imageUrl: getDefaultSceneImage(1, unit),
      imagePrompt: `Hoạt hình 3D dễ thương, phong cách Pixar. Nhân vật thiếu nhi thân thiện (${mainChar}) vui vẻ đứng trong không gian ${theme}, đang vui vẻ chăm sóc và tương tác cùng ${num1} ${unit}. Ánh sáng rực rỡ ấm áp, khung hình rộng 16:9, phong cách giáo dục thiếu nhi trong sáng.`,
      motionPrompt: `Góc máy quay từ từ lia sang phải, ${mainChar} tươi cười vẫy tay chào các bạn học sinh với nét mặt hân hoan, chuyển động mượt mà điện ảnh 16:9.`,
      interactiveQuestion: null,
    },
    {
      sceneNumber: 2,
      title: scene2Title,
      duration: 18,
      setting: `Không gian tiếp nối, xuất hiện thêm dữ kiện (${num2} ${unit})`,
      characters: isSingleChar ? [mainChar] : [secondChar || mainChar],
      action: scene2Action,
      dialogue: scene2Dialogue,
      soundFx: 'Âm thanh chuông báo câu hỏi tương tác (ding dong), nhạc tạm dừng.',
      mathData: scene2Math,
      imageUrl: getDefaultSceneImage(2, unit),
      imagePrompt: isSingleChar
        ? `Hoạt hình 3D dễ thương, phong cách Pixar. Nhân vật ${mainChar} nghiêng đầu suy nghĩ tò mò, tay đặt lên cằm, bên cạnh xuất hiện thêm ${num2} ${unit}, các biểu tượng câu hỏi lấp lánh màu phấn ấm áp, tỷ lệ 16:9.`
        : `Hoạt hình 3D dễ thương. Nhân vật ${mainChar} và ${secondChar} nghiêng đầu suy nghĩ tò mò, tay đặt lên cằm, bên cạnh xuất hiện thêm ${num2} ${unit}, các biểu tượng câu hỏi lấp lánh màu phấn ấm áp, tỷ lệ 16:9.`,
      motionPrompt: `Nhân vật nghiêng đầu với biểu cảm tò mò suy nghĩ, góc máy quay zoom chậm vào khung hình câu hỏi tương tác, dừng chuyển động để chờ câu trả lời, tỷ lệ 16:9.`,
      interactiveQuestion: {
        id: 'q-auto-1',
        type: 'CHỌN_PHÉP_TÍNH',
        question: questionText,
        options: [
          {
            label: correctLabel,
            isCorrect: true,
            feedback: correctFeedback,
          },
          {
            label: distractor1,
            isCorrect: false,
            feedback: `Chưa chính xác rồi. Em hãy đọc lại gợi ý nhé!`,
          },
          {
            label: distractor2,
            isCorrect: false,
            feedback: `Chưa đúng rồi. Em hãy thử lại một lần nữa!`,
          },
        ],
        resultCalculation: calc,
        hintStep1: hint1,
        hintStep2: hint2,
      },
    },
    {
      sceneNumber: 3,
      title: 'Cảnh 3: Chúc mừng & Đáp số trọn vẹn',
      duration: 15,
      setting: 'Khung cảnh rực rỡ sắc màu, các đồ vật được xếp ngay ngắn thành kết quả.',
      characters: [mainChar],
      action: `${mainChar} giơ hai tay ăn mừng chiến thắng cùng các bạn học sinh, hiển thị đáp số rõ ràng trên màn hình.`,
      dialogue: `Đúng rồi các bạn ơi! Phép tính là ${calc}! Các bạn học sinh ${grade} thật là thông minh!`,
      soundFx: 'Âm thanh pháo hoa chúc mừng tưng bừng, tiếng vỗ tay rộn rã.',
      mathData: `Đáp số: ${calc}`,
      imageUrl: getDefaultSceneImage(3, unit),
      imagePrompt: `Hoạt hình 3D dễ thương, phong cách Pixar. Nhân vật ${mainChar} reo hò ăn mừng chiến thắng, giơ hai tay lên cao, các ngôi sao pháo hoa lấp lánh rơi xuống, không khí rộn ràng ngày hội, đáp số ${calc} hiển thị rõ nét, tỷ lệ 16:9.`,
      motionPrompt: `Nhân vật nhảy cẫng lên ăn mừng chiến thắng với nụ cười rạng rỡ, pháo hoa giấy màu sắc rơi lấp lánh xung quanh, góc máy chuyển động tưng bừng chúc mừng học sinh, tỷ lệ 16:9.`,
      interactiveQuestion: null,
    },
  ];

  const combinedPrompt = generateCombinedScriptPrompt({
    grade,
    theme,
    topic: analysis.topic,
    problemStatement: analysis.problemStatement,
    calculation: calc,
    characters: charactersList,
    scenes: generatedScenes,
  });

  return {
    theme,
    durationSeconds: 45,
    style: 'Hoạt hình 3D dễ thương',
    combinedPrompt,
    bgMusic: 'vui-tuoi',
    bgVolume: 25,
    scenes: generatedScenes,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [projects, setProjects] = useState<ProjectLesson[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectLesson | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('Lớp 2');
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('char-lan');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('Trần Minh Anh');
  const [studentCode, setStudentCode] = useState<string>('HS-01');

  // Stop all playing audio/video when switching to any other tab or subsystem
  useEffect(() => {
    soundEffects.stopAll();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    document.querySelectorAll('audio, video').forEach((media) => {
      try {
        (media as HTMLMediaElement).pause();
      } catch (e) {}
    });
  }, [activeTab]);

  // API Status & Flow Guide Modal State
  const [apiStatus, setApiStatus] = useState({
    geminiConfigured: false,
    deterministicMathEngineReady: true,
  });

  const [flowModal, setFlowModal] = useState<{
    isOpen: boolean;
    prompt?: string;
    sceneTitle?: string;
    startImageUrl?: string;
  }>({
    isOpen: false,
  });

  // Initial data loading from server
  useEffect(() => {
    fetchAppStatus().then((status) => {
      setApiStatus({
        geminiConfigured: Boolean(status.geminiConfigured),
        deterministicMathEngineReady: true,
      });
    });

    fetchCharacters().then((chars) => {
      setCharacters(chars);
      if (chars.length > 0) setSelectedCharId(chars[0].id);
    });

    fetchProjects().then((projs) => {
      const fixedProjs = projs.map((p) => ({
        ...p,
        problemCode: p.problemCode || p.mathAnalysis?.problemCode || (p.id === 'project-cam-sample' ? 'TOAN2-CAM01' : p.id),
        mathAnalysis: {
          ...p.mathAnalysis,
          problemCode: p.problemCode || p.mathAnalysis?.problemCode || (p.id === 'project-cam-sample' ? 'TOAN2-CAM01' : p.id),
        },
      }));
      setProjects(fixedProjs);
      if (fixedProjs.length > 0) {
        setActiveProject(fixedProjs[0]);
        if (fixedProjs[0].grade) {
          setSelectedGrade(fixedProjs[0].grade);
        }
      }
    });
  }, []);

  // Update current project helpers
  // Helper: ensures active project is cloned into a new mutable instance when modifying, keeping sample immutable
  const getWorkingProject = (current: ProjectLesson): ProjectLesson => {
    if (current.isSample || current.id === 'project-cam-sample') {
      return {
        ...current,
        id: `project-${Date.now()}`,
        isSample: false,
        createdAt: new Date().toISOString(),
      };
    }
    return current;
  };

  // Update current project helpers
  const handleAnalysisApproved = (analysis: MathAnalysisResult) => {
    const currentGrade = analysis.grade || selectedGrade || 'Lớp 2';
    setSelectedGrade(currentGrade);
    const newStoryboard = createStoryboardFromAnalysis(
      analysis,
      activeProject?.storyboard?.theme || 'Gia đình và cuộc sống',
      activeProject?.storyboard?.scenes?.[0]?.characters?.[0] || 'Bé Lan',
      currentGrade
    );

    // If activeProject is the sample demo project, create a new project instead of modifying the demo
    const isEditingSample = !activeProject || activeProject.isSample || activeProject.id === 'project-cam-sample';
    const targetId = isEditingSample ? `project-${Date.now()}` : activeProject.id;

    const newProject: ProjectLesson = {
      ...(isEditingSample ? {} : activeProject),
      id: targetId,
      problemCode: analysis.problemCode || (isEditingSample ? 'TOAN2-CAM01' : activeProject?.problemCode || `TOAN2-${targetId.slice(-4)}`),
      school: 'Tiểu học Đặng Trần Côn',
      author: 'Hoàng Diệu Hương',
      isSample: false,
      grade: currentGrade,
      classId: currentGrade,
      topic: analysis.topic || (analysis.operation === 'TRỪ' ? 'Phép trừ có nhớ' : analysis.operation === 'NHÂN' ? 'Bảng nhân' : analysis.operation === 'CHIA' ? 'Bảng chia' : 'Phép cộng có nhớ trong phạm vi 100'),
      title: `Bài toán ${analysis.unit}: ${analysis.calculation || analysis.problemStatement.slice(0, 32)}`,
      problemText: analysis.problemStatement,
      mathAnalysis: {
        ...analysis,
        problemCode: analysis.problemCode || (isEditingSample ? 'TOAN2-CAM01' : activeProject?.problemCode || `TOAN2-${targetId.slice(-4)}`),
      },
      storyboard: newStoryboard,
      moderationChecklist: {
        curriculumCompliant: true,
        dataAccurate: true,
        calculationVerified: true,
        dialogueAppropriate: true,
        imageSafe: true,
        characterConsistent: true,
        audioClear: true,
        questionEngaging: true,
        pedagogicalFeedback: true,
        trialTested: true,
        status: 'BẢN_NHÁP',
        approvedBy: 'Hoàng Diệu Hương',
        approvedDate: new Date().toISOString().split('T')[0],
      },
      createdAt: new Date().toISOString(),
    };

    setActiveProject(newProject);
    // If user was modifying an existing non-sample project, update it in list
    if (!isEditingSample) {
      setProjects((prev) => prev.map((p) => (p.id === targetId ? newProject : p)));
      updateProject(targetId, newProject).catch(console.error);
    }

    // Refresh character list from server because Phân hệ 1 auto-registers characters extracted from problem
    fetchCharacters().then((chars) => {
      setCharacters(chars);
      if (analysis.charactersInProblem && analysis.charactersInProblem.length > 0) {
        const found = chars.find((c) => c.name.toLowerCase().includes(analysis.charactersInProblem![0].toLowerCase()));
        if (found) setSelectedCharId(found.id);
      }
    });
  };

  // Phân hệ 9 publishing: creates a brand new project in the library without overwriting the sample or existing items
  const handleSaveApprovalDetails = (school: string, checklist: ModerationChecklist) => {
    if (!activeProject) return;
    const isSample = activeProject.isSample || activeProject.id === 'project-cam-sample';
    const base = getWorkingProject(activeProject);
    const updated: ProjectLesson = {
      ...base,
      school,
      moderationChecklist: checklist,
    };

    setActiveProject(updated);
    setProjects((prev) =>
      isSample
        ? [updated, ...prev.filter((project) => project.id !== updated.id)]
        : prev.map((project) => (project.id === updated.id ? updated : project))
    );
    updateProject(updated.id, updated).catch(console.error);
  };

  const handlePublishProject = (checklist: ModerationChecklist, school?: string) => {
    if (!activeProject) return;
    const isSample = activeProject.isSample || activeProject.id === 'project-cam-sample';
    const targetId = isSample ? `project-${Date.now()}` : activeProject.id;
    const today = new Date().toISOString().split('T')[0];

    const newPublishedProject: ProjectLesson = {
      ...activeProject,
      id: targetId,
      problemCode: activeProject.problemCode || activeProject.mathAnalysis?.problemCode || 'TOAN2-CAM01',
      school: school?.trim() || activeProject.school,
      grade: selectedGrade || activeProject.grade || 'Lớp 2',
      classId: selectedGrade || activeProject.grade || 'Lớp 2',
      isSample: false, // Newly published lesson, keep sample intact
      createdAt: activeProject.createdAt || new Date().toISOString(),
      moderationChecklist: {
        ...checklist,
        status: 'ĐÃ_XUẤT_BẢN',
        approvedDate: checklist.approvedDate || today,
      },
    };

    setProjects((prev) => {
      // Find sample project to ensure it is always preserved in library
      const existingSample = prev.find((p) => p.isSample || p.id === 'project-cam-sample');
      // Keep all other projects that are not the current published project and not the sample
      const otherProjects = prev.filter(
        (p) => p.id !== targetId && p.id !== 'project-cam-sample' && !p.isSample
      );
      // New published project is added at the top, other user projects follow, and DEMO sample is preserved intact
      const result = [newPublishedProject, ...otherProjects];
      if (existingSample) {
        result.push(existingSample);
      }
      return result;
    });

    setActiveProject(newPublishedProject);
    saveProject(newPublishedProject).catch(console.error);
  };

  // Phân hệ 10: Clicking "Mở bài này" sets this project and switches to Phân hệ 7 to open the video
  const handleSelectAndOpenProject = (projectToOpen: ProjectLesson) => {
    setActiveProject(projectToOpen);
    if (projectToOpen.grade) {
      setSelectedGrade(projectToOpen.grade);
    }
    setActiveTab('interactive');
  };

  const handleBackgroundMusicUpdated = (bgMusic: string, bgVolume: number) => {
    if (!activeProject?.storyboard) return;
    const base = getWorkingProject(activeProject);
    const updated: ProjectLesson = {
      ...base,
      storyboard: {
        ...base.storyboard!,
        bgMusic,
        bgVolume,
      },
    };
    setActiveProject(updated);
    if (!activeProject.isSample && activeProject.id !== 'project-cam-sample') {
      updateProject(updated.id, updated).catch(() => {});
    }
  };

  const handleStoryboardSaved = (storyboard: Storyboard) => {
    if (!activeProject) return;
    const base = getWorkingProject(activeProject);
    const updated: ProjectLesson = {
      ...base,
      storyboard,
    };
    setActiveProject(updated);
    if (!activeProject.isSample && activeProject.id !== 'project-cam-sample') {
      updateProject(updated.id, updated).catch(() => {});
    }
  };

  const handleSceneImageUpdated = (sceneNumber: number, imageUrl: string) => {
    if (!activeProject?.storyboard) return;
    const base = getWorkingProject(activeProject);
    const updatedScenes = base.storyboard!.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, imageUrl } : s
    );
    const updated: ProjectLesson = {
      ...base,
      storyboard: {
        ...base.storyboard!,
        scenes: updatedScenes,
      },
    };
    setActiveProject(updated);
    if (!activeProject.isSample && activeProject.id !== 'project-cam-sample') {
      updateProject(updated.id, updated).catch(() => {});
    }
  };

  const handleSceneVideoUpdated = (sceneNumber: number, videoUrl: string) => {
    if (!activeProject?.storyboard) return;
    const base = getWorkingProject(activeProject);
    const updatedScenes = base.storyboard!.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, videoUrl } : s
    );
    const updated: ProjectLesson = {
      ...base,
      storyboard: {
        ...base.storyboard!,
        scenes: updatedScenes,
      },
    };
    setActiveProject(updated);
    if (!activeProject.isSample && activeProject.id !== 'project-cam-sample') {
      updateProject(updated.id, updated).catch(() => {});
    }
  };

  const handleSceneAudioUpdated = (sceneNumber: number, audioUrl: string) => {
    if (!activeProject?.storyboard) return;
    const base = getWorkingProject(activeProject);
    const updatedScenes = base.storyboard!.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, audioUrl } : s
    );
    const updated: ProjectLesson = {
      ...base,
      storyboard: {
        ...base.storyboard!,
        scenes: updatedScenes,
      },
    };
    setActiveProject(updated);
    if (!activeProject.isSample && activeProject.id !== 'project-cam-sample') {
      updateProject(updated.id, updated).catch(() => {});
    }
  };

  const handleUpdateChecklist = (checklist: ModerationChecklist) => {
    if (!activeProject) return;
    const isSample = activeProject.isSample || activeProject.id === 'project-cam-sample';
    const base = getWorkingProject(activeProject);
    const updated: ProjectLesson = {
      ...base,
      moderationChecklist: checklist,
    };
    setActiveProject(updated);
    setProjects((prev) =>
      isSample
        ? [updated, ...prev.filter((project) => project.id !== updated.id)]
        : prev.map((project) => (project.id === updated.id ? updated : project))
    );
    if (!isSample) {
      updateProject(updated.id, updated).catch(console.error);
    }
  };

  // Xóa bài toán trong Phân hệ 9 (chỉ bài không phải demo)
  const handleDeleteProject = async (projectId: string) => {
    if (projectId === 'project-cam-sample') return;
    const target = projects.find((p) => p.id === projectId);
    if (!target || target.isSample) return;

    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    if (activeProject?.id === projectId) {
      const sample = projects.find((p) => p.isSample || p.id === 'project-cam-sample') || projects[0];
      if (sample) setActiveProject(sample);
    }
  };

  // Open Google Flow Guide with prefilled scene prompt and starting image from Scene
  const handleOpenFlowGuide = (prompt?: string, sceneTitle?: string, startImageUrl?: string) => {
    setFlowModal({
      isOpen: true,
      prompt: prompt || '3D cute Pixar cartoon style animation for primary school math story, 16:9 widescreen, smooth cinematic motion.',
      sceneTitle: sceneTitle || 'Cảnh bài toán Tiểu học',
      startImageUrl: startImageUrl || activeProject?.storyboard?.scenes?.[0]?.imageUrl,
    });
  };

  // Canonical sample project quick opener: Mở phân hệ 1
  const handleOpenSampleProject = () => {
    const sample = projects.find((p) => p.isSample) || projects[0];
    if (sample) {
      setActiveProject(sample);
      setActiveTab('analysis');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        apiStatus={apiStatus}
        onOpenFlowGuide={() => handleOpenFlowGuide()}
        selectedGrade={selectedGrade}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && activeProject && (
          <HomeDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            sampleProject={activeProject}
            onOpenSampleProject={handleOpenSampleProject}
          />
        )}

        {/* Phân hệ 1: Nhập & Phân tích cấu trúc bài toán */}
        {activeTab === 'analysis' && (
          <MathInputAnalysis
            currentAnalysis={activeProject?.mathAnalysis || null}
            onAnalysisApproved={handleAnalysisApproved}
            onGoToStoryboard={() => setActiveTab('storyboard')}
            selectedGrade={selectedGrade}
            onGradeChange={(g) => setSelectedGrade(g)}
          />
        )}

        {/* Phân hệ 2: Biên kịch Storyboard */}
        {activeTab === 'storyboard' && activeProject && (
          <StoryboardEditor
            analysis={activeProject.mathAnalysis}
            characters={characters}
            currentStoryboard={activeProject.storyboard}
            onStoryboardSaved={handleStoryboardSaved}
            onOpenFlowGuideWithPrompt={(prompt, title) => handleOpenFlowGuide(prompt, title)}
            onGoToCharacters={() => setActiveTab('characters')}
          />
        )}

        {/* Phân hệ 3: Nhân vật trong bài toán */}
        {activeTab === 'characters' && (
          <CharacterLibrary
            characters={characters}
            analysis={activeProject?.mathAnalysis || null}
            selectedCharId={selectedCharId}
            onSelectCharacter={(id) => setSelectedCharId(id)}
            onCharacterAdded={(newChar) => setCharacters((prev) => [...prev, newChar])}
            onGoToReviewScript={() => setActiveTab('reviewScript')}
            selectedGrade={selectedGrade}
          />
        )}

        {/* Phân hệ 4 (MỚI): Xem lại kịch bản & Tổng hợp Prompt 1, 2, 3 */}
        {activeTab === 'reviewScript' && activeProject && (
          <ReviewScript
            analysis={activeProject.mathAnalysis}
            storyboard={activeProject.storyboard}
            characters={characters}
            onGoToAudioStudio={() => setActiveTab('audio')}
            onGoToAnalysis={() => setActiveTab('analysis')}
            selectedGrade={selectedGrade}
          />
        )}

        {/* Phân hệ 5: Tạo giọng đọc AI */}
        {activeTab === 'audio' && (
          <AudioStudio
            storyboard={activeProject?.storyboard || null}
            onSceneAudioUpdated={handleSceneAudioUpdated}
            onBackgroundMusicUpdated={handleBackgroundMusicUpdated}
            onGoToInteractivePlayer={() => setActiveTab('interactive')}
          />
        )}

        {/* Phân hệ 6: Tạo Video & Âm thanh hoàn chỉnh (Phát toàn bộ sau khi tạo xong) */}
        {activeTab === 'interactive' && activeProject && (
          <InteractivePlayer
            project={activeProject}
            isDemoMode={isDemoMode}
            studentName={studentName}
            studentCode={studentCode}
            onGoToPersonalizedTier={() => setActiveTab('personalized')}
            onGoToAnalysis={() => setActiveTab('analysis')}
            selectedGrade={selectedGrade}
          />
        )}

        {/* Phân hệ 7: Cá nhân hóa 3 mức độ */}
        {activeTab === 'personalized' && activeProject && (
          <PersonalizedLearning
            project={activeProject}
            onGoToModeration={() => setActiveTab('moderation')}
          />
        )}

        {/* Phân hệ 8: Giáo viên kiểm duyệt sư phạm */}
        {activeTab === 'moderation' && activeProject && (
          <TeacherModeration
            project={activeProject}
            onUpdateChecklist={handleUpdateChecklist}
            onSaveApprovalDetails={handleSaveApprovalDetails}
            onPublishProject={handlePublishProject}
            onGoToLibrary={() => setActiveTab('library')}
            selectedGrade={selectedGrade}
          />
        )}

        {/* Phân hệ 9: Thư viện học liệu */}
        {activeTab === 'library' && (
          <MaterialLibrary
            projects={projects}
            activeProjectId={activeProject?.id || ''}
            onSelectProject={handleSelectAndOpenProject}
            onGoToInteractivePlayer={() => setActiveTab('interactive')}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Google Flow Guide Modal */}
      <GoogleFlowModal
        isOpen={flowModal.isOpen}
        onClose={() => setFlowModal({ isOpen: false })}
        promptToCopy={flowModal.prompt}
        sceneTitle={flowModal.sceneTitle}
        startImageUrl={flowModal.startImageUrl}
      />
    </div>
  );
}
