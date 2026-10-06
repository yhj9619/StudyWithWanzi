// 46개 언어 데이터 및 사용자 지정 네이버 사전 공식 하이퍼링크 매핑
// 기본 구성: 1번 필드(Front: 한국어 뜻) / 2번 필드(Back: 외국어 단어 · 사전 링크) / 3번 필드(병음 및 예문)
const LANGUAGES_DATA = [
  {
    id: "en",
    name: "영어",
    dictUrl: "https://en.dict.naver.com/#/search?query=",
    dictName: "네이버 영어사전",
    isRTL: false,
    sample: { field1: "사과", field2: "Apple", field3: "I eat an apple every morning." }
  },
  {
    id: "ja",
    name: "일본어",
    dictUrl: "https://ja.dict.naver.com/#/search?query=",
    dictName: "네이버 일본어사전",
    isRTL: false,
    sample: { field1: "벚꽃", field2: "桜", field3: "公園に桜の花が綺麗に咲いています。" }
  },
  {
    id: "zh",
    name: "중국어",
    dictUrl: "https://zh.dict.naver.com/#/search?query=",
    dictName: "네이버 중국어사전",
    isRTL: false,
    sample: { field1: "안녕, 안녕하세요", field2: "你好", field3: "nǐ hǎo" }
  },
  {
    id: "fr",
    name: "프랑스어",
    dictUrl: "https://dict.naver.com/frkodict/#/search?query=",
    dictName: "네이버 프랑스어사전",
    isRTL: false,
    sample: { field1: "안녕하세요, 좋은 아침", field2: "Bonjour", field3: "Bonjour, comment allez-vous aujourd'hui ?" }
  },
  {
    id: "es",
    name: "스페인어",
    dictUrl: "https://dict.naver.com/eskodict/#/search?query=",
    dictName: "네이버 스페인어사전",
    isRTL: false,
    sample: { field1: "감사합니다", field2: "Gracias", field3: "Muchas gracias por tu amable ayuda." }
  },
  {
    id: "de",
    name: "독일어",
    dictUrl: "https://dict.naver.com/dekodict/#/search?query=",
    dictName: "네이버 독일어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Guten Tag", field3: "Guten Tag, wie geht es Ihnen heute?" }
  },
  {
    id: "vi",
    name: "베트남어",
    dictUrl: "https://dict.naver.com/vikodict/#/search?query=",
    dictName: "네이버 베트남어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Xin chào", field3: "Xin chào, rất vui được gặp bạn." }
  },
  {
    id: "ne",
    name: "네팔어",
    dictUrl: "https://dict.naver.com/nekodict/#/search?query=",
    dictName: "네이버 네팔어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "नमस्ते", field3: "नमस्ते, तपाईंलाई कस्तो छ?" }
  },
  {
    id: "lo",
    name: "라오어",
    dictUrl: "https://dict.naver.com/lokodict/#/search?query=",
    dictName: "네이버 라오어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "ສະບາຍດີ", field3: "ສະບາຍດີ, ເຈົ້າສະບາຍດີບໍ?" }
  },
  {
    id: "mn",
    name: "몽골어",
    dictUrl: "https://dict.naver.com/mnkodict/#/search?query=",
    dictName: "네이버 몽골어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Сайн байна уу", field3: "Сайн байна уу, өдрийн мэнд хүргэе." }
  },
  {
    id: "my",
    name: "미얀마어",
    dictUrl: "https://dict.naver.com/mykodict/#/search?query=",
    dictName: "네이버 미얀마어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "မင်္ဂလာပါ", field3: "မင်္ဂလာပါ၊ နေကောင်းလားခင်ဗျာ။" }
  },
  {
    id: "sw",
    name: "스와힐리어",
    dictUrl: "https://dict.naver.com/swkodict/#/search?query=",
    dictName: "네이버 스와힐리어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Habari", field3: "Habari za asubuhi, rafiki yangu." }
  },
  {
    id: "ar",
    name: "아랍어",
    dictUrl: "https://dict.naver.com/arkodict/#/search?query=",
    dictName: "네이버 아랍어사전",
    isRTL: true,
    sample: { field1: "안녕하세요", field2: "مرحبا", field3: "مرحبا بك، أتمنى لك يوما سعيدا." }
  },
  {
    id: "ur",
    name: "우르두어",
    dictUrl: "https://dict.naver.com/urkodict/#/search?query=",
    dictName: "네이버 우르두어사전",
    isRTL: true,
    sample: { field1: "안녕하세요", field2: "سلام", field3: "سلام، آپ سے مل کر خوشی ہوئی۔" }
  },
  {
    id: "uz",
    name: "우즈베크어",
    dictUrl: "https://dict.naver.com/uzkodict/#/search?query=",
    dictName: "네이버 우즈베크어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Salom", field3: "Salom, ishlaringiz qalay?" }
  },
  {
    id: "id",
    name: "인도네시아어",
    dictUrl: "https://dict.naver.com/idkodict/#/search?query=",
    dictName: "네이버 인도네시아어사전",
    isRTL: false,
    sample: { field1: "좋은 아침입니다", field2: "Selamat pagi", field3: "Selamat pagi, senang bertemu dengan Anda." }
  },
  {
    id: "kk",
    name: "카자흐어",
    dictUrl: "https://dict.naver.com/kkkodict/#/search?query=",
    dictName: "네이버 카자흐어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Сәлеметсіз бе", field3: "Сәлеметсіз бе, қалыңыз қалай?" }
  },
  {
    id: "km",
    name: "캄보디아어",
    dictUrl: "https://dict.naver.com/kmkodict/#/search?query=",
    dictName: "네이버 캄보디아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "សួស្តី", field3: "សួស្តី តើអ្នកសុខសប្បាយជាទេ?" }
  },
  {
    id: "tl",
    name: "타갈로그어",
    dictUrl: "https://dict.naver.com/tlkodict/#/search?query=",
    dictName: "네이버 타갈로그어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Kumusta", field3: "Kumusta ka sa araw na ito?" }
  },
  {
    id: "th",
    name: "태국어",
    dictUrl: "https://dict.naver.com/thkodict/#/search?query=",
    dictName: "네이버 태국어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "สวัสดี", field3: "สวัสดีตอนเช้าครับ ยินดีที่ได้พบคุณ" }
  },
  {
    id: "tet",
    name: "테툼어",
    dictUrl: "https://dict.naver.com/tetkodict/#/search?query=",
    dictName: "네이버 테툼어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Bondia", field3: "Bondia, ita-boot di'ak ka lae?" }
  },
  {
    id: "fa",
    name: "페르시아어",
    dictUrl: "https://dict.naver.com/fakodict/#/search?query=",
    dictName: "네이버 페르시아어사전",
    isRTL: true,
    sample: { field1: "안녕하세요", field2: "سلام", field3: "سلام، حال شما چطور است؟" }
  },
  {
    id: "ha",
    name: "하우사어",
    dictUrl: "https://dict.naver.com/hakodict/#/search?query=",
    dictName: "네이버 하우사어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Sannu", field3: "Sannu da zuwa, barka da yamma." }
  },
  {
    id: "he",
    name: "히브리어(현대)",
    dictUrl: "https://dict.naver.com/hekodict/#/search?query=",
    dictName: "네이버 히브리어사전",
    isRTL: true,
    sample: { field1: "안녕하세요", field2: "שלום", field3: "שלום, מה שלומך הבוקר?" }
  },
  {
    id: "hbo",
    name: "히브리어(고대)",
    dictUrl: "https://dict.naver.com/hbokodict/#/search?query=",
    dictName: "네이버 고대 히브리어사전",
    isRTL: true,
    sample: { field1: "평화 (샬롬)", field2: "שָׁלוֹם", field3: "שָׁלוֹם עֲלֵיכֶם וּבְרָכָה" }
  },
  {
    id: "hi",
    name: "힌디어",
    dictUrl: "https://dict.naver.com/hikodict/#/search?query=",
    dictName: "네이버 힌디어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "नमस्ते", field3: "नमस्ते, आप से मिलकर बहुत खुशी हुई।" }
  },
  {
    id: "el",
    name: "그리스어(현대)",
    dictUrl: "https://dict.naver.com/elkodict/#/search?query=",
    dictName: "네이버 현대 그리스어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Γεια σας", field3: "Γεια σας, χαίρομαι πολύ που σας γνωρίζω." }
  },
  {
    id: "grc",
    name: "그리스어(고대)",
    dictUrl: "https://dict.naver.com/elkodict/#/search?query=",
    dictName: "네이버 고대 그리스어사전",
    isRTL: false,
    sample: { field1: "말, 로고스", field2: "λόγος", field3: "Ἐν ἀρχῇ ἦν ὁ λόγος." }
  },
  {
    id: "nl",
    name: "네덜란드어",
    dictUrl: "https://dict.naver.com/nlkodict/#/search?query=",
    dictName: "네이버 네덜란드어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Hallo", field3: "Hallo, fijn om je te ontmoeten." }
  },
  {
    id: "no",
    name: "노르웨이어",
    dictUrl: "https://dict.naver.com/nokodict/#/search?query=",
    dictName: "네이버 노르웨이어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Hei", field3: "Hei, hyggelig å hilse på deg." }
  },
  {
    id: "da",
    name: "덴마크어",
    dictUrl: "https://dict.naver.com/dakodict/#/search?query=",
    dictName: "네이버 덴마크어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Hej", field3: "Hej, det er rart at møde dig." }
  },
  {
    id: "la",
    name: "라틴어",
    dictUrl: "https://dict.naver.com/lakodict/#/search?query=",
    dictName: "네이버 라틴어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Salve", field3: "Salve, amice mi! Quomodo te habes?" }
  },
  {
    id: "ru",
    name: "러시아어",
    dictUrl: "https://dict.naver.com/rukodict/#/search?query=",
    dictName: "네이버 러시아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Здравствуйте", field3: "Здравствуйте, рад вас видеть сегодня." }
  },
  {
    id: "ro",
    name: "루마니아어",
    dictUrl: "https://dict.naver.com/rokodict/#/search?query=",
    dictName: "네이버 루마니아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Bună ziua", field3: "Bună ziua, mă bucur să vă cunosc." }
  },
  {
    id: "sv",
    name: "스웨덴어",
    dictUrl: "https://svdic.naver.com/#/search?query=",
    dictName: "네이버 스웨덴어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Hej", field3: "Hej, vad roligt att träffas." }
  },
  {
    id: "sq",
    name: "알바니아어",
    dictUrl: "https://sqdic.naver.com/#/search?query=",
    dictName: "네이버 알바니아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Përshëndetje", field3: "Përshëndetje, gëzohem që po ju takoj." }
  },
  {
    id: "uk",
    name: "우크라이나어",
    dictUrl: "https://dict.naver.com/ukkodict/#/search?query=",
    dictName: "네이버 우크라이나어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Добрий день", field3: "Добрий день, як ваші справи?" }
  },
  {
    id: "it",
    name: "이탈리아어",
    dictUrl: "https://dict.naver.com/itkodict/#/search?query=",
    dictName: "네이버 이탈리아어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Ciao", field3: "Ciao, è un piacere conoscerti." }
  },
  {
    id: "ka",
    name: "조지아어",
    dictUrl: "https://dict.naver.com/kakodict/#/search?query=",
    dictName: "네이버 조지아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "გამარჯობა", field3: "გამარჯობა, ძალიან სასიამოვნოა." }
  },
  {
    id: "cs",
    name: "체코어",
    dictUrl: "https://csdic.naver.com/#/search?query=",
    dictName: "네이버 체코어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Dobrý den", field3: "Dobrý den, rád vás poznávám." }
  },
  {
    id: "hr",
    name: "크로아티아어",
    dictUrl: "https://hrdic.naver.com/#/search?query=",
    dictName: "네이버 크로아티아어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Dobar dan", field3: "Dobar dan, drago mi je što smo se upoznali." }
  },
  {
    id: "tr",
    name: "튀르키예어",
    dictUrl: "https://trdic.naver.com/#/search?query=",
    dictName: "네이버 튀르키예어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Merhaba", field3: "Merhaba, tanıştığımıza çok memnun oldum." }
  },
  {
    id: "pt",
    name: "포르투갈어",
    dictUrl: "https://ptdic.naver.com/#/search?query=",
    dictName: "네이버 포르투갈어사전",
    isRTL: false,
    sample: { field1: "안녕하세요", field2: "Olá", field3: "Olá, muito prazer em conhecê-lo." }
  },
  {
    id: "pl",
    name: "폴란드어",
    dictUrl: "https://pldic.naver.com/#/search?query=",
    dictName: "네이버 폴란드어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Cześć", field3: "Cześć, bardzo miło cię poznać." }
  },
  {
    id: "fi",
    name: "핀란드어",
    dictUrl: "https://fidic.naver.com/#/search?query=",
    dictName: "네이버 핀란드어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Hei", field3: "Hei, hauska tutustua sinuun." }
  },
  {
    id: "hu",
    name: "헝가리어",
    dictUrl: "https://hudic.naver.com/#/search?query=",
    dictName: "네이버 헝가리어사전",
    isRTL: false,
    sample: { field1: "안녕", field2: "Szia", field3: "Szia, nagyon örülök, hogy megismertelek." }
  }
];

if (typeof window !== 'undefined') {
  window.LANGUAGES_DATA = LANGUAGES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LANGUAGES_DATA;
}
