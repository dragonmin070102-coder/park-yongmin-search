const resources = [
  {
    id: "mi",
    title: "Myocardial ischemia and infarction",
    displayTitle: "심근허혈 vs 심근경색",
    type: "심혈관",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1aTqToxtbH1B9Sqr00j2nQ4Lx21ed6r1v/view?usp=drivesdk",
    tags: ["MI", "ischemia", "infarction", "ECG", "ST elevation", "ST depression", "NTG", "plaque", "흉통"],
    summary: "stable plaque와 unstable plaque의 차이에서 시작해 허혈과 경색이 왜 다르게 나타나는지 설명하는 자료입니다.",
    points: [
      "허혈은 산소 공급이 수요보다 부족해지는 상태이며, 보통 휴식이나 NTG에 반응합니다.",
      "경색은 plaque rupture와 혈전 형성으로 혈관이 막혀 심근 손상이 진행되는 상황입니다.",
      "자료에서는 ischemia는 ST depression, infarction은 ST elevation으로 연결해 ECG 원리를 설명합니다."
    ],
    useCase: "협심증과 심근경색 차이, ST 변화 원리, 흉통 환자 설명 자료가 필요할 때",
    confidence: "본문 확인"
  },
  {
    id: "acs-ecg",
    title: "ACS + ECG",
    displayTitle: "ACS와 ECG",
    type: "심혈관",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1xfPlC4hBOCJJtfLiDMn3_9XrshpEjdHd/view?usp=drivesdk",
    tags: ["ACS", "ECG", "STEMI", "NSTEMI", "협심증", "심근경색", "흉통"],
    summary: "급성관상동맥증후군을 ECG 변화와 연결해서 볼 수 있는 자료입니다.",
    points: [
      "흉통 환자를 ACS 관점으로 분류할 때 유용합니다.",
      "ECG 키워드로 같이 검색되도록 묶어두면 심근경색 자료와 연결성이 좋습니다.",
      "영상에서 짧게 설명하고 자세한 판단 기준은 원본 PDF로 넘기기 좋은 자료입니다."
    ],
    useCase: "흉통, ACS, ECG 판독 흐름을 한 번에 찾게 하고 싶을 때",
    confidence: "파일 확인"
  },
  {
    id: "iicp",
    title: "IICP management",
    displayTitle: "두개내압 상승 관리",
    type: "신경계",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1c0o7fDaGoYst9PbLAj83FG1zWXVH1cjq/view?usp=drivesdk",
    tags: ["IICP", "ICP", "두개내압", "신경계", "뇌압", "의식", "간호중재"],
    summary: "두개내압 상승 상황에서 관찰해야 할 변화와 관리 방향을 찾기 좋은 자료입니다.",
    points: [
      "신경계 환자 사정과 우선순위 간호를 연결하기 좋습니다.",
      "의식 변화, 활력징후, 체위, 자극 최소화 같은 검색어와 함께 노출되면 좋습니다.",
      "신경계 질환 폴더 자료와 묶어 추천하면 체류 시간이 늘어납니다."
    ],
    useCase: "IICP 간호중재, 신경계 중환자 사정, 케이스 스터디 보조",
    confidence: "파일 확인"
  },
  {
    id: "pneumothorax-cxr",
    title: "pneumothorax에서의 CXR",
    displayTitle: "기흉 CXR 읽기",
    type: "호흡기",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1Mx8exaX4IpWS7KvAR9EEvOSoLo3PFDYP/view?usp=drivesdk",
    tags: ["pneumothorax", "기흉", "CXR", "Chest X-ray", "흉부", "호흡곤란"],
    summary: "기흉을 흉부 X-ray에서 어떻게 봐야 하는지 연결해 보여줄 수 있는 영상 보조 자료입니다.",
    points: [
      "CXR 검색 시 ACS/ECG와 별도로 흉부 영상 자료로 노출되게 구성했습니다.",
      "기흉의 임상 증상과 영상 소견을 연결하는 카드형 설명에 적합합니다.",
      "학생들이 Chest PA/AP, CXR 같은 실무형 콘텐츠에서 같이 찾을 가능성이 큽니다."
    ],
    useCase: "기흉 영상 소견, 흉부 X-ray 기초 설명, 실습 전 빠른 확인",
    confidence: "파일 확인"
  },
  {
    id: "ast-alt-ratio",
    title: "AST:ALT 수치비교 해석",
    displayTitle: "AST/ALT 수치 비교",
    type: "검사수치",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1JyQF5XsHs48UPl_GTM3SJpba5J1DDcMu/view?usp=drivesdk",
    tags: ["AST", "ALT", "간수치", "검사수치", "liver", "비교"],
    summary: "AST와 ALT를 따로 외우는 대신 수치 비교와 해석 흐름으로 볼 수 있는 자료입니다.",
    points: [
      "검사수치 검색의 대표 입구로 두기 좋습니다.",
      "AST 단독, ALT 단독 자료와 상호 추천되도록 묶었습니다.",
      "간호학과 학생들이 케이스 lab data 해석할 때 바로 찾을 가능성이 큽니다."
    ],
    useCase: "lab 해석, 간수치 비교, 케이스 스터디 검사 결과 설명",
    confidence: "파일 확인"
  },
  {
    id: "ast",
    title: "Aspartate aminotransferase",
    displayTitle: "AST 설명",
    type: "검사수치",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1ukDpuad1OtJHQR2_4TjRwlZq8X5hk0-Z/view?usp=drivesdk",
    tags: ["AST", "Aspartate aminotransferase", "간수치", "검사", "lab"],
    summary: "AST가 무엇을 반영하는지 따로 확인할 수 있는 검사수치 자료입니다.",
    points: [
      "AST/ALT 비교 자료로 넘어가기 전 기초 설명 카드로 쓰기 좋습니다.",
      "검사수치 카테고리에 묶어 두면 검색 경험이 깔끔합니다.",
      "ALT 자료와 나란히 보여주면 학습자가 차이를 빠르게 잡을 수 있습니다."
    ],
    useCase: "AST 단독 개념 확인, 검사 결과 해석 보조",
    confidence: "파일 확인"
  },
  {
    id: "alt",
    title: "Alanine aminotransferase",
    displayTitle: "ALT 설명",
    type: "검사수치",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1sVakiSM1lqXKwiAvbaxGBXWds5d6zwKw/view?usp=drivesdk",
    tags: ["ALT", "Alanine aminotransferase", "간수치", "검사", "lab"],
    summary: "ALT의 의미와 간 관련 검사 해석을 찾을 수 있는 자료입니다.",
    points: [
      "AST 자료와 함께 검사수치 검색의 기본 묶음으로 좋습니다.",
      "케이스 스터디에서 lab abnormality 설명으로 연결하기 좋습니다.",
      "비교형 자료보다 먼저 보는 기초 카드로 배치할 수 있습니다."
    ],
    useCase: "ALT 단독 개념 확인, 간수치 해석 보조",
    confidence: "파일 확인"
  },
  {
    id: "thyroidectomy",
    title: "thyroidectomy",
    displayTitle: "갑상선절제술",
    type: "수술간호",
    format: "PDF",
    source: "박용민 컨텐츠 정리본 PDF",
    url: "https://drive.google.com/file/d/1zwkzOFX8v9nLOIs47W_kUJC9Sx5hKmAj/view?usp=drivesdk",
    tags: ["thyroidectomy", "갑상선절제술", "수술간호", "합병증", "칼슘", "기도"],
    summary: "갑상선절제술 전후 간호와 합병증 포인트를 찾는 데 쓸 수 있는 자료입니다.",
    points: [
      "수술간호 카테고리의 시작 자료로 좋습니다.",
      "기도, 출혈, 저칼슘혈증 같은 핵심 키워드와 연결될 수 있습니다.",
      "케이스 과제에서 수술 후 관찰 포인트를 찾는 사용자에게 적합합니다."
    ],
    useCase: "수술 전후 간호, 갑상선 수술 합병증 확인",
    confidence: "파일 확인"
  },
  {
    id: "ms",
    title: "MS 임상추론 박용민",
    displayTitle: "다발성경화증 임상추론",
    type: "신경계",
    format: "PDF",
    source: "신경계 질환 폴더",
    url: "https://drive.google.com/file/d/16RhNgiR8NTJI8bTgxJYpi-pihKDqZahY/view?usp=drivesdk",
    tags: ["MS", "multiple sclerosis", "다발성경화증", "신경계", "임상추론"],
    summary: "MS를 신경계 임상추론 관점에서 찾을 수 있는 자료입니다.",
    points: [
      "신경계 감별 학습에서 MG, GBS, ALS, PD 자료와 같이 추천하기 좋습니다.",
      "질환명 약어로 검색해도 나오도록 태그를 넣었습니다.",
      "학생들이 헷갈리는 신경계 질환 묶음의 한 축으로 쓰기 좋습니다."
    ],
    useCase: "신경계 질환 감별, MS 케이스 정리, 임상추론 학습",
    confidence: "파일 확인"
  },
  {
    id: "mg",
    title: "MG 임상추론 박용민",
    displayTitle: "중증근무력증 임상추론",
    type: "신경계",
    format: "PDF",
    source: "신경계 질환 폴더",
    url: "https://drive.google.com/file/d/1H4nkqNIevngtKMr56ajvp8TWRzKSGbJu/view?usp=drivesdk",
    tags: ["MG", "myasthenia gravis", "중증근무력증", "신경계", "근력저하", "임상추론"],
    summary: "MG를 임상추론 방식으로 정리한 신경계 질환 자료입니다.",
    points: [
      "근력저하, 피로, 호흡근 약화 같은 키워드와 연결되도록 설계했습니다.",
      "GBS, ALS와 비교해 찾는 사용자를 고려해 신경계 묶음으로 배치했습니다.",
      "간호학과 케이스에서 증상 변화와 우선순위 설명에 유용합니다."
    ],
    useCase: "중증근무력증 감별, 신경근 질환 정리",
    confidence: "파일 확인"
  },
  {
    id: "pd",
    title: "PD 임상추론 박용민",
    displayTitle: "파킨슨병 임상추론",
    type: "신경계",
    format: "PDF",
    source: "신경계 질환 폴더",
    url: "https://drive.google.com/file/d/1wW1zdJ06-cJzHl6b1PkdQWKzmntl58tg/view?usp=drivesdk",
    tags: ["PD", "Parkinson disease", "파킨슨병", "신경계", "운동증상", "임상추론"],
    summary: "파킨슨병을 임상추론 관점에서 학습할 수 있는 자료입니다.",
    points: [
      "떨림, 서동, 강직 등 운동증상 검색과 연결하기 좋습니다.",
      "신경계 질환 폴더의 다른 임상추론 PDF와 함께 보여주면 좋습니다.",
      "노인간호와 신경계 케이스 모두에서 찾을 수 있게 태그를 넓게 잡았습니다."
    ],
    useCase: "파킨슨병 증상 이해, 신경계 케이스 스터디",
    confidence: "파일 확인"
  },
  {
    id: "gbs",
    title: "GBS 임상추론 박용민",
    displayTitle: "길랭-바레 증후군 임상추론",
    type: "신경계",
    format: "PDF",
    source: "신경계 질환 폴더",
    url: "https://drive.google.com/file/d/1qI6H7NXcWDEIq5Hq8eGJSyYGWozFN9jp/view?usp=drivesdk",
    tags: ["GBS", "Guillain-Barre", "길랭바레", "신경계", "상행성 마비", "임상추론"],
    summary: "GBS를 신경계 임상추론 콘텐츠로 연결하는 자료입니다.",
    points: [
      "상행성 마비, 호흡근 침범, 신경계 감별 키워드와 잘 맞습니다.",
      "콘텐츠 분석 문서에서 판단형 콘텐츠는 댓글 반응이 좋은 축으로 확인됐습니다.",
      "학생들이 감별 포인트를 찾을 때 상세 PDF로 연결하기 좋습니다."
    ],
    useCase: "GBS 감별, 신경계 응급 사정, 호흡근 약화 포인트",
    confidence: "파일 확인"
  },
  {
    id: "als",
    title: "ALS 임상추론 박용민",
    displayTitle: "ALS 임상추론",
    type: "신경계",
    format: "PDF",
    source: "신경계 질환 폴더",
    url: "https://drive.google.com/file/d/1GanISYp5A5b3zPlj0fY37zjlJ3VGdH6r/view?usp=drivesdk",
    tags: ["ALS", "amyotrophic lateral sclerosis", "루게릭", "신경계", "운동신경원", "임상추론"],
    summary: "ALS를 신경계 임상추론 흐름으로 찾을 수 있는 자료입니다.",
    points: [
      "운동신경원 질환과 진행성 근력저하 키워드로 검색되게 구성했습니다.",
      "MS, MG, GBS와 비교 검색될 수 있게 신경계 카테고리에 묶었습니다.",
      "긴 설명보다 원본 자료로 넘어가는 길을 분명하게 보여주는 카드가 좋습니다."
    ],
    useCase: "ALS 개념 정리, 신경계 질환 비교, 임상추론 학습",
    confidence: "파일 확인"
  }
];

const classification = {
  mi: {
    system: "심혈관",
    intent: "개념이해",
    stage: "심화",
    evidence: "본문에서 stable plaque와 vulnerable plaque, ischemia와 infarction, ST depression/elevation의 차이를 연결해 설명합니다.",
    related: ["acs-ecg"],
    keywords: ["협심증", "심근경색", "ST 변화", "plaque rupture", "NTG 반응"]
  },
  "acs-ecg": {
    system: "심혈관",
    intent: "감별정리",
    stage: "핵심",
    evidence: "본문에서 흉통 4단계 구조를 좁아짐, 터짐, 부분막힘, 완전막힘으로 정리하고 Stable angina, Unstable angina, NSTEMI, STEMI를 비교합니다.",
    related: ["mi"],
    keywords: ["흉통 4단계", "Troponin", "NSTEMI", "STEMI", "ECG vector"]
  },
  iicp: {
    system: "신경계",
    intent: "간호중재",
    stage: "핵심",
    evidence: "Drive에 IICP management PDF로 확인된 자료입니다. 신경계 사정과 두개내압 상승 관리 자료로 분류했습니다.",
    related: ["gbs", "als", "ms"],
    keywords: ["두개내압", "의식 변화", "신경계 사정", "중환자"]
  },
  "pneumothorax-cxr": {
    system: "호흡기",
    intent: "영상판독",
    stage: "기초",
    evidence: "Drive에 pneumothorax에서의 CXR PDF로 확인된 자료입니다. 흉부 X-ray와 기흉 검색에 우선 노출되도록 분류했습니다.",
    related: ["acs-ecg"],
    keywords: ["기흉", "CXR", "Chest X-ray", "흉부 영상"]
  },
  "ast-alt-ratio": {
    system: "검사수치",
    intent: "검사해석",
    stage: "핵심",
    evidence: "본문에서 AST/ALT 비율을 단순 간수치 상승이 아니라 간세포와 미토콘드리아 중 어디서부터 손상됐는지 읽는 지표로 설명합니다.",
    related: ["ast", "alt"],
    keywords: ["AST/ALT ratio", "미토콘드리아 손상", "세포질 손상", "간수치"]
  },
  ast: {
    system: "검사수치",
    intent: "검사해석",
    stage: "기초",
    evidence: "Drive에 Aspartate aminotransferase PDF로 확인된 자료입니다. AST 단독 개념과 AST/ALT 비교 전 기초 자료로 분류했습니다.",
    related: ["ast-alt-ratio", "alt"],
    keywords: ["AST", "Aspartate aminotransferase", "간수치"]
  },
  alt: {
    system: "검사수치",
    intent: "검사해석",
    stage: "기초",
    evidence: "Drive에 Alanine aminotransferase PDF로 확인된 자료입니다. ALT 단독 개념과 AST/ALT 비교 전 기초 자료로 분류했습니다.",
    related: ["ast-alt-ratio", "ast"],
    keywords: ["ALT", "Alanine aminotransferase", "간수치"]
  },
  thyroidectomy: {
    system: "수술간호",
    intent: "간호중재",
    stage: "핵심",
    evidence: "Drive에 thyroidectomy PDF로 확인된 자료입니다. 갑상선절제술 전후 관찰과 합병증 키워드로 분류했습니다.",
    related: [],
    keywords: ["갑상선절제술", "기도", "출혈", "저칼슘혈증"]
  },
  ms: {
    system: "신경계",
    intent: "임상추론",
    stage: "심화",
    evidence: "신경계 질환 폴더에서 MS 임상추론 PDF로 확인된 자료입니다. 신경계 질환 감별 묶음에 포함했습니다.",
    related: ["mg", "gbs", "als", "pd"],
    keywords: ["MS", "다발성경화증", "신경계 감별"]
  },
  mg: {
    system: "신경계",
    intent: "임상추론",
    stage: "심화",
    evidence: "신경계 질환 폴더에서 MG 임상추론 PDF로 확인된 자료입니다. 근력저하와 신경근 질환 감별로 분류했습니다.",
    related: ["gbs", "als", "ms"],
    keywords: ["MG", "중증근무력증", "근력저하", "호흡근"]
  },
  pd: {
    system: "신경계",
    intent: "임상추론",
    stage: "심화",
    evidence: "신경계 질환 폴더에서 PD 임상추론 PDF로 확인된 자료입니다. 운동증상과 노인 신경계 케이스로 분류했습니다.",
    related: ["ms", "mg", "gbs"],
    keywords: ["PD", "파킨슨병", "운동증상", "서동", "강직"]
  },
  gbs: {
    system: "신경계",
    intent: "임상추론",
    stage: "심화",
    evidence: "신경계 질환 폴더에서 GBS 임상추론 PDF로 확인된 자료입니다. 상행성 마비와 호흡근 침범 감별 키워드로 분류했습니다.",
    related: ["mg", "als", "ms"],
    keywords: ["GBS", "길랭바레", "상행성 마비", "호흡근"]
  },
  als: {
    system: "신경계",
    intent: "임상추론",
    stage: "심화",
    evidence: "신경계 질환 폴더에서 ALS 임상추론 PDF로 확인된 자료입니다. 운동신경원 질환과 진행성 근력저하로 분류했습니다.",
    related: ["mg", "gbs", "ms"],
    keywords: ["ALS", "루게릭", "운동신경원", "진행성 근력저하"]
  }
};

const featuredOrder = ["acs-ecg", "mi", "iicp", "ast-alt-ratio", "pneumothorax-cxr", "gbs", "mg", "als", "ms", "pd", "thyroidectomy", "ast", "alt"];

resources.forEach((resource) => {
  Object.assign(resource, classification[resource.id]);
  resource.rank = featuredOrder.indexOf(resource.id);
  resource.tags = Array.from(new Set([...resource.tags, ...(resource.keywords || []), resource.system, resource.intent, resource.stage]));
});

const queryInput = document.querySelector("#query");
const form = document.querySelector("#search");
const filters = document.querySelector("#filters");
const categoryGrid = document.querySelector("#categoryGrid");
const grid = document.querySelector("#resultGrid");
const detail = document.querySelector("#detail");
const resultMeta = document.querySelector("#resultMeta");
const resourceCount = document.querySelector("#resourceCount");
const toast = document.querySelector("#toast");
const previewModal = document.querySelector("#previewModal");
const modalContent = document.querySelector("#modalContent");

let activeType = "전체";
let activeIntent = "전체";
let activeResource = resources[0];

resourceCount.textContent = `${resources.length}개`;
renderCategoryHub();
renderFilters();
renderResults();
renderDetail(activeResource);

categoryGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-category]");
  if (!card) return;

  activeType = card.dataset.category;
  queryInput.value = "";
  renderCategoryHub();
  renderFilters();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

queryInput.addEventListener("input", () => renderResults());

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.query;
    renderResults();
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closePreviewModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !previewModal.hidden) {
    closePreviewModal();
  }
});

function renderFilters() {
  const systems = ["전체", ...Array.from(new Set(resources.map((resource) => resource.system)))];
  const intents = ["전체", ...Array.from(new Set(resources.map((resource) => resource.intent)))];
  filters.innerHTML = `
    ${filterGroupTemplate("계통 분류", "type", systems, activeType)}
    ${filterGroupTemplate("사용 목적", "intent", intents, activeIntent)}
  `;

  filters.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.type;
      if (activeType === "전체") {
        queryInput.value = "";
      }
      renderCategoryHub();
      renderFilters();
      renderResults();
    });
  });

  filters.querySelectorAll("[data-intent]").forEach((button) => {
    button.addEventListener("click", () => {
      activeIntent = button.dataset.intent;
      if (activeIntent === "전체") {
        queryInput.value = "";
      }
      renderFilters();
      renderResults();
    });
  });
}

function renderCategoryHub() {
  const categoryMeta = [
    { system: "전체", title: "전체 자료", description: "박용민 PDF 폴더 자료를 한 번에 봐요.", accent: "blue" },
    { system: "심혈관", title: "심혈관", description: "ACS, ECG, 허혈과 경색 흐름을 정리했어요.", accent: "red" },
    { system: "신경계", title: "신경계", description: "IICP와 임상추론 자료를 모아봤어요.", accent: "purple" },
    { system: "검사수치", title: "검사수치", description: "AST, ALT, 간수치 해석을 빠르게 찾아요.", accent: "green" },
    { system: "호흡기", title: "호흡기", description: "기흉과 흉부 X-ray 자료를 확인해요.", accent: "cyan" },
    { system: "수술간호", title: "수술간호", description: "수술 전후 관찰 포인트를 찾아요.", accent: "gray" }
  ];

  categoryGrid.innerHTML = categoryMeta.map((item) => {
    const count = item.system === "전체" ? resources.length : resources.filter((resource) => resource.system === item.system).length;
    const active = activeType === item.system ? "active" : "";
    return `
      <button class="category-card ${active}" type="button" data-category="${escapeHtml(item.system)}">
        <span class="category-dot ${escapeHtml(item.accent)}"></span>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
        <em>${count}개</em>
      </button>
    `;
  }).join("");

}

function filterGroupTemplate(title, key, values, activeValue) {
  return `
    <div class="filter-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="filter-list">
        ${values.map((value) => {
          const count = value === "전체" ? resources.length : resources.filter((resource) => resource[key === "type" ? "system" : "intent"] === value).length;
          return `<button type="button" class="${value === activeValue ? "active" : ""}" data-${key}="${escapeHtml(value)}">${escapeHtml(value)} <span>${count}</span></button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderResults() {
  const query = queryInput.value.trim();
  const matches = scoreResources(query)
    .filter((item) => activeType === "전체" || item.resource.system === activeType)
    .filter((item) => activeIntent === "전체" || item.resource.intent === activeIntent)
    .filter((item) => query.length === 0 || item.score > 0);

  const sorted = matches.sort((a, b) => b.score - a.score || a.resource.rank - b.resource.rank || a.resource.displayTitle.localeCompare(b.resource.displayTitle, "ko"));
  resultMeta.textContent = `${sorted.length}개 자료`;

  if (!sorted.some((item) => item.resource.id === activeResource.id)) {
    activeResource = sorted[0]?.resource || resources[0];
  }

  grid.innerHTML = sorted.length ? sorted.map(({ resource, score }) => cardTemplate(resource, score, query.length > 0)).join("") : emptyTemplate(query);

  grid.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      activeResource = resources.find((resource) => resource.id === button.dataset.open);
      renderResults();
      renderDetail(activeResource);
      openPreviewModal(activeResource);
    });
  });

  grid.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const resource = resources.find((item) => item.id === button.dataset.copy);
      await copyResource(resource);
    });
  });

  grid.querySelectorAll("[data-clear-query]").forEach((button) => {
    button.addEventListener("click", () => {
      queryInput.value = "";
      renderResults();
      queryInput.focus();
    });
  });

  renderDetail(activeResource);
}

function scoreResources(query) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return resources.map((resource) => {
    const haystack = [
      resource.title,
      resource.displayTitle,
      resource.type,
      resource.format,
      resource.system,
      resource.intent,
      resource.stage,
      resource.evidence,
      resource.summary,
      resource.useCase,
      resource.tags.join(" "),
      resource.points.join(" ")
    ].join(" ").toLowerCase();

    const score = tokens.reduce((sum, token) => {
      if (resource.displayTitle.toLowerCase().includes(token)) return sum + 8;
      if (resource.tags.join(" ").toLowerCase().includes(token)) return sum + 6;
      if (haystack.includes(token)) return sum + 3;
      return sum;
    }, query ? 0 : 1);

    return { resource, score };
  });
}

function cardTemplate(resource, score, hasQuery) {
  const selected = resource.id === activeResource.id ? "selected" : "";
  const scoreText = hasQuery && score > 0 ? "관련도 높음" : "추천";
  return `
    <article class="resource-card ${selected}">
      <div class="card-top">
        <div>
          <div class="badge-row">
            <span class="badge hot">${escapeHtml(resource.type)}</span>
            <span class="badge">${escapeHtml(resource.intent)}</span>
          </div>
          <h3>${escapeHtml(resource.displayTitle)}</h3>
          <p>${escapeHtml(resource.summary)}</p>
        </div>
        <div class="score">${escapeHtml(scoreText)}</div>
      </div>
      <div class="inline-source">
        <span>${escapeHtml(resource.stage)} · ${escapeHtml(resource.confidence)} · ${escapeHtml(resource.source)}</span>
      </div>
      <div class="card-actions">
        <button type="button" data-open="${escapeHtml(resource.id)}">미리보기</button>
        <a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">원본 열기</a>
      </div>
    </article>
  `;
}

function emptyTemplate(query) {
  const hasActiveFilters = activeType !== "전체" || activeIntent !== "전체";
  const filterText = [
    activeType !== "전체" ? activeType : null,
    activeIntent !== "전체" ? activeIntent : null
  ].filter(Boolean).join(" + ");

  return `
    <article class="resource-card">
      <h3>검색 결과가 없어요</h3>
      <p>"${escapeHtml(query)}" 검색어와 정확히 맞는 자료가 아직 없습니다. ${hasActiveFilters ? `${escapeHtml(filterText)} 필터와 검색어가 같이 적용 중이에요.` : "태그를 추가하거나 Drive 자료를 더 색인하면 바로 확장할 수 있어요."}</p>
      <div class="card-actions">
        ${query ? `<button type="button" data-clear-query>검색어 지우기</button>` : ""}
      </div>
    </article>
  `;
}

function renderDetail(resource) {
  if (!resource) return;

  detail.innerHTML = `
    ${detailTemplate(resource)}
  `;

  detail.querySelectorAll("[data-detail-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = resources.find((item) => item.id === button.dataset.detailCopy);
      await copyResource(target);
    });
  });
}

function detailTemplate(resource) {
  return `
    <div class="detail-body">
      <div class="badge-row">
        <span class="badge hot">${escapeHtml(resource.type)}</span>
        <span class="badge">${escapeHtml(resource.intent)}</span>
        <span class="badge">${escapeHtml(resource.stage)}</span>
        <span class="badge">${escapeHtml(resource.format)}</span>
        <span class="badge">${escapeHtml(resource.source)}</span>
      </div>
      <h3 class="detail-title" id="modalTitle">${escapeHtml(resource.displayTitle)}</h3>
      <p class="detail-summary">${escapeHtml(resource.summary)}</p>
      <div class="detail-section">
        <h3>간단 설명</h3>
        <ul>
          ${resource.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </div>
      <div class="detail-section">
        <h3>자료 근거</h3>
        <p class="detail-summary">${escapeHtml(resource.evidence)}</p>
      </div>
      <div class="detail-section">
        <h3>이럴 때 보여주기</h3>
        <p class="detail-summary">${escapeHtml(resource.useCase)}</p>
      </div>
      <div class="detail-section">
        <h3>같이 보면 좋은 자료</h3>
        <div class="related-list">
          ${relatedTemplate(resource)}
        </div>
      </div>
      <div class="detail-section">
        <h3>검색 태그</h3>
        <div class="badge-row">
          ${resource.tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <div class="detail-actions">
        <button type="button" data-detail-copy="${escapeHtml(resource.id)}">요약과 링크 복사</button>
        <a class="detail-link" href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">원본 Drive 자료 열기</a>
      </div>
    </div>
  `;
}

function relatedTemplate(resource) {
  const related = (resource.related || [])
    .map((id) => resources.find((item) => item.id === id))
    .filter(Boolean);

  if (!related.length) {
    return `<p class="detail-summary">아직 연결된 관련 자료가 없습니다.</p>`;
  }

  return related.map((item) => `
    <a class="related-card" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(item.displayTitle)}</strong>
      <span>${escapeHtml(item.intent)} · ${escapeHtml(item.system)}</span>
    </a>
  `).join("");
}

function openPreviewModal(resource) {
  modalContent.innerHTML = detailTemplate(resource);
  modalContent.querySelectorAll("[data-detail-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = resources.find((item) => item.id === button.dataset.detailCopy);
      await copyResource(target);
    });
  });
  previewModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closePreviewModal() {
  previewModal.hidden = true;
  document.body.style.overflow = "";
}

async function copyResource(resource) {
  const text = [
    `${resource.displayTitle}`,
    "",
    resource.summary,
    "",
    "핵심 포인트",
    ...resource.points.map((point) => `- ${point}`),
    "",
    `자료 근거: ${resource.evidence}`,
    `분류: ${resource.system} / ${resource.intent} / ${resource.stage}`,
    "",
    `원본 자료: ${resource.url}`
  ].join("\n");

  try {
    await writeClipboardText(text);
    showToast("요약과 Drive 링크를 복사했어요");
  } catch {
    showCopyFallback(text);
    showToast("복사 권한이 막혀서 텍스트를 열어뒀어요");
  }
}

async function writeClipboardText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for browsers or embedded previews that expose clipboard but block writes.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("copy command failed");
  }
}

function showCopyFallback(text) {
  const host = previewModal.hidden ? detail : modalContent;
  const existing = host.querySelector(".copy-fallback");
  if (existing) {
    existing.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.className = "copy-fallback";
  wrapper.innerHTML = `
    <p>브라우저 복사 권한이 막혔어요. 아래 내용이 자동 선택되어 있으니 Cmd+C로 복사하세요.</p>
    <textarea aria-label="복사용 요약 텍스트"></textarea>
  `;
  const textarea = wrapper.querySelector("textarea");
  textarea.value = text;
  host.querySelector(".detail-body")?.append(wrapper);
  textarea.focus();
  textarea.select();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}
