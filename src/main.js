const RESOURCE_DATA_URL = "./data/resources.json?v=20260610-6";

let resources = normalizeResourceData(await loadResourceData());

async function loadResourceData() {
  const response = await fetch(RESOURCE_DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Resource data load failed: ${response.status}`);
  }
  return response.json();
}

function normalizeResourceData(payload) {
  const items = Array.isArray(payload) ? payload : payload.resources;
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Resource data is empty");
  }

  return items.map((resource, index) => {
    const normalized = {
      ...resource,
      rank: Number.isFinite(resource.rank) ? resource.rank : index,
      points: Array.isArray(resource.points) ? resource.points : [],
      tags: Array.isArray(resource.tags) ? resource.tags : [],
      keywords: Array.isArray(resource.keywords) ? resource.keywords : [],
      related: Array.isArray(resource.related) ? resource.related : []
    };

    normalized.tags = Array.from(new Set([
      ...normalized.tags,
      ...normalized.keywords,
      normalized.system,
      normalized.intent,
      normalized.stage
    ].filter(Boolean)));

    return normalized;
  }).sort((a, b) => a.rank - b.rank || a.displayTitle.localeCompare(b.displayTitle, "ko"));
}

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
const bottomTabs = document.querySelector("#bottomTabs");
const recentList = document.querySelector("#recentList");
const questionList = document.querySelector("#questionList");
const resultsTitle = document.querySelector("#results-title");
const screenQueryInput = document.querySelector("#screenQuery");
const sortTabs = document.querySelector("#sortTabs");
const analyticsAdmin = document.querySelector("#analyticsAdmin");
const analyticsContent = document.querySelector("#analyticsContent");
const homeNoticeCarousel = document.querySelector("#homeNoticeCarousel");
const trendScreen = document.querySelector("#trendScreen");

let activeType = "전체";
let activeIntent = "전체";
let activeResource = resources[0];
let activeTab = "home";
let resultMode = "search";
let activeSort = "relevance";
let savedIds = new Set(readStoredIds("pym.saved"));
let recentIds = readStoredIds("pym.recent");
let lastSearchSignature = "";
let activeNoticeIndex = 0;
let noticeTimer = null;

const analyticsUserId = getOrCreateAnalyticsUserId();
const analyticsSessionId = createSessionId();
const supabaseConfig = getSupabaseConfig();

const communityQuestions = [
  {
    id: "gbs-icu",
    resourceId: "gbs",
    question: "SpO2 99%인데 ICU 보고가 필요한 이유는?",
    answer: "GBS는 산소포화도보다 호흡근 약화, VC/NIF 감소를 먼저 놓치면 위험해요.",
    tags: ["GBS", "호흡근 약화", "ICU 보고"]
  },
  {
    id: "ast-alt",
    resourceId: "ast-alt-ratio",
    question: "AST/ALT 차이가 뭐예요?",
    answer: "둘 다 간수치지만 어느 효소가 더 우세한지에 따라 해석 방향이 달라져요.",
    tags: ["검사수치", "간수치", "케이스"]
  },
  {
    id: "st-elevation",
    resourceId: "acs-ecg",
    question: "ST elevation은 왜 위험한가요?",
    answer: "완전 폐색 가능성이 커서 STEMI 판단과 빠른 처치 흐름으로 이어져요.",
    tags: ["ECG", "ACS", "심근경색"]
  },
  {
    id: "mg-gbs",
    resourceId: "mg",
    question: "GBS랑 MG는 어떻게 구분해요?",
    answer: "둘 다 근력저하가 보이지만 진행 양상, 피로도, 호흡근 침범 포인트가 달라요.",
    tags: ["신경계", "감별", "임상추론"]
  }
];

const trendArticles = [
  {
    id: "nurse-ai-tools",
    category: "헬스케어경제",
    source: "Axios",
    date: "2026.05.12",
    hook: "간호사는 왜 AI를 덜 쓰고 있을까?",
    title: "간호 AI보다 먼저 필요한 건 간호사용 도구",
    summary: "최근 조사에서 간호사는 의사보다 AI 활용률이 낮았고, 간호 업무에 맞춘 도구 부족이 주요 원인으로 언급됐어요.",
    image: "./assets/trend-ai-tools.png",
    tags: ["AI", "간호업무", "디지털전환"],
    sourceUrl: "https://www.axios.com/2026/05/12/nurse-ai-adoption-lags-doctors-survey",
    relatedIds: ["siadh", "gbs", "acs-ecg"],
    keyPoints: [
      "간호사는 의사보다 AI 도구를 자주 쓰는 비율이 낮게 나타났어요.",
      "핵심 문제는 AI 자체보다 간호 업무 흐름에 맞는 도구가 부족하다는 점이에요.",
      "현장 적용은 간호사의 의견을 반영해야 실제 환자 케어 시간을 늘릴 수 있어요."
    ],
    why: "간호사는 환자 관찰, 기록, 보고, 교육을 동시에 수행하기 때문에 도구가 현장 언어와 업무 순서에 맞아야 해요.",
    nursePrep: "새로운 도구를 무작정 거부하기보다 반복 기록, 자료 검색, 환자교육처럼 시간을 줄일 수 있는 업무를 구분해두면 좋아요.",
    studentPrep: "디지털 헬스케어와 간호정보학의 기본 개념을 익히고, 케이스 스터디에서 어떤 정보가 실제 판단에 필요한지 정리해보세요.",
    comments: [
      { name: "익명 간호사_3478", time: "1시간 전", text: "기록 업무가 너무 많아서 정작 환자 케어 시간이 줄어드는 게 가장 큰 문제 같아요.", likes: 8 },
      { name: "익명 학생_2046", time: "3시간 전", text: "간호학생인데요, 추천하신 AI 도구 관련 자료나 입문 강의가 있다면 공유 부탁드려요!", likes: 5 },
      { name: "익명 간호사_1129", time: "5시간 전", text: "현장에서 사용할 수 있는 간단하고 직관적인 도구가 나왔으면 좋겠어요.", likes: 6 }
    ]
  },
  {
    id: "safe-staffing",
    category: "간호신문",
    source: "The Guardian",
    date: "2026.05.18",
    hook: "간호 인력 부족은 왜 환자 안전 문제가 될까?",
    title: "근무환경 개선이 간호 인력 유지의 핵심",
    summary: "간호 인력 부족은 단순한 근무 피로 문제가 아니라 낙상, 감염, 보고 지연 같은 환자 안전 문제와 연결돼요.",
    image: "./assets/trend-patient-safety.png",
    tags: ["근무환경", "인력관리", "환자안전"],
    sourceUrl: "https://www.theguardian.com/society/2026/may/18/nhs-nurses-believe-lack-of-staff-putting-patients-at-risk-survey-finds",
    relatedIds: ["iicp", "pneumothorax-cxr", "gbs"],
    keyPoints: [
      "간호사들은 인력 부족이 안전한 케어를 어렵게 만든다고 보고했어요.",
      "고령 환자와 복합질환 환자가 늘수록 관찰과 보고의 부담이 커져요.",
      "자료 검색과 우선순위 판단 도구는 바쁜 현장에서 놓치는 부분을 줄이는 데 도움이 될 수 있어요."
    ],
    why: "인력이 부족하면 관찰 간격이 길어지고, 작은 이상징후가 늦게 발견될 수 있어요.",
    nursePrep: "낙상 고위험, 호흡곤란, 의식변화처럼 즉시 보고해야 하는 기준을 병동별로 다시 확인해두세요.",
    studentPrep: "실습 중에는 환자 수보다 우선순위 판단을 먼저 연습하고, 보고 기준을 질환별로 묶어 공부해보세요.",
    comments: [
      { name: "익명 간호사_2210", time: "2시간 전", text: "인력 부족할수록 보고 기준이 머릿속에 바로 있어야 버티는 것 같아요.", likes: 11 },
      { name: "익명 학생_9012", time: "4시간 전", text: "실습 때 선생님들이 왜 I/O랑 의식수준을 계속 보라고 하는지 이해됐어요.", likes: 7 }
    ]
  },
  {
    id: "cancer-workforce",
    category: "대한간호협회",
    source: "The Guardian",
    date: "2026.05.31",
    hook: "암 환자가 늘면 간호사는 무엇을 준비해야 할까?",
    title: "간호사 교육의 미래, 실습과 시뮬레이션 강화",
    summary: "암 환자 증가와 진료 인력 부족 전망은 항암, 감염, 전해질 이상, 응급징후 학습의 중요성을 키우고 있어요.",
    image: "./assets/trend-cancer-lab.png",
    tags: ["교육", "시뮬레이션", "핵심역량"],
    sourceUrl: "https://www.theguardian.com/society/2026/may/31/world-cancer-workforce-crisis-100m-staff-shortfall-report",
    relatedIds: ["siadh", "ast-alt-ratio", "alt"],
    keyPoints: [
      "암 진료 수요가 증가하면서 간호 인력과 진단 인력 부족이 주요 이슈로 언급됐어요.",
      "항암치료 중 전해질 이상, 감염, 응급징후를 빠르게 연결하는 역량이 중요해져요.",
      "시뮬레이션과 케이스 기반 학습은 학생이 현장 판단을 연습하는 좋은 방법이에요."
    ],
    why: "암 환자는 치료 과정에서 여러 합병증과 검사 이상이 함께 나타날 수 있어 간호사의 조기 발견 능력이 중요해요.",
    nursePrep: "항암 환자의 발열, 의식변화, 전해질 이상, I/O 변화처럼 바로 보고할 포인트를 체크리스트화하세요.",
    studentPrep: "소세포폐암과 SIADH처럼 질환-검사-간호중재가 연결되는 케이스를 우선 연습해보세요.",
    comments: [
      { name: "익명 학생_5581", time: "30분 전", text: "SIADH랑 암 환자 케이스가 이렇게 연결되는 줄 몰랐어요.", likes: 4 },
      { name: "익명 간호사_7730", time: "6시간 전", text: "항암 병동은 전해질이랑 감염 사정이 진짜 중요합니다.", likes: 10 }
    ]
  }
];

resourceCount.textContent = `${resources.length}개`;
renderHomeNoticeCarousel();
startNoticeRotation();
renderHomeFeed();
renderQuestionHub();
renderTrendScreen();
renderCategoryHub();
renderFilters();
renderBottomTabs();
renderResults();
renderDetail(activeResource);
setHomeMode();
trackEvent("page_view", {
  path: window.location.pathname,
  hash: window.location.hash || "#home",
  resourceCount: resources.length
});
flushRemoteAnalytics();
syncAdminRoute();

categoryGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-category]");
  if (!card) return;

  activeTab = "search";
  resultMode = "search";
  setSearchMode();
  activeType = card.dataset.category;
  trackEvent("category_select", { category: activeType });
  queryInput.value = "";
  renderCategoryHub();
  renderFilters();
  renderBottomTabs();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

screenQueryInput.addEventListener("input", () => {
  activeTab = "search";
  resultMode = "search";
  queryInput.value = screenQueryInput.value;
  setSearchMode();
  renderBottomTabs();
  renderResults();
});

screenQueryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

sortTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sort]");
  if (!button) return;

  activeSort = button.dataset.sort;
  trackEvent("sort_change", { sort: activeSort });
  renderSortTabs();
  renderResults();
});

document.addEventListener("click", (event) => {
  const back = event.target.closest("[data-search-back]");
  if (!back) return;

  trackEvent("search_back");
  setHomeMode();
  renderBottomTabs();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("click", (event) => {
  const clear = event.target.closest("[data-clear-screen-query]");
  if (!clear) return;

  queryInput.value = "";
  screenQueryInput.value = "";
  resultMode = "search";
  trackEvent("search_clear");
  renderResults();
  screenQueryInput.focus();
});

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter-focus]");
  if (!filter) return;

  trackEvent("filter_focus");
  document.querySelector(".filters")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  activeTab = "search";
  resultMode = "search";
  setSearchMode();
  renderBottomTabs();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

queryInput.addEventListener("input", () => {
  activeTab = "search";
  resultMode = "search";
  setSearchMode();
  renderBottomTabs();
  renderResults();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-query]");
  if (!button) return;

  activeTab = "search";
  resultMode = "search";
  queryInput.value = button.dataset.query;
  trackEvent("quick_query", { query: button.dataset.query });
  setSearchMode();
  renderBottomTabs();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-notice-dot]");
  if (!dot) return;

  activeNoticeIndex = Number(dot.dataset.noticeDot) || 0;
  trackEvent("home_notice_change", { index: activeNoticeIndex });
  renderHomeNoticeCarousel();
  startNoticeRotation();
});

document.addEventListener("click", (event) => {
  const source = event.target.closest("[data-notice-source]");
  if (!source) return;

  const article = trendArticles.find((item) => item.id === source.dataset.articleOpen);
  if (article) {
    event.preventDefault();
    openTrendArticle(article);
  }

  trackEvent("home_notice_source_open", {
    label: source.dataset.noticeSource,
    url: source.getAttribute("href")
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-trend-open]");
  if (!button) return;

  const article = trendArticles.find((item) => item.id === button.dataset.trendOpen);
  if (!article) return;
  openTrendArticle(article);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-trend-comments]");
  if (!button) return;

  const article = trendArticles.find((item) => item.id === button.dataset.trendComments);
  if (!article) return;
  openTrendComments(article);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-comment-submit]");
  if (!button) return;

  submitTrendComment(button.dataset.commentSubmit);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-comment-like]");
  if (!button) return;

  likeTrendComment(button.dataset.commentLike, button.dataset.articleId);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recent-all]");
  if (!button) return;

  activeTab = "search";
  resultMode = "recent";
  trackEvent("recent_all_open");
  setSearchMode();
  renderBottomTabs();
  renderResults();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-home]");
  if (!button) return;

  const resource = resources.find((item) => item.id === button.dataset.openHome);
  if (!resource) return;

  activeResource = resource;
  rememberRecent(resource.id);
  trackEvent("home_resource_open", resourcePayload(resource));
  renderHomeFeed();
  renderDetail(resource);
  openPreviewModal(resource);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-question-open]");
  if (!button) return;

  const question = communityQuestions.find((item) => item.id === button.dataset.questionOpen);
  const resource = resources.find((item) => item.id === question?.resourceId);
  if (!resource) return;

  activeResource = resource;
  activeTab = "home";
  rememberRecent(resource.id);
  trackEvent("community_question_open", {
    questionId: question.id,
    resourceId: resource.id,
    resourceTitle: resource.displayTitle
  });
  renderDetail(resource);
  openPreviewModal(resource);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-question-submit]");
  if (!button) return;

  trackEvent("community_question_submit_click");
  showToast("질문 제보는 다음 단계에서 폼으로 연결할게요");
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-drive]");
  if (!link) return;

  const resource = resources.find((item) => item.id === link.dataset.drive);
  trackEvent("drive_open", resource ? resourcePayload(resource) : { resourceId: link.dataset.drive });
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-admin-close]");
  if (!close) return;

  window.location.hash = "";
  syncAdminRoute();
});

document.addEventListener("click", (event) => {
  const exportButton = event.target.closest("[data-admin-export]");
  if (!exportButton) return;

  exportAnalytics();
});

document.addEventListener("click", (event) => {
  const resetButton = event.target.closest("[data-admin-reset]");
  if (!resetButton) return;

  if (!window.confirm("이 기기에 저장된 분석 데이터를 지울까요?")) return;
  localStorage.removeItem("pym.analyticsEvents");
  trackEvent("analytics_reset");
  renderAnalyticsAdmin();
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-supabase-form]");
  if (!form) return;

  event.preventDefault();
  const formData = new FormData(form);
  const url = String(formData.get("supabaseUrl") || "").trim().replace(/\/$/, "");
  const key = String(formData.get("supabaseAnonKey") || "").trim();

  if (!url || !key) {
    showToast("Supabase URL과 anon key를 모두 넣어주세요");
    return;
  }

  localStorage.setItem("pym.supabaseUrl", url);
  localStorage.setItem("pym.supabaseAnonKey", key);
  Object.assign(supabaseConfig, { url, anonKey: key, enabled: true });
  trackEvent("supabase_config_save");
  flushRemoteAnalytics();
  renderAnalyticsAdmin();
  showToast("Supabase 연결 정보를 저장했어요");
});

document.addEventListener("click", (event) => {
  const testButton = event.target.closest("[data-supabase-test]");
  if (!testButton) return;

  testSupabaseConnection();
});

window.addEventListener("hashchange", syncAdminRoute);

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
      activeTab = "search";
      setSearchMode();
      activeType = button.dataset.type;
      if (activeType === "전체") {
        queryInput.value = "";
      }
      trackEvent("filter_select", { filter: "system", value: activeType });
      renderCategoryHub();
      renderFilters();
      renderBottomTabs();
      renderResults();
    });
  });

  filters.querySelectorAll("[data-intent]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = "search";
      setSearchMode();
      activeIntent = button.dataset.intent;
      if (activeIntent === "전체") {
        queryInput.value = "";
      }
      trackEvent("filter_select", { filter: "intent", value: activeIntent });
      renderFilters();
      renderBottomTabs();
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
  const iconMap = {
    "전체": "all",
    "심혈관": "heart",
    "신경계": "brain",
    "검사수치": "lab",
    "호흡기": "lung",
    "수술간호": "care"
  };

  return `
    <div class="filter-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="filter-list">
        ${values.map((value) => {
          const count = value === "전체" ? resources.length : resources.filter((resource) => resource[key === "type" ? "system" : "intent"] === value).length;
          return `
            <button type="button" class="${value === activeValue ? "active" : ""}" data-${key}="${escapeHtml(value)}">
              <i class="filter-icon ${escapeHtml(iconMap[value] || "all")}" aria-hidden="true"></i>
              <span>${escapeHtml(value)}</span>
              <em>${count}</em>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderBottomTabs() {
  const tabs = [
    { id: "home", label: "홈", icon: homeIcon(), target: () => {
      setHomeMode();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } },
    { id: "search", label: "검색", icon: searchIcon(), target: () => {
      resultMode = "search";
      setSearchMode();
      renderResults();
      document.querySelector("#search").scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => queryInput.focus(), 280);
    } },
    { id: "saved", label: "즐겨찾기", icon: starIcon(), target: () => {
      resultMode = "saved";
      queryInput.value = "";
      setSearchMode();
      renderResults();
      document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    } },
    { id: "trend", label: "동향", icon: bookIcon(), target: () => {
      setTrendMode();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } },
    { id: "profile", label: "마이페이지", icon: userIcon(), target: () => showToast("로그인 기능과 함께 확장하면 좋아요") }
  ];

  bottomTabs.innerHTML = tabs.map((tab) => `
    <button class="bottom-tab ${tab.id === activeTab ? "active" : ""}" type="button" data-tab="${escapeHtml(tab.id)}" aria-label="${escapeHtml(tab.label)}">
      ${tab.icon}
      <span>${escapeHtml(tab.label)}</span>
    </button>
  `).join("");

  bottomTabs.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = tabs.find((item) => item.id === button.dataset.tab);
      activeTab = tab.id;
      trackEvent("tab_change", { tab: activeTab });
      renderBottomTabs();
      tab.target();
    });
  });
}

function setHomeMode() {
  document.body.classList.remove("search-mode");
  document.body.classList.remove("trend-mode");
  activeTab = "home";
  resultMode = "search";
  queryInput.value = "";
  screenQueryInput.value = "";
  renderHomeNoticeCarousel();
  renderHomeFeed();
}

function setSearchMode() {
  document.body.classList.add("search-mode");
  document.body.classList.remove("trend-mode");
  screenQueryInput.value = queryInput.value;
  renderSortTabs();
}

function setTrendMode() {
  document.body.classList.remove("search-mode");
  document.body.classList.add("trend-mode");
  activeTab = "trend";
  renderTrendScreen();
  renderBottomTabs();
  trackEvent("trend_view");
}

function renderSortTabs() {
  sortTabs.querySelectorAll("[data-sort]").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === activeSort);
  });
}

function renderHomeFeed() {
  const fallbackIds = ["gbs", "acs-ecg", "mi"];
  const ids = (recentIds.length ? recentIds : fallbackIds)
    .map((id) => resources.find((resource) => resource.id === id))
    .filter(Boolean)
    .slice(0, 3);

  recentList.innerHTML = ids.map((resource) => `
    <button type="button" data-open-home="${escapeHtml(resource.id)}">
      <span>
        <strong>${escapeHtml(resource.displayTitle)}</strong>
        <em>${escapeHtml(resource.system)} · ${escapeHtml(resource.intent)}</em>
      </span>
      <i aria-hidden="true">›</i>
    </button>
  `).join("");
}

function renderHomeNoticeCarousel() {
  if (!homeNoticeCarousel) return;

  const notices = getHomeNotices();
  activeNoticeIndex = activeNoticeIndex % notices.length;
  const notice = notices[activeNoticeIndex];

  homeNoticeCarousel.className = `clinical-card notice-${escapeHtml(notice.tone)}`;
  homeNoticeCarousel.innerHTML = `
    <div class="clinical-copy">
      <p>
        <span>${escapeHtml(notice.label)}</span>
        <strong>${escapeHtml(notice.badge)}</strong>
      </p>
      <h2>${escapeHtml(notice.title)}</h2>
      <span class="notice-description">${escapeHtml(notice.description)}</span>
      <div class="notice-actions">
        <button type="button" data-query="${escapeHtml(notice.query)}">${escapeHtml(notice.action)}</button>
        <a href="${escapeHtml(notice.sourceUrl)}" target="_blank" rel="noreferrer" data-notice-source="${escapeHtml(notice.label)}" ${notice.articleId ? `data-article-open="${escapeHtml(notice.articleId)}"` : ""}>${escapeHtml(notice.sourceLabel)}</a>
      </div>
    </div>
    <img src="${escapeHtml(notice.image)}" alt="" loading="eager" />
    <div class="notice-dots" aria-label="공지 선택">
      ${notices.map((item, index) => `
        <button type="button" class="${index === activeNoticeIndex ? "active" : ""}" data-notice-dot="${index}" aria-label="${escapeHtml(item.label)} 보기"></button>
      `).join("")}
    </div>
  `;
}

function getHomeNotices() {
  const latest = resources.slice().sort((a, b) => b.rank - a.rank)[0] || resources[0];
  const recommended = resources.find((resource) => resource.id === "gbs") || resources[0];
  const trend = resources.find((resource) => resource.id === "siadh") || latest;
  const trendArticle = trendArticles[0];

  return [
    {
      label: "새 자료 업데이트",
      badge: "NEW",
      title: `${latest.displayTitle} 자료가 추가됐어요`,
      description: latest.summary,
      query: latest.keywords?.[0] || latest.displayTitle,
      action: "새 자료 보기",
      sourceLabel: "원본 PDF",
      sourceUrl: latest.url,
      image: visualMeta(latest).image || "./assets/thumb-lab.png",
      tone: "update"
    },
    {
      label: "오늘의 추천 자료",
      badge: "추천",
      title: "SpO2가 괜찮아도 보고가 필요한 순간",
      description: recommended.summary,
      query: "GBS",
      action: "답 보기",
      sourceLabel: "관련 PDF",
      sourceUrl: recommended.url,
      image: "./assets/nurse-guide.png",
      tone: "recommend"
    },
    {
      label: "최근 간호 동향",
      badge: "TREND",
      title: "간호 AI보다 먼저 필요한 건 간호사용 도구",
      description: "최근 조사에서 간호사는 의사보다 AI 활용률이 낮았고, 간호 업무에 맞춘 도구 부족이 이유로 언급됐어요.",
      query: "임상추론",
      action: "관련 자료 보기",
      sourceLabel: "요약 보기",
      sourceUrl: trendArticle.sourceUrl,
      articleId: trendArticle.id,
      image: visualMeta(trend).image || "./assets/thumb-lab.png",
      tone: "trend"
    }
  ];
}

function renderTrendScreen() {
  if (!trendScreen) return;

  trendScreen.innerHTML = `
    <div class="trend-top">
      <div>
        <h1>최근 간호 동향</h1>
        <p>뉴스를 간호사·간호학생 관점으로 짧게 번역해요.</p>
      </div>
      <button type="button" aria-label="동향 알림">⌕</button>
    </div>
    <section class="trend-feature">
      <p class="eyebrow">이번 주 핵심 이슈</p>
      <div class="trend-list">
        ${trendArticles.map((article, index) => trendCardTemplate(article, index)).join("")}
      </div>
    </section>
  `;
}

function trendCardTemplate(article, index) {
  return `
    <article class="trend-card">
      <img class="trend-card-image" src="${escapeHtml(article.image)}" alt="" loading="lazy" />
      <div class="trend-card-meta">
        <span>${escapeHtml(article.category)}</span>
        <em>${escapeHtml(article.date)}</em>
        <strong>${String(index + 1).padStart(2, "0")}</strong>
      </div>
      <h2>${escapeHtml(article.hook)}</h2>
      <p>${escapeHtml(article.summary)}</p>
      <div class="trend-tags">
        ${article.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
      </div>
      <button type="button" data-trend-open="${escapeHtml(article.id)}">요약 보기</button>
    </article>
  `;
}

function openTrendArticle(article) {
  trackEvent("trend_article_open", { articleId: article.id, title: article.title, source: article.source });
  modalContent.innerHTML = trendDetailTemplate(article);
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function trendDetailTemplate(article) {
  return `
    <div class="trend-detail">
      <div class="trend-detail-top">
        <img class="trend-detail-image" src="${escapeHtml(article.image)}" alt="" loading="lazy" />
        <p>${escapeHtml(article.category)} · ${escapeHtml(article.source)} · ${escapeHtml(article.date)}</p>
        <h2 id="modalTitle">${escapeHtml(article.hook)}</h2>
      </div>
      <section class="trend-summary-box">
        <h3>핵심 요약</h3>
        <ul>
          ${article.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </section>
      ${trendInsightTemplate("왜 중요한가", article.why)}
      ${trendInsightTemplate("간호사라면 준비할 것", article.nursePrep)}
      ${trendInsightTemplate("간호학생이라면 공부할 것", article.studentPrep)}
      <section class="trend-related">
        <h3>연결되는 박용민 PDF</h3>
        <div>
          ${article.relatedIds.map((id) => trendRelatedResourceTemplate(id)).join("")}
        </div>
      </section>
      <div class="trend-detail-actions">
        <a href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">원문 기사 열기</a>
        <button type="button" data-trend-comments="${escapeHtml(article.id)}">댓글 보기 (${article.comments.length})</button>
      </div>
    </div>
  `;
}

function trendInsightTemplate(title, text) {
  return `
    <section class="trend-insight">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </section>
  `;
}

function trendRelatedResourceTemplate(id) {
  const resource = resources.find((item) => item.id === id);
  if (!resource) return "";

  return `
    <a class="trend-related-card" href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(resource.id)}">
      ${visualTemplate(resource, "thumb")}
      <span>
        <strong>${escapeHtml(resource.displayTitle)}</strong>
        <em>${escapeHtml(resource.system)} · ${escapeHtml(resource.intent)}</em>
      </span>
      <i aria-hidden="true">›</i>
    </a>
  `;
}

function openTrendComments(article) {
  trackEvent("trend_comments_open", { articleId: article.id, title: article.title });
  renderTrendComments(article, { loading: true });
  loadTrendComments(article)
    .then((comments) => renderTrendComments(article, { comments }))
    .catch(() => {
      renderTrendComments(article, { error: "댓글 서버 연결 전이라 예시 댓글을 보여주고 있어요." });
    });
}

function renderTrendComments(article, options = {}) {
  modalContent.innerHTML = trendCommentsTemplate(article, options);
}

function trendCommentsTemplate(article, options = {}) {
  const comments = options.comments || article.comments;
  const titleCount = options.comments ? comments.length : article.comments.length;

  return `
    <div class="trend-comments">
      <h2 id="modalTitle">댓글 (${titleCount})</h2>
      <div class="comment-guide">서로의 의견을 존중하며, 유익한 간호 커뮤니티를 만들어주세요.</div>
      ${options.loading ? `<div class="comment-status">댓글을 불러오는 중이에요.</div>` : ""}
      ${options.error ? `<div class="comment-status">${escapeHtml(options.error)}</div>` : ""}
      <div class="comment-list">
        ${comments.map((comment) => `
          <article class="comment-card">
            <div>
              <strong>${escapeHtml(comment.name)}</strong>
              <span>${escapeHtml(comment.time)}</span>
            </div>
            <p>${escapeHtml(comment.text)}</p>
            <button type="button" ${comment.id ? `data-comment-like="${escapeHtml(String(comment.id))}" data-article-id="${escapeHtml(article.id)}"` : ""}>좋아요 ${comment.likes}</button>
          </article>
        `).join("")}
      </div>
      <div class="comment-input">
        <textarea maxlength="300" placeholder="의견이나 질문을 남겨주세요." aria-label="댓글 입력"></textarea>
        <button type="button" data-comment-submit="${escapeHtml(article.id)}">등록</button>
      </div>
    </div>
  `;
}

async function loadTrendComments(article) {
  if (!supabaseConfig.enabled) {
    throw new Error("Supabase is not configured");
  }

  const query = new URLSearchParams({
    select: "id,article_id,nickname,body,likes,created_at",
    article_id: `eq.${article.id}`,
    hidden: "eq.false",
    order: "created_at.desc",
    limit: "50"
  });
  const rows = await supabaseRequest(`trend_comments?${query.toString()}`);

  return rows.map((row) => ({
    id: row.id,
    name: row.nickname,
    time: relativeTime(row.created_at),
    text: row.body,
    likes: row.likes || 0
  }));
}

async function submitTrendComment(articleId) {
  const article = trendArticles.find((item) => item.id === articleId);
  if (!article) return;

  const textarea = modalContent.querySelector(".comment-input textarea");
  const button = modalContent.querySelector(`[data-comment-submit="${CSS.escape(articleId)}"]`);
  const body = String(textarea?.value || "").trim();

  if (!body) {
    showToast("댓글 내용을 입력해 주세요");
    textarea?.focus();
    return;
  }

  if (body.length > 300) {
    showToast("댓글은 300자 안으로 남겨주세요");
    return;
  }

  if (isBlockedComment(body)) {
    showToast("개인정보, 광고 링크, 비방 표현은 남길 수 없어요");
    return;
  }

  if (!supabaseConfig.enabled) {
    showToast("Supabase 댓글 테이블 연결 후 실제 저장돼요");
    return;
  }

  button.disabled = true;
  button.textContent = "등록 중";

  try {
    await supabaseRequest("trend_comments", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        article_id: article.id,
        anonymous_user_id: analyticsUserId,
        nickname: getCommentNickname(),
        body
      })
    });
    trackEvent("trend_comment_submit", { articleId: article.id, bodyLength: body.length });
    textarea.value = "";
    showToast("댓글을 등록했어요");
    const comments = await loadTrendComments(article);
    renderTrendComments(article, { comments });
  } catch {
    showToast("댓글 저장 실패. Supabase SQL/RLS를 확인해 주세요");
    renderTrendComments(article, { error: "댓글 저장이 막혔어요. Supabase 댓글 SQL 실행이 필요할 수 있어요." });
  }
}

async function likeTrendComment(commentId, articleId) {
  if (!commentId || !articleId || !supabaseConfig.enabled) return;

  const likedKey = "pym.likedTrendComments";
  const liked = new Set(readJsonArray(likedKey));
  if (liked.has(commentId)) {
    showToast("이미 좋아요를 눌렀어요");
    return;
  }

  const article = trendArticles.find((item) => item.id === articleId);
  if (!article) return;

  try {
    const rows = await supabaseRequest(`trend_comments?select=likes&id=eq.${encodeURIComponent(commentId)}&limit=1`);
    const currentLikes = Number(rows[0]?.likes || 0);
    await supabaseRequest(`trend_comments?id=eq.${encodeURIComponent(commentId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ likes: currentLikes + 1 })
    });
    liked.add(commentId);
    localStorage.setItem(likedKey, JSON.stringify(Array.from(liked).slice(-300)));
    trackEvent("trend_comment_like", { articleId, commentId });
    const comments = await loadTrendComments(article);
    renderTrendComments(article, { comments });
  } catch {
    showToast("좋아요 반영에 실패했어요");
  }
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body
  });

  if (!response.ok) {
    const error = new Error(`Supabase request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return [];
  }

  return response.json();
}

function getCommentNickname() {
  const key = "pym.commentNickname";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const roles = ["간호사", "학생", "실습생", "신규간호사"];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const nickname = `익명 ${role}_${suffix}`;
  localStorage.setItem(key, nickname);
  return nickname;
}

function isBlockedComment(text) {
  const normalized = text.toLowerCase();
  const blocked = ["http://", "https://", "카톡", "오픈채팅", "광고", "시발", "씨발", "병신", "꺼져"];
  return blocked.some((word) => normalized.includes(word));
}

function relativeTime(value) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff)) return "";

  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function startNoticeRotation() {
  if (!homeNoticeCarousel) return;

  window.clearInterval(noticeTimer);
  noticeTimer = window.setInterval(() => {
    if (document.body.classList.contains("search-mode") || !previewModal.hidden) return;
    activeNoticeIndex = (activeNoticeIndex + 1) % getHomeNotices().length;
    renderHomeNoticeCarousel();
  }, 5200);
}

function renderQuestionHub() {
  questionList.innerHTML = communityQuestions.map((question) => {
    const resource = resources.find((item) => item.id === question.resourceId);
    return `
      <article class="question-card">
        <button type="button" data-question-open="${escapeHtml(question.id)}">
          <span class="question-kicker">커뮤니티 Q</span>
          <strong>${escapeHtml(question.question)}</strong>
          <span class="question-answer">${escapeHtml(question.answer)}</span>
          <span class="question-source">관련 PDF · ${escapeHtml(resource?.displayTitle || "박용민 자료")}</span>
          <span class="question-tags">
            ${question.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}
          </span>
        </button>
      </article>
    `;
  }).join("");
}

function toggleSaved(id) {
  const willSave = !savedIds.has(id);
  if (savedIds.has(id)) {
    savedIds.delete(id);
    showToast("즐겨찾기에서 제거했어요");
  } else {
    savedIds.add(id);
    showToast("즐겨찾기에 저장했어요");
  }

  writeStoredIds("pym.saved", Array.from(savedIds));
  const resource = resources.find((item) => item.id === id);
  trackEvent(willSave ? "save_resource" : "unsave_resource", resource ? resourcePayload(resource) : { resourceId: id });
}

function rememberRecent(id) {
  recentIds = [id, ...recentIds.filter((item) => item !== id)].slice(0, 5);
  writeStoredIds("pym.recent", recentIds);
  renderHomeFeed();
}

function readStoredIds(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => resources.some((resource) => resource.id === id)) : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key, ids) {
  localStorage.setItem(key, JSON.stringify(ids));
}

function renderResults() {
  const query = queryInput.value.trim();
  screenQueryInput.value = queryInput.value;
  const matches = scoreResources(query)
    .filter((item) => {
      if (resultMode === "saved") return savedIds.has(item.resource.id);
      if (resultMode === "recent") return recentIds.includes(item.resource.id);
      return true;
    })
    .filter((item) => resultMode !== "search" || activeType === "전체" || item.resource.system === activeType)
    .filter((item) => resultMode !== "search" || activeIntent === "전체" || item.resource.intent === activeIntent)
    .filter((item) => resultMode !== "search" || query.length === 0 || item.score > 0);

  const sorted = matches.sort((a, b) => {
    if (resultMode === "recent") return recentIds.indexOf(a.resource.id) - recentIds.indexOf(b.resource.id);
    if (activeSort === "recent") return b.resource.rank - a.resource.rank || b.score - a.score;
    if (activeSort === "popular") return a.resource.rank - b.resource.rank || b.score - a.score;
    return b.score - a.score || a.resource.rank - b.resource.rank || a.resource.displayTitle.localeCompare(b.resource.displayTitle, "ko");
  });

  resultsTitle.textContent = resultMode === "saved" ? "즐겨찾기" : resultMode === "recent" ? "최근 본 자료" : "검색 결과";
  resultMeta.textContent = resultMode === "saved" ? `${sorted.length}개 저장됨` : `${sorted.length}개 자료`;
  queueSearchAnalytics(query, sorted.length);

  if (!sorted.some((item) => item.resource.id === activeResource.id)) {
    activeResource = sorted[0]?.resource || resources[0];
  }

  grid.innerHTML = sorted.length ? sorted.map(({ resource, score }) => cardTemplate(resource, score, query.length > 0)).join("") : emptyTemplate(query);

  grid.querySelectorAll("[data-open]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      activeResource = resources.find((resource) => resource.id === element.dataset.open);
      rememberRecent(activeResource.id);
      renderResults();
      renderDetail(activeResource);
      openPreviewModal(activeResource);
    });
  });

  grid.querySelectorAll("[data-save]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSaved(button.dataset.save);
      renderHomeFeed();
      renderResults();
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
  const saved = savedIds.has(resource.id);
  return `
    <article class="resource-card ${selected}" data-open="${escapeHtml(resource.id)}">
      ${visualTemplate(resource, "thumb")}
      <div class="card-top">
        <div>
          <div class="badge-row">
            <span class="badge hot">${escapeHtml(resource.type)}</span>
            <span class="badge">${escapeHtml(resource.intent)}</span>
          </div>
          <h3>${escapeHtml(resource.displayTitle)}</h3>
          <p>${escapeHtml(resource.summary)}</p>
        </div>
        <button class="save-button ${saved ? "saved" : ""}" type="button" data-save="${escapeHtml(resource.id)}" aria-label="${saved ? "즐겨찾기 해제" : "즐겨찾기 추가"}">${saved ? "★" : "☆"}</button>
      </div>
      <div class="inline-source">
        <span>${escapeHtml(resource.stage)} · ${escapeHtml(resource.confidence)} · ${escapeHtml(resource.source)}</span>
        <a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(resource.id)}">원본 PDF</a>
      </div>
    </article>
  `;
}

function emptyTemplate(query) {
  if (resultMode === "saved") {
    return `
      <article class="resource-card empty-card">
        <h3>아직 저장한 자료가 없어요</h3>
        <p>검색 결과에서 별표를 누르면 여기에 모아볼 수 있어요.</p>
      </article>
    `;
  }

  if (resultMode === "recent") {
    return `
      <article class="resource-card empty-card">
        <h3>아직 최근 본 자료가 없어요</h3>
        <p>자료 미리보기를 열면 홈과 내 학습에 자동으로 쌓입니다.</p>
      </article>
    `;
  }

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

  detail.querySelectorAll("[data-detail-save]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSaved(button.dataset.detailSave);
      renderDetail(resource);
      renderHomeFeed();
      renderResults();
    });
  });
}

function detailTemplate(resource) {
  const saved = savedIds.has(resource.id);
  return `
    <div class="detail-body">
      ${visualTemplate(resource, "hero")}
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
        <button type="button" data-detail-save="${escapeHtml(resource.id)}">${saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}</button>
        <a class="detail-link" href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(resource.id)}">원본 Drive 자료 열기</a>
      </div>
    </div>
  `;
}

function visualTemplate(resource, size = "thumb") {
  const visual = visualMeta(resource);
  const sizeClass = size === "hero" ? "visual-hero" : "thumb";
  const imageClass = visual.image ? "has-image" : "";
  const visualContent = visual.image
    ? `<img src="${escapeHtml(visual.image)}" alt="" loading="lazy" />`
    : `<span>${escapeHtml(visual.icon)}</span><i></i>`;

  return `
    <div class="resource-visual ${escapeHtml(sizeClass)} ${escapeHtml(visual.key)} ${imageClass}" aria-hidden="true">
      ${visualContent}
    </div>
  `;
}

function visualMeta(resource) {
  const map = {
    "심혈관": { key: "cardio", icon: "ECG", image: "./assets/thumb-cardio.png" },
    "신경계": { key: "neuro", icon: "N", image: "./assets/thumb-neuro.png" },
    "검사수치": { key: "lab", icon: "Lab", image: "./assets/thumb-lab.png" },
    "호흡기": { key: "resp", icon: "XR", image: "./assets/thumb-resp.png" },
    "수술간호": { key: "surgery", icon: "+", image: "./assets/thumb-surgery.png" }
  };

  return map[resource.system] || { key: "default", icon: "PDF" };
}

function relatedTemplate(resource) {
  const related = (resource.related || [])
    .map((id) => resources.find((item) => item.id === id))
    .filter(Boolean);

  if (!related.length) {
    return `<p class="detail-summary">아직 연결된 관련 자료가 없습니다.</p>`;
  }

  return related.map((item) => `
    <a class="related-card" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.displayTitle)}</strong>
      <span>${escapeHtml(item.intent)} · ${escapeHtml(item.system)}</span>
    </a>
  `).join("");
}

function openPreviewModal(resource) {
  rememberRecent(resource.id);
  trackEvent("resource_open", resourcePayload(resource));
  renderModalContent(resource);
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function renderModalContent(resource) {
  modalContent.innerHTML = detailTemplate(resource);
  modalContent.querySelectorAll("[data-detail-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = resources.find((item) => item.id === button.dataset.detailCopy);
      await copyResource(target);
    });
  });
  modalContent.querySelectorAll("[data-detail-save]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSaved(button.dataset.detailSave);
      renderModalContent(resource);
      renderHomeFeed();
      renderResults();
    });
  });
}

function closePreviewModal() {
  previewModal.hidden = true;
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
}

async function copyResource(resource) {
  trackEvent("copy_summary", resourcePayload(resource));
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

function trackEvent(name, properties = {}) {
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    properties,
    userId: analyticsUserId,
    sessionId: analyticsSessionId,
    path: window.location.pathname,
    hash: window.location.hash || "",
    referrer: document.referrer || "",
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    createdAt: new Date().toISOString()
  };

  const events = readAnalyticsEvents();
  events.push(event);
  localStorage.setItem("pym.analyticsEvents", JSON.stringify(events.slice(-1000)));
  sendRemoteAnalytics(event);

  if (!analyticsAdmin.hidden) {
    renderAnalyticsAdmin();
  }
}

function queueSearchAnalytics(query, resultCount) {
  if (resultMode !== "search" || !document.body.classList.contains("search-mode")) return;

  const normalized = query.trim();
  const signature = [
    normalized || "(empty)",
    resultCount,
    activeType,
    activeIntent,
    activeSort
  ].join("|");

  if (signature === lastSearchSignature) return;
  lastSearchSignature = signature;

  window.clearTimeout(queueSearchAnalytics.timer);
  queueSearchAnalytics.timer = window.setTimeout(() => {
    trackEvent(resultCount === 0 && normalized ? "search_no_result" : "search", {
      query: normalized,
      resultCount,
      system: activeType,
      intent: activeIntent,
      sort: activeSort
    });
  }, 450);
}

function readAnalyticsEvents() {
  return readJsonArray("pym.analyticsEvents");
}

function readJsonArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sendRemoteAnalytics(event) {
  if (!supabaseConfig.enabled) return;

  postSupabaseEvents([event])
    .then(() => markSupabaseSent([event.id]))
    .catch((error) => {
      if (error.status === 409) {
        markSupabaseSent([event.id]);
      }
    });
}

async function flushRemoteAnalytics() {
  if (!supabaseConfig.enabled) return;

  const sentIds = readSupabaseSentIds();
  const pending = readAnalyticsEvents()
    .filter((event) => !sentIds.has(event.id))
    .slice(-80);

  if (!pending.length) {
    renderAnalyticsAdmin();
    return;
  }

  try {
    await postSupabaseEvents(pending);
    markSupabaseSent(pending.map((event) => event.id));
    showToast(`${pending.length}개 이벤트를 Supabase로 보냈어요`);
  } catch {
    const synced = await flushRemoteAnalyticsOneByOne(pending);
    showToast(`${synced}개 이벤트를 Supabase로 보냈어요`);
  } finally {
    renderAnalyticsAdmin();
  }
}

async function flushRemoteAnalyticsOneByOne(events) {
  let synced = 0;

  for (const event of events) {
    try {
      await postSupabaseEvents([event]);
      markSupabaseSent([event.id]);
      synced += 1;
    } catch (error) {
      if (error.status === 409) {
        markSupabaseSent([event.id]);
      }
    }
  }

  return synced;
}

async function postSupabaseEvents(events) {
  const payload = events.map(toSupabaseEvent);
  const response = await fetch(`${supabaseConfig.url}/rest/v1/analytics_events`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload),
    keepalive: payload.length === 1
  });

  if (!response.ok) {
    const error = new Error(`Supabase insert failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
}

function toSupabaseEvent(event) {
  return {
    event_id: event.id,
    event_name: event.name,
    anonymous_user_id: event.userId,
    session_id: event.sessionId,
    path: event.path,
    hash: event.hash,
    referrer: event.referrer,
    user_agent: event.userAgent,
    viewport: event.viewport,
    properties: event.properties,
    created_at: event.createdAt
  };
}

function getSupabaseConfig() {
  const url = String(window.PYM_SUPABASE_URL || localStorage.getItem("pym.supabaseUrl") || "").trim().replace(/\/$/, "");
  const anonKey = String(window.PYM_SUPABASE_ANON_KEY || localStorage.getItem("pym.supabaseAnonKey") || "").trim();

  return {
    url,
    anonKey,
    enabled: Boolean(url && anonKey)
  };
}

function readSupabaseSentIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem("pym.supabaseSentIds") || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markSupabaseSent(ids) {
  const sentIds = readSupabaseSentIds();
  ids.forEach((id) => sentIds.add(id));
  localStorage.setItem("pym.supabaseSentIds", JSON.stringify(Array.from(sentIds).slice(-1200)));
}

async function testSupabaseConnection() {
  if (!supabaseConfig.enabled) {
    showToast("먼저 Supabase 연결 정보를 저장해 주세요");
    return;
  }

  const event = {
    id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "supabase_test",
    properties: { source: "admin" },
    userId: analyticsUserId,
    sessionId: analyticsSessionId,
    path: window.location.pathname,
    hash: window.location.hash || "",
    referrer: document.referrer || "",
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    createdAt: new Date().toISOString()
  };

  try {
    await postSupabaseEvents([event]);
    markSupabaseSent([event.id]);
    trackEvent("supabase_test_success");
    showToast("Supabase 테스트 전송 성공");
  } catch {
    trackEvent("supabase_test_failed");
    showToast("Supabase 테스트 실패. SQL/RLS/키를 확인해 주세요");
  }
}

function getOrCreateAnalyticsUserId() {
  const key = "pym.analyticsUserId";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, id);
  return id;
}

function createSessionId() {
  return `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function resourcePayload(resource) {
  return {
    resourceId: resource.id,
    resourceTitle: resource.displayTitle,
    system: resource.system,
    intent: resource.intent,
    stage: resource.stage,
    source: resource.source
  };
}

function syncAdminRoute() {
  const isAdmin = window.location.hash === "#admin";
  analyticsAdmin.hidden = !isAdmin;
  document.body.classList.toggle("admin-mode", isAdmin);

  if (isAdmin) {
    renderAnalyticsAdmin();
    trackEvent("admin_view");
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

function renderAnalyticsAdmin() {
  const events = readAnalyticsEvents();
  const users = new Set(events.map((event) => event.userId));
  const sessions = new Set(events.map((event) => event.sessionId));
  const resourceOpens = events.filter((event) => event.name === "resource_open");
  const driveOpens = events.filter((event) => event.name === "drive_open");
  const searches = events.filter((event) => event.name === "search" || event.name === "search_no_result");
  const noResults = events.filter((event) => event.name === "search_no_result");
  const sentCount = readSupabaseSentIds().size;
  const pendingCount = Math.max(events.length - sentCount, 0);

  analyticsContent.innerHTML = `
    <div class="admin-summary">
      ${adminMetricTemplate("이벤트", events.length)}
      ${adminMetricTemplate("익명 사용자", users.size)}
      ${adminMetricTemplate("세션", sessions.size)}
      ${adminMetricTemplate("원본 열기", driveOpens.length)}
    </div>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>인기 자료</h2>
        <span>${resourceOpens.length}회 열람</span>
      </div>
      ${adminRankList(countBy(resourceOpens, (event) => event.properties.resourceTitle || event.properties.resourceId), "아직 자료 열람 데이터가 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>인기 검색어</h2>
        <span>${searches.length}회 검색</span>
      </div>
      ${adminRankList(countBy(searches.filter((event) => event.properties.query), (event) => event.properties.query), "아직 검색 데이터가 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>결과 없는 검색어</h2>
        <span>${noResults.length}회</span>
      </div>
      ${adminRankList(countBy(noResults, (event) => event.properties.query), "결과 없는 검색어가 아직 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>최근 이벤트</h2>
        <span>최근 12개</span>
      </div>
      <div class="admin-event-list">
        ${events.slice(-12).reverse().map(adminEventTemplate).join("") || `<p class="admin-empty">아직 이벤트가 없어요.</p>`}
      </div>
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>자료 관리</h2>
        <span>${resources.length}개 연결됨</span>
      </div>
      <div class="admin-resource-guide">
        <article>
          <strong>자료 원본</strong>
          <span>data/resources.json</span>
        </article>
        <article>
          <strong>입력 양식</strong>
          <span>data/resources-template.csv</span>
        </article>
        <article>
          <strong>수정 방법</strong>
          <span>JSON에 자료를 추가하고 새로고침하면 검색에 반영됩니다.</span>
        </article>
      </div>
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>Supabase 연결</h2>
        <span>${supabaseConfig.enabled ? `연결 준비 · 대기 ${pendingCount}개` : "미연결"}</span>
      </div>
      <form class="supabase-form" data-supabase-form>
        <label>
          <span>Project URL</span>
          <input name="supabaseUrl" type="url" placeholder="https://xxxxx.supabase.co" value="${escapeHtml(supabaseConfig.url)}" autocomplete="off" />
        </label>
        <label>
          <span>Anon public key</span>
          <input name="supabaseAnonKey" type="password" placeholder="eyJhbGci..." value="${escapeHtml(supabaseConfig.anonKey)}" autocomplete="off" />
        </label>
        <div class="supabase-actions">
          <button type="submit">저장하고 동기화</button>
          <button type="button" data-supabase-test>테스트 전송</button>
        </div>
      </form>
      <p class="admin-empty">Supabase SQL Editor에서 supabase/analytics_events.sql을 먼저 실행한 뒤 URL과 anon key를 넣으면 됩니다. 현재 전송 완료 ${sentCount}개.</p>
    </section>
    <div class="admin-actions">
      <button type="button" data-admin-export>JSON 내보내기</button>
      <button type="button" data-admin-reset>이 기기 데이터 초기화</button>
    </div>
    <p class="admin-note">앱 방문자는 개인정보 없이 익명 ID로 기록됩니다. Supabase에는 insert만 열고 select는 닫아두는 구성이 안전합니다.</p>
  `;
}

function adminMetricTemplate(label, value) {
  return `
    <article>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `;
}

function countBy(events, getKey) {
  return events.reduce((acc, event) => {
    const key = getKey(event);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function adminRankList(counts, emptyText) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) return `<p class="admin-empty">${escapeHtml(emptyText)}</p>`;

  return `
    <ol class="admin-rank-list">
      ${entries.map(([label, count]) => `
        <li>
          <span>${escapeHtml(label)}</span>
          <strong>${count}</strong>
        </li>
      `).join("")}
    </ol>
  `;
}

function adminEventTemplate(event) {
  const date = new Date(event.createdAt);
  const detail = event.properties.resourceTitle || event.properties.query || event.properties.tab || event.properties.category || "";
  return `
    <article>
      <strong>${escapeHtml(event.name)}</strong>
      <span>${escapeHtml(detail || "상세 없음")}</span>
      <time>${escapeHtml(date.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }))}</time>
    </article>
  `;
}

function exportAnalytics() {
  const events = readAnalyticsEvents();
  const data = JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `park-yongmin-analytics-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  trackEvent("analytics_export", { eventCount: events.length });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function homeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>`;
}

function searchIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Zm5.2-2.1 4.5 4.5"/></svg>`;
}

function starIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 2.5 5.1 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8Z"/></svg>`;
}

function bookIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h5.2c1 0 1.8.8 1.8 1.8v13.2c0-.9-.8-1.6-1.8-1.6H5V4.5Zm14 0h-5.2c-1 0-1.8.8-1.8 1.8v13.2c0-.9.8-1.6 1.8-1.6H19V4.5Z"/></svg>`;
}

function userIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm-7 8.3c.8-4.1 3.2-6.2 7-6.2s6.2 2.1 7 6.2"/></svg>`;
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
