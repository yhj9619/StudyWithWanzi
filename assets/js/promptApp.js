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
  const levelPresetSelect = document.getElementById('levelPresetSelect');
  const levelCustomInput = document.getElementById('levelCustomInput');

  const posNoun = document.getElementById('posNoun');
  const posVerb = document.getElementById('posVerb');
  const posAdj = document.getElementById('posAdj');
  const posAdv = document.getElementById('posAdv');
  const posIdiom = document.getElementById('posIdiom');
  const wordCountSelect = document.getElementById('wordCountSelect');

  const currentFormatTag = document.getElementById('currentFormatTag');
  const promptFieldList = document.getElementById('promptFieldList');
  const btnAddPromptField = document.getElementById('btnAddPromptField');
  const delimiterSelect = document.getElementById('delimiterSelect');

  const ruleCodeblock = document.getElementById('ruleCodeblock');
  const rulePureCsv = document.getElementById('rulePureCsv');
  const ruleQuoteCommas = document.getElementById('ruleQuoteCommas');
  const ruleLemma = document.getElementById('ruleLemma');
  const ruleNoDupes = document.getElementById('ruleNoDupes');
  const ruleContextMeaning = document.getElementById('ruleContextMeaning');

  const promptOutputText = document.getElementById('promptOutputText');
  const sampleCsvText = document.getElementById('sampleCsvText');
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

  // 언어별 추천 등급 프리셋 및 기본 예시 필드 (관광통역안내사 공인어학성적 기준 및 국제 기준 반영)
  const LEVEL_PRESETS = {
    zh: {
      levels: [
        'HSK 3급',
        'HSK 4급',
        'HSK 5급 (관광통역안내사 기준)',
        'HSK 6급 (최고급)',
        'HSK 1급 (기초)',
        'HSK 2급 (초급)',
        'BCT(B) 181점 이상 (관광통역)',
        'TOCFL 5급(대만·관광통역)',
        'CPT 750점 이상 (관광통역)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'HSK 3급',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕, 안녕하세요' },
        { name: '중국어', sample: '你好' },
        { name: '병음', sample: 'nǐ hǎo' }
      ],
      sampleRows: [
        ['[명사]안녕, 안녕하세요', '你好', 'nǐ hǎo'],
        ['[동사]감사하다, 고맙다', '谢谢', 'xièxie'],
        ['[형용사]기쁘다, 즐겁다', '高兴', 'gāoxìng']
      ]
    },
    ja: {
      levels: [
        'JLPT N4 (초급)',
        'JLPT N3 (중급)',
        'JLPT N2 (중상급)',
        'JLPT N1 (관광통역안내사 기준)',
        'JLPT N5 (입문)',
        'JPT 740점 이상 (관광통역)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'JLPT N4',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]벚꽃' },
        { name: '일본어', sample: '桜' },
        { name: '후리가나/발음', sample: 'さくら' }
      ],
      sampleRows: [
        ['[명사]벚꽃', '桜', 'さくら'],
        ['[동사]먹다', '食べる', 'たべる'],
        ['[형용사]예쁘다, 아름답다', '美しい', 'うつくしい']
      ]
    },
    en: {
      levels: [
        '중학 필수 (기초)',
        '수능/고교 필수 (CEFR B1-B2)',
        '토익 760점 (관광통역안내사 기준)',
        '토익 850점 이상 (상급)',
        '토플 iBT 81점 (관광통역안내사)',
        'IELTS 5.0 (관광통역안내사)',
        'TEPS 372점 (관광통역안내사)',
        'G-TELP 레벨2 74점 (관광통역)',
        'FLEX 776점 이상 (관광통역)',
        'CEFR B1 (중급)',
        'CEFR B2 (중상급)',
        'CEFR C1 (고급/토플)'
      ],
      defaultLevel: '중학 필수',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]사과' },
        { name: '영어', sample: 'apple' },
        { name: '예문', sample: 'I eat an apple every day.' }
      ],
      sampleRows: [
        ['[명사]사과', 'apple', 'I eat an apple every day.'],
        ['[동사]성공하다', 'succeed', 'She worked hard to succeed in her career.'],
        ['[형용사]중요한', 'crucial', 'Water is crucial for all living things.']
      ]
    },
    fr: {
      levels: [
        'DELF B2 (관광통역안내사 기준)',
        'DELF B1 (중급)',
        'DELF A2 (초급)',
        'DELF A1 (입문)',
        'DALF C1 (고급)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'DELF A2 (초급)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '프랑스어 단어', sample: 'Bonjour' },
        { name: '예문', sample: 'Bonjour, comment allez-vous ?' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Bonjour', 'Bonjour, comment allez-vous ?'],
        ['[동사]감사하다', 'Merci', 'Merci beaucoup pour votre aide.'],
        ['[형용사]좋은, 멋진', 'Magnifique', 'Ce paysage est magnifique.']
      ]
    },
    de: {
      levels: [
        'Goethe B1(ZD) (관광통역안내사 기준)',
        'Goethe B2 (중상급)',
        'Goethe A2 (초급)',
        'Goethe A1 (입문)',
        'Goethe C1 (고급)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'Goethe A2 (초급)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '독일어 단어', sample: 'Guten Tag' },
        { name: '예문', sample: 'Guten Tag, wie geht es Ihnen heute?' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Guten Tag', 'Guten Tag, wie geht es Ihnen heute?'],
        ['[동사]감사하다', 'Danken', 'Ich danke Ihnen für Ihre Hilfe.'],
        ['[형용사]친절한', 'Freundlich', 'Er ist sehr freundlich und hilfsbereit.']
      ]
    },
    es: {
      levels: [
        'DELE B2 (관광통역안내사 기준)',
        'DELE B1 (중급)',
        'DELE A2 (초급)',
        'DELE A1 (입문)',
        'DELE C1 (고급)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'DELE A2 (초급)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]감사합니다' },
        { name: '스페인어 단어', sample: 'Gracias' },
        { name: '예문', sample: 'Muchas gracias por tu amable ayuda.' }
      ],
      sampleRows: [
        ['[명사]감사합니다', 'Gracias', 'Muchas gracias por tu amable ayuda.'],
        ['[동사]배우다', 'Aprender', 'Quiero aprender español este año.'],
        ['[형용사]아름다운', 'Hermoso', 'Este lugar es muy hermoso.']
      ]
    },
    ru: {
      levels: [
        'TORFL 1단계(B1) (관광통역안내사 기준)',
        'TORFL 2단계(B2)',
        'TORFL 기본(A2)',
        'TORFL 기초(A1)',
        'TORFL 3단계(C1)',
        'FLEX 776점 이상 (관광통역)'
      ],
      defaultLevel: 'TORFL 기본(A2)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '러시아어 단어', sample: 'Здравствуйте' },
        { name: '발음/예문', sample: 'Zdravstvuyte' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Здравствуйте', 'Zdravstvuyte'],
        ['[동사]이해하다', 'Понимать', 'Я вас понимаю.'],
        ['[형용사]아름다운', 'Красивый', 'Это очень красивый город.']
      ]
    },
    it: {
      levels: [
        'CILS B2 (관광통역안내사 기준)',
        'CELI 3 (관광통역안내사 기준)',
        'CILS B1 (중급)',
        'CILS A2 (초급)',
        'CILS A1 (입문)',
        'CILS C1 (고급)'
      ],
      defaultLevel: 'CILS A2 (초급)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '이탈리아어 단어', sample: 'Buongiorno' },
        { name: '예문', sample: 'Buongiorno a tutti!' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Buongiorno', 'Buongiorno a tutti!'],
        ['[동사]사랑하다', 'Amare', 'Amo viaggiare in Italia.'],
        ['[형용사]아름다운', 'Bello', 'La vita è bella.']
      ]
    },
    vi: {
      levels: [
        'FLEX 600점 (관광통역안내사 기준)',
        'VSL 1~2급 (초급/A1-A2)',
        'VSL 3~4급 (중급/B1-B2)',
        'VSL 5~6급 (고급/C1-C2)'
      ],
      defaultLevel: 'VSL 1~2급 (초급/A1-A2)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '베트남어 단어', sample: 'Xin chào' },
        { name: '예문', sample: 'Xin chào, rất vui được gặp bạn.' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Xin chào', 'Xin chào, rất vui được gặp bạn.'],
        ['[동사]감사하다', 'Cảm ơn', 'Cảm ơn bạn rất nhiều.'],
        ['[형용사]맛있는', 'Ngon', 'Món ăn này rất ngon.']
      ]
    },
    th: {
      levels: [
        'FLEX 600점 (관광통역안내사 기준)',
        '초급 (기초 생활 회화)',
        '중급 (일상 및 여행 어휘)',
        '고급 (시사 및 전문 어휘)'
      ],
      defaultLevel: '초급 (기초 생활 회화)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '태국어 단어', sample: 'สวัสดี' },
        { name: '발음', sample: 'sà-wàt-dii' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'สวัสดี', 'sà-wàt-dii'],
        ['[동사]감사합니다', 'ขอบคุณ', 'khɔ̀ɔp-khun'],
        ['[형용사]맛있다', 'อร่อย', 'à-rɔ̀y']
      ]
    },
    id: {
      levels: [
        'FLEX 600점 (관광통역안내사 기준)',
        'UKBI 초급 (Semenjana)',
        'UKBI 중급 (Madya)',
        'UKBI 고급 (Unggul)'
      ],
      defaultLevel: 'UKBI 초급 (Semenjana)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '인도네시아어 단어', sample: 'Halo' },
        { name: '예문', sample: 'Halo, apa kabar?' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Halo', 'Halo, apa kabar?'],
        ['[동사]감사합니다', 'Terima kasih', 'Terima kasih banyak.'],
        ['[형용사]좋은', 'Bagus', 'Hari ini cuaca sangat bagus.']
      ]
    },
    ar: {
      levels: [
        'FLEX 600점 (관광통역안내사 기준)',
        '초급 (CEFR A1-A2)',
        '중급 (CEFR B1-B2)',
        '고급 (CEFR C1)'
      ],
      defaultLevel: '초급 (CEFR A1-A2)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '아랍어 단어', sample: 'مرحبا' },
        { name: '발음', sample: 'Marhaban' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'مرحبا', 'Marhaban'],
        ['[동사]감사합니다', 'شكرا', 'Shukran'],
        ['[형용사]좋은', 'جميل', 'Jameel']
      ]
    },
    default: {
      levels: [
        'CEFR A1 (입문 기초)',
        'CEFR A2 (초급)',
        'CEFR B1 (중급 일상 회화)',
        'CEFR B2 (중상급)',
        'CEFR C1 (고급 학술/시사)',
        'FLEX 600점 (관광통역안내사 기준)'
      ],
      defaultLevel: 'CEFR A2 (초급)',
      defaultFields: [
        { name: '[품사]한국어', sample: '[명사]안녕하세요' },
        { name: '원문 단어', sample: 'Word' },
        { name: '발음/예문', sample: 'Sample' }
      ],
      sampleRows: [
        ['[명사]안녕하세요', 'Hello', 'Hello, how are you?'],
        ['[동사]감사합니다', 'Thank', 'Thank you so much.'],
        ['[형용사]멋진, 좋은', 'Wonderful', 'Have a wonderful day!']
      ]
    }
  };

  // 현재 필드 리스트
  let fields = [
    { id: 'f_1', name: '[품사]한국어', sample: '[명사]안녕, 안녕하세요' },
    { id: 'f_2', name: '중국어', sample: '你好' },
    { id: 'f_3', name: '병음', sample: 'nǐ hǎo' }
  ];

  // 1. 언어 셀렉트 박스 초기화
  function initLanguageSelect() {
    promptLangSelect.innerHTML = '';
    const list = window.LANGUAGES_DATA || [];
    list.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.id;
      option.textContent = lang.name;
      if (lang.id === 'zh') {
        option.selected = true; // 기본값: 중국어
      }
      promptLangSelect.appendChild(option);
    });

    updateLanguagePreset(false);
  }

  // 2. 언어별 등급 프리셋 갱신
  function updateLanguagePreset(isUserManualLangChange = true) {
    const langId = promptLangSelect.value;
    const preset = LEVEL_PRESETS[langId] || LEVEL_PRESETS['default'];

    levelPresetSelect.innerHTML = '';
    preset.levels.forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = lvl;
      if (lvl === preset.defaultLevel) {
        opt.selected = true;
      }
      levelPresetSelect.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '✏️ 직접 입력';
    levelPresetSelect.appendChild(customOpt);

    if (isUserManualLangChange) {
      levelCustomInput.value = preset.defaultLevel;

      // 만약 기본 3개 필드 상태라면 해당 언어의 기본 필드로 자동 추천 변경
      if (fields.length === 3 && (fields[0].name === '[품사]한국어')) {
        fields = preset.defaultFields.map((f, i) => ({
          id: `f_${Date.now()}_${i}`,
          name: f.name,
          sample: f.sample
        }));
        renderFields();
      }
    }
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
          <input type="text" class="form-input field-input-name" value="${escapeHtml(field.name)}" placeholder="항목명 (예: [품사]한국어, 중국어, 병음)">
          <input type="text" class="form-input field-input-sample" value="${escapeHtml(field.sample || '')}" placeholder="예시값 (예: [명사]안녕, 你好)">
        </div>
        <div class="prompt-field-actions">
          <button type="button" class="btn-field-icon btn-move-up" title="위로 이동" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn-field-icon btn-move-down" title="아래로 이동" ${index === fields.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn-field-icon btn-delete-small" title="필드 삭제">🗑️</button>
        </div>
      `;

      // 입력 이벤트
      const nameInput = row.querySelector('.field-input-name');
      const sampleInput = row.querySelector('.field-input-sample');

      nameInput.addEventListener('input', (e) => {
        field.name = e.target.value;
        updatePromptAndPreview();
      });

      sampleInput.addEventListener('input', (e) => {
        field.sample = e.target.value;
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

    // 난이도 조건절
    const filterMode = levelFilterModeSelect.value;
    const levelText = levelCustomInput.value.trim() || '해당';

    let conditionClause = '';
    if (filterMode === 'below') {
      conditionClause = `${levelText} 이하 수준의 단어는 제외하고, `;
    } else if (filterMode === 'above') {
      conditionClause = `${levelText} 이상 수준의 단어만 선별하여, `;
    } else if (filterMode === 'exact') {
      conditionClause = `${levelText} 수준에 해당하는 단어만 선별하여, `;
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

  // 6. AI 예상 CSV 샘플 생성
  function generateSampleCsv() {
    const delim = getDelimiterInfo();
    const langId = promptLangSelect.value;
    const preset = LEVEL_PRESETS[langId] || LEVEL_PRESETS['default'];

    // 3줄의 예시 데이터 조립
    const sampleRowsData = preset.sampleRows || [
      ['[명사]예시1', 'Word1', 'Pronunciation1'],
      ['[동사]예시2', 'Word2', 'Pronunciation2'],
      ['[형용사]예시3', 'Word3', 'Pronunciation3']
    ];

    const lines = sampleRowsData.map((rowArr, rowIdx) => {
      const rowValues = fields.map((f, colIdx) => {
        let val = '';
        if (colIdx === 0 && f.sample && rowIdx === 0) {
          val = f.sample;
        } else if (colIdx < rowArr.length) {
          val = rowArr[colIdx];
        } else {
          val = f.sample || `${f.name}_예시`;
        }

        // 쉼표 구분자이고 값에 쉼표가 들어있을 때 따옴표 래핑
        if (delim.char === ',' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      });

      return rowValues.join(delim.display);
    });

    return lines.join('\n');
  }

  // 7. 실시간 프롬프트 및 미리보기 갱신
  function updatePromptAndPreview(shouldSave = true) {
    updateFormatBanner();

    const prompt = generatePrompt();
    promptOutputText.textContent = prompt;

    const sample = generateSampleCsv();
    sampleCsvText.textContent = sample;

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
        version: 1,
        savedAt: new Date().toISOString(),
        langId: promptLangSelect.value,
        mode: currentMode,
        sourceText: sourceTextInput.value,
        sourceTopic: sourceTopicInput.value,
        levelFilterMode: levelFilterModeSelect.value,
        levelCustom: levelCustomInput.value,
        levelPreset: levelPresetSelect.value,
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
        fields: fields.map(f => ({ name: f.name, sample: f.sample }))
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
        updateLanguagePreset(false);
      }

      if (data.mode) {
        setMode(data.mode, false);
      }
      if (data.sourceText !== undefined) sourceTextInput.value = data.sourceText;
      if (data.sourceTopic !== undefined) sourceTopicInput.value = data.sourceTopic;

      if (data.levelFilterMode !== undefined) levelFilterModeSelect.value = data.levelFilterMode;
      if (data.levelPreset !== undefined) levelPresetSelect.value = data.levelPreset;
      if (data.levelCustom !== undefined) levelCustomInput.value = data.levelCustom;

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
          name: f.name || `필드 ${i + 1}`,
          sample: f.sample || ''
        }));
      }

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
    updateLanguagePreset(false);
    levelCustomInput.value = 'HSK 3급';

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
      { id: 'f_1', name: '[품사]한국어', sample: '[명사]안녕, 안녕하세요' },
      { id: 'f_2', name: '중국어', sample: '你好' },
      { id: 'f_3', name: '병음', sample: 'nǐ hǎo' }
    ];

    renderFields();
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
    levelPresetSelect.disabled = isNone;
    levelCustomInput.disabled = isNone;
  }

  // 9. 컨트롤 이벤트 바인딩
  function initEventListeners() {
    promptLangSelect.addEventListener('change', () => {
      updateLanguagePreset(true);
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

    levelPresetSelect.addEventListener('change', () => {
      if (levelPresetSelect.value === 'custom') {
        levelCustomInput.focus();
        levelCustomInput.select();
      } else {
        levelCustomInput.value = levelPresetSelect.value;
      }
      updatePromptAndPreview();
    });

    levelCustomInput.addEventListener('input', () => updatePromptAndPreview());

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

    // 추천 필드 빠른 추가 칩 버튼
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const sample = btn.dataset.sample || '';
        fields.push({
          id: `f_${Date.now()}_${fields.length}`,
          name: name,
          sample: sample
        });
        renderFields();
        updatePromptAndPreview();
        showToast(`'${name}' 필드가 추가되었습니다.`);
      });
    });

    // 필드 직접 추가 버튼
    btnAddPromptField.addEventListener('click', () => {
      const newIdx = fields.length + 1;
      const newField = {
        id: `f_${Date.now()}_${newIdx}`,
        name: `필드 ${newIdx}`,
        sample: ''
      };
      fields.push(newField);
      renderFields();
      updatePromptAndPreview();
      showToast(`${newIdx}번째 필드가 추가되었습니다.`);

      // 새로 추가된 행의 인풋에 포커스
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
    updateLanguagePreset(false);
  }

  syncLevelRowState();
  renderFields();
  updatePromptAndPreview(false);
});

