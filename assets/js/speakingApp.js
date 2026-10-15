/**
 * Study with Wanzi - 말하기 시험 실전 연습기 (Speaking Mock Test Simulator)
 * Zero dependency / Web Speech API (TTS) / Web Audio API (비프 알림음)
 */

document.addEventListener('DOMContentLoaded', () => {
  const FALLBACK_KO = {
    'speaking.sim.pause': '⏸ 일시정지',
    'speaking.sim.resume': '▶ 계속하기',
    'speaking.sim.showQuestion': '문제 텍스트 보기',
    'speaking.sim.hideQuestion': '문제 텍스트 숨기기',
    'speaking.sim.statusListening': '🗣️ 문제 낭독 중...',
    'speaking.sim.statusSpeaking': '⏱️ 답변 시간 (Speaking)',
    'speaking.sim.statusBreak': '☕ 휴식 & 다음 문제 준비 중',
    'speaking.sim.statusPaused': '⏸️ 일시 정지됨',
    'speaking.sim.next': '다음 문제 ▶',
    'speaking.sim.prev': '◀ 이전 문제',
    'speaking.sim.replay': '🔊 다시 듣기',
    'speaking.sim.resetCurrent': '🔄 문제 초기화',
    'speaking.sim.confirmResetCurrent': '현재 문제를 처음부터 다시 시작할까요? (현재 답변 녹음 및 소요 시간이 리셋됩니다)',
    'speaking.sim.skipBreak': '휴식 건너뛰기 ▶',
    'speaking.sim.stop': '⏹ 시험 중단',
    'speaking.sim.confirmStop': '진행 중인 시험을 중단하고 지금까지의 결과 화면으로 이동할까요?',
    'speaking.sim.singleRetryBadge': 'Q{num} 다시 풀기',
    'speaking.sim.singleRetryDone': '완료 ▶',
    'speaking.sim.progress': '문제 {current} / {total}',
    'speaking.step1.parsedCount': '인식된 문제: {count}개',
    'speaking.step1.parsedCountEmpty': '문제를 입력하거나 샘플 버튼을 눌러보세요',
    'speaking.step1.sampleTour': '관광통역안내사 샘플',
    'speaking.step1.newList': '+ 새 목록 추가',
    'speaking.step1.newListPrompt': '새 문제 목록의 이름을 입력하세요:',
    'speaking.step1.newListDefaultName': '새 문제 목록',
    'speaking.step1.confirmDeleteList': '"{name}" 목록을 삭제할까요?\n(목록에 저장된 문제 내용이 함께 삭제됩니다)',
    'speaking.step1.renameList': '목록 이름 수정',
    'speaking.step1.renameListPrompt': '목록의 새 이름을 입력하세요:',
    'speaking.step1.paste': '📋 본문 붙여넣기',
    'speaking.step1.pasteSuccess': '클립보드 내용을 붙여넣었습니다 ({count}개 문제 인식)',
    'speaking.step1.pasteEmpty': '클립보드에 복사된 텍스트가 없습니다.',
    'speaking.step1.pasteError': '클립보드 접근 권한이 없거나 지원되지 않습니다. Ctrl+V(또는 Cmd+V)로 직접 붙여넣어 주세요.',
    'speaking.step1.clearText': '🗑️ 본문 삭제',
    'speaking.step1.confirmClearText': '현재 입력된 문제 본문을 모두 삭제할까요?',
    'speaking.step2.setAll': '전체 선택 ({count}개)',
    'speaking.step2.voiceAuto': '🌐 언어 자동 감지 (한국어·영어·중국어 등 혼합 낭독)',
    'speaking.step2.compatTitle': '언어 자동 감지 (한국어 · 영어 · 중국어 · 일본어)',
    'speaking.step2.compatSubtitle': '한국어·영어·중국어·일본어가 섞인 문제도 감지하여 각 언어별 선택된 전용 음성으로 순차 전환하여 낭독합니다.',
    'speaking.step2.compatAdvancedTitle': '고급 설정: 언어별 음성 세부 지정 (직접 선택)',
    'speaking.step2.compatLangKo': '한국어',
    'speaking.step2.compatLangZh': '중국어 (보통화)',
    'speaking.step2.compatLangEn': '영어 (미국 표준 우선)',
    'speaking.step2.compatLangJa': '일본어',
    'speaking.step2.compatAutoRecommend': '⭐ 표준 자동 추천',
    'speaking.step2.compatNoVoice': '시스템 기본 엔진 (음성 팩 미설치)',
    'speaking.step2.previewVoice': '미리듣기',
    'speaking.step2.fixedVoice': '단일 고정 음성',
    'speaking.step2.fixedVoiceDesc': '모든 문제를 선택한 단일 음성으로만 낭독합니다. 다국어 혼합 낭독을 원하시면 "🌐 언어 자동 감지"를 선택하세요.',
    'speaking.step2.testPhrase': '안녕하세요! Hello! 언어 자동 감지 음성 테스트입니다.',
    'speaking.step2.advGroupFlow': '시험 진행 & 화면 표시',
    'speaking.step2.ttsWait': '문제 낭독이 끝난 뒤 답변 타이머 시작 (추천)',
    'speaking.step2.ttsWaitDesc': '원어민이 문제를 다 읽고 난 뒤 답변 카운트다운이 시작됩니다.',
    'speaking.step2.hideText': '문제 텍스트 숨기기',
    'speaking.step2.hideTextDesc': '화면에서 질문 글자를 가리고 오직 소리만 듣고 답하는 실전 듣기 모드입니다.',
    'speaking.step2.advGroupMic': '답변 녹음 & 음성 인식 (STT)',
    'speaking.step2.recordVoice': '내 답변 음성 녹음',
    'speaking.step2.recordVoiceDesc': '시험 종료 후 내 답변을 다시 듣거나 오디오 파일로 다운로드합니다.',
    'speaking.step2.sttExtract': '답변 텍스트 추출 (STT)',
    'speaking.step2.sttExtractDesc': '내가 말한 답변을 실시간 텍스트로 자동 받아적어 결과 화면에서 확인합니다.',
    'speaking.step2.advGroupSound': '비프 알림음 효과',
    'speaking.step2.sound': '비프 알림음 사용',
    'speaking.step2.soundDesc': '시험 시작음, 종료 5초 전 틱틱 경고음, 답변 시간 종료 비프음을 울립니다.',
    'speaking.step1.cleanNumbering': '문제 앞 번호(1., Q1: 등) 자동 정리',
    'speaking.step1.resizeHint': '상하로 드래그하여 높이 조절 (더블클릭 시 기본 크기)',
    'speaking.step1.noQuestionsWarn': '문제를 최소 1개 이상 입력해주세요.',
    'speaking.sim.micDenied': '마이크 권한이 허용되지 않았거나 마이크가 없어 음성 녹음 없이 시험을 시작합니다.',
    'speaking.result.stoppedTitle': '⏸️ 말하기 시험 중단됨',
    'speaking.result.stoppedSubtitle': '시험이 중단되었습니다. 지금까지 진행된 문제들의 답변을 확인해보세요.',
    'speaking.result.listenQuestion': '문제 듣기',
    'speaking.result.listenMyVoice': '내 답변 듣기',
    'speaking.result.stopMyVoice': '정지',
    'speaking.result.downloadMyVoice': '다운로드',
    'speaking.result.resetQuestion': '초기화',
    'speaking.result.retakeQuestion': '다시 풀기',
    'speaking.result.confirmResetQ': 'Q{num}번 문제의 답변 기록을 초기화할까요?',
    'speaking.result.noRecording': '녹음 없음',
    'speaking.result.timeSpentBadge': '⏱️ 소요: {time}',
    'speaking.result.statTotalTime': '총 소요 시간',
    'speaking.result.statCompletedCount': '완료한 문제 수',
    'speaking.result.timeMinSec': '{min}분 {sec}초',
    'speaking.result.timeSecOnly': '{sec}초',
    'speaking.step1.exportJson': '💾 JSON 백업',
    'speaking.step1.importJson': '📂 불러오기',
    'speaking.step1.importSuccess': '백업 파일에서 목록을 성공적으로 불러왔습니다.',
    'speaking.step1.importInvalid': '유효하지 않은 백업 파일 형식입니다.',
    'shadow.deck.sample': '기본 샘플 대본',
    'shadow.deck.defaultName': '내 스크립트',
    'shadow.stat.estMinSec': '약 {min}분 {sec}초',
    'shadow.stat.estSec': '약 {sec}초',
    'shadow.stat.sentenceUnit': '{count}문장',
    'shadow.stat.wordCharUnit': '{words}단어 · {chars}자',
    'shadow.rec.compareBadge': '내 낭독: {mySec}초 vs TTS: {ttsSec}초 ({diff})',
    'shadow.gauge.empty': '대본을 입력하면 목표 시간 대비 분량을 분석해 드립니다.',
    'shadow.gauge.free': '시간 제한 없이 자유롭게 연습하는 모드입니다.',
    'shadow.gauge.short': '💡 목표({target}초) 대비 약 {est}초({pct}%) — 내용을 조금 더 덧붙여도 좋습니다.',
    'shadow.gauge.good': '✅ 목표({target}초) 대비 약 {est}초({pct}%) — 시험 답변으로 아주 이상적인 분량입니다!',
    'shadow.gauge.over': '⚠️ 목표({target}초) 대비 약 {est}초({pct}%) — 제한 시간을 초과할 수 있으니 문장을 줄여보세요.',
    'shadow.card.emptyHint': '위에 스크립트 대본을 입력하면 문장별 쉐도잉 카드가 여기에 생성됩니다.',
    'shadow.card.vsCompare': '원어민 ~{tts}초 vs 나 {my}초',
    'shadow.card.peek': '👁️ 살짝 보기',
    'shadow.card.listen': '🔊 듣기',
    'shadow.card.loopOne': '🔂 1문장 반복',
    'shadow.card.looping': '🔁 반복 중',
    'shadow.card.recSentenceTitle': '이 문장 따라 읽고 내 발음·속도 비교하기',
    'shadow.card.myVoice': '내 발음',
    'shadow.card.recSentence': '이 문장 따라 읽고 녹음하기',
    'shadow.card.playMyRec': '내 발음 녹음 듣기',
    'shadow.card.recCompare': '🎙️ 원어민 ~{native}초 vs 나 {mine}초',
    'shadow.card.playOnce': '이 문장 1회 듣기',
    'shadow.card.loopSingle': '이 문장만 집중 무한 반복',
    'shadow.step2.pauseHint': '💡 [🎧 본문만 연속 듣기] 버튼을 누르면 이 대기 시간과 관계없이 쉼 없이 바로 다음 문장을 읽어줍니다.',
    'shadow.step3.listenAll': '🎧 본문만 연속 듣기',
    'shadow.step3.shadowAll': '🗣️ 쉐도잉 따라 말하기',
    'shadow.step3.listeningActive': '🔊 듣는 중 (처음부터)',
    'shadow.step3.shadowingActive': '🎙️ 쉐도잉 중 (처음부터)'
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
  const deckTabsList = document.getElementById('deckTabsList');
  const btnAddNewDeck = document.getElementById('btnAddNewDeck');
  const btnPasteQuestions = document.getElementById('btnPasteQuestions');
  const btnClearQuestions = document.getElementById('btnClearQuestions');
  const btnExportDecks = document.getElementById('btnExportDecks');
  const btnImportDecks = document.getElementById('btnImportDecks');
  const importDecksFileInput = document.getElementById('importDecksFileInput');
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
  const btnMicTest = document.getElementById('btnMicTest');
  const micTestStatus = document.getElementById('micTestStatus');
  const sttOptionBlock = document.getElementById('sttOptionBlock');
  const sttExtractCheck = document.getElementById('sttExtractCheck');
  const sttLangSelect = document.getElementById('sttLangSelect');
  const sttUnsupportedBadge = document.getElementById('sttUnsupportedBadge');
  const audioFormatSelect = document.getElementById('audioFormatSelect');
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
  const btnResetCurrentQ = document.getElementById('btnResetCurrentQ');
  const btnSkipBreak = document.getElementById('btnSkipBreak');
  const btnPrevQuestion = document.getElementById('btnPrevQuestion');
  const btnNextQuestion = document.getElementById('btnNextQuestion');
  const btnStopExam = document.getElementById('btnStopExam');

  // 결과 화면 요소
  const resTotalTime = document.getElementById('resTotalTime');
  const resCompletedCount = document.getElementById('resCompletedCount');
  const resQuestionList = document.getElementById('resQuestionList');
  const resultBatchDownloadBar = document.getElementById('resultBatchDownloadBar');
  const resRecordingsCount = document.getElementById('resRecordingsCount');
  const btnBatchDownloadZip = document.getElementById('btnBatchDownloadZip');
  const btnBatchDownloadSeq = document.getElementById('btnBatchDownloadSeq');
  const btnRetryExam = document.getElementById('btnRetryExam');
  const btnBackToSetup = document.getElementById('btnBackToSetup');

  // 쉐도잉 스튜디오 및 상단 모드 전환 탭 요소 (TDZ 방지 최상단 선언)
  const modeTabExam = document.getElementById('modeTabExam');
  const modeTabShadow = document.getElementById('modeTabShadow');
  const shadowingSection = document.getElementById('shadowingSection');

  const shadowDeckTabsList = document.getElementById('shadowDeckTabsList');
  const btnAddShadowDeck = document.getElementById('btnAddShadowDeck');
  const shadowScriptInput = document.getElementById('shadowScriptInput');
  const shadowResizeHandle = document.getElementById('shadowResizeHandle');
  const shadowSplitSentenceCheck = document.getElementById('shadowSplitSentenceCheck');
  const btnPasteShadowScript = document.getElementById('btnPasteShadowScript');
  const btnClearShadowScript = document.getElementById('btnClearShadowScript');
  const btnExportShadowDecks = document.getElementById('btnExportShadowDecks');
  const btnImportShadowDecks = document.getElementById('btnImportShadowDecks');
  const importShadowDecksFileInput = document.getElementById('importShadowDecksFileInput');

  const shadowStatSentences = document.getElementById('shadowStatSentences');
  const shadowStatWords = document.getElementById('shadowStatWords');
  const shadowStatDuration = document.getElementById('shadowStatDuration');
  const shadowStatRateTag = document.getElementById('shadowStatRateTag');
  const shadowTargetSecSelect = document.getElementById('shadowTargetSecSelect');
  const shadowTargetFeedback = document.getElementById('shadowTargetFeedback');
  const shadowTargetProgressFill = document.getElementById('shadowTargetProgressFill');

  const shadowTargetLangSelect = document.getElementById('shadowTargetLangSelect');
  const shadowActiveVoiceBadge = document.getElementById('shadowActiveVoiceBadge');
  const shadowTestVoiceBtn = document.getElementById('shadowTestVoiceBtn');

  const shadowRateSlider = document.getElementById('shadowRateSlider');
  const shadowRateVal = document.getElementById('shadowRateVal');
  const shadowPauseSelect = document.getElementById('shadowPauseSelect');
  const shadowSentenceRepeatSelect = document.getElementById('shadowSentenceRepeatSelect');
  const shadowLoopSelect = document.getElementById('shadowLoopSelect');
  const shadowMaxTimeSelect = document.getElementById('shadowMaxTimeSelect');
  const shadowMaxTimerCountdown = document.getElementById('shadowMaxTimerCountdown');

  const btnShadowListenAll = document.getElementById('btnShadowListenAll');
  const btnShadowPlayAll = document.getElementById('btnShadowPlayAll');
  const btnShadowPause = document.getElementById('btnShadowPause');
  const btnShadowStop = document.getElementById('btnShadowStop');
  const btnShadowPrev = document.getElementById('btnShadowPrev');
  const btnShadowNext = document.getElementById('btnShadowNext');
  const shadowStatusBanner = document.getElementById('shadowStatusBanner');
  const shadowStatusText = document.getElementById('shadowStatusText');
  const shadowWaitBarWrap = document.getElementById('shadowWaitBarWrap');
  const shadowWaitBarFill = document.getElementById('shadowWaitBarFill');
  const shadowSentenceList = document.getElementById('shadowSentenceList');

  const shadowRecStatsBadge = document.getElementById('shadowRecStatsBadge');
  const btnShadowRecToggle = document.getElementById('btnShadowRecToggle');
  const shadowRecClock = document.getElementById('shadowRecClock');
  const btnShadowRecPlay = document.getElementById('btnShadowRecPlay');
  const btnShadowRecDownload = document.getElementById('btnShadowRecDownload');

  // =========================================================================
  // 1-B. 상태 머신 (State Machine) 및 SVG 타이머 초기화 (TDZ 방지 최상단 배치)
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
    transcripts: {},
    transcriptLangs: {},
    speechRecognizer: null,
    isSttActive: false,
    hasSttHardwareCollision: false,
    questionSpentMs: {},
    speakingStartTime: null,
    isStoppedEarly: false,
    singleRetryIndex: null,
    activeDeckId: 'tour',
    customDecks: [],
    tourContent: '',
    autoTargetLang: 'en',
    autoVoicePreferences: { ko: '', en: '', zh: '', ja: '', fr: '', es: '', de: '', ru: '', it: '', vi: '' }
  };

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
    let soundEnabled = true;
    let savedSoundType = 'triple';
    let savedSoundDuration = 'normal';
    if (soundToggle) {
      soundEnabled = soundToggle.checked;
      if (soundTypeSelect) savedSoundType = soundTypeSelect.value;
      if (soundDurationSelect) savedSoundDuration = soundDurationSelect.value;
    } else {
      try {
        const raw = localStorage.getItem('wanzi_speaking_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.sound !== undefined) soundEnabled = Boolean(parsed.sound);
          if (parsed && parsed.soundType) savedSoundType = parsed.soundType;
          if (parsed && parsed.soundDuration) savedSoundDuration = parsed.soundDuration;
        }
      } catch (e) {}
    }
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'finish') {
        const soundType = savedSoundType;
        const durationSetting = savedSoundDuration;
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
    'en-CA': '🇨🇦 영어 (캐나다)',
    'en-IN': '🇮🇳 영어 (인도)',
    'ko': '🇰🇷 한국어',
    'ko-KR': '🇰🇷 한국어',
    'zh': '🇨🇳 중국어',
    'zh-CN': '🇨🇳 중국어 (보통화)',
    'zh-TW': '🇹🇼 중국어 (대만)',
    'zh-HK': '🇭🇰 중국어 (홍콩/광둥어)',
    'ja': '🇯🇵 일본어',
    'ja-JP': '🇯🇵 일본어',
    'es': '🇪🇸 스페인어',
    'es-ES': '🇪🇸 스페인어 (스페인)',
    'es-MX': '🇲🇽 스페인어 (멕시코)',
    'fr': '🇫🇷 프랑스어',
    'fr-FR': '🇫🇷 프랑스어 (프랑스)',
    'fr-CA': '🇨🇦 프랑스어 (캐나다)',
    'de': '🇩🇪 독일어',
    'de-DE': '🇩🇪 독일어',
    'nl': '🇳🇱 네덜란드어',
    'nl-NL': '🇳🇱 네덜란드어 (네덜란드)',
    'nl-BE': '🇧🇪 네덜란드어 (벨기에)',
    'it': '🇮🇹 이탈리아어',
    'it-IT': '🇮🇹 이탈리아어',
    'pt': '🇵🇹/🇧🇷 포투갈어',
    'pt-BR': '🇧🇷 포르투갈어 (브라질)',
    'pt-PT': '🇵🇹 포르투갈어 (포르투갈)',
    'ru': '🇷🇺 러시아어',
    'ru-RU': '🇷🇺 러시아어',
    'vi': '🇻🇳 베트남어',
    'vi-VN': '🇻🇳 베트남어',
    'th': '🇹🇭 태국어',
    'th-TH': '🇹🇭 태국어',
    'id': '🇮🇩 인도네시아어',
    'id-ID': '🇮🇩 인도네시아어',
    'ms': '🇲🇾 말레이어',
    'ms-MY': '🇲🇾 말레이어',
    'ar': '🇸🇦 아랍어',
    'ar-SA': '🇸🇦 아랍어',
    'hi': '🇮🇳 힌디어',
    'hi-IN': '🇮🇳 힌디어',
    'tr': '🇹🇷 튀르키예어',
    'tr-TR': '🇹🇷 튀르키예어',
    'pl': '🇵🇱 폴란드어',
    'pl-PL': '🇵🇱 폴란드어',
    'sv': '🇸🇪 스웨덴어',
    'sv-SE': '🇸🇪 스웨덴어',
    'da': '🇩🇰 덴마크어',
    'da-DK': '🇩🇰 덴마크어',
    'no': '🇳🇴 노르웨이어',
    'nb-NO': '🇳🇴 노르웨이어',
    'fi': '🇫🇮 핀란드어',
    'fi-FI': '🇫🇮 핀란드어',
    'cs': '🇨🇿 체코어',
    'cs-CZ': '🇨🇿 체코어',
    'el': '🇬🇷 그리스어',
    'el-GR': '🇬🇷 그리스어',
    'he': '🇮🇱 히브리어',
    'he-IL': '🇮🇱 히브리어',
    'hu': '🇭🇺 헝가리어',
    'hu-HU': '🇭🇺 헝가리어',
    'ro': '🇷🇴 루마니아어',
    'ro-RO': '🇷🇴 루마니아어',
    'uk': '🇺🇦 우크라이나어',
    'uk-UA': '🇺🇦 우크라이나어'
  };

  function getLangLabel(lang) {
    if (!lang) return '기타';
    const normalized = lang.replace(/_/g, '-');
    if (LANG_LABELS[normalized]) return LANG_LABELS[normalized];
    const prefix = normalized.slice(0, 2).toLowerCase();
    return LANG_LABELS[prefix] || normalized;
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
    const priorityPrefixes = ['ko', 'en', 'zh', 'ja', 'es', 'fr', 'de', 'nl', 'pt', 'it', 'ru', 'vi', 'th', 'id'];
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
      keywords: ['자동', 'auto', '감지', '한국어', '중국어', '영어', '일본어', '프랑스어', '스페인어', '독일어', '네덜란드어', 'korean', 'chinese', 'english', 'dutch', 'french', '혼합', '스마트', '1:1']
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
      ? `<div class="lang-alias" style="margin-top: 3px; font-size: 0.74rem; color: #15803d; font-weight: 500;">호환: 🇰🇷 한국어 + 모든 외국어 (🇺🇸·🇨🇳·🇯🇵·🇫🇷·🇪🇸·🇩🇪·🇳🇱 등) 1:1 매칭</div>`
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

    // 1) 최상단 기본 옵션: 언어 자동 감지 & 혼합 낭독 (모국어 + 외국어 1:1)
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

  const PREFERRED_DIALECTS = {
    en: ['en-us', 'en-gb', 'en-ca', 'en-au', 'en'],
    zh: ['zh-cn', 'zh-sg', 'zh-tw', 'zh-hk', 'zh'],
    ko: ['ko-kr', 'ko'],
    ja: ['ja-jp', 'ja'],
    fr: ['fr-fr', 'fr-ca', 'fr-ch', 'fr'],
    es: ['es-es', 'es-mx', 'es-us', 'es'],
    de: ['de-de', 'de-at', 'de-ch', 'de'],
    nl: ['nl-nl', 'nl-be', 'nl'],
    pt: ['pt-br', 'pt-pt', 'pt'],
    ru: ['ru-ru', 'ru'],
    it: ['it-it', 'it'],
    vi: ['vi-vn', 'vi'],
    th: ['th-th', 'th'],
    id: ['id-id', 'id'],
    ms: ['ms-my', 'ms'],
    ar: ['ar-sa', 'ar-eg', 'ar'],
    hi: ['hi-in', 'hi'],
    tr: ['tr-tr', 'tr'],
    pl: ['pl-pl', 'pl'],
    sv: ['sv-se', 'sv']
  };

  const LANG_KEYWORDS = {
    zh: ['chinese', 'china', 'mandarin', 'xiaoxiao', 'yunxi', 'yunjian', 'yaoyao', 'huihui', 'kangkang', 'zhiwei', 'hanhan'],
    ko: ['korean', 'korea', 'sunhi', 'injoon', 'heami', 'yuna'],
    en: ['united states', 'david', 'zira', 'mark', 'jenny', 'guy', 'aria', 'english'],
    ja: ['japanese', 'japan', 'haruka', 'ayumi', 'ichiro', 'sayaka', 'nanami', 'keita', 'kyoko', 'otoya'],
    fr: ['french', 'france', 'hortense', 'paul', 'julie', 'denise', 'henri', 'thomas', 'amelie'],
    es: ['spanish', 'spain', 'helena', 'laura', 'pablo', 'sabina', 'raul', 'elvira', 'alvaro', 'monica', 'paulina'],
    de: ['german', 'germany', 'hedda', 'katja', 'stefan', 'conrad', 'anna'],
    nl: ['dutch', 'netherlands', 'nederlands', 'colette', 'fenna', 'maarten', 'frank', 'xander', 'ellen'],
    pt: ['portuguese', 'brazil', 'portugal', 'maria', 'daniel', 'francisca', 'antonio', 'luciana', 'joana'],
    ru: ['russian', 'russia', 'irina', 'pavel', 'svetlana', 'dmitry', 'milena'],
    it: ['italian', 'italy', 'elsa', 'cosimo', 'isabella', 'diego', 'alice'],
    vi: ['vietnamese', 'vietnam', 'an', 'hoaimy', 'namminh', 'linh'],
    th: ['thai', 'thailand', 'pattara', 'premwadee', 'niwat', 'kanya'],
    id: ['indonesian', 'indonesia', 'andika', 'gadis', 'ardi', 'damayanti'],
    ar: ['arabic', 'hoda', 'naayf', 'zariyah', 'hamdan', 'maged'],
    hi: ['hindi', 'india', 'kalpana', 'hemant', 'swara', 'madhur'],
    tr: ['turkish', 'turkey', 'tolga', 'emel', 'ahmet', 'yelda'],
    pl: ['polish', 'poland', 'paulina', 'adam', 'zofia', 'marek'],
    sv: ['swedish', 'sweden', 'hedvig', 'sofie', 'mattias', 'alva']
  };

  const TARGET_LANG_META = {
    ko: { code: 'ko', flag: '🇰🇷', name: '한국어', shortName: '한국어', defaultBcp: 'ko-KR', testPhrase: '안녕하세요! 완쯔 스피킹 한국어 음성입니다.' },
    en: { code: 'en', flag: '🇺🇸', name: '영어 (미국 표준)', shortName: '영어', defaultBcp: 'en-US', testPhrase: 'Hello! This is Wanzi Speaking in English.' },
    zh: { code: 'zh', flag: '🇨🇳', name: '중국어 (보통화)', shortName: '중국어', defaultBcp: 'zh-CN', testPhrase: '你好！这是丸子口语中文语音测试。' },
    ja: { code: 'ja', flag: '🇯🇵', name: '일본어 (한자 통합)', shortName: '일본어', defaultBcp: 'ja-JP', testPhrase: 'こんにちは！ワンズ(丸子)スピーキング日本語音声です。' },
    fr: { code: 'fr', flag: '🇫🇷', name: '프랑스어 (Français)', shortName: '프랑스어', defaultBcp: 'fr-FR', testPhrase: 'Bonjour ! Ceci est le test vocal en français.' },
    es: { code: 'es', flag: '🇪🇸', name: '스페인어 (Español)', shortName: '스페인어', defaultBcp: 'es-ES', testPhrase: '¡Hola! Esta es una prueba de voz en español.' },
    de: { code: 'de', flag: '🇩🇪', name: '독일어 (Deutsch)', shortName: '독일어', defaultBcp: 'de-DE', testPhrase: 'Hallo! Dies ist ein Sprachtest auf Deutsch.' },
    nl: { code: 'nl', flag: '🇳🇱', name: '네덜란드어 (Nederlands)', shortName: '네덜란드어', defaultBcp: 'nl-NL', testPhrase: 'Hallo! Dit is een spraaktest in het Nederlands.' },
    pt: { code: 'pt', flag: '🇧🇷', name: '포르투갈어 (Português)', shortName: '포르투갈어', defaultBcp: 'pt-BR', testPhrase: 'Olá! Este é um teste de voz em português.' },
    ru: { code: 'ru', flag: '🇷🇺', name: '러시아어 (Русский)', shortName: '러시아어', defaultBcp: 'ru-RU', testPhrase: 'Привет! Это проверка голоса на русском языке.' },
    it: { code: 'it', flag: '🇮🇹', name: '이탈리아어 (Italiano)', shortName: '이탈리아어', defaultBcp: 'it-IT', testPhrase: 'Ciao! Questo è un test vocale in italiano.' },
    vi: { code: 'vi', flag: '🇻🇳', name: '베트남어 (Tiếng Việt)', shortName: '베트남어', defaultBcp: 'vi-VN', testPhrase: 'Xin chào! Đây là bài kiểm tra giọng nói tiếng Việt.' },
    th: { code: 'th', flag: '🇹🇭', name: '태국어 (ไทย)', shortName: '태국어', defaultBcp: 'th-TH', testPhrase: 'สวัสดี! นี่คือการทดสอบเสียงภาษาไทย' },
    id: { code: 'id', flag: '🇮🇩', name: '인도네시아어 (Indonesia)', shortName: '인도네시아어', defaultBcp: 'id-ID', testPhrase: 'Halo! Ini adalah tes suara bahasa Indonesia.' },
    ar: { code: 'ar', flag: '🇸🇦', name: '아랍어 (العربية)', shortName: '아랍어', defaultBcp: 'ar-SA', testPhrase: 'مرحباً! هذا اختبار صوتي باللغة العربية.' },
    hi: { code: 'hi', flag: '🇮🇳', name: '힌디어 (हिन्दी)', shortName: '힌디어', defaultBcp: 'hi-IN', testPhrase: 'नमस्ते! यह हिंदी आवाज परीक्षण है।' },
    tr: { code: 'tr', flag: '🇹🇷', name: '튀르키예어 (Türkçe)', shortName: '튀르키예어', defaultBcp: 'tr-TR', testPhrase: 'Merhaba! Bu Türkçe ses testidir.' },
    pl: { code: 'pl', flag: '🇵🇱', name: '폴란드어 (Polski)', shortName: '폴란드어', defaultBcp: 'pl-PL', testPhrase: 'Cześć! To jest test głosu w języku polskim.' },
    sv: { code: 'sv', flag: '🇸🇪', name: '스웨덴어 (Svenska)', shortName: '스웨덴어', defaultBcp: 'sv-SE', testPhrase: 'Hej! Det här är ett rösttest på svenska.' },
    da: { code: 'da', flag: '🇩🇰', name: '덴마크어 (Dansk)', shortName: '덴마크어', defaultBcp: 'da-DK', testPhrase: 'Hej! Dette er en stemmetest på dansk.' },
    no: { code: 'no', flag: '🇳🇴', name: '노르웨이어 (Norsk)', shortName: '노르웨이어', defaultBcp: 'nb-NO', testPhrase: 'Hei! Dette er en stemmetest på norsk.' },
    fi: { code: 'fi', flag: '🇫🇮', name: '핀란드어 (Suomi)', shortName: '핀란드어', defaultBcp: 'fi-FI', testPhrase: 'Hei! Tämä on äänitesti suomeksi.' },
    cs: { code: 'cs', flag: '🇨🇿', name: '체코어 (Čeština)', shortName: '체코어', defaultBcp: 'cs-CZ', testPhrase: 'Ahoj! Toto je hlasový test v češtině.' },
    el: { code: 'el', flag: '🇬🇷', name: '그리스어 (Ελληνικά)', shortName: '그리스어', defaultBcp: 'el-GR', testPhrase: 'Γεια σας! Αυτή είναι μια δοκιμή φωνής στα ελληνικά.' },
    he: { code: 'he', flag: '🇮🇱', name: '히브리어 (עברית)', shortName: '히브리어', defaultBcp: 'he-IL', testPhrase: 'שלום! זוהי בדיקת קול בעברית.' },
    hu: { code: 'hu', flag: '🇭🇺', name: '헝가리어 (Magyar)', shortName: '헝가리어', defaultBcp: 'hu-HU', testPhrase: 'Szia! Ez egy magyar nyelvű hangteszt.' },
    ro: { code: 'ro', flag: '🇷🇴', name: '루마니아어 (Română)', shortName: '루마니아어', defaultBcp: 'ro-RO', testPhrase: 'Salut! Acesta este un test de voce în limba română.' },
    uk: { code: 'uk', flag: '🇺🇦', name: '우크라이나어 (Українська)', shortName: '우크라이나어', defaultBcp: 'uk-UA', testPhrase: 'Привіт! Це тест голосу українською мовою.' }
  };

  function getLangMeta(langCode) {
    const code = (langCode || 'en').toLowerCase().slice(0, 2);
    if (TARGET_LANG_META[code]) return TARGET_LANG_META[code];
    return TARGET_LANG_META.en;
  }

  function getAvailableTargetOptions() {
    // PC와 모바일 어디서나 동일하게 검증된 핵심 외국어 목록만 깔끔하게 제공 (모바일 OS의 cy, as, bg, bn 등 미검증 코드 유입 차단)
    const curatedCodes = [
      'en', 'zh', 'ja', 'fr', 'es', 'de', 'nl', 'pt', 'ru', 'it',
      'vi', 'th', 'id', 'ar', 'hi', 'tr', 'pl', 'sv', 'da', 'no',
      'fi', 'cs', 'el', 'he', 'hu', 'ro', 'uk'
    ];

    const options = curatedCodes.map(code => {
      const meta = TARGET_LANG_META[code];
      return { value: code, label: `${meta.flag} ${meta.name}` };
    });

    options.push({ value: 'all', label: '🌐 한·영·중·일 4개국어 동시' });
    return options;
  }

  function getVoicesForLangPrefix(prefix) {
    if (!availableVoices || availableVoices.length === 0) return [];
    const p = (prefix || '').toLowerCase();
    const dialectOrder = PREFERRED_DIALECTS[p] || [p];
    const keywords = LANG_KEYWORDS[p] || [];

    const matched = availableVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace(/_/g, '-');
      if (vLang === p || vLang.startsWith(p + '-')) return true;
      const vName = (v.name || '').toLowerCase();
      if (keywords.some(k => vName.includes(k))) return true;
      return false;
    });

    matched.sort((a, b) => {
      const aLang = (a.lang || '').toLowerCase().replace(/_/g, '-');
      const bLang = (b.lang || '').toLowerCase().replace(/_/g, '-');

      let aIdx = dialectOrder.findIndex(d => aLang === d || aLang.startsWith(d));
      let bIdx = dialectOrder.findIndex(d => bLang === d || bLang.startsWith(d));
      if (aIdx === -1) aIdx = 999;
      if (bIdx === -1) bIdx = 999;

      if (aIdx !== bIdx) return aIdx - bIdx;
      return (a.name || '').localeCompare(b.name || '');
    });

    return matched;
  }

  function formatVoiceOptionLabel(v) {
    if (!v) return '';
    const vLang = (v.lang || '').replace(/_/g, '-');
    const region = getLangLabel(vLang);
    return `${region} · ${v.name}${v.default ? ' (기본)' : ''}`;
  }

  function previewLanguageVoice(langCode) {
    if (!('speechSynthesis' in window)) return;
    const meta = getLangMeta(langCode);
    const phrase = meta.testPhrase;
    const voice = getBestVoiceForLang(langCode);
    const rate = parseFloat(ttsRateSlider ? ttsRateSlider.value : '1.0') || 1.0;

    stopSpeaking();
    isSpeakingCanceled = false;

    const utterance = new SpeechSynthesisUtterance(phrase);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || meta.defaultBcp;
    } else {
      utterance.lang = meta.defaultBcp;
    }
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }

  function getBestVoiceForLang(lang) {
    if (!availableVoices || availableVoices.length === 0) return null;
    const prefix = (lang || 'ko').toLowerCase();

    // 0) 사용자가 언어별 세부 지정한 음성이 있는 경우 최우선
    if (typeof state !== 'undefined' && state && state.autoVoicePreferences && state.autoVoicePreferences[prefix]) {
      const prefVoice = availableVoices.find(v => v.name === state.autoVoicePreferences[prefix]);
      if (prefVoice) return prefVoice;
    }

    // 1) 해당 언어의 후보군 중 우선 방언 순(en-US > en-GB > en-CA > en-AU 등) 정렬된 최우선 음성 선택
    const list = getVoicesForLangPrefix(prefix);
    if (list.length > 0) return list[0];

    // 2) 느슨한 일치
    const loose = availableVoices.find(v => (v.lang || '').toLowerCase().startsWith(prefix));
    if (loose) return loose;

    return null;
  }

  function updateVoiceStatusBadge() {
    if (!voiceStatusBadge) return;
    const selected = voiceSelect ? voiceSelect.value : 'auto';
    if (selected === 'auto') {
      const targetLang = (typeof state !== 'undefined' && state && state.autoTargetLang) ? state.autoTargetLang : 'en';
      const activeLangCodes = targetLang === 'all'
        ? ['ko', 'en', 'zh', 'ja']
        : ['ko', targetLang];

      const supportedLangs = activeLangCodes.map(code => {
        const meta = getLangMeta(code);
        return { code: meta.code, flag: meta.flag, name: meta.name, shortName: meta.shortName || meta.name };
      });

      // 기존 고급 설정 펼침 상태 보존
      const wasOpen = Boolean(voiceStatusBadge.querySelector('.compat-advanced-details[open]'));

      // 0) 모국어(한국어) + 외국어 1:1 매칭 선택 옵션 (네덜란드어 포함 + 기기에 설치된 모든 언어 자동 포함)
      const targetSelectOptions = getAvailableTargetOptions()
        .map(opt => `<option value="${opt.value}" ${targetLang === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
        .join('');

      // 1) 기본 요약 칩 (한눈에 현재 매칭된 음성 표시 - 2열 균등 그리드)
      const chipsHtml = supportedLangs.map(lang => {
        const best = getBestVoiceForLang(lang.code);
        const voiceLabel = best ? escapeHtml(best.name) : (t('speaking.step2.compatNoVoice') || '기본 엔진');
        const isMatched = Boolean(best);
        return `<span class="compat-chip ${isMatched ? '' : 'missing'}" title="${lang.name}: ${voiceLabel}">
          <span class="compat-chip-lang">${lang.flag} ${escapeHtml(lang.shortName)}</span>
          <span class="chip-voice-name">${voiceLabel}</span>
        </span>`;
      }).join('');

      // 2) 고급 설정 내 언어별 세부 선택 카드 (한 줄 타이틀 + 하단 select 수평 일직선 정렬)
      const cardsHtml = supportedLangs.map(lang => {
        const voices = getVoicesForLangPrefix(lang.code);
        const currentBest = getBestVoiceForLang(lang.code);
        const userChoice = (typeof state !== 'undefined' && state && state.autoVoicePreferences && state.autoVoicePreferences[lang.code]) || '';

        let selectOptionsHtml = '';
        if (voices.length === 0) {
          selectOptionsHtml = `<option value="">⚠️ ${t('speaking.step2.compatNoVoice') || '시스템 기본 엔진 (음성 팩 미설치)'}</option>`;
        } else {
          const bestLabel = currentBest ? `(${escapeHtml(currentBest.name)})` : '';
          selectOptionsHtml += `<option value="">${t('speaking.step2.compatAutoRecommend') || '⭐ 표준 자동 추천'} ${bestLabel}</option>`;
          voices.forEach(v => {
            const isSelected = (userChoice === v.name);
            selectOptionsHtml += `<option value="${escapeHtml(v.name)}" ${isSelected ? 'selected' : ''}>${escapeHtml(formatVoiceOptionLabel(v))}</option>`;
          });
        }

        const isMissing = (voices.length === 0);

        return `
          <div class="compat-lang-card ${isMissing ? 'missing' : ''}">
            <div class="compat-lang-title" title="${escapeHtml(lang.name)}">
              <span class="compat-lang-name">${lang.flag} ${escapeHtml(lang.shortName)}</span>
              <button type="button" class="compat-preview-btn" data-lang="${lang.code}" title="${t('speaking.step2.previewVoice') || '미리듣기'}">
                🔊 ${t('speaking.step2.previewVoice') || '미리듣기'}
              </button>
            </div>
            <select class="compat-voice-select" data-lang="${lang.code}" ${isMissing ? 'disabled' : ''}>
              ${selectOptionsHtml}
            </select>
          </div>
        `;
      }).join('');

      const targetMeta = getLangMeta(targetLang);
      const pairDescText = targetLang === 'all'
        ? '한국어·영어·중국어·일본어가 섞인 문제도 실시간으로 구분하여 각 언어 전용 음성으로 순차 낭독합니다.'
        : targetLang === 'ja'
          ? '한글은 한국어 음성으로, 히라가나·가타카나 및 한자(漢字)는 모두 일본어 음성으로 끊김 없이 자연스럽게 낭독합니다.'
          : `질문 목록에 한국어와 ${targetMeta.shortName || '외국어'}가 함께 있거나 한 문장에 섞여 있어도 자동 구분하여 각각의 원어민 음성으로 낭독합니다.`;

      voiceStatusBadge.className = 'voice-status-box';
      voiceStatusBadge.innerHTML = `
        <div class="compat-header">
          <span class="compat-header-title">🌐 언어 자동 감지 (모국어 + 외국어 1:1)</span>
          <span class="compat-badge-pill">${targetLang === 'all' ? '4개국어 다중' : '1:1 정밀 매칭'}</span>
        </div>
        <div class="compat-pair-selector-row">
          <div class="pair-lang-fixed">
            <span class="pair-role-badge">모국어</span>
            <span>🇰🇷 한국어</span>
          </div>
          <span class="pair-plus-icon">+</span>
          <div class="pair-lang-target">
            <span class="pair-role-badge target">외국어</span>
            <select id="autoTargetLangSelect" class="pair-target-select" aria-label="매칭할 외국어 선택">
              ${targetSelectOptions}
            </select>
          </div>
        </div>
        <div class="compat-chips-grid">
          ${chipsHtml}
        </div>
        <details class="compat-advanced-details" ${wasOpen ? 'open' : ''}>
          <summary class="compat-advanced-summary">
            <span>⚙️ ${t('speaking.step2.compatAdvancedTitle') || '고급 설정: 언어별 음성 세부 지정'}</span>
            <span class="advanced-arrow">▼</span>
          </summary>
          <div class="compat-advanced-body">
            <div class="compat-langs-grid">
              ${cardsHtml}
            </div>
            <div class="compat-desc">${pairDescText}</div>
          </div>
        </details>
      `;

      const targetSelectEl = voiceStatusBadge.querySelector('#autoTargetLangSelect');
      if (targetSelectEl) {
        targetSelectEl.addEventListener('change', () => {
          const prevSample = getDefaultShadowSample(state.autoTargetLang);
          state.autoTargetLang = targetSelectEl.value || 'en';
          if (state.autoTargetLang !== 'all') {
            try {
              localStorage.setItem('swz_last_language', state.autoTargetLang);
            } catch (e) {}
          }
          if (shadowScriptInput) {
            const curVal = shadowScriptInput.value.trim();
            if (!curVal || curVal === prevSample.trim()) {
              const nextSample = getDefaultShadowSample(state.autoTargetLang);
              shadowScriptInput.value = nextSample;
              shadowState.sampleContent = nextSample;
            }
          }
          saveSettings();
          updateVoiceStatusBadge();
          if (shadowScriptInput) {
            updateShadowStatsAndCards();
            renderShadowDeckTabs();
          }
          if (state.autoTargetLang !== 'all') {
            previewLanguageVoice(state.autoTargetLang);
          }
        });
      }

      voiceStatusBadge.querySelectorAll('.compat-voice-select').forEach(sel => {
        sel.addEventListener('change', () => {
          const l = sel.getAttribute('data-lang');
          if (!state.autoVoicePreferences) state.autoVoicePreferences = {};
          state.autoVoicePreferences[l] = sel.value;
          saveSettings();
          updateVoiceStatusBadge();
          previewLanguageVoice(l);
        });
      });

      voiceStatusBadge.querySelectorAll('.compat-preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const l = btn.getAttribute('data-lang');
          previewLanguageVoice(l);
        });
      });
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
    if (typeof syncShadowVoiceUI === 'function') {
      syncShadowVoiceUI();
    }
  }

  // 문장을 언어별 세그먼트로 지능적 분리 (모국어 한국어 + 선택한 모든 외국어 1:1 매칭 및 다국어 혼합 완벽 지원)
  function segmentMixedText(text) {
    if (!text) return [];
    const targetLang = (typeof state !== 'undefined' && state && state.autoTargetLang) ? state.autoTargetLang : 'en';

    const isHangul = ch => /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(ch);
    const isKana = ch => /[\u3040-\u309F\u30A0-\u30FF]/.test(ch);
    // 한자 범위 (CJK Unified Ideographs + 확장)
    const isHanzi = ch => /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(ch);
    // 기본 알파벳 + 유럽어/베트남어 악센트 확장 라틴 문자 모두 포함
    const isLatin = ch => /[a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u1E00-\u1EFF]/.test(ch);
    // 러시아어/우크라이나어 등 키릴 문자
    const isCyrillic = ch => /[\u0400-\u04FF]/.test(ch);
    // 태국어, 아랍어, 데바나가리(힌디어), 그리스어, 히브리어 등 비한글 외국 문자
    const isOtherForeignLetter = ch => /[\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F]/.test(ch);

    const segments = [];
    let currentText = '';
    let currentLang = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let chLang = '';
      if (isHangul(ch)) {
        chLang = 'ko';
      } else if (targetLang !== 'all') {
        // 1:1 매칭 모드: 한글이 아닌 외국어 문자는 선택된 targetLang으로 매칭!
        if (targetLang === 'ja' && (isKana(ch) || isHanzi(ch))) {
          chLang = 'ja';
        } else if (isKana(ch)) {
          chLang = (targetLang === 'ja') ? 'ja' : 'ja';
        } else if (isHanzi(ch)) {
          chLang = (targetLang === 'ja') ? 'ja' : 'zh';
        } else if (isLatin(ch) || isCyrillic(ch) || isOtherForeignLetter(ch)) {
          chLang = targetLang;
        } else {
          chLang = 'neutral';
        }
      } else {
        // 'all' (한·영·중·일 4개국어 동시 감지 모드)
        if (isKana(ch)) chLang = 'ja';
        else if (isHanzi(ch)) chLang = 'zh';
        else if (isCyrillic(ch)) chLang = 'ru';
        else if (isLatin(ch)) chLang = 'en';
        else chLang = 'neutral';
      }

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
      const fallbackLang = (targetLang && targetLang !== 'all') ? targetLang : 'ko';
      segments.push({ text: currentText.trim(), lang: currentLang || fallbackLang });
    }
    return segments;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    [50, 250, 600, 1500, 3000].forEach(delay => setTimeout(loadVoices, delay));
  }

  let isSpeakingCanceled = false;
  let activeUtterances = [];
  let ttsHeartbeatInterval = null;

  function clearTtsTimers() {
    if (ttsHeartbeatInterval) {
      clearInterval(ttsHeartbeatInterval);
      ttsHeartbeatInterval = null;
    }
  }

  function startTtsHeartbeat() {
    if (!ttsHeartbeatInterval && 'speechSynthesis' in window) {
      ttsHeartbeatInterval = setInterval(() => {
        if (window.speechSynthesis) {
          // Chrome 15s freeze bug workaround:
          // activeUtterances retains utterance objects in memory to prevent GC.
          // Resume if the browser or OS backgrounding unexpectedly paused synthesis.
          if (window.speechSynthesis.paused) {
            try { window.speechSynthesis.resume(); } catch (e) {}
          }
        }
      }, 4000);
    }
  }

  function stopSpeaking() {
    isSpeakingCanceled = true;
    clearTtsTimers();
    activeUtterances = [];
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    }
  }

  // iOS Safari audio pipeline & speech synthesis unlock helper
  function unlockAudioAndTtsForIOS() {
    getAudioContext();
    if ('speechSynthesis' in window) {
      try {
        const dummy = new SpeechSynthesisUtterance('');
        dummy.volume = 0;
        dummy.rate = 2.0;
        window.speechSynthesis.speak(dummy);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}
    }
  }

  function speakText(text, onEnd, customRate) {
    if (!('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }

    const wasSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused;
    stopSpeaking();
    isSpeakingCanceled = false;

    const executeSpeak = () => {
      if (isSpeakingCanceled) return;
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }

      const selectedVoiceName = voiceSelect ? voiceSelect.value : 'auto';
      const rate = parseFloat(customRate !== undefined ? customRate : (ttsRateSlider ? ttsRateSlider.value : '1.0')) || 1.0;

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

        activeUtterances.push(utterance);
        startTtsHeartbeat();

        let hasEnded = false;
        let watchdogTimer = null;
        const finish = () => {
          if (!hasEnded && !isSpeakingCanceled) {
            hasEnded = true;
            if (watchdogTimer) {
              clearTimeout(watchdogTimer);
              watchdogTimer = null;
            }
            const uIdx = activeUtterances.indexOf(utterance);
            if (uIdx !== -1) activeUtterances.splice(uIdx, 1);
            if (activeUtterances.length === 0) clearTtsTimers();
            if (onEnd) onEnd();
          }
        };
        utterance.onend = finish;
        utterance.onerror = (e) => {
          if (isSpeakingCanceled) return;
          console.warn('TTS utterance error:', e);
          finish();
        };

        // 크롬 GC 및 15초 멈춤 버그 방지용 안전 와치독 타임아웃
        const estSec = Math.max(12, ((text || '').length / Math.max(0.5, rate)) * 0.45 + 10);
        watchdogTimer = setTimeout(() => {
          if (!hasEnded && !isSpeakingCanceled) {
            console.warn('TTS safety watchdog timeout triggered');
            try { window.speechSynthesis.cancel(); } catch (err) {}
            finish();
          }
        }, estSec * 1000);

        window.speechSynthesis.speak(utterance);
        return;
      }

      // 2) 'auto' 모드: 모국어(한국어) + 외국어 문장 속 언어를 실시간 인식하여 각각의 원어민 전용 음성으로 순차 전환 낭독
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
        if (window.speechSynthesis.paused) {
          try { window.speechSynthesis.resume(); } catch (e) {}
        }

        const seg = segments[currentSegIdx];
        currentSegIdx++;

        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.rate = rate;
        utterance.pitch = 1.0;

        const meta = getLangMeta(seg.lang);
        utterance.lang = meta.defaultBcp || 'ko-KR';

        const voice = getBestVoiceForLang(seg.lang);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || utterance.lang;
        }

        activeUtterances.push(utterance);
        startTtsHeartbeat();

        let segEnded = false;
        let segWatchdog = null;
        const handleDone = () => {
          if (!segEnded && !isSpeakingCanceled) {
            segEnded = true;
            if (segWatchdog) {
              clearTimeout(segWatchdog);
              segWatchdog = null;
            }
            const uIdx = activeUtterances.indexOf(utterance);
            if (uIdx !== -1) activeUtterances.splice(uIdx, 1);
            if (activeUtterances.length === 0) clearTtsTimers();
            setTimeout(playNextSegment, 70);
          }
        };

        utterance.onend = handleDone;
        utterance.onerror = (e) => {
          if (isSpeakingCanceled) return;
          console.warn('TTS segment error:', e);
          handleDone();
        };

        const segEstSec = Math.max(8, ((seg.text || '').length / Math.max(0.5, rate)) * 0.45 + 8);
        segWatchdog = setTimeout(() => {
          if (!segEnded && !isSpeakingCanceled) {
            console.warn('TTS segment watchdog timeout triggered');
            try { window.speechSynthesis.cancel(); } catch (err) {}
            handleDone();
          }
        }, segEstSec * 1000);

        window.speechSynthesis.speak(utterance);
      }

      playNextSegment();
    };

    if (wasSpeaking) {
      setTimeout(executeSpeak, 25);
    } else {
      executeSpeak();
    }
  }

  // =========================================================================
  // 8. 문제 세트 목록(덱) 탭 관리 및 전환
  // =========================================================================
  function getActiveDeckContent() {
    if (state.activeDeckId === 'tour') {
      return (state.tourContent !== undefined && state.tourContent !== '')
        ? state.tourContent
        : SAMPLES.tour.join('\n');
    }
    const deck = state.customDecks.find(d => d.id === state.activeDeckId);
    return deck ? (deck.content || '') : '';
  }

  function saveActiveDeckContent(content) {
    if (state.activeDeckId === 'tour') {
      state.tourContent = content;
    } else {
      const deck = state.customDecks.find(d => d.id === state.activeDeckId);
      if (deck) {
        deck.content = content;
      }
    }
  }

  function renderDeckTabs() {
    if (!deckTabsList) return;
    deckTabsList.innerHTML = '';

    // 1. 관광통역안내사 샘플 탭 (고정 기본 탭)
    const tourContent = (state.tourContent !== undefined && state.tourContent !== '')
      ? state.tourContent
      : SAMPLES.tour.join('\n');
    const tourQuestions = parseExcelQuestions(tourContent, cleanNumberingCheck ? cleanNumberingCheck.checked : true);

    const tourTab = document.createElement('button');
    tourTab.type = 'button';
    tourTab.className = `deck-tab ${state.activeDeckId === 'tour' ? 'active' : ''}`;
    tourTab.innerHTML = `
      <span class="deck-tab-name">${escapeHtml(t('speaking.step1.sampleTour'))}</span>
      <span class="deck-tab-count">${tourQuestions.length}</span>
    `;
    tourTab.addEventListener('click', () => {
      switchDeck('tour');
    });
    deckTabsList.appendChild(tourTab);

    // 2. 사용자 추가 목록 탭들
    state.customDecks.forEach(deck => {
      const questions = parseExcelQuestions(deck.content || '', cleanNumberingCheck ? cleanNumberingCheck.checked : true);
      const tab = document.createElement('div');
      tab.className = `deck-tab ${state.activeDeckId === deck.id ? 'active' : ''}`;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'deck-tab-name';
      nameSpan.textContent = deck.name || t('speaking.step1.newListDefaultName');
      nameSpan.title = `${deck.name || ''} (더블클릭하여 이름 수정)`;

      const countSpan = document.createElement('span');
      countSpan.className = 'deck-tab-count';
      countSpan.textContent = questions.length;

      const renameBtn = document.createElement('button');
      renameBtn.type = 'button';
      renameBtn.className = 'deck-tab-rename';
      renameBtn.innerHTML = '✏️';
      renameBtn.title = t('speaking.step1.renameList');
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renameDeck(deck.id);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'deck-tab-del';
      delBtn.innerHTML = '&times;';
      delBtn.title = '목록 삭제';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteDeck(deck.id);
      });

      tab.append(nameSpan, countSpan, renameBtn, delBtn);
      tab.addEventListener('click', () => {
        switchDeck(deck.id);
      });
      tab.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        renameDeck(deck.id);
      });
      deckTabsList.appendChild(tab);
    });
  }

  function switchDeck(deckId) {
    if (state.activeDeckId === deckId) return;
    saveActiveDeckContent(questionInput.value);
    revokeAllRecordings();
    state.activeDeckId = deckId;
    questionInput.value = getActiveDeckContent();
    updateParsedStatus();
    saveSettings();
    renderDeckTabs();
  }

  function createDeck() {
    const defaultName = `${t('speaking.step1.newListDefaultName')} ${state.customDecks.length + 1}`;
    const name = prompt(t('speaking.step1.newListPrompt'), defaultName);
    if (!name || !name.trim()) return;

    saveActiveDeckContent(questionInput.value);
    const newId = 'deck_' + Date.now();
    const newDeck = {
      id: newId,
      name: name.trim(),
      content: ''
    };
    state.customDecks.push(newDeck);
    state.activeDeckId = newId;
    questionInput.value = '';
    updateParsedStatus();
    saveSettings();
    renderDeckTabs();
    questionInput.focus();
  }

  function renameDeck(deckId) {
    const deck = state.customDecks.find(d => d.id === deckId);
    if (!deck) return;

    const currentName = deck.name || '';
    const newName = prompt(t('speaking.step1.renameListPrompt'), currentName);
    if (!newName || !newName.trim()) return;

    deck.name = newName.trim();
    saveSettings();
    renderDeckTabs();
  }

  function deleteDeck(deckId) {
    const deck = state.customDecks.find(d => d.id === deckId);
    if (!deck) return;

    const msg = t('speaking.step1.confirmDeleteList', { name: deck.name });
    if (!confirm(msg)) return;

    state.customDecks = state.customDecks.filter(d => d.id !== deckId);

    if (state.activeDeckId === deckId) {
      if (state.customDecks.length > 0) {
        state.activeDeckId = state.customDecks[state.customDecks.length - 1].id;
      } else {
        state.activeDeckId = 'tour';
      }
      questionInput.value = getActiveDeckContent();
      updateParsedStatus();
    }

    saveSettings();
    renderDeckTabs();
  }

  // 프리셋 버튼 활성화 UI 동기화
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
  const SHARED_LANG_KEY = 'swz_last_language';

  // 안키 서식 에디터 / AI 프롬프트 생성기에서 지정한 학습 언어 가져오기 (공식 지원 언어만 연동)
  function getSharedStudyLanguage() {
    try {
      const isSupported = code => Boolean(code && code !== 'ko' && TARGET_LANG_META[code]);
      const shared = localStorage.getItem(SHARED_LANG_KEY);
      if (isSupported(shared)) return shared;

      const editorRaw = localStorage.getItem('anki_card_editor_content') || localStorage.getItem('anki_style_editor_content_v1');
      if (editorRaw) {
        const editorData = JSON.parse(editorRaw);
        const langCandidate = editorData && (editorData.langId || editorData.language);
        if (isSupported(langCandidate)) {
          return langCandidate;
        }
      }

      const promptRaw = localStorage.getItem('anki_prompt_generator_settings') || localStorage.getItem('wanzi_prompt_settings_v2');
      if (promptRaw) {
        const promptData = JSON.parse(promptRaw);
        const langCandidate = promptData && (promptData.langId || promptData.language);
        if (isSupported(langCandidate)) {
          return langCandidate;
        }
      }
    } catch (e) {}
    return null;
  }

  function saveSettings() {
    if (questionInput) {
      saveActiveDeckContent(questionInput.value);
    }
    let prev = {};
    try {
      const rawPrev = localStorage.getItem(STORAGE_KEY);
      if (rawPrev) prev = JSON.parse(rawPrev) || {};
    } catch (e) {}

    const data = Object.assign({}, prev, {
      activeDeckId: state.activeDeckId || prev.activeDeckId || 'tour',
      customDecks: state.customDecks || prev.customDecks || [],
      tourContent: state.tourContent || prev.tourContent || '',
      autoTargetLang: state.autoTargetLang || prev.autoTargetLang || 'en',
      autoVoicePreferences: state.autoVoicePreferences || prev.autoVoicePreferences || { ko: '', en: '', zh: '', ja: '', fr: '', es: '', de: '', ru: '', it: '', vi: '' },
      cleanNumbering: cleanNumberingCheck ? cleanNumberingCheck.checked : (prev.cleanNumbering !== undefined ? prev.cleanNumbering : true),
      answerTime: answerTimeInput ? answerTimeInput.value : (prev.answerTime || '120'),
      breakTime: breakTimeInput ? breakTimeInput.value : (prev.breakTime || '10'),
      maxQuestions: maxQuestionsInput ? maxQuestionsInput.value : (prev.maxQuestions || '5'),
      voice: voiceSelect ? voiceSelect.value : (prev.voice || 'auto'),
      rate: ttsRateSlider ? ttsRateSlider.value : (prev.rate || '1.0'),
      ttsWait: ttsWaitCheck ? ttsWaitCheck.checked : (prev.ttsWait !== undefined ? prev.ttsWait : true),
      recordVoice: recordMyVoiceCheck ? recordMyVoiceCheck.checked : (prev.recordVoice !== undefined ? prev.recordVoice : true),
      hideText: hideTextCheck ? hideTextCheck.checked : (prev.hideText !== undefined ? prev.hideText : false),
      sound: soundToggle ? soundToggle.checked : (prev.sound !== undefined ? prev.sound : true),
      soundType: soundTypeSelect ? soundTypeSelect.value : (prev.soundType || 'triple'),
      soundDuration: soundDurationSelect ? soundDurationSelect.value : (prev.soundDuration || 'normal'),
      sttExtract: sttExtractCheck ? sttExtractCheck.checked : (prev.sttExtract !== undefined ? prev.sttExtract : false),
      sttLang: sttLangSelect ? sttLangSelect.value : (prev.sttLang || 'auto'),
      audioFormat: audioFormatSelect ? audioFormatSelect.value : (prev.audioFormat || 'auto')
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadSettings() {
    try {
      const sharedLang = getSharedStudyLanguage();
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.activeDeckId = 'tour';
        state.customDecks = [];
        state.tourContent = SAMPLES.tour.join('\n');
        state.autoTargetLang = sharedLang || 'en';
        state.autoVoicePreferences = { ko: '', en: '', zh: '', ja: '', fr: '', es: '', de: '', ru: '', it: '', vi: '' };
        savedVoicePreference = 'auto';
        if (voiceSelect) voiceSelect.value = 'auto';
        if (voiceSearchInput) voiceSearchInput.value = getVoiceDisplayName('auto');
        if (questionInput) questionInput.value = state.tourContent;
        if (answerTimeInput) answerTimeInput.value = '120';
        if (breakTimeInput) breakTimeInput.value = '10';
        if (sttExtractCheck && !sttExtractCheck.disabled) sttExtractCheck.checked = false;
        if (sttLangSelect) sttLangSelect.value = 'auto';
        updatePresetPillsActive('answerTimeInput');
        updatePresetPillsActive('breakTimeInput');
        updateVoiceStatusBadge();
        updateParsedStatus();
        renderDeckTabs();
        return;
      }
      const data = JSON.parse(raw);
      state.customDecks = Array.isArray(data.customDecks) ? data.customDecks : [];
      state.tourContent = data.tourContent !== undefined ? data.tourContent : SAMPLES.tour.join('\n');
      state.activeDeckId = data.activeDeckId || 'tour';
      // 안키 에디터나 프롬프트 생성기에서 지정한 언어가 있으면 외국어(1:1 매칭 대상)로 자동 연동
      state.autoTargetLang = sharedLang || data.autoTargetLang || 'en';
      if (data.autoVoicePreferences && typeof data.autoVoicePreferences === 'object') {
        state.autoVoicePreferences = Object.assign({ ko: '', en: '', zh: '', ja: '', fr: '', es: '', de: '', ru: '', it: '', vi: '' }, data.autoVoicePreferences);
      } else {
        state.autoVoicePreferences = { ko: '', en: '', zh: '', ja: '', fr: '', es: '', de: '', ru: '', it: '', vi: '' };
      }

      // 구버전 마이그레이션: data.questions에 저장된 사용자 질문이 있고 customDecks가 비어있던 경우
      if (data.questions !== undefined && state.customDecks.length === 0 && !data.activeDeckId) {
        const isTourSample = (data.questions.trim() === SAMPLES.tour.join('\n').trim());
        if (isTourSample) {
          state.activeDeckId = 'tour';
          state.tourContent = data.questions;
        } else {
          state.customDecks.push({
            id: 'deck_1',
            name: '내 문제 목록',
            content: data.questions
          });
          state.activeDeckId = 'deck_1';
        }
      }

      if (questionInput) questionInput.value = getActiveDeckContent();
      renderDeckTabs();

      if (cleanNumberingCheck && data.cleanNumbering !== undefined) cleanNumberingCheck.checked = data.cleanNumbering;
      if (answerTimeInput) {
        if (!data.answerTime || data.answerTime === '90') {
          answerTimeInput.value = '120';
        } else {
          answerTimeInput.value = data.answerTime;
        }
      }
      if (breakTimeInput && data.breakTime !== undefined) breakTimeInput.value = data.breakTime;
      if (maxQuestionsInput && data.maxQuestions !== undefined) maxQuestionsInput.value = data.maxQuestions;
      if (data.rate !== undefined && ttsRateSlider) {
        ttsRateSlider.value = data.rate;
        if (ttsRateVal) ttsRateVal.textContent = `${parseFloat(data.rate).toFixed(1)}x`;
      }
      if (ttsWaitCheck && data.ttsWait !== undefined) ttsWaitCheck.checked = data.ttsWait;
      if (data.recordVoice !== undefined && recordMyVoiceCheck) {
        recordMyVoiceCheck.checked = data.recordVoice;
      }
      if (data.sttExtract !== undefined && sttExtractCheck && !sttExtractCheck.disabled) {
        sttExtractCheck.checked = data.sttExtract;
      }
      if (data.sttLang && sttLangSelect) {
        sttLangSelect.value = data.sttLang;
      }
      if (data.audioFormat && audioFormatSelect) {
        audioFormatSelect.value = data.audioFormat;
      }
      if (hideTextCheck && data.hideText !== undefined) hideTextCheck.checked = data.hideText;
      if (soundToggle && data.sound !== undefined) soundToggle.checked = data.sound;
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
    if (!questionInput || !parsedStatusBox) return;
    const questions = parseExcelQuestions(questionInput.value, cleanNumberingCheck ? cleanNumberingCheck.checked : true);
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

  // 새 목록 추가 버튼
  if (btnAddNewDeck) {
    btnAddNewDeck.addEventListener('click', createDeck);
  }

  // 본문 붙여넣기 버튼
  if (btnPasteQuestions) {
    btnPasteQuestions.addEventListener('click', async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const clipText = await navigator.clipboard.readText();
          if (!clipText || !clipText.trim()) {
            alert(t('speaking.step1.pasteEmpty'));
            return;
          }
          questionInput.value = clipText;
          saveActiveDeckContent(clipText);
          updateParsedStatus();
          saveSettings();
          renderDeckTabs();
          questionInput.focus();
        } catch (err) {
          console.warn('Clipboard read error:', err);
          alert(t('speaking.step1.pasteError'));
        }
      } else {
        alert(t('speaking.step1.pasteError'));
      }
    });
  }

  // 본문 삭제 버튼
  if (btnClearQuestions) {
    btnClearQuestions.addEventListener('click', () => {
      if (questionInput.value.trim().length > 0) {
        if (confirm(t('speaking.step1.confirmClearText'))) {
          questionInput.value = '';
          saveActiveDeckContent('');
          updateParsedStatus();
          saveSettings();
          renderDeckTabs();
          questionInput.focus();
        }
      } else {
        questionInput.value = '';
        saveActiveDeckContent('');
        updateParsedStatus();
        renderDeckTabs();
      }
    });
  }

  // 문제 목록 JSON 백업 저장 & 불러오기
  if (btnExportDecks) {
    btnExportDecks.addEventListener('click', () => {
      if (questionInput) saveActiveDeckContent(questionInput.value);
      saveSettings();
      const payload = {
        version: 1,
        type: 'wanzi_speaking_questions',
        exportedAt: new Date().toISOString(),
        activeDeckId: state.activeDeckId,
        tourContent: state.tourContent,
        customDecks: state.customDecks
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.href = url;
      a.download = `Wanzi_Speaking_Questions_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  if (btnImportDecks && importDecksFileInput) {
    btnImportDecks.addEventListener('click', () => {
      importDecksFileInput.value = '';
      importDecksFileInput.click();
    });
    importDecksFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ''));
          if (!parsed || (!Array.isArray(parsed.customDecks) && typeof parsed.tourContent !== 'string')) {
            alert(t('speaking.step1.importInvalid') || '올바른 질문 목록 백업(JSON) 파일이 아닙니다.');
            return;
          }
          if (typeof parsed.tourContent === 'string') {
            state.tourContent = parsed.tourContent;
          }
          if (Array.isArray(parsed.customDecks)) {
            state.customDecks = parsed.customDecks;
          }
          state.activeDeckId = parsed.activeDeckId || (state.customDecks.length > 0 ? state.customDecks[0].id : 'tour');
          if (questionInput) questionInput.value = getActiveDeckContent();
          updateParsedStatus();
          saveSettings();
          renderDeckTabs();
          alert(t('speaking.step1.importSuccess') || '질문 목록 백업 파일을 성공적으로 불러왔습니다!');
        } catch (err) {
          alert(t('speaking.step1.importInvalid') || '파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 파일인지 확인해 주세요.');
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener('click', () => {
      const isHidden = parsedPreviewList.classList.toggle('hidden');
      togglePreviewBtn.textContent = isHidden ? '▼ 목록 보기' : '▲ 목록 닫기';
    });
  }

  if (cleanNumberingCheck) {
    cleanNumberingCheck.addEventListener('change', () => {
      updateParsedStatus();
      saveSettings();
      renderDeckTabs();
    });
  }

  if (setAllQuestionsBtn) {
    setAllQuestionsBtn.addEventListener('click', () => {
      if (state.pool.length > 0) {
        maxQuestionsInput.value = state.pool.length;
        saveSettings();
      }
    });
  }

  if (questionInput) {
    questionInput.addEventListener('input', () => {
      saveActiveDeckContent(questionInput.value);
      updateParsedStatus();
      saveSettings();
      if (deckTabsList) {
        const activeCount = deckTabsList.querySelector('.deck-tab.active .deck-tab-count');
        if (activeCount) activeCount.textContent = state.pool.length;
      }
    });
  }

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

  [ttsWaitCheck, recordMyVoiceCheck, sttExtractCheck, sttLangSelect, audioFormatSelect, hideTextCheck, soundToggle, soundTypeSelect, soundDurationSelect].forEach(el => {
    if (el) el.addEventListener('change', () => {
      if (soundToggle && soundDetailPanel) {
        soundDetailPanel.style.opacity = soundToggle.checked ? '1' : '0.4';
        soundDetailPanel.style.pointerEvents = soundToggle.checked ? 'auto' : 'none';
      }
      updateMicOptionsUi();
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

  const ttsBrowserTooltipWrap = document.getElementById('ttsBrowserTooltipWrap');
  const ttsBrowserInfoBtn = document.getElementById('ttsBrowserInfoBtn');
  const ttsBrowserPopover = document.getElementById('ttsBrowserPopover');
  const ttsBrowserPopoverClose = document.getElementById('ttsBrowserPopoverClose');

  function closeTtsBrowserPopover() {
    if (ttsBrowserPopover) ttsBrowserPopover.classList.add('hidden');
    if (ttsBrowserInfoBtn) ttsBrowserInfoBtn.setAttribute('aria-expanded', 'false');
  }

  if (ttsBrowserInfoBtn && ttsBrowserPopover) {
    ttsBrowserInfoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = ttsBrowserPopover.classList.contains('hidden');
      if (isHidden) {
        ttsBrowserPopover.classList.remove('hidden');
        ttsBrowserInfoBtn.setAttribute('aria-expanded', 'true');
      } else {
        closeTtsBrowserPopover();
      }
    });
  }

  if (ttsBrowserPopoverClose) {
    ttsBrowserPopoverClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTtsBrowserPopover();
    });
  }

  document.addEventListener('click', (e) => {
    if (voiceSelectContainer && !voiceSelectContainer.contains(e.target) && isVoiceDropdownOpen()) {
      closeVoiceDropdown();
    }
    if (ttsBrowserTooltipWrap && !ttsBrowserTooltipWrap.contains(e.target)) {
      closeTtsBrowserPopover();
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

  if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
      getAudioContext();
      if (voiceSelect && voiceSelect.value !== 'auto') {
        speakText(t('speaking.step2.testPhrase'));
        return;
      }
      const targetLang = state.autoTargetLang || 'en';
      if (targetLang === 'all') {
        speakText('안녕하세요! Hello! 你好，这是语言自动识别测试。');
      } else {
        const targetPhrase = (TARGET_LANG_META[targetLang] && TARGET_LANG_META[targetLang].testPhrase) || 'Hello!';
        speakText(`안녕하세요, 완쯔 스피킹입니다! ${targetPhrase}`);
      }
    });
  }

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
    const preferredFormat = audioFormatSelect ? audioFormatSelect.value : 'auto';

    const m4aCandidates = [
      { type: 'audio/mp4;codecs=mp4a.40.2', ext: 'm4a' },
      { type: 'audio/mp4', ext: 'm4a' },
      { type: 'audio/aac', ext: 'm4a' }
    ];
    const webmCandidates = [
      { type: 'audio/webm;codecs=opus', ext: 'webm' },
      { type: 'audio/webm', ext: 'webm' },
      { type: 'audio/ogg;codecs=opus', ext: 'ogg' }
    ];

    let candidates = [];
    if (preferredFormat === 'm4a') {
      candidates = [...m4aCandidates, ...webmCandidates];
    } else if (preferredFormat === 'webm') {
      candidates = [...webmCandidates, ...m4aCandidates];
    } else {
      candidates = [
        { type: 'audio/webm;codecs=opus', ext: 'webm' },
        { type: 'audio/webm', ext: 'webm' },
        { type: 'audio/mp4;codecs=mp4a.40.2', ext: 'm4a' },
        { type: 'audio/mp4', ext: 'm4a' },
        { type: 'audio/aac', ext: 'm4a' },
        { type: 'audio/ogg;codecs=opus', ext: 'ogg' }
      ];
    }

    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c.type)) {
        return { mimeType: c.type, ext: c.ext };
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

  // =========================================================================
  // 10-B-2. 실시간 음성 텍스트 변환 (Speech-to-Text / STT) 관리자
  // =========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function updateMicOptionsUi() {
    const isMicEnabled = recordMyVoiceCheck ? recordMyVoiceCheck.checked : false;
    if (btnMicTest) btnMicTest.disabled = !isMicEnabled;
    if (sttOptionBlock) {
      sttOptionBlock.style.opacity = SpeechRecognition ? '1' : '0.45';
      sttOptionBlock.style.pointerEvents = SpeechRecognition ? 'auto' : 'none';
    }
    if (sttExtractCheck) {
      sttExtractCheck.disabled = !SpeechRecognition;
    }
    if (sttLangSelect) {
      const isSttChecked = sttExtractCheck ? sttExtractCheck.checked : false;
      sttLangSelect.disabled = !SpeechRecognition || !isSttChecked;
    }
  }

  if (!SpeechRecognition) {
    if (sttExtractCheck) {
      sttExtractCheck.disabled = true;
      sttExtractCheck.checked = false;
    }
    if (sttUnsupportedBadge) {
      sttUnsupportedBadge.classList.remove('hidden');
    }
  }

  function resolveSttLang(qIndex) {
    const selected = sttLangSelect ? sttLangSelect.value : 'auto';
    if (selected && selected !== 'auto') return selected;

    const currentQ = (qIndex !== undefined && state.queue && state.queue[qIndex])
      ? state.queue[qIndex]
      : ((state.queue && state.queue[state.currentIndex]) || '');

    if (!currentQ || typeof currentQ !== 'string') {
      const target = state.autoTargetLang || 'ko';
      const map = { ko: 'ko-KR', zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
      return map[target] || 'ko-KR';
    }

    const hangulCount = (currentQ.match(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/g) || []).length;
    const kanaCount = (currentQ.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
    const hanziCount = (currentQ.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length;
    const latinCount = (currentQ.match(/[a-zA-Z]/g) || []).length;

    // 1) 일본어 가나(히라가나/가타카나)가 포함된 경우 -> 일본어(ja-JP)
    if (kanaCount > 0) {
      return 'ja-JP';
    }

    // 2) 한글이 포함되어 있고 한글이 한자보다 많거나 같은 경우 -> 한국어(ko-KR)
    // (예: "십장생에 대해 설명하시오.", "Technical tourists에 대해 설명하세요" 등)
    if (hangulCount > 0 && hangulCount >= hanziCount) {
      return 'ko-KR';
    }

    // 3) 한글/가나 없이 한자가 포함된 경우 -> 중국어(zh-CN)
    // (예: "请简单做个自我介绍。", "谈谈你最喜欢的一个季节")
    if (hanziCount > 0 && hangulCount === 0) {
      return 'zh-CN';
    }

    // 4) 한글/한자/가나 없이 라틴 알파벳만 있는 경우 -> 영어/외국어
    // (예: "Describe the picture", "Tell me a little bit about yourself")
    if (latinCount > 0 && hangulCount === 0 && hanziCount === 0) {
      const target = state.autoTargetLang;
      if (target === 'es') return 'es-ES';
      if (target === 'fr') return 'fr-FR';
      if (target === 'de') return 'de-DE';
      return 'en-US';
    }

    // 5) 기타 특수기호 위주거나 판단이 모호할 때는 autoTargetLang 또는 한국어 기본
    const target = state.autoTargetLang || 'ko';
    const map = {
      ko: 'ko-KR',
      zh: 'zh-CN',
      en: 'en-US',
      ja: 'ja-JP',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE'
    };
    return map[target] || 'ko-KR';
  }

  function startQuestionStt(qIndex) {
    if (!SpeechRecognition) return;
    if (!sttExtractCheck || !sttExtractCheck.checked) return;

    stopQuestionStt();

    try {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      const lang = resolveSttLang(qIndex);
      if (!state.transcriptLangs) state.transcriptLangs = {};
      state.transcriptLangs[qIndex] = lang;
      recognizer.lang = lang;

      let finalTranscript = state.transcripts[qIndex] || '';

      recognizer.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            const piece = res[0].transcript.trim();
            if (piece) {
              finalTranscript += (finalTranscript ? ' ' : '') + piece;
            }
          } else {
            interim += res[0].transcript;
          }
        }
        state.transcripts[qIndex] = (finalTranscript + (interim ? ' ' + interim.trim() : '')).trim();
      };

      recognizer.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        if (e.error === 'audio-capture' || e.error === 'not-allowed') {
          state.hasSttHardwareCollision = true;
        }
        console.warn('SpeechRecognition error:', e.error);
      };

      recognizer.onend = () => {
        // 모바일 하드웨어 충돌(audio-capture)이나 마이크 권한 거부 발생 시 무한 재시작 방지
        if (state.hasSttHardwareCollision) {
          state.isSttActive = false;
          return;
        }
        // 크롬 등에서 긴 침묵 시 자동 종료되는 현상 방지: SPEAKING 단계 유지 중이면 자동 재시작
        if (state.phase === 'SPEAKING' && state.isSttActive) {
          try {
            recognizer.start();
          } catch (e) {
            startQuestionStt(qIndex);
          }
        }
      };

      recognizer.start();
      state.speechRecognizer = recognizer;
      state.isSttActive = true;
    } catch (err) {
      console.warn('SpeechRecognition start failed:', err);
      state.isSttActive = false;
    }
  }

  function stopQuestionStt() {
    state.isSttActive = false;
    if (state.speechRecognizer) {
      try {
        state.speechRecognizer.onend = null;
        state.speechRecognizer.stop();
      } catch (e) {}
      state.speechRecognizer = null;
    }
  }

  function releaseMicrophone() {
    stopQuestionRecording();
    stopQuestionStt();
    if (state.micStream) {
      try {
        state.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      state.micStream = null;
    }
  }

  // 전체 시험 녹음 메모리(Blob URL) 일괄 해제 (메모리 누수 방지)
  function revokeAllRecordings() {
    stopQuestionStt();
    if (state.recordings) {
      Object.values(state.recordings).forEach(rec => {
        if (rec && rec.url) {
          try { URL.revokeObjectURL(rec.url); } catch (e) {}
        }
      });
      state.recordings = {};
    }
  }

  // 마이크 연결 및 브라우저 권한 테스트
  let micTestTimer = null;
  async function testMicrophonePermission() {
    if (!micTestStatus) return;
    if (micTestTimer) {
      clearTimeout(micTestTimer);
      micTestTimer = null;
    }

    micTestStatus.className = 'mic-status-badge testing';
    micTestStatus.textContent = t('speaking.step2.micTesting');
    micTestStatus.classList.remove('hidden');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micTestStatus.className = 'mic-status-badge error';
      micTestStatus.textContent = t('speaking.step2.micNotFound');
      alert(t('speaking.step2.micNotFound'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 마이크 권한 정상 획득 시 즉시 트랙 해제
      stream.getTracks().forEach(t => t.stop());
      micTestStatus.className = 'mic-status-badge success';
      micTestStatus.textContent = t('speaking.step2.micSuccess');
      micTestTimer = setTimeout(() => {
        if (micTestStatus) micTestStatus.classList.add('hidden');
      }, 5000);
    } catch (err) {
      console.warn('Microphone test error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        micTestStatus.className = 'mic-status-badge error';
        micTestStatus.textContent = t('speaking.step2.micDenied');
        alert(t('speaking.step2.micDeniedGuide'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        micTestStatus.className = 'mic-status-badge error';
        micTestStatus.textContent = t('speaking.step2.micNotFound');
        alert(t('speaking.step2.micNotFound'));
      } else {
        micTestStatus.className = 'mic-status-badge error';
        micTestStatus.textContent = t('speaking.step2.micDenied');
        alert(t('speaking.sim.micDenied'));
      }
    }
  }

  // 오디오 시간 포맷 (0:00)
  function formatAudioTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) sec = 0;
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  }

  // 슬라이더 진행 바 배경 색상 업데이트 (진행 부분은 primary blue, 미진행 부분은 회색)
  function updateSliderProgress(slider, pct) {
    if (!slider) return;
    const clamped = Math.max(0, Math.min(100, pct));
    slider.style.background = `linear-gradient(to right, var(--primary, #1a73e8) 0%, var(--primary, #1a73e8) ${clamped}%, #cbd5e1 ${clamped}%, #cbd5e1 100%)`;
  }

  let userAudioPlayer = null;
  let activeVoiceBtn = null; // 쉐도잉 등 기존 심플 토글 버튼 호환용
  let activeAudioQIndex = null;
  let activeAudioPlayBtn = null;
  let activeAudioSlider = null;
  let activeAudioCurTimeEl = null;
  let activeAudioPlayerBox = null;
  let isUserDraggingSlider = false;

  function stopUserVoicePlayback() {
    if (userAudioPlayer) {
      try {
        userAudioPlayer.pause();
        userAudioPlayer.currentTime = 0;
      } catch (e) {}
    }
    // 기존 심플 버튼 UI 리셋
    if (activeVoiceBtn) {
      activeVoiceBtn.innerHTML = `▶️ <span>${escapeHtml(t('speaking.result.listenMyVoice'))}</span>`;
      activeVoiceBtn.classList.remove('is-playing');
      activeVoiceBtn = null;
    }
    // 결과 화면 시크 바 플레이어 UI 리셋
    if (activeAudioPlayBtn) {
      activeAudioPlayBtn.innerHTML = '▶️';
      activeAudioPlayBtn.classList.remove('is-playing');
      activeAudioPlayBtn.title = t('speaking.result.playAudio');
    }
    if (activeAudioSlider) {
      activeAudioSlider.value = 0;
      updateSliderProgress(activeAudioSlider, 0);
    }
    if (activeAudioCurTimeEl) {
      activeAudioCurTimeEl.textContent = '0:00';
    }
    if (activeAudioPlayerBox) {
      activeAudioPlayerBox.classList.remove('is-active');
    }
    activeAudioQIndex = null;
    activeAudioPlayBtn = null;
    activeAudioSlider = null;
    activeAudioCurTimeEl = null;
    activeAudioPlayerBox = null;
  }

  // 결과 화면 문제별 오디오 플레이어 (구간 이동 시크 바 지원)
  function toggleQuestionVoicePlayback(qIdx, url, playerBox, playBtn, slider, curTimeEl, totalTimeEl, totalSec) {
    if (!url) return;

    // 같은 문제에서 재생/일시정지 토글
    if (activeAudioQIndex === qIdx && userAudioPlayer) {
      if (!userAudioPlayer.paused) {
        userAudioPlayer.pause();
        playBtn.innerHTML = '▶️';
        playBtn.classList.remove('is-playing');
        playBtn.title = t('speaking.result.playAudio');
      } else {
        const dur = (Number.isFinite(userAudioPlayer.duration) && userAudioPlayer.duration > 0)
          ? userAudioPlayer.duration
          : (parseFloat(slider.max) || totalSec || 0);
        let seekTime = parseFloat(slider.value) || 0;
        // 재생 완료 지점 끝에 도달해 있었던 경우 처음부터 재시작
        if (dur > 0 && seekTime >= dur - 0.25) {
          seekTime = 0;
          slider.value = 0;
          updateSliderProgress(slider, 0);
          curTimeEl.textContent = '0:00';
        }
        if (Math.abs(userAudioPlayer.currentTime - seekTime) > 0.3) {
          try { userAudioPlayer.currentTime = seekTime; } catch (e) {}
        }
        userAudioPlayer.play().then(() => {
          playBtn.innerHTML = '⏸️';
          playBtn.classList.add('is-playing');
          playBtn.title = t('speaking.result.pauseAudio');
        }).catch(err => {
          console.warn('Audio resume error:', err);
          stopUserVoicePlayback();
        });
      }
      return;
    }

    // 다른 문제이거나 첫 재생일 때
    stopUserVoicePlayback();

    if (!userAudioPlayer) {
      userAudioPlayer = new Audio();
    }

    let startSec = parseFloat(slider.value) || 0;
    const durEstimated = parseFloat(slider.max) || totalSec || 0;
    if (durEstimated > 0 && startSec >= durEstimated - 0.25) {
      startSec = 0;
      slider.value = 0;
      updateSliderProgress(slider, 0);
      curTimeEl.textContent = '0:00';
    }

    userAudioPlayer.src = url;
    activeAudioQIndex = qIdx;
    activeAudioPlayBtn = playBtn;
    activeAudioSlider = slider;
    activeAudioCurTimeEl = curTimeEl;
    activeAudioPlayerBox = playerBox;

    playerBox.classList.add('is-active');
    playBtn.innerHTML = '⏸️';
    playBtn.classList.add('is-playing');
    playBtn.title = t('speaking.result.pauseAudio');

    userAudioPlayer.onloadedmetadata = () => {
      if (Number.isFinite(userAudioPlayer.duration) && userAudioPlayer.duration > 0) {
        const dur = userAudioPlayer.duration;
        slider.max = dur.toFixed(2);
        totalTimeEl.textContent = formatAudioTime(dur);
      }
      if (startSec > 0 && startSec < (parseFloat(slider.max) || 9999)) {
        userAudioPlayer.currentTime = startSec;
      }
    };

    userAudioPlayer.ontimeupdate = () => {
      if (isUserDraggingSlider || activeAudioQIndex !== qIdx) return;
      const cur = userAudioPlayer.currentTime;
      slider.value = cur;
      curTimeEl.textContent = formatAudioTime(cur);
      const maxVal = parseFloat(slider.max) || totalSec || 1;
      updateSliderProgress(slider, (cur / maxVal) * 100);
    };

    userAudioPlayer.onended = () => {
      if (activeAudioQIndex === qIdx) {
        playBtn.innerHTML = '▶️';
        playBtn.classList.remove('is-playing');
        playBtn.title = t('speaking.result.playAudio');
        const maxVal = parseFloat(slider.max) || totalSec || 0;
        if (maxVal > 0) {
          slider.value = maxVal;
          updateSliderProgress(slider, 100);
          curTimeEl.textContent = totalTimeEl.textContent || formatAudioTime(maxVal);
        }
        playerBox.classList.remove('is-active');
      }
    };

    userAudioPlayer.onerror = (e) => {
      console.warn('Audio playback error:', e);
      stopUserVoicePlayback();
    };

    if (startSec > 0) {
      try { userAudioPlayer.currentTime = startSec; } catch (e) {}
    }

    userAudioPlayer.play().catch(err => {
      console.warn('Audio play error:', err);
      stopUserVoicePlayback();
    });
  }

  // 쉐도잉 스튜디오 등 기존 심플 토글 버튼 호환용
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

  // 개별 문제 데이터 초기화 (녹음 해제 및 소요 시간 리셋)
  function resetQuestionData(qIndex) {
    if (state.recordings && state.recordings[qIndex]) {
      if (state.recordings[qIndex].url) {
        try { URL.revokeObjectURL(state.recordings[qIndex].url); } catch (e) {}
      }
      delete state.recordings[qIndex];
    }
    if (state.transcripts) {
      delete state.transcripts[qIndex];
    }
    if (state.transcriptLangs) {
      delete state.transcriptLangs[qIndex];
    }
    if (state.questionSpentMs) {
      state.questionSpentMs[qIndex] = 0;
    }
    state.hasSttHardwareCollision = false;
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

  // 음성 파일 다운로드 파일명 생성 (질문 내용 기반, OS 파일명 금지 특수문자 제거, 한글/한자 유니코드 온전 보존)
  function buildAudioDownloadFilename(qText, idx, ext) {
    const extension = ext || 'webm';
    const prefix = `Q${idx + 1}`;

    let clean = String(qText || '')
      .replace(/[\r\n\t]+/g, ' ')
      // 윈도우/맥/리눅스 파일 시스템 금지 특수문자 제거 (\ / : * ? " < > | 및 제어문자)
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 파일명 끝의 마침표나 공백 제거 (Windows 파일 시스템 특성상 오류 방지)
    clean = clean.replace(/[. ]+$/, '');

    // 파일명이 너무 길면 OS 경로 제한(255자)을 고려해 적절한 길이(최대 50자)로 안전 절삭
    if (clean.length > 50) {
      clean = clean.slice(0, 50).trim().replace(/[. ]+$/, '');
    }

    const baseName = clean ? `${prefix}_${clean}` : `${prefix}_Answer`;
    return `${baseName}.${extension}`;
  }

  // =========================================================================
  // 오디오 포맷 변환 (WAV / MP3) & ZIP 압축 생성기
  // =========================================================================
  function audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitDepth = 16;

    let interleaved;
    if (numChannels === 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      interleaved = new Float32Array(left.length + right.length);
      let idx = 0;
      for (let i = 0; i < left.length; i++) {
        interleaved[idx++] = left[i];
        interleaved[idx++] = right[i];
      }
    } else {
      interleaved = audioBuffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataByteLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataByteLength);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, dataByteLength, true);

    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function audioBufferToMp3Blob(audioBuffer) {
    if (typeof lamejs === 'undefined' || !lamejs.Mp3Encoder) {
      console.warn('lamejs not loaded, falling back to WAV');
      return audioBufferToWavBlob(audioBuffer);
    }
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    const mp3Data = [];

    const sampleBlockSize = 1152;
    const left = audioBuffer.getChannelData(0);
    const right = channels > 1 ? audioBuffer.getChannelData(1) : null;

    const leftInt16 = new Int16Array(left.length);
    for (let i = 0; i < left.length; i++) {
      const s = Math.max(-1, Math.min(1, left[i]));
      leftInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    let rightInt16 = null;
    if (right) {
      rightInt16 = new Int16Array(right.length);
      for (let i = 0; i < right.length; i++) {
        const s = Math.max(-1, Math.min(1, right[i]));
        rightInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
    }

    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      let mp3buf;
      if (channels === 2 && rightInt16) {
        const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
        mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      } else {
        mp3buf = mp3encoder.encodeBuffer(leftChunk);
      }
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3end = mp3encoder.flush();
    if (mp3end.length > 0) {
      mp3Data.push(mp3end);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  }

  async function convertBlobToTargetFormat(recBlob, targetFormat, originalExt) {
    if (!recBlob) return { blob: recBlob, ext: originalExt || 'webm' };
    const srcExt = (originalExt || 'webm').toLowerCase();
    const dstFormat = (targetFormat || 'auto').toLowerCase();

    if (dstFormat === 'auto' || dstFormat === srcExt) {
      return { blob: recBlob, ext: srcExt };
    }

    try {
      const audioCtx = getAudioContext() || new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await recBlob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      if (dstFormat === 'wav') {
        const wavBlob = audioBufferToWavBlob(audioBuffer);
        return { blob: wavBlob, ext: 'wav' };
      }
      if (dstFormat === 'mp3') {
        const mp3Blob = audioBufferToMp3Blob(audioBuffer);
        return { blob: mp3Blob, ext: 'mp3' };
      }
      if (dstFormat === 'm4a') {
        if (srcExt === 'm4a') return { blob: recBlob, ext: 'm4a' };
        const mp3Blob = audioBufferToMp3Blob(audioBuffer);
        return { blob: mp3Blob, ext: 'mp3' };
      }
      if (dstFormat === 'webm') {
        if (srcExt === 'webm') return { blob: recBlob, ext: 'webm' };
        const wavBlob = audioBufferToWavBlob(audioBuffer);
        return { blob: wavBlob, ext: 'wav' };
      }
    } catch (err) {
      console.warn('Audio format conversion error, using original blob:', err);
    }
    return { blob: recBlob, ext: srcExt };
  }

  const CRC32_TABLE = (() => {
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function calculateCrc32(uint8Array) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < uint8Array.length; i++) {
      c = (c >>> 8) ^ CRC32_TABLE[(c ^ uint8Array[i]) & 0xFF];
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function createZipBlob(files) {
    const utf8Encoder = new TextEncoder();
    const parts = [];
    const cdEntries = [];
    let offset = 0;

    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    for (const f of files) {
      const nameBytes = utf8Encoder.encode(f.name);
      const dataBytes = (f.data instanceof Uint8Array) ? f.data : new Uint8Array(f.data);
      const crc = calculateCrc32(dataBytes);
      const size = dataBytes.length;

      // Local file header (30 bytes)
      const lfh = new Uint8Array(30);
      const lfhView = new DataView(lfh.buffer);
      lfhView.setUint32(0, 0x04034b50, true);
      lfhView.setUint16(4, 20, true); // v2.0
      lfhView.setUint16(6, 0x0800, true); // UTF-8 filename flag
      lfhView.setUint16(8, 0, true); // compression method 0 (store)
      lfhView.setUint16(10, dosTime, true);
      lfhView.setUint16(12, dosDate, true);
      lfhView.setUint32(14, crc, true);
      lfhView.setUint32(18, size, true);
      lfhView.setUint32(22, size, true);
      lfhView.setUint16(26, nameBytes.length, true);
      lfhView.setUint16(28, 0, true);

      parts.push(lfh, nameBytes, dataBytes);

      // Central directory header (46 bytes)
      const cdh = new Uint8Array(46);
      const cdhView = new DataView(cdh.buffer);
      cdhView.setUint32(0, 0x02014b50, true);
      cdhView.setUint16(4, 20, true);
      cdhView.setUint16(6, 20, true);
      cdhView.setUint16(8, 0x0800, true); // UTF-8 flag
      cdhView.setUint16(10, 0, true);
      cdhView.setUint16(12, dosTime, true);
      cdhView.setUint16(14, dosDate, true);
      cdhView.setUint32(16, crc, true);
      cdhView.setUint32(20, size, true);
      cdhView.setUint32(24, size, true);
      cdhView.setUint16(28, nameBytes.length, true);
      cdhView.setUint16(30, 0, true);
      cdhView.setUint16(32, 0, true);
      cdhView.setUint16(34, 0, true);
      cdhView.setUint16(36, 0, true);
      cdhView.setUint32(38, 0, true);
      cdhView.setUint32(42, offset, true);

      cdEntries.push(cdh, nameBytes);
      offset += lfh.length + nameBytes.length + dataBytes.length;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const b of cdEntries) cdSize += b.length;

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, files.length, true);
    eocdView.setUint16(10, files.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, cdOffset, true);
    eocdView.setUint16(20, 0, true);

    return new Blob([...parts, ...cdEntries, eocd], { type: 'application/zip' });
  }

  function downloadBlobAsFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
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

  // =========================================================================
  // Screen Wake Lock API (모바일 시험 도중 화면 꺼짐 방지)
  // =========================================================================
  let wakeLockSentinel = null;

  async function requestWakeLock() {
    if ('wakeLock' in navigator && !wakeLockSentinel) {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      } catch (err) {
        wakeLockSentinel = null;
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      try { wakeLockSentinel.release(); } catch (e) {}
      wakeLockSentinel = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const isExamActive = Boolean(state && state.phase && state.phase !== 'SETUP' && state.phase !== 'FINISHED' && simulatorView && !simulatorView.classList.contains('hidden'));
      const isShadowActive = Boolean(shadowState && shadowState.isPlaying && !shadowState.isPaused);
      if (isExamActive || isShadowActive) {
        requestWakeLock();
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          try { window.speechSynthesis.resume(); } catch (e) {}
        }
      }
    }
  });

  let isStartingExam = false;

  async function startExam() {
    if (isStartingExam) return;
    isStartingExam = true;
    if (startExamBtn) {
      startExamBtn.disabled = true;
      startExamBtn.classList.add('loading');
    }

    try {
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
      revokeAllRecordings();
      state.recordings = {};
      state.transcripts = {};
      state.transcriptLangs = {};
      state.hasSttHardwareCollision = false;
      state.questionSpentMs = {};
      state.speakingStartTime = null;
      state.isStoppedEarly = false;
      state.singleRetryIndex = null;

      // 마이크 권한 요청 (녹음 옵션 켜져 있을 때)
      if (recordMyVoiceCheck && recordMyVoiceCheck.checked) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.micStream = stream;
          } catch (err) {
            console.warn('Microphone permission denied or error:', err);
            state.micStream = null;
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              alert(t('speaking.step2.micDeniedGuide'));
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              alert(t('speaking.step2.micNotFound'));
            } else {
              alert(t('speaking.sim.micDenied'));
            }
          }
        } else {
          alert(t('speaking.sim.micDenied'));
        }
      }

      const answerSec = Math.max(5, parseInt(answerTimeInput.value, 10) || 120);
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

      // 화면 꺼짐 방지 활성화
      await requestWakeLock();

      // 화면 전환 (브라우저 뒤로가기 지원)
      showSimulatorView();
      try {
        history.pushState({ view: 'simulator' }, '', '#exam');
      } catch (e) {}

      applyTextHiddenState();
      loadQuestion(0);
    } finally {
      isStartingExam = false;
      if (startExamBtn) {
        startExamBtn.disabled = false;
        startExamBtn.classList.remove('loading');
      }
    }
  }

  // 특정 문제 1개만 단독 다시 풀기
  let isRetakingSingleQ = false;
  async function retakeSingleQuestion(idx) {
    if (isRetakingSingleQ) return;
    if (idx < 0 || idx >= state.queue.length) return;
    isRetakingSingleQ = true;

    try {
      unlockAudioAndTtsForIOS();
      stopUserVoicePlayback();
      resetQuestionData(idx);

      if (recordMyVoiceCheck && recordMyVoiceCheck.checked && !state.micStream) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (err) {
            console.warn('Microphone error on retake:', err);
            state.micStream = null;
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              alert(t('speaking.step2.micDeniedGuide'));
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              alert(t('speaking.step2.micNotFound'));
            }
          }
        }
      }

      await requestWakeLock();
      state.singleRetryIndex = idx;
      showSimulatorView();
      loadQuestion(idx);
    } finally {
      isRetakingSingleQ = false;
    }
  }

  function showSimulatorView() {
    setupSection.classList.add('hidden');
    resultCard.classList.add('hidden');
    simulatorView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function returnToSetupView(skipHistory = false) {
    releaseWakeLock();
    stopSpeaking();
    recordSpeakingTime(state.currentIndex);
    stopQuestionRecording();
    releaseMicrophone();
    stopUserVoicePlayback();
    revokeAllRecordings();
    clearInterval(state.timerInterval);
    state.phase = 'SETUP';
    state.isStoppedEarly = false;
    state.singleRetryIndex = null;
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

    // UI 표시 (단독 다시 풀기 모드 vs 일반 모드)
    if (state.singleRetryIndex !== null) {
      simProgressText.textContent = t('speaking.sim.singleRetryBadge', {
        num: index + 1
      });
      simProgressFill.style.width = '100%';
      btnPrevQuestion.classList.add('hidden');
      btnNextQuestion.textContent = t('speaking.sim.singleRetryDone');
    } else {
      simProgressText.textContent = t('speaking.sim.progress', {
        current: index + 1,
        total: state.queue.length
      });
      const overallRatio = (index) / state.queue.length;
      simProgressFill.style.width = `${overallRatio * 100}%`;
      btnPrevQuestion.classList.remove('hidden');
      btnNextQuestion.textContent = t('speaking.sim.next');
    }

    simQuestionText.textContent = currentQ;
    const simQuestionCard = document.querySelector('.sim-question-card');
    if (simQuestionCard) {
      simQuestionCard.scrollTop = 0;
    }
    btnSkipBreak.classList.add('hidden');
    btnPauseResume.classList.remove('is-paused');
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
      stopQuestionStt();
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
      startQuestionStt(state.currentIndex);
    } else if (newPhase === 'BREAK') {
      recordSpeakingTime(state.currentIndex);
      stopQuestionRecording();
      stopQuestionStt();
      simPhaseBadge.textContent = t('speaking.sim.statusBreak');
      timerPhaseCaption.textContent = 'BREAK';
      btnSkipBreak.classList.remove('hidden');
    } else if (newPhase === 'PAUSED') {
      recordSpeakingTime(state.currentIndex);
      pauseQuestionRecording();
      stopQuestionStt();
      simPhaseBadge.textContent = t('speaking.sim.statusPaused');
      timerPhaseCaption.textContent = 'PAUSED';
    }
  }

  function startSpeakingTimer() {
    const answerSec = Math.max(5, parseInt(answerTimeInput.value, 10) || 120);
    state.totalDurationMs = answerSec * 1000;
    state.remainingMs = state.totalDurationMs;
    setPhase('SPEAKING');

    state.lastTickTime = Date.now();
    runTimerCountdown(async () => {
      playSound('finish'); // "삐-빅!" 알림음
      recordSpeakingTime(state.currentIndex);
      stopQuestionStt();
      await stopQuestionRecording();
      state.history.push({
        question: state.queue[state.currentIndex],
        timeSpentMs: state.questionSpentMs[state.currentIndex] || state.totalDurationMs
      });

      if (state.singleRetryIndex !== null) {
        state.singleRetryIndex = null;
        await finishExam();
        return;
      }

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
      btnPauseResume.classList.remove('is-paused');
      btnPauseResume.textContent = t('speaking.sim.pause');
      setPhase(resumeTo);
      state.lastTickTime = Date.now();
      runTimerCountdown(async () => {
        if (resumeTo === 'SPEAKING') {
          playSound('finish');
          recordSpeakingTime(state.currentIndex);
          stopQuestionStt();
          await stopQuestionRecording();
          if (state.singleRetryIndex !== null) {
            state.singleRetryIndex = null;
            await finishExam();
            return;
          }
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
      btnPauseResume.classList.add('is-paused');
      btnPauseResume.textContent = t('speaking.sim.resume');
    }
  }

  async function finishExam() {
    releaseWakeLock();
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

    const resultEmoji = document.querySelector('.result-emoji');
    const resultTitle = document.querySelector('.result-title');
    const resultSubtitle = document.querySelector('.result-subtitle');

    if (state.isStoppedEarly) {
      if (resultEmoji) resultEmoji.textContent = '⏸️';
      if (resultTitle) resultTitle.textContent = t('speaking.result.stoppedTitle');
      if (resultSubtitle) resultSubtitle.textContent = t('speaking.result.stoppedSubtitle');
      const attemptedCount = Math.min(state.queue.length, state.currentIndex + 1);
      resCompletedCount.textContent = `${attemptedCount} / ${state.queue.length}개`;
    } else {
      if (resultEmoji) resultEmoji.textContent = '🎉';
      if (resultTitle) resultTitle.textContent = t('speaking.result.title');
      if (resultSubtitle) resultSubtitle.textContent = t('speaking.result.subtitle');
      resCompletedCount.textContent = `${state.queue.length}개`;
    }

    // 녹음 파일 일괄 다운로드 바 업데이트
    const validRecCount = state.recordings ? Object.values(state.recordings).filter(r => r && r.blob).length : 0;
    if (resultBatchDownloadBar) {
      if (validRecCount > 0) {
        resultBatchDownloadBar.classList.remove('hidden');
        if (resRecordingsCount) {
          resRecordingsCount.textContent = t('speaking.result.batchCount', { count: validRecCount }) || `${validRecCount}개`;
        }
      } else {
        resultBatchDownloadBar.classList.add('hidden');
      }
    }

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

      // 문제 바로 옆 낭독 스피커 아이콘 버튼
      const speakQBtn = document.createElement('button');
      speakQBtn.type = 'button';
      speakQBtn.className = 'btn-q-speak-inline';
      speakQBtn.innerHTML = '🔊';
      speakQBtn.title = t('speaking.result.listenQuestion');
      speakQBtn.setAttribute('aria-label', `Q${idx + 1} ${t('speaking.result.listenQuestion')}`);
      speakQBtn.addEventListener('click', () => {
        stopUserVoicePlayback();
        speakText(q);
      });

      mainDiv.append(num, text, speakQBtn);

      // 하단 액션 버튼 그룹 (소요 시간 배지, 다시 풀기, 초기화)
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

      // 2) 내 답변 녹음 플레이어 (녹음 데이터가 있는 경우 구간 이동 바 제공)
      const rec = state.recordings ? state.recordings[idx] : null;
      let playerBox = null;
      if (rec && rec.url) {
        const totalSec = (rec.durationMs && rec.durationMs > 0)
          ? Math.max(0.1, rec.durationMs / 1000)
          : 0;

        playerBox = document.createElement('div');
        playerBox.className = 'result-q-player-box';
        playerBox.dataset.qIndex = String(idx);

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'btn-audio-play-toggle';
        playBtn.innerHTML = '▶️';
        playBtn.title = t('speaking.result.playAudio');
        playBtn.setAttribute('aria-label', `Q${idx + 1} ${t('speaking.result.playAudio')}`);

        const curTimeEl = document.createElement('span');
        curTimeEl.className = 'audio-time-badge current';
        curTimeEl.textContent = '0:00';

        const sliderWrap = document.createElement('div');
        sliderWrap.className = 'audio-slider-wrap';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'audio-seek-slider';
        slider.min = '0';
        slider.max = totalSec > 0 ? totalSec.toFixed(2) : '100';
        slider.step = '0.05';
        slider.value = '0';
        slider.title = t('speaking.result.seekAudioAria', { num: idx + 1 });
        slider.setAttribute('aria-label', t('speaking.result.seekAudioAria', { num: idx + 1 }));
        updateSliderProgress(slider, 0);

        sliderWrap.appendChild(slider);

        const totalTimeEl = document.createElement('span');
        totalTimeEl.className = 'audio-time-badge total';
        totalTimeEl.textContent = formatAudioTime(totalSec);

        const downloadLink = document.createElement('a');
        downloadLink.className = 'btn-audio-download';
        downloadLink.href = rec.url;
        const initialFormat = audioFormatSelect ? audioFormatSelect.value : 'auto';
        const initialExt = (initialFormat && initialFormat !== 'auto') ? initialFormat : rec.ext;
        const fileName = buildAudioDownloadFilename(q, idx, initialExt);
        downloadLink.download = fileName;
        downloadLink.setAttribute('download', fileName);
        downloadLink.innerHTML = `💾 <span>${escapeHtml(t('speaking.result.downloadMyVoice'))}</span>`;
        downloadLink.title = `${t('speaking.result.downloadMyVoice')} (${fileName})`;

        downloadLink.addEventListener('click', async (e) => {
          e.preventDefault();
          const targetFormat = audioFormatSelect ? audioFormatSelect.value : 'auto';
          const targetExt = (targetFormat && targetFormat !== 'auto') ? targetFormat : rec.ext;
          const origHtml = downloadLink.innerHTML;
          try {
            downloadLink.innerHTML = `⏳ <span>${t('speaking.result.converting', { current: 1, total: 1 }) || '변환 중...'}</span>`;
            const { blob: outBlob, ext: outExt } = await convertBlobToTargetFormat(rec.blob, targetExt, rec.ext);
            const targetFileName = buildAudioDownloadFilename(q, idx, outExt);
            downloadBlobAsFile(outBlob, targetFileName);
          } catch (err) {
            console.warn('Audio conversion failed:', err);
            downloadBlobAsFile(rec.blob, fileName);
          } finally {
            downloadLink.innerHTML = origHtml;
          }
        });

        playerBox.append(playBtn, curTimeEl, sliderWrap, totalTimeEl, downloadLink);

        // 슬라이더 이벤트: 사용자가 드래그하며 구간 이동
        slider.addEventListener('input', () => {
          isUserDraggingSlider = true;
          const maxVal = parseFloat(slider.max) || totalSec || 1;
          const rawSeek = parseFloat(slider.value) || 0;
          // 맨 끝으로 드래그했을 때 의도치 않게 바로 끝남(ended) 처리되는 현상 방지
          const seekSec = Math.min(rawSeek, Math.max(0, maxVal - 0.15));
          curTimeEl.textContent = formatAudioTime(rawSeek);
          updateSliderProgress(slider, (rawSeek / maxVal) * 100);

          if (activeAudioQIndex === idx && userAudioPlayer) {
            try { userAudioPlayer.currentTime = seekSec; } catch (e) {}
          }
        });

        slider.addEventListener('change', () => {
          isUserDraggingSlider = false;
          const maxVal = parseFloat(slider.max) || totalSec || 1;
          const rawSeek = parseFloat(slider.value) || 0;
          const seekSec = Math.min(rawSeek, Math.max(0, maxVal - 0.15));
          if (activeAudioQIndex === idx && userAudioPlayer) {
            try { userAudioPlayer.currentTime = seekSec; } catch (e) {}
          } else {
            stopSpeaking();
            toggleQuestionVoicePlayback(idx, rec.url, playerBox, playBtn, slider, curTimeEl, totalTimeEl, totalSec);
          }
        });

        // 재생/일시정지 토글
        playBtn.addEventListener('click', () => {
          stopSpeaking();
          toggleQuestionVoicePlayback(idx, rec.url, playerBox, playBtn, slider, curTimeEl, totalTimeEl, totalSec);
        });
      } else {
        const noRec = document.createElement('span');
        noRec.className = 'no-rec-label';
        noRec.textContent = t('speaking.result.noRecording');
        actionsDiv.appendChild(noRec);
      }

      // 3) 다시 풀기 (이 문제만 단독 재응시) - 실수 방지를 위해 confirm 확인
      const retakeQBtn = document.createElement('button');
      retakeQBtn.type = 'button';
      retakeQBtn.className = 'btn-review-action btn-retake-q';
      retakeQBtn.innerHTML = `🎯 <span>${escapeHtml(t('speaking.result.retakeQuestion'))}</span>`;
      retakeQBtn.title = `Q${idx + 1} ${t('speaking.result.retakeQuestion')}`;
      retakeQBtn.addEventListener('click', () => {
        if (confirm(t('speaking.result.confirmRetakeQ', { num: idx + 1 }))) {
          stopUserVoicePlayback();
          retakeSingleQuestion(idx);
        }
      });
      actionsDiv.appendChild(retakeQBtn);

      // 4) 문제 초기화 (기록 리셋)
      const resetQBtn = document.createElement('button');
      resetQBtn.type = 'button';
      resetQBtn.className = 'btn-review-action btn-reset-q';
      resetQBtn.innerHTML = `🔄 <span>${escapeHtml(t('speaking.result.resetQuestion'))}</span>`;
      resetQBtn.title = `Q${idx + 1} ${t('speaking.result.resetQuestion')}`;
      resetQBtn.addEventListener('click', () => {
        if (confirm(t('speaking.result.confirmResetQ', { num: idx + 1 }))) {
          stopUserVoicePlayback();
          resetQuestionData(idx);
          finishExam();
        }
      });
      actionsDiv.appendChild(resetQBtn);

      // 5) 추출된 답변 텍스트 (STT) 상자
      let transcriptBox = null;
      const isSttConfigured = sttExtractCheck && sttExtractCheck.checked;
      const hasTranscript = Boolean(state.transcripts && state.transcripts[idx] && state.transcripts[idx].trim());

      if (isSttConfigured || hasTranscript) {
        const text = (state.transcripts && state.transcripts[idx]) ? state.transcripts[idx].trim() : '';
        transcriptBox = document.createElement('div');
        transcriptBox.className = 'result-transcript-box is-collapsed';

        const tHeader = document.createElement('div');
        tHeader.className = 'transcript-header';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'transcript-toggle-btn';
        toggleBtn.setAttribute('aria-expanded', 'false');

        const tLabel = document.createElement('span');
        tLabel.className = 'transcript-label';

        const detectedLang = (state.transcriptLangs && state.transcriptLangs[idx]) || resolveSttLang(idx);
        const langTagMap = {
          'ko-KR': '🇰🇷 한국어',
          'zh-CN': '🇨🇳 중국어',
          'en-US': '🇺🇸 영어',
          'ja-JP': '🇯🇵 일본어',
          'es-ES': '🇪🇸 스페인어',
          'fr-FR': '🇫🇷 프랑스어',
          'de-DE': '🇩🇪 독일어'
        };
        const langText = langTagMap[detectedLang] || '';
        const langBadgeHtml = langText ? `<span class="transcript-lang-tag">${escapeHtml(langText)}</span>` : '';

        tLabel.innerHTML = `<span>💬</span> <span>${escapeHtml(t('speaking.result.transcriptLabel'))}</span>${langBadgeHtml}`;

        const toggleIndicator = document.createElement('span');
        toggleIndicator.className = 'transcript-toggle-indicator';
        toggleIndicator.innerHTML = `<span class="toggle-text">${escapeHtml(t('speaking.result.transcriptExpand'))}</span> <span class="toggle-arrow">▾</span>`;

        toggleBtn.append(tLabel, toggleIndicator);
        tHeader.appendChild(toggleBtn);

        const actionsSpan = document.createElement('div');
        actionsSpan.className = 'transcript-actions';

        if (text) {
          const copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.className = 'btn-copy-transcript';
          copyBtn.title = t('speaking.result.copyTranscriptTitle');
          copyBtn.innerHTML = `📋 <span>${escapeHtml(t('speaking.result.copyTranscript'))}</span>`;
          copyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            let copied = false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              try {
                await navigator.clipboard.writeText(text);
                copied = true;
              } catch (err) {}
            }
            if (!copied) {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              try {
                document.execCommand('copy');
                copied = true;
              } catch (err) {}
              document.body.removeChild(ta);
            }
            if (copied) {
              const originalHtml = copyBtn.innerHTML;
              copyBtn.innerHTML = `✅ <span>${escapeHtml(t('speaking.result.copied'))}</span>`;
              copyBtn.style.color = '#10b981';
              copyBtn.style.borderColor = '#10b981';
              setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                copyBtn.style.color = '';
                copyBtn.style.borderColor = '';
              }, 1800);
            }
          });
          actionsSpan.appendChild(copyBtn);
        }

        tHeader.appendChild(actionsSpan);

        const tBody = document.createElement('div');
        tBody.className = 'transcript-body';

        const tText = document.createElement('div');
        tText.className = 'transcript-text' + (text ? '' : ' empty');
        if (text) {
          tText.textContent = text;
        } else if (state.hasSttHardwareCollision) {
          tText.textContent = t('speaking.result.micCollisionNotice');
        } else {
          tText.textContent = t('speaking.result.noTranscript');
        }
        tBody.appendChild(tText);

        // 토글 동작 연결 (기본적으로 접힌 상태)
        toggleBtn.addEventListener('click', () => {
          const isCollapsed = transcriptBox.classList.toggle('is-collapsed');
          toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
          const textEl = toggleIndicator.querySelector('.toggle-text');
          if (textEl) {
            textEl.textContent = isCollapsed
              ? t('speaking.result.transcriptExpand')
              : t('speaking.result.transcriptCollapse');
          }
        });

        transcriptBox.append(tHeader, tBody);
      }

      const itemChildren = [mainDiv];
      if (playerBox) itemChildren.push(playerBox);
      if (transcriptBox) itemChildren.push(transcriptBox);
      itemChildren.push(actionsDiv);
      item.append(...itemChildren);
      resQuestionList.appendChild(item);
    });
  }

  async function stopExamConfirm() {
    if (confirm(t('speaking.sim.confirmStop'))) {
      state.isStoppedEarly = true;
      state.singleRetryIndex = null;
      await finishExam();
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

  if (btnFontSmaller) {
    btnFontSmaller.addEventListener('click', () => {
      state.fontSize = Math.max(0.85, parseFloat((state.fontSize - 0.15).toFixed(2)));
      if (simQuestionText) simQuestionText.style.fontSize = `${state.fontSize}rem`;
    });
  }

  if (btnFontBigger) {
    btnFontBigger.addEventListener('click', () => {
      state.fontSize = Math.min(2.2, parseFloat((state.fontSize + 0.15).toFixed(2)));
      if (simQuestionText) simQuestionText.style.fontSize = `${state.fontSize}rem`;
    });
  }

  if (btnToggleHide) {
    btnToggleHide.addEventListener('click', () => {
      state.isTextHidden = !state.isTextHidden;
      applyTextHiddenState();
    });
  }

  // 버튼 이벤트 연결
  if (btnMicTest) btnMicTest.addEventListener('click', testMicrophonePermission);
  if (startExamBtn) {
    startExamBtn.addEventListener('click', () => {
      unlockAudioAndTtsForIOS();
      startExam();
    });
  }
  if (btnPauseResume) btnPauseResume.addEventListener('click', togglePause);
  if (btnReplayVoice) {
    btnReplayVoice.addEventListener('click', () => {
      const currentQ = state.queue[state.currentIndex];
      speakText(currentQ);
    });
  }
  if (btnResetCurrentQ) {
    btnResetCurrentQ.addEventListener('click', () => {
      if (confirm(t('speaking.sim.confirmResetCurrent'))) {
        stopSpeaking();
        clearInterval(state.timerInterval);
        stopQuestionStt();
        if (state.activeRecorder) {
          try { state.activeRecorder.stop(); } catch (e) {}
          state.activeRecorder = null;
        }
        resetQuestionData(state.currentIndex);
        state.speakingStartTime = null;
        loadQuestion(state.currentIndex);
      }
    });
  }
  if (btnSkipBreak) {
    btnSkipBreak.addEventListener('click', () => {
      clearInterval(state.timerInterval);
      stopQuestionStt();
      loadQuestion(state.currentIndex + 1);
    });
  }
  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', async () => {
      stopSpeaking();
      recordSpeakingTime(state.currentIndex);
      stopQuestionStt();
      await stopQuestionRecording();
      clearInterval(state.timerInterval);
      if (state.singleRetryIndex !== null) {
        state.singleRetryIndex = null;
        await finishExam();
        return;
      }
      loadQuestion(state.currentIndex + 1);
    });
  }
  if (btnPrevQuestion) {
    btnPrevQuestion.addEventListener('click', async () => {
      stopSpeaking();
      recordSpeakingTime(state.currentIndex);
      stopQuestionStt();
      await stopQuestionRecording();
      clearInterval(state.timerInterval);
      if (state.singleRetryIndex !== null) {
        state.singleRetryIndex = null;
        await finishExam();
        return;
      }
      loadQuestion(Math.max(0, state.currentIndex - 1));
    });
  }
  if (btnStopExam) btnStopExam.addEventListener('click', stopExamConfirm);

  if (btnRetryExam) {
    btnRetryExam.addEventListener('click', () => {
      if (confirm(t('speaking.result.confirmRetryExam'))) {
        unlockAudioAndTtsForIOS();
        stopUserVoicePlayback();
        startExam();
      }
    });
  }
  if (btnBackToSetup) {
    btnBackToSetup.addEventListener('click', () => {
      stopUserVoicePlayback();
      returnToSetupView();
    });
  }

  // 녹음 일괄 다운로드: ZIP 압축 파일
  if (btnBatchDownloadZip) {
    btnBatchDownloadZip.addEventListener('click', async () => {
      if (!state.recordings) return;
      const recEntries = Object.entries(state.recordings)
        .filter(([idx, rec]) => rec && rec.blob)
        .map(([idx, rec]) => ({
          idx: parseInt(idx, 10),
          rec,
          question: (state.queue && state.queue[idx]) ? state.queue[idx] : `Question_${parseInt(idx, 10) + 1}`
        }))
        .sort((a, b) => a.idx - b.idx);

      if (recEntries.length === 0) {
        alert(t('speaking.result.noRecording') || '다운로드할 녹음 파일이 없습니다.');
        return;
      }

      const originalHtml = btnBatchDownloadZip.innerHTML;
      btnBatchDownloadZip.disabled = true;
      if (btnBatchDownloadSeq) btnBatchDownloadSeq.disabled = true;

      const targetFormat = audioFormatSelect ? audioFormatSelect.value : 'auto';

      try {
        const filesForZip = [];
        for (let i = 0; i < recEntries.length; i++) {
          const item = recEntries[i];
          btnBatchDownloadZip.innerHTML = `<span class="batch-btn-icon">⏳</span> <span class="batch-btn-text">${t('speaking.result.converting', { current: i + 1, total: recEntries.length })}</span>`;
          const targetExt = (targetFormat && targetFormat !== 'auto') ? targetFormat : item.rec.ext;
          const { blob: outBlob, ext: outExt } = await convertBlobToTargetFormat(item.rec.blob, targetExt, item.rec.ext);
          const fileName = buildAudioDownloadFilename(item.question, item.idx, outExt);
          const arrayBuffer = await outBlob.arrayBuffer();
          filesForZip.push({
            name: fileName,
            data: new Uint8Array(arrayBuffer)
          });
        }

        const zipBlob = createZipBlob(filesForZip);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        downloadBlobAsFile(zipBlob, `Wanzi_Speaking_Recordings_${dateStr}.zip`);
      } catch (err) {
        console.error('ZIP generation error:', err);
        alert('ZIP 파일 압축 중 오류가 발생했습니다: ' + (err.message || err));
      } finally {
        btnBatchDownloadZip.innerHTML = originalHtml;
        btnBatchDownloadZip.disabled = false;
        if (btnBatchDownloadSeq) btnBatchDownloadSeq.disabled = false;
      }
    });
  }

  // 녹음 일괄 다운로드: 개별 파일 순차 다운로드
  if (btnBatchDownloadSeq) {
    btnBatchDownloadSeq.addEventListener('click', async () => {
      if (!state.recordings) return;
      const recEntries = Object.entries(state.recordings)
        .filter(([idx, rec]) => rec && rec.blob)
        .map(([idx, rec]) => ({
          idx: parseInt(idx, 10),
          rec,
          question: (state.queue && state.queue[idx]) ? state.queue[idx] : `Question_${parseInt(idx, 10) + 1}`
        }))
        .sort((a, b) => a.idx - b.idx);

      if (recEntries.length === 0) {
        alert(t('speaking.result.noRecording') || '다운로드할 녹음 파일이 없습니다.');
        return;
      }

      const originalHtml = btnBatchDownloadSeq.innerHTML;
      btnBatchDownloadSeq.disabled = true;
      if (btnBatchDownloadZip) btnBatchDownloadZip.disabled = true;

      const targetFormat = audioFormatSelect ? audioFormatSelect.value : 'auto';

      try {
        for (let i = 0; i < recEntries.length; i++) {
          const item = recEntries[i];
          btnBatchDownloadSeq.innerHTML = `<span class="batch-btn-icon">⏳</span> <span class="batch-btn-text">${t('speaking.result.downloadingSeq', { current: i + 1, total: recEntries.length })}</span>`;
          const targetExt = (targetFormat && targetFormat !== 'auto') ? targetFormat : item.rec.ext;
          const { blob: outBlob, ext: outExt } = await convertBlobToTargetFormat(item.rec.blob, targetExt, item.rec.ext);
          const fileName = buildAudioDownloadFilename(item.question, item.idx, outExt);
          downloadBlobAsFile(outBlob, fileName);
          // 브라우저 팝업 차단 방지 및 파일 디스패처 여유를 위한 450ms 지연
          if (i < recEntries.length - 1) {
            await new Promise(r => setTimeout(r, 450));
          }
        }
      } catch (err) {
        console.error('Sequential download error:', err);
      } finally {
        btnBatchDownloadSeq.innerHTML = originalHtml;
        btnBatchDownloadSeq.disabled = false;
        if (btnBatchDownloadZip) btnBatchDownloadZip.disabled = false;
      }
    });
  }

  // 브라우저 '뒤로가기' 버튼 감지 (시험 진행 중이거나 결과 화면에서 뒤로가기 누를 시 설정 화면으로 안전하게 복귀)
  window.addEventListener('popstate', (e) => {
    if (simulatorView && resultCard) {
      const isExamOrResult = !simulatorView.classList.contains('hidden') || !resultCard.classList.contains('hidden');
      if (isExamOrResult) {
        returnToSetupView(true);
      }
    }
  });

  // =========================================================================
  // 13. 상단 모드 전환 탭 & 스크립트 TTS 쉐도잉 스튜디오 (Shadowing Studio)
  // =========================================================================
  const SHADOW_STORAGE_KEY = 'wanzi_shadowing_studio_v1';

  const SHADOW_SAMPLE_SCRIPTS = {
    en: [
      '제가 가장 기억에 남는 여행지는 제주도입니다.',
      'One of the most memorable trips I have ever taken was to Jeju Island in South Korea.',
      '작년 여름에 가족들과 함께 기분 전환을 하러 3박 4일 동안 다녀왔습니다.',
      'I went there with my family last summer for four days just to get away from our busy daily routine.',
      '우리는 에메랄드빛 해변을 따라 산책하고 맛있는 현지 해산물 요리를 먹었습니다.',
      'We walked along the beautiful beaches and enjoyed delicious local seafood dishes every evening.',
      '그중에서도 성산일출봉 정상에서 바라본 일출은 정말 숨이 멎을 만큼 아름다웠습니다.',
      'Above all, watching the sunrise from the top of Seongsan Ilchulbong was truly breathtaking.',
      '이 여행 덕분에 가족들과 더 가까워질 수 있었고 조만간 꼭 다시 방문하고 싶습니다.',
      'Thanks to this trip, I was able to recharge my batteries, and I would love to visit there again soon.'
    ].join('\n'),
    zh: [
      '제가 가장 좋아하는 여가 활동은 주말에 공원을 산책하며 사진을 찍는 것입니다.',
      '我最喜欢的业余活动是周末去公园散步和拍照。',
      '평일에는 업무와 공부로 바쁘기 때문에 자연 속에서 시간을 보내면 스트레스가 풀립니다.',
      '因为平时工作和学习都很忙，在大自然中度过时光能帮我缓解压力。',
      '특히 계절마다 변하는 풍경을 카메라에 담을 때 큰 성취감을 느낍니다.',
      '特别是用相机记录下四季变化的风景时，我感到非常有成就感。'
    ].join('\n'),
    ja: [
      '제가 가장 기억에 남는 여행지는 제주도입니다.',
      '私にとって一番記憶に残っている旅行先はチェジュ島です。',
      '작년 여름에 가족들과 함께 리프레시를 위해 3박 4일로 다녀왔습니다.',
      '去年の夏、家族と一緒にリフレッシュするために3泊4日で行ってきました。',
      '아름다운 해변을 산책하고 맛있는 해산물 요리도 많이 먹었습니다.',
      '美しい海岸を散歩したり、おいしい海鮮料理もたくさん食べました。'
    ].join('\n')
  };

  function getDefaultShadowSample(langCode) {
    if (langCode === 'zh') return SHADOW_SAMPLE_SCRIPTS.zh;
    if (langCode === 'ja') return SHADOW_SAMPLE_SCRIPTS.ja;
    return SHADOW_SAMPLE_SCRIPTS.en;
  }

  let shadowState = {
    activeMode: 'exam', // 'exam' | 'shadow'
    activeScriptId: 'sample',
    sampleContent: '',
    customScripts: [],
    splitBySentence: true,
    targetSec: 120,
    rate: 1.0,
    pauseMode: 'auto',
    sentenceRepeat: 1,
    loopMode: 1,
    maxTimeSec: 0,
    maskMode: 'none', // 'none' | 'foreign' | 'all'
    sentences: [],
    totalEstSec: 0,
    // Playback runtime state
    playMode: 'shadow', // 'shadow' | 'listen'
    isPlaying: false,
    isPaused: false,
    isWaitingShadow: false,
    currentIdx: 0,
    currentRepeatCount: 0,
    currentLoopCount: 0,
    singleLoopIdx: null,
    waitInterval: null,
    waitTimeout: null,
    maxTimerInterval: null,
    maxTimerRemainingSec: 0,
    // Voice Recording in Shadowing Studio
    isRecording: false,
    recStream: null,
    recMediaRecorder: null,
    recStartTime: 0,
    recTimerInterval: null,
    recUrl: null,
    recDurationSec: 0,
    activeSentenceRecIdx: null,
    sentenceRecordings: {}
  };

  function saveShadowSettings() {
    if (!shadowScriptInput) return;
    if (shadowState.activeScriptId === 'sample') {
      shadowState.sampleContent = shadowScriptInput.value;
    } else {
      const found = shadowState.customScripts.find(s => s.id === shadowState.activeScriptId);
      if (found) found.content = shadowScriptInput.value;
    }

    const payload = {
      activeMode: shadowState.activeMode,
      activeScriptId: shadowState.activeScriptId,
      sampleContent: shadowState.sampleContent,
      customScripts: shadowState.customScripts,
      splitBySentence: shadowSplitSentenceCheck ? shadowSplitSentenceCheck.checked : true,
      targetSec: shadowTargetSecSelect ? parseInt(shadowTargetSecSelect.value, 10) : 120,
      rate: shadowRateSlider ? parseFloat(shadowRateSlider.value) : 1.0,
      pauseMode: shadowPauseSelect ? shadowPauseSelect.value : 'auto',
      sentenceRepeat: shadowSentenceRepeatSelect ? parseInt(shadowSentenceRepeatSelect.value, 10) : 1,
      loopMode: shadowLoopSelect ? parseInt(shadowLoopSelect.value, 10) : 1,
      maxTimeSec: shadowMaxTimeSelect ? parseInt(shadowMaxTimeSelect.value, 10) : 0,
      maskMode: shadowState.maskMode
    };
    try {
      localStorage.setItem(SHADOW_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function loadShadowSettings() {
    if (!shadowScriptInput) return;
    try {
      const raw = localStorage.getItem(SHADOW_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        shadowState.activeMode = data.activeMode || 'exam';
        shadowState.activeScriptId = data.activeScriptId || 'sample';
        shadowState.sampleContent = data.sampleContent !== undefined ? data.sampleContent : getDefaultShadowSample(state.autoTargetLang);
        shadowState.customScripts = Array.isArray(data.customScripts) ? data.customScripts : [];
        shadowState.splitBySentence = data.splitBySentence !== undefined ? Boolean(data.splitBySentence) : true;
        shadowState.targetSec = data.targetSec !== undefined ? Number(data.targetSec) : 120;
        shadowState.rate = data.rate !== undefined ? Number(data.rate) : (ttsRateSlider ? parseFloat(ttsRateSlider.value) : 1.0);
        shadowState.pauseMode = data.pauseMode !== undefined ? String(data.pauseMode) : 'auto';
        shadowState.sentenceRepeat = data.sentenceRepeat !== undefined ? Number(data.sentenceRepeat) : 1;
        shadowState.loopMode = data.loopMode !== undefined ? Number(data.loopMode) : 1;
        shadowState.maxTimeSec = data.maxTimeSec !== undefined ? Number(data.maxTimeSec) : 0;
        shadowState.maskMode = data.maskMode || 'none';
      } else {
        shadowState.sampleContent = getDefaultShadowSample(state.autoTargetLang);
        shadowState.rate = ttsRateSlider ? parseFloat(ttsRateSlider.value) || 1.0 : 1.0;
      }
    } catch (e) {
      shadowState.sampleContent = getDefaultShadowSample(state.autoTargetLang);
    }

    if (shadowSplitSentenceCheck) shadowSplitSentenceCheck.checked = shadowState.splitBySentence;
    if (shadowTargetSecSelect) shadowTargetSecSelect.value = String(shadowState.targetSec);
    if (shadowRateSlider) shadowRateSlider.value = String(shadowState.rate);
    if (shadowRateVal) shadowRateVal.textContent = `${shadowState.rate.toFixed(1)}x`;
    updateShadowRatePills(shadowState.rate);
    if (shadowPauseSelect) shadowPauseSelect.value = shadowState.pauseMode;
    if (shadowSentenceRepeatSelect) shadowSentenceRepeatSelect.value = String(shadowState.sentenceRepeat);
    if (shadowLoopSelect) shadowLoopSelect.value = String(shadowState.loopMode);
    if (shadowMaxTimeSelect) shadowMaxTimeSelect.value = String(shadowState.maxTimeSec);

    document.querySelectorAll('.shadow-mask-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mask') === shadowState.maskMode);
    });

    shadowScriptInput.value = getActiveShadowScriptContent();
    renderShadowDeckTabs();
    syncShadowVoiceUI();
    updateShadowStatsAndCards();

    if (modeTabExam && modeTabShadow && (location.hash === '#shadowing' || shadowState.activeMode === 'shadow')) {
      switchMainMode('shadow', true);
    }
  }

  function getActiveShadowScriptContent() {
    if (shadowState.activeScriptId === 'sample') {
      return shadowState.sampleContent || getDefaultShadowSample(state.autoTargetLang);
    }
    const found = shadowState.customScripts.find(s => s.id === shadowState.activeScriptId);
    return found ? (found.content || '') : '';
  }

  function renderShadowDeckTabs() {
    if (!shadowDeckTabsList) return;
    shadowDeckTabsList.innerHTML = '';

    const sampleSentences = parseScriptSentences(
      shadowState.sampleContent || getDefaultShadowSample(state.autoTargetLang),
      shadowSplitSentenceCheck ? shadowSplitSentenceCheck.checked : true
    );

    const sampleTab = document.createElement('button');
    sampleTab.type = 'button';
    sampleTab.className = `deck-tab ${shadowState.activeScriptId === 'sample' ? 'active' : ''}`;
    sampleTab.innerHTML = `
      <span class="deck-tab-name">${escapeHtml(t('shadow.deck.sample'))}</span>
      <span class="deck-tab-count">${sampleSentences.length}</span>
    `;
    sampleTab.addEventListener('click', () => {
      switchShadowDeck('sample');
    });
    shadowDeckTabsList.appendChild(sampleTab);

    shadowState.customScripts.forEach(deck => {
      const sents = parseScriptSentences(deck.content || '', shadowSplitSentenceCheck ? shadowSplitSentenceCheck.checked : true);
      const tab = document.createElement('div');
      tab.className = `deck-tab ${shadowState.activeScriptId === deck.id ? 'active' : ''}`;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'deck-tab-name';
      nameSpan.textContent = deck.name || t('shadow.deck.defaultName');

      const countSpan = document.createElement('span');
      countSpan.className = 'deck-tab-count';
      countSpan.textContent = sents.length;

      const renameBtn = document.createElement('button');
      renameBtn.type = 'button';
      renameBtn.className = 'deck-tab-rename';
      renameBtn.innerHTML = '✏️';
      renameBtn.title = t('speaking.step1.renameList');
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextName = prompt(t('speaking.step1.renameListPrompt'), deck.name || '');
        if (nextName && nextName.trim()) {
          deck.name = nextName.trim();
          saveShadowSettings();
          renderShadowDeckTabs();
        }
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'deck-tab-del';
      delBtn.innerHTML = '&times;';
      delBtn.title = t('speaking.step1.clear');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(t('speaking.step1.confirmDeleteList', { name: deck.name }))) return;
        shadowState.customScripts = shadowState.customScripts.filter(d => d.id !== deck.id);
        if (shadowState.activeScriptId === deck.id) {
          shadowState.activeScriptId = shadowState.customScripts.length > 0
            ? shadowState.customScripts[shadowState.customScripts.length - 1].id
            : 'sample';
          shadowScriptInput.value = getActiveShadowScriptContent();
          updateShadowStatsAndCards();
        }
        saveShadowSettings();
        renderShadowDeckTabs();
      });

      tab.append(nameSpan, countSpan, renameBtn, delBtn);
      tab.addEventListener('click', () => switchShadowDeck(deck.id));
      shadowDeckTabsList.appendChild(tab);
    });
  }

  function switchShadowDeck(deckId) {
    if (shadowState.activeScriptId === deckId) return;
    stopShadowPlayback();
    saveShadowSettings();
    shadowState.activeScriptId = deckId;
    shadowScriptInput.value = getActiveShadowScriptContent();
    updateShadowStatsAndCards();
    saveShadowSettings();
    renderShadowDeckTabs();
  }

  function syncShadowVoiceUI() {
    if (!shadowTargetLangSelect) return;
    const targetLang = state.autoTargetLang || 'en';
    const options = getAvailableTargetOptions();
    shadowTargetLangSelect.innerHTML = options
      .map(opt => `<option value="${opt.value}" ${targetLang === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
      .join('');

    if (shadowActiveVoiceBadge) {
      const selectedMode = voiceSelect ? voiceSelect.value : 'auto';
      if (selectedMode !== 'auto') {
        shadowActiveVoiceBadge.textContent = `🎙️ ${selectedMode}`;
      } else {
        const meta = getLangMeta(targetLang === 'all' ? 'en' : targetLang);
        const bestVoice = getBestVoiceForLang(targetLang === 'all' ? 'en' : targetLang);
        const vName = bestVoice ? bestVoice.name.replace(/Microsoft |Google |Apple /gi, '') : 'Default';
        shadowActiveVoiceBadge.textContent = `${meta.flag} ${vName}`;
        shadowActiveVoiceBadge.title = bestVoice ? bestVoice.name : '';
      }
    }
  }

  // 문장 단위 파싱 및 문장별 예상 발화 시간 계산
  function parseScriptSentences(rawText, splitByPunctuation = true) {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rawSentences = [];

    lines.forEach(line => {
      // 앞번호 정리 (예: 1. / Q1: 등)
      const cleaned = line.replace(/^\s*(?:Q\d+|문항\s*\d+|\d+)\s*[.):\-]\s*/i, '').trim() || line;
      if (!splitByPunctuation) {
        rawSentences.push(cleaned);
        return;
      }
      // 영어 약어(Mr., Mrs., Ms., Dr., Prof., St., Jr., Sr., vs., etc., e.g., i.e., No., Fig., U.S., U.K.)의 마침표 임시 치환
      const DOT_TOKEN = '\uE000';
      const protectedLine = cleaned
        .replace(/\b(Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc|No|Fig|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec)\./gi, `$1${DOT_TOKEN}`)
        .replace(/\b(e\.g|i\.e|U\.S|U\.K|a\.m|p\.m)\./gi, m => m.replace(/\./g, DOT_TOKEN));

      // 마침표, 물음표, 느낌표(동양권 구두점 포함) 기준 문장 분리
      const parts = protectedLine
        .replace(/([.?!。？！]+)(?=\s+|$)/g, '$1\u0000')
        .split('\u0000')
        .map(s => s.replace(/\uE000/g, '.').trim())
        .filter(Boolean);
      parts.forEach(p => rawSentences.push(p));
    });

    const rate = shadowState.rate || 1.0;

    return rawSentences.map((text, idx) => {
      const segs = segmentMixedText(text);
      const hasForeign = segs.some(s => s.lang !== 'ko');
      const hasKorean = segs.some(s => s.lang === 'ko');
      const primaryLang = hasForeign
        ? (segs.find(s => s.lang !== 'ko')?.lang || state.autoTargetLang || 'en')
        : 'ko';

      // 발화 시간 정밀 추정: 한글/한자/가나는 글자 수 기반(초당 약 4.3자), 알파벳/키릴 등 공백 구분 언어는 단어 수 기반(초당 약 2.4단어 = 144 WPM)
      const cjkChars = (text.match(/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/g) || []).length;
      const nonCjkText = text.replace(/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/g, ' ').trim();
      const spaceWords = nonCjkText ? nonCjkText.split(/\s+/).filter(Boolean).length : 0;

      const baseSeconds = (cjkChars / 4.3) + (spaceWords / 2.4) + 0.35;
      const estSec = Math.max(0.8, baseSeconds / rate);

      return {
        idx,
        text,
        primaryLang,
        hasForeign,
        hasKorean,
        estSec,
        cjkChars,
        spaceWords
      };
    });
  }

  function formatDurationKo(totalSec) {
    const sec = Math.max(0, Math.round(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return t('shadow.stat.estMinSec', { min: m, sec: s });
    return t('shadow.stat.estSec', { sec: s });
  }

  function updateShadowStatsAndCards() {
    if (!shadowScriptInput) return;
    const raw = shadowScriptInput.value || '';
    const splitByPunct = shadowSplitSentenceCheck ? shadowSplitSentenceCheck.checked : true;
    const sentences = parseScriptSentences(raw, splitByPunct);
    shadowState.sentences = sentences;

    const charCount = raw.replace(/\s+/g, '').length;
    const wordCount = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    const totalEstSec = sentences.reduce((acc, s) => acc + s.estSec, 0);
    shadowState.totalEstSec = totalEstSec;

    if (shadowStatSentences) shadowStatSentences.textContent = t('shadow.stat.sentenceUnit', { count: sentences.length });
    if (shadowStatWords) shadowStatWords.textContent = t('shadow.stat.wordCharUnit', { words: wordCount, chars: charCount });
    if (shadowStatRateTag) shadowStatRateTag.textContent = `(${shadowState.rate.toFixed(1)}x)`;
    if (shadowStatDuration) shadowStatDuration.textContent = formatDurationKo(totalEstSec);

    if (shadowRecStatsBadge) {
      if (shadowState.recDurationSec > 0) {
        const diff = Math.round(shadowState.recDurationSec - totalEstSec);
        const diffStr = diff > 0 ? `+${diff}s` : `${diff}s`;
        shadowRecStatsBadge.textContent = t('shadow.rec.compareBadge', {
          mySec: Math.round(shadowState.recDurationSec),
          ttsSec: Math.round(totalEstSec),
          diff: diffStr
        });
      } else {
        shadowRecStatsBadge.textContent = `TTS: ${formatDurationKo(totalEstSec)}`;
      }
    }

    // 목표 답변 시간 대비 게이지 업데이트
    const targetSec = shadowTargetSecSelect ? parseInt(shadowTargetSecSelect.value, 10) || 0 : 0;
    shadowState.targetSec = targetSec;

    if (shadowTargetFeedback && shadowTargetProgressFill) {
      if (targetSec <= 0 || sentences.length === 0) {
        shadowTargetFeedback.className = 'shadow-target-feedback';
        shadowTargetFeedback.textContent = sentences.length === 0 ? t('shadow.gauge.empty') : t('shadow.gauge.free');
        shadowTargetProgressFill.style.width = sentences.length === 0 ? '0%' : '100%';
        shadowTargetProgressFill.className = 'shadow-target-progress-fill';
      } else {
        const ratio = totalEstSec / targetSec;
        const pct = Math.min(100, Math.round(ratio * 100));
        shadowTargetProgressFill.style.width = `${pct}%`;

        if (ratio < 0.7) {
          shadowTargetFeedback.className = 'shadow-target-feedback short';
          shadowTargetProgressFill.className = 'shadow-target-progress-fill short';
          shadowTargetFeedback.textContent = t('shadow.gauge.short', { target: targetSec, est: Math.round(totalEstSec), pct: Math.round(ratio * 100) });
        } else if (ratio <= 1.1) {
          shadowTargetFeedback.className = 'shadow-target-feedback good';
          shadowTargetProgressFill.className = 'shadow-target-progress-fill';
          shadowTargetFeedback.textContent = t('shadow.gauge.good', { target: targetSec, est: Math.round(totalEstSec), pct: Math.round(ratio * 100) });
        } else {
          shadowTargetFeedback.className = 'shadow-target-feedback over';
          shadowTargetProgressFill.className = 'shadow-target-progress-fill over';
          shadowTargetFeedback.textContent = t('shadow.gauge.over', { target: targetSec, est: Math.round(totalEstSec), pct: Math.round(ratio * 100) });
        }
      }
    }

    renderShadowSentenceCards();
  }

  function renderShadowSentenceCards() {
    if (!shadowSentenceList) return;
    shadowSentenceList.innerHTML = '';

    if (shadowState.sentences.length === 0) {
      shadowSentenceList.innerHTML = `
        <div style="text-align:center; padding: 2rem 1rem; color: #94a3b8; font-size: 0.9rem;">
          ${escapeHtml(t('shadow.card.emptyHint'))}
        </div>
      `;
      return;
    }

    shadowState.sentences.forEach((item, idx) => {
      const card = document.createElement('div');
      const isCurrent = shadowState.isPlaying && shadowState.currentIdx === idx;
      card.className = `shadow-sentence-card ${isCurrent ? (shadowState.isWaitingShadow ? 'waiting-shadow' : 'active') : ''}`;
      card.setAttribute('data-idx', String(idx));

      const meta = getLangMeta(item.primaryLang);
      const shouldMask = shadowState.maskMode === 'all' || (shadowState.maskMode === 'foreign' && item.hasForeign);

      const leftDiv = document.createElement('div');
      leftDiv.className = 'shadow-sentence-left';

      const numBadge = document.createElement('span');
      numBadge.className = 'shadow-sentence-num';
      numBadge.textContent = `#${idx + 1}`;

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'shadow-sentence-body';

      const textEl = document.createElement('div');
      textEl.className = `shadow-sentence-text ${shouldMask ? 'is-masked' : ''}`;
      textEl.textContent = item.text;

      const sentRec = shadowState.sentenceRecordings && shadowState.sentenceRecordings[idx];
      const recCompareHtml = sentRec
        ? `<span>·</span><span style="color:#2563eb;font-weight:700;">🎙️ ${escapeHtml(t('shadow.card.vsCompare', { tts: item.estSec.toFixed(1), my: sentRec.durationSec.toFixed(1) }))}</span>`
        : `<span>·</span><span>⏱️ ~${item.estSec.toFixed(1)}s</span>`;

      const metaRow = document.createElement('div');
      metaRow.className = 'shadow-sentence-meta';
      metaRow.innerHTML = `
        <span>${meta.flag} ${escapeHtml(meta.shortName || meta.name)}</span>
        ${recCompareHtml}
      `;

      bodyDiv.append(textEl, metaRow);
      leftDiv.append(numBadge, bodyDiv);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'shadow-sentence-actions';

      if (shouldMask) {
        const peekBtn = document.createElement('button');
        peekBtn.type = 'button';
        peekBtn.className = 'btn-shadow-card-action';
        peekBtn.textContent = t('shadow.card.peek');
        peekBtn.title = t('shadow.card.peek');
        peekBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          textEl.classList.toggle('peek');
        });
        actionsDiv.appendChild(peekBtn);
      }

      const playFromHereBtn = document.createElement('button');
      playFromHereBtn.type = 'button';
      playFromHereBtn.className = 'btn-shadow-card-action';
      playFromHereBtn.textContent = t('shadow.card.listen');
      playFromHereBtn.title = t('shadow.card.listen');
      playFromHereBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shadowState.singleLoopIdx = null;
        startShadowPlayback(idx);
      });

      const loopOneBtn = document.createElement('button');
      loopOneBtn.type = 'button';
      const isLoopingThis = shadowState.isPlaying && shadowState.singleLoopIdx === idx;
      loopOneBtn.className = `btn-shadow-card-action ${isLoopingThis ? 'loop-active' : ''}`;
      loopOneBtn.textContent = isLoopingThis ? t('shadow.card.looping') : t('shadow.card.loopOne');
      loopOneBtn.title = t('shadow.card.loopOne');
      loopOneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (shadowState.isPlaying && shadowState.singleLoopIdx === idx) {
          shadowState.singleLoopIdx = null;
          stopShadowPlayback();
        } else {
          shadowState.singleLoopIdx = idx;
          startShadowPlayback(idx);
        }
      });

      // 문장별 내 발음 녹음 버튼 (🎤)
      const isRecThis = shadowState.isRecording && shadowState.activeSentenceRecIdx === idx;
      const recSentenceBtn = document.createElement('button');
      recSentenceBtn.type = 'button';
      recSentenceBtn.className = `btn-shadow-card-action ${isRecThis ? 'loop-active' : ''}`;
      recSentenceBtn.textContent = isRecThis ? '⏹' : '🎤';
      recSentenceBtn.title = t('shadow.card.recSentenceTitle');
      recSentenceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSentenceVoiceRecording(idx);
      });

      actionsDiv.append(playFromHereBtn, loopOneBtn, recSentenceBtn);

      if (sentRec && sentRec.url) {
        const playMySentBtn = document.createElement('button');
        playMySentBtn.type = 'button';
        playMySentBtn.className = 'btn-shadow-card-action';
        playMySentBtn.innerHTML = `▶️ <span>${escapeHtml(t('shadow.card.myVoice'))}</span>`;
        playMySentBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          stopShadowPlayback();
          toggleUserVoicePlayback(sentRec.url, playMySentBtn);
        });
        actionsDiv.appendChild(playMySentBtn);
      }

      card.append(leftDiv, actionsDiv);

      card.addEventListener('click', () => {
        shadowState.singleLoopIdx = null;
        startShadowPlayback(idx);
      });

      shadowSentenceList.appendChild(card);
    });
  }

  function clearShadowWaitTimers() {
    if (shadowState.waitInterval) {
      clearInterval(shadowState.waitInterval);
      shadowState.waitInterval = null;
    }
    if (shadowState.waitTimeout) {
      clearTimeout(shadowState.waitTimeout);
      shadowState.waitTimeout = null;
    }
  }

  function stopShadowMaxTimer() {
    if (shadowState.maxTimerInterval) {
      clearInterval(shadowState.maxTimerInterval);
      shadowState.maxTimerInterval = null;
    }
    if (shadowMaxTimerCountdown) {
      shadowMaxTimerCountdown.classList.add('hidden');
    }
  }

  function startShadowMaxTimer() {
    stopShadowMaxTimer();
    const maxSec = shadowMaxTimeSelect ? parseInt(shadowMaxTimeSelect.value, 10) || 0 : 0;
    if (maxSec <= 0) return;

    shadowState.maxTimerRemainingSec = maxSec;
    if (shadowMaxTimerCountdown) {
      shadowMaxTimerCountdown.classList.remove('hidden');
      shadowMaxTimerCountdown.textContent = `⏳ ${formatSeconds(maxSec * 1000)}`;
    }

    shadowState.maxTimerInterval = setInterval(() => {
      if (shadowState.isPaused || !shadowState.isPlaying) return;
      shadowState.maxTimerRemainingSec -= 1;
      if (shadowState.maxTimerRemainingSec <= 0) {
        playSound('finish');
        stopShadowPlayback('⏰ 설정한 최대 재생 시간이 종료되어 자동으로 멈췄습니다.');
        return;
      }
      if (shadowMaxTimerCountdown) {
        shadowMaxTimerCountdown.textContent = `⏳ ${formatSeconds(shadowState.maxTimerRemainingSec * 1000)}`;
      }
    }, 1000);
  }

  function stopShadowPlayback(customMessage) {
    releaseWakeLock();
    stopSpeaking();
    clearShadowWaitTimers();
    stopShadowMaxTimer();
    shadowState.isPlaying = false;
    shadowState.isPaused = false;
    shadowState.isWaitingShadow = false;
    shadowState.singleLoopIdx = null;

    if (btnShadowListenAll) {
      btnShadowListenAll.textContent = t('shadow.step3.listenAll');
      btnShadowListenAll.classList.remove('is-playing');
    }
    if (btnShadowPlayAll) {
      btnShadowPlayAll.textContent = t('shadow.step3.shadowAll');
      btnShadowPlayAll.classList.remove('is-playing');
    }
    if (btnShadowPause) btnShadowPause.classList.add('hidden');
    if (btnShadowStop) btnShadowStop.disabled = true;
    if (shadowStatusBanner) shadowStatusBanner.classList.remove('waiting');
    if (shadowWaitBarWrap) shadowWaitBarWrap.classList.add('hidden');
    if (shadowStatusText) {
      shadowStatusText.innerHTML = customMessage || t('shadow.step3.readyBanner');
    }
    renderShadowSentenceCards();
  }

  async function startShadowPlayback(startIdx = 0, mode = null) {
    updateShadowStatsAndCards();
    if (shadowState.sentences.length === 0) {
      alert('낭독할 스크립트 대본을 먼저 입력해주세요.');
      if (shadowScriptInput) shadowScriptInput.focus();
      return;
    }

    if (mode === 'listen' || mode === 'shadow') {
      shadowState.playMode = mode;
    }

    try {
      await requestWakeLock();
    } catch (e) {}

    stopSpeaking();
    clearShadowWaitTimers();

    if (!shadowState.isPlaying) {
      startShadowMaxTimer();
      shadowState.currentLoopCount = 0;
    }

    shadowState.isPlaying = true;
    shadowState.isPaused = false;
    shadowState.isWaitingShadow = false;
    shadowState.currentIdx = Math.max(0, Math.min(shadowState.sentences.length - 1, startIdx));
    shadowState.currentRepeatCount = 0;

    if (shadowState.playMode === 'listen') {
      if (btnShadowListenAll) {
        btnShadowListenAll.textContent = t('shadow.step3.listeningActive');
        btnShadowListenAll.classList.add('is-playing');
      }
      if (btnShadowPlayAll) {
        btnShadowPlayAll.textContent = t('shadow.step3.shadowAll');
        btnShadowPlayAll.classList.remove('is-playing');
      }
    } else {
      if (btnShadowPlayAll) {
        btnShadowPlayAll.textContent = t('shadow.step3.shadowingActive');
        btnShadowPlayAll.classList.add('is-playing');
      }
      if (btnShadowListenAll) {
        btnShadowListenAll.textContent = t('shadow.step3.listenAll');
        btnShadowListenAll.classList.remove('is-playing');
      }
    }

    if (btnShadowPause) {
      btnShadowPause.classList.remove('hidden');
      btnShadowPause.textContent = '⏸ 일시정지';
    }
    if (btnShadowStop) btnShadowStop.disabled = false;

    playCurrentShadowSentence();
  }

  function playCurrentShadowSentence() {
    if (!shadowState.isPlaying || shadowState.isPaused) return;
    clearShadowWaitTimers();
    shadowState.isWaitingShadow = false;
    if (shadowStatusBanner) shadowStatusBanner.classList.remove('waiting');
    if (shadowWaitBarWrap) shadowWaitBarWrap.classList.add('hidden');

    const idx = shadowState.currentIdx;
    const item = shadowState.sentences[idx];
    if (!item) {
      stopShadowPlayback('🎉 스크립트 낭독을 모두 마쳤습니다!');
      return;
    }

    renderShadowSentenceCards();
    const activeCard = shadowSentenceList ? shadowSentenceList.querySelector(`.shadow-sentence-card[data-idx="${idx}"]`) : null;
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const totalRepeat = shadowSentenceRepeatSelect ? parseInt(shadowSentenceRepeatSelect.value, 10) || 1 : 1;
    const repeatLabel = totalRepeat > 1 ? ` (${shadowState.currentRepeatCount + 1}/${totalRepeat}회)` : '';
    const modeBadge = shadowState.playMode === 'listen' ? '🎧 [본문만 듣기]' : '🗣️ [쉐도잉 모드]';
    const modeLabel = shadowState.singleLoopIdx !== null ? '🔁 [1문장 집중 반복]' : `${modeBadge} 문장 ${idx + 1} / ${shadowState.sentences.length}`;

    if (shadowStatusText) {
      shadowStatusText.innerHTML = `<strong>${modeLabel}${repeatLabel}</strong> 원어민 음성 낭독 중...`;
    }

    const speakStartMs = Date.now();
    speakText(item.text, () => {
      if (!shadowState.isPlaying || shadowState.isPaused) return;
      const actualSpokenMs = Math.max(800, Date.now() - speakStartMs);
      handleAfterShadowSentenceSpoken(actualSpokenMs, item);
    }, shadowState.rate);
  }

  function handleAfterShadowSentenceSpoken(spokenMs, item) {
    if (!shadowState.isPlaying || shadowState.isPaused) return;

    // 본문만 연속 듣기 모드: 쉬는 시간 없이 자연스러운 180ms 호흡 후 바로 다음 문장으로 진행
    if (shadowState.playMode === 'listen') {
      shadowState.waitTimeout = setTimeout(() => {
        advanceToNextShadowStep();
      }, 180);
      return;
    }

    const pauseVal = shadowPauseSelect ? shadowPauseSelect.value : 'auto';
    let waitMs = 120;
    if (pauseVal === 'auto') {
      waitMs = Math.max(1400, Math.min(18000, Math.round(spokenMs * 1.15)));
    } else {
      const parsedSec = parseFloat(pauseVal) || 0;
      waitMs = parsedSec > 0 ? Math.round(parsedSec * 1000) : 120;
    }

    if (waitMs < 500) {
      advanceToNextShadowStep();
      return;
    }

    // 쉐도잉 따라 말하기 대기 카운트다운 표시
    shadowState.isWaitingShadow = true;
    renderShadowSentenceCards();
    if (shadowStatusBanner) shadowStatusBanner.classList.add('waiting');
    if (shadowWaitBarWrap) shadowWaitBarWrap.classList.remove('hidden');
    if (shadowWaitBarFill) shadowWaitBarFill.style.width = '100%';

    const waitStart = Date.now();
    const updateWaitUI = () => {
      if (!shadowState.isPlaying || shadowState.isPaused) return;
      const elapsed = Date.now() - waitStart;
      const remainMs = Math.max(0, waitMs - elapsed);
      const ratio = remainMs / waitMs;
      if (shadowWaitBarFill) shadowWaitBarFill.style.width = `${Math.round(ratio * 100)}%`;
      if (shadowStatusText) {
        shadowStatusText.innerHTML = `<strong>🗣️ 지금 따라 말해보세요!</strong> (남은 대기 시간: ${(remainMs / 1000).toFixed(1)}초)`;
      }
    };

    updateWaitUI();
    shadowState.waitInterval = setInterval(updateWaitUI, 100);
    shadowState.waitTimeout = setTimeout(() => {
      clearShadowWaitTimers();
      advanceToNextShadowStep();
    }, waitMs);
  }

  function advanceToNextShadowStep() {
    if (!shadowState.isPlaying || shadowState.isPaused) return;

    // 1) 1문장 무한반복 모드인 경우
    if (shadowState.singleLoopIdx !== null) {
      shadowState.currentIdx = shadowState.singleLoopIdx;
      playCurrentShadowSentence();
      return;
    }

    // 2) 문장당 N회 반복 확인
    const maxSentenceRepeat = shadowSentenceRepeatSelect ? parseInt(shadowSentenceRepeatSelect.value, 10) || 1 : 1;
    shadowState.currentRepeatCount += 1;
    if (shadowState.currentRepeatCount < maxSentenceRepeat) {
      playCurrentShadowSentence();
      return;
    }

    // 3) 다음 문장으로 이동
    shadowState.currentRepeatCount = 0;
    if (shadowState.currentIdx + 1 < shadowState.sentences.length) {
      shadowState.currentIdx += 1;
      playCurrentShadowSentence();
      return;
    }

    // 4) 마지막 문장까지 모두 읽은 경우 -> 전체 반복 설정 확인
    const totalLoops = shadowLoopSelect ? parseInt(shadowLoopSelect.value, 10) : 1;
    shadowState.currentLoopCount += 1;
    if (totalLoops === 0 || shadowState.currentLoopCount < totalLoops) {
      shadowState.currentIdx = 0;
      playCurrentShadowSentence();
    } else {
      playSound('finish');
      stopShadowPlayback('🎉 스크립트 전체 낭독을 완료했습니다!');
    }
  }

  function updateShadowRatePills(rateVal) {
    const formatted = Number(rateVal).toFixed(1);
    document.querySelectorAll('#shadowRatePills .preset-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-shadow-rate') === formatted);
    });
  }

  // 상단 탭 전환 (실전 면접 시뮬레이터 <-> 스크립트 쉐도잉 스튜디오)
  function switchMainMode(mode, skipSave = false) {
    shadowState.activeMode = mode === 'shadow' ? 'shadow' : 'exam';
    const isShadow = shadowState.activeMode === 'shadow';

    if (modeTabExam) {
      modeTabExam.classList.toggle('active', !isShadow);
      modeTabExam.setAttribute('aria-selected', isShadow ? 'false' : 'true');
    }
    if (modeTabShadow) {
      modeTabShadow.classList.toggle('active', isShadow);
      modeTabShadow.setAttribute('aria-selected', isShadow ? 'true' : 'false');
    }

    if (isShadow) {
      returnToSetupView(true);
      setupSection.classList.add('hidden');
      simulatorView.classList.add('hidden');
      resultCard.classList.add('hidden');
      if (shadowingSection) shadowingSection.classList.remove('hidden');
      syncShadowVoiceUI();
      updateShadowStatsAndCards();
    } else {
      stopShadowPlayback();
      stopShadowVoiceRecording();
      if (shadowingSection) shadowingSection.classList.add('hidden');
      setupSection.classList.remove('hidden');
      updateVoiceStatusBadge();
    }

    if (!skipSave) saveShadowSettings();
  }

  if (modeTabExam) {
    modeTabExam.addEventListener('click', () => switchMainMode('exam'));
  }
  if (modeTabShadow) {
    modeTabShadow.addEventListener('click', () => switchMainMode('shadow'));
  }

  // 스크립트 입력 및 툴바 이벤트
  if (shadowScriptInput) {
    shadowScriptInput.addEventListener('input', () => {
      updateShadowStatsAndCards();
      saveShadowSettings();
      if (shadowDeckTabsList) {
        const activeCount = shadowDeckTabsList.querySelector('.deck-tab.active .deck-tab-count');
        if (activeCount) activeCount.textContent = shadowState.sentences.length;
      }
    });
  }

  if (btnAddShadowDeck) {
    btnAddShadowDeck.addEventListener('click', () => {
      const defaultName = `내 스크립트 ${shadowState.customScripts.length + 1}`;
      const name = prompt('새 스크립트 노트의 이름을 입력하세요:', defaultName);
      if (!name || !name.trim()) return;
      saveShadowSettings();
      const newId = 'script_' + Date.now();
      shadowState.customScripts.push({ id: newId, name: name.trim(), content: '' });
      shadowState.activeScriptId = newId;
      shadowScriptInput.value = '';
      updateShadowStatsAndCards();
      saveShadowSettings();
      renderShadowDeckTabs();
      shadowScriptInput.focus();
    });
  }

  if (shadowSplitSentenceCheck) {
    shadowSplitSentenceCheck.addEventListener('change', () => {
      shadowState.splitBySentence = shadowSplitSentenceCheck.checked;
      updateShadowStatsAndCards();
      saveShadowSettings();
      renderShadowDeckTabs();
    });
  }

  if (btnPasteShadowScript) {
    btnPasteShadowScript.addEventListener('click', async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const clip = await navigator.clipboard.readText();
          if (!clip || !clip.trim()) {
            alert(t('speaking.step1.pasteEmpty'));
            return;
          }
          shadowScriptInput.value = clip;
          updateShadowStatsAndCards();
          saveShadowSettings();
          renderShadowDeckTabs();
        } catch (err) {
          alert(t('speaking.step1.pasteError'));
        }
      } else {
        alert(t('speaking.step1.pasteError'));
      }
    });
  }

  if (btnClearShadowScript) {
    btnClearShadowScript.addEventListener('click', () => {
      if (shadowScriptInput.value.trim() && !confirm('현재 입력된 스크립트 대본을 모두 지울까요?')) return;
      stopShadowPlayback();
      shadowScriptInput.value = '';
      updateShadowStatsAndCards();
      saveShadowSettings();
      renderShadowDeckTabs();
      shadowScriptInput.focus();
    });
  }

  // 커스텀 리사이즈 핸들 (쉐도잉 대본 입력창)
  if (shadowResizeHandle && shadowScriptInput) {
    let isDragging = false;
    let startY = 0;
    let startH = 0;
    const onMove = (e) => {
      if (!isDragging) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      shadowScriptInput.style.height = `${Math.max(120, Math.min(800, startH + (clientY - startY)))}px`;
    };
    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      shadowResizeHandle.classList.remove('is-dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    const onDown = (e) => {
      isDragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = shadowScriptInput.offsetHeight;
      shadowResizeHandle.classList.add('is-dragging');
      window.addEventListener('mousemove', onMove, { passive: false });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
      e.preventDefault();
    };
    shadowResizeHandle.addEventListener('mousedown', onDown);
    shadowResizeHandle.addEventListener('touchstart', onDown, { passive: false });
    shadowResizeHandle.addEventListener('dblclick', () => {
      shadowScriptInput.style.height = '150px';
    });
  }

  if (shadowTargetSecSelect) {
    shadowTargetSecSelect.addEventListener('change', () => {
      updateShadowStatsAndCards();
      saveShadowSettings();
    });
  }

  if (shadowTargetLangSelect) {
    shadowTargetLangSelect.addEventListener('change', () => {
      state.autoTargetLang = shadowTargetLangSelect.value || 'en';
      if (state.autoTargetLang !== 'all') {
        try { localStorage.setItem(SHARED_LANG_KEY, state.autoTargetLang); } catch (e) {}
      }
      // 샘플 대본이 기본값 그대로였다면 선택한 언어의 샘플로 자동 교체해 체험성 향상
      const isDefaultSample = Object.values(SHADOW_SAMPLE_SCRIPTS).includes((shadowState.sampleContent || '').trim());
      if (shadowState.activeScriptId === 'sample' && isDefaultSample) {
        shadowState.sampleContent = getDefaultShadowSample(state.autoTargetLang);
        shadowScriptInput.value = shadowState.sampleContent;
      }
      saveSettings();
      saveShadowSettings();
      updateVoiceStatusBadge();
      updateShadowStatsAndCards();
      renderShadowDeckTabs();
      if (state.autoTargetLang !== 'all') {
        previewLanguageVoice(state.autoTargetLang);
      }
    });
  }

  if (shadowTestVoiceBtn) {
    shadowTestVoiceBtn.addEventListener('click', () => {
      const targetLang = state.autoTargetLang || 'en';
      const targetPhrase = (TARGET_LANG_META[targetLang] && TARGET_LANG_META[targetLang].testPhrase) || 'Hello!';
      speakText(`안녕하세요, 완쯔 쉐도잉 스튜디오입니다! ${targetPhrase}`, null, shadowState.rate);
    });
  }

  if (shadowRateSlider) {
    shadowRateSlider.addEventListener('input', () => {
      shadowState.rate = parseFloat(shadowRateSlider.value) || 1.0;
      if (shadowRateVal) shadowRateVal.textContent = `${shadowState.rate.toFixed(1)}x`;
      if (ttsRateSlider) {
        ttsRateSlider.value = String(shadowState.rate);
        if (ttsRateVal) ttsRateVal.textContent = `${shadowState.rate.toFixed(1)}x`;
      }
      updateShadowRatePills(shadowState.rate);
      updateShadowStatsAndCards();
      saveSettings();
      saveShadowSettings();
    });
  }

  document.querySelectorAll('#shadowRatePills .preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const r = parseFloat(pill.getAttribute('data-shadow-rate')) || 1.0;
      shadowState.rate = r;
      if (shadowRateSlider) shadowRateSlider.value = String(r);
      if (shadowRateVal) shadowRateVal.textContent = `${r.toFixed(1)}x`;
      if (ttsRateSlider) {
        ttsRateSlider.value = String(r);
        if (ttsRateVal) ttsRateVal.textContent = `${r.toFixed(1)}x`;
      }
      updateShadowRatePills(r);
      updateShadowStatsAndCards();
      saveSettings();
      saveShadowSettings();
    });
  });

  [shadowPauseSelect, shadowSentenceRepeatSelect, shadowLoopSelect, shadowMaxTimeSelect].forEach(sel => {
    if (sel) {
      sel.addEventListener('change', () => {
        saveShadowSettings();
        if (sel === shadowMaxTimeSelect && shadowState.isPlaying) {
          startShadowMaxTimer();
        }
      });
    }
  });

  // 암기 가림막 모드 전환
  document.querySelectorAll('.shadow-mask-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      shadowState.maskMode = btn.getAttribute('data-mask') || 'none';
      document.querySelectorAll('.shadow-mask-pill').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      renderShadowSentenceCards();
      saveShadowSettings();
    });
  });

  // 플레이어 마스터 컨트롤 버튼
  if (btnShadowListenAll) {
    btnShadowListenAll.addEventListener('click', () => {
      shadowState.singleLoopIdx = null;
      startShadowPlayback(0, 'listen');
    });
  }

  if (btnShadowPlayAll) {
    btnShadowPlayAll.addEventListener('click', () => {
      shadowState.singleLoopIdx = null;
      startShadowPlayback(0, 'shadow');
    });
  }

  if (btnShadowPause) {
    btnShadowPause.addEventListener('click', async () => {
      if (!shadowState.isPlaying) return;
      if (shadowState.isPaused) {
        shadowState.isPaused = false;
        try { await requestWakeLock(); } catch (e) {}
        btnShadowPause.textContent = '⏸ 일시정지';
        playCurrentShadowSentence();
      } else {
        shadowState.isPaused = true;
        releaseWakeLock();
        stopSpeaking();
        clearShadowWaitTimers();
        btnShadowPause.textContent = '▶ 이어서 듣기';
        if (shadowStatusText) {
          shadowStatusText.innerHTML = '⏸️ 일시 정지됨 — <strong>[▶ 이어서 듣기]</strong>를 누르면 현재 문장부터 재개합니다.';
        }
      }
    });
  }

  if (btnShadowStop) {
    btnShadowStop.addEventListener('click', () => {
      stopShadowPlayback();
    });
  }

  if (btnShadowPrev) {
    btnShadowPrev.addEventListener('click', () => {
      if (shadowState.sentences.length === 0) return;
      shadowState.singleLoopIdx = null;
      const prevIdx = Math.max(0, (shadowState.isPlaying ? shadowState.currentIdx - 1 : 0));
      startShadowPlayback(prevIdx);
    });
  }

  if (btnShadowNext) {
    btnShadowNext.addEventListener('click', () => {
      if (shadowState.sentences.length === 0) return;
      shadowState.singleLoopIdx = null;
      const nextIdx = Math.min(shadowState.sentences.length - 1, (shadowState.isPlaying ? shadowState.currentIdx + 1 : 0));
      startShadowPlayback(nextIdx);
    });
  }

  // 쉐도잉 스튜디오 내 목소리 낭독 녹음 & 시간 측정 (전체 낭독 및 문장별 낭독 겸용)
  async function toggleShadowVoiceRecording() {
    if (shadowState.isRecording) {
      stopShadowVoiceRecording();
      return;
    }

    stopShadowPlayback();
    stopUserVoicePlayback();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(t('speaking.sim.micDenied'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      shadowState.recStream = stream;
      const { mimeType, ext } = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      shadowState.recStartTime = Date.now();
      shadowState.isRecording = true;
      shadowState.activeSentenceRecIdx = null;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType || recorder.mimeType || 'audio/webm' });
          if (shadowState.recUrl) {
            try { URL.revokeObjectURL(shadowState.recUrl); } catch (e) {}
          }
          shadowState.recUrl = URL.createObjectURL(blob);
          shadowState.recDurationSec = Math.max(1, (Date.now() - shadowState.recStartTime) / 1000);
          if (btnShadowRecPlay) btnShadowRecPlay.classList.remove('hidden');
          if (btnShadowRecDownload) {
            btnShadowRecDownload.classList.remove('hidden');
            btnShadowRecDownload.href = shadowState.recUrl;
            btnShadowRecDownload.download = `Shadowing_Practice.${ext || 'webm'}`;
          }
          updateShadowStatsAndCards();
        }
      };

      recorder.start(250);
      shadowState.recMediaRecorder = recorder;

      if (btnShadowRecToggle) {
        btnShadowRecToggle.textContent = '⏹ 녹음 완료 (시간 측정 종료)';
        btnShadowRecToggle.classList.add('recording');
      }

      if (shadowRecClock) shadowRecClock.textContent = '00:00';
      clearInterval(shadowState.recTimerInterval);
      shadowState.recTimerInterval = setInterval(() => {
        const elapsedMs = Date.now() - shadowState.recStartTime;
        if (shadowRecClock) shadowRecClock.textContent = formatSeconds(elapsedMs);
      }, 250);
    } catch (err) {
      alert(t('speaking.sim.micDenied'));
    }
  }

  // 문장 카드 개별 발음 녹음 토글
  async function toggleSentenceVoiceRecording(idx) {
    if (shadowState.isRecording && shadowState.activeSentenceRecIdx === idx) {
      stopShadowVoiceRecording();
      return;
    }
    if (shadowState.isRecording) {
      stopShadowVoiceRecording();
    }

    stopShadowPlayback();
    stopUserVoicePlayback();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(t('speaking.sim.micDenied'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      shadowState.recStream = stream;
      const { mimeType } = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      const recStart = Date.now();
      shadowState.recStartTime = recStart;
      shadowState.isRecording = true;
      shadowState.activeSentenceRecIdx = idx;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType || recorder.mimeType || 'audio/webm' });
          const prevRec = shadowState.sentenceRecordings[idx];
          if (prevRec && prevRec.url) {
            try { URL.revokeObjectURL(prevRec.url); } catch (e) {}
          }
          const url = URL.createObjectURL(blob);
          const durationSec = Math.max(0.5, (Date.now() - recStart) / 1000);
          shadowState.sentenceRecordings[idx] = { url, durationSec };
        }
        shadowState.activeSentenceRecIdx = null;
        renderShadowSentenceCards();
      };

      recorder.start(250);
      shadowState.recMediaRecorder = recorder;
      renderShadowSentenceCards();
    } catch (err) {
      shadowState.activeSentenceRecIdx = null;
      alert(t('speaking.sim.micDenied'));
    }
  }

  function stopShadowVoiceRecording() {
    clearInterval(shadowState.recTimerInterval);
    shadowState.isRecording = false;
    shadowState.activeSentenceRecIdx = null;
    if (shadowState.recMediaRecorder && shadowState.recMediaRecorder.state !== 'inactive') {
      try { shadowState.recMediaRecorder.stop(); } catch (e) {}
    }
    shadowState.recMediaRecorder = null;
    if (shadowState.recStream) {
      try { shadowState.recStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      shadowState.recStream = null;
    }
    if (btnShadowRecToggle) {
      btnShadowRecToggle.textContent = '🎙️ 내 낭독 녹음 시작';
      btnShadowRecToggle.classList.remove('recording');
    }
  }

  if (btnShadowRecToggle) {
    btnShadowRecToggle.addEventListener('click', toggleShadowVoiceRecording);
  }

  if (btnShadowRecPlay) {
    btnShadowRecPlay.addEventListener('click', () => {
      if (!shadowState.recUrl) return;
      stopShadowPlayback();
      toggleUserVoicePlayback(shadowState.recUrl, btnShadowRecPlay);
    });
  }

  // 쉐도잉 대본 목록 JSON 파일 내보내기 / 불러오기 백업
  if (btnExportShadowDecks) {
    btnExportShadowDecks.addEventListener('click', () => {
      saveShadowSettings();
      const backupData = {
        type: 'wanzi_shadowing_scripts_backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        activeScriptId: shadowState.activeScriptId,
        sampleContent: shadowState.sampleContent,
        customScripts: shadowState.customScripts
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `wanzi_shadowing_scripts_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  if (btnImportShadowDecks && importShadowDecksFileInput) {
    btnImportShadowDecks.addEventListener('click', () => {
      importShadowDecksFileInput.value = '';
      importShadowDecksFileInput.click();
    });

    importShadowDecksFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(String(ev.target.result || ''));
          if (!data || (!Array.isArray(data.customScripts) && typeof data.sampleContent !== 'string')) {
            alert(t('speaking.step1.importInvalid'));
            return;
          }
          if (typeof data.sampleName === 'string' && data.sampleName.trim()) {
            shadowState.sampleName = data.sampleName.trim();
          }
          if (typeof data.sampleContent === 'string') {
            shadowState.sampleContent = data.sampleContent;
          }
          if (Array.isArray(data.customScripts)) {
            shadowState.customScripts = data.customScripts
              .filter(d => d && typeof d.id === 'string' && typeof d.name === 'string')
              .map(d => ({
                id: d.id,
                name: d.name.trim() || '대본',
                content: typeof d.content === 'string' ? d.content : ''
              }));
          }
          shadowState.activeScriptId = data.activeScriptId || 'sample';
          if (shadowState.activeScriptId !== 'sample' && !shadowState.customScripts.some(d => d.id === shadowState.activeScriptId)) {
            shadowState.activeScriptId = 'sample';
          }
          if (shadowScriptInput) {
            if (shadowState.activeScriptId === 'sample') {
              shadowScriptInput.value = shadowState.sampleContent;
            } else {
              const found = shadowState.customScripts.find(d => d.id === shadowState.activeScriptId);
              shadowScriptInput.value = found ? found.content : shadowState.sampleContent;
            }
          }
          renderShadowDeckTabs();
          updateShadowStatsAndCards();
          saveShadowSettings();
          alert(t('speaking.step1.importSuccess'));
        } catch (err) {
          alert(t('speaking.step1.importInvalid'));
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  // 쉐도잉 스튜디오 키보드 단축키 지원 (입력창 포커스 중이 아닐 때 Space / 좌우 방향키)
  if (shadowSentenceList) {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!shadowState.isPlaying) {
          shadowState.singleLoopIdx = null;
          startShadowPlayback(0);
        } else if (btnShadowPause) {
          btnShadowPause.click();
        }
      } else if (e.code === 'ArrowLeft') {
        if (shadowState.sentences.length > 0 && btnShadowPrev && !btnShadowPrev.disabled) {
          e.preventDefault();
          btnShadowPrev.click();
        }
      } else if (e.code === 'ArrowRight') {
        if (shadowState.sentences.length > 0 && btnShadowNext && !btnShadowNext.disabled) {
          e.preventDefault();
          btnShadowNext.click();
        }
      }
    });
  }

  // 페이지 이탈 / 새로고침 시 TTS 음성 낭독 및 마이크 스트림 즉시 해제 (잔류 방지)
  const cleanupOnPageLeave = () => {
    try { stopSpeaking(); } catch (e) {}
    try { stopShadowPlayback(); } catch (e) {}
    try { stopShadowVoiceRecording(); } catch (e) {}
    try { releaseMicrophone(); } catch (e) {}
    try { revokeAllRecordings(); } catch (e) {}
  };
  window.addEventListener('pagehide', cleanupOnPageLeave);
  window.addEventListener('beforeunload', cleanupOnPageLeave);

  // =========================================================================
  // 12. 초기화 실행
  // =========================================================================
  loadSettings();
  updateMicOptionsUi();
  loadShadowSettings();
});
