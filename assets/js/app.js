// Anki 카드 서식 에디터 - 메인 애플리케이션 로직
document.addEventListener('DOMContentLoaded', () => {
  const t = (key, params) => i18n.t(key, params);

  // DOM Elements
  const languageSelect = document.getElementById('languageSelect');
  const langSelectContainer = document.getElementById('langSelectContainer');
  const langSearchInput = document.getElementById('langSearchInput');
  const langClearBtn = document.getElementById('langClearBtn');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langDropdownWrapper = document.getElementById('langDropdownWrapper');
  const langDropdownList = document.getElementById('langDropdownList');
  const filteredLangCount = document.getElementById('filteredLangCount');

  const dictFieldChecklist = document.getElementById('dictFieldChecklist');
  const dictUrlInput = document.getElementById('dictUrlInput');
  const resetDictUrlBtn = document.getElementById('resetDictUrlBtn');
  const dictNameTag = document.getElementById('dictNameTag');
  const dictUrlWarn = document.getElementById('dictUrlWarn');
  const subDictUrlWarn = document.getElementById('subDictUrlWarn');
  const rtlNotice = document.getElementById('rtlNotice');
  const linkNewTab = document.getElementById('linkNewTab');
  const linkCleanQuery = document.getElementById('linkCleanQuery');
  const wikiUrlInput = document.getElementById('wikiUrlInput');
  const resetWikiUrlBtn = document.getElementById('resetWikiUrlBtn');
  const DEFAULT_WIKI_URL = 'https://ko.wikipedia.org/wiki/';
  const subDictSelect = document.getElementById('subDictSelect');

  // 보조 사전 (한국어 뜻 찾아보기용) 프리셋 - 링크 URL은 wikiUrlInput에 보관 (기존 저장값 호환)
  const SUB_DICT_PRESETS = {
    ko: { name: t('editor.subDict.ko'), icon: '📘', url: 'https://ko.dict.naver.com/#/search?query=' },
    wiki: { name: t('editor.subDict.wiki'), icon: '📖', url: DEFAULT_WIKI_URL },
    custom: { name: t('editor.subDict.custom'), icon: '🔎', url: '' },
  };
  const DEFAULT_SUB_DICT = 'ko';

  function getSubDict() {
    return SUB_DICT_PRESETS[subDictSelect ? subDictSelect.value : DEFAULT_SUB_DICT] || SUB_DICT_PRESETS[DEFAULT_SUB_DICT];
  }

  function getSubDictLabel() {
    const sub = getSubDict();
    return `${sub.icon} ${sub.name}`;
  }

  // 필드 헤더의 보조 사전 토글 이름을 선택한 사전에 맞춤
  function updateSubDictLabels() {
    document.querySelectorAll('.sub-dict-label').forEach(el => {
      el.textContent = getSubDictLabel();
    });
  }
  // 아이콘 (🌐 외국어사전 · 📘📖🔎 보조 사전 · 🔊 읽어주기): 잘못 누르지 않게 크게 · 넉넉한 간격
  // 미리보기(인라인 스타일)와 생성 CSS(.field-icons · .link-btn · .tts-btn 규칙)가 같은 값을 쓰도록 공유
  // 버튼 하나의 누르는 자리: 글씨의 0.85배 아이콘 + 안쪽 여백 → 필드 글씨 24px 기준 약 33px
  const ICON_BTN_DECLS = [
    'display: inline-flex;', 'align-items: center;', 'justify-content: center;', 'box-sizing: border-box;',
    'min-width: 1.6em;', 'min-height: 1.6em;', 'padding: 0.15em;', 'margin: 0 0.2em;', 'border-radius: 0.45em;', 'line-height: 1;',
  ];
  const LINK_BTN_DECLS = [...ICON_BTN_DECLS, 'font-size: 0.85em;', 'text-decoration: none;', 'opacity: 0.8;'];
  // 누를 때 · 마우스를 올렸을 때 은은한 둥근 바탕 (밝은 카드 · 어두운 카드 모두 보이는 중간 회색 반투명)
  const ICON_HOVER_BG = 'rgba(127, 127, 127, 0.16)';
  // 아이콘 위치: beside 글자 옆 | below 글자 아래 따로 한 줄
  // 처음 방문 · 꾸미기 초기화는 '글자 아래', 이 설정이 없던 예전 저장본은 '글자 옆' (기존 카드 모양 유지)
  const ICON_POSITIONS = ['beside', 'below'];
  const DEFAULT_ICON_POSITION = 'below';
  const LEGACY_ICON_POSITION = 'beside';
  const iconPositionSelect = document.getElementById('iconPosition');

  // 🔊 읽어주기 (Anki 자체 TTS): 학습 언어 → Anki 언어 코드 ({{tts 언어코드:필드}})
  // 기기마다 목소리 이름이 달라 voices=는 넣지 않고 언어 코드만 사용
  // 목록에 없는 언어(테툼어·고대 히브리어·고대 그리스어·라틴어)는 기기 목소리가 거의 없어 읽어주기를 끔
  const TTS_LANG_CODES = {
    en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', ru: 'ru_RU', it: 'it_IT',
    th: 'th_TH', vi: 'vi_VN', id: 'id_ID', ar: 'ar_SA', ne: 'ne_NP', lo: 'lo_LA', mn: 'mn_MN', my: 'my_MM',
    sw: 'sw_KE', ur: 'ur_PK', uz: 'uz_UZ', kk: 'kk_KZ', km: 'km_KH', tl: 'fil_PH', fa: 'fa_IR', ha: 'ha_NG',
    he: 'he_IL', hi: 'hi_IN', el: 'el_GR', nl: 'nl_NL', no: 'nb_NO', da: 'da_DK', ro: 'ro_RO', sv: 'sv_SE',
    sq: 'sq_AL', uk: 'uk_UA', ka: 'ka_GE', cs: 'cs_CZ', hr: 'hr_HR', tr: 'tr_TR', pt: 'pt_BR', pl: 'pl_PL',
    fi: 'fi_FI', hu: 'hu_HU',
  };
  const TTS_SPEEDS = ['1.0', '0.8', '0.6'];
  const DEFAULT_TTS_SPEED = '1.0';
  const ttsSpeedSelect = document.getElementById('ttsSpeed');
  const ttsInfoBox = document.getElementById('ttsInfoBox');
  const ttsInfoBody = document.getElementById('ttsInfoBody');
  const ttsUnsupportedNote = document.getElementById('ttsUnsupportedNote');
  const previewTtsNote = document.getElementById('previewTtsNote');

  // Common Layout & Typography Options
  const showHrAnswer = document.getElementById('showHrAnswer');
  const keepFrontOnBack = document.getElementById('keepFrontOnBack');
  const frontOnBackSettings = document.getElementById('frontOnBackSettings');
  const frontOnBackSize = document.getElementById('frontOnBackSize');
  const frontOnBackSizeNum = document.getElementById('frontOnBackSizeNum');
  const frontOnBackSizeVal = document.getElementById('frontOnBackSizeVal');
  const syncFrontSizeWithF1 = document.getElementById('syncFrontSizeWithF1');
  const frontOnBackKeepStyle = document.getElementById('frontOnBackKeepStyle');
  const centerAlign = document.getElementById('centerAlign');
  const rtlForce = document.getElementById('rtlForce');

  const cardBaseFont = document.getElementById('cardBaseFont');
  const cardLineHeight = document.getElementById('cardLineHeight');
  const cardLineHeightNum = document.getElementById('cardLineHeightNum');
  const cardLineHeightVal = document.getElementById('cardLineHeightVal');

  // 글꼴 목록: Windows · macOS · iOS(AnkiMobile) · Android(AnkiDroid)에 이미 들어 있는 글꼴만 사용
  // (웹폰트를 불러오지 않아 인터넷 없이도 보이고, 기기마다 그 기기의 비슷한 글꼴로 표시)
  // 서식 미리보기의 style="..." 속성에도 들어가므로 글꼴 이름은 작은따옴표만 사용
  const FONT_PRESETS = {
    // 기본 고딕: 애플 기기 → 윈도우(맑은 고딕) → 안드로이드(Noto CJK) → 중국어·일본어 고딕 → 영문 고딕
    'gothic': {
      css: "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', 'Noto Sans KR', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans', 'Yu Gothic', Roboto, 'Segoe UI', sans-serif"
    },
    // 명조 (바탕체 느낌): 애플 명조 → 윈도우 바탕 → 안드로이드 Noto Serif CJK → 중국어·일본어 명조 → 영문 세리프
    'serif': {
      css: "'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', 'Noto Serif KR', 'Songti SC', 'SimSun', 'Hiragino Mincho ProN', 'Yu Mincho', Georgia, 'Times New Roman', serif"
    },
    // 타자기체: 영문·숫자 폭이 일정 (한글은 기기의 고딕으로 표시됨)
    // 맥·아이폰·안드로이드는 한글을 알아서 고딕으로 그리지만 윈도우는 명조 비슷한 글꼴로 그려서 맑은 고딕을 끝에 넣음
    'mono': {
      css: "Menlo, Consolas, 'Droid Sans Mono', 'Courier New', 'Malgun Gothic', monospace"
    }
  };
  const DEFAULT_CARD_FONT = 'gothic';

  // 예전 글꼴 선택값 → 지금 글꼴 (예전 저장본 복원용: 웹폰트 · 손글씨체 · 사무용 · 직접 입력은 기본 고딕으로)
  const LEGACY_FONT_MAP = {
    'system': 'gothic',
    'noto-sans-kr': 'gothic',
    'nanum-gothic': 'gothic',
    'inter': 'gothic',
    'noto-sans-jp': 'gothic',
    'noto-sans-sc': 'gothic',
    'office': 'gothic',
    'cursive': 'gothic',
    'custom': 'gothic',
    'noto-serif-kr': 'serif',
    'monospace': 'mono',
  };

  // 저장본의 카드 글꼴 값 정리 (모르는 값은 기본 고딕)
  function normalizeCardFontKey(key) {
    const val = String(key || '');
    if (FONT_PRESETS[val]) return val;
    return LEGACY_FONT_MAP[val] || DEFAULT_CARD_FONT;
  }

  // 저장본의 필드 글꼴 값 정리 ('inherit' = 카드 글꼴 그대로, 모르는 값도 카드 글꼴 그대로)
  function normalizeFieldFontKey(key) {
    const val = String(key || '');
    if (val === 'inherit' || FONT_PRESETS[val]) return val;
    return LEGACY_FONT_MAP[val] || 'inherit';
  }

  function getFontFamilyCss(key) {
    return FONT_PRESETS[normalizeCardFontKey(key)].css;
  }

  function getFieldFontCss(field) {
    if (!field || !field.fontSelect) return '';
    const val = field.fontSelect.value;
    if (val === 'inherit') return '';
    return getFontFamilyCss(val);
  }

  // 필드명 비었을 때의 기본 이름 (배지·서식 코드·미리보기 공통: Front / Back / Field{n})
  function getFieldFallbackName(idx) {
    return idx === 0 ? 'Front' : (idx === 1 ? 'Back' : `Field${idx + 1}`);
  }

  // 화면 표시용 필드명 (입력값 그대로, 비면 기본 이름)
  function getFieldDisplayName(field, idx) {
    const raw = field && field.nameInput ? field.nameInput.value.trim() : '';
    return raw || getFieldFallbackName(idx);
  }

  // Anki 필드명 규칙: : { } " 사용 불가, # ^ / 로 시작 불가
  const FIELD_NAME_FORBIDDEN_RE = /[:{}"]/g;
  const FIELD_NAME_LEADING_RE = /^[#^/\s]+/;

  function getFieldNameIssue(rawName) {
    const name = String(rawName || '').trim();
    if (!name) return '';
    if (/[:{}"]/.test(name)) return t('editor.field.nameInvalidChars');
    if (/^[#^/]/.test(name)) return t('editor.field.nameInvalidStart');
    return '';
  }

  // 서식 코드에 넣을 필드명 (금지 문자 제거, 입력창 값은 바꾸지 않음)
  function getAnkiFieldName(field, idx) {
    const raw = field && field.nameInput ? field.nameInput.value : '';
    const cleaned = String(raw).replace(FIELD_NAME_FORBIDDEN_RE, '').trim().replace(FIELD_NAME_LEADING_RE, '').trim();
    return cleaned || getFieldFallbackName(idx);
  }

  // 필드명 입력칸 아래 경고 표시 갱신
  function updateFieldNameWarning(field) {
    if (!field || !field.nameWarnEl) return;
    const issue = getFieldNameIssue(field.nameInput.value);
    field.nameWarnEl.textContent = issue;
    field.nameWarnEl.classList.toggle('hidden', !issue);
  }

  // 링크로 쓸 수 있는 주소인지 (http/https만 허용, Anki 치환 기호 {{ }} 포함 불가)
  function isHttpUrl(url) {
    const value = String(url || '').trim();
    return /^https?:\/\/[^\s"'<>`]+$/i.test(value) && !/\{\{|\}\}/.test(value);
  }

  // #rgb / #rrggbb 색상 검사 및 6자리로 정규화 (잘못된 값이면 null)
  function normalizeHexColor(val) {
    let v = String(val || '').trim();
    if (/^[0-9A-Fa-f]{3}$/.test(v) || /^[0-9A-Fa-f]{6}$/.test(v)) v = '#' + v;
    if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return /^#[0-9A-Fa-f]{6}$/.test(v) ? v.toLowerCase() : null;
  }

  // 숫자 범위 보정 (숫자가 아니면 기본값)
  function clampNumber(val, min, max, fallback) {
    const n = parseFloat(val);
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  const SIZE_MIN = 10;
  const SIZE_MAX = 80;
  const LINE_HEIGHT_MIN = 1.0;
  const LINE_HEIGHT_MAX = 3.0;
  const WEIGHT_VALUES = ['normal', 'bold', '600'];

  // Field Elements
  const box1 = document.getElementById('boxField1');
  const box2 = document.getElementById('boxField2');

  const fields = [
    {
      boxEl: box1,
      badgeEl: document.getElementById('f1_badge'),
      nameInput: document.getElementById('f1_name'),
      nameWarnEl: document.getElementById('f1_name_warn'),
      sampleInput: document.getElementById('f1_sample'),
      showFront: document.getElementById('f1_show_front'),
      showBack: document.getElementById('f1_show_back'),
      dictLinkCheck: document.getElementById('f1_dict_link'),
      wikiLinkCheck: document.getElementById('f1_wiki_link'),
      ttsCheck: document.getElementById('f1_tts'),
      sizeSlider: document.getElementById('f1_size'),
      sizeNum: document.getElementById('f1_size_num'),
      sizeVal: document.getElementById('f1_size_val'),
      weightSelect: document.getElementById('f1_weight'),
      fontSelect: document.getElementById('f1_font'),
      colorInput: document.getElementById('f1_color'),
      colorText: document.getElementById('f1_color_text'),
      deleteBtn: null,
      hasDictLink: false,
      hasWikiLink: false,
      hasTts: false,
    },
    {
      boxEl: box2,
      badgeEl: document.getElementById('f2_badge'),
      nameInput: document.getElementById('f2_name'),
      nameWarnEl: document.getElementById('f2_name_warn'),
      sampleInput: document.getElementById('f2_sample'),
      showFront: document.getElementById('f2_show_front'),
      showBack: document.getElementById('f2_show_back'),
      dictLinkCheck: document.getElementById('f2_dict_link'),
      wikiLinkCheck: document.getElementById('f2_wiki_link'),
      ttsCheck: document.getElementById('f2_tts'),
      sizeSlider: document.getElementById('f2_size'),
      sizeNum: document.getElementById('f2_size_num'),
      sizeVal: document.getElementById('f2_size_val'),
      weightSelect: document.getElementById('f2_weight'),
      fontSelect: document.getElementById('f2_font'),
      colorInput: document.getElementById('f2_color'),
      colorText: document.getElementById('f2_color_text'),
      deleteBtn: null,
      hasDictLink: true,
      hasWikiLink: false,
      hasTts: true, // 처음 방문 시 외국어 단어 필드는 읽어주기 켬 (예전 저장본은 키가 없으면 끔)
    }
  ];

  // Preview & Code DOM
  const tabFrontPreview = document.getElementById('tabFrontPreview');
  const tabBackPreview = document.getElementById('tabBackPreview');
  const flipCardBtn = document.getElementById('flipCardBtn');
  const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
  const ankiCardWrapper = document.getElementById('ankiCardWrapper');
  const liveCardRender = document.getElementById('liveCardRender');
  const currentCardSideBadge = document.getElementById('currentCardSideBadge');

  const codeFrontText = document.getElementById('codeFrontText');
  const codeBackText = document.getElementById('codeBackText');
  const codeCssText = document.getElementById('codeCssText');

  const copyFrontBtn = document.getElementById('copyFrontBtn');
  const copyBackBtn = document.getElementById('copyBackBtn');
  const copyCssBtn = document.getElementById('copyCssBtn');
  const toast = document.getElementById('toastNotification');

  // ③ 붙여넣기 도우미: 단계별 복사 완료(✓) 표시
  // 복사한 내용을 기억해 두고, 생성된 서식이 바뀌면 그 단계의 ✓를 자동으로 지움
  const pasteSteps = [
    { stepEl: document.getElementById('pasteStepFront'), codeEl: codeFrontText, copiedText: null },
    { stepEl: document.getElementById('pasteStepBack'), codeEl: codeBackText, copiedText: null },
    { stepEl: document.getElementById('pasteStepCss'), codeEl: codeCssText, copiedText: null },
  ];
  const pasteAllDone = document.getElementById('pasteAllDone');
  const editorAdvancedSettings = document.getElementById('editorAdvancedSettings');

  let currentPreviewSide = 'front'; // 기본값을 탭 활성화 상태('앞면')와 일치하도록 'front'로 설정

  // 선택한 필드 스타일 편집 패널 (모든 필드 공용)
  const inspectorFieldName = document.getElementById('inspectorFieldName');
  const inspectorHiddenNotice = document.getElementById('inspectorHiddenNotice');
  const inspectorFieldChips = document.getElementById('inspectorFieldChips');
  const inspectorSize = document.getElementById('inspectorSize');
  const inspectorSizeNum = document.getElementById('inspectorSizeNum');
  const inspectorSizeVal = document.getElementById('inspectorSizeVal');
  const inspectorWeight = document.getElementById('inspectorWeight');
  const inspectorFont = document.getElementById('inspectorFont');
  const inspectorColor = document.getElementById('inspectorColor');
  const inspectorColorText = document.getElementById('inspectorColorText');
  const inspectorPresets = document.getElementById('inspectorPresets');

  let selectedFieldIndex = 0;

  // 🎨 더 꾸미기: 배경 · 카드 상자 · 테두리 · 구분선 (기본값 그대로면 생성되는 카드 서식은 예전과 똑같음)
  // textColor(필드 밖 글자색) · mutedColor(뒷면 위 문제 글씨를 연하게 할 때 색)는 테마가 정하고 화면에는 따로 없음
  const DECO_DEFAULTS = {
    theme: 'default',
    bgType: 'solid',        // solid 단색 | gradient 그라데이션 | pattern 은은한 무늬
    bgColor: '#ffffff',
    bgColor2: '#dbeafe',    // 그라데이션 두 번째 색 / 무늬 색
    bgDir: 'down',          // down 위→아래 | right 왼쪽→오른쪽 | diagonal 대각선
    bgPattern: 'dots',      // dots 점 | grid 격자 | lines 줄노트 | fiber 한지 결
    box: 'none',            // none | round 둥근 카드 | shadow 둥근 카드 + 그림자 | sheet 표 모양 (스프레드시트)
    boxColor: '#ffffff',
    border: 'none',         // none | thin 얇은 선 | thick 두꺼운 선 | left 왼쪽 강조 띠
    borderColor: '#cbd5e1',
    divider: 'solid',       // solid 실선 | dashed 점선 | double 이중선
    dividerColor: '#cbd5e1',
    textColor: '#202124',
    mutedColor: '#64748b',
  };
  const DECO_CHOICES = {
    bgType: ['solid', 'gradient', 'pattern'],
    bgDir: ['down', 'right', 'diagonal'],
    bgPattern: ['dots', 'grid', 'lines', 'fiber'],
    box: ['none', 'round', 'shadow', 'sheet'],
    border: ['none', 'thin', 'thick', 'left'],
    divider: ['solid', 'dashed', 'double'],
  };
  const DECO_COLOR_KEYS = ['bgColor', 'bgColor2', 'boxColor', 'borderColor', 'dividerColor', 'textColor', 'mutedColor'];
  const BG_DIR_CSS = { down: 'to bottom', right: 'to right', diagonal: '135deg' };
  const deco = { ...DECO_DEFAULTS };

  // 한 번에 꾸미기 (테마): 배경 · 상자 · 테두리 · 구분선 · 카드 글꼴 · 필드 색 (1번째 = 본문, 2번째 = 강조, 나머지 = 연하게)
  // sizes가 있는 테마는 글씨 크기도 바꿈 (1번째, 2번째, 나머지)
  const THEMES = [
    { id: 'default', icon: '🤍', font: 'gothic', colors: ['#202124', '#1a73e8', '#5f6368'], sizes: [24, 24, 20], deco: {} },
    {
      id: 'paper', icon: '📒', font: 'gothic', colors: ['#3a3631', '#2f6496', '#6f6658'],
      deco: { bgType: 'pattern', bgColor: '#fcf7ea', bgColor2: '#d3e0ec', bgPattern: 'lines', border: 'left', borderColor: '#eba9a3', divider: 'dashed', dividerColor: '#c8bba2', textColor: '#3a3631', mutedColor: '#6f6658' },
    },
    {
      id: 'pastel', icon: '🌸', font: 'gothic', colors: ['#4a4358', '#b83d70', '#6b6480'],
      deco: { bgType: 'gradient', bgColor: '#fde4ec', bgColor2: '#dcebfd', bgDir: 'diagonal', box: 'shadow', boxColor: '#ffffff', divider: 'dashed', dividerColor: '#f1bfd0', textColor: '#4a4358', mutedColor: '#6b6480' },
    },
    {
      id: 'dark', icon: '🖤', font: 'serif', colors: ['#f2ead8', '#e2bf68', '#a9aec0'],
      deco: { bgType: 'gradient', bgColor: '#161c2f', bgColor2: '#0b0f1b', bgDir: 'down', box: 'shadow', boxColor: '#1c2339', border: 'thin', borderColor: '#9c8240', divider: 'double', dividerColor: '#b8954a', textColor: '#f2ead8', mutedColor: '#a9aec0' },
    },
    {
      id: 'hanji', icon: '🏯', font: 'serif', colors: ['#1f1a16', '#9e2a2b', '#6b5d4f'],
      deco: { bgType: 'pattern', bgColor: '#f3ead7', bgColor2: '#8a6a3f', bgPattern: 'fiber', border: 'thin', borderColor: '#c9b48f', divider: 'double', dividerColor: '#9e2a2b', textColor: '#1f1a16', mutedColor: '#6b5d4f' },
    },
    {
      id: 'chalk', icon: '🟩', font: 'gothic', colors: ['#f3f1e7', '#f6d76b', '#b9c8bc'],
      deco: { bgType: 'pattern', bgColor: '#2c4a3e', bgColor2: '#e8f0e8', bgPattern: 'fiber', border: 'thick', borderColor: '#8a5a36', divider: 'dashed', dividerColor: '#d9d6c4', textColor: '#f3f1e7', mutedColor: '#b9c8bc' },
    },
    {
      id: 'ocean', icon: '🌊', font: 'gothic', colors: ['#12324a', '#0b7a8a', '#587386'],
      deco: { bgType: 'gradient', bgColor: '#b5e3ec', bgColor2: '#4f8fc0', bgDir: 'down', box: 'shadow', boxColor: '#ffffff', divider: 'solid', dividerColor: '#a7d3e2', textColor: '#12324a', mutedColor: '#587386' },
    },
    {
      // 스프레드시트: 표 모양 카드 (테두리 색은 테두리를 고를 때만 쓰임)
      id: 'sheet', icon: '📊', font: 'gothic', colors: ['#1f1f1f', '#1f1f1f', '#595959'], sizes: [16, 16, 14],
      deco: { bgType: 'solid', bgColor: '#ffffff', box: 'sheet', boxColor: '#ffffff', border: 'none', borderColor: '#217346', divider: 'solid', dividerColor: '#d4d4d4', textColor: '#1f1f1f', mutedColor: '#595959' },
    },
  ];

  const decoControls = {
    bgType: document.getElementById('decoBgType'),
    bgColor: document.getElementById('decoBgColor'),
    bgColor2: document.getElementById('decoBgColor2'),
    bgDir: document.getElementById('decoBgDir'),
    bgPattern: document.getElementById('decoBgPattern'),
    box: document.getElementById('decoBox'),
    boxColor: document.getElementById('decoBoxColor'),
    border: document.getElementById('decoBorder'),
    borderColor: document.getElementById('decoBorderColor'),
    divider: document.getElementById('decoDivider'),
    dividerColor: document.getElementById('decoDividerColor'),
  };
  const themeSwatches = document.getElementById('themeSwatches');

  let langCombobox = null;
  const DEFAULT_LANG_ID = 'en'; // 첫 방문 기본 언어 (사용자가 가장 많은 영어)

  // 1. 언어 검색형 콤보박스 초기화 (공용 컴포넌트: assets/js/langCombobox.js)
  function initLanguageSelect() {
    langCombobox = window.createLangCombobox({
      container: langSelectContainer,
      select: languageSelect,
      input: langSearchInput,
      clearBtn: langClearBtn,
      toggleBtn: langToggleBtn,
      dropdown: langDropdownWrapper,
      list: langDropdownList,
      countEl: filteredLangCount,
      languages: window.LANGUAGES_DATA || LANGUAGES_DATA,
      onSelect: () => onLanguageChange(true),
    });
    langCombobox.setValue(DEFAULT_LANG_ID);
  }

  // 3번째 필드 기본 구성 (중국어는 병음, 그 외는 예문)
  function getDefaultThirdField(lang) {
    const sample = (lang.sample && lang.sample.field3) || '';
    return lang.id === 'zh'
      ? { name: 'pinyin', sample: sample || 'nǐ hǎo' }
      : { name: 'Example', sample };
  }

  function getSelectedLanguage() {
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    const selectedId = languageSelect.value;
    return list.find(lang => lang.id === selectedId) || list[0];
  }

  // 예시값이 사용자가 손대지 않은 기본값인지 (비었거나 어떤 언어의 해당 칸 기본 예시와 같음)
  function isUntouchedSample(value, slot) {
    const v = String(value || '').trim();
    if (!v) return true;
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    if (slot === 'field3' && v === 'nǐ hǎo') return true;
    return list.some(l => l.sample && String(l.sample[slot] || '').trim() === v);
  }

  // 3번째 필드가 아직 기본 3번째 필드(Example / pinyin)인지
  function isDefaultThirdFieldName(name) {
    return ['Example', 'example', 'sample', 'pinyin'].includes(String(name || '').trim());
  }

  // 언어 변경 처리
  // isUserManualChange: 사용자가 직접 언어를 고름 → 예시값(기본값 그대로인 것만)·RTL 자동 적용
  // opts.prevLang: 다른 도구와의 언어 연동으로 바뀐 경우 이전 언어 (RTL은 사용자가 바꾸지 않았을 때만 따라감)
  function onLanguageChange(isUserManualChange = true, shouldSave = true, opts = {}) {
    const lang = getSelectedLanguage();
    dictUrlInput.value = lang.dictUrl;
    dictNameTag.textContent = lang.dictName;

    // RTL 알림 및 자동 적용
    rtlNotice.classList.toggle('hidden', !lang.isRTL);
    if (opts.prevLang) {
      if (rtlForce.checked === Boolean(opts.prevLang.isRTL)) rtlForce.checked = Boolean(lang.isRTL);
    } else if (isUserManualChange) {
      rtlForce.checked = Boolean(lang.isRTL);
    }

    // 3번째 필드가 존재할 경우 언어에 맞춰 기본값/플레이스홀더 동기화
    if (fields.length >= 3) {
      const f3Input = fields[2].nameInput;
      const currentF3Val = f3Input.value.trim();

      if (lang.id === 'zh') {
        f3Input.placeholder = t('editor.field.namePlaceholderPinyin');
        if (!currentF3Val || currentF3Val === 'Example' || currentF3Val === 'example' || currentF3Val === 'sample') {
          f3Input.value = 'pinyin';
        }
      } else {
        f3Input.placeholder = t('editor.field.namePlaceholderExample');
        if (!currentF3Val || currentF3Val === 'pinyin') {
          f3Input.value = 'Example';
        }
      }
    }

    // 언어 변경 시 예시 샘플 자동 채우기 (사용자가 직접 입력한 예시값은 유지, 기본값 그대로인 칸만 교체)
    if (isUserManualChange && lang.sample) {
      if (fields[0] && isUntouchedSample(fields[0].sampleInput.value, 'field1')) {
        fields[0].sampleInput.value = lang.sample.field1 || '';
      }
      if (fields[1] && isUntouchedSample(fields[1].sampleInput.value, 'field2')) {
        fields[1].sampleInput.value = lang.sample.field2 || '';
      }
      // 3번째 칸은 기본 3번째 필드(Example / pinyin)일 때만 (추천 칩 등 다른 필드의 예시는 건드리지 않음)
      if (fields.length >= 3 && isDefaultThirdFieldName(fields[2].nameInput.value)
        && isUntouchedSample(fields[2].sampleInput.value, 'field3')) {
        fields[2].sampleInput.value = getDefaultThirdField(lang).sample;
      }
    }

    updateFieldBadges();
    updateDictFieldChecklist();
    renderEditorQuickChips(lang.id);
    updateAll(shouldSave);
  }

  // 필드 이벤트 바인딩 헬퍼 (초기 1, 2번째 필드 및 동적 추가 필드 공통)
  function bindFieldEvents(f) {
    // 필드명 변경 시 배지 및 고급 설정의 사전 아이콘 체크리스트, 서식 즉시 갱신
    f.nameInput.addEventListener('input', () => {
      updateFieldNameWarning(f);
      updateFieldBadges();
      updateDictFieldChecklist();
      updateAll();
    });
    f.nameInput.addEventListener('change', () => {
      updateFieldNameWarning(f);
      updateFieldBadges();
      updateDictFieldChecklist();
      updateAll();
    });

    f.sampleInput.addEventListener('input', () => updateAll());
    f.sampleInput.addEventListener('change', () => updateAll());

    // 노출 체크박스
    f.showFront.addEventListener('change', () => {
      updateFieldBadges();
      updateAll();
    });
    f.showBack.addEventListener('change', () => {
      updateFieldBadges();
      updateAll();
    });

    // 외국어사전 / 보조 사전 링크 체크박스 (헤더 미니 토글, 동시 적용 가능)
    if (f.dictLinkCheck) {
      f.dictLinkCheck.addEventListener('change', () => {
        setFieldLink(f, 'dict', f.dictLinkCheck.checked);
      });
    }
    if (f.wikiLinkCheck) {
      f.wikiLinkCheck.addEventListener('change', () => {
        setFieldLink(f, 'wiki', f.wikiLinkCheck.checked);
      });
    }
    // 🔊 읽어주기 토글
    if (f.ttsCheck) {
      f.ttsCheck.addEventListener('change', () => {
        setFieldLink(f, 'tts', f.ttsCheck.checked);
      });
    }

    // 크기 슬라이더 & 숫자 입력 동기화
    f.sizeSlider.addEventListener('input', (e) => {
      f.sizeNum.value = e.target.value;
      f.sizeVal.textContent = e.target.value;
      if (f === fields[0] && syncFrontSizeWithF1 && syncFrontSizeWithF1.checked && frontOnBackSize) {
        frontOnBackSize.value = e.target.value;
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = e.target.value;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = e.target.value + 'px';
      }
      updateAll();
    });
    f.sizeSlider.addEventListener('change', () => updateAll());

    f.sizeNum.addEventListener('input', (e) => {
      const val = Math.round(clampNumber(e.target.value, SIZE_MIN, SIZE_MAX, 20));
      f.sizeSlider.value = val;
      f.sizeVal.textContent = val;
      if (f === fields[0] && syncFrontSizeWithF1 && syncFrontSizeWithF1.checked && frontOnBackSize) {
        frontOnBackSize.value = val;
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = val;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = val + 'px';
      }
      updateAll();
    });
    // 입력을 마치면 범위로 보정된 실제 적용값을 숫자 칸에도 다시 표시
    f.sizeNum.addEventListener('change', () => {
      f.sizeNum.value = f.sizeSlider.value;
      f.sizeVal.textContent = f.sizeSlider.value;
      updateAll();
    });

    // 굵기
    f.weightSelect.addEventListener('change', () => updateAll());

    // 글꼴 (폰트)
    if (f.fontSelect) {
      f.fontSelect.addEventListener('change', () => updateAll());
    }

    // 색상 피커 & 텍스트 동기화
    const handleColorPick = (e) => {
      f.colorText.value = e.target.value;
      updateAll();
    };
    f.colorInput.addEventListener('input', handleColorPick);
    f.colorInput.addEventListener('change', handleColorPick);

    // 색상 텍스트 입력 처리 (# 생략 및 3자리/6자리 hex 지원)
    f.colorText.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        val = '#' + val;
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        f.colorInput.value = val;
        updateAll();
      }
    });

    f.colorText.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        val = '#' + val;
      } else if (/^#[0-9A-Fa-f]{3}$/.test(val)) {
        val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      } else if (/^[0-9A-Fa-f]{3}$/.test(val)) {
        val = '#' + val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      }

      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        f.colorInput.value = val;
        f.colorText.value = val;
        updateAll();
      } else {
        f.colorText.value = f.colorInput.value;
      }
    });

    // 해당 필드 박스 내부 색상 프리셋 버튼들
    if (f.boxEl) {
      f.boxEl.querySelectorAll('.preset-dot').forEach(btn => {
        btn.addEventListener('click', () => {
          const color = btn.dataset.color;
          if (color) {
            f.colorInput.value = color;
            f.colorText.value = color;
            updateAll();
          }
        });
      });
    }

    // 삭제 버튼이 있는 경우
    if (f.deleteBtn) {
      f.deleteBtn.addEventListener('click', () => {
        deleteField(f);
      });
    }

    // 필드 박스 클릭 시 공용 스타일 편집 패널의 편집 대상으로 선택
    if (f.boxEl) {
      f.boxEl.addEventListener('click', (e) => {
        if (f.deleteBtn && f.deleteBtn.contains(e.target)) return;
        const idx = fields.indexOf(f);
        if (idx !== -1 && idx !== selectedFieldIndex) selectField(idx);
      });
    }
  }

  // 필드 링크 적용 여부 설정 (type: 'dict' 외국어사전 | 'wiki' 보조 사전 | 'tts' 🔊 읽어주기) - 동시 적용 가능
  function setFieldLink(f, type, enabled) {
    if (type === 'dict') f.hasDictLink = enabled;
    if (type === 'wiki') f.hasWikiLink = enabled;
    if (type === 'tts') f.hasTts = enabled;
    updateFieldBadges();
    updateDictFieldChecklist();
    updateAll();
  }

  // 공용 스타일 편집 패널: 편집 대상 필드 선택
  function selectField(idx) {
    selectedFieldIndex = idx;
    renderPreview();
  }

  // 공용 스타일 편집 패널: 선택된 필드의 현재 값으로 패널 갱신
  function syncInspector() {
    if (!inspectorSize) return;
    const f = fields[selectedFieldIndex];
    if (!f) return;

    const fName = getFieldDisplayName(f, selectedFieldIndex);
    inspectorFieldName.textContent = t('editor.field.numberedName', { num: selectedFieldIndex + 1, name: fName });

    const isVisible = currentPreviewSide === 'front'
      ? f.showFront.checked
      : (f.showBack.checked || (selectedFieldIndex === 0 && keepFrontOnBack.checked));
    inspectorHiddenNotice.classList.toggle('hidden', isVisible);

    // 사용자가 입력 중인 컨트롤은 덮어쓰지 않음
    const setIfIdle = (el, val) => {
      if (el && document.activeElement !== el) el.value = val;
    };
    setIfIdle(inspectorSize, f.sizeSlider.value);
    setIfIdle(inspectorSizeNum, f.sizeSlider.value);
    inspectorSizeVal.textContent = f.sizeSlider.value;
    setIfIdle(inspectorWeight, f.weightSelect.value);
    setIfIdle(inspectorFont, f.fontSelect ? f.fontSelect.value : 'inherit');
    setIfIdle(inspectorColor, f.colorInput.value);
    setIfIdle(inspectorColorText, f.colorInput.value);

    // 필드 선택 칩 (현재 면에 표시되지 않는 필드도 선택 가능)
    inspectorFieldChips.innerHTML = '';
    fields.forEach((field, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'inspector-chip' + (idx === selectedFieldIndex ? ' active' : '');
      chip.textContent = `${idx + 1}. ${getFieldDisplayName(field, idx)}`;
      chip.addEventListener('click', () => selectField(idx));
      inspectorFieldChips.appendChild(chip);
    });

    fields.forEach((field, idx) => {
      if (field.boxEl) field.boxEl.classList.toggle('is-selected', idx === selectedFieldIndex);
    });
  }

  // 공용 스타일 편집 패널 이벤트: 선택된 필드의 (숨겨진) 개별 컨트롤에 값을 반영하고
  // 기존 필드 이벤트를 그대로 발생시켜 동기화·저장 로직을 재사용
  function initInspectorEvents() {
    if (!inspectorSize) return;
    const target = () => fields[selectedFieldIndex];

    inspectorSize.addEventListener('input', (e) => {
      const f = target();
      if (!f) return;
      inspectorSizeNum.value = e.target.value;
      f.sizeSlider.value = e.target.value;
      f.sizeSlider.dispatchEvent(new Event('input'));
    });

    inspectorSizeNum.addEventListener('input', (e) => {
      const f = target();
      if (!f) return;
      f.sizeNum.value = e.target.value;
      f.sizeNum.dispatchEvent(new Event('input'));
    });
    inspectorSizeNum.addEventListener('change', () => {
      const f = target();
      if (!f) return;
      // 범위로 보정된 실제 적용값을 숫자 칸에 다시 표시
      inspectorSizeNum.value = f.sizeSlider.value;
      inspectorSizeVal.textContent = f.sizeSlider.value;
      f.sizeNum.value = f.sizeSlider.value;
    });

    inspectorWeight.addEventListener('change', () => {
      const f = target();
      if (!f) return;
      f.weightSelect.value = inspectorWeight.value;
      f.weightSelect.dispatchEvent(new Event('change'));
    });

    inspectorFont.addEventListener('change', () => {
      const f = target();
      if (!f || !f.fontSelect) return;
      f.fontSelect.value = inspectorFont.value;
      f.fontSelect.dispatchEvent(new Event('change'));
    });

    const applyColor = (color) => {
      const f = target();
      if (!f) return;
      f.colorInput.value = color;
      f.colorInput.dispatchEvent(new Event('input'));
    };

    inspectorColor.addEventListener('input', () => {
      inspectorColorText.value = inspectorColor.value;
      applyColor(inspectorColor.value);
    });

    // 색상 텍스트 입력 처리 (# 생략 및 3자리/6자리 hex 지원)
    inspectorColorText.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (/^[0-9A-Fa-f]{6}$/.test(val)) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) applyColor(val);
    });

    inspectorColorText.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        val = '#' + val;
      } else if (/^#[0-9A-Fa-f]{3}$/.test(val)) {
        val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      } else if (/^[0-9A-Fa-f]{3}$/.test(val)) {
        val = '#' + val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      }

      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        applyColor(val);
      }
      const f = target();
      if (f) inspectorColorText.value = f.colorInput.value;
    });

    inspectorPresets.querySelectorAll('.preset-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.color) applyColor(btn.dataset.color);
      });
    });

    // 미리보기 카드 속 필드 텍스트 클릭 → 편집 대상 선택 (사전 아이콘은 그대로 링크 이동)
    liveCardRender.addEventListener('click', (e) => {
      // 🔊 버튼: 예시값 읽어 보기
      const ttsBtn = e.target.closest('.preview-tts-btn');
      if (ttsBtn) {
        speakPreview(parseInt(ttsBtn.dataset.ttsField, 10));
        return;
      }
      if (e.target.closest('a')) return;
      const item = e.target.closest('.field-item, .front-preview-hint');
      if (!item) return;

      let idx = 0;
      const match = item.className.match(/f-field-(\d+)/);
      if (match) idx = parseInt(match[1], 10) - 1;
      if (fields[idx] && idx !== selectedFieldIndex) selectField(idx);
    });
  }

  // 슬라이더 대신 [−] [숫자] [+] 조절기
  // 슬라이더(range)는 숨겨서 값 보관용으로 그대로 두고, 버튼은 숫자 칸 값을 바꾼 뒤 숫자 칸의 input/change 이벤트를 그대로 발생시킴
  // → 범위 보정 · 1번째 필드와 뒷면 문제 크기 맞추기 · 서식 갱신 · 저장 등 기존 로직을 그대로 씀
  const steppers = [];
  const STEPPER_HOLD_DELAY = 400; // 누르고 있으면 이 시간 뒤부터 반복
  const STEPPER_HOLD_REPEAT = 80;

  function enhanceStepper(container) {
    if (!container || container.dataset.stepper) return;
    const range = container.querySelector('input[type="range"]');
    const num = container.querySelector('input[type="number"]');
    if (!range || !num) return;
    container.dataset.stepper = '1';
    container.classList.add('stepper');

    const isLineHeight = range === cardLineHeight;
    const step = parseFloat(range.getAttribute('step')) || 1;
    const decimals = isLineHeight ? 1 : 0;
    const factor = Math.pow(10, decimals);

    const makeBtn = (dir) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `stepper-btn stepper-${dir < 0 ? 'down' : 'up'}`;
      btn.textContent = dir < 0 ? '−' : '+';
      const label = t(`editor.stepper.${isLineHeight ? 'line' : 'size'}${dir < 0 ? 'Down' : 'Up'}`);
      btn.setAttribute('aria-label', label);
      btn.title = label;
      return btn;
    };
    const minus = makeBtn(-1);
    const plus = makeBtn(1);
    container.insertBefore(minus, num);
    num.insertAdjacentElement('afterend', plus);
    const unit = document.createElement('span');
    unit.className = 'stepper-unit';
    unit.textContent = isLineHeight ? t('editor.step3.lineHeightUnit') : 'px';
    plus.insertAdjacentElement('afterend', unit);

    // 한 칸 올리기/내리기 (끝에 닿아 바뀌지 않으면 false)
    const nudge = (dir) => {
      const min = parseFloat(range.min);
      const max = parseFloat(range.max);
      const cur = parseFloat(range.value);
      const next = Math.min(max, Math.max(min, Math.round((cur + dir * step) * factor) / factor));
      if (!isFinite(next) || next === cur) return false;
      num.value = next.toFixed(decimals);
      num.dispatchEvent(new Event('input'));
      num.dispatchEvent(new Event('change'));
      return true;
    };

    // 누르고 있으면 반복 (손을 떼거나 · 버튼 밖으로 나가거나 · 취소되면 멈춤)
    [[minus, -1], [plus, 1]].forEach(([btn, dir]) => {
      let holdTimer = null;
      let repeatTimer = null;
      const stop = () => {
        clearTimeout(holdTimer);
        clearInterval(repeatTimer);
        holdTimer = null;
        repeatTimer = null;
      };
      btn.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        stop();
        if (!nudge(dir)) return;
        holdTimer = setTimeout(() => {
          repeatTimer = setInterval(() => {
            if (btn.disabled || !nudge(dir)) stop();
          }, STEPPER_HOLD_REPEAT);
        }, STEPPER_HOLD_DELAY);
      });
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(type => btn.addEventListener(type, stop));
      // 키보드(Enter · 스페이스)로 누른 경우만 click에서 처리 (마우스·터치는 pointerdown에서 이미 처리)
      btn.addEventListener('click', (e) => {
        if (e.detail === 0) nudge(dir);
      });
      // 길게 누를 때 휴대폰의 메뉴(복사 등)가 뜨지 않게
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    steppers.push({ container, range, num, minus, plus, decimals });
  }

  // 조절기 화면 갱신: 숫자 칸 표시(입력 중인 칸은 그대로) · 끝에 닿은 버튼 끄기
  function refreshSteppers() {
    for (let i = steppers.length - 1; i >= 0; i--) {
      const s = steppers[i];
      if (!s.container.isConnected) {
        steppers.splice(i, 1); // 삭제된 필드의 조절기
        continue;
      }
      const val = parseFloat(s.range.value);
      if (!isFinite(val)) continue;
      if (document.activeElement !== s.num) s.num.value = val.toFixed(s.decimals);
      s.minus.disabled = val <= parseFloat(s.range.min);
      s.plus.disabled = val >= parseFloat(s.range.max);
    }
  }

  // 동적 필드 추가 함수 (3번째 이상 선택 필드)
  function addOptionalField(fieldData = null, shouldSave = true) {
    const currentLang = getSelectedLanguage();
    const index = fields.length + 1; // 1-based index (3, 4, 5...)

    let name = '';
    let sample = '';
    let showFront = false;
    let showBack = true;
    let size = 20;
    let weight = 'normal';
    let font = 'inherit';
    let color = '#5f6368';
    let hasDictLink = false;
    let hasWikiLink = false;
    let hasTts = false;

    if (fieldData) {
      // 저장본에서 복원하는 값은 형식을 검사 (잘못된 값은 기본값 유지)
      if (fieldData.name !== undefined) name = String(fieldData.name);
      if (fieldData.sample !== undefined) sample = String(fieldData.sample);
      if (fieldData.showFront !== undefined) showFront = Boolean(fieldData.showFront);
      if (fieldData.showBack !== undefined) showBack = Boolean(fieldData.showBack);
      if (fieldData.size !== undefined) size = Math.round(clampNumber(fieldData.size, SIZE_MIN, SIZE_MAX, size));
      if (WEIGHT_VALUES.includes(String(fieldData.weight))) weight = String(fieldData.weight);
      // 예전 글꼴 값은 지금 글꼴로 바꿔 복원 (모르는 값은 카드 글꼴 그대로)
      if (fieldData.font !== undefined) font = normalizeFieldFontKey(fieldData.font);
      if (fieldData.color !== undefined) color = normalizeHexColor(fieldData.color) || color;
      if (fieldData.hasDictLink !== undefined) hasDictLink = Boolean(fieldData.hasDictLink);
      if (fieldData.hasWikiLink !== undefined) hasWikiLink = Boolean(fieldData.hasWikiLink);
      if (fieldData.hasTts !== undefined) hasTts = Boolean(fieldData.hasTts);
    } else {
      if (index === 3) {
        if (currentLang.id === 'zh') {
          name = 'pinyin';
          sample = (currentLang.sample && currentLang.sample.field3) ? currentLang.sample.field3 : 'nǐ hǎo';
        } else {
          name = 'Example';
          sample = (currentLang.sample && currentLang.sample.field3) ? currentLang.sample.field3 : '';
        }
        size = 20;
        weight = 'normal';
        color = '#5f6368';
      } else {
        name = `Field${index}`;
        sample = '';
        size = 18;
        weight = 'normal';
        color = '#64748b';
      }
    }

    const optionalFieldsContainer = document.getElementById('optionalFieldsContainer');
    if (!optionalFieldsContainer) return null;

    const box = document.createElement('div');
    box.className = 'field-setting-box';
    box.innerHTML = `
      <div class="field-setting-header">
        <div class="field-badge field-badge-secondary"></div>
        <div class="field-header-actions">
          <div class="field-visibility-toggles">
            <div class="toggle-row">
            <label class="mini-toggle" title="${t('editor.field.showFrontTitle')}">
              <input type="checkbox" class="f-show-front"${showFront ? ' checked' : ''}>
              <span>${t('editor.field.showFront')}</span>
            </label>
            <label class="mini-toggle" title="${t('editor.field.showBackTitle')}">
              <input type="checkbox" class="f-show-back"${showBack ? ' checked' : ''}>
              <span>${t('editor.field.showBack')}</span>
            </label>
            </div>
            <div class="toggle-row">
            <label class="mini-toggle mini-toggle-link" title="${t('editor.field.dictLinkTitle')}">
              <input type="checkbox" class="f-dict-link"${hasDictLink ? ' checked' : ''}>
              <span>${t('editor.field.dictLink')}</span>
            </label>
            <label class="mini-toggle mini-toggle-link" title="${t('editor.field.subDictLinkTitle')}">
              <input type="checkbox" class="f-wiki-link"${hasWikiLink ? ' checked' : ''}>
              <span class="sub-dict-label">${getSubDictLabel()}</span>
            </label>
            <label class="mini-toggle mini-toggle-tts" title="${t('editor.field.ttsTitle')}">
              <input type="checkbox" class="f-tts"${hasTts ? ' checked' : ''}>
              <span>${t('editor.field.tts')}</span>
            </label>
            </div>
          </div>
          <button type="button" class="btn-delete-field" title="${t('editor.field.deleteTitle')}">
            ${t('editor.field.delete')}
          </button>
        </div>
      </div>

      <div class="grid-2-col">
        <div class="form-group">
          <label class="form-label">${t('editor.field.nameLabel')}</label>
          <input type="text" class="form-input f-name" value="${escapeHtml(name)}" placeholder="${t('editor.field.namePlaceholderOptional')}">
          <span class="notice-badge field-name-warning f-name-warn hidden" role="alert"></span>
        </div>
        <div class="form-group">
          <label class="form-label">${t('editor.field.sampleLabel')}</label>
          <input type="text" class="form-input f-sample" value="${escapeHtml(sample)}" placeholder="${t('editor.field.samplePlaceholder')}">
        </div>
      </div>

      <div class="style-controls-row">
        <div class="control-item">
          <label class="sub-label">${t('editor.style.sizeLabel')}<span class="stepper-label-val"> <span class="f-size-val">${size}</span>px</span></label>
          <div class="slider-with-number">
            <input type="range" min="${SIZE_MIN}" max="${SIZE_MAX}" value="${size}" class="form-range f-size">
            <input type="number" min="${SIZE_MIN}" max="${SIZE_MAX}" value="${size}" class="num-input f-size-num">
          </div>
        </div>

        <div class="control-item">
          <label class="sub-label">${t('editor.style.weightLabel')}</label>
          <select class="form-select small-select f-weight">
            <option value="normal"${weight === 'normal' ? ' selected' : ''}>${t('editor.style.weightNormal')}</option>
            <option value="bold"${weight === 'bold' ? ' selected' : ''}>${t('editor.style.weightBold')}</option>
            <option value="600"${weight === '600' ? ' selected' : ''}>${t('editor.style.weight600')}</option>
          </select>
        </div>

        <div class="control-item">
          <label class="sub-label">${t('editor.style.fontLabel')}</label>
          <select class="form-select small-select f-font">
            <option value="inherit"${font === 'inherit' ? ' selected' : ''}>${t('editor.font.inherit')}</option>
            <option value="gothic"${font === 'gothic' ? ' selected' : ''}>${t('editor.font.gothic')}</option>
            <option value="serif"${font === 'serif' ? ' selected' : ''}>${t('editor.font.serif')}</option>
            <option value="mono"${font === 'mono' ? ' selected' : ''}>${t('editor.font.mono')}</option>
          </select>
        </div>

        <div class="control-item">
          <label class="sub-label">${t('editor.style.colorLabel')}</label>
          <div class="color-picker-group">
            <input type="color" value="${escapeHtml(color)}" class="form-color f-color">
            <input type="text" value="${escapeHtml(color)}" class="color-hex-input f-color-text" maxlength="7">
          </div>
        </div>
      </div>
      <div class="preset-colors">
        <span class="preset-label">${t('editor.style.presetLabel')}</span>
        <button type="button" class="preset-dot" data-color="#5f6368" style="background:#5f6368;" title="${t('editor.color.muteGray')}"></button>
        <button type="button" class="preset-dot" data-color="#202124" style="background:#202124;" title="${t('editor.color.darkGray')}"></button>
        <button type="button" class="preset-dot" data-color="#1a73e8" style="background:#1a73e8;" title="${t('editor.color.googleBlue')}"></button>
        <button type="button" class="preset-dot" data-color="#0d904f" style="background:#0d904f;" title="${t('editor.color.emerald')}"></button>
        <button type="button" class="preset-dot" data-color="#e37400" style="background:#e37400;" title="${t('editor.color.orange')}"></button>
      </div>
    `;

    optionalFieldsContainer.appendChild(box);
    enhanceStepper(box.querySelector('.slider-with-number'));

    const fObj = {
      boxEl: box,
      badgeEl: box.querySelector('.field-badge'),
      nameInput: box.querySelector('.f-name'),
      nameWarnEl: box.querySelector('.f-name-warn'),
      sampleInput: box.querySelector('.f-sample'),
      showFront: box.querySelector('.f-show-front'),
      showBack: box.querySelector('.f-show-back'),
      dictLinkCheck: box.querySelector('.f-dict-link'),
      wikiLinkCheck: box.querySelector('.f-wiki-link'),
      ttsCheck: box.querySelector('.f-tts'),
      sizeSlider: box.querySelector('.f-size'),
      sizeNum: box.querySelector('.f-size-num'),
      sizeVal: box.querySelector('.f-size-val'),
      weightSelect: box.querySelector('.f-weight'),
      fontSelect: box.querySelector('.f-font'),
      colorInput: box.querySelector('.f-color'),
      colorText: box.querySelector('.f-color-text'),
      deleteBtn: box.querySelector('.btn-delete-field'),
      hasDictLink: hasDictLink,
      hasWikiLink: hasWikiLink,
      hasTts: hasTts,
    };

    fields.push(fObj);
    bindFieldEvents(fObj);
    updateFieldNameWarning(fObj);
    updateFieldBadges();
    updateDictFieldChecklist();

    if (shouldSave) {
      updateAll(true);
    }

    return fObj;
  }

  // 동적 필드 삭제 함수
  function deleteField(fObj) {
    const idx = fields.indexOf(fObj);
    if (idx === -1) return;

    const rawName = fObj.nameInput.value.trim();
    const promptText = rawName
      ? t('editor.confirm.deleteNamed', { name: rawName })
      : t('editor.confirm.deleteNumbered', { num: idx + 1 });

    if (!confirm(promptText)) {
      return;
    }

    fObj.boxEl.remove();
    fields.splice(idx, 1);
    // 앞쪽 필드가 지워지면 편집 중이던 필드를 계속 가리키도록 선택 번호 보정
    if (idx < selectedFieldIndex) selectedFieldIndex -= 1;
    updateFieldBadges();
    updateDictFieldChecklist();
    updateAll(true);
    showToast(t('editor.toast.fieldDeleted'));
  }

  // 언어별 추천 필드 빠른 추가 칩 데이터 생성
  function getEditorQuickChipsForLanguage(langId) {
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    const langObj = list.find(l => l.id === langId) || {};
    const langName = i18n.langName(langObj) || t('editor.chips.langFallback');

    if (langId === 'ja') {
      return [
        {
          label: t('editor.chips.furiganaLabel'),
          name: t('editor.chips.furiganaName'),
          sample: 'さくら',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleLabel'),
          name: t('editor.chips.exampleName'),
          sample: (langObj.sample && langObj.sample.field3) || '公園に桜の花が綺麗に咲いています。',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleTranslationLabel'),
          name: t('editor.chips.exampleTranslationName'),
          sample: t('editor.chips.sampleJaExampleTranslation'),
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.partOfSpeechLabel'),
          name: t('editor.chips.partOfSpeechName'),
          sample: t('editor.chips.sampleNoun'),
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.synonymsLabel'),
          name: t('editor.chips.synonymsName'),
          sample: '同: 桜花 / 反: -',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.audioLabel'),
          name: t('editor.chips.audioName'),
          sample: '[sound:sakura.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.memoLabel'),
          name: t('editor.chips.memoName'),
          sample: t('editor.chips.sampleJaMemo'),
          size: 15,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        }
      ];
    } else if (langId === 'zh') {
      return [
        {
          label: t('editor.chips.pinyinLabel'),
          name: t('editor.chips.pinyinName'),
          sample: (langObj.sample && langObj.sample.field3) || 'nǐ hǎo',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleLabel'),
          name: t('editor.chips.exampleName'),
          sample: '你好，很高兴认识你。',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleTranslationLabel'),
          name: t('editor.chips.exampleTranslationName'),
          sample: t('editor.chips.sampleZhExampleTranslation'),
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.examplePinyinLabel'),
          name: t('editor.chips.examplePinyinName'),
          sample: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.partOfSpeechLabel'),
          name: t('editor.chips.partOfSpeechName'),
          sample: t('editor.chips.sampleZhPartOfSpeech'),
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.synonymsLabel'),
          name: t('editor.chips.synonymsName'),
          sample: '同: 问好 / 反: 再见',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.audioLabel'),
          name: t('editor.chips.audioName'),
          sample: '[sound:nihao.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.memoLabel'),
          name: t('editor.chips.memoName'),
          sample: t('editor.chips.sampleZhMemo'),
          size: 15,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        }
      ];
    } else if (langId === 'en') {
      return [
        {
          label: t('editor.chips.exampleLabel'),
          name: t('editor.chips.exampleName'),
          sample: (langObj.sample && langObj.sample.field3) || 'I eat an apple every morning.',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleTranslationLabel'),
          name: t('editor.chips.exampleTranslationName'),
          sample: t('editor.chips.sampleEnExampleTranslation'),
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.phoneticLabel'),
          name: t('editor.chips.phoneticName'),
          sample: '[ˈæpl]',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.partOfSpeechLabel'),
          name: t('editor.chips.partOfSpeechName'),
          sample: t('editor.chips.sampleNoun'),
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.synonymsLabel'),
          name: t('editor.chips.synonymsName'),
          sample: 'Syn: - / Ant: -',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.audioLabel'),
          name: t('editor.chips.audioName'),
          sample: '[sound:apple.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.memoLabel'),
          name: t('editor.chips.memoName'),
          sample: t('editor.chips.sampleEnMemo'),
          size: 15,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        }
      ];
    } else {
      return [
        {
          label: t('editor.chips.exampleLabel'),
          name: t('editor.chips.exampleName'),
          sample: (langObj.sample && langObj.sample.field3) || t('editor.chips.sampleExample', { lang: langName }),
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.exampleTranslationLabel'),
          name: t('editor.chips.exampleTranslationName'),
          sample: t('editor.chips.sampleExampleTranslation'),
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.pronunciationLabel'),
          name: t('editor.chips.pronunciationName'),
          sample: t('editor.chips.samplePronunciation'),
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.partOfSpeechLabel'),
          name: t('editor.chips.partOfSpeechName'),
          sample: t('editor.chips.samplePartOfSpeech'),
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.synonymsLabel'),
          name: t('editor.chips.synonymsName'),
          sample: t('editor.chips.sampleSynonyms'),
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.audioLabel'),
          name: t('editor.chips.audioName'),
          sample: `[sound:${langId}_audio.mp3]`,
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: t('editor.chips.memoLabel'),
          name: t('editor.chips.memoName'),
          sample: t('editor.chips.sampleMemo'),
          size: 15,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        }
      ];
    }
  }

  // 추천 필드 칩 렌더링
  function renderEditorQuickChips(langId) {
    const container = document.getElementById('editorQuickChipsList');
    const badge = document.getElementById('editorQuickChipsLangBadge');
    if (!container) return;

    const langObj = getSelectedLanguage();
    if (badge) {
      badge.textContent = t('editor.chips.langBadge', { lang: i18n.langName(langObj) });
    }

    container.innerHTML = '';
    const chips = getEditorQuickChipsForLanguage(langId);

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      btn.textContent = chip.label;
      btn.title = t('editor.chips.chipTitle', { name: chip.name });
      btn.addEventListener('click', () => {
        addOptionalField({
          name: chip.name,
          sample: chip.sample,
          showFront: chip.showFront,
          showBack: chip.showBack,
          size: chip.size,
          weight: chip.weight,
          color: chip.color,
          hasDictLink: false
        }, true);
        showToast(t('editor.toast.fieldAdded', { name: chip.name }));
      });
      container.appendChild(btn);
    });
  }

  // 각 필드의 헤더 배지 라벨 동적 갱신 (노출 위치 및 필드명과 동적 조합)
  function updateFieldBadges() {
    fields.forEach((f, idx) => {
      if (!f.badgeEl) return;
      const fNum = idx + 1;
      const fName = getFieldDisplayName(f, idx);

      let sideText = t('editor.field.sideNone');
      if (f.showFront.checked && f.showBack.checked) {
        sideText = t('editor.field.sideBoth');
      } else if (f.showFront.checked) {
        sideText = t('editor.field.sideFront');
      } else if (f.showBack.checked) {
        sideText = t('editor.field.sideBack');
      }

      let badgeText = t('editor.field.badge', { num: fNum, side: sideText, name: fName });

      if (f.hasDictLink) badgeText += ` · ${t('editor.field.dictLink')}`;
      if (f.hasWikiLink) badgeText += ` · ${getSubDictLabel()}`;
      if (f.hasTts && isTtsSupported()) badgeText += ` · ${t('editor.field.tts')}`;
      if (f.hasDictLink || f.hasWikiLink) {
        f.badgeEl.className = 'field-badge field-badge-primary';
      } else {
        f.badgeEl.className = 'field-badge';
      }
      f.badgeEl.textContent = badgeText;

      // 상단 헤더의 외국어사전 / 보조 사전 미니 토글 동기화
      if (f.dictLinkCheck) {
        f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      }
      if (f.wikiLinkCheck) {
        f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
      }
    });
    updateTtsUi();
  }

  // 🔊 읽어주기: 지금 학습 언어의 Anki 언어 코드 (읽어주기를 쓸 수 없는 언어면 빈 문자열)
  function getTtsLangCode() {
    return TTS_LANG_CODES[languageSelect.value] || '';
  }

  function isTtsSupported() {
    return Boolean(getTtsLangCode());
  }

  function getTtsSpeed() {
    const val = ttsSpeedSelect ? ttsSpeedSelect.value : DEFAULT_TTS_SPEED;
    return TTS_SPEEDS.includes(val) ? val : DEFAULT_TTS_SPEED;
  }

  // 읽어주기 토글·안내 상자 갱신 (쓸 수 없는 언어면 토글을 끄고 안내 표시, 켜 둔 값은 보관해 언어를 바꾸면 되살림)
  function updateTtsUi() {
    const supported = isTtsSupported();
    fields.forEach(f => {
      if (!f.ttsCheck) return;
      f.ttsCheck.disabled = !supported;
      f.ttsCheck.checked = supported && Boolean(f.hasTts);
      const label = f.ttsCheck.closest('label');
      if (label) {
        label.classList.toggle('is-disabled', !supported);
        label.title = supported ? t('editor.field.ttsTitle') : t('editor.field.ttsUnsupportedTitle');
      }
    });
    const anyOn = supported && fields.some(f => f.hasTts);
    if (ttsInfoBox) ttsInfoBox.classList.toggle('hidden', supported && !anyOn);
    if (ttsInfoBody) ttsInfoBody.classList.toggle('hidden', !supported);
    if (ttsUnsupportedNote) ttsUnsupportedNote.classList.toggle('hidden', supported);
    if (previewTtsNote) previewTtsNote.classList.toggle('hidden', !anyOn);
  }

  // 미리보기 🔊: 이 브라우저의 목소리로 예시값 읽기 (실제 Anki 목소리는 기기마다 다름)
  function speakPreview(idx) {
    const f = fields[idx];
    if (!f) return;
    const code = getTtsLangCode();
    const synth = window.speechSynthesis;
    if (!code || !synth || typeof window.SpeechSynthesisUtterance !== 'function') {
      showToast(t('editor.tts.noVoice'));
      return;
    }
    const lang = code.replace('_', '-'); // zh_CN → zh-CN
    const prefix = lang.split('-')[0].toLowerCase();
    const voiceLang = v => String(v.lang || '').replace('_', '-').toLowerCase();
    const voices = synth.getVoices() || [];
    const voice = voices.find(v => voiceLang(v) === lang.toLowerCase())
      || voices.find(v => voiceLang(v).split('-')[0] === prefix);
    // 목소리 목록을 아직 못 받았으면 그대로 시도, 목록이 있는데 맞는 언어가 없으면 안내
    if (voices.length && !voice) {
      showToast(t('editor.tts.noVoice'));
      return;
    }
    const text = f.sampleInput.value.trim() || getFieldDisplayName(f, idx);
    synth.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang;
    if (voice) utter.voice = voice;
    utter.rate = parseFloat(getTtsSpeed());
    synth.speak(utter);
  }

  // 고급 설정의 필드별 외국어사전 / 보조 사전 체크박스 목록 동적 갱신 (단어·예문 다중 선택 지원)
  function updateDictFieldChecklist() {
    if (!dictFieldChecklist) return;
    dictFieldChecklist.innerHTML = '';

    fields.forEach((f, idx) => {
      const fNum = idx + 1;
      const fName = getFieldDisplayName(f, idx);

      // 상단 헤더 미니 토글도 동기화
      if (f.dictLinkCheck) {
        f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      }
      if (f.wikiLinkCheck) {
        f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
      }

      const row = document.createElement('div');
      row.className = 'dict-target-item dict-target-row';

      const span = document.createElement('span');
      const recTag = (idx === 1) ? ' <span style="color: var(--primary); font-size: 0.8em; font-weight: 700;">' + t('editor.dictList.recommended') + '</span>' : '';
      span.className = 'dict-target-name';
      span.innerHTML = `<strong>${t('editor.field.numberedName', { num: fNum, name: escapeHtml(fName) })}</strong>${recTag}`;
      row.appendChild(span);

      const options = document.createElement('div');
      options.className = 'dict-target-options';

      const ttsSupported = isTtsSupported();
      [
        { type: 'dict', text: t('editor.field.dictLink'), checked: Boolean(f.hasDictLink) },
        { type: 'wiki', text: getSubDictLabel(), checked: Boolean(f.hasWikiLink) },
        { type: 'tts', text: t('editor.field.tts'), checked: ttsSupported && Boolean(f.hasTts), disabled: !ttsSupported },
      ].forEach(opt => {
        const label = document.createElement('label');
        label.className = 'custom-checkbox';
        if (opt.disabled) {
          label.classList.add('is-disabled');
          label.title = t('editor.field.ttsUnsupportedTitle');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = opt.checked;
        checkbox.disabled = Boolean(opt.disabled);
        checkbox.dataset.fieldIndex = idx;
        checkbox.addEventListener('change', () => {
          setFieldLink(f, opt.type, checkbox.checked);
        });

        const text = document.createElement('span');
        text.textContent = opt.text;

        label.appendChild(checkbox);
        label.appendChild(text);
        options.appendChild(label);
      });

      row.appendChild(options);
      dictFieldChecklist.appendChild(row);
    });
  }

  // 2. 컨트롤 이벤트 리스너 연결
  function initEventListeners() {
    languageSelect.addEventListener('change', () => onLanguageChange(true));

    resetDictUrlBtn.addEventListener('click', () => {
      const lang = getSelectedLanguage();
      dictUrlInput.value = lang.dictUrl;
      updateAll();
    });
    dictUrlInput.addEventListener('input', updateAll);
    dictUrlInput.addEventListener('change', updateAll);

    // 보조 사전 선택 → URL 자동 입력 (직접 입력은 URL을 비워 사용자가 입력)
    if (subDictSelect) {
      subDictSelect.addEventListener('change', () => {
        const sub = getSubDict();
        if (subDictSelect.value === 'custom') {
          wikiUrlInput.focus();
        } else {
          wikiUrlInput.value = sub.url;
        }
        updateSubDictLabels();
        updateFieldBadges();
        updateDictFieldChecklist();
        updateAll();
      });
    }
    if (wikiUrlInput) {
      // 프리셋 URL을 직접 고치면 '직접 입력'으로 전환
      const onSubUrlEdit = () => {
        if (subDictSelect && subDictSelect.value !== 'custom' && wikiUrlInput.value.trim() !== getSubDict().url) {
          subDictSelect.value = 'custom';
          updateSubDictLabels();
          updateFieldBadges();
          updateDictFieldChecklist();
        }
        updateAll();
      };
      wikiUrlInput.addEventListener('input', onSubUrlEdit);
      wikiUrlInput.addEventListener('change', onSubUrlEdit);
    }
    if (resetWikiUrlBtn) {
      resetWikiUrlBtn.addEventListener('click', () => {
        // 직접 입력 상태면 기본 보조 사전(국어사전)으로 복원
        if (subDictSelect && subDictSelect.value === 'custom') subDictSelect.value = DEFAULT_SUB_DICT;
        wikiUrlInput.value = getSubDict().url;
        updateSubDictLabels();
        updateFieldBadges();
        updateDictFieldChecklist();
        updateAll();
      });
    }
    linkNewTab.addEventListener('change', updateAll);
    if (linkCleanQuery) linkCleanQuery.addEventListener('change', updateAll);

    // 🔊 읽는 속도
    if (ttsSpeedSelect) ttsSpeedSelect.addEventListener('change', () => updateAll());
    // 아이콘 위치 (글자 옆 / 글자 아래)
    if (iconPositionSelect) iconPositionSelect.addEventListener('change', () => updateAll());

    // 🎨 더 꾸미기: 하나씩 바꾸기 (값을 deco에 옮기고 관련 칸 보이기/숨기기)
    Object.keys(decoControls).forEach(key => {
      const el = decoControls[key];
      if (!el) return;
      const onChange = () => {
        if (el.type === 'color') {
          const color = normalizeHexColor(el.value);
          if (!color) return;
          deco[key] = color;
        } else if (DECO_CHOICES[key] && DECO_CHOICES[key].includes(el.value)) {
          deco[key] = el.value;
        }
        syncDecoControls();
        updateAll();
      };
      el.addEventListener('change', onChange);
      if (el.type === 'color') el.addEventListener('input', onChange);
    });

    showHrAnswer.addEventListener('change', updateAll);
    keepFrontOnBack.addEventListener('change', () => {
      if (frontOnBackSettings) {
        frontOnBackSettings.style.display = keepFrontOnBack.checked ? 'block' : 'none';
      }
      updateAll();
    });

    if (frontOnBackSize) {
      frontOnBackSize.addEventListener('input', (e) => {
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = e.target.value;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = e.target.value + 'px';
        if (syncFrontSizeWithF1) syncFrontSizeWithF1.checked = false;
        updateAll();
      });
      frontOnBackSize.addEventListener('change', updateAll);
    }

    if (frontOnBackSizeNum) {
      frontOnBackSizeNum.addEventListener('input', (e) => {
        const val = Math.round(clampNumber(e.target.value, SIZE_MIN, SIZE_MAX, 24));
        if (frontOnBackSize) frontOnBackSize.value = val;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = val + 'px';
        if (syncFrontSizeWithF1) syncFrontSizeWithF1.checked = false;
        updateAll();
      });
      // 입력을 마치면 범위로 보정된 실제 적용값을 숫자 칸에도 다시 표시
      frontOnBackSizeNum.addEventListener('change', () => {
        if (frontOnBackSize) {
          frontOnBackSizeNum.value = frontOnBackSize.value;
          if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = frontOnBackSize.value + 'px';
        }
        updateAll();
      });
    }

    if (syncFrontSizeWithF1) {
      syncFrontSizeWithF1.addEventListener('change', () => {
        if (syncFrontSizeWithF1.checked && fields[0]) {
          const f1SizeVal = fields[0].sizeSlider.value;
          if (frontOnBackSize) frontOnBackSize.value = f1SizeVal;
          if (frontOnBackSizeNum) frontOnBackSizeNum.value = f1SizeVal;
          if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = f1SizeVal + 'px';
        }
        updateAll();
      });
    }

    if (frontOnBackKeepStyle) {
      frontOnBackKeepStyle.addEventListener('change', updateAll);
    }

    centerAlign.addEventListener('change', updateAll);
    rtlForce.addEventListener('change', updateAll);

    // 카드 공통 폰트 & 줄간격 이벤트
    if (cardBaseFont) {
      cardBaseFont.addEventListener('change', updateAll);
    }
    if (cardLineHeight) {
      cardLineHeight.addEventListener('input', (e) => {
        if (cardLineHeightNum) cardLineHeightNum.value = e.target.value;
        if (cardLineHeightVal) cardLineHeightVal.textContent = e.target.value;
        updateAll();
      });
      cardLineHeight.addEventListener('change', updateAll);
    }
    if (cardLineHeightNum) {
      cardLineHeightNum.addEventListener('input', (e) => {
        const val = clampNumber(e.target.value, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX, 1.5);
        if (cardLineHeight) cardLineHeight.value = val;
        // 슬라이더 단계(0.1)로 맞춰진 실제 적용값을 표시
        if (cardLineHeightVal) cardLineHeightVal.textContent = cardLineHeight ? cardLineHeight.value : val;
        updateAll();
      });
      // 입력을 마치면 범위로 보정된 실제 적용값을 숫자 칸에도 다시 표시
      cardLineHeightNum.addEventListener('change', () => {
        if (cardLineHeight) {
          cardLineHeightNum.value = cardLineHeight.value;
          if (cardLineHeightVal) cardLineHeightVal.textContent = cardLineHeight.value;
        }
        updateAll();
      });
    }

    // 필드 컨트롤 동기화 (기본 필드 1, 2)
    fields.forEach(f => bindFieldEvents(f));

    // 필드 추가 버튼
    const addFieldBtn = document.getElementById('addFieldBtn');
    if (addFieldBtn) {
      addFieldBtn.addEventListener('click', () => {
        addOptionalField(null, true);
        showToast(t('editor.toast.fieldAddedNumbered', { num: fields.length }));
      });
    }

    // 미리보기 탭 전환
    tabFrontPreview.addEventListener('click', () => {
      currentPreviewSide = 'front';
      tabFrontPreview.classList.add('active');
      tabBackPreview.classList.remove('active');
      renderPreview();
    });

    tabBackPreview.addEventListener('click', () => {
      currentPreviewSide = 'back';
      tabBackPreview.classList.add('active');
      tabFrontPreview.classList.remove('active');
      renderPreview();
    });

    // 뒤집기 버튼
    flipCardBtn.addEventListener('click', () => {
      if (currentPreviewSide === 'front') {
        currentPreviewSide = 'back';
        tabBackPreview.classList.add('active');
        tabFrontPreview.classList.remove('active');
      } else {
        currentPreviewSide = 'front';
        tabFrontPreview.classList.add('active');
        tabBackPreview.classList.remove('active');
      }
      renderPreview();
    });

    // 다크모드 토글
    toggleDarkModeBtn.addEventListener('click', () => {
      ankiCardWrapper.classList.toggle('dark-mode');
      const isDark = ankiCardWrapper.classList.contains('dark-mode');
      toggleDarkModeBtn.textContent = isDark ? '☀️' : '🌙';
      toggleDarkModeBtn.title = isDark ? t('editor.preview.toLightMode') : t('editor.preview.toDarkMode');
      renderPreview();
    });

    // 복사 버튼 (복사에 성공하면 해당 단계에 ✓ 표시)
    const bindCopy = (btn, step, labelKey) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const text = step.codeEl.textContent;
        copyToClipboard(text, t(labelKey), () => {
          step.copiedText = text;
          refreshPasteSteps();
        });
      });
    };
    bindCopy(copyFrontBtn, pasteSteps[0], 'editor.code.copyFrontLabel');
    bindCopy(copyBackBtn, pasteSteps[1], 'editor.code.copyBackLabel');
    bindCopy(copyCssBtn, pasteSteps[2], 'editor.code.copyCssLabel');

    // 모바일 화면 전환 로직 (<= 768px 모바일 전용 탭 네비게이션 & 좌우 전환 플로팅 버튼)
    const btnMobileEditTab = document.getElementById('btnMobileEditTab');
    const btnMobilePreviewTab = document.getElementById('btnMobilePreviewTab');
    const btnGoPreviewMobile = document.getElementById('btnGoPreviewMobile');
    const btnGoEditMobile = document.getElementById('btnGoEditMobile');
    const btnFloatToPreview = document.getElementById('btnFloatToPreview');
    const btnFloatToEdit = document.getElementById('btnFloatToEdit');
    const editorPanel = document.querySelector('.editor-panel');
    const previewPanel = document.querySelector('.preview-panel');

    // keepScroll === true 이면 스크롤 위치 유지 (resize 등 사용자 전환이 아닌 경우)
    function showMobileEditView(keepScroll) {
      if (window.innerWidth <= 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.add('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.add('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.remove('active');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'inline-flex';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'none';
        if (keepScroll !== true) window.scrollTo(0, 0);
      }
    }

    function showMobilePreviewView(keepScroll) {
      if (window.innerWidth <= 768) {
        editorPanel.classList.add('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.remove('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.add('active');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'none';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'inline-flex';
        if (keepScroll !== true) window.scrollTo(0, 0);
      }
    }

    if (btnMobileEditTab) btnMobileEditTab.addEventListener('click', showMobileEditView);
    if (btnMobilePreviewTab) btnMobilePreviewTab.addEventListener('click', showMobilePreviewView);
    if (btnGoPreviewMobile) btnGoPreviewMobile.addEventListener('click', showMobilePreviewView);
    if (btnGoEditMobile) btnGoEditMobile.addEventListener('click', showMobileEditView);
    if (btnFloatToPreview) btnFloatToPreview.addEventListener('click', showMobilePreviewView);
    if (btnFloatToEdit) btnFloatToEdit.addEventListener('click', showMobileEditView);

    // 모바일에서 위로 스크롤하면 주소창이 다시 나타나며 높이만 바뀌는 resize가 발생하므로
    // 너비가 바뀐 경우에만 처리하고, 이때도 스크롤 위치는 유지한다
    let lastViewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastViewportWidth) return;
      lastViewportWidth = window.innerWidth;

      if (window.innerWidth > 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'none';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'none';
      } else {
        if (btnMobilePreviewTab && btnMobilePreviewTab.classList.contains('active')) {
          showMobilePreviewView(true);
        } else {
          showMobileEditView(true);
        }
      }
    });

    // 전체 설정 초기화 버튼 (머리글)
    const resetAllSettingsBtn = document.getElementById('resetAllSettingsBtn');
    if (resetAllSettingsBtn) {
      resetAllSettingsBtn.addEventListener('click', resetAllSettings);
    }
    // 묶음별 초기화 버튼 (📝 ② 필드 아래 · 🎨 더 꾸미기 안)
    const resetContentBtn = document.getElementById('resetContentBtn');
    if (resetContentBtn) resetContentBtn.addEventListener('click', resetContentSettings);
    const resetDesignBtn = document.getElementById('resetDesignBtn');
    if (resetDesignBtn) resetDesignBtn.addEventListener('click', resetDesignSettings);

    if (window.innerWidth <= 768) {
      showMobileEditView();
    }
  }

  // 다크모드 대응 색상 자동 계산 함수 (어두운 색상 -> 밝은 고대비 색상으로 지능형 반전)
  function getDarkModeColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') return '#f8fafc';
    let hex = hexColor.trim().replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) return '#f8fafc';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 상대 휘도 (Perceived Luminance)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

    // 채도 (Saturation)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // 1. 아주 어두운 검정 계열 (black, dark gray, #202124 등) -> 선명한 크림 화이트
    if (luminance < 75) {
      return '#f8fafc';
    }

    // 2. 무채색 회색 계열 (채도가 낮음) -> 은은한 밝은 실버 그레이
    if (saturation < 0.2) {
      return luminance < 140 ? '#e2e8f0' : '#f1f5f9';
    }

    // 3. 유채색 (파랑, 빨강, 초록, 보라 등) -> 다크 배경(#2f2f31)에서 눈에 잘 띄는 고대비 밝은 톤으로 보정
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const cMax = Math.max(rNorm, gNorm, bNorm);
    const cMin = Math.min(rNorm, gNorm, bNorm);
    const delta = cMax - cMin;

    let h = 0;
    if (delta !== 0) {
      if (cMax === rNorm) h = ((gNorm - bNorm) / delta) % 6;
      else if (cMax === gNorm) h = (bNorm - rNorm) / delta + 2;
      else h = (rNorm - gNorm) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    let l = (cMax + cMin) / 2;
    let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // 다크모드 시 가독성을 위해 명도를 최소 68% 이상으로 상향
    const targetL = Math.max(l, 0.68);
    const targetS = Math.min(Math.max(s, 0.65), 0.95);

    return hslToHex(h, targetS, targetL);
  }

  function hslToHex(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    const toHex = val => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ===== 🎨 더 꾸미기: 색 계산 도우미 =====
  function hexToRgb(hex) {
    const v = normalizeHexColor(hex) || '#ffffff';
    return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  }

  // 밝기 (0~255, getDarkModeColor와 같은 계산)
  function getLuminance(hex) {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function isDarkColor(hex) {
    return getLuminance(hex) < 128;
  }

  // 두 색 섞기 (ratio: 두 번째 색 비율 0~1)
  function mixHex(a, b, ratio) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * ratio).toString(16).padStart(2, '0')).join('');
  }

  function hexToRgba(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 두 색의 명암 대비 (WCAG 방식, 1~21)
  function getContrastRatio(a, b) {
    const lum = hex => {
      const [r, g, b2] = hexToRgb(hex).map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  // 어두운 바탕 위 글자색이 너무 흐리면 흰색 쪽으로 조금씩 밝힘
  function ensureContrast(color, background, minRatio) {
    let result = color;
    for (let i = 1; i <= 10 && getContrastRatio(result, background) < minRatio; i++) {
      result = mixHex(color, '#ffffff', i * 0.1);
    }
    return result;
  }

  // 같은 색 계열에서 밝기만 바꾼 색 (밝은 테마의 다크모드 배경·상자용, 채도는 maxSat 이하로 차분하게)
  function toNightTone(hex, lightness, maxSat = 0.35) {
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      if (h >= 360) h -= 360;
    }
    return hslToHex(h, Math.min(s, maxSat), lightness);
  }

  // 꾸민 카드의 다크모드 글자색: 이미 밝은 색은 그대로, 어두운 색은 같은 색 계열에서 밝게 (채도는 원래 값 유지)
  function getNightFieldColor(hex) {
    if (getLuminance(hex) >= 150) return normalizeHexColor(hex) || '#f8fafc';
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    return toNightTone(hex, s < 0.25 ? 0.8 : 0.72, s < 0.25 ? 0.15 : 0.85);
  }

  // 꾸미기 설정이 기본값 그대로인지 (테마 이름은 제외하고 실제 모양만 비교)
  function isDecoDefault(d = deco) {
    return Object.keys(DECO_DEFAULTS).every(key => key === 'theme' || d[key] === DECO_DEFAULTS[key]);
  }

  // 카드 모양 계산 (isNight: Anki 다크모드)
  // 어두운 바탕(고급 다크 · 칠판 등)은 다크모드에서도 그대로, 밝은 바탕은 같은 색 계열의 어두운 색으로 바꾸고 글자색은 밝게 보정
  function getDecoLook(isNight, d = deco) {
    const hasBox = d.box !== 'none';
    const bgAvg = d.bgType === 'gradient' ? mixHex(d.bgColor, d.bgColor2, 0.5) : d.bgColor;
    const surfaceDark = isDarkColor(hasBox ? d.boxColor : bgAvg);

    // 필드 밖 글자색: 바탕과 대비가 안 되면 자동으로 바꿈
    let text = d.textColor;
    if (surfaceDark && isDarkColor(text)) text = '#f1f5f9';
    if (!surfaceDark && !isDarkColor(text)) text = '#202124';

    const look = {
      hasBox,
      hasWrapper: hasBox || d.border !== 'none',
      surfaceDark,
      text,
      bgColor: d.bgColor,
      bgColor2: d.bgColor2,
      boxColor: d.boxColor,
      borderColor: d.borderColor,
      dividerColor: d.dividerColor,
      shadow: '0 6px 24px rgba(15, 23, 42, 0.12)',
      fieldColor: color => color,
    };
    if (!isNight) return look;

    if (!isDarkColor(bgAvg)) {
      // 기본 흰 바탕은 예전과 같은 다크모드 색 (#2f2f31)
      look.bgColor = (d.bgType === 'solid' && d.bgColor === '#ffffff')
        ? '#2f2f31'
        : toNightTone(d.bgColor, d.bgType === 'gradient' ? 0.14 : 0.13);
      if (d.bgType === 'gradient') look.bgColor2 = toNightTone(d.bgColor2, 0.09);
      else if (d.bgType === 'pattern') look.bgColor2 = d.bgPattern === 'fiber' ? toNightTone(d.bgColor2, 0.7, 0.3) : toNightTone(d.bgColor2, 0.3, 0.3);
    }
    if (hasBox && !isDarkColor(d.boxColor)) {
      // 표 모양은 차분한 진회색 시트, 나머지 상자는 배경과 어울리는 어두운 색
      look.boxColor = d.box === 'sheet'
        ? toNightTone(d.boxColor, 0.12, 0.05)
        : toNightTone(mixHex(d.boxColor, bgAvg, 0.5), 0.18);
      look.shadow = '0 6px 24px rgba(0, 0, 0, 0.45)';
    }
    if (!surfaceDark) {
      const nightSurface = hasBox ? look.boxColor : look.bgColor;
      const nightLine = color => (getLuminance(color) >= 140
        ? mixHex(color, nightSurface, 0.6)
        : mixHex(getDarkModeColor(color), nightSurface, 0.3));
      look.text = '#f8fafc';
      // 꾸민 카드는 바탕색이 다양하므로 글자가 충분히 또렷해질 때까지(대비 4.5 이상) 더 밝게 보정
      // (꾸미기 기본값이면 예전과 같은 색 그대로)
      // 원래 채도를 살려(연한 회색은 연한 회색 그대로) 밝기만 올림 → 테마 분위기 유지
      look.fieldColor = isDecoDefault(d)
        ? color => getDarkModeColor(color)
        : color => ensureContrast(getNightFieldColor(color), nightSurface, 4.5);
      look.borderColor = nightLine(d.borderColor);
      look.dividerColor = d.dividerColor === DECO_DEFAULTS.dividerColor ? '#4b5563' : nightLine(d.dividerColor);
    }
    return look;
  }

  // 은은한 무늬 (그림 파일 없이 CSS 그라데이션만 사용 → 인터넷 없이도 보임)
  function getPatternCss(pattern, color) {
    switch (pattern) {
      case 'grid':
        return { image: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, size: '22px 22px' };
      case 'lines':
        return { image: `linear-gradient(transparent 31px, ${color} 31px)`, size: '100% 32px' };
      case 'fiber':
        // 한지 결: 엇갈린 가는 결 + 군데군데 옅은 얼룩
        return {
          image: [
            `repeating-linear-gradient(115deg, ${hexToRgba(color, 0.06)} 0 1px, transparent 1px 7px)`,
            `repeating-linear-gradient(35deg, ${hexToRgba(color, 0.05)} 0 1px, transparent 1px 11px)`,
            `radial-gradient(circle at 25% 20%, ${hexToRgba(color, 0.1)}, transparent 45%)`,
            `radial-gradient(circle at 80% 75%, ${hexToRgba(color, 0.08)}, transparent 50%)`,
          ].join(', '),
          size: '',
        };
      default:
        return { image: `radial-gradient(${color} 1.2px, transparent 1.6px)`, size: '18px 18px' };
    }
  }

  // 배경 색 (그라데이션은 끝 색을 바탕색으로 두어 카드가 길어져도 자연스럽게 이어지게)
  function getBackgroundColor(look, d = deco) {
    return d.bgType === 'gradient' ? look.bgColor2 : look.bgColor;
  }

  // 배경 그림 선언 목록 (background-color 제외, 단색이면 빈 목록)
  // forAnki: Anki 카드는 그라데이션을 화면에 고정해 길게 스크롤해도 끊기지 않게
  function getBackgroundImageDecls(look, d = deco, forAnki = true) {
    if (d.bgType === 'gradient') {
      const decls = [`background-image: linear-gradient(${BG_DIR_CSS[d.bgDir] || 'to bottom'}, ${look.bgColor}, ${look.bgColor2});`];
      if (forAnki) decls.push('background-attachment: fixed;', 'background-repeat: no-repeat;');
      return decls;
    }
    if (d.bgType === 'pattern') {
      const p = getPatternCss(d.bgPattern, look.bgColor2);
      return p.size ? [`background-image: ${p.image};`, `background-size: ${p.size};`] : [`background-image: ${p.image};`];
    }
    return [];
  }

  // 구분선 (hr#answer) 선 모양
  function getDividerCss(color, d = deco) {
    const line = { solid: '1px solid', dashed: '2px dashed', double: '3px double' }[d.divider] || '1px solid';
    return `${line} ${color}`;
  }

  // 📊 표 모양 (스프레드시트) 색: 칸 선 · 머리글(열 글자·행 번호)
  const SHEET_COL = 80; // 칸 너비 (px)
  const SHEET_ROW = 24; // 칸 높이 (px)
  const SHEET_HEAD = 40; // 행 번호 띠 너비 (px)
  function getSheetColors(look) {
    const box = look.boxColor;
    const dark = isDarkColor(box);
    return {
      line: dark ? mixHex(box, '#ffffff', 0.12) : mixHex(box, '#000000', 0.12),
      head: dark ? mixHex(box, '#ffffff', 0.07) : mixHex(box, '#000000', 0.045),
      headText: dark ? '#a3a3a3' : '#666666',
    };
  }

  // 표 모양의 칸 선 (상자 배경 그림)
  function getSheetGridImage(line) {
    return `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`;
  }

  // 표 모양 꾸밈 규칙: 위쪽 열 글자(A B C…) · 왼쪽 행 번호(1 2 3…) (필드는 모두 보통 칸처럼 보임)
  // 장식은 ::before / ::after 가짜 요소라서 선택·복사되지 않고, 사전 아이콘 스크립트·읽어주기 버튼에 영향 없음
  // prefixes: 선택자 앞부분 ('' = 밝은 화면, '.nightMode ' 등 = 다크모드, '#liveCardRender ' = 미리보기)
  // withLayout: 위치·크기 같은 모양 규칙도 넣을지 (다크모드는 색만 바꿈)
  function getSheetCss(look, prefixes, withLayout) {
    const c = getSheetColors(look);
    const sel = suffix => prefixes.map(pre => `${pre}.card-box${suffix}`).join(',\n');
    const rules = [];
    if (withLayout) {
      const cols = 'A B C D E F G H I J K L M N';
      const rows = Array.from({ length: 60 }, (_, i) => i + 1).join('\\A ');
      rules.push(`${sel('::before')},
${sel('::after')} {
  position: absolute;
  box-sizing: border-box;
  direction: ltr;
  font-family: 'Segoe UI', 'Malgun Gothic', sans-serif;
  font-size: 11px;
  font-weight: normal;
  font-style: normal;
  overflow: hidden;
  white-space: pre;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}`);
      rules.push(`${sel('::before')} {
  content: "${cols}";
  top: 0;
  left: 0;
  right: 0;
  height: ${SHEET_ROW}px;
  line-height: ${SHEET_ROW - 1}px;
  text-align: left;
  padding-left: ${SHEET_HEAD + SHEET_COL / 2 - 4}px;
  word-spacing: ${SHEET_COL - 11}px;
  background-size: ${SHEET_COL}px 100%;
  background-position: ${SHEET_HEAD}px 0;
  border-bottom: 1px solid;
}`);
      rules.push(`${sel('::after')} {
  content: "${rows}";
  top: ${SHEET_ROW}px;
  left: 0;
  bottom: 0;
  width: ${SHEET_HEAD}px;
  line-height: ${SHEET_ROW}px;
  text-align: center;
  background-size: 100% ${SHEET_ROW}px;
  border-right: 1px solid;
}`);
    }
    rules.push(`${sel('::before')} {
  background-color: ${c.head};
  background-image: linear-gradient(90deg, ${c.line} 1px, transparent 1px);
  color: ${c.headText};
  border-color: ${c.line};
}`);
    rules.push(`${sel('::after')} {
  background-color: ${c.head};
  background-image: linear-gradient(${c.line} 1px, transparent 1px);
  color: ${c.headText};
  border-color: ${c.line};
}`);
    return rules.join('\n\n');
  }

  // 카드 상자 (.card-box) 선언 목록: 둥근 카드 · 그림자 · 테두리 · 표 모양
  function getCardBoxDecls(look, d = deco) {
    if (d.box === 'sheet') {
      const c = getSheetColors(look);
      const decls = [
        'box-sizing: border-box;', 'position: relative;', 'max-width: 720px;', 'min-height: 192px;', 'margin: 0 auto;',
        `padding: ${SHEET_ROW + 10}px 14px 14px ${SHEET_HEAD + 14}px;`, 'overflow: hidden;',
        `background-color: ${look.boxColor};`, `background-image: ${getSheetGridImage(c.line)};`,
        `background-size: ${SHEET_COL}px ${SHEET_ROW}px;`, `background-position: ${SHEET_HEAD}px ${SHEET_ROW}px;`,
        `border: 1px solid ${c.line};`,
      ];
      if (d.border === 'thin') decls.push(`outline: 1px solid ${look.borderColor};`);
      if (d.border === 'thick') decls.push(`outline: 3px solid ${look.borderColor};`);
      if (d.border === 'left') decls.push(`border-left: 6px solid ${look.borderColor};`);
      return decls;
    }
    const decls = ['box-sizing: border-box;', 'max-width: 560px;', 'margin: 0 auto;'];
    if (look.hasBox) {
      decls.push('padding: 1.5rem 1.25rem;', 'border-radius: 16px;', `background-color: ${look.boxColor};`);
      if (d.box === 'shadow') decls.push(`box-shadow: ${look.shadow};`);
    } else {
      decls.push('padding: 1rem 1.25rem;');
      if (d.border === 'thin' || d.border === 'thick') decls.push('border-radius: 6px;');
    }
    if (d.border === 'thin') decls.push(`border: 1px solid ${look.borderColor};`);
    if (d.border === 'thick') decls.push(`border: 3px solid ${look.borderColor};`);
    if (d.border === 'left') decls.push(`border-left: 6px solid ${look.borderColor};`);
    return decls;
  }

  // 카드 상자를 쓰면 앞면·뒷면 내용을 <div class="card-box">로 감쌈
  function wrapCardBox(content) {
    return getDecoLook(false).hasWrapper ? `<div class="card-box">\n${content}\n</div>` : content;
  }

  // 꾸미기 컨트롤 화면 갱신 (값 표시 · 관련 칸만 보이기 · 테마 버튼 선택 표시)
  function syncDecoControls() {
    Object.keys(decoControls).forEach(key => {
      const el = decoControls[key];
      if (el && document.activeElement !== el) el.value = deco[key];
    });
    const toggleRow = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !show);
    };
    toggleRow('decoBgColor2Row', deco.bgType !== 'solid');
    toggleRow('decoBgColor2LabelGradient', deco.bgType === 'gradient');
    toggleRow('decoBgColor2LabelPattern', deco.bgType === 'pattern');
    toggleRow('decoBgDirRow', deco.bgType === 'gradient');
    toggleRow('decoBgPatternRow', deco.bgType === 'pattern');
    toggleRow('decoBoxColorRow', deco.box !== 'none');
    toggleRow('decoBorderColorRow', deco.border !== 'none');
    if (themeSwatches) {
      themeSwatches.querySelectorAll('.theme-swatch').forEach(btn => {
        const active = btn.dataset.theme === deco.theme;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  // 테마 미리보기 버튼 (작은 카드 모양: 배경 · 상자 · 글자색 · 이름)
  function renderThemeSwatches() {
    if (!themeSwatches) return;
    themeSwatches.innerHTML = '';
    THEMES.forEach(theme => {
      const d = { ...DECO_DEFAULTS, ...theme.deco };
      const look = getDecoLook(false, d);
      const bgStyle = [`background-color: ${getBackgroundColor(look, d)};`, ...getBackgroundImageDecls(look, d, false)];
      if (d.bgType === 'pattern' && d.bgPattern === 'lines') bgStyle.push('background-size: 100% 12px;');
      // 작은 버튼에 맞게 줄인 상자 · 테두리 · 구분선
      const boxStyle = [];
      if (look.hasBox) boxStyle.push(`background-color: ${look.boxColor};`, 'border-radius: 6px;');
      if (d.box === 'shadow') boxStyle.push('box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);');
      if (!look.hasBox && (d.border === 'thin' || d.border === 'thick')) boxStyle.push('border-radius: 4px;');
      if (d.border === 'thin') boxStyle.push(`border: 1px solid ${look.borderColor};`);
      if (d.border === 'thick') boxStyle.push(`border: 2px solid ${look.borderColor};`);
      if (d.border === 'left') boxStyle.push(`border-left: 3px solid ${look.borderColor};`);
      if (d.box === 'sheet') {
        // 표 모양: 작은 칸 선 + 위·왼쪽 머리글 띠
        const c = getSheetColors(look);
        boxStyle.push(`background-image: ${getSheetGridImage(c.line)};`, 'background-size: 16px 8px;', 'border-radius: 0;',
          `box-shadow: inset 0 6px 0 ${c.head}, inset 7px 0 0 ${c.head};`, `outline: 1px solid ${c.line};`);
      }
      const lineStyle = `${{ solid: '1px solid', dashed: '1px dashed', double: '3px double' }[d.divider]} ${look.dividerColor}`;
      const name = t(`editor.theme.${theme.id}`);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-swatch';
      btn.dataset.theme = theme.id;
      btn.title = t('editor.deco.themeApplyTitle', { name });
      btn.innerHTML = `<span class="theme-swatch-card" style="${escapeHtml(bgStyle.join(' '))}">`
        // 견본 글자(가 A)는 CSS 가짜 요소로 그려 버튼 이름 글자에 섞이지 않게 함 (editor.css .theme-swatch-box)
        + `<span class="theme-swatch-box" style="${escapeHtml(boxStyle.join(' '))} font-family: ${escapeHtml(getFontFamilyCss(theme.font))}; --swatch-main: ${theme.colors[0]}; --swatch-accent: ${theme.colors[1]};">`
        + `<span class="theme-swatch-line" style="border-top: ${lineStyle};"></span>`
        + `</span></span><span class="theme-swatch-name">${theme.icon} ${escapeHtml(name)}</span>`;
      btn.addEventListener('click', () => applyTheme(theme.id));
      themeSwatches.appendChild(btn);
    });
  }

  // 테마 적용: 꾸미기 설정 · 카드 글꼴 · 필드 색을 한 번에 바꿈 (적용 후에도 하나씩 더 고칠 수 있음)
  function applyTheme(themeId) {
    const theme = THEMES.find(th => th.id === themeId) || THEMES[0];
    Object.assign(deco, DECO_DEFAULTS, theme.deco, { theme: theme.id });
    if (cardBaseFont) cardBaseFont.value = theme.font;
    fields.forEach((f, idx) => {
      const color = theme.colors[Math.min(idx, 2)];
      f.colorInput.value = color;
      f.colorText.value = color;
      if (theme.sizes) {
        // 글씨 크기는 기존 슬라이더 이벤트로 바꿔 숫자 칸·뒷면 문제 크기 맞추기도 함께 처리
        f.sizeSlider.value = theme.sizes[Math.min(idx, 2)];
        f.sizeSlider.dispatchEvent(new Event('input'));
      }
    });
    syncDecoControls();
    updateAll();
    showToast(t('editor.deco.themeApplied', { name: t(`editor.theme.${theme.id}`) }));
  }

  // 저장본의 꾸미기 설정 복원 (형식이 맞지 않는 값은 기본값)
  function restoreDeco(saved) {
    Object.assign(deco, DECO_DEFAULTS);
    if (!saved || typeof saved !== 'object') return;
    if (THEMES.some(th => th.id === saved.theme)) deco.theme = saved.theme;
    Object.keys(DECO_CHOICES).forEach(key => {
      if (DECO_CHOICES[key].includes(saved[key])) deco[key] = saved[key];
    });
    DECO_COLOR_KEYS.forEach(key => {
      const color = normalizeHexColor(saved[key]);
      if (color) deco[key] = color;
    });
  }

  // 3. 필드 렌더 마크업 생성 헬퍼
  // 필드 글씨 서식 선언 목록 (미리보기 인라인 스타일과 생성 CSS의 .f-field-N 규칙이 같은 값을 쓰도록 공유)
  function getFieldStyleDecls(field, colorOverride) {
    const decls = [];
    const size = field.sizeSlider.value;
    const weight = field.weightSelect.value;
    const fieldFontCss = getFieldFontCss(field);
    if (size) decls.push(`font-size: ${size}px;`);
    if (fieldFontCss) decls.push(`font-family: ${fieldFontCss};`);
    if (weight && weight !== 'normal') decls.push(`font-weight: ${weight};`);
    decls.push(`color: ${colorOverride || field.colorInput.value};`);
    decls.push('margin-bottom: 8px;');
    return decls;
  }

  // 뒷면 상단 앞면 내용(.front-preview-hint) 서식 값
  function getFrontHintStyle() {
    const f1 = fields[0];
    const keepStyle = Boolean(frontOnBackKeepStyle && frontOnBackKeepStyle.checked);
    return {
      size: frontOnBackSize ? frontOnBackSize.value : f1.sizeSlider.value,
      weight: keepStyle ? f1.weightSelect.value : 'normal',
      color: keepStyle ? f1.colorInput.value : deco.mutedColor,
      fontCss: getFieldFontCss(f1),
    };
  }

  // 뒷면 상단 앞면 내용 서식 선언 목록 (미리보기·생성 CSS 공용)
  function getFrontHintDecls(colorOverride) {
    const s = getFrontHintStyle();
    const decls = [`color: ${colorOverride || s.color};`, `font-size: ${s.size}px;`];
    if (s.weight !== 'normal') decls.push(`font-weight: ${s.weight};`);
    if (s.fontCss) decls.push(`font-family: ${s.fontCss};`);
    decls.push('margin-bottom: 8px;');
    return decls;
  }

  function getIconPosition() {
    const val = iconPositionSelect ? iconPositionSelect.value : DEFAULT_ICON_POSITION;
    return ICON_POSITIONS.includes(val) ? val : DEFAULT_ICON_POSITION;
  }

  // 아이콘 묶음(.field-icons) 선언 목록
  // 글자 옆: 한 덩어리로 붙어 있다가 자리가 모자라면 묶음째 다음 줄로 (아이콘끼리 끼어들지 않음)
  // 글자 아래: 필드 글자 바로 아래 따로 한 줄, 카드 글자 정렬과 같게 (가운데 정렬이면 가운데, 아니면 글 시작 쪽)
  function getFieldIconsDecls() {
    if (getIconPosition() === 'below') {
      return ['display: flex;', 'flex-wrap: wrap;', 'align-items: center;',
        `justify-content: ${centerAlign.checked ? 'center' : 'flex-start'};`, 'margin-top: 0.3em;'];
    }
    return ['display: inline-flex;', 'align-items: center;', 'vertical-align: middle;', 'white-space: nowrap;', 'margin: 0 0.25em;'];
  }

  // 미리보기용 아이콘 묶음 (아이콘이 없으면 빈 문자열)
  function wrapPreviewIcons(iconsHtml) {
    return iconsHtml ? `<span class="field-icons" style="${escapeHtml(getFieldIconsDecls().join(' '))}">${iconsHtml}</span>` : '';
  }

  function buildFieldBlock(field, isForPreview = false, fieldIndex = 1) {
    const idx = fieldIndex - 1;

    if (isForPreview) {
      // 미리보기는 생성된 CSS를 불러오지 않으므로 같은 서식을 인라인 스타일로 적용
      const sampleValue = field.sampleInput.value.trim() || getFieldDisplayName(field, idx);
      const isDarkMode = Boolean(ankiCardWrapper && ankiCardWrapper.classList.contains('dark-mode'));
      const color = getDecoLook(isDarkMode).fieldColor(field.colorInput.value);
      const divStyle = getFieldStyleDecls(field, color).join(' ');
      return `<div class="field-item f-field-${fieldIndex}" style="${escapeHtml(divStyle)}">${escapeHtml(sampleValue)}${wrapPreviewIcons(buildPreviewLinkButtons(field, sampleValue) + buildPreviewTtsButton(field, idx))}</div>`;
    }

    // Anki 서식: 스타일은 생성 CSS(.f-field-N)에만 두어 Anki [스타일] 탭에서 고칠 수 있게 함
    return `<div class="field-item f-field-${fieldIndex}">${buildAnkiFieldContent(field, idx)}</div>`;
  }

  // Anki 읽어주기 태그 ({{tts zh_CN:Back}} · 속도가 보통이 아니면 speed= 추가), 꺼져 있거나 쓸 수 없는 언어면 빈 문자열
  function buildTtsTag(field, idx) {
    if (!field.hasTts) return '';
    const code = getTtsLangCode();
    if (!code) return '';
    const speed = getTtsSpeed();
    const opts = speed === DEFAULT_TTS_SPEED ? code : `${code} speed=${speed}`;
    return `<span class="tts-btn">{{tts ${opts}:${getAnkiFieldName(field, idx)}}}</span>`;
  }

  // 미리보기용 🔊 버튼 (누르면 이 브라우저 목소리로 예시값을 읽음)
  // 실제 Anki 카드의 읽어주기 버튼(.tts-btn .replay-button → 🔊)과 같은 크기 · 모양으로 보이게 사전 아이콘과 같은 스타일 사용
  function buildPreviewTtsButton(field, idx) {
    if (!field.hasTts || !isTtsSupported()) return '';
    const title = escapeHtml(t('editor.tts.previewTitle'));
    return `<button type="button" class="preview-tts-btn" data-tts-field="${idx}" title="${title}" aria-label="${title}" style="${LINK_BTN_DECLS.join(' ')}">🔊</button>`;
  }

  // 링크 검색어 정리: [품사]·(괄호) 내용 제거, 뜻이 여러 개면 첫 번째 뜻만 사용
  // (미리보기와 Anki 카드 스크립트가 같은 규칙을 쓰도록 정규식을 공유)
  const LINK_QUERY_STRIP_RE = String.raw`\[[^\]]*\]|\([^)]*\)|（[^）]*）`;
  const LINK_QUERY_SPLIT_RE = String.raw`[,;，、；]`;

  function cleanLinkQuery(text) {
    const cleaned = String(text || '')
      .replace(new RegExp(LINK_QUERY_STRIP_RE, 'g'), '')
      .split(new RegExp(LINK_QUERY_SPLIT_RE))[0]
      .trim();
    return cleaned || String(text || '').trim();
  }

  // Anki 카드에서 실행되는 링크 주소 생성 스크립트
  // 같은 필드 블록의 .link-src 텍스트(재생 버튼·오디오 제외)로 검색어를 만들어 아이콘 링크 주소(data-base + 검색어)를 채움
  function buildLinkQueryScript(shouldClean) {
    return `<script>
(function () {
  var clean = ${shouldClean ? 'true' : 'false'};
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  each(document.querySelectorAll('.link-src'), function (src) {
    var copy = src.cloneNode(true);
    each(copy.querySelectorAll('.replay-button, audio, script, style'), function (el) { el.parentNode.removeChild(el); });
    each(copy.querySelectorAll('br, div, p, li'), function (el) { el.parentNode.insertBefore(document.createTextNode(' '), el); });
    var raw = copy.textContent.replace(/\\s+/g, ' ').trim();
    var q = clean ? (raw.replace(/${LINK_QUERY_STRIP_RE}/g, '').split(/${LINK_QUERY_SPLIT_RE}/)[0].trim() || raw) : raw;
    each(src.parentNode.querySelectorAll('.link-btn[data-base]'), function (a) {
      a.setAttribute('href', a.getAttribute('data-base') + encodeURIComponent(q));
    });
  });
})();
</script>`;
  }

  // 링크가 하나라도 있으면 링크 주소 생성 스크립트를 서식 끝에 붙임
  function withLinkQueryScript(template) {
    return template.includes('class="link-src"')
      ? `${template}\n\n${buildLinkQueryScript(Boolean(linkCleanQuery && linkCleanQuery.checked))}`
      : template;
  }

  // 필드에 붙일 외국어사전 / 보조 사전 링크 목록 (http/https 주소만, 비었거나 잘못된 주소는 제외)
  function getLinkTargets(field) {
    const linkTargets = [];
    if (field.hasDictLink) {
      linkTargets.push({ cls: 'dict-btn', icon: '🌐', title: t('editor.link.dictTitle'), url: dictUrlInput.value.trim() });
    }
    if (field.hasWikiLink) {
      const sub = getSubDict();
      linkTargets.push({ cls: 'subdict-btn', icon: sub.icon, title: t('editor.link.subDictTitle', { name: sub.name }), url: wikiUrlInput ? wikiUrlInput.value.trim() : sub.url });
    }
    return linkTargets.filter(target => isHttpUrl(target.url));
  }

  // 미리보기용 아이콘 링크: 예시값으로 실제 검색 링크 생성
  function buildPreviewLinkButtons(field, sampleValue) {
    const linkTargets = getLinkTargets(field);
    if (linkTargets.length === 0) return '';

    const targetAttr = linkNewTab.checked ? ' target="_blank"' : '';
    const shouldClean = Boolean(linkCleanQuery && linkCleanQuery.checked);
    const query = shouldClean ? cleanLinkQuery(sampleValue) : sampleValue;
    return linkTargets.map(target =>
      `<a class="link-btn ${target.cls}" href="${escapeHtml(target.url + encodeURIComponent(query))}"${targetAttr} title="${escapeHtml(target.title)}" style="${LINK_BTN_DECLS.join(' ')}">${target.icon}</a>`
    ).join('');
  }

  // Anki 서식용 필드 내용: 링크가 있으면 필드 값을 .link-src로 감싸고, 아이콘은 필드가 비어 있지 않을 때만 표시
  // (href에는 사전 주소만 넣고, 검색어는 카드 스크립트가 .link-src 텍스트로 채움 → & # " 등이 들어 있어도 안전)
  // 🔊 읽어주기는 사전 아이콘 뒤에 붙이고, 필드가 비어 있으면 표시하지 않음
  // 아이콘은 같은 필드 블록 안의 <span class="field-icons">로 묶음 → 위치(글자 옆 / 글자 아래)는 CSS만 바꾸고,
  // 카드 스크립트는 그대로 같은 필드 블록에서 .link-src 와 아이콘을 찾음
  // withTts=false: 뒷면 위쪽 문제(앞면) 표시용 → 같은 소리가 뒷면에서 또 자동 재생되지 않게 뺌
  function buildAnkiFieldContent(field, idx, withTts = true) {
    const name = getAnkiFieldName(field, idx);
    const linkTargets = getLinkTargets(field);
    const tts = withTts ? buildTtsTag(field, idx) : '';
    if (linkTargets.length === 0) return tts ? `{{${name}}}{{#${name}}}<span class="field-icons">${tts}</span>{{/${name}}}` : `{{${name}}}`;

    const targetAttr = linkNewTab.checked ? ' target="_blank"' : '';
    const buttons = linkTargets.map(target => {
      const base = escapeHtml(target.url);
      return `<a class="link-btn ${target.cls}" href="${base}" data-base="${base}"${targetAttr} title="${escapeHtml(target.title)}">${target.icon}</a>`;
    }).join('');
    return `<span class="link-src">{{${name}}}</span>{{#${name}}}<span class="field-icons">${buttons}${tts}</span>{{/${name}}}`;
  }

  // 사전 URL 입력칸 아래 안내 (비었거나 http/https가 아니면 링크를 만들지 않음을 알림)
  function updateLinkUrlWarnings() {
    const check = (warnEl, url, isUsed) => {
      if (!warnEl) return;
      const value = String(url || '').trim();
      let msg = '';
      if (isUsed && !value) msg = t('editor.step1.urlEmptyWarning');
      else if (value && !isHttpUrl(value)) msg = t('editor.step1.urlInvalidWarning');
      warnEl.textContent = msg;
      warnEl.classList.toggle('hidden', !msg);
    };
    check(dictUrlWarn, dictUrlInput.value, fields.some(f => f.hasDictLink));
    check(subDictUrlWarn, wikiUrlInput ? wikiUrlInput.value : '', fields.some(f => f.hasWikiLink));

    // 사전 주소 칸은 고급 설정 안에 있으므로, 안내가 생기면 접힌 고급 설정을 펼쳐 보여줌
    const hasWarning = [dictUrlWarn, subDictUrlWarn].some(el => el && !el.classList.contains('hidden'));
    if (hasWarning && editorAdvancedSettings && !editorAdvancedSettings.open) editorAdvancedSettings.open = true;
  }

  // ③ 붙여넣기 단계 ✓ 표시 갱신: 복사한 내용이 지금 생성된 서식과 같을 때만 완료로 표시
  function refreshPasteSteps() {
    let doneCount = 0;
    pasteSteps.forEach((step, idx) => {
      if (!step.stepEl) return;
      if (step.copiedText !== null && step.copiedText !== step.codeEl.textContent) step.copiedText = null;
      const isDone = step.copiedText !== null;
      if (isDone) doneCount += 1;
      step.stepEl.classList.toggle('is-done', isDone);
      const num = step.stepEl.querySelector('.paste-step-num');
      if (num) num.textContent = isDone ? '✓' : String(idx + 1);
    });
    if (pasteAllDone) pasteAllDone.classList.toggle('hidden', doneCount < pasteSteps.length);
  }

  // 4. Anki 앞면 서식 생성
  function generateFrontTemplate() {
    const activeFrontFields = [];
    fields.forEach((f, idx) => {
      if (f.showFront.checked) {
        activeFrontFields.push({ field: f, index: idx + 1 });
      }
    });

    if (activeFrontFields.length === 0) {
      // 아무것도 선택되지 않았을 경우 1번째 필드 기본
      return wrapCardBox(`{{${getAnkiFieldName(fields[0], 0)}}}`);
    }

    return withLinkQueryScript(wrapCardBox(activeFrontFields.map(item => buildFieldBlock(item.field, false, item.index)).join('\n\n')));
  }

  // 5. Anki 뒷면 서식 생성
  function generateBackTemplate() {
    const parts = [];

    // 앞면 내용 유지 여부 (서식은 생성 CSS의 .front-preview-hint 규칙)
    if (keepFrontOnBack.checked && fields[0]) {
      parts.push(`<div class="front-preview-hint">${buildAnkiFieldContent(fields[0], 0, false)}</div>`);
    }

    // 정답 구분선 hr 여부
    if (showHrAnswer.checked) {
      parts.push('<hr id="answer">');
    }

    // 뒷면 노출 필드들
    fields.forEach((f, idx) => {
      if (f.showBack.checked) {
        parts.push(buildFieldBlock(f, false, idx + 1));
      }
    });

    return withLinkQueryScript(wrapCardBox(parts.join('\n\n')));
  }

  // 6. Anki CSS 서식 생성 (다크모드 완벽 대응)
  function generateCssTemplate() {
    const isRtl = rtlForce.checked;
    const align = centerAlign.checked ? 'center' : (isRtl ? 'right' : 'left');

    const cardFontCss = getFontFamilyCss(cardBaseFont ? cardBaseFont.value : DEFAULT_CARD_FONT);
    const cardLineHeightVal = cardLineHeight ? cardLineHeight.value : '1.5';

    // 🎨 꾸미기 (기본값이면 아래 추가 내용은 모두 빈 문자열 → 예전과 같은 서식)
    const look = getDecoLook(false);
    const night = getDecoLook(true);
    const indentDecls = decls => decls.map(decl => `  ${decl}\n`).join('');
    const bgImageLines = indentDecls(getBackgroundImageDecls(look));
    // 밝은 바탕만 다크모드 배경 그림을 바꿈 (어두운 바탕은 그대로)
    const nightBgImageDecls = getBackgroundImageDecls(night).filter(decl => decl.startsWith('background-image'));
    const nightBgImageLines = (deco.bgType !== 'solid' && nightBgImageDecls.join() !== getBackgroundImageDecls(look).filter(decl => decl.startsWith('background-image')).join())
      ? indentDecls(nightBgImageDecls)
      : '';

    let decoSections = '';
    let nightDecoSections = '';
    if (look.hasWrapper) {
      decoSections += `\n\n/* ${t('editor.cssComment.cardBox')} */
.card-box {
${indentDecls(getCardBoxDecls(look))}}`;
      const nightBoxDecls = [];
      if (deco.box === 'sheet') {
        // 📊 표 모양: 열 글자 · 행 번호 (다크모드는 진회색 시트에 맞춰 색만 바꿈)
        decoSections += `\n\n${getSheetCss(look, [''], true)}`;
        const nightLine = getSheetColors(night).line;
        nightBoxDecls.push(`background-color: ${night.boxColor};`, `background-image: ${getSheetGridImage(nightLine)};`, `border-color: ${nightLine};`);
        if (deco.border === 'left') nightBoxDecls.push(`border-left-color: ${night.borderColor};`);
        if (deco.border === 'thin' || deco.border === 'thick') nightBoxDecls.push(`outline-color: ${night.borderColor};`);
      } else {
        if (look.hasBox && night.boxColor !== look.boxColor) nightBoxDecls.push(`background-color: ${night.boxColor};`);
        if (deco.border !== 'none' && night.borderColor !== look.borderColor) nightBoxDecls.push(`border-color: ${night.borderColor};`);
        if (deco.box === 'shadow' && night.shadow !== look.shadow) nightBoxDecls.push(`box-shadow: ${night.shadow};`);
      }
      if (deco.box === 'sheet' && night.boxColor !== look.boxColor) {
        nightDecoSections += `\n\n${getSheetCss(night, ['.nightMode ', '.night_mode '], false)}`;
      }
      if (nightBoxDecls.length && !(deco.box === 'sheet' && night.boxColor === look.boxColor)) {
        nightDecoSections += `\n\n.nightMode .card-box,
.night_mode .card-box {
${indentDecls(nightBoxDecls)}}`;
      }
    }
    if (fields.some((f, idx) => buildTtsTag(f, idx))) {
      // Anki가 {{tts}} 자리에 그리는 자체 재생 그림(동그라미 ▶, svg)은 숨기고, 미리보기와 같은 🔊 아이콘으로 표시
      // (사전 아이콘과 같은 크기 · 간격 · 누르는 자리. 누르면 Anki 재생 기능은 그대로 동작)
      decoSections += `\n\n/* ${t('editor.cssComment.tts')} */
.tts-btn {
  display: inline-flex;
  white-space: nowrap;
}

.tts-btn .replay-button {
${indentDecls(LINK_BTN_DECLS)}}

.tts-btn .replay-button:hover,
.tts-btn .replay-button:active {
  background-color: ${ICON_HOVER_BG};
  opacity: 1;
}

.tts-btn .replay-button svg {
  display: none !important;
}

.tts-btn .replay-button::before {
  content: '🔊';
}`;
    }

    const darkF1ColorOnBack = night.fieldColor(getFrontHintStyle().color);
    const frontHintDecls = getFrontHintDecls().join('\n  ');

    let fieldStyles = '';
    let nightModeStyles = '';

    fields.forEach((f, idx) => {
      const fNum = idx + 1;
      const darkColor = night.fieldColor(f.colorInput.value);

      fieldStyles += `\n.f-field-${fNum} {
  ${getFieldStyleDecls(f).join('\n  ')}
}`;

      // Anki는 nightMode / night_mode 클래스를 body(.card)에 붙이므로 필드는 하위 선택자로 지정
      nightModeStyles += `\n.nightMode .f-field-${fNum},
.night_mode .f-field-${fNum},
.nightMode .f-field-${fNum} a,
.night_mode .f-field-${fNum} a {
  color: ${darkColor} !important;
}`;
    });

    // 글꼴은 기기에 들어 있는 것만 쓰므로 웹폰트 불러오기(@import) 없음
    return `.card {
  font-family: ${cardFontCss};
  font-size: 20px;
  text-align: ${align};
${isRtl ? '  direction: rtl;\n' : ''}  color: ${look.text};
  background-color: ${getBackgroundColor(look)};
${bgImageLines}  line-height: ${cardLineHeightVal};
}

.field-item {
  margin-bottom: 8px;
}

.front-preview-hint {
  ${frontHintDecls}
}

hr#answer {
  border: none;
  border-top: ${getDividerCss(look.dividerColor)};
  margin: 1.25rem 0;
  width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

/* ${t('editor.cssComment.linkButtons')} */
.field-icons {
${indentDecls(getFieldIconsDecls())}}

.link-btn {
${indentDecls(LINK_BTN_DECLS)}}

.link-btn:hover,
.link-btn:active {
  opacity: 1;
  background-color: ${ICON_HOVER_BG};
}${decoSections}

/* ${t('editor.cssComment.fieldStyles')} */${fieldStyles}

/* =======================================
   ${t('editor.cssComment.nightMode')}
   ======================================= */
.card.nightMode,
.card.night_mode {
  color: ${night.text};
  background-color: ${getBackgroundColor(night)};
${nightBgImageLines}}

.nightMode hr#answer,
.night_mode hr#answer {
  border-top-color: ${night.dividerColor};
}${nightDecoSections}

.nightMode .front-preview-hint,
.night_mode .front-preview-hint {
  color: ${darkF1ColorOnBack} !important;
}

/* ${t('editor.cssComment.nightModeFields')} */${nightModeStyles}
`;
  }

  // 7. 실시간 미리보기 렌더링
  function renderPreview() {
    const isFront = (currentPreviewSide === 'front');
    currentCardSideBadge.textContent = isFront ? t('editor.preview.sideFront') : t('editor.preview.sideBack');

    const isRtl = rtlForce.checked;
    liveCardRender.style.direction = isRtl ? 'rtl' : 'ltr';
    liveCardRender.style.textAlign = centerAlign.checked ? 'center' : (isRtl ? 'right' : 'left');

    liveCardRender.style.fontFamily = getFontFamilyCss(cardBaseFont ? cardBaseFont.value : DEFAULT_CARD_FONT);
    liveCardRender.style.lineHeight = cardLineHeight ? cardLineHeight.value : '1.5';

    const isDark = Boolean(ankiCardWrapper && ankiCardWrapper.classList.contains('dark-mode'));

    // 🎨 꾸미기: 미리보기 바탕 = 카드 배경 (기본값이면 원래 미리보기 모양 그대로)
    const decoOn = !isDecoDefault();
    const pLook = getDecoLook(isDark);
    const cardStyle = liveCardRender.style;
    cardStyle.backgroundColor = decoOn ? getBackgroundColor(pLook) : '';
    cardStyle.backgroundImage = '';
    cardStyle.backgroundSize = '';
    cardStyle.color = decoOn ? pLook.text : '';
    if (decoOn) {
      getBackgroundImageDecls(pLook, deco, false).forEach(decl => {
        const m = decl.match(/^([a-z-]+):\s*(.+);$/);
        if (m) cardStyle.setProperty(m[1], m[2]);
      });
    }
    const hrHtml = decoOn
      ? `<hr id="answer" style="${escapeHtml(`border: none; border-top: ${getDividerCss(pLook.dividerColor)};`)}">`
      : '<hr id="answer">';

    let html = '';

    if (isFront) {
      const activeFrontFields = [];
      fields.forEach((f, idx) => {
        if (f.showFront.checked) {
          activeFrontFields.push({ field: f, index: idx + 1 });
        }
      });

      if (activeFrontFields.length === 0) {
        html = '<div style="color: #94a3b8; font-style: italic;">' + t('editor.preview.emptyFront') + '</div>';
      } else {
        html = activeFrontFields.map(item => buildFieldBlock(item.field, true, item.index)).join('\n');
      }
    } else {
      const parts = [];

      // 앞면 유지 표시
      if (keepFrontOnBack.checked && fields[0]) {
        const f1Sample = fields[0].sampleInput.value.trim() || getFieldDisplayName(fields[0], 0);
        const f1BaseColor = getFrontHintStyle().color;
        const f1Color = pLook.fieldColor(f1BaseColor);
        const hintStyle = getFrontHintDecls(f1Color).join(' ');

        parts.push(`<div class="front-preview-hint" style="${escapeHtml(hintStyle)}">${escapeHtml(f1Sample)}${wrapPreviewIcons(buildPreviewLinkButtons(fields[0], f1Sample))}</div>`);
      }

      // 구분선
      if (showHrAnswer.checked) {
        parts.push(hrHtml);
      }

      // 뒷면 표시 필드
      const activeBackFields = [];
      fields.forEach((f, idx) => {
        if (f.showBack.checked) {
          activeBackFields.push({ field: f, index: idx + 1 });
        }
      });

      if (activeBackFields.length === 0 && parts.length === 0) {
        html = '<div style="color: #94a3b8; font-style: italic;">' + t('editor.preview.emptyBack') + '</div>';
      } else {
        parts.push(...activeBackFields.map(item => buildFieldBlock(item.field, true, item.index)));
        html = parts.join('\n');
      }
    }

    // 카드 상자 · 테두리 (Anki 서식의 .card-box와 같은 값)
    if (pLook.hasWrapper) {
      const boxStyle = [...getCardBoxDecls(pLook), 'width: 100%;'].join(' ');
      html = `<div class="card-box" style="${escapeHtml(boxStyle)}">${html}</div>`;
      // 📊 표 모양의 열 글자·행 번호는 가짜 요소라 인라인 스타일로 못 넣으므로 미리보기 전용 <style>로 적용
      if (deco.box === 'sheet') html = `<style>${getSheetCss(pLook, ['#liveCardRender '], true)}</style>${html}`;
    }

    liveCardRender.innerHTML = html;

    // 공용 스타일 편집 패널의 선택 필드 강조 및 패널 값 갱신 (필드 삭제 시 범위 보정)
    selectedFieldIndex = Math.max(0, Math.min(selectedFieldIndex, fields.length - 1));
    const selectedEl = liveCardRender.querySelector(`.f-field-${selectedFieldIndex + 1}`);
    if (selectedEl) selectedEl.classList.add('is-selected');
    syncInspector();
    refreshSteppers();
  }

  // 8. 전체 동기화 및 코드 갱신
  function updateAll(shouldSave = true) {
    const frontCode = generateFrontTemplate();
    const backCode = generateBackTemplate();
    const cssCode = generateCssTemplate();

    codeFrontText.textContent = frontCode;
    codeBackText.textContent = backCode;
    codeCssText.textContent = cssCode;

    refreshPasteSteps();
    updateLinkUrlWarnings();
    renderPreview();

    if (shouldSave) {
      saveSettingsToStorage();
    }
  }

  // 9. 로컬 스토리지 (localStorage) 자동 저장 및 복원 기능
  // 설정을 두 묶음으로 나눠 저장 (묶음별로 따로 처음으로 되돌릴 수 있게)
  // - 📝 내용: 학습 언어, 필드 목록(이름 · 예시값 · 앞면/뒷면 · 🌐/📘 사전 아이콘 · 🔊 읽어주기), 사전 주소 · 보조 사전 · 새 창 · 검색어 정리
  // - 🎨 꾸미기: 테마 · 배경 · 상자 · 테두리 · 구분선, 카드 글꼴 · 줄 간격 · 정렬 · 오른쪽→왼쪽, 뒷면 구분선 · 뒷면 위쪽 문제 표시, 읽는 속도,
  //             아이콘 위치, 필드별 글씨 크기 · 굵기 · 글꼴 · 색 (필드 자리(순서) 기준, fieldStyles[i] = i번째 필드)
  const CONTENT_STORAGE_KEY = 'anki_card_editor_content';
  const DESIGN_STORAGE_KEY = 'anki_card_editor_design';
  // 예전 단일 저장 키: 새 키가 하나도 없을 때 첫 로드에서 두 키로 옮긴 뒤 삭제 (프롬프트 생성기는 새 키 → 예전 키 순서로 읽음)
  const LEGACY_STORAGE_KEY = 'anki_card_editor_settings';
  const STORAGE_VERSION = 2;
  // 꾸미기 묶음에 들어가는 설정 이름 (나머지는 모두 내용 묶음 — 예전 저장본의 옛 항목도 잃지 않도록)
  const DESIGN_SETTING_KEYS = [
    'showHrAnswer', 'keepFrontOnBack', 'centerAlign', 'rtlForce',
    // cardBaseFontCustom · fontCustom: 예전 '직접 입력' 글꼴 이름 (꾸미기 묶음으로 옮긴 뒤 migrateDesignFonts에서 삭제)
    'cardBaseFont', 'cardBaseFontCustom', 'cardLineHeight',
    'frontOnBackSize', 'syncFrontSizeWithF1', 'frontOnBackKeepStyle',
    'ttsSpeed', 'iconPosition', 'deco',
  ];
  // 필드 항목 중 꾸미기 묶음으로 가는 글씨 모양 값
  const FIELD_STYLE_KEYS = ['size', 'weight', 'font', 'fontCustom', 'color'];

  // 꾸미기 묶음의 예전 글꼴 값을 지금 글꼴(기본 고딕 · 명조 · 타자기체)로 바꾸고 직접 입력 글꼴 이름은 지움
  function migrateDesignFonts(design) {
    if (!design || typeof design !== 'object') return design;
    if (design.cardBaseFont !== undefined) design.cardBaseFont = normalizeCardFontKey(design.cardBaseFont);
    delete design.cardBaseFontCustom;
    if (Array.isArray(design.fieldStyles)) {
      design.fieldStyles.forEach(style => {
        if (!style || typeof style !== 'object') return;
        if (style.font !== undefined) style.font = normalizeFieldFontKey(style.font);
        delete style.fontCustom;
      });
    }
    return design;
  }

  // 한 덩어리 설정(예전 저장 형식과 같은 모양)을 내용 / 꾸미기 두 묶음으로 나눔
  function splitSettings(data) {
    const content = {};
    const design = {};
    Object.keys(data || {}).forEach(key => {
      if (key === 'fields') return;
      if (DESIGN_SETTING_KEYS.includes(key)) design[key] = data[key];
      else content[key] = data[key];
    });
    if (Array.isArray(data && data.fields)) {
      content.fields = data.fields.map(f => {
        const item = {};
        Object.keys(f || {}).forEach(key => {
          if (!FIELD_STYLE_KEYS.includes(key)) item[key] = f[key];
        });
        return item;
      });
      design.fieldStyles = data.fields.map(f => {
        const style = {};
        FIELD_STYLE_KEYS.forEach(key => {
          if (f && f[key] !== undefined) style[key] = f[key];
        });
        return style;
      });
    }
    content.version = STORAGE_VERSION;
    design.version = STORAGE_VERSION;
    if (data && data.savedAt) design.savedAt = data.savedAt;
    return { content, design };
  }

  // 두 묶음을 다시 한 덩어리로 합침 (복원 코드는 예전 형식을 그대로 읽음)
  // 필드 글씨 모양은 같은 자리의 꾸미기 값을 쓰고, 꾸미기 값이 없는 자리는 지금 테마의 기본 모양
  function mergeSettings(content, design) {
    const c = content || {};
    const d = design || {};
    const merged = { ...c };
    DESIGN_SETTING_KEYS.forEach(key => {
      if (d[key] !== undefined) merged[key] = d[key];
    });
    if (Array.isArray(c.fields)) {
      const styles = Array.isArray(d.fieldStyles) ? d.fieldStyles : [];
      const themeId = d.deco && d.deco.theme;
      merged.fields = c.fields.map((f, idx) => {
        const style = styles[idx] && typeof styles[idx] === 'object' ? styles[idx] : getDefaultFieldStyle(idx, themeId);
        return { ...(f || {}), ...style };
      });
    }
    return merged;
  }

  // 저장된 두 묶음 읽기 (새 키가 하나도 없고 예전 키만 있으면 두 키로 옮김)
  function readStoredSettings() {
    const parse = (key) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        return value && typeof value === 'object' ? value : null;
      } catch (err) {
        return null;
      }
    };
    let content = parse(CONTENT_STORAGE_KEY);
    let design = parse(DESIGN_STORAGE_KEY);
    if (!content && !design) {
      const legacy = parse(LEGACY_STORAGE_KEY);
      if (legacy) {
        const split = splitSettings(legacy);
        content = split.content;
        design = split.design;
        try {
          localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
          localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design));
          // 두 키에 모두 옮겨 적은 경우에만 예전 키 삭제 (실패하면 예전 키를 남겨 다음에 다시 시도)
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch (err) {
          // 반쯤 옮겨진 새 키는 지워서 다음 로드 때 예전 키에서 다시 옮기게 함
          try {
            localStorage.removeItem(CONTENT_STORAGE_KEY);
            localStorage.removeItem(DESIGN_STORAGE_KEY);
          } catch (e) {}
          console.warn('localStorage 저장 형식 이전 실패:', err);
        }
      }
    }
    // 예전 글꼴 값 정리 (새 형식 · 예전 형식에서 옮긴 저장본 모두)
    migrateDesignFonts(design);
    return { content, design };
  }

  const saveStatusIndicator = document.getElementById('saveStatusIndicator');
  let saveTimer = null;

  function updateSaveIndicator(text = t('common.autoSaved')) {
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
      const frontCode = generateFrontTemplate();
      const backCode = generateBackTemplate();
      const cssCode = generateCssTemplate();

      const data = {
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        langId: languageSelect.value,
        dictLinkTargets: fields.map(f => Boolean(f.hasDictLink)),
        dictUrl: dictUrlInput.value,
        subDict: subDictSelect ? subDictSelect.value : DEFAULT_SUB_DICT,
        wikiUrl: wikiUrlInput ? wikiUrlInput.value : SUB_DICT_PRESETS[DEFAULT_SUB_DICT].url,
        linkNewTab: linkNewTab.checked,
        linkCleanQuery: linkCleanQuery ? linkCleanQuery.checked : true,
        showHrAnswer: showHrAnswer.checked,
        keepFrontOnBack: keepFrontOnBack.checked,
        centerAlign: centerAlign.checked,
        rtlForce: rtlForce.checked,
        cardBaseFont: cardBaseFont ? cardBaseFont.value : DEFAULT_CARD_FONT,
        cardLineHeight: cardLineHeight ? cardLineHeight.value : '1.5',
        frontOnBackSize: frontOnBackSize ? frontOnBackSize.value : 24,
        syncFrontSizeWithF1: syncFrontSizeWithF1 ? syncFrontSizeWithF1.checked : true,
        frontOnBackKeepStyle: frontOnBackKeepStyle ? frontOnBackKeepStyle.checked : true,
        ttsSpeed: getTtsSpeed(),
        iconPosition: getIconPosition(),
        deco: { ...deco },
        fields: fields.map(f => ({
          name: f.nameInput.value,
          sample: f.sampleInput.value,
          showFront: f.showFront.checked,
          showBack: f.showBack.checked,
          size: f.sizeSlider.value,
          weight: f.weightSelect.value,
          font: f.fontSelect ? f.fontSelect.value : 'inherit',
          color: f.colorInput.value,
          hasDictLink: Boolean(f.hasDictLink),
          hasWikiLink: Boolean(f.hasWikiLink),
          hasTts: Boolean(f.hasTts),
        })),
        // 사용자가 직접 확인할 수 있도록 완성본 서식 전체(HTML/CSS 코드)도 통째로 함께 보관
        templates: {
          front: frontCode,
          back: backCode,
          css: cssCode
        }
      };
      // 내용 / 꾸미기 두 키로 나눠 저장 (완성본 서식 templates는 내용 묶음에 함께 보관)
      const { content, design } = splitSettings(data);
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design));
      updateSaveIndicator(t('common.autoSaved'));
    } catch (err) {
      console.warn('localStorage 저장 실패:', err);
    }
  }

  // 저장된 꾸미기 묶음 (내용 묶음 없이 꾸미기만 남아 있을 때 첫 화면을 만든 뒤 다시 적용하려고 보관)
  let storedDesign = null;

  // 반환값: 내용 묶음(언어 · 필드)을 복원했으면 true
  function loadSettingsFromStorage() {
    try {
      const { content, design } = readStoredSettings();
      storedDesign = design;
      if (!content && !design) return false;
      const data = mergeSettings(content, design);

      // 언어 복원
      if (data.langId) {
        languageSelect.value = data.langId;
        const lang = getSelectedLanguage();
        if (langSearchInput) langSearchInput.value = i18n.langName(lang);
        if (dictNameTag) dictNameTag.textContent = lang.dictName;
      }

      if (data.dictUrl !== undefined) dictUrlInput.value = data.dictUrl;
      if (data.linkNewTab !== undefined) linkNewTab.checked = Boolean(data.linkNewTab);
      if (data.linkCleanQuery !== undefined && linkCleanQuery) linkCleanQuery.checked = Boolean(data.linkCleanQuery);

      if (data.showHrAnswer !== undefined) showHrAnswer.checked = Boolean(data.showHrAnswer);
      if (data.keepFrontOnBack !== undefined) keepFrontOnBack.checked = Boolean(data.keepFrontOnBack);
      if (data.centerAlign !== undefined) centerAlign.checked = Boolean(data.centerAlign);
      if (data.rtlForce !== undefined) rtlForce.checked = Boolean(data.rtlForce);

      // 카드 전반 폰트 및 줄간격 복원
      // (예전 글꼴 값은 지금 글꼴로 바꿈, 모르는 값은 기본 고딕)
      if (data.cardBaseFont !== undefined && cardBaseFont) {
        cardBaseFont.value = normalizeCardFontKey(data.cardBaseFont);
      }
      if (data.cardLineHeight !== undefined && cardLineHeight) {
        cardLineHeight.value = clampNumber(data.cardLineHeight, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX, 1.5);
        if (cardLineHeightNum) cardLineHeightNum.value = cardLineHeight.value;
        if (cardLineHeightVal) cardLineHeightVal.textContent = cardLineHeight.value;
      }

      // 뒷면 상단 앞면 내용 크기 & 스타일 설정 복원
      if (data.frontOnBackSize !== undefined && frontOnBackSize) {
        frontOnBackSize.value = Math.round(clampNumber(data.frontOnBackSize, SIZE_MIN, SIZE_MAX, 24));
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = frontOnBackSize.value;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = frontOnBackSize.value + 'px';
      }
      if (data.syncFrontSizeWithF1 !== undefined && syncFrontSizeWithF1) {
        syncFrontSizeWithF1.checked = Boolean(data.syncFrontSizeWithF1);
      }
      if (data.frontOnBackKeepStyle !== undefined && frontOnBackKeepStyle) {
        frontOnBackKeepStyle.checked = Boolean(data.frontOnBackKeepStyle);
      }
      if (frontOnBackSettings && keepFrontOnBack) {
        frontOnBackSettings.style.display = keepFrontOnBack.checked ? 'block' : 'none';
      }

      // 🔊 읽는 속도 · 🎨 꾸미기 복원 (예전 저장본엔 없으므로 기본값)
      if (ttsSpeedSelect) ttsSpeedSelect.value = TTS_SPEEDS.includes(data.ttsSpeed) ? data.ttsSpeed : DEFAULT_TTS_SPEED;
      // 아이콘 위치: 이 설정이 없던 예전 저장본은 '글자 옆' 그대로 (기존 카드 모양이 갑자기 바뀌지 않게)
      if (iconPositionSelect) iconPositionSelect.value = ICON_POSITIONS.includes(data.iconPosition) ? data.iconPosition : LEGACY_ICON_POSITION;
      restoreDeco(data.deco);
      syncDecoControls();

      // 필드 설정 복원
      if (Array.isArray(data.fields) && data.fields.length >= 2) {
        const optionalContainer = document.getElementById('optionalFieldsContainer');
        if (optionalContainer) optionalContainer.innerHTML = '';
        fields.splice(2); // 인덱스 2 이후의 기존 optional 필드 객체 제거

        // Field 1 & 2 복원
        for (let i = 0; i < 2; i++) {
          const f = fields[i];
          const fData = data.fields[i];
          if (f && fData) {
            // 저장본 값은 형식을 검사해 복원 (잘못된 값은 현재 기본값 유지)
            if (fData.name !== undefined) f.nameInput.value = String(fData.name);
            if (fData.sample !== undefined) f.sampleInput.value = String(fData.sample);
            if (fData.showFront !== undefined) f.showFront.checked = Boolean(fData.showFront);
            if (fData.showBack !== undefined) f.showBack.checked = Boolean(fData.showBack);

            if (fData.size !== undefined) {
              const size = Math.round(clampNumber(fData.size, SIZE_MIN, SIZE_MAX, parseInt(f.sizeSlider.value, 10) || 24));
              f.sizeSlider.value = size;
              f.sizeNum.value = size;
              f.sizeVal.textContent = size;
            }
            if (WEIGHT_VALUES.includes(String(fData.weight))) f.weightSelect.value = String(fData.weight);
            if (fData.font !== undefined && f.fontSelect) {
              f.fontSelect.value = normalizeFieldFontKey(fData.font);
            }
            const color = normalizeHexColor(fData.color);
            if (color) {
              f.colorInput.value = color;
              f.colorText.value = color;
            }
            if (fData.hasDictLink !== undefined) {
              f.hasDictLink = Boolean(fData.hasDictLink);
            }
            f.hasWikiLink = Boolean(fData.hasWikiLink);
            f.hasTts = Boolean(fData.hasTts);
          }
        }

        // Field 3 이상 복원
        for (let i = 2; i < data.fields.length; i++) {
          addOptionalField(data.fields[i], false);
        }
      } else {
        const optionalContainer = document.getElementById('optionalFieldsContainer');
        if (optionalContainer) optionalContainer.innerHTML = '';
        fields.splice(2);
        addOptionalField(null, false);
      }

      // 사전 링크 타겟 다중 복원 (레거시 단일 문자열 호환)
      if (Array.isArray(data.dictLinkTargets)) {
        data.dictLinkTargets.forEach((isLinked, idx) => {
          if (fields[idx]) {
            fields[idx].hasDictLink = Boolean(isLinked);
          }
        });
      } else if (data.dictApplyTarget !== undefined) {
        fields.forEach((f, idx) => {
          f.hasDictLink = (data.dictApplyTarget === `field${idx + 1}`);
        });
      }

      // 보조 사전 복원
      // 이전 버전(위키만 지원) 저장본: 위키 링크를 실제로 쓰던 경우에만 위키/직접 입력으로 유지하고, 아니면 새 기본값(국어사전) 적용
      if (subDictSelect && wikiUrlInput) {
        if (data.subDict && SUB_DICT_PRESETS[data.subDict]) {
          subDictSelect.value = data.subDict;
          if (data.wikiUrl !== undefined) wikiUrlInput.value = data.wikiUrl;
        } else if (data.wikiUrl !== undefined && fields.some(f => f.hasWikiLink)) {
          subDictSelect.value = data.wikiUrl.trim() === DEFAULT_WIKI_URL ? 'wiki' : 'custom';
          wikiUrlInput.value = data.wikiUrl;
        } else {
          subDictSelect.value = DEFAULT_SUB_DICT;
          wikiUrlInput.value = SUB_DICT_PRESETS[DEFAULT_SUB_DICT].url;
        }
        updateSubDictLabels();
      }

      fields.forEach(f => updateFieldNameWarning(f));
      updateFieldBadges();
      updateDictFieldChecklist();

      fields.forEach(f => {
        if (f.dictLinkCheck) f.dictLinkCheck.checked = Boolean(f.hasDictLink);
        if (f.wikiLinkCheck) f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
      });
      renderEditorQuickChips(languageSelect.value);

      // RTL 알림 배지 복원
      const currentLang = getSelectedLanguage();
      if (currentLang.isRTL || data.rtlForce) {
        rtlNotice.classList.remove('hidden');
      } else {
        rtlNotice.classList.add('hidden');
      }

      return Boolean(content);
    } catch (err) {
      console.warn('localStorage 복원 실패:', err);
      return false;
    }
  }

  // 10. 설정 초기화 (📝 내용만 · 🎨 꾸미기만 · 🔄 전체)
  // 필드 하나의 글씨 모양 값 (저장 형식과 같음)
  function getFieldStyle(f) {
    return {
      size: f.sizeSlider.value,
      weight: f.weightSelect.value,
      font: f.fontSelect ? f.fontSelect.value : 'inherit',
      color: f.colorInput.value,
    };
  }

  // 필드 하나에 글씨 모양 값 적용 (형식이 맞지 않는 값은 지금 값 유지)
  function applyFieldStyle(f, style) {
    if (!f || !style) return;
    if (style.size !== undefined) {
      const size = Math.round(clampNumber(style.size, SIZE_MIN, SIZE_MAX, parseInt(f.sizeSlider.value, 10) || 24));
      f.sizeSlider.value = size;
      f.sizeNum.value = size;
      f.sizeVal.textContent = size;
    }
    if (WEIGHT_VALUES.includes(String(style.weight))) f.weightSelect.value = String(style.weight);
    if (style.font !== undefined && f.fontSelect) {
      f.fontSelect.value = normalizeFieldFontKey(style.font);
    }
    const color = normalizeHexColor(style.color);
    if (color) {
      f.colorInput.value = color;
      f.colorText.value = color;
    }
  }

  // 자리(순서)별 기본 글씨 모양: 테마의 필드 색 (1번째 = 본문, 2번째 = 강조, 나머지 = 연하게) · 글씨 크기
  // 크기를 정하지 않은 테마는 기본 테마 크기 (24, 24, 20), 1·2번째는 굵게, 글꼴은 카드 글꼴 그대로
  function getDefaultFieldStyle(idx, themeId) {
    const theme = THEMES.find(th => th.id === themeId) || THEMES[0];
    const slot = Math.min(idx, 2);
    return {
      size: (theme.sizes || THEMES[0].sizes)[slot],
      weight: idx < 2 ? 'bold' : 'normal',
      font: 'inherit',
      color: theme.colors[slot],
    };
  }

  // 📝 내용 기본값: 학습 언어(영어) · 사전 설정 · 필드 3개(이름 · 예시값 · 앞/뒷면 · 사전 아이콘 · 읽어주기)
  // 필드 글씨 모양은 꾸미기 묶음이라 자리별로 그대로 두고, 지금 없는 자리는 지금 테마의 기본 모양
  function applyContentDefaults() {
    const prevLang = getSelectedLanguage();
    const keptStyles = fields.map(getFieldStyle);

    // 언어 기본값 (영어) · 다른 도구와의 언어 연동 기록도 초기화 (남겨 두면 다시 열 때 그 언어로 돌아감)
    langCombobox.setValue(DEFAULT_LANG_ID);
    langCombobox.clearSharedLanguage();
    const lang = getSelectedLanguage();
    const sample = lang.sample || {};
    dictUrlInput.value = lang.dictUrl;
    dictNameTag.textContent = lang.dictName;
    if (subDictSelect) subDictSelect.value = DEFAULT_SUB_DICT;
    if (wikiUrlInput) wikiUrlInput.value = SUB_DICT_PRESETS[DEFAULT_SUB_DICT].url;
    updateSubDictLabels();
    linkNewTab.checked = true;
    if (linkCleanQuery) linkCleanQuery.checked = true;

    // 오른쪽→왼쪽 쓰기(꾸미기)는 사용자가 바꾸지 않았을 때만 바뀐 언어를 따라감 (언어 연동과 같은 규칙)
    if (rtlForce.checked === Boolean(prevLang.isRTL)) rtlForce.checked = Boolean(lang.isRTL);
    rtlNotice.classList.toggle('hidden', !lang.isRTL);

    // 필드 1 기본값 (Front / 한국어 뜻)
    fields[0].nameInput.value = 'Front';
    fields[0].sampleInput.value = sample.field1 || '';
    fields[0].showFront.checked = true;
    fields[0].showBack.checked = false;
    fields[0].hasDictLink = false;
    fields[0].hasWikiLink = false;
    fields[0].hasTts = false;

    // 필드 2 기본값 (Back / 외국어 단어 · 사전 링크)
    fields[1].nameInput.value = 'Back';
    fields[1].sampleInput.value = sample.field2 || '';
    fields[1].showFront.checked = false;
    fields[1].showBack.checked = true;
    fields[1].hasDictLink = true;
    fields[1].hasWikiLink = false;
    fields[1].hasTts = true; // 외국어 단어 필드는 읽어주기 켬

    // 3번째 이상 선택 필드 컨테이너 비우고 기본 3번째 필드 1개 생성 (글씨 모양은 3번째 자리 값 유지)
    const optionalContainer = document.getElementById('optionalFieldsContainer');
    if (optionalContainer) optionalContainer.innerHTML = '';
    fields.splice(2);

    addOptionalField({
      ...getDefaultThirdField(lang),
      showFront: false,
      showBack: true,
      hasDictLink: false,
      ...(keptStyles[2] || getDefaultFieldStyle(2, deco.theme)),
    }, false);
  }

  // 🎨 꾸미기 기본값: 기본 테마 · 카드 글꼴 · 줄 간격 · 정렬 · 뒷면 표시 · 읽는 속도 · 필드별 글씨 모양
  function applyDesignDefaults() {
    const lang = getSelectedLanguage();

    showHrAnswer.checked = true;
    keepFrontOnBack.checked = true;
    centerAlign.checked = true;
    // 오른쪽→왼쪽 쓰기는 지금 학습 언어의 기본값 (아랍어·히브리어 등이면 켬)
    rtlForce.checked = Boolean(lang.isRTL);

    if (cardBaseFont) cardBaseFont.value = DEFAULT_CARD_FONT;
    if (cardLineHeight) {
      cardLineHeight.value = 1.5;
      if (cardLineHeightNum) cardLineHeightNum.value = 1.5;
      if (cardLineHeightVal) cardLineHeightVal.textContent = '1.5';
    }

    if (frontOnBackSize) {
      frontOnBackSize.value = 24;
      if (frontOnBackSizeNum) frontOnBackSizeNum.value = 24;
      if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = '24px';
    }
    if (syncFrontSizeWithF1) syncFrontSizeWithF1.checked = true;
    if (frontOnBackKeepStyle) frontOnBackKeepStyle.checked = true;
    if (frontOnBackSettings) frontOnBackSettings.style.display = 'block';

    // 🔊 읽는 속도 · 아이콘 위치 · 🎨 꾸미기(테마) 기본값
    if (ttsSpeedSelect) ttsSpeedSelect.value = DEFAULT_TTS_SPEED;
    if (iconPositionSelect) iconPositionSelect.value = DEFAULT_ICON_POSITION;
    Object.assign(deco, DECO_DEFAULTS);
    syncDecoControls();

    // 필드별 글씨 모양 (필드 이름 등 내용은 그대로)
    fields.forEach((f, idx) => applyFieldStyle(f, getDefaultFieldStyle(idx, DECO_DEFAULTS.theme)));
  }

  // 초기화 후 화면 갱신 · 저장 · 알림 (세 가지 초기화 공통)
  function finishReset(toastKey) {
    if (selectedFieldIndex >= fields.length) selectedFieldIndex = 0;
    fields.forEach(f => updateFieldNameWarning(f));
    updateFieldBadges();
    updateDictFieldChecklist();

    fields.forEach(f => {
      if (f.dictLinkCheck) f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      if (f.wikiLinkCheck) f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
    });
    renderEditorQuickChips(languageSelect.value);

    updateAll(false);
    saveSettingsToStorage();
    updateSaveIndicator(t('common.resetDone'));
    showToast(t(toastKey));
  }

  // 📝 언어·필드 처음으로 (꾸미기는 그대로)
  function resetContentSettings() {
    if (!confirm(t('editor.confirm.resetContent'))) {
      return;
    }
    applyContentDefaults();
    finishReset('editor.toast.resetContentDone');
  }

  // 🎨 꾸미기 처음으로 (언어·필드 내용은 그대로)
  function resetDesignSettings() {
    if (!confirm(t('editor.confirm.resetDesign'))) {
      return;
    }
    applyDesignDefaults();
    finishReset('editor.toast.resetDesignDone');
  }

  // 🔄 전체 설정 초기화 (내용 + 꾸미기, 언어 연동 기록도 삭제)
  function resetAllSettings() {
    if (!confirm(t('editor.confirm.resetAll'))) {
      return;
    }
    try {
      localStorage.removeItem(CONTENT_STORAGE_KEY);
      localStorage.removeItem(DESIGN_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {}

    applyContentDefaults();
    applyDesignDefaults();
    finishReset('editor.toast.resetDone');
  }

  // 클립보드 복사 헬퍼
  // onSuccess: 복사에 성공했을 때만 호출 (붙여넣기 단계 ✓ 표시용)
  function copyToClipboard(text, label, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(t('common.copied', { label }));
        if (onSuccess) onSuccess();
      }).catch(() => fallbackCopy(text, label, onSuccess));
    } else {
      fallbackCopy(text, label, onSuccess);
    }
  }

  function fallbackCopy(text, label, onSuccess) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      // execCommand는 실패해도 예외 없이 false를 돌려주는 경우가 있음
      const ok = document.execCommand('copy');
      showToast(ok ? t('common.copied', { label }) : t('common.copyFailed'));
      if (ok && onSuccess) onSuccess();
    } catch (err) {
      showToast(t('common.copyFailed'));
    }
    document.body.removeChild(textarea);
  }

  // 이전 알림의 숨김 타이머를 지워 연달아 띄운 알림이 일찍 사라지지 않게 함
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 초기화 실행 (순서: 옵션 목록 초기화 -> 이벤트 등록 -> 로컬스토리지 복원 -> 초기 렌더링)
  initLanguageSelect();
  updateSubDictLabels();
  renderThemeSwatches();
  syncDecoControls();
  // 슬라이더 → [−] [숫자] [+] 조절기 (화면에 처음부터 있는 것: 1·2번째 필드 · 공용 편집 패널 · 줄 간격 · 뒷면 문제 크기)
  document.querySelectorAll('.slider-with-number').forEach(enhanceStepper);
  initEventListeners();
  initInspectorEvents();

  // 프롬프트 생성기에서 마지막으로 고른 언어 (언어 연동)
  const sharedLangId = langCombobox.getSharedLanguage();

  const restored = loadSettingsFromStorage();
  if (!restored) {
    // 저장된 설정이 없을 때: 연동 언어(없으면 영어)로 시작, 기본 3번째 필드 1개 생성 및 예시값 반영
    if (sharedLangId) langCombobox.setValue(sharedLangId);
    const optionalContainer = document.getElementById('optionalFieldsContainer');
    if (optionalContainer) optionalContainer.innerHTML = '';
    fields.splice(2);
    addOptionalField(null, false);
    onLanguageChange(true, false);
    // 꾸미기 묶음만 남아 있던 경우: 필드별 글씨 모양 · 오른쪽→왼쪽 쓰기를 저장된 값으로 다시 맞춤
    if (storedDesign) {
      if (Array.isArray(storedDesign.fieldStyles)) {
        fields.forEach((f, idx) => applyFieldStyle(f, storedDesign.fieldStyles[idx]));
      }
      if (storedDesign.rtlForce !== undefined) rtlForce.checked = Boolean(storedDesign.rtlForce);
    }
  } else if (sharedLangId && sharedLangId !== languageSelect.value) {
    // 저장된 설정이 있어도 다른 도구에서 언어를 바꿨다면 그 언어로 맞춤
    // (사전 URL·RTL 안내만 바꾸고, 사용자가 고친 예시값·RTL 설정은 유지)
    const prevLang = getSelectedLanguage();
    langCombobox.setValue(sharedLangId);
    onLanguageChange(true, true, { prevLang });
  }

  // 초기 렌더링 (저장하지 않고 렌더링만 수행하여 localStorage 원본 보존)
  updateAll(false);
});
