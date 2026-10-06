// 46개 언어 데이터 및 사용자 지정 네이버 사전 공식 하이퍼링크 매핑
const LANGUAGES_DATA = [
  {
    id: "en",
    name: "영어",
    dictUrl: "https://en.dict.naver.com/#/search?query=",
    dictName: "네이버 영어사전",
    isRTL: false,
    sample: { field1: "Apple", field2: "사과", field3: "/ˈæp.əl/ (명사)" }
  },
  {
    id: "ja",
    name: "일본어",
    dictUrl: "https://ja.dict.naver.com/#/search?query=",
    dictName: "네이버 일본어사전",
    isRTL: false,
    sample: { field1: "桜", field2: "벚꽃", field3: "さくら [sakura]" }
  },
  {
    id: "zh",
    name: "중국어",
    dictUrl: "https://zh.dict.naver.com/#/search?query=",
    dictName: "네이버 중국어사전",
    isRTL: false,
    sample: { field1: "你好", field2: "안녕, 안녕하세요", field3: "nǐ hǎo" }
  },
  {
    id: "fr",
    name: "프랑스어",
    dictUrl: "https://dict.naver.com/frkodict/#/search?query=",
    dictName: "네이버 프랑스어사전",
    isRTL: false,
    sample: { field1: "Bonjour", field2: "안녕하세요, 좋은 아침", field3: "[bɔ̃ʒuʁ]" }
  },
  {
    id: "es",
    name: "스페인어",
    dictUrl: "https://dict.naver.com/eskodict/#/search?query=",
    dictName: "네이버 스페인어사전",
    isRTL: false,
    sample: { field1: "Gracias", field2: "감사합니다", field3: "[ˈɡɾasjas]" }
  },
  {
    id: "de",
    name: "독일어",
    dictUrl: "https://dict.naver.com/dekodict/#/search?query=",
    dictName: "네이버 독일어사전",
    isRTL: false,
    sample: { field1: "Guten Tag", field2: "안녕하세요", field3: "[ɡuːtn̩ ˈtaːk]" }
  },
  {
    id: "vi",
    name: "베트남어",
    dictUrl: "https://dict.naver.com/vikodict/#/search?query=",
    dictName: "네이버 베트남어사전",
    isRTL: false,
    sample: { field1: "Xin chào", field2: "안녕하세요", field3: "[sin caːw˨˩]" }
  },
  {
    id: "ne",
    name: "네팔어",
    dictUrl: "https://dict.naver.com/nekodict/#/search?query=",
    dictName: "네이버 네팔어사전",
    isRTL: false,
    sample: { field1: "नमस्ते", field2: "안녕하세요", field3: "namaste" }
  },
  {
    id: "lo",
    name: "라오어",
    dictUrl: "https://dict.naver.com/lokodict/#/search?query=",
    dictName: "네이버 라오어사전",
    isRTL: false,
    sample: { field1: "ສະບາຍດີ", field2: "안녕하세요", field3: "sabaidi" }
  },
  {
    id: "mn",
    name: "몽골어",
    dictUrl: "https://dict.naver.com/mnkodict/#/search?query=",
    dictName: "네이버 몽골어사전",
    isRTL: false,
    sample: { field1: "Сайн байна уу", field2: "안녕하세요", field3: "Sain baina uu" }
  },
  {
    id: "my",
    name: "미얀마어",
    dictUrl: "https://dict.naver.com/mykodict/#/search?query=",
    dictName: "네이버 미얀마어사전",
    isRTL: false,
    sample: { field1: "မင်္ဂလာပါ", field2: "안녕하세요", field3: "mingalaba" }
  },
  {
    id: "sw",
    name: "스와힐리어",
    dictUrl: "https://dict.naver.com/swkodict/#/search?query=",
    dictName: "네이버 스와힐리어사전",
    isRTL: false,
    sample: { field1: "Habari", field2: "안녕하세요, 무슨 일인가요", field3: "[haˈɓa.ri]" }
  },
  {
    id: "ar",
    name: "아랍어",
    dictUrl: "https://dict.naver.com/arkodict/#/search?query=",
    dictName: "네이버 아랍어사전",
    isRTL: true,
    sample: { field1: "مرحبا", field2: "안녕하세요", field3: "marḥaban" }
  },
  {
    id: "ur",
    name: "우르두어",
    dictUrl: "https://dict.naver.com/urkodict/#/search?query=",
    dictName: "네이버 우르두어사전",
    isRTL: true,
    sample: { field1: "سلام", field2: "안녕하세요, 평화", field3: "salaam" }
  },
  {
    id: "uz",
    name: "우즈베크어",
    dictUrl: "https://dict.naver.com/uzkodict/#/search?query=",
    dictName: "네이버 우즈베크어사전",
    isRTL: false,
    sample: { field1: "Salom", field2: "안녕하세요", field3: "[sɒˈlɒm]" }
  },
  {
    id: "id",
    name: "인도네시아어",
    dictUrl: "https://dict.naver.com/idkodict/#/search?query=",
    dictName: "네이버 인도네시아어사전",
    isRTL: false,
    sample: { field1: "Selamat pagi", field2: "좋은 아침입니다", field3: "[səˈla.mat ˈpa.ɡi]" }
  },
  {
    id: "kk",
    name: "카자흐어",
    dictUrl: "https://dict.naver.com/kkkodict/#/search?query=",
    dictName: "네이버 카자흐어사전",
    isRTL: false,
    sample: { field1: "Сәлеметсіз бе", field2: "안녕하세요", field3: "Sälemetsiz be" }
  },
  {
    id: "km",
    name: "캄보디아어",
    dictUrl: "https://dict.naver.com/kmkodict/#/search?query=",
    dictName: "네이버 캄보디아어사전",
    isRTL: false,
    sample: { field1: "សួស្តី", field2: "안녕하세요", field3: "suostei" }
  },
  {
    id: "tl",
    name: "타갈로그어",
    dictUrl: "https://dict.naver.com/tlkodict/#/search?query=",
    dictName: "네이버 타갈로그어사전",
    isRTL: false,
    sample: { field1: "Kumusta", field2: "안녕하세요, 어떻게 지내세요", field3: "[kʊmʊsˈta]" }
  },
  {
    id: "th",
    name: "태국어",
    dictUrl: "https://dict.naver.com/thkodict/#/search?query=",
    dictName: "네이버 태국어사전",
    isRTL: false,
    sample: { field1: "สวัสดี", field2: "안녕하세요", field3: "sà-wàt-dii" }
  },
  {
    id: "tet",
    name: "테툼어",
    dictUrl: "https://dict.naver.com/tetkodict/#/search?query=",
    dictName: "네이버 테툼어사전",
    isRTL: false,
    sample: { field1: "Bondia", field2: "안녕하세요, 좋은 아침", field3: "[bonˈdi.a]" }
  },
  {
    id: "fa",
    name: "페르시아어",
    dictUrl: "https://dict.naver.com/fakodict/#/search?query=",
    dictName: "네이버 페르시아어사전",
    isRTL: true,
    sample: { field1: "سلام", field2: "안녕하세요", field3: "salām" }
  },
  {
    id: "ha",
    name: "하우사어",
    dictUrl: "https://dict.naver.com/hakodict/#/search?query=",
    dictName: "네이버 하우사어사전",
    isRTL: false,
    sample: { field1: "Sannu", field2: "안녕하세요", field3: "[sán.nùː]" }
  },
  {
    id: "he",
    name: "히브리어(현대)",
    dictUrl: "https://dict.naver.com/hekodict/#/search?query=",
    dictName: "네이버 히브리어사전",
    isRTL: true,
    sample: { field1: "שלום", field2: "안녕하세요, 평화", field3: "Shalom" }
  },
  {
    id: "hbo",
    name: "히브리어(고대)",
    dictUrl: "https://dict.naver.com/hbokodict/#/search?query=",
    dictName: "네이버 고대 히브리어사전",
    isRTL: true,
    sample: { field1: "שָׁלוֹם", field2: "평화, 온전함 (샬롬)", field3: "šālôm" }
  },
  {
    id: "hi",
    name: "힌디어",
    dictUrl: "https://dict.naver.com/hikodict/#/search?query=",
    dictName: "네이버 힌디어사전",
    isRTL: false,
    sample: { field1: "नमस्ते", field2: "안녕하세요", field3: "namaste" }
  },
  {
    id: "el",
    name: "그리스어(현대)",
    dictUrl: "https://dict.naver.com/elkodict/#/search?query=",
    dictName: "네이버 현대 그리스어사전",
    isRTL: false,
    sample: { field1: "Γεια σας", field2: "안녕하세요", field3: "[ˈʝa sas]" }
  },
  {
    id: "grc",
    name: "그리스어(고대)",
    dictUrl: "https://dict.naver.com/elkodict/#/search?query=",
    dictName: "네이버 고대 그리스어사전",
    isRTL: false,
    sample: { field1: "λόγος", field2: "말, 로고스, 이성", field3: "lógos" }
  },
  {
    id: "nl",
    name: "네덜란드어",
    dictUrl: "https://dict.naver.com/nlkodict/#/search?query=",
    dictName: "네이버 네덜란드어사전",
    isRTL: false,
    sample: { field1: "Hallo", field2: "안녕하세요", field3: "[ˈɦɑloː]" }
  },
  {
    id: "no",
    name: "노르웨이어",
    dictUrl: "https://dict.naver.com/nokodict/#/search?query=",
    dictName: "네이버 노르웨이어사전",
    isRTL: false,
    sample: { field1: "Hei", field2: "안녕", field3: "[hæɪ̯]" }
  },
  {
    id: "da",
    name: "덴마크어",
    dictUrl: "https://dict.naver.com/dakodict/#/search?query=",
    dictName: "네이버 덴마크어사전",
    isRTL: false,
    sample: { field1: "Hej", field2: "안녕", field3: "[hɑj]" }
  },
  {
    id: "la",
    name: "라틴어",
    dictUrl: "https://dict.naver.com/lakodict/#/search?query=",
    dictName: "네이버 라틴어사전",
    isRTL: false,
    sample: { field1: "Salve", field2: "안녕하세요, 평안하길", field3: "[ˈsaɫ.weː]" }
  },
  {
    id: "ru",
    name: "러시아어",
    dictUrl: "https://dict.naver.com/rukodict/#/search?query=",
    dictName: "네이버 러시아어사전",
    isRTL: false,
    sample: { field1: "Здравствуйте", field2: "안녕하세요", field3: "[ˈzdrastvʊjtʲe]" }
  },
  {
    id: "ro",
    name: "루마니아어",
    dictUrl: "https://dict.naver.com/rokodict/#/search?query=",
    dictName: "네이버 루마니아어사전",
    isRTL: false,
    sample: { field1: "Bună ziua", field2: "안녕하세요", field3: "[ˈbunə ˈziwa]" }
  },
  {
    id: "sv",
    name: "스웨덴어",
    dictUrl: "https://dict.naver.com/svkodict/#/search?query=",
    dictName: "네이버 스웨덴어사전",
    isRTL: false,
    sample: { field1: "Hej", field2: "안녕", field3: "[hɛj]" }
  },
  {
    id: "sq",
    name: "알바니아어",
    dictUrl: "https://dict.naver.com/sqkodict/#/search?query=",
    dictName: "네이버 알바니아어사전",
    isRTL: false,
    sample: { field1: "Përshëndetje", field2: "안녕하세요", field3: "[pəɾʃənˈdɛt.jɛ]" }
  },
  {
    id: "uk",
    name: "우크라이나어",
    dictUrl: "https://dict.naver.com/ukkodict/#/search?query=",
    dictName: "네이버 우크라이나어사전",
    isRTL: false,
    sample: { field1: "Добрий день", field2: "안녕하세요", field3: "[ˈdɔbrɪj dɛnʲ]" }
  },
  {
    id: "it",
    name: "이탈리아어",
    dictUrl: "https://dict.naver.com/itkodict/#/search?query=",
    dictName: "네이버 이탈리아어사전",
    isRTL: false,
    sample: { field1: "Ciao", field2: "안녕", field3: "[ˈtʃaːo]" }
  },
  {
    id: "ka",
    name: "조지아어",
    dictUrl: "https://dict.naver.com/kakodict/#/search?query=",
    dictName: "네이버 조지아어사전",
    isRTL: false,
    sample: { field1: "გამარჯობა", field2: "안녕하세요", field3: "gamarjoba" }
  },
  {
    id: "cs",
    name: "체코어",
    dictUrl: "https://dict.naver.com/cskodict/#/search?query=",
    dictName: "네이버 체코어사전",
    isRTL: false,
    sample: { field1: "Dobrý den", field2: "안녕하세요", field3: "[ˈdobriː dɛn]" }
  },
  {
    id: "hr",
    name: "크로아티아어",
    dictUrl: "https://dict.naver.com/hrkodict/#/search?query=",
    dictName: "네이버 크로아티아어사전",
    isRTL: false,
    sample: { field1: "Dobar dan", field2: "안녕하세요", field3: "[dǒbaːr dâːn]" }
  },
  {
    id: "tr",
    name: "튀르키예어",
    dictUrl: "https://dict.naver.com/trkodict/#/search?query=",
    dictName: "네이버 튀르키예어사전",
    isRTL: false,
    sample: { field1: "Merhaba", field2: "안녕하세요", field3: "[meɾhaˈba]" }
  },
  {
    id: "pt",
    name: "포르투갈어",
    dictUrl: "https://dict.naver.com/ptkodict/#/search?query=",
    dictName: "네이버 포르투갈어사전",
    isRTL: false,
    sample: { field1: "Olá", field2: "안녕하세요", field3: "[ɔˈla]" }
  },
  {
    id: "pl",
    name: "폴란드어",
    dictUrl: "https://dict.naver.com/plkodict/#/search?query=",
    dictName: "네이버 폴란드어사전",
    isRTL: false,
    sample: { field1: "Cześć", field2: "안녕", field3: "[t͡ʂɛɕt͡ɕ]" }
  },
  {
    id: "fi",
    name: "핀란드어",
    dictUrl: "https://dict.naver.com/fikodict/#/search?query=",
    dictName: "네이버 핀란드어사전",
    isRTL: false,
    sample: { field1: "Hei", field2: "안녕", field3: "[hei̯]" }
  },
  {
    id: "hu",
    name: "헝가리어",
    dictUrl: "https://dict.naver.com/hukodict/#/search?query=",
    dictName: "네이버 헝가리어사전",
    isRTL: false,
    sample: { field1: "Szia", field2: "안녕", field3: "[ˈsijɒ]" }
  }
];

if (typeof window !== 'undefined') {
  window.LANGUAGES_DATA = LANGUAGES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LANGUAGES_DATA;
}
