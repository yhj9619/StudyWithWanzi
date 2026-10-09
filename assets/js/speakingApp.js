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
    'speaking.step2.recordVoice': '🎙️ 내 답변 음성 녹음 (최종 화면에서 다시 듣기 · 다운로드)',
    'speaking.step1.cleanNumbering': '문제 앞 번호(1., Q1: 등) 자동 정리',
    'speaking.step1.resizeHint': '상하로 드래그하여 높이 조절 (더블클릭 시 기본 크기)',
    'speaking.step1.noQuestionsWarn': '문제를 최소 1개 이상 입력해주세요.',
    'speaking.sim.micDenied': '마이크 권한이 허용되지 않았거나 마이크가 없어 음성 녹음 없이 시험을 시작합니다.',
    'speaking.result.listenQuestion': '문제 듣기',
    'speaking.result.listenMyVoice': '내 답변 듣기',
    'speaking.result.stopMyVoice': '정지',
    'speaking.result.downloadMyVoice': '다운로드',
    'speaking.result.noRecording': '녹음 없음',
    'speaking.result.timeSpentBadge': '⏱️ 소요: {time}',
    'speaking.result.timeMinSec': '{min}분 {sec}초',
    'speaking.result.timeSecOnly': '{sec}초'
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
  const textareaResizeHandle = document.getElementById('textareaResizeHandle');
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
  const voiceSelectContainer = document.getElementById('voiceSelectContainer');
  const voiceSearchInput = document.getElementById('voiceSearchInput');
  const voiceClearBtn = document.getElementById('voiceClearBtn');
  const voiceToggleBtn = document.getElementById('voiceToggleBtn');
  const voiceDropdownWrapper = document.getElementById('voiceDropdownWrapper');
  const filteredVoiceCount = document.getElementById('filteredVoiceCount');
  const voiceDropdownList = document.getElementById('voiceDropdownList');
  const ttsRateSlider = document.getElementById('ttsRateSlider');
  const ttsRateVal = document.getElementById('ttsRateVal');
  const testVoiceBtn = document.getElementById('testVoiceBtn');
  const ttsWaitCheck = document.getElementById('ttsWaitCheck');
  const recordMyVoiceCheck = document.getElementById('recordMyVoiceCheck');
  const hideTextCheck = document.getElementById('hideTextCheck');
  const soundToggle = document.getElementById('soundToggle');
  const soundTypeSelect = document.getElementById('soundTypeSelect');
  const soundDurationSelect = document.getElementById('soundDurationSelect');
  const testSoundBtn = document.getElementById('testSoundBtn');
  const soundDetailPanel = document.getElementById('soundDetailPanel');
  const voiceStatusBadge = document.getElementById('voiceStatusBadge');

  const startExamBtn = document.getElementById('startExamBtn');
  const setupSection = document.getElementById('setupSection');
  const simulatorView = document.getElementById('simulatorView');
  const resultCard = document.getElementById('resultCard');

  // 시뮬레이터 뷰 요소
  const simPhaseBadge = document.getElementById('simPhaseBadge');
  const simRecIndicator = document.getElementById('simRecIndicator');
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
  let savedVoicePreference = 'auto';

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

  function getVoiceDisplayName(id) {
    if (!id || id === 'auto') {
      return t('speaking.step2.voiceAuto');
    }
    const v = availableVoices.find(voice => voice.name === id);
    if (v) {
      const label = getLangLabel(v.lang);
      return `${label} - ${v.name}${v.default ? ' ★' : ''}`;
    }
    return id;
  }

  function getSortedVoiceList() {
    const priorityPrefixes = ['ko', 'en', 'zh', 'ja', 'es', 'fr', 'de'];
    return availableVoices.slice().sort((a, b) => {
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

  function findMatchIndex(target, query) {
    if (!target || !query) return -1;
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

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlight(text, index, length) {
    if (index < 0 || length <= 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, index))
      + '<mark>' + escapeHtml(text.slice(index, index + length)) + '</mark>'
      + escapeHtml(text.slice(index + length));
  }

  let voiceFocusIndex = -1;

  function renderVoiceDropdownList(query) {
    if (!voiceDropdownList) return;
    voiceDropdownList.innerHTML = '';
    voiceFocusIndex = -1;

    const q = (query || '').trim().toLowerCase();
    const sorted = getSortedVoiceList();

    // 1) auto 옵션 정의
    const autoItem = {
      id: 'auto',
      displayName: t('speaking.step2.voiceAuto'),
      tag: 'AUTO',
      lang: 'auto',
      isAuto: true,
      keywords: ['자동', 'auto', '감지', '한국어', '중국어', '영어', 'korean', 'chinese', 'english', '혼합', '스마트']
    };

    if (!q) {
      // 검색어 없을 때
      const totalCount = 1 + sorted.length;
      if (filteredVoiceCount) {
        filteredVoiceCount.textContent = t('speaking.step2.voiceCount', { count: totalCount });
      }

      // 그룹 1: 스마트 다국어 합성
      addVoiceGroupLabel(t('speaking.step2.voiceGroupAuto'));
      voiceDropdownList.appendChild(buildVoiceDropdownItem(autoItem, '', -1));

      if (sorted.length > 0) {
        const majorLangs = ['ko', 'en', 'zh', 'ja'];
        const majors = sorted.filter(v => majorLangs.includes((v.lang || '').slice(0, 2).toLowerCase()));
        const others = sorted.filter(v => !majorLangs.includes((v.lang || '').slice(0, 2).toLowerCase()));

        if (majors.length > 0) {
          addVoiceGroupLabel(t('speaking.step2.voiceGroupMajor'));
          majors.forEach(v => {
            const label = getLangLabel(v.lang);
            const item = {
              id: v.name,
              displayName: `${label} - ${v.name}${v.default ? ' ★' : ''}`,
              tag: (v.lang || '').toUpperCase(),
              lang: v.lang,
              isAuto: false
            };
            voiceDropdownList.appendChild(buildVoiceDropdownItem(item, '', -1));
          });
        }

        if (others.length > 0) {
          addVoiceGroupLabel(t('speaking.step2.voiceGroupOthers'));
          others.forEach(v => {
            const label = getLangLabel(v.lang);
            const item = {
              id: v.name,
              displayName: `${label} - ${v.name}${v.default ? ' ★' : ''}`,
              tag: (v.lang || '').toUpperCase(),
              lang: v.lang,
              isAuto: false
            };
            voiceDropdownList.appendChild(buildVoiceDropdownItem(item, '', -1));
          });
        }
      }
    } else {
      // 검색어 있을 때
      const matched = [];

      // auto 옵션 검사
      const autoMatchIdx = findMatchIndex(autoItem.displayName, q);
      const autoKeywordMatch = autoItem.keywords.some(k => findMatchIndex(k, q) >= 0);
      if (autoMatchIdx >= 0 || autoKeywordMatch) {
        matched.push({
          item: autoItem,
          matchIdx: autoMatchIdx,
          score: autoMatchIdx === 0 ? 0 : (autoMatchIdx > 0 ? 1 : 2)
        });
      }

      // 각 개별 음성 검사
      sorted.forEach(v => {
        const label = getLangLabel(v.lang);
        const dispName = `${label} - ${v.name}${v.default ? ' ★' : ''}`;
        const nameIdx = findMatchIndex(dispName, q);
        const langIdx = findMatchIndex(v.lang || '', q);
        const rawNameIdx = findMatchIndex(v.name || '', q);

        if (nameIdx >= 0 || langIdx >= 0 || rawNameIdx >= 0) {
          let score = 3;
          let idx = nameIdx;
          if (nameIdx === 0) score = 0;
          else if (nameIdx > 0) score = 1;
          else if (langIdx >= 0 || rawNameIdx >= 0) {
            score = 2;
            idx = -1;
          }
          matched.push({
            item: {
              id: v.name,
              displayName: dispName,
              tag: (v.lang || '').toUpperCase(),
              lang: v.lang,
              isAuto: false
            },
            matchIdx: idx,
            score
          });
        }
      });

      matched.sort((a, b) => a.score - b.score);

      if (filteredVoiceCount) {
        filteredVoiceCount.textContent = t('speaking.step2.voiceCount', { count: matched.length });
      }

      if (matched.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'dropdown-empty';
        empty.textContent = t('speaking.step2.voiceEmpty', { query });
        voiceDropdownList.appendChild(empty);
      } else {
        matched.forEach((m, idx) => {
          const el = buildVoiceDropdownItem(m.item, q, m.matchIdx);
          if (idx === 0) {
            voiceFocusIndex = 0;
            el.classList.add('focused');
          }
          voiceDropdownList.appendChild(el);
        });
      }
    }
  }

  function addVoiceGroupLabel(text) {
    if (!voiceDropdownList) return;
    const li = document.createElement('li');
    li.className = 'dropdown-group-label';
    li.setAttribute('role', 'presentation');
    li.textContent = text;
    voiceDropdownList.appendChild(li);
  }

  function buildVoiceDropdownItem(item, query, matchIdx) {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    li.setAttribute('role', 'option');
    li.id = `voice-opt-${item.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    li.dataset.id = item.id;
    const isSelected = item.id === (voiceSelect ? voiceSelect.value : 'auto');
    if (isSelected) li.classList.add('selected');
    li.setAttribute('aria-selected', isSelected ? 'true' : 'false');

    const nameHtml = (query && matchIdx >= 0)
      ? highlight(item.displayName, matchIdx, query.length)
      : escapeHtml(item.displayName);

    const tagHtml = item.tag ? `<span class="lang-tag">${escapeHtml(item.tag)}</span>` : '';
    const subHtml = item.isAuto
      ? `<div class="lang-alias" style="margin-top: 3px; font-size: 0.74rem; color: #15803d; font-weight: 500;">호환: 🇰🇷 한국어 · 🇨🇳 중국어 · 🇺🇸 영어 · 🇯🇵 일본어</div>`
      : '';

    li.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span class="lang-name">
          <span>${nameHtml}</span>
          ${tagHtml}
        </span>
        ${subHtml}
      </div>
      ${isSelected ? '<span class="check-icon">✓</span>' : ''}
    `;

    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      chooseVoice(item.id);
    });

    return li;
  }

  function chooseVoice(id) {
    if (voiceSelect) {
      voiceSelect.value = id;
    }
    savedVoicePreference = id;
    if (voiceSearchInput) {
      voiceSearchInput.value = getVoiceDisplayName(id);
    }
    updateVoiceStatusBadge();
    saveSettings();
    closeVoiceDropdown();
  }

  function isVoiceDropdownOpen() {
    return voiceDropdownWrapper && !voiceDropdownWrapper.classList.contains('hidden');
  }

  function openVoiceDropdown(filterText) {
    if (!voiceDropdownWrapper) return;
    voiceDropdownWrapper.classList.remove('hidden');
    if (voiceToggleBtn) voiceToggleBtn.classList.add('open');
    if (voiceSearchInput) voiceSearchInput.setAttribute('aria-expanded', 'true');
    renderVoiceDropdownList(filterText);
    updateVoiceClearBtn();
    if (!filterText && voiceDropdownList) {
      const selected = voiceDropdownList.querySelector('.dropdown-item.selected');
      if (selected) selected.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeVoiceDropdown() {
    if (!voiceDropdownWrapper) return;
    voiceDropdownWrapper.classList.add('hidden');
    if (voiceToggleBtn) voiceToggleBtn.classList.remove('open');
    if (voiceSearchInput) {
      voiceSearchInput.setAttribute('aria-expanded', 'false');
      voiceSearchInput.value = getVoiceDisplayName(voiceSelect ? voiceSelect.value : 'auto');
    }
    updateVoiceClearBtn();
    voiceFocusIndex = -1;
    if (voiceDropdownList) voiceDropdownList.innerHTML = '';
  }

  function updateVoiceClearBtn() {
    if (!voiceClearBtn || !voiceSearchInput) return;
    const isShowing = isVoiceDropdownOpen() && voiceSearchInput.value.trim().length > 0;
    voiceClearBtn.classList.toggle('hidden', !isShowing);
  }

  function getVoiceDropdownItems() {
    if (!voiceDropdownList) return [];
    return Array.from(voiceDropdownList.querySelectorAll('.dropdown-item'));
  }

  function updateVoiceFocus() {
    const items = getVoiceDropdownItems();
    items.forEach((item, idx) => {
      const isFocused = idx === voiceFocusIndex;
      item.classList.toggle('focused', isFocused);
      if (isFocused) {
        item.scrollIntoView({ block: 'nearest' });
        if (voiceSearchInput) {
          voiceSearchInput.setAttribute('aria-activedescendant', item.id);
        }
      }
    });
    if (voiceFocusIndex < 0 && voiceSearchInput) {
      voiceSearchInput.removeAttribute('aria-activedescendant');
    }
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) {
      if (voiceSelect) {
        voiceSelect.innerHTML = '<option value="">(이 브라우저는 음성 합성을 지원하지 않습니다)</option>';
      }
      if (voiceSearchInput) {
        voiceSearchInput.value = '(음성 합성 미지원 브라우저)';
        voiceSearchInput.disabled = true;
      }
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      availableVoices = voices;
      renderVoiceOptions();
    } else if (voiceSelect && voiceSelect.options.length === 0) {
      voiceSelect.innerHTML = '<option value="auto">🌐 언어 자동 감지</option>';
      if (voiceSearchInput) {
        voiceSearchInput.value = t('speaking.step2.voiceAuto');
      }
      updateVoiceStatusBadge();
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

    const sorted = getSortedVoiceList();

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

    if (voiceSearchInput) {
      voiceSearchInput.value = getVoiceDisplayName(voiceSelect.value);
    }

    updateVoiceStatusBadge();

    if (isVoiceDropdownOpen()) {
      renderVoiceDropdownList(voiceSearchInput ? voiceSearchInput.value : '');
    }
  }

  function updateVoiceStatusBadge() {
    if (!voiceStatusBadge) return;
    const selected = voiceSelect ? voiceSelect.value : 'auto';
    if (selected === 'auto') {
      const koVoice = getBestVoiceForLang('ko');
      const zhVoice = getBestVoiceForLang('zh');
      const enVoice = getBestVoiceForLang('en');
      const jaVoice = getBestVoiceForLang('ja');

      const supported = [
        { code: 'ko', flag: '🇰🇷', name: t('speaking.step2.compatLangKo') || '한국어', voice: koVoice },
        { code: 'zh', flag: '🇨🇳', name: t('speaking.step2.compatLangZh') || '중국어', voice: zhVoice },
        { code: 'en', flag: '🇺🇸', name: t('speaking.step2.compatLangEn') || '영어', voice: enVoice },
        { code: 'ja', flag: '🇯🇵', name: t('speaking.step2.compatLangJa') || '일본어', voice: jaVoice }
      ];

      const chipsHtml = supported.map(lang => {
        const voiceLabel = lang.voice ? escapeHtml(lang.voice.name) : '기본 엔진';
        const isMatched = Boolean(lang.voice);
        return `<span class="compat-chip ${isMatched ? '' : 'missing'}" title="${lang.name}: ${voiceLabel}">
          <span>${lang.flag} ${escapeHtml(lang.name)}</span>
          <span class="chip-voice-name">${voiceLabel}</span>
        </span>`;
      }).join('');

      voiceStatusBadge.className = 'voice-status-box';
      voiceStatusBadge.innerHTML = `
        <div class="compat-header">
          <span>🌐 ${t('speaking.step2.compatTitle') || '언어 자동 감지 지원 (호환 언어)'}</span>
          <span style="font-size: 0.72rem; font-weight: normal; color: #15803d;">실시간 혼합 분리</span>
        </div>
        <div class="compat-chips-grid">
          ${chipsHtml}
        </div>
        <div class="compat-desc">${t('speaking.step2.compatSubtitle') || '한국어·중국어·영어·일본어가 섞인 문제도 각 언어별 전용 음성으로 순차 전환하여 낭독합니다.'}</div>
      `;
    } else {
      const v = availableVoices.find(item => item.name === selected);
      voiceStatusBadge.className = 'voice-status-box single-mode';
      const langCode = v ? v.lang : '';
      voiceStatusBadge.innerHTML = `
        <div style="font-weight: 600; color: #1e293b;">
          🎙️ ${t('speaking.step2.fixedVoice') || '단일 고정 음성'}: <strong>${escapeHtml(selected)}</strong>
          <span class="lang-tag" style="margin-left: 0.4rem;">${escapeHtml(langCode)}</span>
        </div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem;">
          ${t('speaking.step2.fixedVoiceDesc') || '모든 문제를 선택한 단일 음성으로만 낭독합니다. 다국어 혼합 낭독을 원하시면 "🌐 언어 자동 감지"를 선택하세요.'}
        </div>
      `;
    }
  }

  function getBestVoiceForLang(lang) {
    if (!availableVoices || availableVoices.length === 0) return null;
    const prefix = (lang || 'ko').toLowerCase();

    // 1) lang 속성이 정확히 일치하거나 해당 접두어로 시작하는 음성 우선
    const exact = availableVoices.find(v => {
      const vLang = (v.lang || '').toLowerCase().replace(/_/g, '-');
      return vLang === prefix || vLang.startsWith(prefix + '-');
    });
    if (exact) return exact;

    // 2) 음성 이름(name)에 해당 언어 키워드가 포함된 경우 (Windows/Edge/Chrome 다국어 팩)
    if (prefix === 'zh') {
      const byName = availableVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('chinese') || n.includes('china') || n.includes('mandarin') ||
               n.includes('xiaoxiao') || n.includes('yunxi') || n.includes('yunjian') ||
               n.includes('yaoyao') || n.includes('huihui') || n.includes('kangkang') ||
               n.includes('zhiwei') || n.includes('hanhan');
      });
      if (byName) return byName;
    } else if (prefix === 'ko') {
      const byName = availableVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('korean') || n.includes('korea') || n.includes('sunhi') ||
               n.includes('injoon') || n.includes('heami') || n.includes('yuna');
      });
      if (byName) return byName;
    } else if (prefix === 'en') {
      const byName = availableVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('english') || n.includes('united states') || n.includes('david') ||
               n.includes('zira') || n.includes('mark') || n.includes('jenny');
      });
      if (byName) return byName;
    } else if (prefix === 'ja') {
      const byName = availableVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('japanese') || n.includes('japan') || n.includes('haruka') ||
               n.includes('ayumi') || n.includes('ichiro') || n.includes('sayaka') ||
               n.includes('nanami') || n.includes('keita') || n.includes('kyoko') ||
               n.includes('otoya');
      });
      if (byName) return byName;
    }

    // 3) 언어 느슨한 일치
    const loose = availableVoices.find(v => (v.lang || '').toLowerCase().startsWith(prefix));
    if (loose) return loose;

    return null;
  }

  // 문장을 언어별 세그먼트로 지능적 분리 (한국어 / 영어 / 중국어 / 일본어 혼합 완벽 지원)
  function segmentMixedText(text) {
    if (!text) return [];
    const isHangul = ch => /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(ch);
    const isKana = ch => /[\u3040-\u309F\u30A0-\u30FF]/.test(ch);
    // 한자 범위 (CJK Unified Ideographs + 확장)
    const isHanzi = ch => /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(ch);
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
      else chLang = 'neutral'; // 공백, 기호, 숫자 등

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
      segments.push({ text: currentText.trim(), lang: currentLang || 'ko' });
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

    // 1) 사용자가 드롭다운에서 특정 고정 음성을 수동 선택한 경우
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

    // 2) 'auto' 모드: 한국어·중국어·영어 등 문장 속 언어를 실시간 인식하여 각각의 원어민 전용 음성으로 순차 전환 낭독
    const segments = segmentMixedText(text);
    if (segments.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    const defaultLangCode = {
      'zh': 'zh-CN',
      'ko': 'ko-KR',
      'en': 'en-US',
      'ja': 'ja-JP'
    };

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

      // 해당 언어에 특화된 BCP 47 태그 지정 (음성 매핑 전에도 OS 레벨 언어 엔진이 중국어/한국어를 구분하도록)
      utterance.lang = defaultLangCode[seg.lang] || 'ko-KR';

      const voice = getBestVoiceForLang(seg.lang);
      if (voice) {
        utterance.voice = voice;
        // 음성의 실제 지원 언어로 덮어씌움
        utterance.lang = voice.lang || utterance.lang;
      }

      let segEnded = false;
      const handleDone = () => {
        if (!segEnded && !isSpeakingCanceled) {
          segEnded = true;
          setTimeout(playNextSegment, 70);
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
    history: [],
    micStream: null,
    activeRecorder: null,
    currentRecorderIndex: -1,
    recordings: {},
    isRecordingActive: false,
    _recorderResolve: null,
    questionSpentMs: {},
    speakingStartTime: null
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
      recordVoice: recordMyVoiceCheck ? recordMyVoiceCheck.checked : true,
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
      if (data.recordVoice !== undefined && recordMyVoiceCheck) {
        recordMyVoiceCheck.checked = data.recordVoice;
      }
      if (data.hideText !== undefined) hideTextCheck.checked = data.hideText;
      if (data.sound !== undefined) soundToggle.checked = data.sound;
      if (data.soundType && soundTypeSelect) soundTypeSelect.value = data.soundType;
      if (data.soundDuration && soundDurationSelect) soundDurationSelect.value = data.soundDuration;
      if (data.voice) {
        savedVoicePreference = data.voice;
        if (voiceSelect && (data.voice === 'auto' || availableVoices.some(v => v.name === data.voice))) {
          voiceSelect.value = data.voice;
        }
      } else {
        savedVoicePreference = 'auto';
        if (voiceSelect) voiceSelect.value = 'auto';
      }
      if (voiceSearchInput && voiceSelect) {
        voiceSearchInput.value = getVoiceDisplayName(voiceSelect.value);
      }
      updateVoiceStatusBadge();

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

  // 커스텀 textarea 상하 드래그 리사이즈 핸들
  if (textareaResizeHandle && questionInput) {
    const TEXTAREA_H_KEY = 'wanzi_speaking_textarea_h';
    const DEFAULT_H = 150;

    // 저장된 높이 복원
    const savedH = parseInt(localStorage.getItem(TEXTAREA_H_KEY), 10);
    if (savedH && savedH >= 120 && savedH <= 900) {
      questionInput.style.height = `${savedH}px`;
    }

    let isResizing = false;
    let startY = 0;
    let startH = 0;

    const onPointerMove = (e) => {
      if (!isResizing) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = clientY - startY;
      const newHeight = Math.max(120, Math.min(850, startH + delta));
      questionInput.style.height = `${newHeight}px`;
    };

    const onPointerUp = () => {
      if (!isResizing) return;
      isResizing = false;
      textareaResizeHandle.classList.remove('is-dragging');
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // 최종 높이 저장
      const finalH = questionInput.offsetHeight;
      if (finalH) {
        try {
          localStorage.setItem(TEXTAREA_H_KEY, String(finalH));
        } catch (err) {}
      }
    };

    const onPointerDown = (e) => {
      isResizing = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = questionInput.offsetHeight;
      textareaResizeHandle.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';

      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);

      e.preventDefault();
    };

    textareaResizeHandle.addEventListener('mousedown', onPointerDown);
    textareaResizeHandle.addEventListener('touchstart', onPointerDown, { passive: false });

    // 더블클릭 시 기본 높이로 초기화
    textareaResizeHandle.addEventListener('dblclick', () => {
      questionInput.style.height = `${DEFAULT_H}px`;
      try {
        localStorage.removeItem(TEXTAREA_H_KEY);
      } catch (err) {}
    });
  }

  [ttsWaitCheck, recordMyVoiceCheck, hideTextCheck, soundToggle, soundTypeSelect, soundDurationSelect].forEach(el => {
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

  if (voiceSearchInput) {
    voiceSearchInput.addEventListener('focus', () => {
      const current = getVoiceDisplayName(voiceSelect ? voiceSelect.value : 'auto');
      const query = voiceSearchInput.value.trim() === current ? '' : voiceSearchInput.value;
      openVoiceDropdown(query);
      voiceSearchInput.select();
    });

    voiceSearchInput.addEventListener('click', () => {
      if (!isVoiceDropdownOpen()) {
        const current = getVoiceDisplayName(voiceSelect ? voiceSelect.value : 'auto');
        const query = voiceSearchInput.value.trim() === current ? '' : voiceSearchInput.value;
        openVoiceDropdown(query);
      }
    });

    voiceSearchInput.addEventListener('input', () => {
      openVoiceDropdown(voiceSearchInput.value);
    });

    voiceSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeVoiceDropdown();
        return;
      }
      if (e.key === 'Tab') {
        if (isVoiceDropdownOpen()) closeVoiceDropdown();
        return;
      }
      if (!isVoiceDropdownOpen() && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const current = getVoiceDisplayName(voiceSelect ? voiceSelect.value : 'auto');
        const query = voiceSearchInput.value.trim() === current ? '' : voiceSearchInput.value;
        openVoiceDropdown(query);
        return;
      }
      if (e.isComposing || e.keyCode === 229) return;
      if (!isVoiceDropdownOpen()) return;
      const all = getVoiceDropdownItems();
      if (all.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        voiceFocusIndex = (voiceFocusIndex + 1) % all.length;
        updateVoiceFocus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        voiceFocusIndex = (voiceFocusIndex - 1 + all.length) % all.length;
        updateVoiceFocus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = voiceFocusIndex >= 0 ? all[voiceFocusIndex] : all[0];
        if (target) chooseVoice(target.dataset.id);
        else closeVoiceDropdown();
      }
    });
  }

  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isVoiceDropdownOpen()) {
        closeVoiceDropdown();
      } else if (document.activeElement === voiceSearchInput) {
        const current = getVoiceDisplayName(voiceSelect ? voiceSelect.value : 'auto');
        const query = voiceSearchInput.value.trim() === current ? '' : voiceSearchInput.value;
        openVoiceDropdown(query);
      } else if (voiceSearchInput) {
        voiceSearchInput.focus();
      }
    });
  }

  if (voiceClearBtn) {
    voiceClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (voiceSearchInput) {
        voiceSearchInput.value = '';
        voiceSearchInput.focus();
      }
      openVoiceDropdown('');
    });
  }

  document.addEventListener('click', (e) => {
    if (voiceSelectContainer && !voiceSelectContainer.contains(e.target) && isVoiceDropdownOpen()) {
      closeVoiceDropdown();
    }
  });

  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      savedVoicePreference = voiceSelect.value;
      if (voiceSearchInput) {
        voiceSearchInput.value = getVoiceDisplayName(voiceSelect.value);
      }
      updateVoiceStatusBadge();
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
    const testPhrase = voiceSelect && voiceSelect.value !== 'auto'
      ? t('speaking.step2.testPhrase')
      : '안녕하세요! Hello! 你好，这是语言自动识别测试。';
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
  // 10-B. 실시간 답변 음성 녹음 (MediaRecorder) & 결과 재생 관리자
  // =========================================================================
  function getSupportedAudioMimeType() {
    if (typeof MediaRecorder === 'undefined') return { mimeType: '', ext: 'webm' };
    const candidates = [
      { type: 'audio/webm;codecs=opus', ext: 'webm' },
      { type: 'audio/webm', ext: 'webm' },
      { type: 'audio/mp4;codecs=mp4a.40.2', ext: 'm4a' },
      { type: 'audio/mp4', ext: 'm4a' },
      { type: 'audio/aac', ext: 'aac' },
      { type: 'audio/ogg;codecs=opus', ext: 'ogg' }
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c.type)) {
        return c;
      }
    }
    return { mimeType: '', ext: 'webm' };
  }

  function startQuestionRecording(qIndex) {
    if (!state.micStream || !recordMyVoiceCheck || !recordMyVoiceCheck.checked) return;
    if (typeof MediaRecorder === 'undefined') return;

    stopQuestionRecording();

    try {
      const { mimeType, ext } = getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(state.micStream, options);
      const chunks = [];
      const startTime = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunks.length > 0) {
          const finalType = mimeType || recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunks, { type: finalType });
          const url = URL.createObjectURL(blob);
          const durationMs = Date.now() - startTime;
          if (state.recordings[qIndex] && state.recordings[qIndex].url) {
            try { URL.revokeObjectURL(state.recordings[qIndex].url); } catch (e) {}
          }
          state.recordings[qIndex] = { blob, url, ext, durationMs };
        }
        if (state._recorderResolve) {
          state._recorderResolve();
          state._recorderResolve = null;
        }
      };

      recorder.start(250);
      state.activeRecorder = recorder;
      state.currentRecorderIndex = qIndex;
      state.isRecordingActive = true;
      if (simRecIndicator) {
        simRecIndicator.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('MediaRecorder start error:', err);
      state.isRecordingActive = false;
      if (simRecIndicator) {
        simRecIndicator.classList.add('hidden');
      }
    }
  }

  function stopQuestionRecording() {
    return new Promise(resolve => {
      const rec = state.activeRecorder;
      if (rec && rec.state !== 'inactive') {
        state._recorderResolve = resolve;
        try {
          rec.stop();
        } catch (e) {
          resolve();
        }
        setTimeout(resolve, 300); // 300ms fallback timeout
      } else {
        resolve();
      }
      state.activeRecorder = null;
      state.isRecordingActive = false;
      if (simRecIndicator) {
        simRecIndicator.classList.add('hidden');
      }
    });
  }

  function pauseQuestionRecording() {
    if (state.activeRecorder && state.activeRecorder.state === 'recording') {
      try {
        state.activeRecorder.pause();
        if (simRecIndicator) simRecIndicator.classList.add('hidden');
      } catch (e) {}
    }
  }

  function resumeQuestionRecording() {
    if (state.activeRecorder && state.activeRecorder.state === 'paused') {
      try {
        state.activeRecorder.resume();
        if (simRecIndicator) simRecIndicator.classList.remove('hidden');
      } catch (e) {}
    }
  }

  function releaseMicrophone() {
    stopQuestionRecording();
    if (state.micStream) {
      try {
        state.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      state.micStream = null;
    }
  }

  let userAudioPlayer = null;
  let activeVoiceBtn = null;

  function stopUserVoicePlayback() {
    if (userAudioPlayer) {
      try {
        userAudioPlayer.pause();
        userAudioPlayer.currentTime = 0;
      } catch (e) {}
    }
    if (activeVoiceBtn) {
      activeVoiceBtn.innerHTML = `▶️ <span>${escapeHtml(t('speaking.result.listenMyVoice'))}</span>`;
      activeVoiceBtn.classList.remove('is-playing');
      activeVoiceBtn = null;
    }
  }

  function toggleUserVoicePlayback(url, btn) {
    if (!url) return;

    if (activeVoiceBtn === btn) {
      stopUserVoicePlayback();
      return;
    }

    stopUserVoicePlayback();

    if (!userAudioPlayer) {
      userAudioPlayer = new Audio();
    }

    userAudioPlayer.src = url;
    activeVoiceBtn = btn;
    btn.innerHTML = `⏹️ <span>${escapeHtml(t('speaking.result.stopMyVoice'))}</span>`;
    btn.classList.add('is-playing');

    userAudioPlayer.onended = () => {
      stopUserVoicePlayback();
    };

    userAudioPlayer.onerror = (e) => {
      console.warn('Audio playback error:', e);
      stopUserVoicePlayback();
    };

    userAudioPlayer.play().catch(err => {
      console.warn('Audio play error:', err);
      stopUserVoicePlayback();
    });
  }

  // 문제별 답변 소요 시간 추적 및 포맷
  function recordSpeakingTime(qIndex) {
    if (state.phase === 'SPEAKING' && state.speakingStartTime) {
      const elapsed = Date.now() - state.speakingStartTime;
      state.questionSpentMs[qIndex] = (state.questionSpentMs[qIndex] || 0) + elapsed;
      state.speakingStartTime = null;
    }
  }

  function formatQuestionDuration(ms) {
    const totalSec = Math.max(0, Math.round((ms || 0) / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    let timeStr;
    if (mins > 0) {
      timeStr = t('speaking.result.timeMinSec', { min: mins, sec: secs });
    } else {
      timeStr = t('speaking.result.timeSecOnly', { sec: secs });
    }
    return t('speaking.result.timeSpentBadge', { time: `<strong>${escapeHtml(timeStr)}</strong>` });
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

  async function startExam() {
    getAudioContext();
    updateParsedStatus();
    if (state.pool.length === 0) {
      alert(t('speaking.step1.noQuestionsWarn'));
      questionInput.focus();
      return;
    }

    stopUserVoicePlayback();
    releaseMicrophone();

    // 이전 시험 녹음 메모리 해제
    if (state.recordings) {
      Object.values(state.recordings).forEach(rec => {
        if (rec && rec.url) {
          try { URL.revokeObjectURL(rec.url); } catch (e) {}
        }
      });
    }
    state.recordings = {};
    state.questionSpentMs = {};
    state.speakingStartTime = null;

    // 마이크 권한 요청 (녹음 옵션 켜져 있을 때)
    if (recordMyVoiceCheck && recordMyVoiceCheck.checked) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          state.micStream = stream;
        } catch (err) {
          console.warn('Microphone permission denied or error:', err);
          state.micStream = null;
          alert(t('speaking.sim.micDenied'));
        }
      } else {
        alert(t('speaking.sim.micDenied'));
      }
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
    state.fontSize = window.innerWidth <= 640 ? 1.1 : 1.35;
    if (simQuestionText) {
      simQuestionText.style.fontSize = `${state.fontSize}rem`;
    }

    // 화면 전환 (브라우저 뒤로가기 지원)
    showSimulatorView();
    try {
      history.pushState({ view: 'simulator' }, '', '#exam');
    } catch (e) {}

    applyTextHiddenState();
    loadQuestion(0);
  }

  function showSimulatorView() {
    setupSection.classList.add('hidden');
    resultCard.classList.add('hidden');
    simulatorView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function returnToSetupView(skipHistory = false) {
    stopSpeaking();
    recordSpeakingTime(state.currentIndex);
    stopQuestionRecording();
    releaseMicrophone();
    stopUserVoicePlayback();
    clearInterval(state.timerInterval);
    state.phase = 'SETUP';
    simulatorView.classList.add('hidden');
    resultCard.classList.add('hidden');
    setupSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!skipHistory && location.hash === '#exam') {
      try {
        history.back();
      } catch (e) {}
    }
  }

  async function loadQuestion(index) {
    if (index >= state.queue.length) {
      await finishExam();
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
    const simQuestionCard = document.querySelector('.sim-question-card');
    if (simQuestionCard) {
      simQuestionCard.scrollTop = 0;
    }
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
      recordSpeakingTime(state.currentIndex);
      stopQuestionRecording();
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
      state.speakingStartTime = Date.now();
      simPhaseBadge.textContent = t('speaking.sim.statusSpeaking');
      timerPhaseCaption.textContent = 'SPEAKING';
      btnSkipBreak.classList.add('hidden');
      if (state.activeRecorder && state.activeRecorder.state === 'paused') {
        resumeQuestionRecording();
      } else {
        startQuestionRecording(state.currentIndex);
      }
    } else if (newPhase === 'BREAK') {
      recordSpeakingTime(state.currentIndex);
      stopQuestionRecording();
      simPhaseBadge.textContent = t('speaking.sim.statusBreak');
      timerPhaseCaption.textContent = 'BREAK';
      btnSkipBreak.classList.remove('hidden');
    } else if (newPhase === 'PAUSED') {
      recordSpeakingTime(state.currentIndex);
      pauseQuestionRecording();
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
    runTimerCountdown(async () => {
      playSound('finish'); // "삐-빅!" 알림음
      recordSpeakingTime(state.currentIndex);
      await stopQuestionRecording();
      state.history.push({
        question: state.queue[state.currentIndex],
        timeSpentMs: state.questionSpentMs[state.currentIndex] || state.totalDurationMs
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
      runTimerCountdown(async () => {
        if (resumeTo === 'SPEAKING') {
          playSound('finish');
          recordSpeakingTime(state.currentIndex);
          await stopQuestionRecording();
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
      recordSpeakingTime(state.currentIndex);
      setPhase('PAUSED');
      btnPauseResume.textContent = t('speaking.sim.resume');
    }
  }

  async function finishExam() {
    stopSpeaking();
    recordSpeakingTime(state.currentIndex);
    await stopQuestionRecording();
    releaseMicrophone();
    stopUserVoicePlayback();
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

      const mainDiv = document.createElement('div');
      mainDiv.className = 'result-q-main';

      const num = document.createElement('span');
      num.className = 'result-q-num';
      num.textContent = `Q${idx + 1}.`;

      const text = document.createElement('span');
      text.className = 'result-q-text';
      text.textContent = q;

      mainDiv.append(num, text);

      // 하단 액션 버튼 그룹 (소요 시간 배지, 문제 다시 듣기, 내 답변 듣기, 다운로드)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'result-q-actions';

      // 0) 이 문제 답변 소요 시간 배지
      const spentMs = (state.questionSpentMs && state.questionSpentMs[idx] !== undefined)
        ? state.questionSpentMs[idx]
        : (state.recordings && state.recordings[idx] ? state.recordings[idx].durationMs : 0);

      const timeBadge = document.createElement('span');
      timeBadge.className = 'result-q-time-badge';
      timeBadge.title = '이 문제 답변 소요 시간';
      timeBadge.innerHTML = formatQuestionDuration(spentMs);
      actionsDiv.appendChild(timeBadge);

      // 1) 문제 낭독 다시 듣기
      const replayQBtn = document.createElement('button');
      replayQBtn.type = 'button';
      replayQBtn.className = 'btn-review-action btn-replay-q';
      replayQBtn.innerHTML = `🔊 <span>${escapeHtml(t('speaking.result.listenQuestion'))}</span>`;
      replayQBtn.title = t('speaking.result.listenQuestion');
      replayQBtn.addEventListener('click', () => {
        stopUserVoicePlayback();
        speakText(q);
      });
      actionsDiv.appendChild(replayQBtn);

      // 2) 내 답변 녹음 듣기 및 다운로드 (녹음 데이터가 있는 경우)
      const rec = state.recordings ? state.recordings[idx] : null;
      if (rec && rec.url) {
        const playVoiceBtn = document.createElement('button');
        playVoiceBtn.type = 'button';
        playVoiceBtn.className = 'btn-review-action btn-play-my-voice';
        playVoiceBtn.innerHTML = `▶️ <span>${escapeHtml(t('speaking.result.listenMyVoice'))}</span>`;
        playVoiceBtn.title = t('speaking.result.listenMyVoice');
        playVoiceBtn.addEventListener('click', () => {
          stopSpeaking();
          toggleUserVoicePlayback(rec.url, playVoiceBtn);
        });
        actionsDiv.appendChild(playVoiceBtn);

        const downloadLink = document.createElement('a');
        downloadLink.className = 'btn-review-action btn-download-my-voice';
        downloadLink.href = rec.url;
        downloadLink.download = `Speaking_Q${idx + 1}_Answer.${rec.ext || 'webm'}`;
        downloadLink.innerHTML = `💾 <span>${escapeHtml(t('speaking.result.downloadMyVoice'))}</span>`;
        downloadLink.title = `${t('speaking.result.downloadMyVoice')} (${rec.ext || 'webm'})`;
        actionsDiv.appendChild(downloadLink);
      } else {
        const noRec = document.createElement('span');
        noRec.className = 'no-rec-label';
        noRec.textContent = t('speaking.result.noRecording');
        actionsDiv.appendChild(noRec);
      }

      item.append(mainDiv, actionsDiv);
      resQuestionList.appendChild(item);
    });
  }

  function stopExamConfirm() {
    if (confirm(t('speaking.sim.confirmStop'))) {
      returnToSetupView();
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
    state.fontSize = Math.max(0.85, parseFloat((state.fontSize - 0.15).toFixed(2)));
    simQuestionText.style.fontSize = `${state.fontSize}rem`;
  });

  btnFontBigger.addEventListener('click', () => {
    state.fontSize = Math.min(2.2, parseFloat((state.fontSize + 0.15).toFixed(2)));
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
  btnNextQuestion.addEventListener('click', async () => {
    stopSpeaking();
    recordSpeakingTime(state.currentIndex);
    await stopQuestionRecording();
    clearInterval(state.timerInterval);
    loadQuestion(state.currentIndex + 1);
  });
  btnPrevQuestion.addEventListener('click', async () => {
    stopSpeaking();
    recordSpeakingTime(state.currentIndex);
    await stopQuestionRecording();
    clearInterval(state.timerInterval);
    loadQuestion(Math.max(0, state.currentIndex - 1));
  });
  btnStopExam.addEventListener('click', stopExamConfirm);

  btnRetryExam.addEventListener('click', startExam);
  btnBackToSetup.addEventListener('click', () => {
    returnToSetupView();
  });

  // 브라우저 '뒤로가기' 버튼 감지 (시험 진행 중이거나 결과 화면에서 뒤로가기 누를 시 설정 화면으로 안전하게 복귀)
  window.addEventListener('popstate', (e) => {
    const isExamOrResult = !simulatorView.classList.contains('hidden') || !resultCard.classList.contains('hidden');
    if (isExamOrResult) {
      returnToSetupView(true);
    }
  });

  // =========================================================================
  // 12. 초기화 실행
  // =========================================================================
  loadSettings();
});
