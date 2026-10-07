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
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s && s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
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

  // 처음부터 끝까지 4단계 경로 표시줄 (<nav data-journey="2"></nav> 자리에 그림, 숫자 = 현재 단계)
  const JOURNEY_STEPS = [
    { key: 'common.journey.step1', href: 'ankiGuide.html#fields' },
    { key: 'common.journey.step2', href: 'ankiEditor.html' },
    { key: 'common.journey.step3', href: 'ankiPrompt.html' },
    { key: 'common.journey.step4', href: 'ankiGuide.html#learning' },
  ];

  function renderJourneys() {
    document.querySelectorAll('[data-journey]').forEach(nav => {
      const current = parseInt(nav.getAttribute('data-journey'), 10) || 0;
      nav.classList.add('journey-bar');
      nav.setAttribute('aria-label', t('common.journey.ariaLabel'));
      nav.innerHTML = '';

      const ol = document.createElement('ol');
      ol.className = 'journey-steps';
      JOURNEY_STEPS.forEach((step, idx) => {
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

      const next = JOURNEY_STEPS[current];
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
    renderSwitchers();
    renderJourneys();
  });
})();
