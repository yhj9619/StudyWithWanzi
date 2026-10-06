# ⚡ Anki 다국어 카드 스크립트 에디터 (Anki Card Script Editor)

비개발자도 쉽고 빠르게 Anki 다국어 단어 카드 서식(앞면/뒷면/CSS)과 맞춤형 사전 검색 링크를 생성할 수 있는 웹 에디터입니다.  
순수 프론트엔드로 동작하며 **GitHub Pages(Jekyll 호환)**에 즉시 배포할 수 있습니다.

---

## 🌟 주요 기능

1. **46개 언어 사전 링크 원클릭 매핑**
   - 영어, 일본어, 중국어, 프랑스어, 스페인어, 독일어 등 전 세계 46개 언어 선택 지원
   - 언어 선택 시 해당 언어의 공식 네이버 사전(또는 위키낱말사전) 검색 링크가 자동 설정
   - 사전 URL 직접 수정 및 커스텀 가능
2. **사전 링크 적용 위치 자유 선택**
   - 1번째 필드(단어), 2번째 필드(뜻), 3번째 필드(발음/예문) 중 원하는 필드에 바로 사전 링크 적용
   - 새 창(`target="_blank"`) 및 밑줄(`text-decoration`) 옵션 제어
3. **직관적인 글씨 크기, 색상, 굵기 커스텀**
   - 슬라이더 및 숫자 입력으로 폰트 크기(`font-size`) 조절
   - 컬러 피커 및 프리셋 팔레트로 색상(`color`) 변경
   - 보통(normal) / 굵게(bold) / 중간 굵게(600) 선택 시 실시간 코드 반영
4. **유연한 카드 앞면/뒷면 배치**
   - 1, 2, 3번째 필드를 앞면에 표시할지, 뒷면에 표시할지 체크박스로 각각 선택
   - 뒷면에 앞면 내용 유지 및 `<hr id="answer">` 구분선 표시 여부 지원
5. **실시간 Anki 카드 시뮬레이터 (미리보기)**
   - 앞면/뒷면 전환 및 카드 뒤집기(🔄) 시뮬레이션
   - 실제 단어 클릭 시 사전 검색 페이지 새 창 이동 테스트 가능
   - 다크모드(🌙) 미리보기 지원
6. **원클릭 클립보드 복사**
   - 앞면 서식, 뒷면 서식, CSS 스타일을 버튼 한 번으로 클립보드에 복사

---

## 🚀 GitHub Pages 배포 방법

이 프로젝트는 별도의 Node.js 빌드나 복잡한 과정 없이 GitHub에 올리기만 하면 바로 배포됩니다.

### 1단계: Git 초기화 및 커밋
```bash
git init
git add .
git commit -m "feat: Anki 카드 스크립트 에디터 초기 구축"
```

### 2단계: GitHub 원격 저장소 연결 및 푸시
```bash
git branch -M main
git remote add origin https://github.com/<본인-깃허브-아이디>/<저장소-이름>.git
git push -u origin main
```

### 3단계: GitHub Pages 활성화
1. GitHub 저장소 페이지의 **Settings** (설정) 메뉴로 이동합니다.
2. 좌측 사이드바의 **Pages**를 클릭합니다.
3. **Build and deployment** 항목의 **Source**에서 `Deploy from a branch`를 선택합니다.
4. **Branch**를 `main` (또는 master) / `/ (root)`로 지정하고 **Save**를 누릅니다.
5. 약 1~2분 후 상단에 생성된 주소(`https://<아이디>.github.io/<저장소-이름>/`)로 접속하면 전 세계 어디서든 웹 브라우저로 에디터를 사용할 수 있습니다!

---

## 📁 프로젝트 구조

```
LanguageStudy/
├── _config.yml             # GitHub Pages Jekyll 설정
├── index.html              # 에디터 메인 화면 및 마크업
├── assets/
│   ├── css/
│   │   └── style.css       # 반응형 스타일 및 카드 시뮬레이터 디자인
│   └── js/
│       ├── languages.js    # 46개 언어 및 사전 URL 메타데이터
│       └── app.js          # 에디터 상태 동기화 및 템플릿 생성 로직
└── README.md               # 프로젝트 가이드
```
