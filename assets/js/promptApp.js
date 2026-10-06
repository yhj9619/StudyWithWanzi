// Anki AI 프롬프트 생성기 - 메인 애플리케이션 로직
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const promptLangSelect = document.getElementById('promptLangSelect');
  const btnModeText = document.getElementById('btnModeText');
  const btnModeTopic = document.getElementById('btnModeTopic');
  const containerSourceText = document.getElementById('containerSourceText');
  const containerSourceTopic = document.getElementById('containerSourceTopic');
  const sourceTextInput = document.getElementById('sourceTextInput');
  const sourceTopicInput = document.getElementById('sourceTopicInput');

  const levelFilterModeSelect = document.getElementById('levelFilterModeSelect');
  const levelSelectionRow = document.getElementById('levelSelectionRow');
  const examTypeSelect = document.getElementById('examTypeSelect');
  const examScoreInput = document.getElementById('examScoreInput');
  const scoreChipsWrapper = document.getElementById('scoreChipsWrapper');
  const scoreChipsList = document.getElementById('scoreChipsList');

  const posNoun = document.getElementById('posNoun');
  const posVerb = document.getElementById('posVerb');
  const posAdj = document.getElementById('posAdj');
  const posAdv = document.getElementById('posAdv');
  const posIdiom = document.getElementById('posIdiom');
  const wordCountSelect = document.getElementById('wordCountSelect');

  const currentFormatTag = document.getElementById('currentFormatTag');
  const promptFieldList = document.getElementById('promptFieldList');
  const btnAddPromptField = document.getElementById('btnAddPromptField');
  const btnResetFieldsToLang = document.getElementById('btnResetFieldsToLang');
  const delimiterSelect = document.getElementById('delimiterSelect');

  const ruleCodeblock = document.getElementById('ruleCodeblock');
  const rulePureCsv = document.getElementById('rulePureCsv');
  const ruleQuoteCommas = document.getElementById('ruleQuoteCommas');
  const ruleLemma = document.getElementById('ruleLemma');
  const ruleNoDupes = document.getElementById('ruleNoDupes');
  const ruleContextMeaning = document.getElementById('ruleContextMeaning');

  const promptOutputText = document.getElementById('promptOutputText');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const toast = document.getElementById('toastNotification');
  const saveStatusIndicator = document.getElementById('saveStatusIndicator');
  const resetPromptSettingsBtn = document.getElementById('resetPromptSettingsBtn');

  // 모바일 화면 전환
  const btnMobileEditTab = document.getElementById('btnMobileEditTab');
  const btnMobilePreviewTab = document.getElementById('btnMobilePreviewTab');
  const btnGoPreviewMobile = document.getElementById('btnGoPreviewMobile');
  const btnGoEditMobile = document.getElementById('btnGoEditMobile');
  const editorPanel = document.querySelector('.editor-panel');
  const previewPanel = document.querySelector('.preview-panel');

  const STORAGE_KEY = 'anki_prompt_generator_settings';
  let saveTimer = null;
  let currentMode = 'text'; // 'text' | 'topic'

  // 언어별 공인 시험 및 기본 열 구성 프리셋
  const EXAM_PRESETS = {
    en: {
      exams: [
        { name: '토익', label: '토익 (TOEIC)', defaultScore: '760점', scoreChips: ['600점', '700점', '760점', '800점', '850점', '900점'] },
        { name: '토플 IBT', label: '토플 IBT (TOEFL)', defaultScore: '81점', scoreChips: ['60점', '71점', '81점', '90점', '100점'] },
        { name: '토플 PBT', label: '토플 PBT (TOEFL)', defaultScore: '584점', scoreChips: ['500점', '550점', '584점', '600점'] },
        { name: '텝스', label: '텝스 (TEPS)', defaultScore: '372점', scoreChips: ['300점', '340점', '372점', '400점', '450점'] },
        { name: '지텔프', label: '지텔프 (G-TELP)', defaultScore: '레벨2 74점', scoreChips: ['레벨2 65점', '레벨2 74점', '레벨2 80점'] },
        { name: '아이엘츠', label: '아이엘츠 (IELTS)', defaultScore: '5.0', scoreChips: ['4.5', '5.0', '5.5', '6.0', '6.5', '7.0'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '수능/교과', label: '수능/교과 어휘', defaultScore: '수능 필수', scoreChips: ['중학 필수', '고교 기본', '수능 필수'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '중급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '토익',
      defaultScore: '760점',
      defaultFields: ['[품사]한국어', '영어', '예문']
    },
    ja: {
      exams: [
        { name: 'JLPT', label: '일본어능력시험 (JLPT)', defaultScore: 'N1', scoreChips: ['N5', 'N4', 'N3', 'N2', 'N1'] },
        { name: 'JPT', label: 'JPT', defaultScore: '740점', scoreChips: ['550점', '650점', '740점', '800점', '900점'] },
        { name: '日檢(NIKKEN)', label: '일본어검정시험 (日檢 NIKKEN)', defaultScore: '750점', scoreChips: ['600점', '700점', '750점', '800점'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'JLPT',
      defaultScore: 'N1',
      defaultFields: ['[품사]한국어', '일본어', '후리가나/발음']
    },
    zh: {
      exams: [
        { name: 'HSK', label: '한어수평고시 (HSK)', defaultScore: '3급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급'] },
        { name: '신HSK', label: '신HSK (3.0)', defaultScore: '3급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급', '7-9급'] },
        { name: 'BCT', label: '실용중국어시험 (BCT)', defaultScore: '(B) 181점', scoreChips: ['(A)', '(B) 181점', '(B) L&R 601점'] },
        { name: 'CPT', label: '중국어실용능력시험 (CPT)', defaultScore: '750점', scoreChips: ['600점', '700점', '750점', '800점'] },
        { name: 'TOCFL', label: '대만중국어능력시험 (TOCFL)', defaultScore: '5급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'HSK',
      defaultScore: '3급',
      defaultFields: ['[품사]한국어', '중국어', '병음']
    },
    fr: {
      exams: [
        { name: 'DELF', label: '델프 (DELF)', defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2'] },
        { name: 'DALF', label: '달프 (DALF)', defaultScore: 'C1', scoreChips: ['C1', 'C2'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'DELF',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '프랑스어', '예문']
    },
    de: {
      exams: [
        { name: '괴테어학검정(Goethe)', label: '괴테어학검정시험 (Goethe)', defaultScore: 'B1(ZD)', scoreChips: ['A1', 'A2', 'B1(ZD)', 'B2', 'C1'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '괴테어학검정(Goethe)',
      defaultScore: 'B1(ZD)',
      defaultFields: ['[품사]한국어', '독일어', '예문']
    },
    es: {
      exams: [
        { name: 'DELE', label: '델레 (DELE)', defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'DELE',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '스페인어', '예문']
    },
    ru: {
      exams: [
        { name: '토르플(TORFL)', label: '토르플 (TORFL)', defaultScore: '1단계', scoreChips: ['기초', '기본', '1단계', '2단계', '3단계'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '토르플(TORFL)',
      defaultScore: '1단계',
      defaultFields: ['[품사]한국어', '러시아어', '예문']
    },
    it: {
      exams: [
        { name: '칠스(CILS)', label: '칠스 (CILS)', defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        { name: '첼리(CELI)', label: '첼리 (CELI)', defaultScore: '3', scoreChips: ['1', '2', '3', '4'] },
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '칠스(CILS)',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '이탈리아어', '예문']
    },
    th: {
      exams: [
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '태국어', '발음']
    },
    vi: {
      exams: [
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '베트남어', '예문']
    },
    id: {
      exams: [
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '말레이⋅인도네시아어', '예문']
    },
    ar: {
      exams: [
        { name: 'FLEX', label: '플렉스 (FLEX)', defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '아랍어', '발음']
    },
    default: {
      exams: [
        { name: '일반 난이도', label: '일반 난이도', defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: '✏️ 직접 입력', defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '일반 난이도',
      defaultScore: '초급',
      defaultFields: ['[품사]한국어', '외국어 단어', '예문']
    }
  };

  // 현재 필드 리스트
  let fields = [
    { id: 'f_1', name: '[품사]한국어' },
    { id: 'f_2', name: '중국어' },
    { id: 'f_3', name: '병음' }
  ];

  // 1. 언어 셀렉트 박스 초기화
  function initLanguageSelect() {
    promptLangSelect.innerHTML = '';
    const list = window.LANGUAGES_DATA || [];
    list.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.id;
      option.textContent = lang.name;
      promptLangSelect.appendChild(option);
    });

    if (!promptLangSelect.value) {
      promptLangSelect.value = 'zh'; // 기본값: 중국어
    }

    updateExamOptions(false);
  }

  // 2. 언어별 시험 및 점수 프리셋/칩 갱신
  function updateExamOptions(isUserManualLangChange = true) {
    const langId = promptLangSelect.value;
    const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];

    const previousExam = examTypeSelect.value;
    examTypeSelect.innerHTML = '';

    let matchedExamObj = null;

    preset.exams.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.name;
      opt.textContent = ex.label || ex.name;
      if (previousExam && ex.name === previousExam) {
        opt.selected = true;
        matchedExamObj = ex;
      }
      examTypeSelect.appendChild(opt);
    });

    if (!matchedExamObj) {
      matchedExamObj = preset.exams.find(e => e.name === preset.defaultExam) || preset.exams[0];
      if (matchedExamObj) {
        examTypeSelect.value = matchedExamObj.name;
      }
    }

    if (isUserManualLangChange) {
      examScoreInput.value = matchedExamObj ? matchedExamObj.defaultScore : '';
    }

    const chips = matchedExamObj ? (matchedExamObj.scoreChips || []) : [];
    renderScoreChips(chips, examScoreInput.value);
  }

  // 점수 / 급수 빠른 선택 칩 렌더링
  function renderScoreChips(chips, currentScore) {
    if (!scoreChipsList || !scoreChipsWrapper) return;
    scoreChipsList.innerHTML = '';
    if (!chips || chips.length === 0) {
      scoreChipsWrapper.style.display = 'none';
      return;
    }
    scoreChipsWrapper.style.display = '';

    const cur = (currentScore || '').trim();
    chips.forEach(chipText => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn' + (chipText === cur ? ' active' : '');
      btn.textContent = chipText;
      btn.addEventListener('click', () => {
        examScoreInput.value = chipText;
        updateActiveChip(chipText);
        updatePromptAndPreview();
      });
      scoreChipsList.appendChild(btn);
    });
  }

  function updateActiveChip(scoreVal) {
    if (!scoreChipsList) return;
    const target = (scoreVal || '').trim();
    const buttons = scoreChipsList.querySelectorAll('.chip-btn');
    buttons.forEach(btn => {
      if (btn.textContent.trim() === target) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 목표 레벨/등급 최종 텍스트 계산
  function getTargetLevelString() {
    const exam = examTypeSelect ? examTypeSelect.value.trim() : '';
    const score = examScoreInput ? examScoreInput.value.trim() : '';

    if (exam === '직접 입력' || exam === '일반 난이도' || exam === '수능/교과') {
      return score;
    }
    if (!exam && !score) {
      return '';
    }
    if (!score) {
      return exam;
    }
    if (!exam) {
      return score;
    }
    if (score.toLowerCase().startsWith(exam.toLowerCase())) {
      return score;
    }
    return `${exam} ${score}`;
  }

  // 언어별 추천 필드 빠른 추가 칩 데이터 생성
  function getQuickChipsForLanguage(langId) {
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
    const langName = langObj ? langObj.name : '외국어';

    if (langId === 'en') {
      return [
        { label: '+ [품사]한국어 뜻', name: '[품사]한국어' },
        { label: '+ 영어 단어', name: '영어' },
        { label: '+ 발음기호', name: '발음기호' },
        { label: '+ 예문(원문)', name: '예문' },
        { label: '+ 예문 해석', name: '예문 해석' },
        { label: '+ 품사', name: '품사' },
        { label: '+ 유의어/반의어', name: '유의어/반의어' }
      ];
    } else if (langId === 'ja') {
      return [
        { label: '+ [품사]한국어 뜻', name: '[품사]한국어' },
        { label: '+ 일본어 단어', name: '일본어' },
        { label: '+ 후리가나/발음', name: '후리가나/발음' },
        { label: '+ 예문(원문)', name: '예문' },
        { label: '+ 예문 해석', name: '예문 해석' },
        { label: '+ 품사', name: '품사' },
        { label: '+ 유의어/반의어', name: '유의어/반의어' }
      ];
    } else if (langId === 'zh') {
      return [
        { label: '+ [품사]한국어 뜻', name: '[품사]한국어' },
        { label: '+ 중국어 단어', name: '중국어' },
        { label: '+ 병음', name: '병음' },
        { label: '+ 예문(원문)', name: '예문' },
        { label: '+ 예문 해석', name: '예문 해석' },
        { label: '+ 예문 병음', name: '예문 병음' },
        { label: '+ 품사', name: '품사' },
        { label: '+ 유의어/반의어', name: '유의어/반의어' }
      ];
    } else {
      return [
        { label: '+ [품사]한국어 뜻', name: '[품사]한국어' },
        { label: `+ ${langName} 단어`, name: `${langName} 단어` },
        { label: '+ 발음/표기', name: '발음/표기' },
        { label: '+ 예문(원문)', name: '예문' },
        { label: '+ 예문 해석', name: '예문 해석' },
        { label: '+ 품사', name: '품사' },
        { label: '+ 유의어/반의어', name: '유의어/반의어' }
      ];
    }
  }

  // 추천 필드 칩 렌더링
  function renderFieldQuickChips(langId) {
    const container = document.getElementById('fieldQuickChipsList');
    if (!container) return;
    container.innerHTML = '';
    const chips = getQuickChipsForLanguage(langId);

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        fields.push({
          id: `f_${Date.now()}_${fields.length}`,
          name: chip.name
        });
        renderFields();
        updatePromptAndPreview();
        showToast(`'${chip.name}' 필드가 추가되었습니다.`);
      });
      container.appendChild(btn);
    });
  }

  // 언어 변경 시 필드 목록 자동 조정 (2열 및 외국어 열을 새 언어에 맞게 자동 전환)
  function adaptFieldsToLanguage(newLangId) {
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === newLangId);
    const newLangName = langObj ? langObj.name : '외국어';
    const preset = EXAM_PRESETS[newLangId] || EXAM_PRESETS['default'];

    // 1) 기본 3개 열 상태인 경우, 해당 언어의 기본 구성으로 바로 전환
    if (fields.length === 3) {
      fields = preset.defaultFields.map((name, i) => ({
        id: `f_${Date.now()}_${i}`,
        name: name === '외국어 단어' ? `${newLangName} 단어` : name
      }));
      renderFields();
      return;
    }

    // 2) 필드를 이미 추가/수정한 경우라도, 2열 및 언어 종속적 필드를 지능적으로 새 언어에 맞춤
    fields.forEach((f, idx) => {
      // 2열 또는 외국어 단어 열
      if (idx === 1 || f.name.includes('단어') || f.name === '중국어' || f.name === '영어' || f.name === '일본어' || f.name === '외국어') {
        if (newLangId === 'en') {
          f.name = '영어';
        } else if (newLangId === 'ja') {
          f.name = '일본어';
        } else if (newLangId === 'zh') {
          f.name = '중국어';
        } else {
          f.name = `${newLangName} 단어`;
        }
      }
      // 발음/병음/후리가나 열
      else if (f.name.includes('병음') || f.name.includes('후리가나') || f.name.includes('발음')) {
        if (newLangId === 'zh') {
          f.name = '병음';
        } else if (newLangId === 'ja') {
          f.name = '후리가나/발음';
        } else if (newLangId === 'en') {
          f.name = '발음기호';
        } else {
          f.name = '발음/표기';
        }
      }
    });

    renderFields();
  }

  function updateResetFieldsButtonLabel() {
    if (!btnResetFieldsToLang) return;
    const langId = promptLangSelect.value;
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
    const langName = langObj ? langObj.name : '선택 언어';
    btnResetFieldsToLang.textContent = `🔄 '${langName}' 기본 필드로 복원`;
  }

  // 3. 필드 렌더링
  function renderFields() {
    promptFieldList.innerHTML = '';

    fields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'prompt-field-item';
      row.dataset.id = field.id;

      row.innerHTML = `
        <div class="field-order-badge">${index + 1}열</div>
        <div class="prompt-field-inputs">
          <input type="text" class="form-input field-input-name" value="${escapeHtml(field.name)}" placeholder="열 항목명 (예: [품사]한국어, 중국어, 병음, 예문)">
        </div>
        <div class="prompt-field-actions">
          <button type="button" class="btn-field-icon btn-move-up" title="위로 이동" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn-field-icon btn-move-down" title="아래로 이동" ${index === fields.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn-field-icon btn-delete-small" title="필드 삭제">🗑️</button>
        </div>
      `;

      // 입력 이벤트
      const nameInput = row.querySelector('.field-input-name');
      nameInput.addEventListener('input', (e) => {
        field.name = e.target.value;
        updatePromptAndPreview();
      });

      // 이동 버튼
      const btnUp = row.querySelector('.btn-move-up');
      const btnDown = row.querySelector('.btn-move-down');
      const btnDel = row.querySelector('.btn-delete-small');

      btnUp.addEventListener('click', () => {
        if (index > 0) {
          const temp = fields[index];
          fields[index] = fields[index - 1];
          fields[index - 1] = temp;
          renderFields();
          updatePromptAndPreview();
        }
      });

      btnDown.addEventListener('click', () => {
        if (index < fields.length - 1) {
          const temp = fields[index];
          fields[index] = fields[index + 1];
          fields[index + 1] = temp;
          renderFields();
          updatePromptAndPreview();
        }
      });

      btnDel.addEventListener('click', () => {
        const rawName = field.name.trim();
        const promptText = rawName
          ? `'${rawName}' 필드를 정말 삭제하시겠습니까?`
          : `${index + 1}번째 열 필드를 정말 삭제하시겠습니까?`;

        if (!confirm(promptText)) {
          return;
        }

        fields.splice(index, 1);
        renderFields();
        updatePromptAndPreview();
        showToast('필드가 삭제되었습니다.');
      });

      promptFieldList.appendChild(row);
    });

    updateFormatBanner();
  }

  // 4. 구분자 및 형태 배너 문자열 생성
  function getDelimiterInfo() {
    const val = delimiterSelect.value;
    if (val === 'tab') return { char: '\t', display: '\\t', name: '탭(\\t)' };
    if (val === 'semicolon') return { char: ';', display: '; ', name: '세미콜론(;)' };
    return { char: ',', display: ', ', name: '쉼표(,)' };
  }

  function updateFormatBanner() {
    const delim = getDelimiterInfo();
    const formula = fields.map(f => f.name.trim() || '미지정').join(delim.display);
    currentFormatTag.textContent = `"${formula}"`;
  }

  // 5. 프롬프트 문자열 생성
  function generatePrompt() {
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === promptLangSelect.value);
    const langName = langObj ? langObj.name : '외국어';

    const delim = getDelimiterInfo();
    const formatFormula = fields.map(f => f.name.trim() || '항목').join(delim.display);

    // 난이도 / 시험 조건절
    const filterMode = levelFilterModeSelect.value;
    const targetLevel = getTargetLevelString();

    let conditionClause = '';
    if (filterMode !== 'none' && targetLevel) {
      if (filterMode === 'below') {
        conditionClause = `${targetLevel} 이하 수준의 단어는 제외하고, `;
      } else if (filterMode === 'above') {
        conditionClause = `${targetLevel} 이상 수준의 단어만 선별하여, `;
      } else if (filterMode === 'exact') {
        conditionClause = `${targetLevel} 수준에 해당하는 단어만 선별하여, `;
      }
    }

    // 품사 텍스트
    const selectedPos = [];
    if (posNoun.checked) selectedPos.push('명사');
    if (posVerb.checked) selectedPos.push('동사');
    if (posAdj.checked) selectedPos.push('형용사');
    if (posAdv.checked) selectedPos.push('부사');
    if (posIdiom.checked) selectedPos.push('숙어/관용구/성어');

    let posClause = '단어(명사, 형용사, 부사, 동사 등)';
    if (selectedPos.length > 0) {
      posClause = `단어(${selectedPos.join(', ')} 등)`;
    }

    // 단어 수
    const countVal = wordCountSelect.value;
    let countClause = '';
    if (countVal !== 'all') {
      countClause = `최대 ${countVal}개 내외로 `;
    }

    // 1번 문장
    let mainSentence = '';
    if (currentMode === 'topic') {
      const topicText = sourceTopicInput.value.trim() || '일상 회화 및 여행';
      mainSentence = `1. [${langName}]에서 '${topicText}' 주제와 관련된 ${conditionClause}${countClause}${posClause}을 ANKI에서 사용할 수 있는 CSV 형태로 뽑아줘.`;
    } else {
      mainSentence = `1. 아래 [${langName}] 중에서 ${conditionClause}${countClause}${posClause}을 ANKI에서 사용할 수 있는 CSV 형태로 뽑아줘.`;
    }

    // 2번 문장 (형태)
    const formatSentence = `2. 형태는 "${formatFormula}" 이 형태로 뽑아줘.`;

    // 작성 규칙 (Anki 최적화)
    const rules = [];
    if (ruleCodeblock.checked) {
      rules.push('불필요한 인사말이나 서론/결론 없이 오직 마크다운 코드블록(```csv ... ```) 안에 CSV 내용만 출력해줘.');
    }
    if (rulePureCsv.checked && !ruleCodeblock.checked) {
      rules.push('불필요한 설명 없이 순수 CSV 텍스트 데이터만 출력해줘.');
    }
    if (ruleQuoteCommas.checked && delim.char === ',') {
      rules.push('예문이나 해석 등 내용 안에 쉼표(,)가 포함된 열은 반드시 큰따옴표("")로 감싸서 CSV 열이 어긋나지 않게 해줘.');
    }
    if (ruleLemma.checked) {
      rules.push('동사나 형용사는 문맥 활용형이 아닌 기본 사전형(원형)으로 변환하여 표기해줘.');
    }
    if (ruleNoDupes.checked) {
      rules.push('중복된 단어는 한 번만 추출해줘.');
    }
    if (ruleContextMeaning.checked) {
      rules.push('한국어 뜻은 본문 문맥에 가장 적합한 대표 의미 위주로 간결하게 정리해줘.');
    }

    let rulesSection = '';
    if (rules.length > 0) {
      rulesSection = `\n\n[작성 규칙]\n` + rules.map(r => `- ${r}`).join('\n');
    }

    // 대상 텍스트 영역
    let textSection = '';
    if (currentMode === 'text') {
      const textContent = sourceTextInput.value.trim();
      textSection = textContent
        ? `\n\n---\n[대상 텍스트]\n${textContent}`
        : `\n\n---\n[대상 텍스트]\n(여기에 분석할 외국어 텍스트나 대본을 붙여넣으세요)`;
    }

    return `${mainSentence}\n${formatSentence}${rulesSection}${textSection}`;
  }

  // 실시간 프롬프트 갱신
  function updatePromptAndPreview(shouldSave = true) {
    updateFormatBanner();

    const prompt = generatePrompt();
    promptOutputText.textContent = prompt;

    if (shouldSave) {
      saveSettingsToStorage();
    }
  }

  // 8. 로컬스토리지 저장 & 복원
  function updateSaveIndicator(text = '✓ 자동 저장됨') {
    if (!saveStatusIndicator) return;
    saveStatusIndicator.textContent = text;
    saveStatusIndicator.classList.add('active');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveStatusIndicator.classList.remove('active');
    }, 1800);
  }

  function saveSettingsToStorage() {
    try {
      const data = {
        version: 2,
        savedAt: new Date().toISOString(),
        langId: promptLangSelect.value,
        mode: currentMode,
        sourceText: sourceTextInput.value,
        sourceTopic: sourceTopicInput.value,
        levelFilterMode: levelFilterModeSelect.value,
        examType: examTypeSelect.value,
        examScore: examScoreInput.value,
        pos: {
          noun: posNoun.checked,
          verb: posVerb.checked,
          adj: posAdj.checked,
          adv: posAdv.checked,
          idiom: posIdiom.checked,
        },
        wordCount: wordCountSelect.value,
        delimiter: delimiterSelect.value,
        rules: {
          codeblock: ruleCodeblock.checked,
          pureCsv: rulePureCsv.checked,
          quoteCommas: ruleQuoteCommas.checked,
          lemma: ruleLemma.checked,
          noDupes: ruleNoDupes.checked,
          contextMeaning: ruleContextMeaning.checked
        },
        fields: fields.map(f => ({ name: f.name }))
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSaveIndicator('✓ 자동 저장됨');
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  }

  function loadSettingsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;

      if (data.langId) {
        promptLangSelect.value = data.langId;
        updateExamOptions(false);
      }

      if (data.mode) {
        setMode(data.mode, false);
      }
      if (data.sourceText !== undefined) sourceTextInput.value = data.sourceText;
      if (data.sourceTopic !== undefined) sourceTopicInput.value = data.sourceTopic;

      if (data.levelFilterMode !== undefined) levelFilterModeSelect.value = data.levelFilterMode;
      if (data.examType !== undefined) examTypeSelect.value = data.examType;
      if (data.examScore !== undefined) {
        examScoreInput.value = data.examScore;
      } else if (data.levelCustom !== undefined) {
        examScoreInput.value = data.levelCustom;
      }

      if (data.pos) {
        posNoun.checked = Boolean(data.pos.noun);
        posVerb.checked = Boolean(data.pos.verb);
        posAdj.checked = Boolean(data.pos.adj);
        posAdv.checked = Boolean(data.pos.adv);
        posIdiom.checked = Boolean(data.pos.idiom);
      }

      if (data.wordCount !== undefined) wordCountSelect.value = data.wordCount;
      if (data.delimiter !== undefined) delimiterSelect.value = data.delimiter;

      if (data.rules) {
        ruleCodeblock.checked = Boolean(data.rules.codeblock);
        rulePureCsv.checked = Boolean(data.rules.pureCsv);
        ruleQuoteCommas.checked = Boolean(data.rules.quoteCommas);
        ruleLemma.checked = Boolean(data.rules.lemma);
        ruleNoDupes.checked = Boolean(data.rules.noDupes);
        ruleContextMeaning.checked = Boolean(data.rules.contextMeaning);
      }

      if (Array.isArray(data.fields) && data.fields.length > 0) {
        fields = data.fields.map((f, i) => ({
          id: `f_${Date.now()}_${i}`,
          name: f.name || `필드 ${i + 1}`
        }));
      }

      const langId = promptLangSelect.value;
      const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];
      const curExam = preset.exams.find(e => e.name === examTypeSelect.value);
      const chips = curExam ? (curExam.scoreChips || []) : [];
      renderScoreChips(chips, examScoreInput.value);
      syncLevelRowState();

      renderFieldQuickChips(promptLangSelect.value);
      updateResetFieldsButtonLabel();

      return true;
    } catch (e) {
      console.warn('localStorage 복원 실패:', e);
      return false;
    }
  }

  function resetAllSettings() {
    if (!confirm('AI 프롬프트 생성기의 모든 설정을 처음 기본값으로 초기화하시겠습니까?\n\n(※ Anki 카드 서식 에디터 등 다른 도구의 저장 설정에는 영향을 주지 않습니다.)')) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    promptLangSelect.value = 'zh';
    setMode('text', false);
    sourceTextInput.value = '';
    sourceTopicInput.value = '';

    levelFilterModeSelect.value = 'below';
    syncLevelRowState();
    updateExamOptions(false);
    examTypeSelect.value = 'HSK';
    examScoreInput.value = '3급';

    const langId = promptLangSelect.value;
    const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];
    const curExam = preset.exams.find(e => e.name === 'HSK');
    renderScoreChips(curExam ? curExam.scoreChips : [], '3급');

    posNoun.checked = true;
    posVerb.checked = true;
    posAdj.checked = true;
    posAdv.checked = true;
    posIdiom.checked = false;
    wordCountSelect.value = 'all';

    delimiterSelect.value = 'comma';

    ruleCodeblock.checked = true;
    rulePureCsv.checked = true;
    ruleQuoteCommas.checked = true;
    ruleLemma.checked = true;
    ruleNoDupes.checked = true;
    ruleContextMeaning.checked = true;

    fields = [
      { id: 'f_1', name: '[품사]한국어' },
      { id: 'f_2', name: '중국어' },
      { id: 'f_3', name: '병음' }
    ];

    renderFields();
    renderFieldQuickChips(promptLangSelect.value);
    updateResetFieldsButtonLabel();
    updatePromptAndPreview(false);
    saveSettingsToStorage();
    updateSaveIndicator('기본값 초기화 완료');
    showToast('AI 프롬프트 생성기 설정이 기본값으로 초기화되었습니다.');
  }

  function setMode(mode, shouldUpdate = true) {
    currentMode = mode;
    if (mode === 'topic') {
      btnModeTopic.classList.add('active');
      btnModeText.classList.remove('active');
      containerSourceTopic.classList.remove('hidden');
      containerSourceText.classList.add('hidden');
    } else {
      btnModeText.classList.add('active');
      btnModeTopic.classList.remove('active');
      containerSourceText.classList.remove('hidden');
      containerSourceTopic.classList.add('hidden');
    }
    if (shouldUpdate) {
      updatePromptAndPreview();
    }
  }

  function syncLevelRowState() {
    const isNone = (levelFilterModeSelect.value === 'none');
    levelSelectionRow.style.opacity = isNone ? '0.45' : '1';
    examTypeSelect.disabled = isNone;
    examScoreInput.disabled = isNone;
    if (scoreChipsWrapper) {
      if (isNone) {
        scoreChipsWrapper.classList.add('disabled');
      } else {
        scoreChipsWrapper.classList.remove('disabled');
      }
    }
  }

  // 9. 컨트롤 이벤트 바인딩
  function initEventListeners() {
    promptLangSelect.addEventListener('change', () => {
      const newLangId = promptLangSelect.value;
      updateExamOptions(true);
      adaptFieldsToLanguage(newLangId);
      renderFieldQuickChips(newLangId);
      updateResetFieldsButtonLabel();
      updatePromptAndPreview();
    });

    btnModeText.addEventListener('click', () => setMode('text'));
    btnModeTopic.addEventListener('click', () => setMode('topic'));

    sourceTextInput.addEventListener('input', () => updatePromptAndPreview());
    sourceTopicInput.addEventListener('input', () => updatePromptAndPreview());

    levelFilterModeSelect.addEventListener('change', () => {
      syncLevelRowState();
      updatePromptAndPreview();
    });

    examTypeSelect.addEventListener('change', () => {
      const langId = promptLangSelect.value;
      const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];
      const curExamName = examTypeSelect.value;
      const examObj = preset.exams.find(e => e.name === curExamName);

      if (curExamName === '직접 입력') {
        renderScoreChips([], '');
        examScoreInput.focus();
        examScoreInput.select();
      } else if (examObj) {
        examScoreInput.value = examObj.defaultScore;
        renderScoreChips(examObj.scoreChips, examObj.defaultScore);
      } else {
        renderScoreChips([], examScoreInput.value);
      }
      updatePromptAndPreview();
    });

    examScoreInput.addEventListener('input', () => {
      updateActiveChip(examScoreInput.value);
      updatePromptAndPreview();
    });

    // 품사 및 수량 체크박스
    [posNoun, posVerb, posAdj, posAdv, posIdiom].forEach(chk => {
      chk.addEventListener('change', () => updatePromptAndPreview());
    });
    wordCountSelect.addEventListener('change', () => updatePromptAndPreview());

    // 구분자
    delimiterSelect.addEventListener('change', () => {
      updatePromptAndPreview();
    });

    // 규칙 체크박스
    [ruleCodeblock, rulePureCsv, ruleQuoteCommas, ruleLemma, ruleNoDupes, ruleContextMeaning].forEach(chk => {
      chk.addEventListener('change', () => updatePromptAndPreview());
    });

    // 필드 직접 추가 버튼
    btnAddPromptField.addEventListener('click', () => {
      const newIdx = fields.length + 1;
      const newField = {
        id: `f_${Date.now()}_${newIdx}`,
        name: `필드 ${newIdx}`
      };
      fields.push(newField);
      renderFields();
      updatePromptAndPreview();
      showToast(`${newIdx}번째 필드가 추가되었습니다.`);

      setTimeout(() => {
        const lastRow = promptFieldList.lastElementChild;
        if (lastRow) {
          const input = lastRow.querySelector('.field-input-name');
          if (input) {
            input.focus();
            input.select();
          }
        }
      }, 50);
    });

    // 선택 언어 기본 필드로 복원 버튼
    if (btnResetFieldsToLang) {
      btnResetFieldsToLang.addEventListener('click', () => {
        const langId = promptLangSelect.value;
        const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];
        const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
        const langName = langObj ? langObj.name : '선택 언어';

        fields = preset.defaultFields.map((name, i) => ({
          id: `f_${Date.now()}_${i}`,
          name: name === '외국어 단어' ? `${langName} 단어` : name
        }));
        renderFields();
        updatePromptAndPreview();
        showToast(`'${langName}' 기본 필드 구성으로 복원되었습니다.`);
      });
    }

    // 복사 버튼
    btnCopyPrompt.addEventListener('click', () => {
      copyToClipboard(promptOutputText.textContent, '프롬프트가');
    });

    // 초기화 버튼
    if (resetPromptSettingsBtn) {
      resetPromptSettingsBtn.addEventListener('click', resetAllSettings);
    }

    // 모바일 뷰 전환
    function showMobileEditView() {
      if (window.innerWidth <= 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.add('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.add('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function showMobilePreviewView() {
      if (window.innerWidth <= 768) {
        editorPanel.classList.add('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.remove('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (btnMobileEditTab) btnMobileEditTab.addEventListener('click', showMobileEditView);
    if (btnMobilePreviewTab) btnMobilePreviewTab.addEventListener('click', showMobilePreviewView);
    if (btnGoPreviewMobile) btnGoPreviewMobile.addEventListener('click', showMobilePreviewView);
    if (btnGoEditMobile) btnGoEditMobile.addEventListener('click', showMobileEditView);

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
      } else {
        if (btnMobilePreviewTab && btnMobilePreviewTab.classList.contains('active')) {
          editorPanel.classList.add('mobile-hidden');
          previewPanel.classList.remove('mobile-hidden');
        } else {
          editorPanel.classList.remove('mobile-hidden');
          previewPanel.classList.add('mobile-hidden');
        }
      }
    });

    if (window.innerWidth <= 768) {
      showMobileEditView();
    }
  }

  // 클립보드 복사 헬퍼
  function copyToClipboard(text, label) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} 클립보드에 복사되었습니다!`);
      }).catch(() => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`${label} 클립보드에 복사되었습니다!`);
    } catch (err) {
      showToast('복사에 실패했습니다. 수동으로 드래그하여 복사해주세요.');
    }
    document.body.removeChild(textarea);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 초기화 실행
  initLanguageSelect();
  initEventListeners();

  const restored = loadSettingsFromStorage();
  if (!restored) {
    updateExamOptions(false);
    renderFieldQuickChips(promptLangSelect.value);
    updateResetFieldsButtonLabel();
  }

  syncLevelRowState();
  renderFields();
  updatePromptAndPreview(false);
});
