const RESOURCE_DATA_URL = "./data/resources.json?v=20260610-1";

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

let activeType = "전체";
let activeIntent = "전체";
let activeResource = resources[0];
let activeTab = "home";
let resultMode = "search";
let activeSort = "relevance";
let savedIds = new Set(readStoredIds("pym.saved"));
let recentIds = readStoredIds("pym.recent");
let lastSearchSignature = "";

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

resourceCount.textContent = `${resources.length}개`;
renderHomeFeed();
renderQuestionHub();
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
    { id: "learning", label: "내 학습", icon: bookIcon(), target: () => {
      resultMode = "recent";
      setSearchMode();
      renderResults();
      document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
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
  activeTab = "home";
  resultMode = "search";
  queryInput.value = "";
  screenQueryInput.value = "";
  renderHomeFeed();
}

function setSearchMode() {
  document.body.classList.add("search-mode");
  screenQueryInput.value = queryInput.value;
  renderSortTabs();
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
  try {
    const parsed = JSON.parse(localStorage.getItem("pym.analyticsEvents") || "[]");
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
