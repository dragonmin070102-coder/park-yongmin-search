const RESOURCE_DATA_URL = "./data/resources.json?v=20260611-3";
const KHSIM_URL = "https://dragonmin070102-coder.github.io/KHSIM/";

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
let resourceStats = new Map();
let trendStats = new Map();
let adminDashboardState = {
  period: "all",
  query: "",
  loading: false,
  data: null,
  error: ""
};
let adminSearchTimer = null;

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
loadContentStats();
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
  const button = event.target.closest("[data-khsim-open]");
  if (!button) return;

  trackEvent("khshim_notice_open", { url: KHSIM_URL });
  openKhsimNotice();
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-khsim-link]");
  if (!link) return;

  trackEvent("khshim_external_open", { url: link.href });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-khsim-dismiss]");
  if (!button) return;

  closePreviewModal();
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
  if (resource) {
    bumpResourceView(resource.id);
    renderResults();
    renderDetail(activeResource);
  }
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
  const periodButton = event.target.closest("[data-admin-period]");
  if (!periodButton) return;

  adminDashboardState.period = periodButton.dataset.adminPeriod;
  renderAnalyticsAdmin();
  loadAdminDashboardData();
});

document.addEventListener("input", (event) => {
  const searchInput = event.target.closest("[data-admin-search]");
  if (!searchInput) return;

  adminDashboardState.query = searchInput.value;
  window.clearTimeout(adminSearchTimer);
  adminSearchTimer = window.setTimeout(renderAnalyticsAdmin, 220);
});

document.addEventListener("click", (event) => {
  const csvButton = event.target.closest("[data-admin-csv]");
  if (!csvButton) return;

  exportAdminCsv(csvButton.dataset.adminCsv);
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
      <div class="content-stats">${escapeHtml(trendMetaText(article))}</div>
      <div class="trend-tags">
        ${article.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
      </div>
      <button type="button" data-trend-open="${escapeHtml(article.id)}">요약 보기</button>
    </article>
  `;
}

function openTrendArticle(article) {
  bumpTrendView(article.id);
  trackEvent("trend_article_open", { articleId: article.id, title: article.title, source: article.source });
  renderTrendScreen();
  previewModal.setAttribute("aria-labelledby", "modalTitle");
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
        <p>${escapeHtml(article.category)} · ${escapeHtml(article.source)} · ${escapeHtml(article.date)} · ${trendMetaText(article)}</p>
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
        <button type="button" data-trend-comments="${escapeHtml(article.id)}">댓글 보기 (${getTrendCommentCount(article)})</button>
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
    .then((comments) => {
      setTrendCommentCount(article.id, comments.length);
      renderTrendScreen();
      renderTrendComments(article, { comments });
    })
    .catch(() => {
      renderTrendComments(article, { error: "댓글 서버 연결 전이라 예시 댓글을 보여주고 있어요." });
    });
}

function renderTrendComments(article, options = {}) {
  previewModal.setAttribute("aria-labelledby", "modalTitle");
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
    setTrendCommentCount(article.id, comments.length);
    renderTrendScreen();
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
    setTrendCommentCount(article.id, comments.length);
    renderTrendScreen();
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
        <span>${escapeHtml(resource.stage)} · 조회 ${formatCount(getResourceViews(resource.id))} · ${escapeHtml(resource.source)}</span>
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
      <div class="content-stats">조회 ${formatCount(getResourceViews(resource.id))} · ${escapeHtml(resource.confidence)} · ${escapeHtml(resource.source)}</div>
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
  bumpResourceView(resource.id);
  rememberRecent(resource.id);
  trackEvent("resource_open", resourcePayload(resource));
  previewModal.setAttribute("aria-labelledby", "modalTitle");
  renderModalContent(resource);
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function openKhsimNotice() {
  previewModal.setAttribute("aria-labelledby", "khsimModalTitle");
  modalContent.innerHTML = `
    <div class="khshim-notice">
      <p class="eyebrow">KHSIM Simulation</p>
      <h2 id="khsimModalTitle">태블릿이나 PC에서 체험해 주세요</h2>
      <p class="khshim-lead">
        KHSIM은 실제 환자 시뮬레이션처럼 화면을 보면서 조작하는 콘텐츠라 모바일에서는 버튼과 화면이 답답할 수 있어요.
        휴대폰에서는 미리 둘러보고, 제대로 체험할 때는 태블릿이나 PC로 여는 걸 추천합니다.
      </p>
      <div class="khshim-device-list" aria-label="권장 환경">
        <div>
          <span>PC</span>
          <strong>가장 추천</strong>
          <p>화면과 조작 영역을 한 번에 보기 좋아요.</p>
        </div>
        <div>
          <span>Tablet</span>
          <strong>체험 가능</strong>
          <p>가로 모드로 보면 훨씬 안정적이에요.</p>
        </div>
        <div>
          <span>Mobile</span>
          <strong>미리보기용</strong>
          <p>접속은 가능하지만 조작이 불편할 수 있어요.</p>
        </div>
      </div>
      <div class="khshim-actions">
        <button type="button" data-khsim-dismiss>나중에 보기</button>
        <a href="${KHSIM_URL}" target="_blank" rel="noreferrer" data-khsim-link>KHSIM 열기</a>
      </div>
    </div>
  `;
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

async function loadContentStats() {
  if (!supabaseConfig.enabled) return;

  try {
    const resourceRows = await supabaseRequest("analytics_popular_resources?select=resource_id,open_count");
    resourceStats = new Map(resourceRows
      .filter((row) => row.resource_id)
      .map((row) => [row.resource_id, { views: Number(row.open_count || 0) }]));
    renderResults();
    renderDetail(activeResource);
  } catch {
    // Stats are a display enhancement; keep the app usable if views are missing.
  }

  try {
    const trendRows = await supabaseRequest("trend_article_stats?select=article_id,view_count,comment_count,like_count");
    trendStats = new Map(trendRows
      .filter((row) => row.article_id)
      .map((row) => [row.article_id, {
        views: Number(row.view_count || 0),
        comments: Number(row.comment_count || 0),
        likes: Number(row.like_count || 0)
      }]));
    renderTrendScreen();
  } catch {
    loadTrendCommentCounts();
  }
}

async function loadTrendCommentCounts() {
  try {
    const commentRows = await supabaseRequest("trend_comments?select=article_id,likes&hidden=eq.false&limit=500");
    const counts = new Map();
    commentRows.forEach((row) => {
      const current = counts.get(row.article_id) || { comments: 0, likes: 0 };
      counts.set(row.article_id, {
        comments: current.comments + 1,
        likes: current.likes + Number(row.likes || 0)
      });
    });
    counts.forEach((value, articleId) => {
      const current = getTrendStats(articleId);
      trendStats.set(articleId, { ...current, ...value });
    });
    renderTrendScreen();
  } catch {
    // Keep static demo counts if comment stats are not available yet.
  }
}

function getResourceViews(resourceId) {
  return Number(resourceStats.get(resourceId)?.views || 0);
}

function bumpResourceView(resourceId) {
  const current = resourceStats.get(resourceId) || { views: 0 };
  resourceStats.set(resourceId, { ...current, views: Number(current.views || 0) + 1 });
}

function getTrendStats(articleId) {
  return trendStats.get(articleId) || { views: 0, comments: 0, likes: 0 };
}

function bumpTrendView(articleId) {
  const current = getTrendStats(articleId);
  trendStats.set(articleId, { ...current, views: Number(current.views || 0) + 1 });
}

function getTrendCommentCount(article) {
  return Number(getTrendStats(article.id).comments || article.comments.length || 0);
}

function setTrendCommentCount(articleId, count) {
  const current = getTrendStats(articleId);
  trendStats.set(articleId, { ...current, comments: Number(count || 0) });
}

function trendMetaText(article) {
  const stats = getTrendStats(article.id);
  return `조회 ${formatCount(stats.views)} · 댓글 ${formatCount(getTrendCommentCount(article))}`;
}

function formatCount(value) {
  const count = Number(value || 0);
  if (count >= 10000) return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}천`;
  return String(count);
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
  const data = adminDashboardState.data || buildEmptyAdminDashboardData();
  const filtered = filterAdminData(data);
  const kpis = getAdminKpis(filtered);
  const insights = getAdminInsights(filtered);
  const gaps = getContentGaps(filtered.noResults);
  const demand = getDemandAnalysis(filtered.searchTerms, filtered.popularResources);
  const periodLabel = adminPeriodLabel(adminDashboardState.period);

  analyticsContent.innerHTML = `
    <section class="admin-hero">
      <p class="eyebrow">Content Operating Center</p>
      <h2>박용민 콘텐츠 운영센터</h2>
      <p>검색, 조회, 실패어, 댓글을 묶어서 다음 콘텐츠 우선순위를 판단합니다.</p>
    </section>
    <div class="admin-toolbar">
      <div class="admin-period-tabs">
        ${["today", "7d", "30d", "all"].map((period) => `
          <button type="button" class="${adminDashboardState.period === period ? "active" : ""}" data-admin-period="${period}">${adminPeriodLabel(period)}</button>
        `).join("")}
      </div>
      <input data-admin-search type="search" value="${escapeHtml(adminDashboardState.query)}" placeholder="검색어, 자료명 검색" />
    </div>
    ${adminDashboardState.loading ? `<p class="admin-status">Supabase 데이터를 불러오는 중이에요.</p>` : ""}
    ${adminDashboardState.error ? `<p class="admin-status error">${escapeHtml(adminDashboardState.error)}</p>` : ""}
    <div class="admin-summary dashboard-kpis">
      ${adminMetricTemplate("총 이벤트 수", kpis.totalEvents)}
      ${adminMetricTemplate("총 검색 수", kpis.totalSearches)}
      ${adminMetricTemplate("총 자료 조회 수", kpis.totalResourceViews)}
      ${adminMetricTemplate("검색 실패 수", kpis.totalFailures)}
      ${adminMetricTemplate("댓글 수", kpis.totalComments)}
      ${adminMetricTemplate("최근 7일 활성 사용자", kpis.activeUsers7d)}
    </div>
    <section class="admin-card insight-card">
      <div class="admin-card-head">
        <h2>운영자 인사이트</h2>
        <span>${periodLabel} 기준</span>
      </div>
      <div class="admin-insights">
        ${insights.map((insight) => `<article>${escapeHtml(insight)}</article>`).join("")}
      </div>
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>인기 검색어 TOP 20</h2>
        <button type="button" data-admin-csv="searchTerms">CSV</button>
      </div>
      ${barChartTemplate(filtered.searchTerms.slice(0, 10), "query", "search_count")}
      ${adminDataTable(["검색어", "검색 횟수", "최근 검색일"], filtered.searchTerms.slice(0, 20).map((row) => [
        row.query,
        formatCount(row.search_count),
        formatAdminDate(row.last_searched_at)
      ]), "검색어 데이터가 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>검색 실패어 TOP 20</h2>
        <button type="button" data-admin-csv="noResults">CSV</button>
      </div>
      ${lineChartTemplate(filtered.noResults.slice(0, 20))}
      ${adminDataTable(["검색어", "실패 횟수", "마지막 검색일", "운영 판단"], filtered.noResults.slice(0, 20).map((row) => [
        row.query,
        formatCount(row.no_result_count),
        formatAdminDate(row.last_searched_at),
        row.no_result_count >= 3 ? `<span class="admin-badge danger">콘텐츠 제작 후보</span>` : `<span class="admin-badge">관찰</span>`
      ]), "검색 실패 데이터가 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>인기 콘텐츠 TOP 20</h2>
        <button type="button" data-admin-csv="popularResources">CSV</button>
      </div>
      ${barChartTemplate(filtered.popularResources.slice(0, 10), "resource_title", "open_count")}
      ${adminDataTable(["제목", "조회수", "최근 조회일"], filtered.popularResources.slice(0, 20).map((row) => [
        row.resource_title || row.resource_id,
        formatCount(row.open_count),
        formatAdminDate(row.last_opened_at)
      ]), "인기 콘텐츠 데이터가 없어요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>콘텐츠 수요 분석</h2>
        <span>검색→조회 전환율</span>
      </div>
      ${adminDataTable(["주제", "검색량", "조회량", "전환율"], demand.slice(0, 20).map((row) => [
        row.topic,
        formatCount(row.searches),
        formatCount(row.views),
        `${row.conversion}%`
      ]), "수요 분석 데이터가 부족해요")}
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>콘텐츠 갭 분석</h2>
        <span>실패 3회 이상</span>
      </div>
      <div class="gap-list">
        ${gaps.length ? gaps.map((row) => `
          <article>
            <strong>🔥 ${escapeHtml(row.query)}</strong>
            <span>검색 실패 ${formatCount(row.no_result_count)}회 · 사용자 수요는 있으나 콘텐츠가 부족한 주제</span>
          </article>
        `).join("") : `<p class="admin-empty">현재 기준 콘텐츠 제작 추천 항목이 없어요.</p>`}
      </div>
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>데이터 연결</h2>
        <span>${supabaseConfig.enabled ? "Supabase 연결됨" : "미연결"}</span>
      </div>
      <p class="admin-note">검색어 길이 2 이하의 노이즈는 기본 숨김 처리됩니다. 기간 필터는 각 집계 row의 최근 활동일 기준으로 적용됩니다.</p>
    </section>
    <div class="admin-actions">
      <button type="button" data-admin-export>JSON 내보내기</button>
      <button type="button" data-supabase-test>Supabase 테스트</button>
    </div>
  `;

  if (supabaseConfig.enabled && !adminDashboardState.data && !adminDashboardState.loading) {
    loadAdminDashboardData();
  }
}

function adminMetricTemplate(label, value) {
  return `
    <article>
      <strong>${escapeHtml(formatCount(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `;
}

async function loadAdminDashboardData() {
  if (!supabaseConfig.enabled) {
    adminDashboardState.error = "Supabase 연결 정보가 필요합니다.";
    renderAnalyticsAdmin();
    return;
  }

  adminDashboardState.loading = true;
  adminDashboardState.error = "";
  renderAnalyticsAdmin();

  try {
    const [searchTerms, noResults, popularResources, comments, rawEvents] = await Promise.all([
      supabaseRequest("analytics_search_terms?select=query,search_count,last_searched_at&order=search_count.desc&limit=200"),
      supabaseRequest("analytics_no_result_terms?select=query,no_result_count,last_searched_at&order=no_result_count.desc&limit=200"),
      supabaseRequest("analytics_popular_resources?select=resource_id,resource_title,open_count,last_opened_at&order=open_count.desc&limit=200"),
      supabaseRequest("trend_comments?select=id,article_id,nickname,body,likes,created_at&hidden=eq.false&order=created_at.desc&limit=500"),
      supabaseRequest("analytics_events?select=event_name,anonymous_user_id,created_at&limit=1000")
        .catch(() => [])
    ]);

    adminDashboardState.data = {
      searchTerms: normalizeAdminRows(searchTerms, "query", "search_count", "last_searched_at"),
      noResults: normalizeAdminRows(noResults, "query", "no_result_count", "last_searched_at"),
      popularResources: popularResources.map((row) => ({
        ...row,
        open_count: Number(row.open_count || 0)
      })),
      comments,
      rawEvents
    };
  } catch {
    adminDashboardState.error = "Supabase 데이터를 불러오지 못했어요. view 권한과 SQL 실행 상태를 확인해 주세요.";
  } finally {
    adminDashboardState.loading = false;
    renderAnalyticsAdmin();
  }
}

function normalizeAdminRows(rows, labelKey, countKey, dateKey) {
  return rows
    .map((row) => ({
      ...row,
      [labelKey]: String(row[labelKey] || "").trim(),
      [countKey]: Number(row[countKey] || 0),
      [dateKey]: row[dateKey] || null
    }))
    .filter((row) => row[labelKey]);
}

function buildEmptyAdminDashboardData() {
  return {
    searchTerms: [],
    noResults: [],
    popularResources: [],
    comments: [],
    rawEvents: readAnalyticsEvents()
  };
}

function filterAdminData(data) {
  const rangeStart = adminPeriodStart(adminDashboardState.period);
  const needle = adminDashboardState.query.trim().toLowerCase();

  const dateInRange = (value) => {
    if (!rangeStart || !value) return true;
    return new Date(value).getTime() >= rangeStart.getTime();
  };
  const matches = (...values) => {
    if (!needle) return true;
    return values.some((value) => String(value || "").toLowerCase().includes(needle));
  };

  return {
    searchTerms: data.searchTerms
      .filter((row) => isMeaningfulQuery(row.query))
      .filter((row) => dateInRange(row.last_searched_at))
      .filter((row) => matches(row.query))
      .sort((a, b) => b.search_count - a.search_count),
    noResults: data.noResults
      .filter((row) => isMeaningfulQuery(row.query))
      .filter((row) => dateInRange(row.last_searched_at))
      .filter((row) => matches(row.query))
      .sort((a, b) => b.no_result_count - a.no_result_count),
    popularResources: data.popularResources
      .filter((row) => dateInRange(row.last_opened_at))
      .filter((row) => matches(row.resource_title, row.resource_id))
      .sort((a, b) => b.open_count - a.open_count),
    comments: data.comments
      .filter((row) => dateInRange(row.created_at))
      .filter((row) => matches(row.body, row.nickname, row.article_id)),
    rawEvents: data.rawEvents.filter((row) => dateInRange(row.created_at))
  };
}

function getAdminKpis(data) {
  const totalSearches = sumBy(data.searchTerms, "search_count");
  const totalFailures = sumBy(data.noResults, "no_result_count");
  const totalResourceViews = sumBy(data.popularResources, "open_count");
  const totalComments = data.comments.length;
  const rawEvents = data.rawEvents || [];
  const localEvents = readAnalyticsEvents();
  const activeSource = rawEvents.length ? rawEvents : localEvents;
  const activeUsers7d = new Set(activeSource
    .filter((event) => new Date(event.created_at || event.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
    .map((event) => event.anonymous_user_id || event.userId)
    .filter(Boolean)).size;
  const totalEvents = rawEvents.length || totalSearches + totalFailures + totalResourceViews + totalComments;

  return {
    totalEvents,
    totalSearches,
    totalResourceViews,
    totalFailures,
    totalComments,
    activeUsers7d
  };
}

function getDemandAnalysis(searchTerms, popularResources) {
  const resourceLookup = popularResources.map((resource) => ({
    title: resource.resource_title || resource.resource_id,
    id: resource.resource_id,
    views: Number(resource.open_count || 0)
  }));

  return searchTerms.map((term) => {
    const match = resourceLookup.find((resource) => {
      const haystack = `${resource.title} ${resource.id}`.toLowerCase();
      return haystack.includes(term.query.toLowerCase()) || term.query.toLowerCase().includes(String(resource.id || "").toLowerCase());
    });
    const searches = Number(term.search_count || 0);
    const views = Number(match?.views || 0);
    return {
      topic: term.query,
      searches,
      views,
      conversion: searches ? Math.round((views / searches) * 100) : 0
    };
  }).sort((a, b) => (b.searches + b.views) - (a.searches + a.views));
}

function getContentGaps(noResults) {
  return noResults
    .filter((row) => row.no_result_count >= 3)
    .slice(0, 12);
}

function getAdminInsights(data) {
  const demand = getDemandAnalysis(data.searchTerms, data.popularResources);
  const gaps = getContentGaps(data.noResults);
  const insights = [];

  if (demand[0]) {
    insights.push(`${demand[0].topic}는 검색량 ${formatCount(demand[0].searches)}회, 조회량 ${formatCount(demand[0].views)}회로 가장 강한 관심 신호를 보입니다.`);
  }
  const topResource = data.popularResources[0];
  if (topResource) {
    insights.push(`${topResource.resource_title || topResource.resource_id} 자료가 조회 ${formatCount(topResource.open_count)}회로 가장 많이 열렸습니다.`);
  }
  if (gaps[0]) {
    insights.push(`${gaps[0].query} 검색 실패가 ${formatCount(gaps[0].no_result_count)}회라 신규 콘텐츠 제작을 고려하세요.`);
  }
  if (!insights.length) {
    insights.push("아직 판단할 데이터가 부족합니다. 검색과 자료 열람이 쌓이면 자동 인사이트가 생성됩니다.");
  }

  return insights;
}

function barChartTemplate(rows, labelKey, valueKey) {
  const data = rows.filter((row) => Number(row[valueKey] || 0) > 0).slice(0, 10);
  if (!data.length) return `<p class="admin-empty">차트로 볼 데이터가 아직 없어요.</p>`;
  const max = Math.max(...data.map((row) => Number(row[valueKey] || 0)), 1);

  return `
    <div class="admin-bar-chart">
      ${data.map((row) => {
        const label = row[labelKey] || row.resource_id || "이름 없음";
        const value = Number(row[valueKey] || 0);
        return `
          <div class="bar-row">
            <span>${escapeHtml(label)}</span>
            <div><i style="width: ${Math.max(5, Math.round((value / max) * 100))}%"></i></div>
            <strong>${formatCount(value)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function lineChartTemplate(rows) {
  const data = rows.filter((row) => Number(row.no_result_count || 0) > 0).slice(0, 12);
  if (!data.length) return `<p class="admin-empty">추이로 볼 검색 실패 데이터가 아직 없어요.</p>`;
  const max = Math.max(...data.map((row) => Number(row.no_result_count || 0)), 1);
  const points = data.map((row, index) => {
    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
    const y = 100 - (Number(row.no_result_count || 0) / max) * 82 - 8;
    return `${x},${y}`;
  }).join(" ");

  return `
    <div class="admin-line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="검색 실패 추이">
        <polyline points="${points}" fill="none" stroke="#3182f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
      <div>
        ${data.slice(0, 4).map((row) => `<span>${escapeHtml(row.query)}</span>`).join("")}
      </div>
    </div>
  `;
}

function adminDataTable(headers, rows, emptyText) {
  if (!rows.length) return `<p class="admin-empty">${escapeHtml(emptyText)}</p>`;
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>${row.map((cell) => `<td>${String(cell).startsWith("<") ? cell : escapeHtml(cell)}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function exportAdminCsv(kind) {
  const data = adminDashboardState.data ? filterAdminData(adminDashboardState.data) : buildEmptyAdminDashboardData();
  const map = {
    searchTerms: {
      filename: "popular-search-terms",
      rows: [["query", "search_count", "last_searched_at"], ...data.searchTerms.map((row) => [row.query, row.search_count, row.last_searched_at])]
    },
    noResults: {
      filename: "no-result-terms",
      rows: [["query", "no_result_count", "last_searched_at"], ...data.noResults.map((row) => [row.query, row.no_result_count, row.last_searched_at])]
    },
    popularResources: {
      filename: "popular-resources",
      rows: [["resource_title", "resource_id", "open_count", "last_opened_at"], ...data.popularResources.map((row) => [row.resource_title, row.resource_id, row.open_count, row.last_opened_at])]
    }
  };
  const target = map[kind];
  if (!target) return;

  const csv = target.rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${target.filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function sumBy(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
}

function isMeaningfulQuery(query) {
  const text = String(query || "").trim();
  if (text.length <= 2) return false;
  return !/^[A-Za-z]$/.test(text);
}

function adminPeriodStart(period) {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "7d") return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (period === "30d") return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function adminPeriodLabel(period) {
  return {
    today: "오늘",
    "7d": "7일",
    "30d": "30일",
    all: "전체"
  }[period] || "전체";
}

function formatAdminDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
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
