// 다국어(UI 언어) 지원 공용 모듈
// - 문구는 assets/i18n/<언어>/<페이지>.js 에서 i18nRegister('<언어>', { 키: 문구 }) 로 등록
// - HTML: data-i18n="키"(텍스트), data-i18n-html="키"(HTML), data-i18n-attr="placeholder:키; title:키2"(속성)
// - JS: i18n.t('키', { 이름: 값 }) → 문구 안의 {이름} 치환. 현재 언어에 없으면 한국어 → 키 순으로 대체
// - 언어 전환 시 페이지를 새로고침해 JS가 만드는 문구까지 모두 다시 그림
// - 공유 링크: 주소 끝에 ?lang=en / ?lang=zh 를 붙이면 그 언어로 열림
(function () {
  const STORAGE_KEY = 'swz_ui_lang';
  const DEFAULT_LOCALE = 'ko';
  const LOCALES = [
    { id: 'ko', label: '한국어', htmlLang: 'ko' },
    { id: 'en', label: 'English', htmlLang: 'en' },
    { id: 'zh', label: '中文', htmlLang: 'zh-CN' },
  ];

  const messages = {};

  function register(locale, dict) {
    messages[locale] = Object.assign(messages[locale] || {}, dict);
  }

  // 조기 로드된 번역 큐 처리 및 전역 등록 함수 즉시 노출
  window.i18nRegister = register;
  if (window.__i18n_queue && Array.isArray(window.__i18n_queue)) {
    window.__i18n_queue.forEach(item => {
      if (Array.isArray(item)) register(item[0], item[1]);
    });
    window.__i18n_queue = [];
  }

  // 우선순위: 주소의 ?lang=zh (공유 링크용, 선택값으로 저장) → 저장된 선택 → 한국어
  function getLocale() {
    try {
      const fromUrl = new URLSearchParams(location.search).get('lang');
      if (LOCALES.some(l => l.id === fromUrl)) {
        try {
          localStorage.setItem(STORAGE_KEY, fromUrl);
        } catch (e) {}
        return fromUrl;
      }
    } catch (e) {}
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LOCALES.some(l => l.id === saved)) return saved;
    } catch (e) {}
    return DEFAULT_LOCALE;
  }

  const currentLocale = getLocale();

  function t(key, params) {
    const dict = messages[currentLocale] || {};
    let text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
    if (text === undefined && messages[DEFAULT_LOCALE]) text = messages[DEFAULT_LOCALE][key];
    if (text === undefined) return key;
    if (params) {
      text = text.replace(/\{(\w+)\}/g, (m, name) => (params[name] !== undefined ? params[name] : m));
    }
    return text;
  }

  // 언어 데이터(languages.js)의 언어 이름을 현재 UI 언어로 (번역이 없으면 원래 한국어 이름)
  function langName(lang) {
    if (!lang) return '';
    const key = `lang.${lang.id}`;
    const translated = t(key);
    return translated === key ? lang.name : translated;
  }

  function apply(root) {
    const scope = root || document;
    // 번역이 없으면(t가 키를 그대로 돌려주면) 덮어쓰지 않고 HTML의 한국어 원문을 그대로 둠
    // — 브라우저가 예전 문구 파일을 캐시해 새 키가 없을 때 화면에 키 이름이 보이지 않게
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text !== key) el.textContent = text;
    });
    scope.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const html = t(key);
      if (html !== key) el.innerHTML = html;
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s && s.trim());
        if (!attr || !key) return;
        const value = t(key);
        if (value !== key) el.setAttribute(attr, value);
      });
    });
  }

  function setLocale(locale) {
    if (!LOCALES.some(l => l.id === locale) || locale === currentLocale) return;
    let saved = false;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
      saved = localStorage.getItem(STORAGE_KEY) === locale;
    } catch (e) {}
    // 주소에 ?lang= 이 있거나 저장소를 쓸 수 없으면(사생활 보호 모드 등) ?lang=새 언어 로 이동
    // 저장에 성공했고 주소에 ?lang= 이 없으면 주소를 깔끔하게 둔 채 새로고침
    const url = new URL(location.href);
    if (!saved || url.searchParams.has('lang')) {
      url.searchParams.set('lang', locale);
      location.href = url.toString();
    } else {
      location.reload();
    }
  }

  // 머리글의 언어 전환 버튼 (<div data-i18n-switcher></div> 자리에 그림)
  function renderSwitchers() {
    document.querySelectorAll('[data-i18n-switcher]').forEach(container => {
      container.classList.add('ui-lang-switcher');
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', t('common.uiLanguage'));
      container.innerHTML = '';
      LOCALES.forEach(l => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ui-lang-btn' + (l.id === currentLocale ? ' active' : '');
        btn.textContent = l.label;
        btn.setAttribute('aria-pressed', l.id === currentLocale ? 'true' : 'false');
        btn.addEventListener('click', () => setLocale(l.id));
        container.appendChild(btn);
      });
    });
  }

  // 모든 페이지 맨 위 공통 메뉴줄 (<nav data-site-nav="editor"></nav> 자리에 그림, 값 = 지금 페이지)
  // PC/모바일 공통: 홈 | [🃏 Anki 도구 ▾] | [🎙️ 말하기 도구 ▾] 두 대분류만 두고, 누르면 상세 메뉴가 펼쳐짐
  function getResolvedPaths() {
    const isSub = Boolean(document.querySelector('link[href*="../assets"], script[src*="../assets"]'));
    const inAnki = isSub && (location.pathname.includes('/anki/') || document.querySelector('[data-site-nav="editor"], [data-site-nav="guide"], [data-site-nav="prompt"], [data-site-nav="manual"], [data-site-nav="anki-home"], [data-journey]'));
    const inSpeaking = isSub && (location.pathname.includes('/speaking/') || document.querySelector('[data-site-nav^="speaking"]'));

    const rootHref = isSub ? '../index.html' : 'index.html';
    const ankiPrefix = inAnki ? '' : (isSub ? '../anki/' : 'anki/');
    const speakingPrefix = inSpeaking ? '' : (isSub ? '../speaking/' : 'speaking/');

    const navGroups = [
      {
        groupId: 'anki',
        key: 'common.navAnkiHome',
        titleKey: 'common.navAnkiHomeTitle',
        items: [
          { id: 'anki-home', href: ankiPrefix + 'index.html', key: 'common.navAnkiHubItem', titleKey: 'common.navAnkiHomeTitle', isHub: true },
          { id: 'editor', href: ankiPrefix + 'ankiEditor.html', key: 'common.navEditor', titleKey: 'common.navEditorTitle' },
          { id: 'prompt', href: ankiPrefix + 'ankiPrompt.html', key: 'common.navPrompt', titleKey: 'common.navPromptTitle' },
          { id: 'guide', href: ankiPrefix + 'ankiGuide.html', key: 'common.navGuide', titleKey: 'common.navGuideTitle' },
          { id: 'manual', href: ankiPrefix + 'ankiManual.html', key: 'common.navManual', titleKey: 'common.navManualTitle' },
        ]
      },
      {
        groupId: 'speaking',
        key: 'common.navSpeakingHome',
        titleKey: 'common.navSpeakingHomeTitle',
        items: [
          { id: 'speaking', href: speakingPrefix + 'index.html', key: 'common.navSpeakingHubItem', titleKey: 'common.navSpeakingHomeTitle', isHub: true },
          { id: 'speaking-sim', href: speakingPrefix + 'speakingSimulator.html', key: 'common.navSpeakingSim', titleKey: 'common.navSpeakingSimTitle' },
          { id: 'speaking-shadow', href: speakingPrefix + 'speakingShadowing.html', key: 'common.navSpeakingShadow', titleKey: 'common.navSpeakingShadowTitle' },
          { id: 'speaking-manual', href: speakingPrefix + 'speakingManual.html', key: 'common.navSpeakingManual', titleKey: 'common.navSpeakingManualTitle' },
        ]
      }
    ];

    return {
      homeHref: rootHref,
      faviconHref: isSub ? '../assets/favicon.svg' : 'assets/favicon.svg',
      navGroups,
      journeySteps: [
        { key: 'common.journey.step1', href: ankiPrefix + 'ankiGuide.html#fields' },
        { key: 'common.journey.step2', href: ankiPrefix + 'ankiEditor.html' },
        { key: 'common.journey.step3', href: ankiPrefix + 'ankiPrompt.html' },
        { key: 'common.journey.step4', href: ankiPrefix + 'ankiGuide.html#learning' },
      ]
    };
  }

  function renderSiteNavs() {
    const navPaths = getResolvedPaths();
    document.querySelectorAll('[data-site-nav]').forEach(nav => {
      const current = nav.getAttribute('data-site-nav');
      nav.classList.add('site-nav');
      nav.setAttribute('aria-label', t('common.navMenu'));
      nav.innerHTML = '';

      const inner = document.createElement('div');
      inner.className = 'site-nav-inner';

      const home = document.createElement('a');
      home.className = 'site-nav-home';
      home.href = navPaths.homeHref;
      home.title = t('common.backToHubTitle');

      const logoImg = document.createElement('img');
      logoImg.src = navPaths.faviconHref;
      logoImg.alt = '';
      logoImg.className = 'site-nav-logo-img';
      logoImg.width = 22;
      logoImg.height = 22;

      const brandText = document.createElement('span');
      brandText.className = 'site-nav-brand-text';
      brandText.textContent = 'Study with Wanzi';

      home.append(logoImg, brandText);
      if (current === 'home') home.setAttribute('aria-current', 'page');

      const menuId = 'siteNavMenu';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'site-nav-toggle';
      toggle.setAttribute('aria-controls', menuId);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', t('common.navMenu'));
      toggle.textContent = '☰';

      const menu = document.createElement('div');
      menu.className = 'site-nav-menu';
      menu.id = menuId;

      const groupWrappers = [];
      const closeAllDropdowns = (exceptWrap) => {
        groupWrappers.forEach(w => {
          if (w !== exceptWrap) {
            w.classList.remove('dropdown-open');
            const btn = w.querySelector('.site-nav-group-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });
      };

      navPaths.navGroups.forEach(group => {
        const activeItem = group.items.find(item => item.id === current);
        const isGroupActive = Boolean(activeItem);

        const groupWrap = document.createElement('div');
        groupWrap.className = 'site-nav-group' + (isGroupActive ? ' active-group' : '');

        const groupBtn = document.createElement('button');
        groupBtn.type = 'button';
        groupBtn.className = 'site-nav-group-btn' + (isGroupActive ? ' current' : '');
        groupBtn.title = t(group.titleKey);
        groupBtn.setAttribute('aria-expanded', 'false');
        groupBtn.setAttribute('aria-haspopup', 'true');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'site-nav-group-label';
        labelSpan.textContent = t(group.key);
        groupBtn.appendChild(labelSpan);

        // 현재 서브 도구가 선택된 상태라면 대분류 버튼 옆에 작은 배지로 현재 위치를 표시
        if (activeItem && !activeItem.isHub) {
          const subBadge = document.createElement('span');
          subBadge.className = 'site-nav-group-sublabel';
          subBadge.textContent = t(activeItem.key);
          groupBtn.appendChild(subBadge);
        }

        const caret = document.createElement('span');
        caret.className = 'site-nav-group-caret';
        caret.setAttribute('aria-hidden', 'true');
        caret.textContent = '▾';
        groupBtn.appendChild(caret);

        const dropdown = document.createElement('div');
        dropdown.className = 'site-nav-dropdown';
        dropdown.setAttribute('role', 'menu');

        group.items.forEach(page => {
          const a = document.createElement('a');
          const isCurrent = page.id === current;
          a.className = 'site-nav-dropdown-link' + (isCurrent ? ' current' : '') + (page.isHub ? ' is-hub-link' : '');
          a.href = page.href;
          a.title = t(page.titleKey);
          a.setAttribute('role', 'menuitem');
          if (isCurrent) a.setAttribute('aria-current', 'page');

          const textSpan = document.createElement('span');
          textSpan.textContent = t(page.key);
          a.appendChild(textSpan);

          if (isCurrent) {
            const checkSpan = document.createElement('span');
            checkSpan.className = 'site-nav-dropdown-check';
            checkSpan.setAttribute('aria-hidden', 'true');
            checkSpan.textContent = '✓';
            a.appendChild(checkSpan);
          }

          dropdown.appendChild(a);
        });

        groupBtn.addEventListener('click', e => {
          e.stopPropagation();
          const willOpen = !groupWrap.classList.contains('dropdown-open');
          closeAllDropdowns(groupWrap);
          groupWrap.classList.toggle('dropdown-open', willOpen);
          groupBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });

        groupWrap.append(groupBtn, dropdown);
        menu.appendChild(groupWrap);
        groupWrappers.push(groupWrap);
      });

      const switcher = document.createElement('div');
      switcher.setAttribute('data-i18n-switcher', '');
      menu.appendChild(switcher);

      const setOpen = open => {
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '✕' : '☰';
        if (open) {
          // 모바일에서 ☰를 열었을 때 현재 속한 대분류 그룹은 자동으로 펼쳐 둠
          groupWrappers.forEach(w => {
            const shouldOpen = w.classList.contains('active-group');
            w.classList.toggle('dropdown-open', shouldOpen);
            const btn = w.querySelector('.site-nav-group-btn');
            if (btn) btn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
          });
        } else {
          closeAllDropdowns(null);
        }
      };
      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
      // 메뉴 밖을 누르거나 Esc를 누르면 닫기
      document.addEventListener('click', e => {
        if (!nav.contains(e.target)) {
          closeAllDropdowns(null);
          if (nav.classList.contains('open')) setOpen(false);
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          closeAllDropdowns(null);
          if (nav.classList.contains('open')) {
            setOpen(false);
            toggle.focus();
          }
        }
      });

      inner.append(home, toggle, menu);
      nav.appendChild(inner);
    });
  }

  function renderJourneys() {
    const navPaths = getResolvedPaths();
    document.querySelectorAll('[data-journey]').forEach(nav => {
      const current = parseInt(nav.getAttribute('data-journey'), 10) || 0;
      nav.classList.add('journey-bar');
      nav.setAttribute('aria-label', t('common.journey.ariaLabel'));
      nav.innerHTML = '';

      const ol = document.createElement('ol');
      ol.className = 'journey-steps';
      navPaths.journeySteps.forEach((step, idx) => {
        const num = idx + 1;
        const li = document.createElement('li');
        li.className = 'journey-step' + (num < current ? ' done' : '') + (num === current ? ' current' : '');
        const a = document.createElement('a');
        a.href = step.href;
        if (num === current) a.setAttribute('aria-current', 'step');
        const badge = document.createElement('span');
        badge.className = 'journey-num';
        badge.textContent = num < current ? '✓' : String(num);
        const label = document.createElement('span');
        label.className = 'journey-label';
        label.textContent = t(step.key);
        a.append(badge, label);
        li.appendChild(a);
        ol.appendChild(li);
      });
      nav.appendChild(ol);

      const next = navPaths.journeySteps[current];
      if (current >= 1 && next) {
        const a = document.createElement('a');
        a.className = 'journey-next';
        a.href = next.href;
        a.textContent = t('common.journey.next', { step: t(next.key) });
        nav.appendChild(a);
      }
    });
  }

  window.i18nRegister = register;
  window.i18n = { t, apply, langName, getLocale: () => currentLocale, setLocale, LOCALES };

  // 페이지 스크립트보다 먼저 로드되므로, 페이지 스크립트의 DOMContentLoaded 처리 전에 정적 문구가 적용됨
  document.addEventListener('DOMContentLoaded', () => {
    const info = LOCALES.find(l => l.id === currentLocale);
    if (info) document.documentElement.lang = info.htmlLang;
    apply(document);
    renderSiteNavs(); // 메뉴 안에 언어 전환 자리를 만들므로 언어 버튼보다 먼저
    renderSwitchers();
    renderJourneys();
  });
})();
