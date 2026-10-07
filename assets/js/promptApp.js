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
  const ruleNoHeader = document.getElementById('ruleNoHeader');
  const ruleDistinctMeaning = document.getElementById('ruleDistinctMeaning');
  const ruleExampleFromText = document.getElementById('ruleExampleFromText');
  const ruleExampleFromTextLabel = document.getElementById('ruleExampleFromTextLabel');
  const btnImportEditorFields = document.getElementById('btnImportEditorFields');
  const sourceLangModeSelect = document.getElementById('sourceLangModeSelect');
  const sourceLangNotice = document.getElementById('sourceLangNotice');
  const ruleExampleFromTextText = document.getElementById('ruleExampleFromTextText');
  const EDITOR_STORAGE_KEY = 'anki_card_editor_settings';

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

  // AI 답변 붙여넣기 → CSV 파일 받기
  const aiAnswerInput = document.getElementById('aiAnswerInput');
  const btnClearAiAnswer = document.getElementById('btnClearAiAnswer');
  const btnClearSourceText = document.getElementById('btnClearSourceText');
  const pasteExpectText = document.getElementById('pasteExpectText');
  const pasteCheckResult = document.getElementById('pasteCheckResult');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const pasteNextSteps = document.getElementById('pasteNextSteps');
  const pasteLastFile = document.getElementById('pasteLastFile');

  const STORAGE_KEY = 'anki_prompt_generator_settings';
  let saveTimer = null;
  let currentMode = 'text'; // 'text' | 'topic'
  let activeLangId = null; // 언어 변경 직전의 언어 (필드 자동 조정 판단용)
  let langCombobox = null;
  const DEFAULT_LANG_ID = 'en'; // 첫 방문 기본 언어 (사용자가 가장 많은 영어)

  // 언어별 공인 시험 및 기본 열 구성 프리셋
  const EXAM_PRESETS = {
    en: {
      exams: [
        { name: '토익', label: i18n.t('prompt.exam.toeic'), defaultScore: '760점', scoreChips: ['600점', '700점', '760점', '800점', '850점', '900점'] },
        { name: '토플 IBT', label: i18n.t('prompt.exam.toeflIbt'), defaultScore: '81점', scoreChips: ['60점', '71점', '81점', '90점', '100점'] },
        { name: '토플 PBT', label: i18n.t('prompt.exam.toeflPbt'), defaultScore: '584점', scoreChips: ['500점', '550점', '584점', '600점'] },
        { name: '텝스', label: i18n.t('prompt.exam.teps'), defaultScore: '372점', scoreChips: ['300점', '340점', '372점', '400점', '450점'] },
        { name: '지텔프', label: i18n.t('prompt.exam.gtelp'), defaultScore: '레벨2 74점', scoreChips: ['레벨2 65점', '레벨2 74점', '레벨2 80점'] },
        { name: '아이엘츠', label: i18n.t('prompt.exam.ielts'), defaultScore: '5.0', scoreChips: ['4.5', '5.0', '5.5', '6.0', '6.5', '7.0'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '수능/교과', label: i18n.t('prompt.exam.suneung'), defaultScore: '수능 필수', scoreChips: ['중학 필수', '고교 기본', '수능 필수'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '중급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '토익',
      defaultScore: '760점',
      defaultFields: ['[품사]한국어', '영어', '예문']
    },
    ja: {
      exams: [
        { name: 'JLPT', label: i18n.t('prompt.exam.jlpt'), defaultScore: 'N3', scoreChips: ['N5', 'N4', 'N3', 'N2', 'N1'] },
        { name: 'JPT', label: 'JPT', defaultScore: '740점', scoreChips: ['550점', '650점', '740점', '800점', '900점'] },
        { name: '日檢(NIKKEN)', label: i18n.t('prompt.exam.nikken'), defaultScore: '750점', scoreChips: ['600점', '700점', '750점', '800점'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'JLPT',
      defaultScore: 'N3',
      defaultFields: ['[품사]한국어', '일본어', '후리가나/발음']
    },
    zh: {
      exams: [
        { name: 'HSK', label: i18n.t('prompt.exam.hsk'), defaultScore: '3급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급'] },
        { name: '신HSK', label: i18n.t('prompt.exam.newHsk'), defaultScore: '3급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급', '7-9급'] },
        { name: 'BCT', label: i18n.t('prompt.exam.bct'), defaultScore: '(B) 181점', scoreChips: ['(A)', '(B) 181점', '(B) L&R 601점'] },
        { name: 'CPT', label: i18n.t('prompt.exam.cpt'), defaultScore: '750점', scoreChips: ['600점', '700점', '750점', '800점'] },
        { name: 'TOCFL', label: i18n.t('prompt.exam.tocfl'), defaultScore: '5급', scoreChips: ['1급', '2급', '3급', '4급', '5급', '6급'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'HSK',
      defaultScore: '3급',
      defaultFields: ['[품사]한국어', '중국어', '병음']
    },
    fr: {
      exams: [
        { name: 'DELF', label: i18n.t('prompt.exam.delf'), defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2'] },
        { name: 'DALF', label: i18n.t('prompt.exam.dalf'), defaultScore: 'C1', scoreChips: ['C1', 'C2'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'DELF',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '프랑스어', '예문']
    },
    de: {
      exams: [
        { name: '괴테어학검정(Goethe)', label: i18n.t('prompt.exam.goethe'), defaultScore: 'B1(ZD)', scoreChips: ['A1', 'A2', 'B1(ZD)', 'B2', 'C1'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '괴테어학검정(Goethe)',
      defaultScore: 'B1(ZD)',
      defaultFields: ['[품사]한국어', '독일어', '예문']
    },
    es: {
      exams: [
        { name: 'DELE', label: i18n.t('prompt.exam.dele'), defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'DELE',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '스페인어', '예문']
    },
    ru: {
      exams: [
        { name: '토르플(TORFL)', label: i18n.t('prompt.exam.torfl'), defaultScore: '1단계', scoreChips: ['기초', '기본', '1단계', '2단계', '3단계'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '토르플(TORFL)',
      defaultScore: '1단계',
      defaultFields: ['[품사]한국어', '러시아어', '예문']
    },
    it: {
      exams: [
        { name: '칠스(CILS)', label: i18n.t('prompt.exam.cils'), defaultScore: 'B2', scoreChips: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        { name: '첼리(CELI)', label: i18n.t('prompt.exam.celi'), defaultScore: '3', scoreChips: ['1', '2', '3', '4'] },
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '776점', scoreChips: ['600점', '700점', '776점', '850점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '칠스(CILS)',
      defaultScore: 'B2',
      defaultFields: ['[품사]한국어', '이탈리아어', '예문']
    },
    th: {
      exams: [
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '태국어', '발음']
    },
    vi: {
      exams: [
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '베트남어', '예문']
    },
    id: {
      exams: [
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '말레이⋅인도네시아어', '예문']
    },
    ar: {
      exams: [
        { name: 'FLEX', label: i18n.t('prompt.exam.flex'), defaultScore: '600점', scoreChips: ['500점', '600점', '700점', '776점'] },
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: 'FLEX',
      defaultScore: '600점',
      defaultFields: ['[품사]한국어', '아랍어', '발음']
    },
    default: {
      exams: [
        { name: '일반 난이도', label: i18n.t('prompt.exam.general'), defaultScore: '초급', scoreChips: ['초급', '중급', '고급'] },
        { name: '직접 입력', label: i18n.t('prompt.exam.custom'), defaultScore: '', scoreChips: [] }
      ],
      defaultExam: '일반 난이도',
      defaultScore: '초급',
      defaultFields: ['[품사]한국어', '외국어 단어', '예문']
    }
  };

  // 시험 이름(데이터 값) → 프롬프트에 넣을 짧은 이름 번역 키 (prompt.examShort.*)
  // 한국어 번역값은 데이터 값과 같으므로 한국어 프롬프트는 그대로
  const EXAM_SHORT_KEYS = {
    '토익': 'toeic', '토플 IBT': 'toeflIbt', '토플 PBT': 'toeflPbt', '텝스': 'teps', '지텔프': 'gtelp',
    '아이엘츠': 'ielts', 'FLEX': 'flex', 'JLPT': 'jlpt', 'JPT': 'jpt', '日檢(NIKKEN)': 'nikken',
    'HSK': 'hsk', '신HSK': 'newHsk', 'BCT': 'bct', 'CPT': 'cpt', 'TOCFL': 'tocfl',
    'DELF': 'delf', 'DALF': 'dalf', '괴테어학검정(Goethe)': 'goethe', 'DELE': 'dele',
    '토르플(TORFL)': 'torfl', '칠스(CILS)': 'cils', '첼리(CELI)': 'celi'
  };

  // 급수/점수 프리셋 중 숫자 패턴이 아닌 낱말 값 → 번역 키 (prompt.score.word.*)
  const SCORE_WORD_KEYS = {
    '초급': 'beginner', '중급': 'intermediate', '고급': 'advanced',
    '중학 필수': 'middleSchool', '고교 기본': 'highSchool', '수능 필수': 'suneung',
    '기초': 'torflElementary', '기본': 'torflBasic'
  };

  const isKoreanUi = () => !i18n.getLocale || i18n.getLocale() === 'ko';

  function getExamObj(examName) {
    const preset = EXAM_PRESETS[promptLangSelect.value] || EXAM_PRESETS['default'];
    return preset.exams.find(e => e.name === examName) || null;
  }

  // 프리셋 급수/점수 값(한국어 데이터)을 현재 UI 언어의 표시 문구로 변환 (한국어 UI는 그대로)
  function formatPresetScore(raw) {
    if (!raw || isKoreanUi()) return raw;
    if (SCORE_WORD_KEYS[raw]) return i18n.t('prompt.score.word.' + SCORE_WORD_KEYS[raw]);
    return raw
      .replace(/레벨\s*(\d+)\s+(\d+)점/g, (m, level, n) => i18n.t('prompt.score.levelPoints', { level, n }))
      .replace(/레벨\s*(\d+)/g, (m, n) => i18n.t('prompt.score.level', { n }))
      .replace(/(\d+)단계/g, (m, n) => i18n.t('prompt.score.level', { n }))
      .replace(/(\d+(?:-\d+)?)급/g, (m, n) => i18n.t('prompt.score.level', { n }))
      .replace(/(\d+)점/g, (m, n) => i18n.t('prompt.score.points', { n }));
  }

  function getPresetScores(examObj) {
    if (!examObj) return [];
    return [examObj.defaultScore, ...(examObj.scoreChips || [])].filter(Boolean);
  }

  // 저장된 데이터 값 → 입력창 표시 값 (프리셋 값만 변환, 사용자가 직접 입력한 값은 그대로)
  function scoreToDisplay(examObj, raw) {
    const value = raw || '';
    return getPresetScores(examObj).includes(value.trim()) ? formatPresetScore(value.trim()) : value;
  }

  // 입력창 표시 값 → 저장용 데이터 값 (번역 표시된 프리셋 값은 원래 데이터 값으로 되돌려 저장)
  function scoreToRaw(examObj, display) {
    const value = (display || '').trim();
    const match = getPresetScores(examObj).find(raw => formatPresetScore(raw) === value);
    return match !== undefined ? match : (display || '');
  }

  // 현재 필드 리스트 (첫 방문 기본 언어의 기본 구성)
  let fields = createDefaultFields(DEFAULT_LANG_ID);

  function createDefaultFields(langId) {
    return getDefaultFieldNames(langId).map((name, i) => ({
      id: `f_${Date.now()}_${i}`,
      name
    }));
  }

  // 1. 언어 검색형 콤보박스 초기화 (공용 컴포넌트: assets/js/langCombobox.js)
  // 선택 시 숨겨진 select의 change 이벤트를 발생시켜 기존 언어 변경 로직을 그대로 사용
  function initLanguageSelect() {
    langCombobox = window.createLangCombobox({
      container: document.getElementById('langSelectContainer'),
      select: promptLangSelect,
      input: document.getElementById('langSearchInput'),
      clearBtn: document.getElementById('langClearBtn'),
      toggleBtn: document.getElementById('langToggleBtn'),
      dropdown: document.getElementById('langDropdownWrapper'),
      list: document.getElementById('langDropdownList'),
      countEl: document.getElementById('filteredLangCount'),
      languages: window.LANGUAGES_DATA || [],
      onSelect: () => promptLangSelect.dispatchEvent(new Event('change')),
    });

    langCombobox.setValue(DEFAULT_LANG_ID);
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
      examScoreInput.value = matchedExamObj ? formatPresetScore(matchedExamObj.defaultScore) : '';
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
    chips.forEach(rawChip => {
      // 칩 문구는 UI 언어로 표시 (한국어 UI는 데이터 값 그대로)
      const chipText = formatPresetScore(rawChip);
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
    const examName = examTypeSelect ? examTypeSelect.value.trim() : '';
    const score = examScoreInput ? examScoreInput.value.trim() : '';

    if (examName === '직접 입력' || examName === '일반 난이도' || examName === '수능/교과') {
      return score;
    }
    // 프롬프트에는 UI 언어의 짧은 시험 이름을 사용 (한국어는 데이터 값과 동일)
    const exam = EXAM_SHORT_KEYS[examName] ? i18n.t('prompt.examShort.' + EXAM_SHORT_KEYS[examName]) : examName;
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
  // (label은 화면 표시 문구, name은 추가되는 열 이름 — 열 이름은 데이터라 한국어 그대로 유지)
  function getQuickChipsForLanguage(langId) {
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
    const langName = langObj ? langObj.name : '외국어';
    const displayLangName = langObj ? i18n.langName(langObj) : i18n.t('prompt.foreignLangFallback');
    const chip = (key, name) => ({ label: i18n.t('prompt.chip.' + key), name });
    const wordChip = name => ({ label: i18n.t('prompt.chip.langWord', { lang: displayLangName }), name });

    if (langId === 'en') {
      return [
        chip('koreanMeaning', '[품사]한국어'),
        wordChip('영어'),
        chip('ipa', '발음기호'),
        chip('example', '예문'),
        chip('exampleTranslation', '예문 해석'),
        chip('pos', '품사'),
        chip('synonyms', '유의어/반의어')
      ];
    } else if (langId === 'ja') {
      return [
        chip('koreanMeaning', '[품사]한국어'),
        wordChip('일본어'),
        chip('furigana', '후리가나/발음'),
        chip('example', '예문'),
        chip('exampleTranslation', '예문 해석'),
        chip('pos', '품사'),
        chip('synonyms', '유의어/반의어')
      ];
    } else if (langId === 'zh') {
      return [
        chip('koreanMeaning', '[품사]한국어'),
        wordChip('중국어'),
        chip('pinyin', '병음'),
        chip('example', '예문'),
        chip('exampleTranslation', '예문 해석'),
        chip('examplePinyin', '예문 병음'),
        chip('pos', '품사'),
        chip('synonyms', '유의어/반의어')
      ];
    } else {
      return [
        chip('koreanMeaning', '[품사]한국어'),
        wordChip(`${langName} 단어`),
        chip('pronunciation', '발음/표기'),
        chip('example', '예문'),
        chip('exampleTranslation', '예문 해석'),
        chip('pos', '품사'),
        chip('synonyms', '유의어/반의어')
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
        // 알림에는 화면에 보이는 칩 문구를 사용 (한국어 UI는 기존처럼 열 이름, 저장되는 열 이름은 데이터 값 그대로)
        const shownName = isKoreanUi() ? chip.name : chip.label.replace(/^\+\s*/, '');
        showToast(i18n.t('prompt.toast.fieldAdded', { name: shownName }));
      });
      container.appendChild(btn);
    });
  }

  // 언어별 기본 필드명 계산 ('외국어 단어'는 '<언어명> 단어'로 치환)
  function getDefaultFieldNames(langId) {
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
    const langName = langObj ? langObj.name : '외국어';
    const preset = EXAM_PRESETS[langId] || EXAM_PRESETS['default'];
    return preset.defaultFields.map(name => (name === '외국어 단어' ? `${langName} 단어` : name));
  }

  function getForeignWordFieldName(langId) {
    return getDefaultFieldNames(langId)[1];
  }

  function getPronunciationFieldName(langId) {
    if (langId === 'zh') return '병음';
    if (langId === 'ja') return '후리가나/발음';
    if (langId === 'en') return '발음기호';
    return '발음/표기';
  }

  // 자동 생성된 외국어 단어 열 이름인지 (사용자가 직접 지은 이름은 건드리지 않음)
  function isAutoForeignWordName(name) {
    const langs = window.LANGUAGES_DATA || [];
    if (name === '외국어' || name === '외국어 단어') return true;
    if (Object.keys(EXAM_PRESETS).some(id => (EXAM_PRESETS[id].defaultFields || [])[1] === name)) return true;
    return langs.some(l => name === l.name || name === `${l.name} 단어`);
  }

  const AUTO_PRONUNCIATION_NAMES = ['병음', '후리가나/발음', '발음기호', '발음/표기', '발음'];

  // 언어 변경 시 필드 목록 자동 조정
  // - 이전 언어의 기본 구성 그대로라면 새 언어의 기본 구성으로 교체
  // - 직접 수정한 구성이라면, 자동 생성된 외국어/발음 열 이름만 새 언어에 맞게 변경
  function adaptFieldsToLanguage(prevLangId, newLangId) {
    const prevDefaults = getDefaultFieldNames(prevLangId);
    const isUntouchedDefault = fields.length === prevDefaults.length
      && fields.every((f, i) => f.name.trim() === prevDefaults[i]);

    if (isUntouchedDefault) {
      fields = getDefaultFieldNames(newLangId).map((name, i) => ({
        id: `f_${Date.now()}_${i}`,
        name
      }));
      renderFields();
      return;
    }

    fields.forEach(f => {
      const name = f.name.trim();
      let target = null;
      if (isAutoForeignWordName(name)) {
        target = getForeignWordFieldName(newLangId);
      } else if (AUTO_PRONUNCIATION_NAMES.includes(name)) {
        target = getPronunciationFieldName(newLangId);
      }
      // 다른 열에 이미 같은 이름이 있으면 중복 열이 생기지 않도록 이름을 바꾸지 않음
      if (target && target !== name && !fields.some(o => o !== f && o.name.trim() === target)) {
        f.name = target;
      }
    });

    renderFields();
  }

  function updateResetFieldsButtonLabel() {
    if (!btnResetFieldsToLang) return;
    const langId = promptLangSelect.value;
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === langId);
    const langName = langObj ? i18n.langName(langObj) : i18n.t('prompt.fields.selectedLangFallback');
    btnResetFieldsToLang.textContent = i18n.t('prompt.fields.resetToLang', { lang: langName });
  }

  // 3. 필드 렌더링
  function renderFields() {
    promptFieldList.innerHTML = '';

    fields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'prompt-field-item';
      row.dataset.id = field.id;

      row.innerHTML = `
        <div class="field-order-badge">${escapeHtml(i18n.t('prompt.fields.colBadge', { n: index + 1 }))}</div>
        <div class="prompt-field-inputs">
          <input type="text" class="form-input field-input-name" value="${escapeHtml(field.name)}" placeholder="${escapeHtml(i18n.t('prompt.fields.namePlaceholder'))}">
        </div>
        <div class="prompt-field-actions">
          <button type="button" class="btn-field-icon btn-move-up" title="${escapeHtml(i18n.t('prompt.fields.moveUp'))}" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn-field-icon btn-move-down" title="${escapeHtml(i18n.t('prompt.fields.moveDown'))}" ${index === fields.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn-field-icon btn-delete-small" title="${escapeHtml(i18n.t('prompt.fields.delete'))}" ${fields.length <= 1 ? 'disabled' : ''}>🗑️</button>
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
        // 마지막 남은 열은 삭제하지 않음 (0개 열 프롬프트 방지)
        if (fields.length <= 1) return;
        const rawName = field.name.trim();
        const promptText = rawName
          ? i18n.t('prompt.confirm.deleteField', { name: rawName })
          : i18n.t('prompt.confirm.deleteFieldIndex', { n: index + 1 });

        if (!confirm(promptText)) {
          return;
        }

        fields.splice(index, 1);
        renderFields();
        updatePromptAndPreview();
        showToast(i18n.t('prompt.toast.fieldDeleted'));
      });

      promptFieldList.appendChild(row);
    });

    updateFormatBanner();
  }

  // 4. 구분자 및 형태 배너 문자열 생성
  function getDelimiterInfo() {
    const val = delimiterSelect.value;
    if (val === 'tab') return { char: '\t', display: '\\t', name: i18n.t('prompt.out.delimTab') };
    if (val === 'semicolon') return { char: ';', display: '; ', name: i18n.t('prompt.out.delimSemicolon') };
    return { char: ',', display: ', ', name: i18n.t('prompt.out.delimComma') };
  }

  function updateFormatBanner() {
    const delim = getDelimiterInfo();
    const formula = fields.map(f => f.name.trim() || i18n.t('prompt.fields.unnamed')).join(delim.display);
    currentFormatTag.textContent = `"${formula}"`;
  }

  // 열 이름별 작성 예시 (AI에게 열의 의미와 표기 방식을 명확히 전달)
  function getColumnHint(name) {
    // 열 이름 판별(한국어 열 이름 기준)은 데이터 모델에 속하므로 그대로 두고, 설명 문구만 번역 키로 분리
    // 영어로 열 이름을 짓는 사용자를 위해 영어 별칭(Example, Translation, Pinyin 등)도 함께 인식
    const hint = key => i18n.t('prompt.out.hint.' + key);
    const lower = name.toLowerCase();
    if (name.includes('[품사]')) return hint('posKorean');
    if (isExampleTranslationName(name)) return hint('exampleTranslation');
    if (isExampleWordName(name) && (name.includes('병음') || lower.includes('pinyin'))) return hint('examplePinyin');
    if (isExampleWordName(name)) return hint('example');
    if (name.includes('병음') || lower.includes('pinyin')) return hint('pinyin');
    if (name.includes('후리가나') || lower.includes('furigana')) return hint('furigana');
    if (name.includes('발음기호') || /\bipa\b/.test(lower)) return hint('ipa');
    // '발음', '발음/표기' 등 일반 발음 열: 목표 언어에서 통용되는 로마자/발음 표기
    if (name.includes('발음') || lower.includes('pronunciation') || lower.includes('reading')) return hint('pronunciation');
    if (name === '품사') return hint('pos');
    if (name.includes('유의어') || name.includes('반의어')) return hint('synonyms');
    // 'Translation' 단독 열은 예문 열이 있으면 예문 해석, 없으면 한국어 뜻으로 간주
    if (lower.includes('translation')) return hint(hasExampleColumn() ? 'exampleTranslation' : 'korean');
    if (name.includes('한국어') || name.includes('뜻') || name.includes('의미') || lower.includes('meaning')) return hint('korean');
    if (isAutoForeignWordName(name)) return hint('foreignWord');
    return '';
  }

  // 예문 계열 열 이름인지 (한국어 '예문' 또는 영어 Example / Sentence)
  function isExampleWordName(name) {
    const lower = name.toLowerCase();
    return name.includes('예문') || lower.includes('example') || lower.includes('sentence');
  }

  // 예문 해석(번역) 열 이름인지
  function isExampleTranslationName(name) {
    const lower = name.toLowerCase();
    return isExampleWordName(name)
      && (name.includes('해석') || name.includes('번역') || lower.includes('translation') || lower.includes('meaning'));
  }

  // 첫 번째 예문 해석 열 (없으면 null)
  function findExampleTranslationColumn() {
    const found = fields.find(f => isExampleTranslationName(f.name.trim()));
    if (found) return found.name.trim();
    // 예문 열과 함께 쓰인 'Translation' 단독 열도 예문 해석으로 간주
    if (hasExampleColumn()) {
      const tr = fields.find(f => f.name.trim().toLowerCase().includes('translation'));
      if (tr) return tr.name.trim();
    }
    return null;
  }

  // 본문 언어 자동 감지: 글자 단위가 아닌 낱말(띄어쓰기 단위) 기준으로 판단
  // - 한글이 하나라도 들어간 낱말은 한국어 낱말 ('meeting은', 'cancel됐어' 등 외래어 섞인 한국어도 한국어)
  // - 띄어쓰기가 없는 문자(한자·가나·태국어 등)는 2글자를 낱말 1개로 쳐서 중국어·일본어 본문이 과소평가되지 않게 함
  // - 한국어 낱말 비율이 50% 이상이면 한국어 본문 (한국어 제목만 붙은 외국어 기사 등은 외국어 본문으로 유지)
  const KOREAN_SOURCE_RATIO = 0.5;
  const HANGUL_RE = /[가-힣ᄀ-ᇿ㄰-㆏]/;
  const NO_SPACE_SCRIPT_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/gu;

  function detectSourceLanguage(text) {
    let koreanWords = 0;
    let totalWords = 0;
    (text || '').split(/\s+/).forEach(token => {
      const letters = (token.match(/\p{L}/gu) || []).length;
      if (letters === 0) return; // 숫자·기호·이모지만 있는 낱말은 제외
      if (HANGUL_RE.test(token)) {
        koreanWords += 1;
        totalWords += 1;
        return;
      }
      const noSpaceChars = (token.match(NO_SPACE_SCRIPT_RE) || []).length;
      totalWords += noSpaceChars > 0 ? Math.max(1, Math.ceil(noSpaceChars / 2)) + (letters > noSpaceChars ? 1 : 0) : 1;
    });
    if (totalWords === 0) return null;
    return koreanWords / totalWords >= KOREAN_SOURCE_RATIO ? 'ko' : 'foreign';
  }

  // 실제로 적용할 본문 언어 ('ko' | 'foreign')
  function getSourceLanguage() {
    const mode = sourceLangModeSelect ? sourceLangModeSelect.value : 'auto';
    if (mode === 'ko' || mode === 'foreign') return mode;
    return detectSourceLanguage(sourceTextInput.value) || 'foreign';
  }

  // 본문 언어 안내 문구 및 예문 옵션 문구 갱신
  function updateSourceLangNotice() {
    if (!sourceLangNotice) return;
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === promptLangSelect.value);
    const langName = langObj ? i18n.langName(langObj) : i18n.t('prompt.foreignLangFallback');
    const mode = sourceLangModeSelect ? sourceLangModeSelect.value : 'auto';
    const detected = detectSourceLanguage(sourceTextInput.value);
    const effective = getSourceLanguage();
    const isKorean = effective === 'ko';

    if (mode === 'auto' && !detected) {
      sourceLangNotice.classList.add('hidden');
    } else {
      const prefix = i18n.t(mode === 'auto' ? 'prompt.notice.auto' : 'prompt.notice.manual');
      sourceLangNotice.textContent = i18n.t(isKorean ? 'prompt.notice.korean' : 'prompt.notice.foreign', { prefix, lang: langName });
      sourceLangNotice.classList.toggle('is-korean', isKorean);
      sourceLangNotice.classList.remove('hidden');
    }

    if (ruleExampleFromTextText) {
      ruleExampleFromTextText.textContent = isKorean
        ? i18n.t('prompt.rule.exampleFromTextKorean', { lang: langName })
        : i18n.t('prompt.rule.exampleFromText');
    }
  }

  function hasExampleColumn() {
    return fields.some(f => {
      const name = f.name.trim();
      return isExampleWordName(name) && !isExampleTranslationName(name)
        && !name.includes('병음') && !name.toLowerCase().includes('pinyin');
    });
  }

  // 5. 프롬프트 문자열 생성
  // 생성 문구는 prompt.out.* 키 사용. 언어 이름은 아직 데이터 모델(한국어 lang.name) 기준으로 삽입
  function generatePrompt() {
    const t = i18n.t;
    const langObj = (window.LANGUAGES_DATA || []).find(l => l.id === promptLangSelect.value);
    // 프롬프트 문장 속 언어 이름은 UI 언어로 (한국어 UI는 기존과 동일). 기본 열 이름은 아직 한국어 데이터
    const langName = langObj ? i18n.langName(langObj) : t('prompt.out.foreignLang');

    const delim = getDelimiterInfo();
    const formatFormula = fields.map(f => f.name.trim() || t('prompt.out.unnamedColumn')).join(delim.display);

    // 난이도 / 시험 조건절
    const filterMode = levelFilterModeSelect.value;
    const targetLevel = getTargetLevelString();

    // JLPT(N5→N1)처럼 숫자가 작을수록 어려운 시험도 있으므로 '이하/이상' 대신 쉬움/어려움으로 방향을 명시
    let conditionClause = '';
    if (filterMode !== 'none' && targetLevel) {
      if (filterMode === 'below') {
        conditionClause = t('prompt.out.condBelow', { level: targetLevel });
      } else if (filterMode === 'above') {
        conditionClause = t('prompt.out.condAbove', { level: targetLevel });
      } else if (filterMode === 'exact') {
        conditionClause = t('prompt.out.condExact', { level: targetLevel });
      }
    }

    // 품사 텍스트
    const selectedPos = [];
    if (posNoun.checked) selectedPos.push(t('prompt.out.posNoun'));
    if (posVerb.checked) selectedPos.push(t('prompt.out.posVerb'));
    if (posAdj.checked) selectedPos.push(t('prompt.out.posAdj'));
    if (posAdv.checked) selectedPos.push(t('prompt.out.posAdv'));
    if (posIdiom.checked) selectedPos.push(t('prompt.out.posIdiom'));

    let posClause = t('prompt.out.posDefault');
    if (selectedPos.length > 0) {
      posClause = t('prompt.out.posList', { list: selectedPos.join(t('prompt.out.listSeparator')) });
    }

    // 단어 수
    const countVal = wordCountSelect.value;
    let countClause = '';
    if (countVal !== 'all') {
      countClause = t('prompt.out.count', { count: countVal });
    }

    // 한국어 본문: "이 한국어 내용을 외국어로 말할 때 필요한 단어"를 뽑도록 프롬프트 전환
    const isKoreanSource = currentMode === 'text' && getSourceLanguage() === 'ko';

    // 1번 문장
    const mainParams = { lang: langName, condition: conditionClause, count: countClause, pos: posClause };
    let mainSentence = '';
    if (currentMode === 'topic') {
      const topicText = sourceTopicInput.value.trim() || t('prompt.out.defaultTopic');
      mainSentence = t('prompt.out.mainTopic', Object.assign({ topic: topicText }, mainParams));
    } else if (isKoreanSource) {
      mainSentence = t('prompt.out.mainKorean', mainParams);
    } else {
      mainSentence = t('prompt.out.mainText', mainParams);
    }

    // 2번 문장 (형태) + 열별 설명 (AI가 열 의미를 오해하지 않도록 열 개수와 각 열의 예시를 명시)
    const columnGuide = fields.map((f, i) => {
      const name = f.name.trim() || t('prompt.out.unnamedColumn');
      const hint = getColumnHint(name);
      return t('prompt.out.columnLine', {
        n: i + 1,
        name,
        hint: hint ? t('prompt.out.columnHintWrap', { hint }) : '',
      });
    }).join('\n');
    const formatSentence = t('prompt.out.format', { formula: formatFormula, delim: delim.name, count: fields.length })
      + `\n${columnGuide}`;

    // 작성 규칙 (Anki 최적화)
    const rules = [];
    if (ruleCodeblock.checked) {
      const codeLang = delim.char === '\t' ? 'tsv' : 'csv';
      rules.push(t('prompt.out.rule.codeblock', { codeLang }));
    }
    if (rulePureCsv.checked) {
      rules.push(t('prompt.out.rule.pureCsv'));
    }
    if (ruleNoHeader.checked) {
      rules.push(t('prompt.out.rule.noHeader'));
    }
    if (ruleQuoteCommas.checked) {
      if (delim.char === '\t') {
        rules.push(t('prompt.out.rule.noTabs'));
      } else {
        rules.push(t('prompt.out.rule.quote', { delim: delim.char }));
      }
    }
    if (ruleLemma.checked) {
      rules.push(t('prompt.out.rule.lemma'));
    }
    if (ruleNoDupes.checked) {
      rules.push(t('prompt.out.rule.noDupes'));
    }
    if (isKoreanSource) {
      rules.push(t('prompt.out.rule.targetLangWord', { lang: langName }));
    }
    if (ruleContextMeaning.checked) {
      rules.push(t(isKoreanSource ? 'prompt.out.rule.contextMeaningKorean' : 'prompt.out.rule.contextMeaning'));
    }
    if (ruleDistinctMeaning.checked) {
      rules.push(t('prompt.out.rule.distinctMeaning'));
    }
    if (ruleExampleFromText.checked && currentMode === 'text' && hasExampleColumn()) {
      if (isKoreanSource) {
        // 예문 해석 열의 실제 이름을 넣어 안내 ('예문 해석', '예문 번역', 'Example translation' 등)
        const translationColumn = findExampleTranslationColumn();
        rules.push(t('prompt.out.rule.exampleKorean', { lang: langName })
          + (translationColumn ? t('prompt.out.rule.exampleKoreanTranslation', { name: translationColumn }) : ''));
      } else {
        rules.push(t('prompt.out.rule.exampleFromText'));
      }
    }

    let rulesSection = '';
    if (rules.length > 0) {
      rulesSection = `\n\n${t('prompt.out.rulesHeader')}\n` + rules.map(r => `- ${r}`).join('\n');
    }

    // 대상 텍스트 영역
    let textSection = '';
    if (currentMode === 'text') {
      const textContent = sourceTextInput.value.trim();
      const textLabel = t(isKoreanSource ? 'prompt.out.textLabelKorean' : 'prompt.out.textLabel');
      textSection = textContent
        ? `\n\n---\n${textLabel}\n${textContent}`
        : `\n\n---\n${textLabel}\n${t(isKoreanSource ? 'prompt.out.textPlaceholderKorean' : 'prompt.out.textPlaceholder')}`;
    }

    return `${mainSentence}\n${formatSentence}${rulesSection}${textSection}`;
  }

  // AI 서비스 열기 링크 (프롬프트를 입력창에 미리 채우는 서비스는 prefill 주소 사용)
  const PREFILL_MAX_LENGTH = 6000; // URL 길이 제한을 고려한 최대 인코딩 길이
  const AI_LAUNCH_LINKS = [
    { id: 'btnLaunchChatGPT', base: 'https://chatgpt.com', prefill: 'https://chatgpt.com/?q=' },
    { id: 'btnLaunchClaude', base: 'https://claude.ai', prefill: 'https://claude.ai/new?q=' },
    { id: 'btnLaunchGemini', base: 'https://gemini.google.com', prefill: null },
  ];

  // 프롬프트가 바뀔 때마다 링크 주소도 갱신 (가운데 클릭·새 탭으로 열기에서도 최신 프롬프트 사용)
  function updateLaunchLinks(prompt) {
    const encoded = encodeURIComponent(prompt);
    AI_LAUNCH_LINKS.forEach(({ id, base, prefill }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.href = (prefill && encoded.length <= PREFILL_MAX_LENGTH) ? prefill + encoded : base;
    });
  }

  // 실시간 프롬프트 갱신
  function updatePromptAndPreview(shouldSave = true) {
    updateFormatBanner();
    updateSourceLangNotice();

    const prompt = generatePrompt();
    promptOutputText.textContent = prompt;
    updateLaunchLinks(prompt);
    // 항목 수 · 칸 나누는 기호가 바뀌면 붙여넣은 AI 답변도 다시 확인
    renderPasteCheck();

    if (shouldSave) {
      saveSettingsToStorage();
    }
  }

  // 8. 로컬스토리지 저장 & 복원
  function updateSaveIndicator(text = i18n.t('common.autoSaved')) {
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
        sourceLangMode: sourceLangModeSelect ? sourceLangModeSelect.value : 'auto',
        levelFilterMode: levelFilterModeSelect.value,
        examType: examTypeSelect.value,
        // 번역 표시된 프리셋 급수/점수는 원래 데이터 값(한국어)으로 저장해 UI 언어가 바뀌어도 호환
        examScore: scoreToRaw(getExamObj(examTypeSelect.value), examScoreInput.value),
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
          contextMeaning: ruleContextMeaning.checked,
          noHeader: ruleNoHeader.checked,
          distinctMeaning: ruleDistinctMeaning.checked,
          exampleFromText: ruleExampleFromText.checked
        },
        fields: fields.map(f => ({ name: f.name }))
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSaveIndicator(i18n.t('common.autoSaved'));
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
        if (!promptLangSelect.value) promptLangSelect.value = DEFAULT_LANG_ID;
        if (langCombobox) langCombobox.sync();
        updateExamOptions(false);
      }

      // 저장값으로 select를 맞추고, 목록에 없는 값이면(빈 선택) 기본값 사용
      const restoreSelect = (select, value, fallback) => {
        if (!select) return;
        if (value !== undefined && value !== null) select.value = String(value);
        if (!select.value) select.value = fallback;
      };

      setMode(data.mode === 'topic' ? 'topic' : 'text', false);
      if (data.sourceText !== undefined) sourceTextInput.value = data.sourceText;
      if (data.sourceTopic !== undefined) sourceTopicInput.value = data.sourceTopic;
      restoreSelect(sourceLangModeSelect, data.sourceLangMode, 'auto');

      restoreSelect(levelFilterModeSelect, data.levelFilterMode, 'below');
      let examFellBack = false;
      if (data.examType !== undefined) {
        const prevExam = examTypeSelect.value;
        examTypeSelect.value = data.examType;
        // 저장된 시험이 현재 언어 목록에 없으면 언어 기본 시험 유지 (점수도 그 시험의 기본값으로)
        if (!examTypeSelect.value) {
          examTypeSelect.value = prevExam;
          examFellBack = true;
        }
      }
      const restoredExam = getExamObj(examTypeSelect.value);
      if (examFellBack) {
        examScoreInput.value = restoredExam ? formatPresetScore(restoredExam.defaultScore) : '';
      } else if (data.examScore !== undefined) {
        examScoreInput.value = scoreToDisplay(restoredExam, data.examScore);
      } else if (data.levelCustom !== undefined) {
        examScoreInput.value = data.levelCustom;
      } else if (restoredExam) {
        // 점수가 저장되지 않은 경우 시험 이름만 남지 않도록 그 시험의 기본 급수/점수 사용
        examScoreInput.value = formatPresetScore(restoredExam.defaultScore);
      }

      if (data.pos) {
        posNoun.checked = Boolean(data.pos.noun);
        posVerb.checked = Boolean(data.pos.verb);
        posAdj.checked = Boolean(data.pos.adj);
        posAdv.checked = Boolean(data.pos.adv);
        posIdiom.checked = Boolean(data.pos.idiom);
      }

      restoreSelect(wordCountSelect, data.wordCount, 'all');
      restoreSelect(delimiterSelect, data.delimiter, 'comma');

      if (data.rules) {
        ruleCodeblock.checked = Boolean(data.rules.codeblock);
        rulePureCsv.checked = Boolean(data.rules.pureCsv);
        ruleQuoteCommas.checked = Boolean(data.rules.quoteCommas);
        ruleLemma.checked = Boolean(data.rules.lemma);
        ruleNoDupes.checked = Boolean(data.rules.noDupes);
        ruleContextMeaning.checked = Boolean(data.rules.contextMeaning);
        // 새로 추가된 규칙은 이전 저장본에 없으면 기본값(켜짐) 유지
        if (data.rules.noHeader !== undefined) ruleNoHeader.checked = Boolean(data.rules.noHeader);
        if (data.rules.distinctMeaning !== undefined) ruleDistinctMeaning.checked = Boolean(data.rules.distinctMeaning);
        if (data.rules.exampleFromText !== undefined) ruleExampleFromText.checked = Boolean(data.rules.exampleFromText);
      }

      if (Array.isArray(data.fields) && data.fields.length > 0) {
        fields = data.fields.map((f, i) => ({
          id: `f_${Date.now()}_${i}`,
          name: (f && f.name) || i18n.t('prompt.fields.defaultName', { n: i + 1 })
        }));
      } else {
        // 저장된 열 목록이 없거나 비어 있으면 복원된 언어의 기본 열 구성 사용
        fields = createDefaultFields(promptLangSelect.value);
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
    if (!confirm(i18n.t('prompt.confirm.resetAll'))) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    if (langCombobox) {
      langCombobox.setValue(DEFAULT_LANG_ID);
      langCombobox.clearSharedLanguage(); // 다른 도구와의 언어 연동 기록도 초기화
    }
    activeLangId = DEFAULT_LANG_ID;
    setMode('text', false);
    sourceTextInput.value = '';
    sourceTopicInput.value = '';
    if (sourceLangModeSelect) sourceLangModeSelect.value = 'auto';

    levelFilterModeSelect.value = 'below';
    syncLevelRowState();
    examTypeSelect.value = '';
    updateExamOptions(true); // 기본 언어의 기본 시험 · 기본 급수로 설정

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
    ruleNoHeader.checked = true;
    ruleDistinctMeaning.checked = true;
    ruleExampleFromText.checked = true;

    fields = createDefaultFields(DEFAULT_LANG_ID);

    renderFields();
    renderFieldQuickChips(promptLangSelect.value);
    updateResetFieldsButtonLabel();
    updatePromptAndPreview(false);
    saveSettingsToStorage();
    updateSaveIndicator(i18n.t('common.resetDone'));
    showToast(i18n.t('prompt.toast.resetAll'));
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
    // '본문에서 예문 가져오기'는 텍스트 추출 모드에서만 의미가 있음
    if (ruleExampleFromTextLabel) {
      ruleExampleFromTextLabel.classList.toggle('hidden', mode === 'topic');
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

  // 카드 서식 에디터의 Anki 필드명(Front, Back, pinyin 등)은 AI가 내용을 알 수 없으므로 내용 설명형 이름으로 변환
  function toPromptColumnName(editorFieldName, langId) {
    const name = (editorFieldName || '').trim();
    const lower = name.toLowerCase();
    if (lower === 'front') return '[품사]한국어';
    if (lower === 'back') return getForeignWordFieldName(langId);
    if (lower === 'pinyin') return '병음';
    if (lower === 'example' || lower === 'sentence') return '예문';
    return name;
  }

  function importFieldsFromEditor() {
    let editorData = null;
    try {
      editorData = JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || 'null');
    } catch (e) {
      editorData = null;
    }

    const editorFields = editorData && Array.isArray(editorData.fields) ? editorData.fields : [];
    if (editorFields.length === 0) {
      showToast(i18n.t('prompt.toast.editorFieldsEmpty'));
      return;
    }

    const langId = promptLangSelect.value;
    fields = editorFields.map((f, i) => ({
      id: `f_${Date.now()}_${i}`,
      name: toPromptColumnName(f.name, langId) || i18n.t('prompt.fields.defaultName', { n: i + 1 })
    }));
    renderFields();
    updatePromptAndPreview();
    showToast(i18n.t('prompt.toast.editorFieldsImported', { count: fields.length }));
  }

  // 9. 컨트롤 이벤트 바인딩
  function initEventListeners() {
    promptLangSelect.addEventListener('change', () => {
      const newLangId = promptLangSelect.value;
      // 이미 선택된 언어를 다시 고른 경우: 시험·점수·필드를 초기화하지 않음
      if (newLangId === activeLangId) return;
      updateExamOptions(true);
      adaptFieldsToLanguage(activeLangId || newLangId, newLangId);
      activeLangId = newLangId;
      renderFieldQuickChips(newLangId);
      updateResetFieldsButtonLabel();
      updatePromptAndPreview();
    });

    btnModeText.addEventListener('click', () => setMode('text'));
    btnModeTopic.addEventListener('click', () => setMode('topic'));

    sourceTextInput.addEventListener('input', () => updatePromptAndPreview());
    sourceTopicInput.addEventListener('input', () => updatePromptAndPreview());

    // '단어를 뽑을 글' 지우기 → 새 글로 다른 단어장을 바로 만들 수 있게 (프롬프트 · 언어 감지 · 저장도 함께 갱신)
    if (btnClearSourceText) {
      btnClearSourceText.addEventListener('click', () => {
        sourceTextInput.value = '';
        updatePromptAndPreview();
        sourceTextInput.focus();
      });
    }
    if (sourceLangModeSelect) {
      sourceLangModeSelect.addEventListener('change', () => updatePromptAndPreview());
    }

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
        // 이전 시험의 점수가 시험 이름 없이 남지 않도록 비움
        examScoreInput.value = '';
        renderScoreChips([], '');
        examScoreInput.focus();
        examScoreInput.select();
      } else if (examObj) {
        examScoreInput.value = formatPresetScore(examObj.defaultScore);
        renderScoreChips(examObj.scoreChips, examScoreInput.value);
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
    [ruleCodeblock, rulePureCsv, ruleQuoteCommas, ruleLemma, ruleNoDupes, ruleContextMeaning,
      ruleNoHeader, ruleDistinctMeaning, ruleExampleFromText].forEach(chk => {
      chk.addEventListener('change', () => updatePromptAndPreview());
    });

    // 필드 직접 추가 버튼
    btnAddPromptField.addEventListener('click', () => {
      const newIdx = fields.length + 1;
      const newField = {
        id: `f_${Date.now()}_${newIdx}`,
        name: i18n.t('prompt.fields.defaultName', { n: newIdx })
      };
      fields.push(newField);
      renderFields();
      updatePromptAndPreview();
      showToast(i18n.t('prompt.toast.fieldAddedIndex', { n: newIdx }));

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
        const langName = langObj ? i18n.langName(langObj) : i18n.t('prompt.fields.selectedLangFallback');

        fields = getDefaultFieldNames(langId).map((name, i) => ({
          id: `f_${Date.now()}_${i}`,
          name
        }));
        renderFields();
        updatePromptAndPreview();
        showToast(i18n.t('prompt.toast.fieldsReset', { lang: langName }));
      });
    }

    // 카드 서식 에디터에 저장된 필드 순서 그대로 불러오기
    if (btnImportEditorFields) {
      btnImportEditorFields.addEventListener('click', importFieldsFromEditor);
    }

    // 복사 버튼
    btnCopyPrompt.addEventListener('click', () => {
      copyToClipboard(promptOutputText.textContent, i18n.t('prompt.copyLabel'));
    });

    // AI 서비스 열기 버튼: 링크 이동(기본 동작)보다 먼저 프롬프트를 자동 복사
    // (링크 주소는 updatePromptAndPreview에서 항상 최신 프롬프트로 갱신됨)
    AI_LAUNCH_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        const prompt = promptOutputText.textContent;
        copyToClipboard(prompt, i18n.t('prompt.copyLabel'));
        updateLaunchLinks(prompt);
      });
    });

    // 초기화 버튼
    if (resetPromptSettingsBtn) {
      resetPromptSettingsBtn.addEventListener('click', resetAllSettings);
    }

    // 모바일 뷰 전환 (탭 네비게이션 & 좌우 전환 플로팅 버튼)
    const btnFloatToPromptOutput = document.getElementById('btnFloatToPromptOutput');
    const btnFloatToPromptSettings = document.getElementById('btnFloatToPromptSettings');

    // keepScroll === true 이면 스크롤 위치 유지 (resize 등 사용자 전환이 아닌 경우)
    function showMobileEditView(keepScroll) {
      if (window.innerWidth <= 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.add('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.add('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.remove('active');
        if (btnFloatToPromptOutput) btnFloatToPromptOutput.style.display = 'inline-flex';
        if (btnFloatToPromptSettings) btnFloatToPromptSettings.style.display = 'none';
        if (keepScroll !== true) window.scrollTo(0, 0);
      }
    }

    function showMobilePreviewView(keepScroll) {
      if (window.innerWidth <= 768) {
        editorPanel.classList.add('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.remove('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.add('active');
        if (btnFloatToPromptOutput) btnFloatToPromptOutput.style.display = 'none';
        if (btnFloatToPromptSettings) btnFloatToPromptSettings.style.display = 'inline-flex';
        if (keepScroll !== true) window.scrollTo(0, 0);
      }
    }

    if (btnMobileEditTab) btnMobileEditTab.addEventListener('click', showMobileEditView);
    if (btnMobilePreviewTab) btnMobilePreviewTab.addEventListener('click', showMobilePreviewView);
    if (btnGoPreviewMobile) btnGoPreviewMobile.addEventListener('click', showMobilePreviewView);
    if (btnGoEditMobile) btnGoEditMobile.addEventListener('click', showMobileEditView);
    if (btnFloatToPromptOutput) btnFloatToPromptOutput.addEventListener('click', showMobilePreviewView);
    if (btnFloatToPromptSettings) btnFloatToPromptSettings.addEventListener('click', showMobileEditView);

    // 모바일에서 위로 스크롤하면 주소창이 다시 나타나며 높이만 바뀌는 resize가 발생하므로
    // 너비가 바뀐 경우에만 처리하고, 이때도 스크롤 위치는 유지한다
    let lastViewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastViewportWidth) return;
      lastViewportWidth = window.innerWidth;

      if (window.innerWidth > 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnFloatToPromptOutput) btnFloatToPromptOutput.style.display = 'none';
        if (btnFloatToPromptSettings) btnFloatToPromptSettings.style.display = 'none';
      } else {
        if (btnMobilePreviewTab && btnMobilePreviewTab.classList.contains('active')) {
          showMobilePreviewView(true);
        } else {
          showMobileEditView(true);
        }
      }
    });

    if (window.innerWidth <= 768) {
      showMobileEditView();
    }
  }

  // ===== 10. AI 답변 붙여넣기 → CSV 파일 받기 =====
  // AI와 연결하지 않고, 사용자가 붙여넣은 답변을 이 브라우저 안에서만 정리 · 확인 · 파일로 만든다
  const PASTE_DELIMS = { comma: ',', tab: '\t', semicolon: ';' };
  // Anki 2.1.55 이상은 파일 첫머리의 '#separator:' · '#html:' 줄을 읽고, 이전 버전은 '#'으로 시작하는 줄을 주석으로 건너뜀
  const ANKI_SEPARATOR_NAMES = { comma: 'Comma', tab: 'Tab', semicolon: 'Semicolon' };
  const MAX_PROBLEMS_SHOWN = 20;
  // AI가 제목 줄에 자주 쓰는 일반적인 항목 이름 (설정한 항목 이름과 함께 제목 줄 판단에 사용)
  const GENERIC_HEADER_WORDS = [
    'front', 'back', 'word', 'words', 'meaning', 'korean', 'koreanmeaning', 'english', 'chinese', 'japanese',
    'example', 'examplesentence', 'sentence', 'translation', 'exampletranslation', 'pinyin', 'reading',
    'furigana', 'pronunciation', 'ipa', 'pos', 'partofspeech', 'synonyms', 'antonyms',
    '단어', '뜻', '의미', '한국어', '한국어뜻', '품사', '예문', '예문해석', '병음', '발음', '발음기호', '후리가나'
  ];

  let lastPasteResult = null;

  // 한 줄을 CSV 규칙으로 나누기 (큰따옴표로 감싼 칸, 겹쳐 쓴 큰따옴표 "", 큰따옴표 안의 구분 기호)
  // 여러 줄에 걸친 칸은 지원하지 않음 (AI에게 한 줄에 한 단어로 요청하므로, 닫히지 않은 따옴표는 문제 줄로 알림)
  function splitDelimitedLine(line, delim) {
    const cells = [];
    const n = line.length;
    let i = 0;
    for (;;) {
      let j = i;
      while (j < n && line[j] === ' ') j++; // 칸 앞 공백은 건너뜀 (탭 구분일 때도 탭은 구분 기호로 남김)
      if (j < n && line[j] === '"') {
        let k = j + 1;
        let value = '';
        let closed = false;
        while (k < n) {
          if (line[k] === '"') {
            if (line[k + 1] === '"') {
              value += '"';
              k += 2;
              continue;
            }
            closed = true;
            k += 1;
            break;
          }
          value += line[k];
          k += 1;
        }
        if (!closed) return { cells: null, unclosed: true };
        // 닫는 따옴표 뒤 ~ 다음 구분 기호 사이의 글자는 그대로 이어 붙임
        let rest = '';
        while (k < n && line[k] !== delim) {
          rest += line[k];
          k += 1;
        }
        cells.push(value + rest.trim());
        if (k >= n) break;
        i = k + 1;
      } else {
        let k = i;
        while (k < n && line[k] !== delim) k += 1;
        cells.push(line.slice(i, k).trim());
        if (k >= n) break;
        i = k + 1;
      }
    }
    return { cells, unclosed: false };
  }

  // 마크다운 표의 한 줄(| a | b |)을 칸으로 나누기 (\| 는 글자 | 로)
  function splitTableRow(line) {
    let s = line.trim().replace(/\\\|/g, '\u0000');
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(c => c.replace(/\u0000/g, '|').trim());
  }

  function normalizeHeaderCell(s) {
    return (s || '').toLowerCase().replace(/[\s"'`*_]/g, '');
  }

  // 첫 줄이 항목 이름(제목 줄)처럼 보이는지: 설정한 항목 이름과 같거나 비슷한 칸이 절반 이상
  function looksLikeHeaderRow(cells, fieldNames) {
    if (!cells || cells.length === 0) return false;
    const names = fieldNames.map(normalizeHeaderCell);
    let hits = 0;
    cells.forEach((cell, idx) => {
      const v = normalizeHeaderCell(cell);
      if (!v) return;
      const own = names[idx] || '';
      const similar = own && Math.min(own.length, v.length) >= 2 && (v.includes(own) || own.includes(v));
      if (names.includes(v) || similar || GENERIC_HEADER_WORDS.includes(v.replace(/[[\]()]/g, ''))) hits += 1;
    });
    const need = cells.length >= 2 ? Math.max(2, Math.ceil(cells.length / 2)) : 1;
    return hits >= need;
  }

  // 붙여넣은 AI 답변 정리 · 확인
  // 결과: { rows: 올바른 줄의 칸 배열들, problems, notes(자동 정리 내용), delimKey(실제로 읽은 기호), noTabs }
  function analyzeAiAnswer(text, delimKey, fieldNames) {
    const expected = fieldNames.length;
    const notes = [];
    let chatterCount = 0;
    let fenced = false;
    let items = text.replace(/^﻿/, '').split(/\r\n|\r|\n/).map((t, i) => ({ text: t, line: i + 1 }));

    // 1) 복사용 상자(```csv … ```)가 있으면 상자 안쪽만 사용, 바깥 줄은 AI의 설명으로 보고 지움
    const isFence = t => /^\s*(```|~~~)/.test(t);
    if (items.some(it => isFence(it.text))) {
      fenced = true;
      const inside = [];
      let open = false;
      let outside = 0;
      items.forEach(it => {
        if (isFence(it.text)) {
          open = !open;
          return;
        }
        if (open) inside.push(it);
        else if (it.text.trim()) outside += 1;
      });
      if (inside.some(it => it.text.trim())) {
        items = inside;
        chatterCount += outside;
      } else {
        items = items.filter(it => !isFence(it.text));
      }
      notes.push(i18n.t('prompt.paste.cleanedFence'));
    }

    // 2) 빈 줄 지우기
    items = items.filter(it => it.text.trim() !== '');

    let rows = []; // { line, raw, cells, unclosed }
    let delimUsed = delimKey;
    let headerRemoved = false;

    // 3) 마크다운 표(| a | b |)로 답한 경우: 표 줄만 칸으로 나누고, |---| 줄과 그 바로 위 제목 줄은 지움
    const isTableLine = t => /^\s*\|.*\|\s*$/.test(t);
    const tableItems = items.filter(it => isTableLine(it.text));
    if (tableItems.length >= 2 && tableItems.length * 2 >= items.length) {
      const sepRe = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
      chatterCount += items.length - tableItems.length;
      tableItems.forEach((it, idx) => {
        if (sepRe.test(it.text)) {
          const prev = tableItems[idx - 1];
          if (!headerRemoved && prev && rows.length && rows[rows.length - 1].line === prev.line) {
            rows.pop();
            headerRemoved = true;
          }
          return;
        }
        rows.push({ line: it.line, raw: it.text, cells: splitTableRow(it.text), unclosed: false });
      });
      notes.push(i18n.t('prompt.paste.cleanedTable'));
    } else {
      // 4) 구분 기호로 나누기. 설정한 기호로 읽어서 맞는 줄이 절반도 안 되면 다른 기호도 시도
      const parseWith = key => items.map(it => {
        const r = splitDelimitedLine(it.text, PASTE_DELIMS[key]);
        return { line: it.line, raw: it.text, cells: r.cells, unclosed: r.unclosed };
      });
      const goodCount = list => list.filter(r => r.cells && r.cells.length === expected).length;
      rows = parseWith(delimKey);
      if (expected >= 2 && goodCount(rows) * 2 < rows.length) {
        let best = { key: delimKey, list: rows, good: goodCount(rows) };
        Object.keys(PASTE_DELIMS).filter(k => k !== delimKey).forEach(k => {
          const list = parseWith(k);
          const good = goodCount(list);
          if (good > best.good && good * 2 >= list.length) best = { key: k, list, good };
        });
        if (best.key !== delimKey) {
          rows = best.list;
          delimUsed = best.key;
          notes.push(i18n.t('prompt.paste.cleanedDelim', { name: i18n.t('prompt.paste.delimName.' + best.key) }));
        }
      }

      // 5) 상자 없이 답한 경우, 앞뒤의 AI 설명 줄 지우기: 구분 기호가 없는 줄이나 콜론(:)으로 끝나는 줄 (데이터 줄 앞 · 뒤에서만)
      //    (구분 기호가 든 줄이 하나도 없으면 설명이 아니라 형식 문제이므로 지우지 않고 문제 줄로 알림)
      const d = PASTE_DELIMS[delimUsed];
      if (!fenced && expected >= 2 && rows.some(r => r.raw.includes(d))) {
        const isChatter = r => !r.raw.includes(d) || /[:：]\s*$/.test(r.raw);
        while (rows.length && isChatter(rows[0])) {
          rows.shift();
          chatterCount += 1;
        }
        while (rows.length && isChatter(rows[rows.length - 1])) {
          rows.pop();
          chatterCount += 1;
        }
      }
    }

    // 6) 첫 줄이 항목 이름(제목 줄)이면 지움 (그대로 두면 카드 1장으로 들어감)
    if (!headerRemoved && rows.length && rows[0].cells && looksLikeHeaderRow(rows[0].cells, fieldNames)) {
      rows.shift();
      headerRemoved = true;
    }
    if (chatterCount > 0) notes.push(i18n.t('prompt.paste.cleanedChatter', { n: chatterCount }));
    if (headerRemoved) notes.push(i18n.t('prompt.paste.cleanedHeader'));

    // 7) 칸 수 확인
    const valid = [];
    const problems = [];
    rows.forEach(r => {
      if (r.unclosed) {
        problems.push({ line: r.line, raw: r.raw, kind: 'quote' });
        return;
      }
      const cells = r.cells.slice();
      // 줄 끝에 구분 기호가 하나 더 붙은 경우(a,b,c,)는 빈 칸 하나를 무시
      if (cells.length === expected + 1 && cells[cells.length - 1] === '') cells.pop();
      if (cells.length !== expected) {
        problems.push({ line: r.line, raw: r.raw, kind: 'count', actual: cells.length });
        return;
      }
      valid.push(cells);
    });

    const noTabs = delimUsed === 'tab' && !text.includes('\t');
    return { rows: valid, problems, notes, delimKey: delimUsed, noTabs };
  }

  // Anki로 가져올 파일 내용 만들기 (설정한 칸 나누는 기호로 다시 쓰고, 필요한 칸은 큰따옴표로 감쌈)
  function buildAnkiImportText(rows, delimKey) {
    const d = PASTE_DELIMS[delimKey] || ',';
    const quote = (value, idx) => {
      // 첫 칸이 #으로 시작하면 Anki가 주석 줄로 보므로 큰따옴표로 감쌈
      const needs = value.includes(d) || value.includes('"') || /[\r\n]/.test(value) || (idx === 0 && value.startsWith('#'));
      return needs ? '"' + value.replace(/"/g, '""') + '"' : value;
    };
    const header = [`#separator:${ANKI_SEPARATOR_NAMES[delimKey] || 'Comma'}`, '#html:true'];
    const body = rows.map(cells => cells.map(quote).join(d));
    return header.concat(body).join('\n') + '\n';
  }

  function makeDownloadFileName(delimKey) {
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}`;
    return `anki-words-${stamp}.${delimKey === 'tab' ? 'txt' : 'csv'}`;
  }

  // 임시 링크(<a download>)로 파일 저장 (iOS Safari는 '파일' 앱으로 저장됨)
  function downloadTextFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // 붙여넣은 답변을 확인하고 결과(요약 · 정리 내용 · 문제 줄 · 받기 버튼)를 그림
  function renderPasteCheck() {
    if (!aiAnswerInput || !pasteCheckResult || !btnDownloadCsv) return;
    const fieldNames = fields.map(f => f.name.trim() || i18n.t('prompt.fields.unnamed'));
    if (pasteExpectText) {
      pasteExpectText.textContent = i18n.t('prompt.paste.expect', { count: fieldNames.length, formula: fieldNames.join(' · ') });
    }

    pasteCheckResult.innerHTML = '';
    const text = aiAnswerInput.value;
    if (!text.trim()) {
      lastPasteResult = null;
      pasteCheckResult.appendChild(makeEl('p', 'paste-csv-summary is-empty', i18n.t('prompt.paste.empty')));
      btnDownloadCsv.disabled = true;
      btnDownloadCsv.textContent = i18n.t('prompt.paste.downloadBtn');
      return;
    }

    const result = analyzeAiAnswer(text, delimiterSelect.value, fieldNames);
    lastPasteResult = result;
    const count = result.rows.length;
    const bad = result.problems.length;

    let summary;
    if (count === 0) {
      // 올바른 줄이 하나도 없음 (문제 줄이 있으면 아래 목록으로 함께 보여 줌)
      summary = makeEl('p', 'paste-csv-summary is-bad', i18n.t('prompt.paste.noRows'));
    } else if (bad === 0) {
      summary = makeEl('p', 'paste-csv-summary is-ok', i18n.t('prompt.paste.summaryOk', { count }));
    } else {
      summary = makeEl('p', 'paste-csv-summary is-warn', i18n.t('prompt.paste.summaryBad', { count, bad }));
    }
    pasteCheckResult.appendChild(summary);

    if (result.notes.length) {
      const notes = makeEl('p', 'paste-csv-notes');
      notes.appendChild(makeEl('strong', '', i18n.t('prompt.paste.cleanedTitle')));
      notes.appendChild(document.createTextNode(' ' + result.notes.join(' · ')));
      pasteCheckResult.appendChild(notes);
    }

    if (bad > 0) {
      const list = makeEl('ul', 'paste-problem-list');
      result.problems.slice(0, MAX_PROBLEMS_SHOWN).forEach(pr => {
        const li = document.createElement('li');
        const btn = makeEl('button', 'paste-problem-item');
        btn.type = 'button';
        btn.title = i18n.t('prompt.paste.problemGoTitle');
        btn.appendChild(makeEl('span', 'paste-problem-line', i18n.t('prompt.paste.lineLabel', { n: pr.line })));
        const reason = pr.kind === 'quote'
          ? i18n.t('prompt.paste.problemQuote')
          : i18n.t('prompt.paste.problemCount', { expected: fieldNames.length, actual: pr.actual });
        btn.appendChild(makeEl('span', 'paste-problem-reason', reason));
        const raw = pr.raw.trim();
        btn.appendChild(makeEl('code', 'paste-problem-preview', raw.length > 48 ? raw.slice(0, 48) + '…' : raw));
        btn.addEventListener('click', () => selectAnswerLine(pr.line));
        li.appendChild(btn);
        list.appendChild(li);
      });
      if (bad > MAX_PROBLEMS_SHOWN) {
        list.appendChild(makeEl('li', 'paste-problem-more', i18n.t('prompt.paste.problemMore', { n: bad - MAX_PROBLEMS_SHOWN })));
      }
      pasteCheckResult.appendChild(list);

      if (result.delimKey === 'comma' && result.problems.some(pr => pr.kind === 'count' && pr.actual > fieldNames.length)) {
        pasteCheckResult.appendChild(makeEl('p', 'paste-csv-hint', i18n.t('prompt.paste.commaHint')));
      }
    }
    if (result.noTabs && (bad > 0 || count === 0)) {
      pasteCheckResult.appendChild(makeEl('p', 'paste-csv-hint', i18n.t('prompt.paste.tabHint')));
    }
    if (bad > 0) {
      pasteCheckResult.appendChild(makeEl('p', 'paste-csv-fix-hint', i18n.t('prompt.paste.fixHint')));
    }

    // 문제 있는 줄이 있어도 올바른 줄만으로 받을 수 있게 함 (빠진 줄은 위에 목록으로 보여 줌)
    btnDownloadCsv.disabled = count === 0;
    btnDownloadCsv.textContent = count > 0
      ? i18n.t('prompt.paste.downloadBtnCount', { count })
      : i18n.t('prompt.paste.downloadBtn');
  }

  // 문제 줄을 누르면 붙여넣기 칸에서 그 줄을 선택해 바로 고칠 수 있게 함
  function selectAnswerLine(lineNo) {
    const lines = aiAnswerInput.value.split('\n');
    let start = 0;
    for (let i = 0; i < lineNo - 1 && i < lines.length; i++) start += lines[i].length + 1;
    const end = start + (lines[lineNo - 1] || '').replace(/\r$/, '').length;
    aiAnswerInput.focus();
    try {
      aiAnswerInput.setSelectionRange(start, end);
    } catch (e) {}
    const lineHeight = parseFloat(window.getComputedStyle(aiAnswerInput).lineHeight) || 20;
    aiAnswerInput.scrollTop = Math.max(0, (lineNo - 2) * lineHeight);
  }

  function downloadPastedCsv() {
    if (!lastPasteResult || lastPasteResult.rows.length === 0) return;
    const delimKey = delimiterSelect.value;
    const fileName = makeDownloadFileName(delimKey);
    // UTF-8 + BOM: 파일을 더블클릭해 엑셀로 열어도 한글이 깨지지 않게 함 (BOM이 없으면 엑셀이 한국어 윈도우 인코딩으로 읽음)
    // Anki는 첫 줄의 BOM을 제거한 뒤 '#separator:' 머리말을 읽으므로 가져오기에는 영향 없음 (rslib csv metadata strip_utf8_bom)
    const content = '﻿' + buildAnkiImportText(lastPasteResult.rows, delimKey);
    const mimeType = delimKey === 'tab' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8';
    downloadTextFile(content, fileName, mimeType);

    const bad = lastPasteResult.problems.length;
    showToast(bad > 0
      ? i18n.t('prompt.paste.downloadedSkipped', { name: fileName, bad })
      : i18n.t('prompt.paste.downloaded', { name: fileName }));
    if (pasteLastFile) {
      pasteLastFile.textContent = i18n.t('prompt.paste.lastFile', { name: fileName });
      pasteLastFile.classList.remove('hidden');
    }
    if (pasteNextSteps) {
      pasteNextSteps.classList.add('is-ready');
      if (typeof pasteNextSteps.scrollIntoView === 'function') {
        pasteNextSteps.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function initPasteCsv() {
    if (!aiAnswerInput) return;
    aiAnswerInput.addEventListener('input', renderPasteCheck);
    if (btnClearAiAnswer) {
      btnClearAiAnswer.addEventListener('click', () => {
        aiAnswerInput.value = '';
        renderPasteCheck();
        aiAnswerInput.focus();
      });
    }
    if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', downloadPastedCsv);
  }

  // 클립보드 복사 헬퍼
  function copyToClipboard(text, label) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(i18n.t('common.copied', { label }));
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
      // execCommand가 false를 돌려주면 실제로 복사되지 않은 것이므로 실패 안내
      if (document.execCommand('copy')) {
        showToast(i18n.t('common.copied', { label }));
      } else {
        showToast(i18n.t('common.copyFailed'));
      }
    } catch (err) {
      showToast(i18n.t('common.copyFailed'));
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
  initPasteCsv();

  const restored = loadSettingsFromStorage();
  if (!restored) {
    updateExamOptions(true); // 첫 방문: 기본 언어의 기본 시험 · 기본 급수로 설정
    renderFieldQuickChips(promptLangSelect.value);
    updateResetFieldsButtonLabel();
  }

  activeLangId = promptLangSelect.value;
  syncLevelRowState();
  renderFields();
  updatePromptAndPreview(false);

  // 카드 에디터에서 마지막으로 고른 언어가 다르면 그 언어로 맞춤 (언어 연동)
  // 언어 변경 처리(시험·필드 자동 조정 및 저장)는 기존 change 핸들러를 그대로 사용
  const sharedLangId = langCombobox.getSharedLanguage();
  if (sharedLangId && sharedLangId !== promptLangSelect.value) {
    langCombobox.setValue(sharedLangId);
    promptLangSelect.dispatchEvent(new Event('change'));
  }
});
