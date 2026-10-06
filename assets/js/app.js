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

  const dictApplyTarget = document.getElementById('dictApplyTarget');
  const dictUrlInput = document.getElementById('dictUrlInput');
  const resetDictUrlBtn = document.getElementById('resetDictUrlBtn');
  const dictNameTag = document.getElementById('dictNameTag');
  const rtlNotice = document.getElementById('rtlNotice');
  const linkNewTab = document.getElementById('linkNewTab');
  const linkUnderline = document.getElementById('linkUnderline');

  // Common Layout Options
  const showHrAnswer = document.getElementById('showHrAnswer');
  const keepFrontOnBack = document.getElementById('keepFrontOnBack');
  const centerAlign = document.getElementById('centerAlign');
  const rtlForce = document.getElementById('rtlForce');

  // Field Elements
  const fields = [
    {
      index: 1,
      nameInput: document.getElementById('f1_name'),
      sampleInput: document.getElementById('f1_sample'),
      showFront: document.getElementById('f1_show_front'),
      showBack: document.getElementById('f1_show_back'),
      sizeSlider: document.getElementById('f1_size'),
      sizeNum: document.getElementById('f1_size_num'),
      sizeVal: document.getElementById('f1_size_val'),
      weightSelect: document.getElementById('f1_weight'),
      colorInput: document.getElementById('f1_color'),
      colorText: document.getElementById('f1_color_text'),
    },
    {
      index: 2,
      nameInput: document.getElementById('f2_name'),
      sampleInput: document.getElementById('f2_sample'),
      showFront: document.getElementById('f2_show_front'),
      showBack: document.getElementById('f2_show_back'),
      sizeSlider: document.getElementById('f2_size'),
      sizeNum: document.getElementById('f2_size_num'),
      sizeVal: document.getElementById('f2_size_val'),
      weightSelect: document.getElementById('f2_weight'),
      colorInput: document.getElementById('f2_color'),
      colorText: document.getElementById('f2_color_text'),
    },
    {
      index: 3,
      nameInput: document.getElementById('f3_name'),
      sampleInput: document.getElementById('f3_sample'),
      showFront: document.getElementById('f3_show_front'),
      showBack: document.getElementById('f3_show_back'),
      sizeSlider: document.getElementById('f3_size'),
      sizeNum: document.getElementById('f3_size_num'),
      sizeVal: document.getElementById('f3_size_val'),
      weightSelect: document.getElementById('f3_weight'),
      colorInput: document.getElementById('f3_color'),
      colorText: document.getElementById('f3_color_text'),
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

    // 3번째 필드명 및 배지 동적 업데이트 (중국어는 pinyin, 다른 언어는 Example)
    const f3Badge = document.getElementById('f3_badge');
    const f3Input = fields[2].nameInput;
    const currentF3Val = f3Input.value.trim();

    if (lang.id === 'zh') {
      if (f3Badge) f3Badge.textContent = '3번째 필드 (병음 pinyin)';
      f3Input.placeholder = '예: pinyin, 발음';
      // 이전 값이 Example, example, sample 이거나 비어있으면 pinyin으로 전환
      if (!currentF3Val || currentF3Val === 'Example' || currentF3Val === 'example' || currentF3Val === 'sample') {
        f3Input.value = 'pinyin';
      }
    } else {
      if (f3Badge) f3Badge.textContent = '3번째 필드 (예문 Example)';
      f3Input.placeholder = '예: Example, sample, 예문';
      // 이전 값이 pinyin 이거나 비어있으면 Example로 전환
      if (!currentF3Val || currentF3Val === 'pinyin') {
        f3Input.value = 'Example';
      }
    }

    // 언어 변경 시 예시 샘플 자동 채우기 (사용자가 직접 변경한 경우)
    if (isUserManualChange && lang.sample) {
      fields[0].sampleInput.value = lang.sample.field1;
      fields[1].sampleInput.value = lang.sample.field2;
      fields[2].sampleInput.value = lang.sample.field3;
    }

    updateAll(shouldSave);
  }

  // 2. 컨트롤 이벤트 리스너 연결
  function initEventListeners() {
    languageSelect.addEventListener('change', () => onLanguageChange(true));

    resetDictUrlBtn.addEventListener('click', () => {
      const lang = getSelectedLanguage();
      dictUrlInput.value = lang.dictUrl;
      updateAll();
    });

    dictApplyTarget.addEventListener('change', updateAll);
    dictUrlInput.addEventListener('input', updateAll);
    dictUrlInput.addEventListener('change', updateAll);
    linkNewTab.addEventListener('change', updateAll);
    linkUnderline.addEventListener('change', updateAll);

    showHrAnswer.addEventListener('change', updateAll);
    keepFrontOnBack.addEventListener('change', updateAll);
    centerAlign.addEventListener('change', updateAll);
    rtlForce.addEventListener('change', updateAll);

    // 필드 컨트롤 동기화
    fields.forEach((f, idx) => {
      // 필드명 & 샘플
      f.nameInput.addEventListener('input', updateAll);
      f.nameInput.addEventListener('change', updateAll);
      f.sampleInput.addEventListener('input', updateAll);
      f.sampleInput.addEventListener('change', updateAll);

      // 노출 체크박스
      f.showFront.addEventListener('change', updateAll);
      f.showBack.addEventListener('change', updateAll);

      // 크기 슬라이더 & 숫자 입력 동기화
      f.sizeSlider.addEventListener('input', (e) => {
        f.sizeNum.value = e.target.value;
        f.sizeVal.textContent = e.target.value;
        updateAll();
      });
      f.sizeSlider.addEventListener('change', updateAll);

      f.sizeNum.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 20;
        if (val < 10) val = 10;
        if (val > 80) val = 80;
        f.sizeSlider.value = val;
        f.sizeVal.textContent = val;
        updateAll();
      });
      f.sizeNum.addEventListener('change', updateAll);

      // 굵기
      f.weightSelect.addEventListener('change', updateAll);

      // 색상 피커 & 텍스트 동기화 (input 및 change 모두 감지)
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
          // 잘못된 형식 입력 시 현재 색상값으로 복원
          f.colorText.value = f.colorInput.value;
        }
      });
    });

    // 색상 프리셋 버튼
    document.querySelectorAll('.preset-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetIdx = parseInt(btn.dataset.target, 10) - 1;
        const color = btn.dataset.color;
        if (fields[targetIdx]) {
          fields[targetIdx].colorInput.value = color;
          fields[targetIdx].colorText.value = color;
          updateAll();
        }
      });
    });

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
      toggleDarkModeBtn.textContent = ankiCardWrapper.classList.contains('dark-mode') ? '☀️' : '🌙';
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

    // 모바일 화면 전환 로직 (<= 768px 모바일 전용 탭 네비게이션)
    const btnMobileEditTab = document.getElementById('btnMobileEditTab');
    const btnMobilePreviewTab = document.getElementById('btnMobilePreviewTab');
    const btnGoPreviewMobile = document.getElementById('btnGoPreviewMobile');
    const btnGoEditMobile = document.getElementById('btnGoEditMobile');
    const editorPanel = document.querySelector('.editor-panel');
    const previewPanel = document.querySelector('.preview-panel');

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

    // 전체 설정 초기화 버튼
    const resetAllSettingsBtn = document.getElementById('resetAllSettingsBtn');
    if (resetAllSettingsBtn) {
      resetAllSettingsBtn.addEventListener('click', resetAllSettings);
    }

    if (window.innerWidth <= 768) {
      showMobileEditView();
    }
  }

  // 3. 필드 렌더 마크업 생성 헬퍼
  function buildFieldBlock(field, isForPreview = false) {
    const fieldName = field.nameInput.value.trim() || `Field${field.index}`;
    const sampleValue = field.sampleInput.value.trim() || fieldName;
    const size = field.sizeSlider.value;
    const weight = field.weightSelect.value;
    const color = field.colorInput.value;
    const isTargetLink = (dictApplyTarget.value === `field${field.index}`);

    // style 속성 조립
    const styleParts = [];
    if (size) styleParts.push(`font-size: ${size}px;`);
    if (weight && weight !== 'normal') styleParts.push(`font-weight: ${weight};`);
    if (color) styleParts.push(`color: ${color};`);

    const divStyle = styleParts.join(' ');

    if (isTargetLink) {
      const dictUrl = dictUrlInput.value.trim();
      const targetAttr = linkNewTab.checked ? ' target="_blank"' : '';
      const textDeco = linkUnderline.checked ? 'underline' : 'none';

      if (isForPreview) {
        // 미리보기용: 실제 클릭 가능한 검색 링크 생성
        const testSearchUrl = dictUrl + encodeURIComponent(sampleValue);
        return `<div style="${divStyle} margin-bottom: 8px;">
  <a href="${testSearchUrl}"${targetAttr} style="color: ${color}; text-decoration: ${textDeco};">
    ${escapeHtml(sampleValue)}
  </a>
</div>`;
      } else {
        // Anki 템플릿용: {{FieldName}} 태그 사용
        return `<div style="${divStyle}">
  <a href="${dictUrl}{{${fieldName}}}"${targetAttr} style="color: ${color}; text-decoration: ${textDeco};">
    {{${fieldName}}}
  </a>
</div>`;
      }
    } else {
      if (isForPreview) {
        return `<div style="${divStyle} margin-bottom: 8px;">${escapeHtml(sampleValue)}</div>`;
      } else {
        return `<div style="${divStyle}">{{${fieldName}}}</div>`;
      }
    }
  }

  // 4. Anki 앞면 서식 생성
  function generateFrontTemplate() {
    const activeFrontFields = fields.filter(f => f.showFront.checked);
    if (activeFrontFields.length === 0) {
      // 아무것도 선택되지 않았을 경우 1번째 필드 기본
      const f1Name = fields[0].nameInput.value.trim() || 'Front';
      return `{{${f1Name}}}`;
    }

    return activeFrontFields.map(f => buildFieldBlock(f, false)).join('\n\n');
  }

  // 5. Anki 뒷면 서식 생성
  function generateBackTemplate() {
    const parts = [];

    // 앞면 내용 유지 여부
    if (keepFrontOnBack.checked) {
      const frontName = fields[0].nameInput.value.trim() || 'Front';
      parts.push(`{{${frontName}}}`);
    }

    // 정답 구분선 hr 여부
    if (showHrAnswer.checked) {
      parts.push('<hr id="answer">');
    }

    // 뒷면 노출 필드들
    const activeBackFields = fields.filter(f => f.showBack.checked);
    activeBackFields.forEach(f => {
      parts.push(buildFieldBlock(f, false));
    });

    return parts.join('\n\n');
  }

  // 6. Anki CSS 서식 생성
  function generateCssTemplate() {
    const align = centerAlign.checked ? 'center' : 'left';
    return `.card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  font-size: 20px;
  text-align: ${align};
  color: #202124;
  background-color: #ffffff;
  line-height: 1.5;
}

/* 모바일 및 다크모드 대응 */
.nightMode .card {
  color: #e2e8f0;
  background-color: #2f2f31;
}

a {
  cursor: pointer;
}
`;
  }

  // 7. 실시간 미리보기 렌더링
  function renderPreview() {
    const isFront = (currentPreviewSide === 'front');
    currentCardSideBadge.textContent = isFront ? '앞면 (Front)' : '뒷면 (Back)';

    const isRtl = rtlForce.checked;
    liveCardRender.style.direction = isRtl ? 'rtl' : 'ltr';
    liveCardRender.style.textAlign = centerAlign.checked ? 'center' : (isRtl ? 'right' : 'left');

    let html = '';

    if (isFront) {
      const activeFrontFields = fields.filter(f => f.showFront.checked);
      if (activeFrontFields.length === 0) {
        html = '<div style="color: #94a3b8; font-style: italic;">앞면에 표시할 필드를 설정에서 선택해주세요.</div>';
      } else {
        html = activeFrontFields.map(f => buildFieldBlock(f, true)).join('\n');
      }
    } else {
      const parts = [];

      // 앞면 유지 표시
      if (keepFrontOnBack.checked) {
        const f1Sample = fields[0].sampleInput.value.trim() || fields[0].nameInput.value.trim() || 'Front';
        parts.push(`<div style="color: #64748b; font-size: 18px; margin-bottom: 4px;">${escapeHtml(f1Sample)}</div>`);
      }

      // 구분선
      if (showHrAnswer.checked) {
        parts.push('<hr id="answer">');
      }

      // 뒷면 표시 필드
      const activeBackFields = fields.filter(f => f.showBack.checked);
      if (activeBackFields.length === 0 && parts.length === 0) {
        html = '<div style="color: #94a3b8; font-style: italic;">뒷면에 표시할 필드를 설정에서 선택해주세요.</div>';
      } else {
        parts.push(...activeBackFields.map(f => buildFieldBlock(f, true)));
        html = parts.join('\n');
      }
    }

    liveCardRender.innerHTML = html;
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
        dictApplyTarget: dictApplyTarget.value,
        dictUrl: dictUrlInput.value,
        linkNewTab: linkNewTab.checked,
        linkUnderline: linkUnderline.checked,
        showHrAnswer: showHrAnswer.checked,
        keepFrontOnBack: keepFrontOnBack.checked,
        centerAlign: centerAlign.checked,
        rtlForce: rtlForce.checked,
        fields: fields.map(f => ({
          name: f.nameInput.value,
          sample: f.sampleInput.value,
          showFront: f.showFront.checked,
          showBack: f.showBack.checked,
          size: f.sizeSlider.value,
          weight: f.weightSelect.value,
          color: f.colorInput.value,
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

      if (data.dictApplyTarget !== undefined) dictApplyTarget.value = data.dictApplyTarget;
      if (data.dictUrl !== undefined) dictUrlInput.value = data.dictUrl;
      if (data.linkNewTab !== undefined) linkNewTab.checked = Boolean(data.linkNewTab);
      if (data.linkUnderline !== undefined) linkUnderline.checked = Boolean(data.linkUnderline);

      if (data.showHrAnswer !== undefined) showHrAnswer.checked = Boolean(data.showHrAnswer);
      if (data.keepFrontOnBack !== undefined) keepFrontOnBack.checked = Boolean(data.keepFrontOnBack);
      if (data.centerAlign !== undefined) centerAlign.checked = Boolean(data.centerAlign);
      if (data.rtlForce !== undefined) rtlForce.checked = Boolean(data.rtlForce);

      // 필드 설정 복원
      if (Array.isArray(data.fields)) {
        data.fields.forEach((fData, idx) => {
          const f = fields[idx];
          if (!f || !fData) return;
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
          if (fData.color !== undefined) {
            f.colorInput.value = fData.color;
            f.colorText.value = fData.color;
          }
        });
      }

      // 3번째 필드 배지 복원
      const currentLang = getSelectedLanguage();
      const f3Badge = document.getElementById('f3_badge');
      if (f3Badge) {
        if (currentLang.id === 'zh') {
          f3Badge.textContent = '3번째 필드 (병음 pinyin)';
        } else {
          f3Badge.textContent = '3번째 필드 (예문 Example)';
        }
      }

      // RTL 알림 배지 복원
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
    if (!confirm('입력하신 모든 설정을 처음 기본값으로 초기화하시겠습니까?')) {
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
    dictApplyTarget.value = 'field2';
    linkNewTab.checked = true;
    linkUnderline.checked = false;

    // 공통 레이아웃
    showHrAnswer.checked = true;
    keepFrontOnBack.checked = true;
    centerAlign.checked = true;
    rtlForce.checked = false;
    rtlNotice.classList.add('hidden');

    // 필드 1 기본값 (Front / 한국어 뜻)
    fields[0].nameInput.value = 'Front';
    fields[0].sampleInput.value = '안녕, 안녕하세요';
    fields[0].showFront.checked = true;
    fields[0].showBack.checked = false;
    fields[0].sizeSlider.value = 24;
    fields[0].sizeNum.value = 24;
    fields[0].sizeVal.textContent = '24';
    fields[0].weightSelect.value = 'bold';
    fields[0].colorInput.value = '#202124';
    fields[0].colorText.value = '#202124';

    // 필드 2 기본값 (Back / 외국어 단어 · 사전 링크)
    fields[1].nameInput.value = 'Back';
    fields[1].sampleInput.value = '你好';
    fields[1].showFront.checked = false;
    fields[1].showBack.checked = true;
    fields[1].sizeSlider.value = 24;
    fields[1].sizeNum.value = 24;
    fields[1].sizeVal.textContent = '24';
    fields[1].weightSelect.value = 'bold';
    fields[1].colorInput.value = '#1a73e8';
    fields[1].colorText.value = '#1a73e8';

    // 필드 3 기본값 (pinyin / 병음)
    fields[2].nameInput.value = 'pinyin';
    fields[2].sampleInput.value = 'nǐ hǎo';
    fields[2].showFront.checked = false;
    fields[2].showBack.checked = true;
    fields[2].sizeSlider.value = 20;
    fields[2].sizeNum.value = 20;
    fields[2].sizeVal.textContent = '20';
    fields[2].weightSelect.value = 'normal';
    fields[2].colorInput.value = '#5f6368';
    fields[2].colorText.value = '#5f6368';

    const f1Badge = document.getElementById('f1_badge');
    const f2Badge = document.getElementById('f2_badge');
    const f3Badge = document.getElementById('f3_badge');
    if (f1Badge) f1Badge.textContent = '1번째 필드 (앞면 / 한국어)';
    if (f2Badge) f2Badge.textContent = '2번째 필드 (뒷면 / 외국어 · 사전 링크)';
    if (f3Badge) f3Badge.textContent = '3번째 필드 (병음 pinyin)';

    updateAll(false);
    saveSettingsToStorage();
    updateSaveIndicator('기본값 초기화 완료');
    showToast('모든 설정이 기본값으로 초기화되었습니다.');
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

  const restored = loadSettingsFromStorage();
  if (!restored) {
    // 저장된 설정이 없을 때만 기본 언어 세팅 수행
    onLanguageChange(false, false);
  }

  // 초기 렌더링 (저장하지 않고 렌더링만 수행하여 localStorage 원본 보존)
  updateAll(false);
});
