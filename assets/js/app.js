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
  // 미리보기 전용 사전 / 보조 사전 아이콘 버튼 인라인 스타일 (미리보기는 생성된 CSS를 불러오지 않음, Anki 서식은 CSS의 .link-btn 규칙 사용)
  const LINK_BTN_INLINE_STYLE = 'font-size: 0.6em; margin-left: 0.35em; text-decoration: none; opacity: 0.75; vertical-align: middle;';

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
  const cardBaseFontCustom = document.getElementById('cardBaseFontCustom');
  const cardLineHeight = document.getElementById('cardLineHeight');
  const cardLineHeightNum = document.getElementById('cardLineHeightNum');
  const cardLineHeightVal = document.getElementById('cardLineHeightVal');

  // Font Presets Definition
  const FONT_PRESETS = {
    'system': {
      name: t('editor.font.system'),
      css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif"
    },
    'noto-sans-kr': {
      name: t('editor.font.notoSansKr'),
      css: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    'noto-serif-kr': {
      name: t('editor.font.notoSerifKr'),
      css: "'Noto Serif KR', 'Nanum Myeongjo', 'Batang', serif"
    },
    'nanum-gothic': {
      name: t('editor.font.nanumGothic'),
      css: "'Nanum Gothic', 'Malgun Gothic', sans-serif"
    },
    'inter': {
      name: t('editor.font.inter'),
      css: "'Inter', 'Roboto', -apple-system, sans-serif"
    },
    'noto-sans-jp': {
      name: t('editor.font.notoSansJp'),
      css: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif"
    },
    'noto-sans-sc': {
      name: t('editor.font.notoSansSc'),
      css: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    },
    'monospace': {
      name: t('editor.font.monospace'),
      css: "Consolas, Menlo, Monaco, 'Courier New', monospace"
    },
    'cursive': {
      name: t('editor.font.cursive'),
      css: "Caveat, 'Nanum Pen Script', cursive, sans-serif"
    }
  };

  // 구글 웹폰트 import 대상 (프리셋 키 → css2 family 파라미터)
  const WEB_FONT_FAMILIES = {
    'noto-sans-kr': 'Noto+Sans+KR:wght@400;700',
    'noto-serif-kr': 'Noto+Serif+KR:wght@400;700',
    'nanum-gothic': 'Nanum+Gothic:wght@400;700',
    'inter': 'Inter:wght@400;600',
    'noto-sans-jp': 'Noto+Sans+JP:wght@400;700',
    'noto-sans-sc': 'Noto+Sans+SC:wght@400;700',
    'cursive': 'Caveat:wght@600',
  };
  const GENERIC_FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

  // 직접 입력한 글꼴명 정리: 따옴표·<>;{}\ 제거 후 쉼표로 나눠 각 글꼴을 작은따옴표로 감쌈
  // (style="..." 속성과 CSS 어디에 넣어도 깨지지 않도록 큰따옴표를 쓰지 않음)
  function sanitizeCustomFontList(customVal) {
    return String(customVal || '')
      .replace(/["'<>;{}\\]/g, '')
      .split(',')
      .map(name => name.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .map(name => (GENERIC_FONT_FAMILIES.includes(name.toLowerCase()) ? name.toLowerCase() : `'${name}'`))
      .join(', ');
  }

  function getFontFamilyCss(key, customVal) {
    if (key === 'custom') {
      const list = sanitizeCustomFontList(customVal);
      return list ? `${list}, sans-serif` : FONT_PRESETS['system'].css;
    }
    if (FONT_PRESETS[key]) {
      return FONT_PRESETS[key].css;
    }
    return FONT_PRESETS['system'].css;
  }

  function getFieldFontCss(field) {
    if (!field || !field.fontSelect) return '';
    const val = field.fontSelect.value;
    if (val === 'inherit') return '';
    const custom = field.fontCustomInput ? field.fontCustomInput.value : '';
    return getFontFamilyCss(val, custom);
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
      sizeSlider: document.getElementById('f1_size'),
      sizeNum: document.getElementById('f1_size_num'),
      sizeVal: document.getElementById('f1_size_val'),
      weightSelect: document.getElementById('f1_weight'),
      fontSelect: document.getElementById('f1_font'),
      fontCustomInput: document.getElementById('f1_font_custom'),
      colorInput: document.getElementById('f1_color'),
      colorText: document.getElementById('f1_color_text'),
      deleteBtn: null,
      hasDictLink: false,
      hasWikiLink: false,
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
      sizeSlider: document.getElementById('f2_size'),
      sizeNum: document.getElementById('f2_size_num'),
      sizeVal: document.getElementById('f2_size_val'),
      weightSelect: document.getElementById('f2_weight'),
      fontSelect: document.getElementById('f2_font'),
      fontCustomInput: document.getElementById('f2_font_custom'),
      colorInput: document.getElementById('f2_color'),
      colorText: document.getElementById('f2_color_text'),
      deleteBtn: null,
      hasDictLink: true,
      hasWikiLink: false,
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
  const inspectorFontCustom = document.getElementById('inspectorFontCustom');
  const inspectorColor = document.getElementById('inspectorColor');
  const inspectorColorText = document.getElementById('inspectorColorText');
  const inspectorPresets = document.getElementById('inspectorPresets');

  let selectedFieldIndex = 0;

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
      f.fontSelect.addEventListener('change', () => {
        if (f.fontCustomInput) {
          if (f.fontSelect.value === 'custom') {
            f.fontCustomInput.classList.remove('hidden');
            f.fontCustomInput.focus();
          } else {
            f.fontCustomInput.classList.add('hidden');
          }
        }
        updateAll();
      });
    }

    if (f.fontCustomInput) {
      f.fontCustomInput.addEventListener('input', () => updateAll());
      f.fontCustomInput.addEventListener('change', () => updateAll());
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

  // 필드 링크 적용 여부 설정 (type: 'dict' 외국어사전 | 'wiki' 보조 사전) - 동시 적용 가능
  function setFieldLink(f, type, enabled) {
    if (type === 'dict') f.hasDictLink = enabled;
    if (type === 'wiki') f.hasWikiLink = enabled;
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
    setIfIdle(inspectorFontCustom, f.fontCustomInput ? f.fontCustomInput.value : '');
    inspectorFontCustom.classList.toggle('hidden', inspectorFont.value !== 'custom');
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
      if (inspectorFont.value === 'custom') inspectorFontCustom.focus();
    });

    inspectorFontCustom.addEventListener('input', () => {
      const f = target();
      if (!f || !f.fontCustomInput) return;
      f.fontCustomInput.value = inspectorFontCustom.value;
      f.fontCustomInput.dispatchEvent(new Event('input'));
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
      if (e.target.closest('a')) return;
      const item = e.target.closest('.field-item, .front-preview-hint');
      if (!item) return;

      let idx = 0;
      const match = item.className.match(/f-field-(\d+)/);
      if (match) idx = parseInt(match[1], 10) - 1;
      if (fields[idx] && idx !== selectedFieldIndex) selectField(idx);
    });
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
    let fontCustom = '';
    let color = '#5f6368';
    let hasDictLink = false;
    let hasWikiLink = false;

    if (fieldData) {
      // 저장본에서 복원하는 값은 형식을 검사 (잘못된 값은 기본값 유지)
      if (fieldData.name !== undefined) name = String(fieldData.name);
      if (fieldData.sample !== undefined) sample = String(fieldData.sample);
      if (fieldData.showFront !== undefined) showFront = Boolean(fieldData.showFront);
      if (fieldData.showBack !== undefined) showBack = Boolean(fieldData.showBack);
      if (fieldData.size !== undefined) size = Math.round(clampNumber(fieldData.size, SIZE_MIN, SIZE_MAX, size));
      if (WEIGHT_VALUES.includes(String(fieldData.weight))) weight = String(fieldData.weight);
      if (fieldData.font !== undefined && (fieldData.font === 'inherit' || fieldData.font === 'custom' || FONT_PRESETS[fieldData.font])) font = fieldData.font;
      if (fieldData.fontCustom !== undefined) fontCustom = String(fieldData.fontCustom);
      if (fieldData.color !== undefined) color = normalizeHexColor(fieldData.color) || color;
      if (fieldData.hasDictLink !== undefined) hasDictLink = Boolean(fieldData.hasDictLink);
      if (fieldData.hasWikiLink !== undefined) hasWikiLink = Boolean(fieldData.hasWikiLink);
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
            <label class="mini-toggle" title="${t('editor.field.showFrontTitle')}">
              <input type="checkbox" class="f-show-front"${showFront ? ' checked' : ''}>
              <span>${t('editor.field.showFront')}</span>
            </label>
            <label class="mini-toggle" title="${t('editor.field.showBackTitle')}">
              <input type="checkbox" class="f-show-back"${showBack ? ' checked' : ''}>
              <span>${t('editor.field.showBack')}</span>
            </label>
            <label class="mini-toggle mini-toggle-link" title="${t('editor.field.dictLinkTitle')}">
              <input type="checkbox" class="f-dict-link"${hasDictLink ? ' checked' : ''}>
              <span>${t('editor.field.dictLink')}</span>
            </label>
            <label class="mini-toggle mini-toggle-link" title="${t('editor.field.subDictLinkTitle')}">
              <input type="checkbox" class="f-wiki-link"${hasWikiLink ? ' checked' : ''}>
              <span class="sub-dict-label">${getSubDictLabel()}</span>
            </label>
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
          <label class="sub-label">${t('editor.style.sizeLabel')} <span class="f-size-val">${size}</span>px</label>
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
            <option value="system"${font === 'system' ? ' selected' : ''}>${t('editor.font.system')}</option>
            <option value="noto-sans-kr"${font === 'noto-sans-kr' ? ' selected' : ''}>${t('editor.font.notoSansKr')}</option>
            <option value="noto-serif-kr"${font === 'noto-serif-kr' ? ' selected' : ''}>${t('editor.font.notoSerifKr')}</option>
            <option value="nanum-gothic"${font === 'nanum-gothic' ? ' selected' : ''}>${t('editor.font.nanumGothic')}</option>
            <option value="inter"${font === 'inter' ? ' selected' : ''}>${t('editor.font.inter')}</option>
            <option value="noto-sans-jp"${font === 'noto-sans-jp' ? ' selected' : ''}>${t('editor.font.notoSansJp')}</option>
            <option value="noto-sans-sc"${font === 'noto-sans-sc' ? ' selected' : ''}>${t('editor.font.notoSansSc')}</option>
            <option value="monospace"${font === 'monospace' ? ' selected' : ''}>${t('editor.font.monospace')}</option>
            <option value="cursive"${font === 'cursive' ? ' selected' : ''}>${t('editor.font.cursive')}</option>
            <option value="custom"${font === 'custom' ? ' selected' : ''}>${t('editor.font.custom')}</option>
          </select>
          <input type="text" class="form-input font-custom-input f-font-custom${font === 'custom' ? '' : ' hidden'}" value="${escapeHtml(fontCustom || '')}" placeholder="${t('editor.style.fontCustomPlaceholder')}">
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
      sizeSlider: box.querySelector('.f-size'),
      sizeNum: box.querySelector('.f-size-num'),
      sizeVal: box.querySelector('.f-size-val'),
      weightSelect: box.querySelector('.f-weight'),
      fontSelect: box.querySelector('.f-font'),
      fontCustomInput: box.querySelector('.f-font-custom'),
      colorInput: box.querySelector('.f-color'),
      colorText: box.querySelector('.f-color-text'),
      deleteBtn: box.querySelector('.btn-delete-field'),
      hasDictLink: hasDictLink,
      hasWikiLink: hasWikiLink,
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

      [
        { type: 'dict', text: t('editor.field.dictLink'), checked: Boolean(f.hasDictLink) },
        { type: 'wiki', text: getSubDictLabel(), checked: Boolean(f.hasWikiLink) },
      ].forEach(opt => {
        const label = document.createElement('label');
        label.className = 'custom-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = opt.checked;
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
      cardBaseFont.addEventListener('change', () => {
        if (cardBaseFontCustom) {
          if (cardBaseFont.value === 'custom') {
            cardBaseFontCustom.classList.remove('hidden');
            cardBaseFontCustom.focus();
          } else {
            cardBaseFontCustom.classList.add('hidden');
          }
        }
        updateAll();
      });
    }
    if (cardBaseFontCustom) {
      cardBaseFontCustom.addEventListener('input', updateAll);
      cardBaseFontCustom.addEventListener('change', updateAll);
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

    // 전체 설정 초기화 버튼
    const resetAllSettingsBtn = document.getElementById('resetAllSettingsBtn');
    if (resetAllSettingsBtn) {
      resetAllSettingsBtn.addEventListener('click', resetAllSettings);
    }

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
      color: keepStyle ? f1.colorInput.value : '#64748b',
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

  function buildFieldBlock(field, isForPreview = false, fieldIndex = 1) {
    const idx = fieldIndex - 1;

    if (isForPreview) {
      // 미리보기는 생성된 CSS를 불러오지 않으므로 같은 서식을 인라인 스타일로 적용
      const sampleValue = field.sampleInput.value.trim() || getFieldDisplayName(field, idx);
      const isDarkMode = Boolean(ankiCardWrapper && ankiCardWrapper.classList.contains('dark-mode'));
      const color = isDarkMode ? getDarkModeColor(field.colorInput.value) : field.colorInput.value;
      const divStyle = getFieldStyleDecls(field, color).join(' ');
      return `<div class="field-item f-field-${fieldIndex}" style="${escapeHtml(divStyle)}">${escapeHtml(sampleValue)}${buildPreviewLinkButtons(field, sampleValue)}</div>`;
    }

    // Anki 서식: 스타일은 생성 CSS(.f-field-N)에만 두어 Anki [스타일] 탭에서 고칠 수 있게 함
    return `<div class="field-item f-field-${fieldIndex}">${buildAnkiFieldContent(field, idx)}</div>`;
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
      `<a class="link-btn ${target.cls}" href="${escapeHtml(target.url + encodeURIComponent(query))}"${targetAttr} title="${escapeHtml(target.title)}" style="${LINK_BTN_INLINE_STYLE}">${target.icon}</a>`
    ).join('');
  }

  // Anki 서식용 필드 내용: 링크가 있으면 필드 값을 .link-src로 감싸고, 아이콘은 필드가 비어 있지 않을 때만 표시
  // (href에는 사전 주소만 넣고, 검색어는 카드 스크립트가 .link-src 텍스트로 채움 → & # " 등이 들어 있어도 안전)
  function buildAnkiFieldContent(field, idx) {
    const name = getAnkiFieldName(field, idx);
    const linkTargets = getLinkTargets(field);
    if (linkTargets.length === 0) return `{{${name}}}`;

    const targetAttr = linkNewTab.checked ? ' target="_blank"' : '';
    const buttons = linkTargets.map(target => {
      const base = escapeHtml(target.url);
      return `<a class="link-btn ${target.cls}" href="${base}" data-base="${base}"${targetAttr} title="${escapeHtml(target.title)}">${target.icon}</a>`;
    }).join('');
    return `<span class="link-src">{{${name}}}</span>{{#${name}}}${buttons}{{/${name}}}`;
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
      return `{{${getAnkiFieldName(fields[0], 0)}}}`;
    }

    return withLinkQueryScript(activeFrontFields.map(item => buildFieldBlock(item.field, false, item.index)).join('\n\n'));
  }

  // 5. Anki 뒷면 서식 생성
  function generateBackTemplate() {
    const parts = [];

    // 앞면 내용 유지 여부 (서식은 생성 CSS의 .front-preview-hint 규칙)
    if (keepFrontOnBack.checked && fields[0]) {
      parts.push(`<div class="front-preview-hint">${buildAnkiFieldContent(fields[0], 0)}</div>`);
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

    return withLinkQueryScript(parts.join('\n\n'));
  }

  // 6. Anki CSS 서식 생성 (다크모드 완벽 대응)
  function generateCssTemplate() {
    const isRtl = rtlForce.checked;
    const align = centerAlign.checked ? 'center' : (isRtl ? 'right' : 'left');

    const cardFontKey = cardBaseFont ? cardBaseFont.value : 'system';
    const cardFontCustom = cardBaseFontCustom ? cardBaseFontCustom.value : '';
    const cardFontCss = getFontFamilyCss(cardFontKey, cardFontCustom);
    const cardLineHeightVal = cardLineHeight ? cardLineHeight.value : '1.5';

    const darkF1ColorOnBack = getDarkModeColor(getFrontHintStyle().color);
    const frontHintDecls = getFrontHintDecls().join('\n  ');

    // 구글 웹폰트 import: 실제로 쓰는 글꼴(카드 기본 글꼴 + 필드별 글꼴)만 불러옴
    const usedFontKeys = new Set([cardFontKey]);
    fields.forEach(f => {
      if (f.fontSelect && f.fontSelect.value !== 'inherit') usedFontKeys.add(f.fontSelect.value);
    });
    const webFontParams = Object.keys(WEB_FONT_FAMILIES)
      .filter(key => usedFontKeys.has(key))
      .map(key => `family=${WEB_FONT_FAMILIES[key]}`);
    const fontImportHeader = webFontParams.length
      ? `@import url('https://fonts.googleapis.com/css2?${webFontParams.join('&')}&display=swap');\n\n`
      : '';

    let fieldStyles = '';
    let nightModeStyles = '';

    fields.forEach((f, idx) => {
      const fNum = idx + 1;
      const darkColor = getDarkModeColor(f.colorInput.value);

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

    return `${fontImportHeader}.card {
  font-family: ${cardFontCss};
  font-size: 20px;
  text-align: ${align};
${isRtl ? '  direction: rtl;\n' : ''}  color: #202124;
  background-color: #ffffff;
  line-height: ${cardLineHeightVal};
}

.field-item {
  margin-bottom: 8px;
}

.front-preview-hint {
  ${frontHintDecls}
}

hr#answer {
  border: none;
  border-top: 1px solid #cbd5e1;
  margin: 1.25rem 0;
  width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

/* ${t('editor.cssComment.linkButtons')} */
.link-btn {
  font-size: 0.6em;
  margin-left: 0.35em;
  text-decoration: none;
  opacity: 0.75;
  vertical-align: middle;
}

.link-btn:hover {
  opacity: 1;
}

/* ${t('editor.cssComment.fieldStyles')} */${fieldStyles}

/* =======================================
   ${t('editor.cssComment.nightMode')}
   ======================================= */
.card.nightMode,
.card.night_mode {
  color: #f8fafc;
  background-color: #2f2f31;
}

.nightMode hr#answer,
.night_mode hr#answer {
  border-top-color: #4b5563;
}

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

    const cardFontKey = cardBaseFont ? cardBaseFont.value : 'system';
    const cardFontCustom = cardBaseFontCustom ? cardBaseFontCustom.value : '';
    liveCardRender.style.fontFamily = getFontFamilyCss(cardFontKey, cardFontCustom);
    liveCardRender.style.lineHeight = cardLineHeight ? cardLineHeight.value : '1.5';

    const isDark = Boolean(ankiCardWrapper && ankiCardWrapper.classList.contains('dark-mode'));

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
        const f1Color = isDark ? getDarkModeColor(f1BaseColor) : f1BaseColor;
        const hintStyle = getFrontHintDecls(f1Color).join(' ');

        parts.push(`<div class="front-preview-hint" style="${escapeHtml(hintStyle)}">${escapeHtml(f1Sample)}${buildPreviewLinkButtons(fields[0], f1Sample)}</div>`);
      }

      // 구분선
      if (showHrAnswer.checked) {
        parts.push('<hr id="answer">');
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

    liveCardRender.innerHTML = html;

    // 공용 스타일 편집 패널의 선택 필드 강조 및 패널 값 갱신 (필드 삭제 시 범위 보정)
    selectedFieldIndex = Math.max(0, Math.min(selectedFieldIndex, fields.length - 1));
    const selectedEl = liveCardRender.querySelector(`.f-field-${selectedFieldIndex + 1}`);
    if (selectedEl) selectedEl.classList.add('is-selected');
    syncInspector();
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
  const STORAGE_KEY = 'anki_card_editor_settings';
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
        version: 1,
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
        cardBaseFont: cardBaseFont ? cardBaseFont.value : 'system',
        cardBaseFontCustom: cardBaseFontCustom ? cardBaseFontCustom.value : '',
        cardLineHeight: cardLineHeight ? cardLineHeight.value : '1.5',
        frontOnBackSize: frontOnBackSize ? frontOnBackSize.value : 24,
        syncFrontSizeWithF1: syncFrontSizeWithF1 ? syncFrontSizeWithF1.checked : true,
        frontOnBackKeepStyle: frontOnBackKeepStyle ? frontOnBackKeepStyle.checked : true,
        fields: fields.map(f => ({
          name: f.nameInput.value,
          sample: f.sampleInput.value,
          showFront: f.showFront.checked,
          showBack: f.showBack.checked,
          size: f.sizeSlider.value,
          weight: f.weightSelect.value,
          font: f.fontSelect ? f.fontSelect.value : 'inherit',
          fontCustom: f.fontCustomInput ? f.fontCustomInput.value : '',
          color: f.colorInput.value,
          hasDictLink: Boolean(f.hasDictLink),
          hasWikiLink: Boolean(f.hasWikiLink),
        })),
        // 사용자가 직접 확인할 수 있도록 완성본 서식 전체(HTML/CSS 코드)도 통째로 함께 보관
        templates: {
          front: frontCode,
          back: backCode,
          css: cssCode
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSaveIndicator(t('common.autoSaved'));
    } catch (err) {
      console.warn('localStorage 저장 실패:', err);
    }
  }

  function loadSettingsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;

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
      if (data.cardBaseFont !== undefined && cardBaseFont) {
        cardBaseFont.value = data.cardBaseFont;
        if (cardBaseFontCustom) {
          if (data.cardBaseFont === 'custom') {
            cardBaseFontCustom.classList.remove('hidden');
            cardBaseFontCustom.value = data.cardBaseFontCustom || '';
          } else {
            cardBaseFontCustom.classList.add('hidden');
          }
        }
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
            if (fData.font !== undefined && f.fontSelect && [...f.fontSelect.options].some(o => o.value === fData.font)) {
              f.fontSelect.value = fData.font;
              if (f.fontCustomInput) {
                if (fData.font === 'custom') {
                  f.fontCustomInput.classList.remove('hidden');
                  f.fontCustomInput.value = String(fData.fontCustom || '');
                } else {
                  f.fontCustomInput.classList.add('hidden');
                }
              }
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

      return true;
    } catch (err) {
      console.warn('localStorage 복원 실패:', err);
      return false;
    }
  }

  // 10. 전체 설정 초기화 (기본값으로 복원)
  function resetAllSettings() {
    if (!confirm(t('editor.confirm.resetAll'))) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    // 1. 언어 기본값 (영어) · 다른 도구와의 언어 연동 기록도 초기화
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

    // 공통 레이아웃 & 폰트
    showHrAnswer.checked = true;
    keepFrontOnBack.checked = true;
    centerAlign.checked = true;
    rtlForce.checked = false;
    rtlNotice.classList.add('hidden');

    if (cardBaseFont) {
      cardBaseFont.value = 'system';
      if (cardBaseFontCustom) {
        cardBaseFontCustom.classList.add('hidden');
        cardBaseFontCustom.value = '';
      }
    }
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

    // 필드 1 기본값 (Front / 한국어 뜻)
    fields[0].nameInput.value = 'Front';
    fields[0].sampleInput.value = sample.field1 || '';
    fields[0].showFront.checked = true;
    fields[0].showBack.checked = false;
    fields[0].sizeSlider.value = 24;
    fields[0].sizeNum.value = 24;
    fields[0].sizeVal.textContent = '24';
    fields[0].weightSelect.value = 'bold';
    if (fields[0].fontSelect) {
      fields[0].fontSelect.value = 'inherit';
      if (fields[0].fontCustomInput) {
        fields[0].fontCustomInput.classList.add('hidden');
        fields[0].fontCustomInput.value = '';
      }
    }
    fields[0].colorInput.value = '#202124';
    fields[0].colorText.value = '#202124';
    fields[0].hasDictLink = false;
    fields[0].hasWikiLink = false;

    // 필드 2 기본값 (Back / 외국어 단어 · 사전 링크)
    fields[1].nameInput.value = 'Back';
    fields[1].sampleInput.value = sample.field2 || '';
    fields[1].showFront.checked = false;
    fields[1].showBack.checked = true;
    fields[1].sizeSlider.value = 24;
    fields[1].sizeNum.value = 24;
    fields[1].sizeVal.textContent = '24';
    fields[1].weightSelect.value = 'bold';
    if (fields[1].fontSelect) {
      fields[1].fontSelect.value = 'inherit';
      if (fields[1].fontCustomInput) {
        fields[1].fontCustomInput.classList.add('hidden');
        fields[1].fontCustomInput.value = '';
      }
    }
    fields[1].colorInput.value = '#1a73e8';
    fields[1].colorText.value = '#1a73e8';
    fields[1].hasDictLink = true;
    fields[1].hasWikiLink = false;

    // 3번째 이상 선택 필드 컨테이너 비우고 기본 3번째 필드 1개 생성
    const optionalContainer = document.getElementById('optionalFieldsContainer');
    if (optionalContainer) optionalContainer.innerHTML = '';
    fields.splice(2);

    addOptionalField({
      ...getDefaultThirdField(lang),
      showFront: false,
      showBack: true,
      size: 20,
      weight: 'normal',
      color: '#5f6368',
      hasDictLink: false,
    }, false);

    fields.forEach(f => updateFieldNameWarning(f));
    updateFieldBadges();
    updateDictFieldChecklist();

    fields.forEach(f => {
      if (f.dictLinkCheck) f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      if (f.wikiLinkCheck) f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
    });
    renderEditorQuickChips(lang.id);

    updateAll(false);
    saveSettingsToStorage();
    updateSaveIndicator(t('common.resetDone'));
    showToast(t('editor.toast.resetDone'));
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
