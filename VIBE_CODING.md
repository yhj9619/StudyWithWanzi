# 🤖 AI 바이브 코딩 가이드 (Vibe Coding Guide)

> **Study with Wanzi 코드베이스를 작업하거나 수정하는 모든 AI 에이전트 및 개발자를 위한 필독 지침서**  
> 이 문서는 시스템의 존재 이유, 핵심 설계 철학, 기술적 제약 사항, 비개발자 친화적 UX 원칙을 명시합니다.  
> 본 프로젝트의 코드를 작성하거나 리팩토링할 때는 **반드시 이 문서의 지침을 100% 준수**해야 합니다.

---

## 🎯 1. 프로젝트의 존재 이유와 절대 원칙

### 🚨 프로젝트의 출발점과 확장 배경
1. **출발점 — "기존 Anki는 비개발자에게 조작 방식이 너무 불친절하다"**
   * **Anki(안키)**는 세계 최고의 간격 반복(SRS) 암기 소프트웨어이지만, 카드 서식(HTML/CSS 템플릿), 사전 검색 스크립트, UTF-8 CSV 가져오기, 필드 매핑 등 조작 방식이 엔지니어링 중심적이라 비개발자 학습자가 큰 장벽을 느낍니다. Study with Wanzi는 비개발자도 복잡한 코드나 설정 없이 Anki를 100% 활용할 수 있도록 돕기 위해 시작되었습니다.
2. **확장 — "말하기 시험(Speaking) 독학을 위한 실전 연습 도구"**
   * 단어 암기를 넘어 OPIc, 토익스피킹, HSKK, 관광통역안내사 등 말하기 시험을 준비하는 학습자들이 답변 스크립트의 발화 시간을 점검하며 쉐도잉하고, 실전처럼 무작위 질문 타이머·녹음 모의고사를 치를 수 있도록 말하기 연습 도구 모음(`/speaking/`)으로 확장되었습니다.

### 🌟 사이트 전반의 UX 스탠스: "비개발자 눈높이에서 직관적이어야 한다"
* 이 사이트를 찾는 주 사용자는 개발자가 아닌 **일반 어학 학습자(비개발자)**입니다.
* 따라서 Anki 도구든 말하기 도구든 **모든 UI, 문구, 상호작용은 비개발자가 직관적으로 이해하고 바로 쓸 수 있도록 설계하는 것**을 제1원칙으로 삼습니다.
* 개발자에게만 익숙한 용어(클립보드, 딜리미터, 파싱, 인코딩, 정규식 등)를 화면에 그대로 노출하지 마세요.
* 사용자가 실수하더라도 시스템이 알아서 똑똑하게 보정해 주는 **"실패할 수 없는 환경(Pit of Success)"**을 구축해야 합니다.
* 브랜드명 **Wanzi**의 한국어 표기는 한자 **丸子(완쯔)** 발음에 맞춰 항상 **"완쯔"**로 표기합니다.

---

## 🧭 2. 비개발자를 위한 UX/UI 및 문구 작성 원칙

### 1) 기술 용어 배제 및 일상적 비유 사용 (Terminology Rules)
화면에 노출되는 모든 텍스트는 개발자 용어를 배제하고, 일상적인 쉬운 단어로 번역하여 제공합니다.

| ❌ 절대 쓰지 말아야 할 개발 용어 | ⭕ 반드시 사용해야 할 사용자 친화적 표현 | 비고 |
|:---|:---|:---|
| 필드 (Field) 단독 표기 | **카드에 들어갈 칸 (필드)** | 처음에는 '칸'을 앞세우고 괄호로 필드 병기 |
| 템플릿 (Template) | **카드 서식 / 카드 모양** | 직관적인 '서식' 또는 '모양' 사용 |
| 구분자 / 딜리미터 (Delimiter) | **칸 나누는 기호** | 쉼표, 탭 등을 알기 쉽게 설명 |
| 인코딩 / UTF-8 | **글자가 깨지지 않는 파일** | 인코딩이라는 단어 대신 현상으로 설명 |
| 프롬프트 (Prompt) | **AI에게 보낼 부탁 글 (프롬프트)** | 프롬프트의 역할을 명확히 설명 |
| 파싱 / 추출 (Parse / Extract) | **단어 뽑기 / 문장 나누기** | 쉬운 한글 표현 사용 |
| CSS / 스타일시트 | **글씨 꾸미기 / 카드 모양** | 직관적인 스타일 용어 사용 |
| Web Speech API / SpeechSynthesis | **낭독 음성 (TTS 언어) / 읽어주기** | 브라우저/기기 내장 음성으로 쉽게 안내 |

### 2) 번호 순서(①②③)와 시각적 단계화
* 모든 작업은 **1 ➔ 2 ➔ 3** 번호를 명확하게 붙여 순서대로 따라 하기만 하면 끝나도록 배치합니다.
* 버튼을 누르면 즉시 `✓ 복사했어요` 체크 표시와 토스트 안내를 띄워 **"내가 제대로 수행했음"**을 확신시켜 줍니다.

### 3) 오류 방지 및 자동 보정 (Defensive UX)
* 사용자가 필드명에 금지 문자(`:`, `{`, `}`, `"`)를 넣으면 내부적으로 자동 제거하고 노란색 배지로 안내합니다.
* AI 답변 붙여넣기 시 앞뒤 인사말과 마크다운 백틱(```)을 정규식으로 자동 제거합니다.
* 말하기 도구에서 엑셀이나 메모장의 여러 줄 질문을 붙여넣으면 줄바꿈 단위로 자동 분리하고 앞 번호(`1.`, `Q1:`)를 깔끔하게 정리합니다.

---

## 🏗️ 3. 기술 아키텍처 및 코딩 규칙

### 1) Zero Dependency · Zero Build · Zero Paid API (절대 불변 원칙)
* **빌드 도구가 없습니다.** (No Vite, No Webpack, No npm build)
* **외부 런타임 라이브러리나 유료 LLM/TTS API를 사용하지 않습니다.**
  * GitHub Pages 정적 호스팅만으로 영구 무료 운영되어야 하므로, 외부 유료 API 키가 필요한 기능을 추가하지 마십시오.
  * 음성 합성은 브라우저 내장 `window.speechSynthesis`, 알림음은 `AudioContext`(Web Audio API), 음성 녹음은 `MediaRecorder`와 `Blob` URL만 사용합니다.

### 2) 상단 공통 헤더 및 2대 대분류 드롭다운 네비게이션 (`assets/js/i18n.js`)
* 모든 페이지 상단의 `<nav data-site-nav="페이지ID"></nav>`는 `i18n.js`의 `renderSiteNavs()`가 자동으로 렌더링합니다.
* 상단 바에는 **`🌄 Study with Wanzi`** 홈 링크와 **`🃏 Anki 도구 ▾`**, **`🎙️ 말하기 도구 ▾`** 두 개의 대분류 드롭다운 버튼만 배치합니다.
  * **`🃏 Anki 도구 ▾`** 하위 메뉴:
    * `anki-home` (`anki/index.html`)
    * `editor` (`anki/ankiEditor.html`)
    * `prompt` (`anki/ankiPrompt.html`)
    * `guide` (`anki/ankiGuide.html`)
    * `manual` (`anki/ankiManual.html`)
  * **`🎙️ 말하기 도구 ▾`** 하위 메뉴:
    * `speaking` (`speaking/index.html`)
    * `speaking-sim` (`speaking/speakingSimulator.html`)
    * `speaking-shadow` (`speaking/speakingShadowing.html`)
    * `speaking-manual` (`speaking/speakingManual.html`)
* HTML이나 CSS/JS 파일을 수정한 뒤에는 브라우저 캐시 갱신을 위해 HTML 내의 `?v=YYYYMMDDx` 쿼리 파라미터 버전을 함께 올려줍니다.

### 3) 다국어(i18n) 지원 체계 준수
* Study with Wanzi는 **한국어(ko), 영어(en), 중국어(zh)** 3개 언어를 지원합니다.
* 공통 네비게이션 및 Anki 도구의 문구를 수정·추가할 때는 `assets/i18n/{ko,en,zh}/` 산하 모듈(`common.js`, `index.js`, `editor.js`, `prompt.js`, `guide.js`, `manual.js`)에 키를 함께 반영합니다.

### 4) 데이터 지속성 및 로컬스토리지 (`localStorage`) 규칙
* 모든 사용자 설정은 브라우저의 `localStorage`에 자동 저장됩니다.
* **주요 Storage Key 규격**:
  * `swz_ui_lang`: 현재 UI 언어 (`ko` / `en` / `zh`)
  * `swz_last_language`: 최근 선택한 학습 언어 ID (Anki 도구 ↔ 말하기 도구 간 외국어 자동 연동용)
  * `swz_recent_languages`: 언어 검색 콤보박스의 최근 선택 목록 (최대 3개)
  * `anki_card_editor_content`: 에디터의 학습 언어 및 필드 설정 JSON
  * `anki_card_editor_design`: 에디터의 테마, 배경, 글꼴 등 디자인 설정 JSON
  * `anki_prompt_generator_settings`: 프롬프트 생성기의 설정 JSON
  * `wanzi_speaking_settings`: 말하기 도구의 음성/타이머/질문 덱 설정 JSON
  * `wanzi_shadowing_studio_v1`: 쉐도잉 스튜디오의 대본/배속/쉼 시간/암기 가림막 설정 JSON

### 5) 말하기 시험 연습 도구 (`assets/js/speakingApp.js`) 코딩 규칙
1. **단독 페이지 겸용(Null-Safe) 및 로컬스토리지 병합 저장**:
   * `speakingApp.js`는 `speaking/speakingSimulator.html`(실전 시뮬레이터)과 `speaking/speakingShadowing.html`(쉐도잉 스튜디오) 두 페이지에서 공통으로 로드됩니다.
   * 따라서 특정 페이지에만 존재하는 DOM 요소는 반드시 존재 여부(`if (el)`)를 확인한 뒤 이벤트 리스너나 속성을 조작해야 합니다.
   * `saveSettings()` 호출 시 현재 페이지에 없는 입력 요소 때문에 기존 `localStorage`(`wanzi_speaking_settings`)의 다른 페이지 설정값이 기본값으로 덮어써지지 않도록, 기존 저장 객체를 먼저 읽어들인 뒤 병합(merge)하여 저장합니다.
2. **TDZ(Temporal Dead Zone) 에러 방지**:
   * `loadVoices()`는 스크립트 초기 실행 시 동기적으로 호출될 수 있으며 내부에서 `updateVoiceStatusBadge()` ➔ `syncShadowVoiceUI()`를 연쇄 호출합니다.
   * 따라서 **모든 DOM 요소 참조(`const ... = document.getElementById(...)`)와 상태 객체(`state`, `shadowState`)는 반드시 `speakingApp.js` 최상단(1번 섹션)에 먼저 선언**해야 합니다.
3. **모국어 + 외국어 1:1 언어 자동 감지 (`splitTextByLanguage`)**:
   * 모든 언어를 동시에 감지하면 중국어 한자↔일본어 한자, 영어↔로마자권 언어가 서로 섞여 오작동합니다.
   * 반드시 **모국어(UI 언어 `ko`/`en`/`zh`) + 사용자가 선택한 연습 외국어 1개(`state.autoTargetLang`)**만 1:1로 매칭하여 분리 낭독하도록 유지합니다.
   * 외국어 선택 드롭다운(`#autoTargetLangSelect`)에는 현재 브라우저/OS에 실제 TTS 음성이 설치된 언어 코드만 동적으로 필터링하여 노출하고, 브라우저별 음성 차이는 `#ttsBrowserTooltipWrap` 팝오버로 안내합니다.

---

## 🗺️ 4. 주요 파일 맵 및 역할

```text
studyWithWanzi/
│
├── index.html                        # 루트 메인 허브 (Anki 도구 & 말하기 도구 2대 기둥 안내)
├── ankiEditor.html                   # 루트 리다이렉트 스텁 (→ anki/ankiEditor.html)
├── ankiPrompt.html                   # 루트 리다이렉트 스텁 (→ anki/ankiPrompt.html)
├── ankiGuide.html                    # 루트 리다이렉트 스텁 (→ anki/ankiGuide.html)
├── ankiManual.html                   # 루트 리다이렉트 스텁 (→ anki/ankiManual.html)
│
├── anki/                             # 🃏 Anki 단어 학습 도구 폴더
│   ├── index.html                    # Anki 허브 (4단계 학습 여정 & 4개 도구 카드)
│   ├── ankiEditor.html               # 카드 서식 에디터 화면
│   ├── ankiPrompt.html               # AI 프롬프트 생성기 & CSV 변환 화면
│   ├── ankiGuide.html                # 초보자 4단계 설치·복습 가이드 화면
│   └── ankiManual.html               # Anki 도구 화면별 사용 설명서 & FAQ
│
├── speaking/                         # 🎙️ 말하기 시험 연습 도구 폴더
│   ├── index.html                    # 말하기 허브 (3단계 연습 여정 & 3개 도구 카드)
│   ├── speakingSimulator.html        # 🎯 실전 면접 시뮬레이터 화면
│   ├── speakingShadowing.html        # 📜 스크립트 쉐도잉 스튜디오 화면
│   └── speakingManual.html           # ❓ 말하기 연습 사용 설명서 & FAQ
│
└── assets/
    ├── css/
    │   ├── style.css                 # 전역 CSS 변수, 2대 대분류 드롭다운 헤더, 반응형
    │   ├── index.css                 # 루트/서브 허브 포털 그리드 스타일
    │   ├── editor.css                # Anki 에디터 전용 스타일
    │   ├── prompt.css                # AI 프롬프트 생성기 전용 스타일
    │   ├── guide.css                 # 가이드북 & 사용 설명서(FAQ) 전용 스타일
    │   └── speaking.css              # 말하기 시뮬레이터 & 쉐도잉 스튜디오 전용 스타일
    │
    ├── js/
    │   ├── languages.js              # 46개 언어 메타데이터 (사전 URL, 예시 데이터, RTL 여부)
    │   ├── langCombobox.js           # 초성/별칭 검색 지원 재사용 콤보박스 모듈
    │   ├── i18n.js                   # 다국어 치환 및 2대 대분류 드롭다운 헤더 렌더링 엔진
    │   ├── app.js                    # Anki 에디터 코어 로직
    │   ├── promptApp.js              # Anki 프롬프트 생성기 & CSV 파서 코어 로직
    │   └── speakingApp.js            # 말하기 시뮬레이터 & 쉐도잉 스튜디오 코어 로직
    │
    └── i18n/
        └── {ko,en,zh}/{common,index,editor,prompt,guide,manual}.js
```

---

## ✅ 5. 바이브 코딩 작업 완료 전 자가 점검 체크리스트 (Verification Checklist)

새로운 기능을 추가하거나 기존 로직을 수정했다면, 반드시 다음 8가지 항목을 점검하십시오:

1. [ ] **문법 및 런타임 에러가 없는가?**
   - 수정한 JS 파일에 대해 `node -c assets/js/파일명.js`를 실행하여 문법 에러가 0건인지 확인했는가?
   - `speakingApp.js` 수정 시 모든 DOM 변수와 상태 변수가 최상단에 선언되어 TDZ(`Cannot access before initialization`) 에러가 발생하지 않는가?
2. [ ] **비개발자가 이해할 수 있는 친절한 UX인가?**
   - 전문 용어 대신 직관적인 한글 표현과 툴팁 안내를 사용했는가?
3. [ ] **무설치 · 무서버 · 무과금(Zero-dependency & Zero-API) 원칙을 지켰는가?**
   - 외부 유료 API나 서버 전송 없이 브라우저 내장 기능만으로 100% 작동하는가?
4. [ ] **다국어(ko/en/zh) 및 공통 헤더 네비게이션이 정상 작동하는가?**
   - 상단 `🃏 Anki 도구 ▾`, `🎙️ 말하기 도구 ▾` 드롭다운에서 모든 페이지 링크의 상대 경로(`../anki/`, `../speaking/` 등)가 정확한가?
5. [ ] **단독 페이지 간 설정 공유가 안전한가?**
   - `speakingSimulator.html`과 `speakingShadowing.html` 사이를 이동할 때 선택한 음성(`voiceSelect`, `autoTargetLang`)과 기존 설정이 초기화되지 않고 그대로 유지되는가?
6. [ ] **모바일 환경에서 깨지지 않는가?**
   - 좁은 화면(360px ~ 480px)에서 드롭다운 메뉴, 팝오버 툴팁, 타이머/플레이어 컨트롤이 화면 밖으로 넘치지 않는가?
7. [ ] **Anki 및 브라우저 호환성이 유지되는가?**
   - 복사된 Anki 서식과 CSV 파일이 PC/모바일 Anki에서 깨지지 않는가?
8. [ ] **캐시 무효화(`?v=`) 버전을 갱신했는가?**
   - CSS/JS 수정 후 HTML 파일들의 `?v=YYYYMMDDx` 쿼리 스트링을 최신으로 업데이트했는가?
