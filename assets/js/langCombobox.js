// 학습 언어 검색형 콤보박스 (카드 서식 에디터 · AI 프롬프트 생성기 공용)
// - 한국어 이름, 초성(완성 글자와 섞어 입력 가능), 언어 코드, 영어 이름, 현지어 이름으로 검색
// - 검색어가 없으면 최근 선택 / 주요 언어 / 그 외 언어(가나다순)로 묶어서 표시
(function () {
  // 언어별 영어 이름 · 현지어 이름 (검색용 별칭)
  const LANG_ALIASES = {
    en: ['English'], ja: ['Japanese', '日本語', 'にほんご'], zh: ['Chinese', 'Mandarin', '中文', '汉语', '普通话'],
    fr: ['French', 'Français'], de: ['German', 'Deutsch'], es: ['Spanish', 'Español'],
    ru: ['Russian', 'Русский'], it: ['Italian', 'Italiano'], th: ['Thai', 'ภาษาไทย'],
    vi: ['Vietnamese', 'Tiếng Việt'], id: ['Indonesian', 'Malay', 'Bahasa Indonesia', 'Bahasa Melayu'],
    ar: ['Arabic', 'العربية'], ne: ['Nepali', 'नेपाली'], lo: ['Lao', 'ລາວ'], mn: ['Mongolian', 'Монгол'],
    my: ['Burmese', 'Myanmar', 'မြန်မာ'], sw: ['Swahili', 'Kiswahili'], ur: ['Urdu', 'اردو'],
    uz: ['Uzbek', 'Oʻzbek'], kk: ['Kazakh', 'Қазақ'], km: ['Khmer', 'Cambodian', 'ខ្មែរ'],
    tl: ['Tagalog', 'Filipino'], tet: ['Tetum'], fa: ['Persian', 'Farsi', 'فارسی'], ha: ['Hausa'],
    he: ['Hebrew', 'עברית'], hbo: ['Biblical Hebrew', 'Ancient Hebrew'], hi: ['Hindi', 'हिन्दी'],
    el: ['Greek', 'Ελληνικά'], grc: ['Ancient Greek'], nl: ['Dutch', 'Nederlands'], no: ['Norwegian', 'Norsk'],
    da: ['Danish', 'Dansk'], la: ['Latin', 'Latina'], ro: ['Romanian', 'Română'], sv: ['Swedish', 'Svenska'],
    sq: ['Albanian', 'Shqip'], uk: ['Ukrainian', 'Українська'], ka: ['Georgian', 'ქართული'],
    cs: ['Czech', 'Čeština'], hr: ['Croatian', 'Hrvatski'], tr: ['Turkish', 'Türkçe'],
    pt: ['Portuguese', 'Português'], pl: ['Polish', 'Polski'], fi: ['Finnish', 'Suomi'], hu: ['Hungarian', 'Magyar'],
  };

  // 검색어가 없을 때 위쪽에 묶어서 보여줄 주요 언어
  const MAJOR_LANG_IDS = ['en', 'ja', 'zh', 'es', 'fr', 'de', 'ru', 'it', 'vi', 'th', 'id', 'ar'];

  const RECENT_STORAGE_KEY = 'swz_recent_languages';
  const RECENT_MAX = 3;

  // 마지막으로 사용자가 직접 고른 언어 (카드 에디터 ↔ 프롬프트 생성기 언어 연동용)
  // 각 도구는 열릴 때 이 값이 자기 언어와 다르면 이 언어로 맞춤. 설정 초기화 시 삭제
  const SHARED_LANG_KEY = 'swz_last_language';

  function getSharedLanguage() {
    try {
      return localStorage.getItem(SHARED_LANG_KEY);
    } catch (e) {
      return null;
    }
  }

  function setSharedLanguage(id) {
    try {
      localStorage.setItem(SHARED_LANG_KEY, id);
    } catch (e) {}
  }

  function clearSharedLanguage() {
    try {
      localStorage.removeItem(SHARED_LANG_KEY);
    } catch (e) {}
  }

  const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  function getChosungChar(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      return CHOSUNG_LIST[Math.floor((code - 0xAC00) / (21 * 28))];
    }
    return ch;
  }

  function isChosung(ch) {
    return CHOSUNG_LIST.includes(ch);
  }

  // 검색어가 대상 문자열의 어디에서 일치하는지 반환 (-1: 불일치)
  // 검색어의 초성 글자는 대상 글자의 초성과, 그 외 글자는 그대로(대소문자 무시) 비교
  function findMatchIndex(target, query) {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    for (let start = 0; start + q.length <= t.length; start++) {
      let ok = true;
      for (let i = 0; i < q.length; i++) {
        const qc = q[i];
        const tc = t[start + i];
        if (isChosung(qc) ? getChosungChar(tc) !== qc : tc !== qc) {
          ok = false;
          break;
        }
      }
      if (ok) return start;
    }
    return -1;
  }

  // 다국어 지원 (i18n.js가 없으면 한국어 기본 문구 사용)
  const FALLBACK_TEXT = {
    'combobox.count': '총 {count}개 언어',
    'combobox.groupRecent': '최근 선택',
    'combobox.groupMajor': '주요 언어',
    'combobox.groupOthers': '그 외 언어 (가나다순)',
    'combobox.empty': "'{query}' 검색 결과가 없습니다.",
  };

  function tr(key, params) {
    if (window.i18n) return window.i18n.t(key, params);
    return (FALLBACK_TEXT[key] || key).replace(/\{(\w+)\}/g, (m, name) => (params && params[name] !== undefined ? params[name] : m));
  }

  // 화면에 보여줄 언어 이름 (UI 언어로 번역된 이름, 없으면 한국어 이름)
  function displayName(lang) {
    return window.i18n ? window.i18n.langName(lang) : lang.name;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlight(text, index, length) {
    if (index < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, index))
      + '<mark>' + escapeHtml(text.slice(index, index + length)) + '</mark>'
      + escapeHtml(text.slice(index + length));
  }

  function loadRecent() {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecent(id) {
    try {
      const next = [id, ...loadRecent().filter(x => x !== id)].slice(0, RECENT_MAX);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  /**
   * @param {object} opts
   * @param {HTMLElement} opts.container   콤보박스 전체 래퍼 (바깥 클릭 판정용)
   * @param {HTMLSelectElement} opts.select 숨겨진 네이티브 select (선택값 보관)
   * @param {HTMLInputElement} opts.input  검색 입력창
   * @param {HTMLElement} opts.clearBtn, opts.toggleBtn, opts.dropdown, opts.list, opts.countEl
   * @param {Array} opts.languages         언어 데이터 ({ id, name })
   * @param {Function} opts.onSelect       사용자가 언어를 선택했을 때 호출 (id)
   */
  function createLangCombobox(opts) {
    const { container, select, input, clearBtn, toggleBtn, dropdown, list, countEl, languages, onSelect } = opts;
    let focusIndex = -1;

    const uiLocale = window.i18n ? window.i18n.getLocale() : 'ko';
    const sortedOthers = languages
      .filter(l => !MAJOR_LANG_IDS.includes(l.id))
      .sort((a, b) => displayName(a).localeCompare(displayName(b), uiLocale));
    const majors = MAJOR_LANG_IDS.map(id => languages.find(l => l.id === id)).filter(Boolean);

    function getLang(id) {
      return languages.find(l => l.id === id);
    }

    function currentName() {
      const lang = getLang(select.value);
      return lang ? displayName(lang) : '';
    }

    // 별칭 중 단어 앞부분이 검색어로 시작하는 위치 (예: 'span' → 'Spanish', 'bahasa i' → 'Bahasa Indonesia')
    function findAliasMatch(lang, q) {
      for (const alias of LANG_ALIASES[lang.id] || []) {
        const lower = alias.toLowerCase();
        const idx = lower.split(/\s+/).reduce((found, word, i, words) => {
          if (found >= 0) return found;
          const offset = words.slice(0, i).join(' ').length + (i > 0 ? 1 : 0);
          return lower.startsWith(q, offset) ? offset : -1;
        }, -1);
        if (idx >= 0) return { alias, idx };
      }
      return null;
    }

    // 검색 점수: 낮을수록 위
    // 0: 언어 코드 완전 일치 또는 한국어 이름 앞부분 일치, 1: 한국어 이름 포함, 2: 코드 앞부분, 3: 영어·현지어 이름
    // 화면에 보이는 이름(UI 언어)으로 먼저 찾고, UI 언어가 한국어가 아니면 한국어 이름도 별칭처럼 검색
    function matchLanguage(lang, query) {
      const q = query.toLowerCase();
      const nameIdx = findMatchIndex(displayName(lang), query);
      if (lang.id.toLowerCase() === q) return { score: 0, nameIdx, alias: null };
      if (nameIdx === 0) return { score: 0, nameIdx, alias: null };
      if (nameIdx > 0) return { score: 1, nameIdx, alias: null };
      if (lang.id.toLowerCase().startsWith(q)) return { score: 2, nameIdx: -1, alias: null };
      if (displayName(lang) !== lang.name) {
        const koIdx = findMatchIndex(lang.name, query);
        if (koIdx >= 0) return { score: 3, nameIdx: -1, alias: { alias: lang.name, idx: koIdx } };
      }
      const alias = findAliasMatch(lang, q);
      if (alias) return { score: 3, nameIdx: -1, alias };
      return null;
    }

    function buildItem(lang, query, matchInfo) {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      li.setAttribute('role', 'option');
      li.dataset.id = lang.id;
      const isSelected = lang.id === select.value;
      if (isSelected) li.classList.add('selected');
      li.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      const nameHtml = matchInfo ? highlight(displayName(lang), matchInfo.nameIdx, query.length) : escapeHtml(displayName(lang));
      const aliasHtml = matchInfo && matchInfo.alias
        ? `<span class="lang-alias">${highlight(matchInfo.alias.alias, matchInfo.alias.idx, query.length)}</span>`
        : '';

      li.innerHTML = `
        <span class="lang-name">
          <span>${nameHtml}</span>
          ${aliasHtml}
          <span class="lang-tag">${escapeHtml(lang.id.toUpperCase())}</span>
        </span>
        ${isSelected ? '<span class="check-icon">✓</span>' : ''}
      `;

      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        choose(lang.id);
      });
      return li;
    }

    function addGroupLabel(text) {
      const li = document.createElement('li');
      li.className = 'dropdown-group-label';
      li.setAttribute('role', 'presentation');
      li.textContent = text;
      list.appendChild(li);
    }

    function render(filterText) {
      const query = (filterText || '').trim();
      list.innerHTML = '';
      focusIndex = -1;

      if (!query) {
        countEl.textContent = tr('combobox.count', { count: languages.length });
        const recent = loadRecent().map(getLang).filter(Boolean);
        if (recent.length > 0) {
          addGroupLabel(tr('combobox.groupRecent'));
          recent.forEach(l => list.appendChild(buildItem(l, '', null)));
        }
        addGroupLabel(tr('combobox.groupMajor'));
        majors.forEach(l => list.appendChild(buildItem(l, '', null)));
        addGroupLabel(tr('combobox.groupOthers'));
        sortedOthers.forEach(l => list.appendChild(buildItem(l, '', null)));
        return;
      }

      const matched = languages
        .map((lang, order) => ({ lang, order, info: matchLanguage(lang, query) }))
        .filter(m => m.info)
        .sort((a, b) => a.info.score - b.info.score || a.order - b.order);

      countEl.textContent = tr('combobox.count', { count: matched.length });
      if (matched.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'dropdown-empty';
        empty.textContent = tr('combobox.empty', { query });
        list.appendChild(empty);
        return;
      }
      matched.forEach(m => list.appendChild(buildItem(m.lang, query, m.info)));
      // 검색 중에는 첫 번째 결과를 미리 강조해 Enter로 바로 선택 가능
      focusIndex = 0;
      updateFocus();
    }

    function items() {
      return list.querySelectorAll('.dropdown-item');
    }

    function updateFocus() {
      items().forEach((item, idx) => {
        const on = idx === focusIndex;
        item.classList.toggle('focused', on);
        if (on) item.scrollIntoView({ block: 'nearest' });
      });
    }

    function updateClearBtn() {
      clearBtn.classList.toggle('hidden', input.value.trim().length === 0);
    }

    function isOpen() {
      return !dropdown.classList.contains('hidden');
    }

    function open(filterText) {
      dropdown.classList.remove('hidden');
      toggleBtn.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      render(filterText);
      updateClearBtn();
      if (!filterText) {
        const selected = list.querySelector('.dropdown-item.selected');
        if (selected) selected.scrollIntoView({ block: 'nearest' });
      }
    }

    function close() {
      dropdown.classList.add('hidden');
      toggleBtn.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      input.value = currentName();
      updateClearBtn();
      focusIndex = -1;
    }

    function choose(id) {
      select.value = id;
      saveRecent(id);
      setSharedLanguage(id);
      close();
      if (onSelect) onSelect(id);
    }

    // 입력창이 현재 선택 언어 이름을 그대로 보여주는 상태라면 전체 목록을 보여줌
    function filterFromInput() {
      return input.value.trim() === currentName() ? '' : input.value;
    }

    input.addEventListener('focus', () => {
      open(filterFromInput());
      input.select();
    });
    input.addEventListener('click', () => {
      if (!isOpen()) open(filterFromInput());
    });
    input.addEventListener('input', () => open(input.value));

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab') {
        if (isOpen()) close();
        return;
      }
      if (!isOpen() && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        open(filterFromInput());
        return;
      }
      const all = items();
      if (all.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusIndex = (focusIndex + 1) % all.length;
        updateFocus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusIndex = (focusIndex - 1 + all.length) % all.length;
        updateFocus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = all[focusIndex >= 0 ? focusIndex : 0];
        if (target) choose(target.dataset.id);
      }
    });

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen()) {
        close();
      } else {
        input.focus();
      }
    });

    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      input.focus();
      open('');
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target) && isOpen()) close();
    });

    // 숨겨진 select 옵션 채우기
    select.innerHTML = '';
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.id;
      option.textContent = displayName(lang);
      select.appendChild(option);
    });

    return {
      // 코드에서 언어를 바꾼 뒤(설정 복원·초기화 등) 입력창 표시를 맞출 때 호출
      sync() {
        input.value = currentName();
        updateClearBtn();
      },
      setValue(id) {
        select.value = id;
        input.value = currentName();
        updateClearBtn();
      },
      // 다른 도구에서 마지막으로 고른 언어 (없거나 목록에 없는 언어면 null)
      getSharedLanguage() {
        const id = getSharedLanguage();
        return id && getLang(id) ? id : null;
      },
      clearSharedLanguage,
    };
  }

  window.createLangCombobox = createLangCombobox;
})();
