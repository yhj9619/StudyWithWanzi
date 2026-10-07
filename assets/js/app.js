// Anki 카드 스크립트 에디터 - 메인 애플리케이션 로직
document.addEventListener('DOMContentLoaded', () => {
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
  const rtlNotice = document.getElementById('rtlNotice');
  const linkNewTab = document.getElementById('linkNewTab');
  const wikiUrlInput = document.getElementById('wikiUrlInput');
  const resetWikiUrlBtn = document.getElementById('resetWikiUrlBtn');
  const DEFAULT_WIKI_URL = 'https://ko.wikipedia.org/wiki/';
  // 사전 / 위키 아이콘 버튼 인라인 스타일 (CSS 미적용 환경에서도 동일하게 보이도록)
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
      name: '시스템 기본 고딕',
      css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif'
    },
    'noto-sans-kr': {
      name: '본고딕 (Noto Sans KR)',
      css: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif'
    },
    'noto-serif-kr': {
      name: '명조체 (Noto Serif KR)',
      css: '"Noto Serif KR", "Nanum Myeongjo", "Batang", serif'
    },
    'nanum-gothic': {
      name: '나눔고딕',
      css: '"Nanum Gothic", "Malgun Gothic", sans-serif'
    },
    'inter': {
      name: 'Inter (영문 고딕)',
      css: '"Inter", "Roboto", -apple-system, sans-serif'
    },
    'noto-sans-jp': {
      name: 'Noto Sans JP (일본어)',
      css: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif'
    },
    'noto-sans-sc': {
      name: 'Noto Sans SC (중국어 간체)',
      css: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
    },
    'monospace': {
      name: '고정폭 (코딩체)',
      css: 'Consolas, Menlo, Monaco, "Courier New", monospace'
    },
    'cursive': {
      name: '손글씨 (필기체)',
      css: 'Caveat, "Nanum Pen Script", cursive, sans-serif'
    }
  };

  function getFontFamilyCss(key, customVal) {
    if (key === 'custom') {
      const trimmed = (customVal || '').trim();
      return trimmed ? `"${trimmed}", sans-serif` : FONT_PRESETS['system'].css;
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

  // Field Elements
  const box1 = document.getElementById('boxField1');
  const box2 = document.getElementById('boxField2');

  const fields = [
    {
      boxEl: box1,
      badgeEl: document.getElementById('f1_badge'),
      nameInput: document.getElementById('f1_name'),
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

  // 한글 초성 검색 지원 헬퍼 (예: 'ㅍㄹㅅ' -> 프랑스어, 'ㅅㅍㅇ' -> 스페인어, 'ㅈㄱ' -> 중국어)
  const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  function getChosung(text) {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        const chosungIndex = Math.floor((code - 0xAC00) / (21 * 28));
        result += CHOSUNG_LIST[chosungIndex];
      } else {
        result += text[i];
      }
    }
    return result;
  }

  let activeFocusIndex = -1;

  // 1. 언어 셀렉트 박스 및 검색형 콤보박스 초기화
  function initLanguageSelect() {
    languageSelect.innerHTML = '';
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    list.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.id;
      option.textContent = lang.name;
      // 중국어를 기본 선택 (사용자 기존 예시가 zh.dict.naver.com 및 pinyin이었음)
      if (lang.id === 'zh') {
        option.selected = true;
      }
      languageSelect.appendChild(option);
    });

    const initialLang = getSelectedLanguage();
    if (langSearchInput) {
      langSearchInput.value = initialLang.name;
    }

    initComboboxEvents();
  }

  function initComboboxEvents() {
    if (!langSearchInput) return;

    function openDropdown(filter = '') {
      langDropdownWrapper.classList.remove('hidden');
      langToggleBtn.classList.add('open');
      langSearchInput.setAttribute('aria-expanded', 'true');
      renderLangDropdown(filter);
      updateClearBtn();
      activeFocusIndex = -1;

      // 현재 선택된 항목으로 부드럽게 스크롤 이동
      const selectedItem = langDropdownList.querySelector('.dropdown-item.selected');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }

    function closeDropdown() {
      langDropdownWrapper.classList.add('hidden');
      langToggleBtn.classList.remove('open');
      langSearchInput.setAttribute('aria-expanded', 'false');
      const cur = getSelectedLanguage();
      langSearchInput.value = cur.name;
      updateClearBtn();
      activeFocusIndex = -1;
    }

    function updateClearBtn() {
      if (langSearchInput.value.trim().length > 0) {
        langClearBtn.classList.remove('hidden');
      } else {
        langClearBtn.classList.add('hidden');
      }
    }

    function renderLangDropdown(filterText = '') {
      const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
      const query = filterText.trim().toLowerCase();
      const queryChosung = getChosung(query);

      let filtered = list;
      if (query) {
        filtered = list.filter(lang => {
          const nameLower = lang.name.toLowerCase();
          const idLower = lang.id.toLowerCase();
          const langChosung = getChosung(lang.name);
          return nameLower.includes(query) ||
                 langChosung.includes(query) ||
                 langChosung.includes(queryChosung) ||
                 idLower.includes(query);
        });
      }

      filteredLangCount.textContent = filtered.length;
      langDropdownList.innerHTML = '';

      if (filtered.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'dropdown-empty';
        emptyLi.textContent = `'${filterText}' 검색 결과가 없습니다.`;
        langDropdownList.appendChild(emptyLi);
        return;
      }

      const currentSelectedId = languageSelect.value;
      filtered.forEach((lang) => {
        const li = document.createElement('li');
        li.className = 'dropdown-item';
        if (lang.id === currentSelectedId) {
          li.classList.add('selected');
        }
        li.setAttribute('role', 'option');
        li.dataset.id = lang.id;
        li.innerHTML = `
          <span class="lang-name">
            <span>${escapeHtml(lang.name)}</span>
            <span class="lang-tag">${lang.id.toUpperCase()}</span>
          </span>
          ${lang.id === currentSelectedId ? '<span class="check-icon">✓</span>' : ''}
        `;

        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectLang(lang.id);
        });

        langDropdownList.appendChild(li);
      });
    }

    function selectLang(id) {
      languageSelect.value = id;
      const lang = getSelectedLanguage();
      langSearchInput.value = lang.name;
      closeDropdown();
      onLanguageChange(true);
    }

    // 클릭 시 드롭다운 열기 및 텍스트 선택
    langSearchInput.addEventListener('click', () => {
      openDropdown(langSearchInput.value);
      langSearchInput.select();
    });

    langSearchInput.addEventListener('focus', () => {
      openDropdown(langSearchInput.value);
      langSearchInput.select();
    });

    langSearchInput.addEventListener('input', (e) => {
      openDropdown(e.target.value);
    });

    // 키보드 네비게이션 (방향키, 엔터, ESC)
    langSearchInput.addEventListener('keydown', (e) => {
      const items = langDropdownList.querySelectorAll('.dropdown-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (langDropdownWrapper.classList.contains('hidden')) {
          openDropdown(langSearchInput.value);
          return;
        }
        activeFocusIndex = (activeFocusIndex + 1) % items.length;
        updateFocusedItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (langDropdownWrapper.classList.contains('hidden')) {
          openDropdown(langSearchInput.value);
          return;
        }
        activeFocusIndex = (activeFocusIndex - 1 + items.length) % items.length;
        updateFocusedItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeFocusIndex >= 0 && items[activeFocusIndex]) {
          selectLang(items[activeFocusIndex].dataset.id);
        } else if (items.length > 0) {
          selectLang(items[0].dataset.id);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    function updateFocusedItem(items) {
      items.forEach((item, idx) => {
        if (idx === activeFocusIndex) {
          item.classList.add('focused');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('focused');
        }
      });
    }

    // 토글 버튼 (▼)
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (langDropdownWrapper.classList.contains('hidden')) {
        openDropdown();
        langSearchInput.focus();
        langSearchInput.select();
      } else {
        closeDropdown();
      }
    });

    // 클리어 버튼 (X)
    langClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSearchInput.value = '';
      langSearchInput.focus();
      openDropdown('');
    });

    // 바깥 영역 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!langSelectContainer.contains(e.target)) {
        if (!langDropdownWrapper.classList.contains('hidden')) {
          closeDropdown();
        }
      }
    });
  }

  function getSelectedLanguage() {
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    const selectedId = languageSelect.value;
    return list.find(lang => lang.id === selectedId) || list[0];
  }

  function onLanguageChange(isUserManualChange = true, shouldSave = true) {
    const lang = getSelectedLanguage();
    dictUrlInput.value = lang.dictUrl;
    dictNameTag.textContent = lang.dictName;

    // RTL 알림 및 자동 적용
    if (lang.isRTL) {
      rtlNotice.classList.remove('hidden');
      if (isUserManualChange) {
        rtlForce.checked = true;
      }
    } else {
      rtlNotice.classList.add('hidden');
      if (isUserManualChange) {
        rtlForce.checked = false;
      }
    }

    // 3번째 필드가 존재할 경우 언어에 맞춰 기본값/플레이스홀더 동기화
    if (fields.length >= 3) {
      const f3Input = fields[2].nameInput;
      const currentF3Val = f3Input.value.trim();

      if (lang.id === 'zh') {
        f3Input.placeholder = '예: pinyin, 발음';
        if (!currentF3Val || currentF3Val === 'Example' || currentF3Val === 'example' || currentF3Val === 'sample') {
          f3Input.value = 'pinyin';
        }
      } else {
        f3Input.placeholder = '예: Example, sample, 예문';
        if (!currentF3Val || currentF3Val === 'pinyin') {
          f3Input.value = 'Example';
        }
      }
    }

    // 언어 변경 시 예시 샘플 자동 채우기 (사용자가 직접 변경한 경우)
    if (isUserManualChange && lang.sample) {
      if (fields[0]) fields[0].sampleInput.value = lang.sample.field1 || '';
      if (fields[1]) fields[1].sampleInput.value = lang.sample.field2 || '';
      if (fields.length >= 3 && lang.sample.field3) {
        fields[2].sampleInput.value = lang.sample.field3;
      }
    }

    updateFieldBadges();
    updateDictFieldChecklist();
    renderEditorQuickChips(lang.id);
    updateAll(shouldSave);
  }

  // 필드 이벤트 바인딩 헬퍼 (초기 1, 2번째 필드 및 동적 추가 필드 공통)
  function bindFieldEvents(f) {
    // 필드명 변경 시 배지 및 3번 사전 링크 체크리스트, 서식 즉시 갱신
    f.nameInput.addEventListener('input', () => {
      updateFieldBadges();
      updateDictFieldChecklist();
      updateAll();
    });
    f.nameInput.addEventListener('change', () => {
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

    // 사전 / 위키 링크 체크박스 (헤더 미니 토글, 둘 중 하나만 선택)
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
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 20;
      if (val < 10) val = 10;
      if (val > 80) val = 80;
      f.sizeSlider.value = val;
      f.sizeVal.textContent = val;
      if (f === fields[0] && syncFrontSizeWithF1 && syncFrontSizeWithF1.checked && frontOnBackSize) {
        frontOnBackSize.value = val;
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = val;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = val + 'px';
      }
      updateAll();
    });
    f.sizeNum.addEventListener('change', () => updateAll());

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

  // 필드 링크 적용 여부 설정 (type: 'dict' | 'wiki') - 사전 / 위키 동시 적용 가능
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

    const fName = f.nameInput.value.trim() || `Field${selectedFieldIndex + 1}`;
    inspectorFieldName.textContent = `${selectedFieldIndex + 1}번째 필드 [${fName}]`;

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
      chip.textContent = `${idx + 1}. ${field.nameInput.value.trim() || `Field${idx + 1}`}`;
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
      if (f) inspectorSizeNum.value = f.sizeSlider.value;
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

    // 미리보기 카드 속 필드 텍스트 클릭 → 편집 대상 선택 (사전 / 위키 아이콘은 그대로 링크 이동)
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
      if (fieldData.name !== undefined) name = fieldData.name;
      if (fieldData.sample !== undefined) sample = fieldData.sample;
      if (fieldData.showFront !== undefined) showFront = Boolean(fieldData.showFront);
      if (fieldData.showBack !== undefined) showBack = Boolean(fieldData.showBack);
      if (fieldData.size !== undefined) size = fieldData.size;
      if (fieldData.weight !== undefined) weight = fieldData.weight;
      if (fieldData.font !== undefined) font = fieldData.font;
      if (fieldData.fontCustom !== undefined) fontCustom = fieldData.fontCustom;
      if (fieldData.color !== undefined) color = fieldData.color;
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
            <label class="mini-toggle" title="앞면 카드 노출 여부">
              <input type="checkbox" class="f-show-front"${showFront ? ' checked' : ''}>
              <span>앞면 표시</span>
            </label>
            <label class="mini-toggle" title="뒷면 카드 노출 여부">
              <input type="checkbox" class="f-show-back"${showBack ? ' checked' : ''}>
              <span>뒷면 표시</span>
            </label>
            <label class="mini-toggle mini-toggle-link" title="네이버 사전 링크 연결">
              <input type="checkbox" class="f-dict-link"${hasDictLink ? ' checked' : ''}>
              <span>🔗 사전 링크</span>
            </label>
            <label class="mini-toggle mini-toggle-link" title="위키 링크 연결">
              <input type="checkbox" class="f-wiki-link"${hasWikiLink ? ' checked' : ''}>
              <span>📖 위키 링크</span>
            </label>
          </div>
          <button type="button" class="btn-delete-field" title="이 필드 삭제">
            🗑️ 삭제
          </button>
        </div>
      </div>

      <div class="grid-2-col">
        <div class="form-group">
          <label class="form-label">필드명 (Anki와 일치해야 함)</label>
          <input type="text" class="form-input f-name" value="${escapeHtml(name)}" placeholder="예: Example, pinyin, 예문">
        </div>
        <div class="form-group">
          <label class="form-label">미리보기 예시값</label>
          <input type="text" class="form-input f-sample" value="${escapeHtml(sample)}" placeholder="예시 내용을 입력하세요">
        </div>
      </div>

      <div class="style-controls-row">
        <div class="control-item">
          <label class="sub-label">글씨 크기: <span class="f-size-val">${size}</span>px</label>
          <div class="slider-with-number">
            <input type="range" min="14" max="64" value="${size}" class="form-range f-size">
            <input type="number" min="14" max="80" value="${size}" class="num-input f-size-num">
          </div>
        </div>

        <div class="control-item">
          <label class="sub-label">글씨 굵기</label>
          <select class="form-select small-select f-weight">
            <option value="normal"${weight === 'normal' ? ' selected' : ''}>보통 (normal)</option>
            <option value="bold"${weight === 'bold' ? ' selected' : ''}>굵게 (bold)</option>
            <option value="600"${weight === '600' ? ' selected' : ''}>중간 굵게 (600)</option>
          </select>
        </div>

        <div class="control-item">
          <label class="sub-label">글꼴 (폰트)</label>
          <select class="form-select small-select f-font">
            <option value="inherit"${font === 'inherit' ? ' selected' : ''}>(기본 글꼴 따름)</option>
            <option value="system"${font === 'system' ? ' selected' : ''}>시스템 기본 고딕</option>
            <option value="noto-sans-kr"${font === 'noto-sans-kr' ? ' selected' : ''}>본고딕 (Noto Sans KR)</option>
            <option value="noto-serif-kr"${font === 'noto-serif-kr' ? ' selected' : ''}>명조체 (Noto Serif KR)</option>
            <option value="nanum-gothic"${font === 'nanum-gothic' ? ' selected' : ''}>나눔고딕</option>
            <option value="inter"${font === 'inter' ? ' selected' : ''}>Inter (영문 고딕)</option>
            <option value="noto-sans-jp"${font === 'noto-sans-jp' ? ' selected' : ''}>Noto Sans JP (일본어)</option>
            <option value="noto-sans-sc"${font === 'noto-sans-sc' ? ' selected' : ''}>Noto Sans SC (중국어)</option>
            <option value="monospace"${font === 'monospace' ? ' selected' : ''}>고정폭 (코딩체)</option>
            <option value="cursive"${font === 'cursive' ? ' selected' : ''}>손글씨 (필기체)</option>
            <option value="custom"${font === 'custom' ? ' selected' : ''}>직접 입력...</option>
          </select>
          <input type="text" class="form-input font-custom-input f-font-custom${font === 'custom' ? '' : ' hidden'}" value="${escapeHtml(fontCustom || '')}" placeholder="폰트명 입력 (예: Pretendard)">
        </div>

        <div class="control-item">
          <label class="sub-label">색상</label>
          <div class="color-picker-group">
            <input type="color" value="${color}" class="form-color f-color">
            <input type="text" value="${color}" class="color-hex-input f-color-text" maxlength="7">
          </div>
        </div>
      </div>
      <div class="preset-colors">
        <span class="preset-label">색상 프리셋:</span>
        <button type="button" class="preset-dot" data-color="#5f6368" style="background:#5f6368;" title="뮤트 그레이"></button>
        <button type="button" class="preset-dot" data-color="#202124" style="background:#202124;" title="다크 그레이"></button>
        <button type="button" class="preset-dot" data-color="#1a73e8" style="background:#1a73e8;" title="구글 블루"></button>
        <button type="button" class="preset-dot" data-color="#0d904f" style="background:#0d904f;" title="에메랄드"></button>
        <button type="button" class="preset-dot" data-color="#e37400" style="background:#e37400;" title="오렌지"></button>
      </div>
    `;

    optionalFieldsContainer.appendChild(box);

    const fObj = {
      boxEl: box,
      badgeEl: box.querySelector('.field-badge'),
      nameInput: box.querySelector('.f-name'),
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
      ? `'${rawName}' 필드를 정말 삭제하시겠습니까?`
      : `${idx + 1}번째 필드를 정말 삭제하시겠습니까?`;

    if (!confirm(promptText)) {
      return;
    }

    fObj.boxEl.remove();
    fields.splice(idx, 1);
    updateFieldBadges();
    updateDictFieldChecklist();
    updateAll(true);
    showToast('선택한 필드가 삭제되었습니다.');
  }

  // 언어별 추천 필드 빠른 추가 칩 데이터 생성
  function getEditorQuickChipsForLanguage(langId) {
    const list = window.LANGUAGES_DATA || LANGUAGES_DATA;
    const langObj = list.find(l => l.id === langId) || {};
    const langName = langObj.name || '해당 언어';

    if (langId === 'ja') {
      return [
        {
          label: '+ 후리가나/발음',
          name: '후리가나/발음',
          sample: 'さくら',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문(원문)',
          name: '예문',
          sample: (langObj.sample && langObj.sample.field3) || '公園に桜の花が綺麗に咲いています。',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문 해석',
          name: '예문 해석',
          sample: '공원에 벚꽃이 아름답게 피어 있습니다.',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 품사',
          name: '품사',
          sample: '[명사]',
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 유의어/반의어',
          name: '유의어/반의어',
          sample: '同: 桜花 / 反: -',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 오디오',
          name: '오디오',
          sample: '[sound:sakura.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 학습 메모',
          name: '메모',
          sample: '봄철 회화 필수 표현',
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
          label: '+ 병음 (pinyin)',
          name: '병음',
          sample: (langObj.sample && langObj.sample.field3) || 'nǐ hǎo',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문(원문)',
          name: '예문',
          sample: '你好，很高兴认识你。',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문 해석',
          name: '예문 해석',
          sample: '안녕하세요, 만나서 반갑습니다.',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문 병음',
          name: '예문 병음',
          sample: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 품사',
          name: '품사',
          sample: '[인사/감탄사]',
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 유의어/반의어',
          name: '유의어/반의어',
          sample: '同: 问好 / 反: 再见',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 오디오',
          name: '오디오',
          sample: '[sound:nihao.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 학습 메모',
          name: '메모',
          sample: '기본 인사말',
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
          label: '+ 예문(원문)',
          name: '예문',
          sample: (langObj.sample && langObj.sample.field3) || 'I eat an apple every morning.',
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문 해석',
          name: '예문 해석',
          sample: '나는 매일 아침 사과를 먹는다.',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 발음기호',
          name: '발음기호',
          sample: '[ˈæpl]',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 품사',
          name: '품사',
          sample: '[명사]',
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 유의어/반의어',
          name: '유의어/반의어',
          sample: 'Syn: - / Ant: -',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 오디오',
          name: '오디오',
          sample: '[sound:apple.mp3]',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 학습 메모',
          name: '메모',
          sample: '자주 쓰이는 기본 어휘',
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
          label: '+ 예문(원문)',
          name: '예문',
          sample: (langObj.sample && langObj.sample.field3) || `${langName} 예문 문장입니다.`,
          size: 20,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 예문 해석',
          name: '예문 해석',
          sample: '예문 해석 및 번역 내용',
          size: 16,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 발음/표기',
          name: '발음/표기',
          sample: '발음 표기',
          size: 18,
          weight: 'normal',
          color: '#70757a',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 품사',
          name: '품사',
          sample: '[품사]',
          size: 15,
          weight: '600',
          color: '#1a73e8',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 유의어/반의어',
          name: '유의어/반의어',
          sample: '유의어 / 반의어',
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 오디오',
          name: '오디오',
          sample: `[sound:${langId}_audio.mp3]`,
          size: 15,
          weight: 'normal',
          color: '#5f6368',
          showFront: false,
          showBack: true
        },
        {
          label: '+ 학습 메모',
          name: '메모',
          sample: '학습 메모 및 팁',
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
      badge.textContent = `(${langObj.name} 추천)`;
    }

    container.innerHTML = '';
    const chips = getEditorQuickChipsForLanguage(langId);

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      btn.textContent = chip.label;
      btn.title = `'${chip.name}' 필드를 카드 서식에 즉시 추가합니다`;
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
        showToast(`'${chip.name}' 필드가 추가되었습니다.`);
      });
      container.appendChild(btn);
    });
  }

  // 각 필드의 헤더 배지 라벨 동적 갱신 (노출 위치 및 필드명과 동적 조합)
  function updateFieldBadges() {
    fields.forEach((f, idx) => {
      if (!f.badgeEl) return;
      const fNum = idx + 1;
      const fName = f.nameInput.value.trim() || (idx === 0 ? 'Front' : (idx === 1 ? 'Back' : `Field${fNum}`));

      let sideText = '미노출';
      if (f.showFront.checked && f.showBack.checked) {
        sideText = '앞·뒷면';
      } else if (f.showFront.checked) {
        sideText = '앞면';
      } else if (f.showBack.checked) {
        sideText = '뒷면';
      }

      let badgeText = `${fNum}번째 필드 (${sideText} / ${fName})`;

      if (f.hasDictLink) badgeText += ' · 🔗 사전';
      if (f.hasWikiLink) badgeText += ' · 📖 위키';
      if (f.hasDictLink || f.hasWikiLink) {
        f.badgeEl.className = 'field-badge field-badge-primary';
      } else {
        f.badgeEl.className = 'field-badge';
      }
      f.badgeEl.textContent = badgeText;

      // 상단 헤더의 사전 / 위키 링크 미니 토글 동기화
      if (f.dictLinkCheck) {
        f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      }
      if (f.wikiLinkCheck) {
        f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
      }
    });
  }

  // 3번 영역의 각 필드별 사전 / 위키 링크 체크박스 목록 동적 갱신 (단어·예문 다중 선택 지원)
  function updateDictFieldChecklist() {
    if (!dictFieldChecklist) return;
    dictFieldChecklist.innerHTML = '';

    fields.forEach((f, idx) => {
      const fNum = idx + 1;
      const fName = f.nameInput.value.trim() || `필드 ${fNum}`;

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
      const recTag = (idx === 1) ? ' <span style="color: var(--primary); font-size: 0.8em; font-weight: 700;">(기본 권장)</span>' : '';
      span.className = 'dict-target-name';
      span.innerHTML = `<strong>${fNum}번째 필드 [${escapeHtml(fName)}]</strong>${recTag}`;
      row.appendChild(span);

      const options = document.createElement('div');
      options.className = 'dict-target-options';

      [
        { type: 'dict', text: '🔗 사전 링크', checked: Boolean(f.hasDictLink) },
        { type: 'wiki', text: '📖 위키 링크', checked: Boolean(f.hasWikiLink) },
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

    if (wikiUrlInput) {
      wikiUrlInput.addEventListener('input', updateAll);
      wikiUrlInput.addEventListener('change', updateAll);
    }
    if (resetWikiUrlBtn) {
      resetWikiUrlBtn.addEventListener('click', () => {
        wikiUrlInput.value = DEFAULT_WIKI_URL;
        updateAll();
      });
    }
    linkNewTab.addEventListener('change', updateAll);

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
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 24;
        if (val < 10) val = 10;
        if (val > 80) val = 80;
        if (frontOnBackSize) frontOnBackSize.value = val;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = val + 'px';
        if (syncFrontSizeWithF1) syncFrontSizeWithF1.checked = false;
        updateAll();
      });
      frontOnBackSizeNum.addEventListener('change', updateAll);
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
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 1.5;
        if (val < 1.0) val = 1.0;
        if (val > 3.0) val = 3.0;
        if (cardLineHeight) cardLineHeight.value = val;
        if (cardLineHeightVal) cardLineHeightVal.textContent = val;
        updateAll();
      });
      cardLineHeightNum.addEventListener('change', updateAll);
    }

    // 필드 컨트롤 동기화 (기본 필드 1, 2)
    fields.forEach(f => bindFieldEvents(f));

    // 필드 추가 버튼
    const addFieldBtn = document.getElementById('addFieldBtn');
    if (addFieldBtn) {
      addFieldBtn.addEventListener('click', () => {
        addOptionalField(null, true);
        showToast(`${fields.length}번째 필드가 추가되었습니다.`);
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
      toggleDarkModeBtn.title = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';
      renderPreview();
    });

    // 코드 탭 전환
    document.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-tab-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const tabKey = tab.dataset.tab;
        if (tabKey === 'front') document.getElementById('panelFrontCode').classList.add('active');
        if (tabKey === 'back') document.getElementById('panelBackCode').classList.add('active');
        if (tabKey === 'css') document.getElementById('panelCssCode').classList.add('active');
        if (tabKey === 'guide') document.getElementById('panelGuide').classList.add('active');
      });
    });

    // 복사 버튼
    copyFrontBtn.addEventListener('click', () => copyToClipboard(codeFrontText.textContent, '앞면 서식이'));
    copyBackBtn.addEventListener('click', () => copyToClipboard(codeBackText.textContent, '뒷면 서식이'));
    copyCssBtn.addEventListener('click', () => copyToClipboard(codeCssText.textContent, '스타일(CSS) 서식이'));

    // 모바일 화면 전환 로직 (<= 768px 모바일 전용 탭 네비게이션 & 좌우 전환 플로팅 버튼)
    const btnMobileEditTab = document.getElementById('btnMobileEditTab');
    const btnMobilePreviewTab = document.getElementById('btnMobilePreviewTab');
    const btnGoPreviewMobile = document.getElementById('btnGoPreviewMobile');
    const btnGoEditMobile = document.getElementById('btnGoEditMobile');
    const btnFloatToPreview = document.getElementById('btnFloatToPreview');
    const btnFloatToEdit = document.getElementById('btnFloatToEdit');
    const editorPanel = document.querySelector('.editor-panel');
    const previewPanel = document.querySelector('.preview-panel');

    function showMobileEditView() {
      if (window.innerWidth <= 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.add('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.add('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.remove('active');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'inline-flex';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'none';
        window.scrollTo(0, 0);
      }
    }

    function showMobilePreviewView() {
      if (window.innerWidth <= 768) {
        editorPanel.classList.add('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnMobileEditTab) btnMobileEditTab.classList.remove('active');
        if (btnMobilePreviewTab) btnMobilePreviewTab.classList.add('active');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'none';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'inline-flex';
        window.scrollTo(0, 0);
      }
    }

    if (btnMobileEditTab) btnMobileEditTab.addEventListener('click', showMobileEditView);
    if (btnMobilePreviewTab) btnMobilePreviewTab.addEventListener('click', showMobilePreviewView);
    if (btnGoPreviewMobile) btnGoPreviewMobile.addEventListener('click', showMobilePreviewView);
    if (btnGoEditMobile) btnGoEditMobile.addEventListener('click', showMobileEditView);
    if (btnFloatToPreview) btnFloatToPreview.addEventListener('click', showMobilePreviewView);
    if (btnFloatToEdit) btnFloatToEdit.addEventListener('click', showMobileEditView);

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        editorPanel.classList.remove('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        if (btnFloatToPreview) btnFloatToPreview.style.display = 'none';
        if (btnFloatToEdit) btnFloatToEdit.style.display = 'none';
      } else {
        if (btnMobilePreviewTab && btnMobilePreviewTab.classList.contains('active')) {
          showMobilePreviewView();
        } else {
          showMobileEditView();
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
  function buildFieldBlock(field, isForPreview = false, fieldIndex = 1) {
    const fieldName = field.nameInput.value.trim() || `Field${fieldIndex}`;
    const sampleValue = field.sampleInput.value.trim() || fieldName;
    const size = field.sizeSlider.value;
    const weight = field.weightSelect.value;
    const color = field.colorInput.value;
    const fieldFontCss = getFieldFontCss(field);

    const isDarkMode = isForPreview && Boolean(ankiCardWrapper && ankiCardWrapper.classList.contains('dark-mode'));
    const activeColor = isDarkMode ? getDarkModeColor(color) : color;

    // style 속성 조립
    const styleParts = [];
    if (size) styleParts.push(`font-size: ${size}px;`);
    if (fieldFontCss) styleParts.push(`font-family: ${fieldFontCss};`);
    if (weight && weight !== 'normal') styleParts.push(`font-weight: ${weight};`);
    styleParts.push(`color: ${activeColor};`);
    styleParts.push(`margin-bottom: 8px;`);

    const divStyle = styleParts.join(' ');

    // 텍스트 옆 사전 / 위키 아이콘 버튼 (한 필드에 둘 다 적용 가능)
    const linkTargets = [];
    if (field.hasDictLink) {
      linkTargets.push({ cls: 'dict-btn', icon: '🔗', title: '사전 검색', url: dictUrlInput.value.trim() });
    }
    if (field.hasWikiLink) {
      linkTargets.push({ cls: 'wiki-btn', icon: '📖', title: '위키 검색', url: wikiUrlInput ? wikiUrlInput.value.trim() : DEFAULT_WIKI_URL });
    }

    let linkButtons = '';
    if (linkTargets.length > 0) {
      const targetAttr = linkNewTab.checked ? ' target="_blank"' : '';
      linkButtons = linkTargets.map(t => {
        // 미리보기용: 예시값으로 실제 검색 링크 생성 / Anki 템플릿용: {{FieldName}} 태그 사용
        const href = isForPreview ? t.url + encodeURIComponent(sampleValue) : `${t.url}{{${fieldName}}}`;
        return `<a class="link-btn ${t.cls}" href="${href}"${targetAttr} title="${t.title}" style="${LINK_BTN_INLINE_STYLE}">${t.icon}</a>`;
      }).join('');
    }

    if (isForPreview) {
      return `<div class="field-item f-field-${fieldIndex}" style="${divStyle}">${escapeHtml(sampleValue)}${linkButtons}</div>`;
    }
    return `<div class="field-item f-field-${fieldIndex}" style="font-size: ${size}px;${fieldFontCss ? ` font-family: ${fieldFontCss};` : ''}${weight && weight !== 'normal' ? ` font-weight: ${weight};` : ''} color: ${color}; margin-bottom: 8px;">{{${fieldName}}}${linkButtons}</div>`;
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
      const f1Name = fields[0] ? (fields[0].nameInput.value.trim() || 'Front') : 'Front';
      return `{{${f1Name}}}`;
    }

    return activeFrontFields.map(item => buildFieldBlock(item.field, false, item.index)).join('\n\n');
  }

  // 5. Anki 뒷면 서식 생성
  function generateBackTemplate() {
    const parts = [];

    // 앞면 내용 유지 여부
    if (keepFrontOnBack.checked && fields[0]) {
      const frontName = fields[0].nameInput.value.trim() || 'Front';
      const f1Size = frontOnBackSize ? frontOnBackSize.value : fields[0].sizeSlider.value;
      const f1Weight = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked) ? fields[0].weightSelect.value : 'normal';
      const f1Color = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked) ? fields[0].colorInput.value : '#64748b';
      const f1FontCss = getFieldFontCss(fields[0]);

      parts.push(`<div class="front-preview-hint" style="color: ${f1Color}; font-size: ${f1Size}px;${f1Weight !== 'normal' ? ` font-weight: ${f1Weight};` : ''}${f1FontCss ? ` font-family: ${f1FontCss};` : ''} margin-bottom: 8px;">{{${frontName}}}</div>`);
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

    return parts.join('\n\n');
  }

  // 6. Anki CSS 서식 생성 (다크모드 완벽 대응)
  function generateCssTemplate() {
    const align = centerAlign.checked ? 'center' : 'left';

    const cardFontKey = cardBaseFont ? cardBaseFont.value : 'system';
    const cardFontCustom = cardBaseFontCustom ? cardBaseFontCustom.value : '';
    const cardFontCss = getFontFamilyCss(cardFontKey, cardFontCustom);
    const cardLineHeightVal = cardLineHeight ? cardLineHeight.value : '1.5';

    const f1SizeOnBack = frontOnBackSize ? frontOnBackSize.value : (fields[0] ? fields[0].sizeSlider.value : 24);
    const f1WeightOnBack = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked && fields[0]) ? fields[0].weightSelect.value : 'normal';
    const f1ColorOnBack = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked && fields[0]) ? fields[0].colorInput.value : '#64748b';
    const darkF1ColorOnBack = getDarkModeColor(f1ColorOnBack);
    const f1FontCssOnBack = fields[0] ? getFieldFontCss(fields[0]) : '';

    // 구글 폰트 웹폰트 import 필요 여부 판별
    const webFontKeys = ['noto-sans-kr', 'noto-serif-kr', 'nanum-gothic', 'inter', 'noto-sans-jp', 'noto-sans-sc', 'cursive'];
    const usesWebFont = webFontKeys.includes(cardFontKey) || fields.some(f => f.fontSelect && webFontKeys.includes(f.fontSelect.value));
    const fontImportHeader = usesWebFont ? `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@400;700&family=Nanum+Gothic:wght@400;700&family=Inter:wght@400;600&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Caveat:wght@600&display=swap');\n\n` : '';

    let fieldStyles = '';
    let nightModeStyles = '';

    fields.forEach((f, idx) => {
      const fNum = idx + 1;
      const size = f.sizeSlider.value;
      const weight = f.weightSelect.value;
      const color = f.colorInput.value;
      const darkColor = getDarkModeColor(color);
      const fieldFontCss = getFieldFontCss(f);

      fieldStyles += `\n.f-field-${fNum} {
  font-size: ${size}px;
  ${fieldFontCss ? `font-family: ${fieldFontCss};\n  ` : ''}${weight && weight !== 'normal' ? `font-weight: ${weight};\n  ` : ''}color: ${color};
}`;

      nightModeStyles += `\n.nightMode .f-field-${fNum},
.night_mode .f-field-${fNum},
.nightMode .f-field-${fNum} a,
.night_mode .f-field-${fNum} a {
  color: ${darkColor} !important;
}
@media (prefers-color-scheme: dark) {
  .f-field-${fNum},
  .f-field-${fNum} a {
    color: ${darkColor} !important;
  }
}`;
    });

    return `${fontImportHeader}.card {
  font-family: ${cardFontCss};
  font-size: 20px;
  text-align: ${align};
  color: #202124;
  background-color: #ffffff;
  line-height: ${cardLineHeightVal};
}

.field-item {
  margin-bottom: 8px;
}

.front-preview-hint {
  color: ${f1ColorOnBack};
  font-size: ${f1SizeOnBack}px;
  ${f1WeightOnBack !== 'normal' ? `font-weight: ${f1WeightOnBack};\n  ` : ''}${f1FontCssOnBack ? `font-family: ${f1FontCssOnBack};\n  ` : ''}margin-bottom: 8px;
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

/* 텍스트 옆 사전 / 위키 아이콘 버튼 */
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

/* 필드별 기본 서식 (라이트 모드) */${fieldStyles}

/* =======================================
   🌙 Anki 다크모드 (Night Mode) 완벽 대응
   ======================================= */
.nightMode .card,
.night_mode .card {
  color: #f8fafc;
  background-color: #2f2f31;
}

@media (prefers-color-scheme: dark) {
  .card {
    color: #f8fafc;
    background-color: #2f2f31;
  }
}

.nightMode hr#answer,
.night_mode hr#answer {
  border-top-color: #52525b;
}

@media (prefers-color-scheme: dark) {
  hr#answer {
    border-top-color: #52525b;
  }
}

.nightMode .front-preview-hint,
.night_mode .front-preview-hint {
  color: ${darkF1ColorOnBack} !important;
}

@media (prefers-color-scheme: dark) {
  .front-preview-hint {
    color: ${darkF1ColorOnBack} !important;
  }
}

/* 다크모드 필드별 텍스트 색상 자동 최적화 반전 */${nightModeStyles}
`;
  }

  // 7. 실시간 미리보기 렌더링
  function renderPreview() {
    const isFront = (currentPreviewSide === 'front');
    currentCardSideBadge.textContent = isFront ? '앞면 (Front)' : '뒷면 (Back)';

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
        html = '<div style="color: #94a3b8; font-style: italic;">앞면에 표시할 필드를 설정에서 선택해주세요.</div>';
      } else {
        html = activeFrontFields.map(item => buildFieldBlock(item.field, true, item.index)).join('\n');
      }
    } else {
      const parts = [];

      // 앞면 유지 표시
      if (keepFrontOnBack.checked && fields[0]) {
        const f1Sample = fields[0].sampleInput.value.trim() || fields[0].nameInput.value.trim() || 'Front';
        const f1Size = frontOnBackSize ? frontOnBackSize.value : fields[0].sizeSlider.value;
        const f1Weight = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked) ? fields[0].weightSelect.value : 'normal';
        const f1BaseColor = (frontOnBackKeepStyle && frontOnBackKeepStyle.checked) ? fields[0].colorInput.value : '#64748b';
        const f1Color = isDark ? getDarkModeColor(f1BaseColor) : f1BaseColor;
        const f1FontCss = getFieldFontCss(fields[0]);

        parts.push(`<div class="front-preview-hint" style="color: ${f1Color}; font-size: ${f1Size}px;${f1Weight !== 'normal' ? ` font-weight: ${f1Weight};` : ''}${f1FontCss ? ` font-family: ${f1FontCss};` : ''} margin-bottom: 8px;">${escapeHtml(f1Sample)}</div>`);
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
        html = '<div style="color: #94a3b8; font-style: italic;">뒷면에 표시할 필드를 설정에서 선택해주세요.</div>';
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

    renderPreview();

    if (shouldSave) {
      saveSettingsToStorage();
    }
  }

  // 9. 로컬 스토리지 (localStorage) 자동 저장 및 복원 기능
  const STORAGE_KEY = 'anki_card_editor_settings';
  const saveStatusIndicator = document.getElementById('saveStatusIndicator');
  let saveTimer = null;

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
      const frontCode = generateFrontTemplate();
      const backCode = generateBackTemplate();
      const cssCode = generateCssTemplate();

      const data = {
        version: 1,
        savedAt: new Date().toISOString(),
        langId: languageSelect.value,
        dictLinkTargets: fields.map(f => Boolean(f.hasDictLink)),
        dictUrl: dictUrlInput.value,
        wikiUrl: wikiUrlInput ? wikiUrlInput.value : DEFAULT_WIKI_URL,
        linkNewTab: linkNewTab.checked,
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
      updateSaveIndicator('✓ 자동 저장됨');
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
        if (langSearchInput) langSearchInput.value = lang.name;
        if (dictNameTag) dictNameTag.textContent = lang.dictName;
      }

      if (data.dictUrl !== undefined) dictUrlInput.value = data.dictUrl;
      if (data.wikiUrl !== undefined && wikiUrlInput) wikiUrlInput.value = data.wikiUrl;
      if (data.linkNewTab !== undefined) linkNewTab.checked = Boolean(data.linkNewTab);

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
        cardLineHeight.value = data.cardLineHeight;
        if (cardLineHeightNum) cardLineHeightNum.value = data.cardLineHeight;
        if (cardLineHeightVal) cardLineHeightVal.textContent = data.cardLineHeight;
      }

      // 뒷면 상단 앞면 내용 크기 & 스타일 설정 복원
      if (data.frontOnBackSize !== undefined && frontOnBackSize) {
        frontOnBackSize.value = data.frontOnBackSize;
        if (frontOnBackSizeNum) frontOnBackSizeNum.value = data.frontOnBackSize;
        if (frontOnBackSizeVal) frontOnBackSizeVal.textContent = data.frontOnBackSize + 'px';
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
            if (fData.name !== undefined) f.nameInput.value = fData.name;
            if (fData.sample !== undefined) f.sampleInput.value = fData.sample;
            if (fData.showFront !== undefined) f.showFront.checked = Boolean(fData.showFront);
            if (fData.showBack !== undefined) f.showBack.checked = Boolean(fData.showBack);

            if (fData.size !== undefined) {
              f.sizeSlider.value = fData.size;
              f.sizeNum.value = fData.size;
              f.sizeVal.textContent = fData.size;
            }
            if (fData.weight !== undefined) f.weightSelect.value = fData.weight;
            if (fData.font !== undefined && f.fontSelect) {
              f.fontSelect.value = fData.font;
              if (f.fontCustomInput) {
                if (fData.font === 'custom') {
                  f.fontCustomInput.classList.remove('hidden');
                  f.fontCustomInput.value = fData.fontCustom || '';
                } else {
                  f.fontCustomInput.classList.add('hidden');
                }
              }
            }
            if (fData.color !== undefined) {
              f.colorInput.value = fData.color;
              f.colorText.value = fData.color;
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
    if (!confirm('카드 서식 에디터의 모든 설정을 처음 기본값으로 초기화하시겠습니까?\n\n(※ AI 프롬프트 생성기 등 다른 도구의 저장 설정에는 영향을 주지 않습니다.)')) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    // 1. 언어 기본값 (중국어)
    languageSelect.value = 'zh';
    const lang = getSelectedLanguage();
    if (langSearchInput) langSearchInput.value = lang.name;
    dictUrlInput.value = lang.dictUrl;
    dictNameTag.textContent = lang.dictName;
    if (wikiUrlInput) wikiUrlInput.value = DEFAULT_WIKI_URL;
    linkNewTab.checked = true;

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
    fields[0].sampleInput.value = '안녕, 안녕하세요';
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
    fields[1].sampleInput.value = '你好';
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
      name: 'pinyin',
      sample: 'nǐ hǎo',
      showFront: false,
      showBack: true,
      size: 20,
      weight: 'normal',
      color: '#5f6368',
      hasDictLink: false,
    }, false);

    updateFieldBadges();
    updateDictFieldChecklist();

    fields.forEach(f => {
      if (f.dictLinkCheck) f.dictLinkCheck.checked = Boolean(f.hasDictLink);
      if (f.wikiLinkCheck) f.wikiLinkCheck.checked = Boolean(f.hasWikiLink);
    });
    renderEditorQuickChips('zh');

    updateAll(false);
    saveSettingsToStorage();
    updateSaveIndicator('기본값 초기화 완료');
    showToast('카드 서식 에디터 설정이 기본값으로 초기화되었습니다.');
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

  // 초기화 실행 (순서: 옵션 목록 초기화 -> 이벤트 등록 -> 로컬스토리지 복원 -> 초기 렌더링)
  initLanguageSelect();
  initEventListeners();
  initInspectorEvents();

  const restored = loadSettingsFromStorage();
  if (!restored) {
    // 저장된 설정이 없을 때 기본 3번째 필드 1개 생성 및 초기 언어 반영
    const optionalContainer = document.getElementById('optionalFieldsContainer');
    if (optionalContainer) optionalContainer.innerHTML = '';
    fields.splice(2);
    addOptionalField(null, false);
    onLanguageChange(false, false);
  }

  // 초기 렌더링 (저장하지 않고 렌더링만 수행하여 localStorage 원본 보존)
  updateAll(false);
});
