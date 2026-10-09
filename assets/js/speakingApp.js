/**
 * Study with Wanzi - 말하기 시험 실전 연습기 (Speaking Mock Test Simulator)
 * Zero dependency / Web Speech API (TTS) / Web Audio API (비프 알림음)
 */

document.addEventListener('DOMContentLoaded', () => {
  const FALLBACK_KO = {
    'speaking.sim.pause': '일시정지',
    'speaking.sim.resume': '계속하기',
    'speaking.sim.showQuestion': '문제 텍스트 보기',
    'speaking.sim.hideQuestion': '문제 텍스트 숨기기',
    'speaking.sim.statusListening': '🗣️ 문제 낭독 중...',
    'speaking.sim.statusSpeaking': '⏱️ 답변 시간 (Speaking)',
    'speaking.sim.statusBreak': '☕ 휴식 & 다음 문제 준비 중',
    'speaking.sim.statusPaused': '⏸️ 일시 정지됨',
    'speaking.sim.next': '다음 문제 ➔',
    'speaking.sim.prev': '◀ 이전 문제',
    'speaking.sim.replay': '🔊 다시 듣기',
    'speaking.sim.skipBreak': '휴식 건너뛰기 ➔',
    'speaking.sim.stop': '시험 중단',
    'speaking.sim.confirmStop': '진행 중인 시험을 중단하고 설정으로 돌아갈까요?',
    'speaking.sim.progress': '문제 {current} / {total}',
    'speaking.step1.parsedCount': '인식된 문제: {count}개',
    'speaking.step1.parsedCountEmpty': '문제를 입력하거나 샘플 버튼을 눌러보세요',
    'speaking.step2.setAll': '전체 선택 ({count}개)',
    'speaking.step2.voiceAuto': '🌐 언어 자동 감지 (한국어·영어·중국어 등 혼합 낭독)',
    'speaking.step2.testPhrase': '안녕하세요! Hello! 언어 자동 감지 음성 테스트입니다.',
    'speaking.step1.noQuestionsWarn': '문제를 최소 1개 이상 입력해주세요.'
  };

  const t = (key, params) => {
    let text;
    if (window.i18n) {
      text = window.i18n.t(key, params);
      if (text !== key) return text;
    }
    text = FALLBACK_KO[key] || key;
    if (params) {
      text = text.replace(/\{(\w+)\}/g, (m, name) => (params[name] !== undefined ? params[name] : m));
    }
    return text;
  };

  // =========================================================================
  // 1. 모든 DOM 요소 참조 (TDZ 에러 방지를 위해 최상단에서 일괄 선언)
  // =========================================================================
  const questionInput = document.getElementById('questionInput');
  const sampleTourBtn = document.getElementById('sampleTourBtn');
  const sampleOpicBtn = document.getElementById('sampleOpicBtn');
  const sampleToeicBtn = document.getElementById('sampleToeicBtn');
  const sampleHskkBtn = document.getElementById('sampleHskkBtn');
  const clearQuestionsBtn = document.getElementById('clearQuestionsBtn');
  const parsedStatusBox = document.getElementById('parsedStatusBox');
  const parsedCountBadge = document.getElementById('parsedCountBadge');
  const togglePreviewBtn = document.getElementById('togglePreviewBtn');
  const parsedPreviewList = document.getElementById('parsedPreviewList');
  const cleanNumberingCheck = document.getElementById('cleanNumberingCheck');

  const answerTimeInput = document.getElementById('answerTimeInput');
  const breakTimeInput = document.getElementById('breakTimeInput');
  const maxQuestionsInput = document.getElementById('maxQuestionsInput');
  const setAllQuestionsBtn = document.getElementById('setAllQuestionsBtn');
  const maxQuestionsHint = document.getElementById('maxQuestionsHint');

  const voiceSelect = document.getElementById('voiceSelect');
  const ttsRateSlider = document.getElementById('ttsRateSlider');
  const ttsRateVal = document.getElementById('ttsRateVal');
  const testVoiceBtn = document.getElementById('testVoiceBtn');
  const ttsWaitCheck = document.getElementById('ttsWaitCheck');
  const hideTextCheck = document.getElementById('hideTextCheck');
  const soundToggle = document.getElementById('soundToggle');
  const soundTypeSelect = document.getElementById('soundTypeSelect');
  const soundDurationSelect = document.getElementById('soundDurationSelect');
  const testSoundBtn = document.getElementById('testSoundBtn');
  const soundDetailPanel = document.getElementById('soundDetailPanel');

  const startExamBtn = document.getElementById('startExamBtn');
  const setupSection = document.getElementById('setupSection');
  const simulatorView = document.getElementById('simulatorView');
  const resultCard = document.getElementById('resultCard');

  // 시뮬레이터 뷰 요소
  const simPhaseBadge = document.getElementById('simPhaseBadge');
  const simProgressText = document.getElementById('simProgressText');
  const simProgressFill = document.getElementById('simProgressFill');
  const timerCircleProgress = document.getElementById('timerCircleProgress');
  const timerClock = document.getElementById('timerClock');
  const timerPhaseCaption = document.getElementById('timerPhaseCaption');
  const simQuestionText = document.getElementById('simQuestionText');
  const btnFontSmaller = document.getElementById('btnFontSmaller');
  const btnFontBigger = document.getElementById('btnFontBigger');
  const btnToggleHide = document.getElementById('btnToggleHide');

  const btnPauseResume = document.getElementById('btnPauseResume');
  const btnReplayVoice = document.getElementById('btnReplayVoice');
  const btnSkipBreak = document.getElementById('btnSkipBreak');
  const btnPrevQuestion = document.getElementById('btnPrevQuestion');
  const btnNextQuestion = document.getElementById('btnNextQuestion');
  const btnStopExam = document.getElementById('btnStopExam');

  // 결과 화면 요소
  const resTotalTime = document.getElementById('resTotalTime');
  const resCompletedCount = document.getElementById('resCompletedCount');
  const resQuestionList = document.getElementById('resQuestionList');
  const btnRetryExam = document.getElementById('btnRetryExam');
  const btnBackToSetup = document.getElementById('btnBackToSetup');

  // =========================================================================
  // 2. 프리셋 샘플 문제 목록
  // =========================================================================
  const SAMPLES = {
    tour: [
      "십장생에 대해 설명하시오.",
      "훈민정음에 대해 설명하시오.",
      "한식의 세계화 방법은?",
      "아리랑에 대해 설명하세요.",
      "유네스코 세계무형유산 5개를 나열해보세요.",
      "단오에 대해 설명하세요.",
      "봉사관광이란?",
      "한국의 전통 무예 태권도에 대해 설명하세요.",
      "한국의 전통 음악 판소리에 대해 설명하세요.",
      "한옥의 특징을 설명하세요.",
      "김장 문화에 대해 설명하고 그 의미를 소개하세요.",
      "한국의 전통 놀이 3가지를 소개하세요.",
      "한복의 특징과 현대적 활용에 대해 설명하세요.",
      "한국의 전통 혼례 문화에 대해 설명하세요.",
      "한국의 차 문화에 대해 설명하세요.",
      "스포츠 투어리즘에 대해 설명(개인 의견 포함).",
      "안보관광이란?",
      "안보관광지 2개를 말씀해보세요.",
      "산업관광에 대해서 설명하세요.",
      "Technical tourists에 대해 어떻게 생각하고 어디를 추천할지?",
      "voluntourism이란? 예시는?",
      "다크 투어리즘이란? 관련 관광지는?",
      "에코투어리즘이 무엇인지?",
      "의료관광의 장단점에 대해 설명하세요.",
      "한국의 의료관광 현황과 발전 방안은?",
      "MICE 산업이 무엇이며 한국 현황은?",
      "한국의 템플스테이 프로그램에 대해 설명하세요.",
      "한국의 크루즈 관광에 대해 설명하세요.",
      "농촌 체험 관광의 장점과 발전 방안은?",
      "한국의 영화·드라마 로케이션 투어리즘에 대해 설명하세요.",
      "한국의 카지노 관광 현황과 규제는?",
      "교통체증으로 스케줄이 지연되면 어떻게 하겠는가?",
      "방문하려는 곳이 문을 닫았으면 어떻게 대처할 것인지?",
      "계속 늦는 손님이 있으면 어떻게 하겠는지?",
      "손님이 투어 중 다쳤을때 대처법",
      "손님이 투어 중 여권을 잃어버렸을때",
      "손님이 투어 중 해당 관광지 관광을 거부 할 때",
      "관광객이 귀중품을 잃었을 때 어떻게 대처해야하는가?",
      "고객이 수화물을 잃어버렸을 때 어떻게 대응할 것인지?",
      "관광지를 방문했는데 임시 공휴일인 경우 어떻게 대처할 것인지?",
      "현금·소지품 분실 시 어떻게 대처할지?",
      "관광객이 무단으로 이탈 시 어떻게 대응할 것인지?",
      "하루에 관광지 3곳 중 2곳만 가야 한다면 어떻게 대처할 것인지?",
      "관광객이 공공장소에서 떠들 때 대처법은?",
      "불법체류자에 대한 생각 / 소음을 일으키는 여행자 대처방안은?",
      "관광객이 갑자기 아플 경우 어떻게 대처하겠습니까?",
      "테러 위협 상황 발생 시 대처 방법은?",
      "관광객이 현지 법규를 위반했을 때 어떻게 대응하겠습니까?",
      "자연재해(태풍·홍수 등) 발생 시 대처 방안은?",
      "관광객과 현지인 사이 갈등 발생 시 어떻게 중재하겠습니까?",
      "종묘에 관해 설명하세요.",
      "국립 박물관 시설에 대해 설명하세요.",
      "서울의 4대문은?",
      "사소문이란?",
      "경주 역사지구에 대해서 설명하세요.",
      "한국의 세계문화유산 중 3개를 소개하세요.",
      "국보 1호 숭례문에 대해 설명하세요.",
      "청와대 개방과 추후 처리방안은?",
      "한국의 유네스코 생물권보전지역에 대해 설명하세요.",
      "관광통역안내사의 매력은 무엇인지?",
      "관광통역안내사의 자질 및 특성은?",
      "관통사의 임무는 무엇인지?",
      "관광통역안내사의 자질을 발전시키기 위한 방법은?",
      "관광통역안내사의 태도와 국가관은? 중요한 이유는?",
      "관통사의 역할과 직업에 대한 가치관은 무엇인지?",
      "관통사의 태도는 어때야 된다고 생각하는지?",
      "관통사가 되기 위해 노력한 점은?",
      "관광통역안내사로서 관광개선방안은?",
      "관광통역안내사의 윤리적 책임에 대해 설명하세요.",
      "고객 만족도를 높이기 위한 방법은?",
      "문화적 차이로 인한 오해를 어떻게 해결할 것인가요?",
      "다양한 연령대의 관광객을 동시에 안내할 때의 전략은?",
      "하고 싶은 말은?",
      "부산의 주요 관광지 3곳을 소개하세요.",
      "한국의 대표적인 해수욕장 3곳을 소개하세요.",
      "한국의 대표적인 등산 코스 3곳을 추천하세요.",
      "한국의 전통 시장 문화와 대표 시장을 소개하세요.",
      "중국·일본 등 역사적 마찰이 있는 국가 관광객에게 어떻게 설명할 것인가?",
      "관광객이 역사를 왜곡할 시 어떻게 할 것인지?",
      "한국 관광의 질을 높이기 위한 방안은?",
      "관광산업을 발전시키기 위해서 어떻게 해야 하는지?",
      "한류가 인바운드 관광에 어떻게 영향을 미치는지?",
      "오버투어리즘이란?",
      "지속가능한 관광이란 무엇이며 왜 중요한가요?",
      "한국의 계절별 관광 특징에 대해 설명하세요.",
      "인바운드를 유지하는 마케팅은 무엇이 있는지?",
      "인바운드 관광을 발전시키기 위한 방법은?",
      "인바운드 고객을 늘리기 위한 방안은?",
      "가이드로서 단체여행과 FIT고객을 늘리는 방법은?",
      "그랜드 세일과 페스타의 차이는?",
      "호텔 체크인 과정을 설명하세요.",
      "관광객에게 한국의 대중교통 이용법을 설명하세요.",
      "외국인 관광객을 위한 세금 환급 절차를 설명하세요."
    ],
    opic: [
      "Let's start the interview now. Tell me a little bit about yourself.",
      "You indicated in the survey that you like going to movies. What kind of movies do you like to watch, and why?",
      "Tell me about a memorable trip you took in the past. Where did you go, who did you go with, and what made it so special?",
      "Can you describe your typical workday or school day from the moment you wake up until you go to sleep?",
      "Have you ever experienced an unexpected problem while traveling? What happened, and how did you resolve it?"
    ],
    toeic: [
      "Describe the picture: Two people are having a meeting in an office with a whiteboard in the background.",
      "How often do you go shopping for clothes, and what is the most important factor when you choose them?",
      "If you could learn a new skill this year, what would it be and why would you choose it?",
      "Respond to a customer complaint regarding a delayed delivery of an online order.",
      "Do you agree or disagree that working remotely is more productive than working in an office? Provide reasons."
    ],
    hskk: [
      "请简单做个自我介绍。（你的名字、专业或工作、兴趣爱好）",
      "谈谈你最喜欢的一个季节，并说明你喜欢它的理由。",
      "你平时是怎样安排假期的？请详细说一说。",
      "在学习外语的过程中，你遇到过什么困难？你是如何克服的？"
    ]
  };

  // =========================================================================
  // 3. 사운드 신디사이저 (Web Audio API - 외부 오디오 파일 없이 삐빅 비프음 생성)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundToggle || !soundToggle.checked) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'finish') {
        const soundType = soundTypeSelect ? soundTypeSelect.value : 'triple';
        const durationSetting = soundDurationSelect ? soundDurationSelect.value : 'normal';
        // speedFactor: short=0.6, normal=1.0, long=1.5
        const speedFactor = durationSetting === 'short' ? 0.6 : (durationSetting === 'long' ? 1.5 : 1.0);

        if (soundType === 'triple') {
          // 삐비빅 3연타 (시험장 알림)
          const baseBursts = [0, 0.38, 0.76];
          const freqs = [880, 1100, 1320];
          baseBursts.forEach(burstDelay => {
            freqs.forEach((freq, idx) => {
              const delay = (burstDelay + idx * 0.075) * speedFactor;
              const dur = 0.065 * speedFactor;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now + delay);
              gain.gain.setValueAtTime(0.35, now + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + delay);
              osc.stop(now + delay + dur);
            });
          });
        } else if (soundType === 'double') {
          // 삐-빅 2단 비프 (경쾌함)
          const notes = [
            { f: 980, d: 0, len: 0.14 },
            { f: 1250, d: 0.2, len: 0.22 }
          ];
          notes.forEach(note => {
            const delay = note.d * speedFactor;
            const dur = note.len * speedFactor;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, now + delay);
            gain.gain.setValueAtTime(0.35, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + dur);
          });
        } else if (soundType === 'chime') {
          // 실로폰 차임벨 (도-미-솔-도 맑은 화음)
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const delay = (idx * 0.14) * speedFactor;
            const dur = 0.35 * speedFactor;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + delay);
            gain.gain.setValueAtTime(0.32, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + dur);
          });
        } else if (soundType === 'single') {
          // 단발 삐- (단순 알림)
          const dur = 0.45 * speedFactor;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + dur);
        } else if (soundType === 'siren') {
          // 스타카토 사이렌 (긴박감 높은 4단 고저 반복음)
          const repeats = durationSetting === 'long' ? 6 : (durationSetting === 'short' ? 2 : 4);
          for (let i = 0; i < repeats; i++) {
            const delay = (i * 0.16) * speedFactor;
            const dur = 0.1 * speedFactor;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(i % 2 === 0 ? 900 : 1200, now + delay);
            gain.gain.setValueAtTime(0.18, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + dur);
          }
        }
      } else if (type === 'start') {
        // 답변 시작 알림음 (단일 차임)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'tick') {
        // 마지막 5초 카운트다운 틱
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'break') {
        // 휴식 시간 알림 (부드러운 화음)
        [523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.25, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
      }
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  }

  // =========================================================================
  // 4. 엑셀 문제 목록 파서 (Excel 줄바꿈 · 따옴표 · TSV 자동 분리)
  // =========================================================================
  function parseExcelQuestions(text, shouldCleanNumbering = true) {
    if (!text) return [];
    const raw = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const split = raw.split('\n');
    const questions = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < split.length; i++) {
      let line = split[i];
      // 엑셀에서 복사해 탭으로 여러 열이 있는 경우, 첫 번째 내용 있는 열 추출
      if (!inQuote && line.includes('\t')) {
        const cols = line.split('\t').map(c => c.trim()).filter(Boolean);
        line = cols.length > 0 ? cols[0] : '';
      }

      const quoteCount = (line.match(/"/g) || []).length;
      if (!inQuote) {
        if (line.startsWith('"') && quoteCount % 2 !== 0) {
          inQuote = true;
          current = line.slice(1);
        } else {
          let cleaned = line.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          if (cleaned) questions.push(cleaned);
        }
      } else {
        if (quoteCount % 2 !== 0) {
          inQuote = false;
          current += '\n' + (line.endsWith('"') ? line.slice(0, -1) : line);
          let cleaned = current.replace(/""/g, '"').trim();
          if (cleaned) questions.push(cleaned);
          current = '';
        } else {
          current += '\n' + line;
        }
      }
    }

    if (shouldCleanNumbering) {
      return questions.map(q => q.replace(/^(Q\s*\d+[\s:.)\-]+|\d+[\s:.)\-]+|\([0-9]+\)\s*)/i, '').trim()).filter(Boolean);
    }
    return questions.filter(Boolean);
  }

  // =========================================================================
  // 5. 문제 큐 생성 알고리즘 (랜덤 출제, 중복 방지, 풀 초과 시 순환 허용)
  // =========================================================================
  function buildQuestionQueue(pool, count) {
    if (!pool || pool.length === 0 || count <= 0) return [];
    const shuffle = arr => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const result = [];
    let lastItem = null;
    while (result.length < count) {
      let round = shuffle(pool);
      // 풀 크기가 2개 이상일 때 이전 라운드 마지막 문제와 바로 연속으로 겹치지 않게 교환
      if (pool.length > 1 && lastItem && round[0] === lastItem) {
        const swapIdx = 1 + Math.floor(Math.random() * (round.length - 1));
        [round[0], round[swapIdx]] = [round[swapIdx], round[0]];
      }
      for (let item of round) {
        if (result.length < count) {
          result.push(item);
          lastItem = item;
        } else {
          break;
        }
      }
    }
    return result;
  }

  // =========================================================================
  // 6. 음성 합성 (Web Speech API - TTS)
  // =========================================================================
  let availableVoices = [];
  let savedVoicePreference = '';

  const LANG_LABELS = {
    'en': '🇺🇸/🇬🇧 영어',
    'en-US': '🇺🇸 영어 (미국)',
    'en-GB': '🇬🇧 영어 (영국)',
    'en-AU': '🇦🇺 영어 (호주)',
    'ko': '🇰🇷 한국어',
    'ko-KR': '🇰🇷 한국어',
    'zh': '🇨🇳 중국어',
    'zh-CN': '🇨🇳 중국어 (보통화)',
    'zh-TW': '🇹🇼 중국어 (대만)',
    'ja': '🇯🇵 일본어',
    'ja-JP': '🇯🇵 일본어',
    'es': '🇪🇸 스페인어',
    'es-ES': '🇪🇸 스페인어',
    'fr': '🇫🇷 프랑스어',
    'fr-FR': '🇫🇷 프랑스어',
    'de': '🇩🇪 독일어',
    'de-DE': '🇩🇪 독일어',
    'it': '🇮🇹 이탈리아어',
    'ru': '🇷🇺 러시아어'
  };

  function getLangLabel(lang) {
    if (!lang) return '기타';
    if (LANG_LABELS[lang]) return LANG_LABELS[lang];
    const prefix = lang.slice(0, 2).toLowerCase();
    return LANG_LABELS[prefix] || lang;
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) {
      if (voiceSelect) {
        voiceSelect.innerHTML = '<option value="">(이 브라우저는 음성 합성을 지원하지 않습니다)</option>';
      }
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      availableVoices = voices;
      renderVoiceOptions();
    } else if (voiceSelect && voiceSelect.options.length === 0) {
      voiceSelect.innerHTML = '<option value="" disabled selected>음성 목록을 불러오는 중입니다...</option>';
    }
  }

  function renderVoiceOptions() {
    if (!voiceSelect) return;
    const currentVal = savedVoicePreference || voiceSelect.value || 'auto';
    voiceSelect.innerHTML = '';

    // 1) 최상단 기본 옵션: 언어 자동 감지 & 혼합 낭독 (한국어·영어·중국어 등)
    const autoOpt = document.createElement('option');
    autoOpt.value = 'auto';
    autoOpt.textContent = t('speaking.step2.voiceAuto');
    voiceSelect.appendChild(autoOpt);

    if (availableVoices.length === 0) {
      voiceSelect.value = 'auto';
      return;
    }

    // 2) 개별 음성 목록 (주요 언어 우선 순위 정렬)
    const priorityPrefixes = ['en', 'ko', 'zh', 'ja', 'es', 'fr', 'de'];
    const sorted = availableVoices.slice().sort((a, b) => {
      const aLang = (a.lang || '').slice(0, 2).toLowerCase();
      const bLang = (b.lang || '').slice(0, 2).toLowerCase();
      const aP = priorityPrefixes.indexOf(aLang);
      const bP = priorityPrefixes.indexOf(bLang);
      if (aP !== -1 && bP !== -1 && aP !== bP) return aP - bP;
      if (aP !== -1 && bP === -1) return -1;
      if (bP !== -1 && aP === -1) return 1;
      const langCmp = (a.lang || '').localeCompare(b.lang || '');
      if (langCmp !== 0) return langCmp;
      return a.name.localeCompare(b.name);
    });

    sorted.forEach((voice) => {
      const opt = document.createElement('option');
      opt.value = voice.name;
      const label = getLangLabel(voice.lang);
      opt.textContent = `${label} - ${voice.name}${voice.default ? ' ★' : ''}`;
      voiceSelect.appendChild(opt);
    });

    // 기본값: 'auto' 또는 사용자가 이전에 선택한 음성
    if (currentVal && (currentVal === 'auto' || sorted.some(v => v.name === currentVal))) {
      voiceSelect.value = currentVal;
    } else {
      voiceSelect.value = 'auto';
    }
  }

  function getBestVoiceForLang(lang) {
    if (!availableVoices || availableVoices.length === 0) return null;
    const prefix = (lang || 'en').toLowerCase();
    return availableVoices.find(v => (v.lang || '').toLowerCase().startsWith(prefix))
      || availableVoices[0]
      || null;
  }

  // 문장을 언어별 세그먼트로 지능적 분리 (한국어 / 영어 / 중국어 / 일본어 혼합 처리)
  function segmentMixedText(text) {
    if (!text) return [];
    const isHangul = ch => /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(ch);
    const isKana = ch => /[\u3040-\u309F\u30A0-\u30FF]/.test(ch);
    const isHanzi = ch => /[\u4E00-\u9FFF]/.test(ch);
    const isLatin = ch => /[a-zA-Z]/.test(ch);

    const segments = [];
    let currentText = '';
    let currentLang = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let chLang = '';
      if (isHangul(ch)) chLang = 'ko';
      else if (isKana(ch)) chLang = 'ja';
      else if (isHanzi(ch)) chLang = 'zh';
      else if (isLatin(ch)) chLang = 'en';
      else chLang = 'neutral';

      if (chLang !== 'neutral') {
        if (!currentLang) {
          currentLang = chLang;
          currentText += ch;
        } else if (currentLang === chLang) {
          currentText += ch;
        } else {
          if (currentText.trim()) {
            segments.push({ text: currentText.trim(), lang: currentLang });
          }
          currentText = ch;
          currentLang = chLang;
        }
      } else {
        currentText += ch;
      }
    }
    if (currentText.trim()) {
      segments.push({ text: currentText.trim(), lang: currentLang || 'en' });
    }
    return segments;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    [50, 250, 600, 1500, 3000].forEach(delay => setTimeout(loadVoices, delay));
  }

  let isSpeakingCanceled = false;

  function stopSpeaking() {
    isSpeakingCanceled = true;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function speakText(text, onEnd) {
    if (!('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }
    stopSpeaking();
    isSpeakingCanceled = false;

    const selectedVoiceName = voiceSelect ? voiceSelect.value : 'auto';
    const rate = parseFloat(ttsRateSlider ? ttsRateSlider.value : '1.0') || 1.0;

    // 1) 사용자가 특정 고정 음성을 수동으로 선택한 경우
    if (selectedVoiceName && selectedVoiceName !== 'auto') {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = availableVoices.find(v => v.name === selectedVoiceName);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.rate = rate;
      utterance.pitch = 1.0;

      let hasEnded = false;
      const finish = () => {
        if (!hasEnded && !isSpeakingCanceled) {
          hasEnded = true;
          if (onEnd) onEnd();
        }
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
      return;
    }

    // 2) 'auto' 모드: 한국어·영어·중국어 등 문제 언어를 자동 감지하여 세그먼트별 원어민 음성으로 순차 낭독
    const segments = segmentMixedText(text);
    if (segments.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    let currentSegIdx = 0;
    function playNextSegment() {
      if (isSpeakingCanceled) return;
      if (currentSegIdx >= segments.length) {
        if (onEnd) onEnd();
        return;
      }
      const seg = segments[currentSegIdx];
      currentSegIdx++;

      const utterance = new SpeechSynthesisUtterance(seg.text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      const voice = getBestVoiceForLang(seg.lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      let segEnded = false;
      const handleDone = () => {
        if (!segEnded && !isSpeakingCanceled) {
          segEnded = true;
          playNextSegment();
        }
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;
      window.speechSynthesis.speak(utterance);
    }

    playNextSegment();
  }

  // =========================================================================
  // 7. 상태 관리 (State Machine)
  // =========================================================================
  const CIRCLE_RADIUS = 78;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  if (timerCircleProgress) {
    timerCircleProgress.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
  }

  let state = {
    pool: [],
    queue: [],
    currentIndex: 0,
    phase: 'SETUP', // 'SETUP' | 'LISTENING' | 'SPEAKING' | 'BREAK' | 'PAUSED' | 'FINISHED'
    previousPhase: null,
    totalDurationMs: 0,
    remainingMs: 0,
    timerInterval: null,
    lastTickTime: 0,
    examStartTime: 0,
    fontSize: 1.35,
    isTextHidden: false,
    history: []
  };

  // =========================================================================
  // 8. 프리셋 버튼 활성화 UI 동기화
  // =========================================================================
  function updatePresetPillsActive(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const currentVal = String(input.value).trim();
    document.querySelectorAll(`.preset-pill[data-for="${inputId}"]`).forEach(pill => {
      const pillVal = String(pill.getAttribute('data-val') || '').trim();
      pill.classList.toggle('active', pillVal === currentVal);
    });
  }

  // =========================================================================
  // 9. 로컬스토리지 자동 저장 / 복원
  // =========================================================================
  const STORAGE_KEY = 'wanzi_speaking_settings';

  function saveSettings() {
    const data = {
      questions: questionInput.value,
      cleanNumbering: cleanNumberingCheck.checked,
      answerTime: answerTimeInput.value,
      breakTime: breakTimeInput.value,
      maxQuestions: maxQuestionsInput.value,
      voice: voiceSelect ? voiceSelect.value : '',
      rate: ttsRateSlider ? ttsRateSlider.value : '1.0',
      ttsWait: ttsWaitCheck.checked,
      hideText: hideTextCheck.checked,
      sound: soundToggle.checked,
      soundType: soundTypeSelect ? soundTypeSelect.value : 'triple',
      soundDuration: soundDurationSelect ? soundDurationSelect.value : 'normal'
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // 기본값: 디폴트 답변시간 90초, 휴식 10초, OPIc 샘플
        answerTimeInput.value = '90';
        breakTimeInput.value = '10';
        questionInput.value = SAMPLES.opic.join('\n');
        updatePresetPillsActive('answerTimeInput');
        updatePresetPillsActive('breakTimeInput');
        updateParsedStatus();
        return;
      }
      const data = JSON.parse(raw);
      if (data.questions !== undefined) questionInput.value = data.questions;
      if (data.cleanNumbering !== undefined) cleanNumberingCheck.checked = data.cleanNumbering;
      // answerTime 기본값은 90초
      answerTimeInput.value = data.answerTime ? data.answerTime : '90';
      if (data.breakTime !== undefined) breakTimeInput.value = data.breakTime;
      if (data.maxQuestions !== undefined) maxQuestionsInput.value = data.maxQuestions;
      if (data.rate !== undefined && ttsRateSlider) {
        ttsRateSlider.value = data.rate;
        if (ttsRateVal) ttsRateVal.textContent = `${parseFloat(data.rate).toFixed(1)}x`;
      }
      if (data.ttsWait !== undefined) ttsWaitCheck.checked = data.ttsWait;
      if (data.hideText !== undefined) hideTextCheck.checked = data.hideText;
      if (data.sound !== undefined) soundToggle.checked = data.sound;
      if (data.soundType && soundTypeSelect) soundTypeSelect.value = data.soundType;
      if (data.soundDuration && soundDurationSelect) soundDurationSelect.value = data.soundDuration;
      if (data.voice) {
        savedVoicePreference = data.voice;
        if (voiceSelect && availableVoices.some(v => v.name === data.voice)) {
          voiceSelect.value = data.voice;
        }
      }

      updatePresetPillsActive('answerTimeInput');
      updatePresetPillsActive('breakTimeInput');
      updateParsedStatus();
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  // =========================================================================
  // 10. 파싱 및 UI 업데이트
  // =========================================================================
  function updateParsedStatus() {
    const questions = parseExcelQuestions(questionInput.value, cleanNumberingCheck.checked);
    state.pool = questions;

    if (questions.length === 0) {
      parsedStatusBox.classList.add('empty');
      parsedCountBadge.textContent = t('speaking.step1.parsedCountEmpty');
      togglePreviewBtn.classList.add('hidden');
      parsedPreviewList.classList.add('hidden');
      if (maxQuestionsHint) maxQuestionsHint.textContent = '';
      if (setAllQuestionsBtn) setAllQuestionsBtn.textContent = '전체 선택';
      return;
    }

    parsedStatusBox.classList.remove('empty');
    parsedCountBadge.textContent = t('speaking.step1.parsedCount', { count: questions.length });
    togglePreviewBtn.classList.remove('hidden');

    if (setAllQuestionsBtn) {
      setAllQuestionsBtn.textContent = t('speaking.step2.setAll', { count: questions.length });
    }

    // 최대 문제수 힌트 업데이트
    if (maxQuestionsHint) {
      maxQuestionsHint.textContent = t('speaking.step2.maxQuestionsHint', { total: questions.length });
    }

    renderPreviewList(questions);
  }

  function renderPreviewList(questions) {
    parsedPreviewList.innerHTML = '';
    questions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'preview-question-item';

      const num = document.createElement('span');
      num.className = 'preview-q-num';
      num.textContent = `${idx + 1}.`;

      const text = document.createElement('span');
      text.className = 'preview-q-text';
      text.textContent = q;

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'preview-q-delete';
      del.innerHTML = '✕';
      del.title = '이 문제 삭제';
      del.addEventListener('click', () => {
        const currentList = parseExcelQuestions(questionInput.value, cleanNumberingCheck.checked);
        currentList.splice(idx, 1);
        questionInput.value = currentList.join('\n');
        updateParsedStatus();
        saveSettings();
      });

      item.append(num, text, del);
      parsedPreviewList.appendChild(item);
    });
  }

  // 프리셋 알약 버튼들 이벤트 연결 (클릭 시 값 반영 & active 하이라이트 & 저장)
  document.querySelectorAll('.preset-pill[data-for]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = pill.getAttribute('data-for');
      const val = pill.getAttribute('data-val');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = val;
        updatePresetPillsActive(targetId);
        saveSettings();
      }
    });
  });

  // 직접 숫자 입력 시에도 프리셋 active 상태 동기화
  [answerTimeInput, breakTimeInput, maxQuestionsInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updatePresetPillsActive(input.id));
      input.addEventListener('change', () => {
        updatePresetPillsActive(input.id);
        saveSettings();
      });
    }
  });

  // 샘플 버튼들
  if (sampleTourBtn) {
    sampleTourBtn.addEventListener('click', () => {
      questionInput.value = SAMPLES.tour.join('\n');
      updateParsedStatus();
      saveSettings();
    });
  }
  sampleOpicBtn.addEventListener('click', () => {
    questionInput.value = SAMPLES.opic.join('\n');
    updateParsedStatus();
    saveSettings();
  });
  sampleToeicBtn.addEventListener('click', () => {
    questionInput.value = SAMPLES.toeic.join('\n');
    updateParsedStatus();
    saveSettings();
  });
  sampleHskkBtn.addEventListener('click', () => {
    questionInput.value = SAMPLES.hskk.join('\n');
    updateParsedStatus();
    saveSettings();
  });
  clearQuestionsBtn.addEventListener('click', () => {
    questionInput.value = '';
    updateParsedStatus();
    saveSettings();
  });

  togglePreviewBtn.addEventListener('click', () => {
    const isHidden = parsedPreviewList.classList.toggle('hidden');
    togglePreviewBtn.textContent = isHidden ? '▼ 목록 보기' : '▲ 목록 닫기';
  });

  cleanNumberingCheck.addEventListener('change', () => {
    updateParsedStatus();
    saveSettings();
  });

  setAllQuestionsBtn.addEventListener('click', () => {
    if (state.pool.length > 0) {
      maxQuestionsInput.value = state.pool.length;
      saveSettings();
    }
  });

  questionInput.addEventListener('input', () => {
    updateParsedStatus();
    saveSettings();
  });

  [ttsWaitCheck, hideTextCheck, soundToggle, soundTypeSelect, soundDurationSelect].forEach(el => {
    if (el) el.addEventListener('change', () => {
      if (soundToggle && soundDetailPanel) {
        soundDetailPanel.style.opacity = soundToggle.checked ? '1' : '0.4';
        soundDetailPanel.style.pointerEvents = soundToggle.checked ? 'auto' : 'none';
      }
      saveSettings();
    });
  });

  if (soundToggle && soundDetailPanel) {
    soundDetailPanel.style.opacity = soundToggle.checked ? '1' : '0.4';
    soundDetailPanel.style.pointerEvents = soundToggle.checked ? 'auto' : 'none';
  }

  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      savedVoicePreference = voiceSelect.value;
      saveSettings();
    });
  }
  if (ttsRateSlider) {
    ttsRateSlider.addEventListener('input', () => {
      if (ttsRateVal) ttsRateVal.textContent = `${parseFloat(ttsRateSlider.value).toFixed(1)}x`;
      saveSettings();
    });
  }

  testVoiceBtn.addEventListener('click', () => {
    getAudioContext();
    const testPhrase = t('speaking.step2.testPhrase');
    speakText(testPhrase);
  });

  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      getAudioContext();
      // 사운드 토글이 꺼져 있어도 테스트 버튼 클릭 시에는 미리 들어볼 수 있도록 지원
      const origChecked = soundToggle.checked;
      soundToggle.checked = true;
      playSound('finish');
      soundToggle.checked = origChecked;
    });
  }

  // =========================================================================
  // 11. 시뮬레이터 실행 로직 (Engine)
  // =========================================================================
  function formatSeconds(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateCircleProgress(ratio, phase) {
    const offset = CIRCLE_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, ratio)));
    timerCircleProgress.style.strokeDashoffset = offset;

    timerCircleProgress.classList.remove('listening', 'break', 'warning');
    timerClock.classList.remove('warning');

    if (phase === 'LISTENING') {
      timerCircleProgress.classList.add('listening');
    } else if (phase === 'BREAK') {
      timerCircleProgress.classList.add('break');
    } else if (phase === 'SPEAKING') {
      if (state.remainingMs <= 5000 && state.remainingMs > 0) {
        timerCircleProgress.classList.add('warning');
        timerClock.classList.add('warning');
      }
    }
  }

  function startExam() {
    getAudioContext();
    updateParsedStatus();
    if (state.pool.length === 0) {
      alert(t('speaking.step1.noQuestionsWarn'));
      questionInput.focus();
      return;
    }

    const answerSec = Math.max(5, parseInt(answerTimeInput.value, 10) || 90);
    const breakSec = Math.max(0, parseInt(breakTimeInput.value, 10) || 10);
    const maxCount = Math.max(1, parseInt(maxQuestionsInput.value, 10) || state.pool.length);

    // 질문 큐 생성 (무작위 셔플 + 중복 방지 순환)
    state.queue = buildQuestionQueue(state.pool, maxCount);
    state.currentIndex = 0;
    state.history = [];
    state.examStartTime = Date.now();
    state.isTextHidden = hideTextCheck.checked;

    // 화면 전환
    setupSection.classList.add('hidden');
    resultCard.classList.add('hidden');
    simulatorView.classList.remove('hidden');

    applyTextHiddenState();
    loadQuestion(0);
  }

  function loadQuestion(index) {
    if (index >= state.queue.length) {
      finishExam();
      return;
    }
    state.currentIndex = index;
    const currentQ = state.queue[index];

    // UI 표시
    simProgressText.textContent = t('speaking.sim.progress', {
      current: index + 1,
      total: state.queue.length
    });
    const overallRatio = (index) / state.queue.length;
    simProgressFill.style.width = `${overallRatio * 100}%`;

    simQuestionText.textContent = currentQ;
    btnSkipBreak.classList.add('hidden');
    btnPauseResume.textContent = t('speaking.sim.pause');

    // 낭독 단계 시작
    setPhase('LISTENING');
  }

  function setPhase(newPhase) {
    state.phase = newPhase;
    clearInterval(state.timerInterval);

    simPhaseBadge.className = 'sim-phase-badge ' + newPhase.toLowerCase();

    if (newPhase === 'LISTENING') {
      simPhaseBadge.textContent = t('speaking.sim.statusListening');
      timerPhaseCaption.textContent = 'LISTENING';
      timerClock.textContent = '--:--';
      updateCircleProgress(1, 'LISTENING');

      const currentQ = state.queue[state.currentIndex];
      const waitAfterTts = ttsWaitCheck.checked;

      if (!waitAfterTts) {
        startSpeakingTimer();
      }

      speakText(currentQ, () => {
        if (state.phase === 'LISTENING') {
          playSound('start');
          startSpeakingTimer();
        }
      });
    } else if (newPhase === 'SPEAKING') {
      simPhaseBadge.textContent = t('speaking.sim.statusSpeaking');
      timerPhaseCaption.textContent = 'SPEAKING';
      btnSkipBreak.classList.add('hidden');
    } else if (newPhase === 'BREAK') {
      simPhaseBadge.textContent = t('speaking.sim.statusBreak');
      timerPhaseCaption.textContent = 'BREAK';
      btnSkipBreak.classList.remove('hidden');
    } else if (newPhase === 'PAUSED') {
      simPhaseBadge.textContent = t('speaking.sim.statusPaused');
      timerPhaseCaption.textContent = 'PAUSED';
    }
  }

  function startSpeakingTimer() {
    const answerSec = Math.max(5, parseInt(answerTimeInput.value, 10) || 90);
    state.totalDurationMs = answerSec * 1000;
    state.remainingMs = state.totalDurationMs;
    setPhase('SPEAKING');

    state.lastTickTime = Date.now();
    runTimerCountdown(() => {
      playSound('finish'); // "삐-빅!" 알림음
      state.history.push({
        question: state.queue[state.currentIndex],
        timeSpentMs: state.totalDurationMs
      });

      const breakSec = parseInt(breakTimeInput.value, 10) || 0;
      if (breakSec > 0 && state.currentIndex < state.queue.length - 1) {
        startBreakTimer(breakSec);
      } else {
        loadQuestion(state.currentIndex + 1);
      }
    });
  }

  function startBreakTimer(breakSec) {
    state.totalDurationMs = breakSec * 1000;
    state.remainingMs = state.totalDurationMs;
    setPhase('BREAK');

    state.lastTickTime = Date.now();
    runTimerCountdown(() => {
      playSound('break');
      loadQuestion(state.currentIndex + 1);
    });
  }

  function runTimerCountdown(onComplete) {
    clearInterval(state.timerInterval);
    let lastSecondReported = Math.ceil(state.remainingMs / 1000);

    const tick = () => {
      const now = Date.now();
      const elapsed = now - state.lastTickTime;
      state.lastTickTime = now;
      state.remainingMs -= elapsed;

      if (state.remainingMs <= 0) {
        clearInterval(state.timerInterval);
        state.remainingMs = 0;
        timerClock.textContent = '00:00';
        updateCircleProgress(0, state.phase);
        if (onComplete) onComplete();
        return;
      }

      if (state.phase === 'SPEAKING') {
        const curSec = Math.ceil(state.remainingMs / 1000);
        if (curSec <= 5 && curSec !== lastSecondReported) {
          lastSecondReported = curSec;
          playSound('tick');
        }
      }

      timerClock.textContent = formatSeconds(state.remainingMs);
      const ratio = state.remainingMs / state.totalDurationMs;
      updateCircleProgress(ratio, state.phase);
    };

    tick();
    state.timerInterval = setInterval(tick, 100);
  }

  function togglePause() {
    if (state.phase === 'PAUSED') {
      const resumeTo = state.previousPhase || 'SPEAKING';
      btnPauseResume.textContent = t('speaking.sim.pause');
      setPhase(resumeTo);
      state.lastTickTime = Date.now();
      runTimerCountdown(() => {
        if (resumeTo === 'SPEAKING') {
          playSound('finish');
          const breakSec = parseInt(breakTimeInput.value, 10) || 0;
          if (breakSec > 0 && state.currentIndex < state.queue.length - 1) {
            startBreakTimer(breakSec);
          } else {
            loadQuestion(state.currentIndex + 1);
          }
        } else if (resumeTo === 'BREAK') {
          loadQuestion(state.currentIndex + 1);
        }
      });
    } else {
      stopSpeaking();
      clearInterval(state.timerInterval);
      state.previousPhase = state.phase;
      setPhase('PAUSED');
      btnPauseResume.textContent = t('speaking.sim.resume');
    }
  }

  function finishExam() {
    stopSpeaking();
    clearInterval(state.timerInterval);
    state.phase = 'FINISHED';

    simulatorView.classList.add('hidden');
    resultCard.classList.remove('hidden');

    const totalMs = Date.now() - state.examStartTime;
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    resTotalTime.textContent = `${mins}분 ${secs}초`;
    resCompletedCount.textContent = `${state.queue.length}개`;

    resQuestionList.innerHTML = '';
    state.queue.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'result-q-item';

      const num = document.createElement('span');
      num.className = 'result-q-num';
      num.textContent = `Q${idx + 1}.`;

      const text = document.createElement('span');
      text.className = 'result-q-text';
      text.textContent = q;

      const replayBtn = document.createElement('button');
      replayBtn.type = 'button';
      replayBtn.className = 'btn-replay-mini';
      replayBtn.innerHTML = '🔊';
      replayBtn.title = '이 문제 다시 듣기';
      replayBtn.addEventListener('click', () => {
        speakText(q);
      });

      item.append(num, text, replayBtn);
      resQuestionList.appendChild(item);
    });
  }

  function stopExamConfirm() {
    if (confirm(t('speaking.sim.confirmStop'))) {
      stopSpeaking();
      clearInterval(state.timerInterval);
      simulatorView.classList.add('hidden');
      resultCard.classList.add('hidden');
      setupSection.classList.remove('hidden');
    }
  }

  function applyTextHiddenState() {
    if (state.isTextHidden) {
      simQuestionText.classList.add('hidden-mode');
      btnToggleHide.textContent = t('speaking.sim.showQuestion');
    } else {
      simQuestionText.classList.remove('hidden-mode');
      btnToggleHide.textContent = t('speaking.sim.hideQuestion');
    }
  }

  btnFontSmaller.addEventListener('click', () => {
    state.fontSize = Math.max(1.0, state.fontSize - 0.15);
    simQuestionText.style.fontSize = `${state.fontSize}rem`;
  });

  btnFontBigger.addEventListener('click', () => {
    state.fontSize = Math.min(2.2, state.fontSize + 0.15);
    simQuestionText.style.fontSize = `${state.fontSize}rem`;
  });

  btnToggleHide.addEventListener('click', () => {
    state.isTextHidden = !state.isTextHidden;
    applyTextHiddenState();
  });

  // 버튼 이벤트 연결
  startExamBtn.addEventListener('click', startExam);
  btnPauseResume.addEventListener('click', togglePause);
  btnReplayVoice.addEventListener('click', () => {
    const currentQ = state.queue[state.currentIndex];
    speakText(currentQ);
  });
  btnSkipBreak.addEventListener('click', () => {
    clearInterval(state.timerInterval);
    loadQuestion(state.currentIndex + 1);
  });
  btnNextQuestion.addEventListener('click', () => {
    stopSpeaking();
    clearInterval(state.timerInterval);
    loadQuestion(state.currentIndex + 1);
  });
  btnPrevQuestion.addEventListener('click', () => {
    stopSpeaking();
    clearInterval(state.timerInterval);
    loadQuestion(Math.max(0, state.currentIndex - 1));
  });
  btnStopExam.addEventListener('click', stopExamConfirm);

  btnRetryExam.addEventListener('click', startExam);
  btnBackToSetup.addEventListener('click', () => {
    resultCard.classList.add('hidden');
    setupSection.classList.remove('hidden');
  });

  // =========================================================================
  // 12. 초기화 실행
  // =========================================================================
  loadSettings();
});
