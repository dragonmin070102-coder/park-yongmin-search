(async () => {
const RESOURCE_DATA_URL = "./data/resources.json?v=20260708-1";
const KHSIM_URL = "https://dragonmin070102-coder.github.io/KHSIM/";
const PREMIUM_REGULAR_PRICE = "9,900원";
const PREMIUM_BASE_BUYER_COUNT = 344;
const PREMIUM_BASE_VIEW_COUNT = 1320;
const memoryStorage = new Map();

function safeStorageGet(key) {
  try {
    const value = window.localStorage?.getItem(key);
    return value ?? memoryStorage.get(key) ?? null;
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function safeStorageSet(key, value) {
  const stringValue = String(value);
  memoryStorage.set(key, stringValue);
  try {
    window.localStorage?.setItem(key, stringValue);
  } catch {
    // File previews or restricted browsers can block persistent storage.
  }
}

function safeStorageRemove(key) {
  memoryStorage.delete(key);
  try {
    window.localStorage?.removeItem(key);
  } catch {
    // Ignore storage restrictions.
  }
}

const FALLBACK_RESOURCE_DATA = {"updatedAt":"2026-06-22T23:35:00.000+09:00","resources":[{"id":"acs-ecg","title":"ACS + ECG","displayTitle":"ACS와 ECG","type":"심혈관","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1xfPlC4hBOCJJtfLiDMn3_9XrshpEjdHd/view?usp=drivesdk","tags":["ACS","ECG","STEMI","NSTEMI","협심증","심근경색","흉통","흉통 4단계","Troponin","ECG vector","심혈관","감별정리","핵심"],"summary":"급성관상동맥증후군을 ECG 변화와 연결해서 볼 수 있는 자료입니다.","points":["흉통 환자를 ACS 관점으로 분류할 때 유용합니다.","ECG 키워드로 같이 검색되도록 묶어두면 심근경색 자료와 연결성이 좋습니다.","영상에서 짧게 설명하고 자세한 판단 기준은 원본 PDF로 넘기기 좋은 자료입니다."],"useCase":"흉통, ACS, ECG 판독 흐름을 한 번에 찾게 하고 싶을 때","confidence":"파일 확인","system":"심혈관","intent":"감별정리","stage":"핵심","evidence":"본문에서 흉통 4단계 구조를 좁아짐, 터짐, 부분막힘, 완전막힘으로 정리하고 Stable angina, Unstable angina, NSTEMI, STEMI를 비교합니다.","related":["mi","acls"],"keywords":["흉통 4단계","Troponin","NSTEMI","STEMI","ECG vector"],"rank":0},{"id":"mi","title":"Myocardial ischemia and infarction","displayTitle":"심근허혈 vs 심근경색","type":"심혈관","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1aTqToxtbH1B9Sqr00j2nQ4Lx21ed6r1v/view?usp=drivesdk","tags":["MI","ischemia","infarction","ECG","ST elevation","ST depression","NTG","plaque","흉통","협심증","심근경색","ST 변화","plaque rupture","NTG 반응","심혈관","개념이해","심화"],"summary":"stable plaque와 unstable plaque의 차이에서 시작해 허혈과 경색이 왜 다르게 나타나는지 설명하는 자료입니다.","points":["허혈은 산소 공급이 수요보다 부족해지는 상태이며, 보통 휴식이나 NTG에 반응합니다.","경색은 plaque rupture와 혈전 형성으로 혈관이 막혀 심근 손상이 진행되는 상황입니다.","자료에서는 ischemia는 ST depression, infarction은 ST elevation으로 연결해 ECG 원리를 설명합니다."],"useCase":"협심증과 심근경색 차이, ST 변화 원리, 흉통 환자 설명 자료가 필요할 때","confidence":"본문 확인","system":"심혈관","intent":"개념이해","stage":"심화","evidence":"본문에서 stable plaque와 vulnerable plaque, ischemia와 infarction, ST depression/elevation의 차이를 연결해 설명합니다.","related":["acs-ecg","acls"],"keywords":["협심증","심근경색","ST 변화","plaque rupture","NTG 반응"],"rank":1},{"id":"iicp","title":"IICP management","displayTitle":"두개내압 상승 관리","type":"신경계","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1c0o7fDaGoYst9PbLAj83FG1zWXVH1cjq/view?usp=drivesdk","tags":["IICP","ICP","두개내압","신경계","뇌압","의식","간호중재","의식 변화","신경계 사정","중환자","핵심"],"summary":"두개내압 상승 상황에서 관찰해야 할 변화와 관리 방향을 찾기 좋은 자료입니다.","points":["신경계 환자 사정과 우선순위 간호를 연결하기 좋습니다.","의식 변화, 활력징후, 체위, 자극 최소화 같은 검색어와 함께 노출되면 좋습니다.","신경계 질환 폴더 자료와 묶어 추천하면 체류 시간이 늘어납니다."],"useCase":"IICP 간호중재, 신경계 중환자 사정, 케이스 스터디 보조","confidence":"파일 확인","system":"신경계","intent":"간호중재","stage":"핵심","evidence":"Drive에 IICP management PDF로 확인된 자료입니다. 신경계 사정과 두개내압 상승 관리 자료로 분류했습니다.","related":["gbs","als","ms"],"keywords":["두개내압","의식 변화","신경계 사정","중환자"],"rank":2},{"id":"ast-alt-ratio","title":"AST:ALT 수치비교 해석","displayTitle":"AST/ALT 수치 비교","type":"검사수치","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1JyQF5XsHs48UPl_GTM3SJpba5J1DDcMu/view?usp=drivesdk","tags":["AST","ALT","간수치","검사수치","liver","비교","AST/ALT ratio","미토콘드리아 손상","세포질 손상","검사해석","핵심"],"summary":"AST와 ALT를 따로 외우는 대신 수치 비교와 해석 흐름으로 볼 수 있는 자료입니다.","points":["검사수치 검색의 대표 입구로 두기 좋습니다.","AST 단독, ALT 단독 자료와 상호 추천되도록 묶었습니다.","간호학과 학생들이 케이스 lab data 해석할 때 바로 찾을 가능성이 큽니다."],"useCase":"lab 해석, 간수치 비교, 케이스 스터디 검사 결과 설명","confidence":"파일 확인","system":"검사수치","intent":"검사해석","stage":"핵심","evidence":"본문에서 AST/ALT 비율을 단순 간수치 상승이 아니라 간세포와 미토콘드리아 중 어디서부터 손상됐는지 읽는 지표로 설명합니다.","related":["ast","alt"],"keywords":["AST/ALT ratio","미토콘드리아 손상","세포질 손상","간수치"],"rank":3},{"id":"pneumothorax-cxr","title":"pneumothorax에서의 CXR","displayTitle":"기흉 CXR 읽기","type":"호흡기","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1Mx8exaX4IpWS7KvAR9EEvOSoLo3PFDYP/view?usp=drivesdk","tags":["pneumothorax","기흉","CXR","Chest X-ray","흉부","호흡곤란","흉부 영상","호흡기","영상판독","기초"],"summary":"기흉을 흉부 X-ray에서 어떻게 봐야 하는지 연결해 보여줄 수 있는 영상 보조 자료입니다.","points":["CXR 검색 시 ACS/ECG와 별도로 흉부 영상 자료로 노출되게 구성했습니다.","기흉의 임상 증상과 영상 소견을 연결하는 카드형 설명에 적합합니다.","학생들이 Chest PA/AP, CXR 같은 실무형 콘텐츠에서 같이 찾을 가능성이 큽니다."],"useCase":"기흉 영상 소견, 흉부 X-ray 기초 설명, 실습 전 빠른 확인","confidence":"파일 확인","system":"호흡기","intent":"영상판독","stage":"기초","evidence":"Drive에 pneumothorax에서의 CXR PDF로 확인된 자료입니다. 흉부 X-ray와 기흉 검색에 우선 노출되도록 분류했습니다.","related":["acs-ecg","pneumonia-case-study","abga"],"keywords":["기흉","CXR","Chest X-ray","흉부 영상"],"rank":4},{"id":"gbs","title":"GBS 임상추론 박용민","displayTitle":"길랭-바레 증후군 임상추론","type":"신경계","format":"PDF","source":"신경계 질환 폴더","url":"https://drive.google.com/file/d/1qI6H7NXcWDEIq5Hq8eGJSyYGWozFN9jp/view?usp=drivesdk","tags":["GBS","Guillain-Barre","길랭바레","신경계","상행성 마비","임상추론","호흡근","심화"],"summary":"GBS를 신경계 임상추론 콘텐츠로 연결하는 자료입니다.","points":["상행성 마비, 호흡근 침범, 신경계 감별 키워드와 잘 맞습니다.","콘텐츠 분석 문서에서 판단형 콘텐츠는 댓글 반응이 좋은 축으로 확인됐습니다.","학생들이 감별 포인트를 찾을 때 상세 PDF로 연결하기 좋습니다."],"useCase":"GBS 감별, 신경계 응급 사정, 호흡근 약화 포인트","confidence":"파일 확인","system":"신경계","intent":"임상추론","stage":"심화","evidence":"신경계 질환 폴더에서 GBS 임상추론 PDF로 확인된 자료입니다. 상행성 마비와 호흡근 침범 감별 키워드로 분류했습니다.","related":["mg","als","ms","khsim-simulation"],"keywords":["GBS","길랭바레","상행성 마비","호흡근"],"rank":5},{"id":"mg","title":"MG 임상추론 박용민","displayTitle":"중증근무력증 임상추론","type":"신경계","format":"PDF","source":"신경계 질환 폴더","url":"https://drive.google.com/file/d/1H4nkqNIevngtKMr56ajvp8TWRzKSGbJu/view?usp=drivesdk","tags":["MG","myasthenia gravis","중증근무력증","신경계","근력저하","임상추론","호흡근","심화"],"summary":"MG를 임상추론 방식으로 정리한 신경계 질환 자료입니다.","points":["근력저하, 피로, 호흡근 약화 같은 키워드와 연결되도록 설계했습니다.","GBS, ALS와 비교해 찾는 사용자를 고려해 신경계 묶음으로 배치했습니다.","간호학과 케이스에서 증상 변화와 우선순위 설명에 유용합니다."],"useCase":"중증근무력증 감별, 신경근 질환 정리","confidence":"파일 확인","system":"신경계","intent":"임상추론","stage":"심화","evidence":"신경계 질환 폴더에서 MG 임상추론 PDF로 확인된 자료입니다. 근력저하와 신경근 질환 감별로 분류했습니다.","related":["gbs","als","ms"],"keywords":["MG","중증근무력증","근력저하","호흡근"],"rank":6},{"id":"als","title":"ALS 임상추론 박용민","displayTitle":"ALS 임상추론","type":"신경계","format":"PDF","source":"신경계 질환 폴더","url":"https://drive.google.com/file/d/1GanISYp5A5b3zPlj0fY37zjlJ3VGdH6r/view?usp=drivesdk","tags":["ALS","amyotrophic lateral sclerosis","루게릭","신경계","운동신경원","임상추론","진행성 근력저하","심화"],"summary":"ALS를 신경계 임상추론 흐름으로 찾을 수 있는 자료입니다.","points":["운동신경원 질환과 진행성 근력저하 키워드로 검색되게 구성했습니다.","MS, MG, GBS와 비교 검색될 수 있게 신경계 카테고리에 묶었습니다.","긴 설명보다 원본 자료로 넘어가는 길을 분명하게 보여주는 카드가 좋습니다."],"useCase":"ALS 개념 정리, 신경계 질환 비교, 임상추론 학습","confidence":"파일 확인","system":"신경계","intent":"임상추론","stage":"심화","evidence":"신경계 질환 폴더에서 ALS 임상추론 PDF로 확인된 자료입니다. 운동신경원 질환과 진행성 근력저하로 분류했습니다.","related":["mg","gbs","ms"],"keywords":["ALS","루게릭","운동신경원","진행성 근력저하"],"rank":7},{"id":"ms","title":"MS 임상추론 박용민","displayTitle":"다발성경화증 임상추론","type":"신경계","format":"PDF","source":"신경계 질환 폴더","url":"https://drive.google.com/file/d/16RhNgiR8NTJI8bTgxJYpi-pihKDqZahY/view?usp=drivesdk","tags":["MS","multiple sclerosis","다발성경화증","신경계","임상추론","신경계 감별","심화"],"summary":"MS를 신경계 임상추론 관점에서 찾을 수 있는 자료입니다.","points":["신경계 감별 학습에서 MG, GBS, ALS, PD 자료와 같이 추천하기 좋습니다.","질환명 약어로 검색해도 나오도록 태그를 넣었습니다.","학생들이 헷갈리는 신경계 질환 묶음의 한 축으로 쓰기 좋습니다."],"useCase":"신경계 질환 감별, MS 케이스 정리, 임상추론 학습","confidence":"파일 확인","system":"신경계","intent":"임상추론","stage":"심화","evidence":"신경계 질환 폴더에서 MS 임상추론 PDF로 확인된 자료입니다. 신경계 질환 감별 묶음에 포함했습니다.","related":["mg","gbs","als","pd"],"keywords":["MS","다발성경화증","신경계 감별"],"rank":8},{"id":"pd","title":"PD 임상추론 박용민","displayTitle":"파킨슨병 임상추론","type":"신경계","format":"PDF","source":"신경계 질환 폴더","url":"https://drive.google.com/file/d/1wW1zdJ06-cJzHl6b1PkdQWKzmntl58tg/view?usp=drivesdk","tags":["PD","Parkinson disease","파킨슨병","신경계","운동증상","임상추론","서동","강직","심화"],"summary":"파킨슨병을 임상추론 관점에서 학습할 수 있는 자료입니다.","points":["떨림, 서동, 강직 등 운동증상 검색과 연결하기 좋습니다.","신경계 질환 폴더의 다른 임상추론 PDF와 함께 보여주면 좋습니다.","노인간호와 신경계 케이스 모두에서 찾을 수 있게 태그를 넓게 잡았습니다."],"useCase":"파킨슨병 증상 이해, 신경계 케이스 스터디","confidence":"파일 확인","system":"신경계","intent":"임상추론","stage":"심화","evidence":"신경계 질환 폴더에서 PD 임상추론 PDF로 확인된 자료입니다. 운동증상과 노인 신경계 케이스로 분류했습니다.","related":["ms","mg","gbs"],"keywords":["PD","파킨슨병","운동증상","서동","강직"],"rank":9},{"id":"thyroidectomy","title":"thyroidectomy","displayTitle":"갑상선절제술","type":"수술간호","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1zwkzOFX8v9nLOIs47W_kUJC9Sx5hKmAj/view?usp=drivesdk","tags":["thyroidectomy","갑상선절제술","수술간호","합병증","칼슘","기도","출혈","저칼슘혈증","간호중재","핵심"],"summary":"갑상선절제술 전후 간호와 합병증 포인트를 찾는 데 쓸 수 있는 자료입니다.","points":["수술간호 카테고리의 시작 자료로 좋습니다.","기도, 출혈, 저칼슘혈증 같은 핵심 키워드와 연결될 수 있습니다.","케이스 과제에서 수술 후 관찰 포인트를 찾는 사용자에게 적합합니다."],"useCase":"수술 전후 간호, 갑상선 수술 합병증 확인","confidence":"파일 확인","system":"수술간호","intent":"간호중재","stage":"핵심","evidence":"Drive에 thyroidectomy PDF로 확인된 자료입니다. 갑상선절제술 전후 관찰과 합병증 키워드로 분류했습니다.","related":[],"keywords":["갑상선절제술","기도","출혈","저칼슘혈증"],"rank":10},{"id":"ast","title":"Aspartate aminotransferase","displayTitle":"AST 설명","type":"검사수치","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1ukDpuad1OtJHQR2_4TjRwlZq8X5hk0-Z/view?usp=drivesdk","tags":["AST","Aspartate aminotransferase","간수치","검사","lab","검사수치","검사해석","기초"],"summary":"AST가 무엇을 반영하는지 따로 확인할 수 있는 검사수치 자료입니다.","points":["AST/ALT 비교 자료로 넘어가기 전 기초 설명 카드로 쓰기 좋습니다.","검사수치 카테고리에 묶어 두면 검색 경험이 깔끔합니다.","ALT 자료와 나란히 보여주면 학습자가 차이를 빠르게 잡을 수 있습니다."],"useCase":"AST 단독 개념 확인, 검사 결과 해석 보조","confidence":"파일 확인","system":"검사수치","intent":"검사해석","stage":"기초","evidence":"Drive에 Aspartate aminotransferase PDF로 확인된 자료입니다. AST 단독 개념과 AST/ALT 비교 전 기초 자료로 분류했습니다.","related":["ast-alt-ratio","alt"],"keywords":["AST","Aspartate aminotransferase","간수치"],"rank":11},{"id":"alt","title":"Alanine aminotransferase","displayTitle":"ALT 설명","type":"검사수치","format":"PDF","source":"박용민 컨텐츠 정리본 PDF","url":"https://drive.google.com/file/d/1sVakiSM1lqXKwiAvbaxGBXWds5d6zwKw/view?usp=drivesdk","tags":["ALT","Alanine aminotransferase","간수치","검사","lab","검사수치","검사해석","기초"],"summary":"ALT의 의미와 간 관련 검사 해석을 찾을 수 있는 자료입니다.","points":["AST 자료와 함께 검사수치 검색의 기본 묶음으로 좋습니다.","케이스 스터디에서 lab abnormality 설명으로 연결하기 좋습니다.","비교형 자료보다 먼저 보는 기초 카드로 배치할 수 있습니다."],"useCase":"ALT 단독 개념 확인, 간수치 해석 보조","confidence":"파일 확인","system":"검사수치","intent":"검사해석","stage":"기초","evidence":"Drive에 Alanine aminotransferase PDF로 확인된 자료입니다. ALT 단독 개념과 AST/ALT 비교 전 기초 자료로 분류했습니다.","related":["ast-alt-ratio","ast"],"keywords":["ALT","Alanine aminotransferase","간수치"],"rank":12},{"id":"siadh","title":"SIADH clinical reasoning","displayTitle":"SIADH 임상추론","type":"검사수치","format":"PDF","source":"박용민 임상추론 PDF","url":"https://drive.google.com/file/d/14E7UgDyYbJ6oTIbslcwLhhbku2SYn8qy/view?usp=drivesdk","tags":["SIADH","항이뇨호르몬 부적절분비 증후군","Syndrome of Inappropriate Antidiuretic Hormone secretion","저나트륨혈증","hyponatremia","ADH","소세포폐암","SCLC","혈장 삼투압","요 삼투압","농축뇨","수분제한","I/O","LOC","검사수치","임상추론","심화"],"summary":"ADH 과다분비로 수분 재흡수가 증가해 부종 없는 희석성 저나트륨혈증이 나타나는 SIADH 임상추론 자료입니다.","points":["소세포폐암 환자에서 부종 없이 체중이 늘고 Na가 낮아지며 소변이 농축되는 패턴을 SIADH로 연결합니다.","혈장 삼투압은 낮은데 요 삼투압은 높은 부조화가 핵심 단서이며, SIADH와 DI 감별에 유용합니다.","간호 우선순위는 의식수준 확인, 매일 체중, 정확한 I/O이며 Na < 120, 의식변화, 발작, 과교정은 즉시 보고해야 합니다."],"useCase":"저나트륨혈증 감별, SIADH/DI 비교, 소세포폐암 환자 전해질 이상, 실습 중 LOC·I/O 사정 포인트 확인","confidence":"본문 확인","system":"검사수치","intent":"임상추론","stage":"심화","evidence":"Drive에 새로 업로드된 SIADH_임상추론_박용민 PDF에서 ADH 과다분비, 희석성 저나트륨혈증, 부종 없는 체중 증가, 혈장/요 삼투압 부조화, 간호 사정과 보고 기준을 확인했습니다.","related":["iicp","pneumothorax-cxr","ast-alt-ratio"],"keywords":["SIADH","저나트륨혈증","hyponatremia","ADH","SCLC","소세포폐암","혈장 삼투압","요 삼투압","농축뇨","수분제한","LOC","I/O","삼투성 탈수초증후군","ODS"],"rank":13},{"id":"abga","title":"ABGA arterial blood gas analysis","displayTitle":"ABGA 동맥혈가스분석","type":"검사수치","format":"PDF","source":"박용민 임상추론 PDF","url":"./assets/pdfs/abga-arterial-blood-gas-analysis.pdf","tags":["ABGA","ABG","동맥혈가스분석","Arterial Blood Gas Analysis","pH","PaCO2","HCO3","PaO2","SaO2","Base Excess","BE","ROME","호흡성 산증","대사성 산증","보상","부분 보상","COPD","저산소혈증","CO2 narcosis","Allen test","검사수치","임상추론","핵심"],"summary":"pH, PaCO2, HCO3, PaO2로 산염기 불균형과 보상 여부를 추론하는 ABGA 임상추론 자료입니다.","points":["ROME 법칙으로 호흡성/대사성 문제를 구분하고 pH 정상범위 여부로 완전 보상과 부분 보상을 판단합니다.","COPD 사례에서 pH 7.32, PaCO2 58, HCO3 28, PaO2 56을 부분 보상된 호흡성 산증과 저산소혈증으로 연결합니다.","PaO2 60mmHg 미만, 의식수준 저하, 호흡양상 악화, 청색증은 ABGA 결과와 함께 즉시 보고해야 할 기준으로 정리합니다."],"useCase":"ABGA 해석 순서, 산염기 불균형 감별, COPD 호흡성 산증, 실습 중 ABGA 보고 기준 확인","confidence":"본문 확인","system":"검사수치","intent":"임상추론","stage":"핵심","evidence":"로컬로 제공된 ABGA_동맥혈가스분석 PDF에서 정상범위, ROME 법칙, Base Excess, COPD 사례, 부분 보상된 호흡성 산증, 저산소혈증, 간호 우선순위와 보고 기준을 확인했습니다.","related":["pneumothorax-cxr","gbs","siadh","ast-alt-ratio","acls","pneumonia-case-study","khsim-simulation"],"keywords":["ABGA","ABG","동맥혈가스분석","pH","PaCO2","HCO3","PaO2","Base Excess","BE","ROME","호흡성 산증","부분 보상","COPD","저산소혈증","CO2 narcosis","Allen test"],"rank":14},{"id":"acls","title":"ACLS clinical reasoning","displayTitle":"ACLS 임상추론","type":"심혈관","format":"PDF","source":"박용민 임상추론 PDF","url":"./assets/pdfs/acls-clinical-reasoning.pdf","image":"./assets/acls-clinical-reasoning.png","tags":["ACLS","Advanced Cardiovascular Life Support","심정지","CPR","BLS","고품질 CPR","리듬분석","제세동","비제세동","VF","pVT","Asystole","PEA","Epinephrine","Amiodarone","ROSC","응급간호","심혈관","임상추론","핵심"],"summary":"심정지 상황에서 고품질 CPR, 리듬 분석, 제세동·비제세동 알고리즘을 임상 흐름으로 연결하는 ACLS 임상추론 자료입니다.","points":["심정지 환자에서 의식·호흡·맥박 확인 후 고품질 CPR과 도움 요청으로 이어지는 초기 대응 흐름을 정리합니다.","VF/pVT처럼 제세동이 필요한 리듬과 Asystole/PEA처럼 비제세동 리듬을 구분해 ACLS 알고리즘으로 연결합니다.","Epinephrine, Amiodarone, ROSC 이후 사정처럼 신규간호사와 간호학생이 헷갈리기 쉬운 역할과 보고 포인트를 확인하기 좋습니다."],"useCase":"ACLS 알고리즘, 심정지 초기 대응, 제세동/비제세동 리듬 감별, 응급실·중환자실 실습 전 빠른 확인","confidence":"파일 확인","system":"심혈관","intent":"임상추론","stage":"핵심","evidence":"로컬로 제공된 ACLS_임상추론_박용민 PDF를 사이트 자료로 추가했습니다. 심정지 대응, CPR, 리듬 분석, ACLS 약물과 ROSC 이후 사정을 중심 키워드로 분류했습니다.","related":["acs-ecg","mi","abga","pneumonia-case-study","khsim-simulation"],"keywords":["ACLS","심정지","CPR","고품질 CPR","리듬분석","제세동","비제세동","VF","pVT","Asystole","PEA","Epinephrine","Amiodarone","ROSC"],"rank":15},{"id":"pneumonia-case-study","title":"Pneumonia case study clinical reasoning","displayTitle":"폐렴 케이스스터디 임상추론","type":"호흡기","format":"Google Doc","source":"박용민 임상추론 Google Doc","url":"https://docs.google.com/document/d/1Ok0jMz-Ik6OI0ePrd20sdxd1ITsM9JYt/edit","bannerTitle":"폐렴 케이스스터디, 이렇게 쓰면 망합니다","bannerDescription":"WBC 15,000을 적고 끝내면 검사 결과 정리예요. 수치 → 의미 → 병태생리 → 간호진단으로 연결해야 케이스가 살아납니다.","bannerAction":"망하지 않는 흐름 보기","bannerSourceLabel":"원본 문서","tags":["폐렴","Pneumonia","케이스스터디","임상추론","가스교환 장애","기도 청결","SpO2","ABGA","WBC","CRP","Procalcitonin","CURB-65","객담","항생제","반좌위","산소요법","패혈증","호흡기","핵심"],"summary":"폐렴 케이스를 단순 검사 결과 정리가 아니라 수치, 의미, 병태생리, 간호진단으로 연결하는 임상추론 자료입니다.","points":["폐렴의 핵심을 폐포 염증과 삼출액으로 인한 가스교환 장애로 잡고 SpO2, ABGA, WBC, CRP를 연결합니다.","실습생 케이스가 약해지는 지점인 수치 나열, 해석 누락, 병태생리 연결 부족을 피하는 흐름을 정리합니다.","산소요법, 반좌위, 객담 배출, 항생제 전 배양 채취, SpO2 저하와 의식변화 보고 기준까지 케이스에 바로 연결하기 좋습니다."],"useCase":"폐렴 케이스스터디, 호흡기 실습, SpO2/ABGA 해석, 가스교환 장애 간호진단, 보고 기준 정리","confidence":"본문 확인","system":"호흡기","intent":"임상추론","stage":"핵심","evidence":"Drive 문서 폐렴_케이스스터디_임상추론에서 WBC, CRP, SpO2, ABGA, CURB-65, 수치 해석, 병태생리 연결, 간호진단과 보고 기준을 확인했습니다.","related":["pneumothorax-cxr","abga","acls","khsim-simulation"],"keywords":["폐렴","Pneumonia","케이스스터디","WBC 15000","SpO2 89","CRP","ABGA","CURB-65","가스교환 장애","비효과적 기도청결","항생제","객담 배양","반좌위","산소요법","패혈증"],"rank":16},{"id":"khsim-simulation","title":"KHSIM nursing simulation","displayTitle":"KHSIM 간호 시뮬레이션","type":"시뮬레이션","format":"Web App","source":"PYM KHSIM GitHub Pages","url":"https://dragonmin070102-coder.github.io/KHSIM/","tags":["KHSIM","시뮬레이션","간호술기","환자 시나리오","실습","응급상황","PC 권장","태블릿 권장","임상추론"],"summary":"실제 환자 시나리오처럼 화면을 보며 간호 판단을 연습하는 KHSIM 시뮬레이션입니다. 모바일보다 태블릿이나 PC에서 체험하는 것을 권장합니다.","points":["KHSIM은 검색 자료를 읽고 끝나는 것이 아니라 환자 상태를 보며 판단을 연습하는 체험형 콘텐츠입니다.","모바일에서는 화면과 조작 영역이 좁아 제대로 체험하기 어렵기 때문에 태블릿 또는 PC 환경을 권장합니다.","ABGA, ACLS, 호흡기 케이스처럼 판단 흐름이 필요한 자료와 연결해 학습 루트로 확장하기 좋습니다."],"useCase":"실습 전 시뮬레이션 체험, 간호 판단 연습, 박용민 PDF 학습 후 적용 훈련","confidence":"서비스 연결","system":"시뮬레이션","intent":"실습훈련","stage":"체험","evidence":"PYM에서 연결 중인 KHSIM GitHub Pages 시뮬레이션 서비스입니다. 모바일보다 큰 화면에서 안정적으로 체험하도록 안내합니다.","related":["abga","acls","pneumonia-case-study","gbs"],"keywords":["KHSIM","간호 시뮬레이션","시뮬레이션","실습훈련","환자 시나리오","PC","태블릿"],"rank":17}]};

let resources = normalizeResourceData(await loadResourceData());

async function loadResourceData() {
  try {
    const response = await fetch(RESOURCE_DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Resource data load failed: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.warn("Using embedded resource data fallback", error);
    return FALLBACK_RESOURCE_DATA;
  }
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
const premiumScreen = document.querySelector("#premiumScreen");
const agentScreen = document.querySelector("#agentScreen");

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
let resourceDiscussionStats = new Map();
let noticeTouchStart = null;
let lastNoticeImpression = "";
let adminDashboardState = {
  period: "all",
  query: "",
  loading: false,
  data: null,
  error: ""
};
let adminOrderState = {
  query: "",
  status: "all"
};
let adminSearchTimer = null;
let analyticsFlushScheduled = false;
let currentPremiumPreviewCards = [];
let premiumSocialProof = { reviews: [], accessCount: 0 };
let adminUsername = "";
let adminSecret = "";
try {
  // Remove credentials cached by older deployments. Admin access is memory-only.
  window.sessionStorage?.removeItem("pym.adminSecret");
} catch {
  // Restricted browser storage does not affect memory-only authentication.
}
safeStorageRemove("pym.agentMessages");
let agentMessages = [];
let agentLoading = false;

const analyticsUserId = getOrCreateAnalyticsUserId();
const analyticsSessionId = createSessionId();
const supabaseConfig = getSupabaseConfig();
const agentApiUrl = String(window.PYM_AGENT_API_URL || "/api/pym-agent");
const orderApiUrl = "/api/orders";
const adminApiUrl = "/api/admin";

const adminSections = [
  {
    id: "overview",
    hash: "#admin",
    label: "개요",
    eyebrow: "Overview",
    title: "운영센터 개요",
    description: "핵심 지표와 오늘 봐야 할 운영 판단만 먼저 확인합니다."
  },
  {
    id: "content",
    hash: "#admin-content",
    label: "콘텐츠/검색",
    eyebrow: "Content Intelligence",
    title: "콘텐츠와 검색 수요",
    description: "검색어, 실패어, 자료 조회를 묶어서 다음 제작 우선순위를 봅니다."
  },
  {
    id: "premium",
    hash: "#admin-premium",
    label: "프리미엄/판매",
    eyebrow: "Premium Sales",
    title: "프리미엄 판매 운영",
    description: "매출, 구매 신청, 승인, 결제 퍼널, 자료 링크를 한 화면에서 관리합니다."
  },
  {
    id: "marketing",
    hash: "#admin-marketing",
    label: "마케팅/ROAS",
    eyebrow: "Marketing Analytics",
    title: "마케팅 성과 분석",
    description: "유입, 홈배너 CTR, 결제 이탈, ROAS를 한 화면에서 확인합니다."
  },
  {
    id: "community",
    hash: "#admin-community",
    label: "커뮤니티/댓글",
    eyebrow: "Community",
    title: "댓글과 반응",
    description: "자료와 동향에 남겨진 의견을 확인하고 커뮤니티 반응을 읽습니다."
  },
  {
    id: "settings",
    hash: "#admin-settings",
    label: "설정/데이터",
    eyebrow: "Settings",
    title: "데이터 연결과 운영 도구",
    description: "Supabase 연결, CSV, 테스트 이벤트, 수집 상태를 관리합니다."
  }
];

function isAdminHash(hash = window.location.hash) {
  return adminSections.some((section) => section.hash === hash);
}

function getActiveAdminSection() {
  return adminSections.find((section) => section.hash === window.location.hash) || adminSections[0];
}

async function adminRequest(action, payload = {}) {
  if (!adminUsername || !adminSecret) throw Object.assign(new Error("관리자 로그인이 필요합니다."), { status: 401 });
  const response = await fetch(adminApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-ID": adminUsername,
      "X-Admin-Secret": adminSecret
    },
    body: JSON.stringify({ action, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "관리자 요청에 실패했습니다.");
    error.status = response.status;
    if (response.status === 401) {
      adminUsername = "";
      adminSecret = "";
    }
    throw error;
  }
  return result;
}

function renderAdminLogin(message = "") {
  analyticsAdmin.hidden = false;
  document.body.classList.add("admin-mode");
  analyticsContent.innerHTML = `
    <section class="admin-login-card" aria-labelledby="admin-login-title">
      <span class="brand-mark">P</span>
      <p class="eyebrow">Secure admin</p>
      <h2 id="admin-login-title">운영센터 로그인</h2>
      <p>주문·구매자 정보와 분석 데이터는 관리자 인증 후에만 표시됩니다.</p>
      <form data-admin-login-form autocomplete="off">
        <label>
          <span>관리자 ID</span>
          <input type="text" name="adminId" autocomplete="off" autocapitalize="none" spellcheck="false" required />
        </label>
        <label>
          <span>관리자 비밀번호</span>
          <input type="password" name="adminSecret" autocomplete="new-password" required />
        </label>
        <button type="submit">운영센터 열기</button>
      </form>
      ${message ? `<p class="admin-login-error" role="alert">${escapeHtml(message)}</p>` : ""}
      <small>새로고침하거나 이 탭을 닫으면 관리자 인증이 자동으로 해제됩니다.</small>
    </section>
  `;
}


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
    id: "abga-five-step",
    category: "검사수치",
    source: "널스링크",
    date: "2026.06.15",
    hook: "ABGA, 숫자 5개를 어떤 순서로 봐야 할까?",
    title: "ABG 5단계 해석법, 이번 주 다시 정리하기",
    summary: "ABGA는 pH, PaO2, PaCO2, HCO3, BE를 단계적으로 보면 산증/알칼리증과 호흡성/대사성 원인을 빠르게 구분할 수 있어요.",
    image: "./assets/thumb-lab.png",
    tags: ["ABGA", "산염기", "보상기전"],
    sourceUrl: "https://nurse-link.co.kr/community/campus_talk/126520249",
    relatedIds: ["abga", "pneumothorax-cxr", "siadh"],
    keyPoints: [
      "pH로 산증/알칼리증을 먼저 판단하고 PaCO2, HCO3로 원인을 좁히는 순서가 중요해요.",
      "PaO2와 SpO2는 산소화 문제를 확인하는 지표라 호흡곤란, 청색증, 의식상태와 같이 봐야 해요.",
      "pH가 정상범위 안인지 밖인지에 따라 완전 보상과 부분 보상을 구분할 수 있어요."
    ],
    why: "응급실, 중환자실, 호흡기내과 실습에서 ABGA는 산소요법과 보고 우선순위를 판단하는 핵심 검사예요.",
    nursePrep: "ABGA 결과를 받으면 pH, PaCO2, HCO3, PaO2 순서로 읽고, PaO2 60mmHg 미만이나 의식저하는 즉시 보고 기준으로 정리해두세요.",
    studentPrep: "ROME 법칙과 보상기전을 한 장 표로 외우기보다 COPD 사례처럼 숫자를 따라가며 해석하는 연습을 해보세요.",
    comments: [
      { name: "익명 학생_2046", time: "1시간 전", text: "ABGA는 숫자는 아는데 순서가 늘 헷갈렸어요. 플로우차트 있으면 좋겠어요.", likes: 7 },
      { name: "익명 간호사_3478", time: "3시간 전", text: "실습에서는 PaO2랑 의식상태를 같이 보는 습관이 중요하더라고요.", likes: 9 },
      { name: "익명 학생_1184", time: "어제", text: "ROME 법칙으로 풀어보는 예시 문제가 같이 있으면 바로 저장할 것 같아요.", likes: 4 },
      { name: "익명 신규_6021", time: "어제", text: "COPD 환자 ABGA 예시랑 같이 보면 훨씬 기억에 남을 듯해요.", likes: 3 }
    ]
  },
  {
    id: "acls-guideline-2026",
    category: "심혈관",
    source: "AHA 업데이트",
    date: "2026.06.15",
    hook: "ACLS 업데이트, 간호학생은 뭘 먼저 봐야 할까?",
    title: "2025 AHA ACLS·소생술 가이드라인, 2026년 교육 현장 반영",
    summary: "2025년 발표된 AHA 소생술 가이드라인이 2026년 교육 자료와 강사 업데이트에 순차 반영되고 있어요.",
    image: "./assets/thumb-cardio.png",
    tags: ["ACLS", "CPR", "고품질 흉부압박"],
    sourceUrl: "https://cpraedcourse.com/blog/aha-acls-guidelines/",
    relatedIds: ["acs-ecg", "mi", "abga"],
    keyPoints: [
      "ACLS와 CPR은 신규간호사 교육과 임상실습에서 반복적으로 확인되는 핵심 역량이에요.",
      "고품질 흉부압박은 강하고 빠르게, 그리고 중단 시간을 최소화하는 원칙이 중심이에요.",
      "특수 상황 프로토콜이 보강되면서 기본 알고리즘을 먼저 탄탄하게 익히는 게 더 중요해졌어요."
    ],
    why: "응급상황에서 간호사는 리듬 확인, 흉부압박 교대, 약물 준비, 기록, 보고를 동시에 수행해야 해서 알고리즘 이해가 중요해요.",
    nursePrep: "병원 BLS/ACLS 교육 전 고품질 CPR 기준, 제세동 흐름, 에피네프린 투여 타이밍을 다시 확인해두세요.",
    studentPrep: "국가고시 관점에서는 흉부압박 깊이와 속도, AED 사용 흐름, 심정지 초기 대응 순서를 먼저 잡아두면 좋아요.",
    comments: [
      { name: "익명 신규간호사_2210", time: "2시간 전", text: "ACLS는 알고리즘을 외워도 실제 상황에서 역할이 헷갈려요.", likes: 8 },
      { name: "익명 학생_9012", time: "4시간 전", text: "CPR 기준이 국가고시에도 계속 나와서 따로 정리되면 좋겠어요.", likes: 5 },
      { name: "익명 학생_7815", time: "어제", text: "제세동 리듬이랑 비제세동 리듬을 한 번에 비교해주면 좋겠어요.", likes: 6 }
    ]
  },
  {
    id: "nihss-stroke-assessment",
    category: "신경계",
    source: "대한뇌졸중학회",
    date: "2026.06.15",
    hook: "뇌졸중 환자 사정, 왜 NIHSS로 말해야 할까?",
    title: "뇌졸중 환자 사정의 핵심, NIHSS 활용 재조명",
    summary: "국내 뇌졸중 진료지침은 초기 중증도 평가에 NIHSS 사용을 권고하며, 체계적 신경학적 사정의 중요성을 강조해요.",
    image: "./assets/thumb-neuro.png",
    tags: ["NIHSS", "뇌졸중", "신경계 사정"],
    sourceUrl: "https://www.stroke.or.kr/guidelines/view.php?sid=33",
    relatedIds: ["iicp", "gbs", "ms"],
    keyPoints: [
      "NIHSS는 의식, 시야, 안면마비, 운동, 감각, 언어 등을 수치화해 상태 변화를 공유하는 도구예요.",
      "응급실과 신경과 실습에서는 주관적 표현보다 객관적 점수로 보고하는 능력이 중요해요.",
      "뇌졸중 초기 사정은 치료 시간창과 연결되기 때문에 빠르고 체계적인 관찰이 필요해요."
    ],
    why: "신경계 환자는 작은 변화가 예후와 치료 방향에 영향을 줄 수 있어, 간호사의 반복 사정과 정확한 보고가 핵심이에요.",
    nursePrep: "편측마비, 언어장애, 의식변화, 동공변화처럼 즉시 보고해야 하는 신경계 변화 기준을 병동 프로토콜과 함께 확인하세요.",
    studentPrep: "실습 전에는 GCS와 NIHSS의 차이, FAST 증상, 뇌졸중 초기 간호 우선순위를 같이 묶어 공부해보세요.",
    comments: [
      { name: "익명 간호사_7730", time: "6시간 전", text: "응급실에서는 증상 시작 시간과 변화 양상 보고가 정말 중요합니다.", likes: 11 }
    ]
  },
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
      { name: "익명 간호사_1129", time: "5시간 전", text: "현장에서 사용할 수 있는 간단하고 직관적인 도구가 나왔으면 좋겠어요.", likes: 6 },
      { name: "익명 학생_2046", time: "어제", text: "간호정보학 수업이랑 연결해서 보면 재밌을 것 같아요. 관련 PDF도 있으면 좋겠어요.", likes: 5 }
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
      { name: "익명 간호사_2210", time: "2시간 전", text: "인력 부족할수록 보고 기준이 머릿속에 바로 있어야 버티는 것 같아요.", likes: 11 }
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
      { name: "익명 간호사_7730", time: "6시간 전", text: "항암 병동은 전해질이랑 감염 사정이 진짜 중요합니다.", likes: 10 },
      { name: "익명 학생_3309", time: "어제", text: "항암 부작용이랑 전해질 이상을 같이 묶어서 공부하면 좋을 것 같아요.", likes: 5 },
      { name: "익명 간호사_4802", time: "2일 전", text: "발열성 호중구감소증처럼 바로 보고해야 하는 포인트도 연결되면 좋겠네요.", likes: 12 }
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
trackEvent("home_premium_fixed_impression", { placement: "below_notice" });
flushRemoteAnalytics();
loadRemotePremiumOperatingSettings();

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

if (homeNoticeCarousel) {
  homeNoticeCarousel.addEventListener("touchstart", handleHomeNoticeTouchStart, { passive: true });
  homeNoticeCarousel.addEventListener("touchend", handleHomeNoticeTouchEnd, { passive: true });
}

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
  const premiumBanner = event.target.closest("[data-home-premium-banner]");
  if (!premiumBanner) return;

  event.preventDefault();
  trackEvent("home_premium_banner_click", {
    placement: premiumBanner.dataset.homePremiumBanner || "home_notice",
    productId: "neuro-series-6"
  });
  window.location.hash = "premium";
  setPremiumMode();
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
  const button = event.target.closest("[data-resource-like]");
  if (!button) return;

  toggleResourceLike(button.dataset.resourceLike);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-resource-comments]");
  if (!button) return;

  const resource = resources.find((item) => item.id === button.dataset.resourceComments);
  if (!resource) return;
  openResourceComments(resource);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-resource-comment-submit]");
  if (!button) return;

  submitResourceComment(button.dataset.resourceCommentSubmit);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-resource-comment-like]");
  if (!button) return;

  likeResourceComment(button.dataset.resourceCommentLike, button.dataset.resourceId);
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
});

document.addEventListener("submit", async (event) => {
  const loginForm = event.target.closest("[data-admin-login-form]");
  if (!loginForm) return;
  event.preventDefault();
  const button = loginForm.querySelector("button[type='submit']");
  const candidateId = String(new FormData(loginForm).get("adminId") || "").trim();
  const candidate = String(new FormData(loginForm).get("adminSecret") || "").trim();
  if (!candidateId || !candidate) return;
  adminUsername = candidateId;
  adminSecret = candidate;
  if (button) {
    button.disabled = true;
    button.textContent = "인증 중...";
  }
  try {
    const payload = await adminRequest("dashboard");
    applyAdminPayload(payload);
    trackEvent("admin_login_success");
    renderAnalyticsAdmin();
  } catch (error) {
    adminUsername = "";
    adminSecret = "";
    renderAdminLogin(error.message || "비밀번호를 확인해 주세요.");
  }
});

document.addEventListener("click", (event) => {
  const logout = event.target.closest("[data-admin-logout]");
  if (!logout) return;
  adminUsername = "";
  adminSecret = "";
  adminDashboardState.data = null;
  renderAdminLogin();
});

document.addEventListener("click", (event) => {
  const exportButton = event.target.closest("[data-admin-export]");
  if (!exportButton) return;

  exportAnalytics();
});

document.addEventListener("click", (event) => {
  const refreshButton = event.target.closest("[data-admin-refresh]");
  if (!refreshButton) return;

  loadAdminDashboardData();
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

document.addEventListener("input", (event) => {
  const orderSearch = event.target.closest("[data-admin-order-search]");
  if (!orderSearch) return;

  adminOrderState.query = orderSearch.value;
  renderAnalyticsAdmin();
});

document.addEventListener("change", (event) => {
  const orderStatus = event.target.closest("[data-admin-order-status]");
  if (!orderStatus) return;

  adminOrderState.status = orderStatus.value || "all";
  renderAnalyticsAdmin();
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
  safeStorageRemove("pym.analyticsEvents");
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

  safeStorageSet("pym.supabaseUrl", url);
  safeStorageSet("pym.supabaseAnonKey", key);
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


document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-premium-operating-form]");
  if (!form) return;

  event.preventDefault();
  savePremiumOperatingSettings(form);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-marketing-spend-form]");
  if (!form) return;

  event.preventDefault();
  saveMarketingAdSpend(form);
});

document.addEventListener("click", (event) => {
  const premiumNav = event.target.closest("[data-premium-nav]");
  if (!premiumNav) return;

  event.preventDefault();
  window.location.hash = "premium";
  setPremiumMode();
});

document.addEventListener("click", (event) => {
  const productCard = event.target.closest("[data-premium-product]");
  if (!productCard) return;

  trackEvent("premium_product_select", { productId: productCard.dataset.premiumProduct });
  document.querySelector("#premiumProductDetail")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

window.addEventListener("hashchange", syncAdminRoute);
window.addEventListener("error", (event) => {
  if (isAdminHash(window.location.hash)) renderAdminFallback(event.error || new Error(event.message));
});
window.addEventListener("unhandledrejection", (event) => {
  if (isAdminHash(window.location.hash)) renderAdminFallback(event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Promise rejection")));
});
window.addEventListener("pagehide", () => flushRemoteAnalytics({ silent: true, limit: 20 }));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flushRemoteAnalytics({ silent: true, limit: 20 });
  }
});

document.addEventListener("click", (event) => {
  const checkout = event.target.closest("[data-premium-checkout]");
  if (!checkout) return;

  trackEvent("premium_checkout_click", {
    productId: checkout.dataset.premiumCheckout || "neuro-series-6",
    placement: checkout.dataset.checkoutPlacement || "unknown"
  });
  openBankTransferOrderModal(checkout.dataset.premiumCheckout);
});

document.addEventListener("click", (event) => {
  const reset = event.target.closest("[data-premium-test-reset]");
  if (!reset) return;

  resetPremiumPurchaseTest(reset.dataset.premiumTestReset || "neuro-series-6");
  if (isAdminHash(window.location.hash)) renderAnalyticsAdmin();
});

document.addEventListener("click", (event) => {
  const complete = event.target.closest("[data-premium-test-complete]");
  if (!complete) return;

  completePremiumPurchase(complete.dataset.premiumTestComplete || "neuro-series-6");
  renderAnalyticsAdmin();
});

document.addEventListener("click", (event) => {
  const open = event.target.closest("[data-premium-test-open]");
  if (!open) return;

  window.location.hash = "premium";
  setPremiumMode();
  window.setTimeout(() => document.querySelector("#premiumAccess")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-bank-order-form]");
  if (!form) return;

  event.preventDefault();
  submitBankTransferOrder(form);
});

document.addEventListener("input", (event) => {
  const form = event.target.closest("[data-bank-order-form]");
  if (!form || form.dataset.funnelStarted === "true") return;

  form.dataset.funnelStarted = "true";
  const productId = String(new FormData(form).get("productId") || "neuro-series-6");
  trackEvent("bank_transfer_form_start", { productId });
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-bank-order-lookup-form]");
  if (!form) return;

  event.preventDefault();
  verifyBankTransferOrder(form);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-bank-order-identity-lookup-form]");
  if (!form) return;

  event.preventDefault();
  lookupBankTransferOrderByIdentity(form);
});

document.addEventListener("click", (event) => {
  const approve = event.target.closest("[data-bank-order-approve]");
  if (!approve) return;

  approveBankTransferOrder(approve.dataset.bankOrderApprove);
});

document.addEventListener("click", (event) => {
  const copy = event.target.closest("[data-bank-order-copy]");
  if (!copy) return;

  copyBankTransferOrder(copy.dataset.bankOrderCopy);
});

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-bank-order-delete]");
  if (!remove) return;

  deleteBankTransferOrder(remove.dataset.bankOrderDelete);
});

document.addEventListener("click", (event) => {
  const secureFile = event.target.closest("[data-premium-secure-file]");
  if (!secureFile) return;

  const file = premiumDownloadFiles.find((item) => String(item.number) === String(secureFile.dataset.premiumSecureFile));
  trackEvent("premium_secure_file_click", {
    productId: "neuro-series-6",
    fileNumber: secureFile.dataset.premiumSecureFile,
    fileTitle: file?.title || "",
    action: secureFile.dataset.premiumSecureAction || "open"
  });
  premiumSocialProof.accessCount += 1;
  renderPremiumScreen();
renderAgentScreen();
});

document.addEventListener("click", (event) => {
  const preview = event.target.closest("[data-premium-preview]");
  if (!preview) return;

  trackEvent("premium_preview_click", { productId: preview.dataset.premiumPreview });
  openPremiumPreviewModal();
});

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-premium-preview-card]");
  if (!card) return;

  openPremiumPreviewGallery(Number(card.dataset.premiumPreviewCard));
});

document.addEventListener("click", (event) => {
  const gallery = event.target.closest("[data-premium-preview-gallery]");
  if (!gallery) return;

  openPremiumPreviewGallery(Number(gallery.dataset.premiumPreviewGallery || 0));
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-agent-form]");
  if (!form) return;

  event.preventDefault();
  submitAgentQuestion(form);
});

document.addEventListener("click", (event) => {
  const sample = event.target.closest("[data-agent-sample]");
  if (!sample) return;

  const input = agentScreen?.querySelector("[data-agent-form] textarea");
  if (input) {
    input.value = sample.dataset.agentSample || "";
    input.focus();
  }
});

document.addEventListener("click", (event) => {
  const resourceButton = event.target.closest("[data-agent-resource]");
  if (!resourceButton) return;

  const resource = resources.find((item) => item.id === resourceButton.dataset.agentResource);
  if (!resource) return;
  activeResource = resource;
  rememberRecent(resource.id);
  setSearchMode();
  activeTab = "search";
  queryInput.value = resource.displayTitle;
  renderBottomTabs();
  renderResults();
  openPreviewModal(resource);
});

document.addEventListener("click", (event) => {
  const back = event.target.closest("[data-agent-back]");
  if (!back) return;

  setHomeMode();
  renderBottomTabs();
  window.location.hash = "";
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-premium-review-form]");
  if (!form) return;

  event.preventDefault();
  submitPremiumReview(form);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closePreviewModal);
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close-modal]");
  if (!close) return;

  closePreviewModal();
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
    { system: "전체", title: "전체 자료", description: "박용민 자료와 시뮬레이션을 한 번에 봐요.", accent: "blue" },
    { system: "신경계", title: "신경계 임상추론", description: "GBS, MG, ALS, MS, PD를 비교해서 봐요.", accent: "purple" },
    { system: "검사수치", title: "검사수치 해석", description: "ABGA, AST/ALT, SIADH를 케이스에 연결해요.", accent: "green" },
    { system: "심혈관", title: "심혈관·ECG", description: "ACS, ECG, MI, ACLS 흐름을 정리했어요.", accent: "red" },
    { system: "호흡기", title: "호흡기 케이스", description: "폐렴, 기흉, CXR, 산소화 판단을 확인해요.", accent: "cyan" },
    { system: "시뮬레이션", title: "KHSIM", description: "읽은 자료를 환자 시나리오로 적용해요.", accent: "orange" },
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
    "시뮬레이션": "guide",
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
    { id: "agent", label: "Agent", icon: agentIcon(), target: () => {
      setAgentMode();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } },
    { id: "premium", label: "유료", icon: paidIcon(), target: () => {
      setPremiumMode();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } }
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
  document.body.classList.remove("premium-mode");
  document.body.classList.remove("agent-mode");
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
  document.body.classList.remove("premium-mode");
  document.body.classList.remove("agent-mode");
  screenQueryInput.value = queryInput.value;
  renderSortTabs();
}

function setTrendMode() {
  document.body.classList.remove("search-mode");
  document.body.classList.add("trend-mode");
  document.body.classList.remove("premium-mode");
  document.body.classList.remove("agent-mode");
  activeTab = "trend";
  renderTrendScreen();
  renderBottomTabs();
  trackEvent("trend_view");
}

function setPremiumMode() {
  document.body.classList.remove("search-mode");
  document.body.classList.remove("trend-mode");
  document.body.classList.add("premium-mode");
  document.body.classList.remove("agent-mode");
  activeTab = "premium";
  renderBottomTabs();
  trackEvent("premium_view", { productId: "neuro-series-6" });
}

function setAgentMode() {
  document.body.classList.remove("search-mode");
  document.body.classList.remove("trend-mode");
  document.body.classList.remove("premium-mode");
  document.body.classList.add("agent-mode");
  activeTab = "agent";
  renderAgentScreen();
  renderBottomTabs();
  trackEvent("agent_view");
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
  const primaryAction = notice.target === "premium"
    ? `<button type="button" data-home-premium-banner="primary">${escapeHtml(notice.action)}</button>`
    : `<button type="button" data-query="${escapeHtml(notice.query)}">${escapeHtml(notice.action)}</button>`;
  const sourceAction = notice.target === "premium"
    ? `<a href="#premium" data-home-premium-banner="secondary">${escapeHtml(notice.sourceLabel)}</a>`
    : `<a href="${escapeHtml(notice.sourceUrl)}" target="_blank" rel="noreferrer" data-notice-source="${escapeHtml(notice.label)}" ${notice.articleId ? `data-article-open="${escapeHtml(notice.articleId)}"` : ""}>${escapeHtml(notice.sourceLabel)}</a>`;
  homeNoticeCarousel.innerHTML = `
    <div class="clinical-copy">
      <p>
        <span>${escapeHtml(notice.label)}</span>
        <strong>${escapeHtml(notice.badge)}</strong>
      </p>
      <h2>${escapeHtml(notice.title)}</h2>
      <span class="notice-description">${escapeHtml(notice.description)}</span>
      <div class="notice-actions">
        ${primaryAction}
        ${sourceAction}
      </div>
    </div>
    <img src="${escapeHtml(notice.image)}" alt="" loading="eager" />
    <div class="notice-dots" aria-label="공지 선택">
      ${notices.map((item, index) => `
        <button type="button" class="${index === activeNoticeIndex ? "active" : ""}" data-notice-dot="${index}" aria-label="${escapeHtml(item.label)} 보기"></button>
      `).join("")}
    </div>
  `;

  const impressionKey = `${activeNoticeIndex}:${notice.id || notice.label}`;
  if (lastNoticeImpression !== impressionKey) {
    lastNoticeImpression = impressionKey;
    trackEvent("home_notice_impression", {
      id: notice.id || "",
      label: notice.label,
      index: activeNoticeIndex,
      tone: notice.tone
    });
  }
}

function getHomeNotices() {
  const recommended = resources.find((resource) => resource.id === "gbs") || resources[0];
  const trendArticle = trendArticles[0];
  const newResourceNoticeMap = {
    anaphylaxis: {
      title: "두드러기 없는데도 아나필락시스일 수 있습니다",
      description: "호흡곤란과 저혈압이 같이 오면 피부증상보다 장기 침범을 먼저 봐야 해요. 에피네프린 우선순위까지 정리했습니다.",
      action: "아나필락시스 보기"
    },
    "acs-clinical-reasoning": {
      title: "가슴이 안 아픈데 ACS라면?",
      description: "당뇨·노인·여성 환자는 피로감, 소화불량, 식은땀만으로도 심근경색이 숨어 있을 수 있어요.",
      action: "ACS 흐름 보기"
    },
    sepsis: {
      title: "열이 없다고 패혈증이 아닌 건 아닙니다",
      description: "체온보다 의식변화, 저혈압, 젖산, qSOFA를 먼저 연결해 보는 패혈증 임상추론 자료예요.",
      action: "패혈증 보기"
    },
    dka: {
      title: "복통 환자, DKA를 놓치면 흐름이 무너집니다",
      description: "혈당·케톤·산증을 같이 봐야 합니다. 수액 먼저, 인슐린 전 K 확인까지 한 번에 연결해둔 새 임상추론 자료예요.",
      action: "DKA 흐름 보기"
    },
    "copd-acute-exacerbation": {
      title: "산소를 줬는데, 왜 더 처질까요?",
      description: "SpO2가 92%로 올라도 의식이 흐려지고 호흡수가 줄면 CO2 마취를 의심해야 합니다. COPD 산소요법의 핵심을 확인하세요.",
      action: "COPD 흐름 보기"
    }
  };
  const newResourceNotices = ["copd-acute-exacerbation", "anaphylaxis", "acs-clinical-reasoning", "sepsis", "dka"]
    .map((id) => {
      const resource = resources.find((item) => item.id === id);
      if (!resource) return null;
      const copy = newResourceNoticeMap[id];
      return {
        id: `new-${resource.id}`,
        label: "새 자료 업데이트",
        badge: "NEW",
        title: resource.bannerTitle || copy.title,
        description: resource.bannerDescription || copy.description,
        query: resource.keywords?.[0] || resource.displayTitle,
        action: resource.bannerAction || copy.action,
        sourceLabel: resource.bannerSourceLabel || "원본 자료",
        sourceUrl: resource.url,
        image: visualMeta(resource).image || "./assets/thumb-lab.png",
        tone: "update"
      };
    })
    .filter(Boolean);

  return [
    ...newResourceNotices,
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
      title: trendArticle.hook || trendArticle.title,
      description: trendArticle.summary,
      query: trendArticle.tags?.[0] || trendArticle.title,
      action: "관련 자료 보기",
      sourceLabel: "요약 보기",
      sourceUrl: trendArticle.sourceUrl,
      articleId: trendArticle.id,
      image: trendArticle.image || "./assets/thumb-lab.png",
      tone: "trend"
    }
  ];
}

function handleHomeNoticeTouchStart(event) {
  const touch = event.changedTouches?.[0];
  if (!touch) return;

  noticeTouchStart = {
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now()
  };
}

function handleHomeNoticeTouchEnd(event) {
  if (!noticeTouchStart) return;

  const touch = event.changedTouches?.[0];
  if (!touch) return;

  const dx = touch.clientX - noticeTouchStart.x;
  const dy = touch.clientY - noticeTouchStart.y;
  const elapsed = Date.now() - noticeTouchStart.time;
  noticeTouchStart = null;

  if (elapsed > 650 || Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

  moveHomeNotice(dx < 0 ? 1 : -1);
}

function moveHomeNotice(direction) {
  const notices = getHomeNotices();
  activeNoticeIndex = (activeNoticeIndex + direction + notices.length) % notices.length;
  trackEvent("home_notice_swipe", { index: activeNoticeIndex, direction });
  renderHomeNoticeCarousel();
  startNoticeRotation();
}

const premiumNeuroModules = [
  {
    number: "01",
    title: "신경학적 사정",
    subtitle: "GCS · 동공 · LOC · 운동/감각",
    pages: 9,
    hook: "활력징후가 멀쩡해도, 의식 변화가 먼저 말해줍니다.",
    preview: "GCS는 지금 점수보다 아까와 비교한 변화가 핵심입니다. 의식 저하와 한쪽 동공 산대는 두개내압 상승을 먼저 의심하게 만드는 신호입니다.",
    paid: ["GCS 계산 흐름", "동공반사 해석", "의식수준 보고 문장", "신경계 사정표"]
  },
  {
    number: "02",
    title: "두개내압 상승",
    subtitle: "Monro-Kellie · Cushing triad · CPP",
    pages: 9,
    hook: "혈압은 오르는데 맥박은 느려지는 순간, 뇌의 마지막 SOS입니다.",
    preview: "IICP는 닫힌 상자 안에서 자리가 없어지는 문제입니다. 의식 저하, 동공 변화, Cushing triad를 하나의 흐름으로 읽게 만듭니다.",
    paid: ["ICP/CPP 해석", "Cushing triad 추론", "금기 간호", "즉시 보고 기준"]
  },
  {
    number: "03",
    title: "허혈성 뇌졸중",
    subtitle: "FAST · time window · tPA/EVT",
    pages: 10,
    hook: "마지막으로 멀쩡했던 시간이 치료를 정합니다.",
    preview: "허혈성 뇌졸중은 페넘브라를 살리는 시간 싸움입니다. 혈압을 무조건 낮추지 않는 이유와 CT를 먼저 보는 이유를 연결합니다.",
    paid: ["FAST 사정", "last known well 질문", "permissive HTN", "tPA/EVT 전후 간호"]
  },
  {
    number: "04",
    title: "출혈성 뇌졸중",
    subtitle: "혈압관리 · SAH · nimodipine",
    pages: 10,
    hook: "허혈성과 정반대입니다. 이번엔 더 새지 않게 막아야 합니다.",
    preview: "출혈성 뇌졸중은 혈종 확대와 두개내압 상승을 막는 흐름입니다. SAH, 재출혈, 혈관연축 감시까지 이어집니다.",
    paid: ["허혈성 vs 출혈성 비교", "혈압관리 흐름", "SAH 간호", "재출혈/혈관연축 감시"]
  },
  {
    number: "05",
    title: "경련·뇌전증",
    subtitle: "안전간호 · 5분 · status epilepticus",
    pages: 10,
    hook: "발작 중 가장 위험한 건 도와주려는 손일 수 있습니다.",
    preview: "경련 간호는 억제하는 것이 아니라 다치지 않게 지키고, 시간을 재고, 5분을 기준으로 약물 단계를 판단하는 것입니다.",
    paid: ["발작 중 금기", "5분 기준", "benzodiazepine 흐름", "post-ictal 관찰"]
  },
  {
    number: "06",
    title: "외상성 뇌손상",
    subtitle: "1차/2차 손상 · ICP/CPP · BTF 기준",
    pages: 10,
    hook: "충격은 끝났지만, 손상은 지금부터 막을 수 있습니다.",
    preview: "TBI는 1차 손상과 2차 손상으로 나누어 봅니다. 저혈압, 저산소, ICP 상승을 막는 모든 간호가 하나의 방향으로 모입니다.",
    paid: ["1차/2차 손상 비교", "SBP/SpO2 목표", "CSF leak 주의", "BTF 기준 기반 보고"]
  }
];

const premiumDownloadFiles = [
  { number: "01", title: "신경학적 사정", pages: 9, fileName: "neuro-01-neurological-assessment.docx" },
  { number: "02", title: "두개내압 상승", pages: 9, fileName: "neuro-02-iicp.docx" },
  { number: "03", title: "허혈성 뇌졸중", pages: 10, fileName: "neuro-03-ischemic-stroke.docx" },
  { number: "04", title: "출혈성 뇌졸중", pages: 10, fileName: "neuro-04-hemorrhagic-stroke.docx" },
  { number: "05", title: "경련·뇌전증", pages: 10, fileName: "neuro-05-seizure-epilepsy.docx" },
  { number: "06", title: "외상성 뇌손상", pages: 10, fileName: "neuro-06-tbi.docx" }
];

const premiumProducts = [
  {
    id: "neuro-series-6",
    icon: "N",
    title: "신경계 임상추론",
    label: "6편 시리즈",
    price: PREMIUM_REGULAR_PRICE,
    status: "판매중",
    description: "GCS부터 TBI까지"
  },
  {
    id: "respiratory-series",
    icon: "R",
    title: "호흡기 임상추론",
    label: "준비 중",
    price: "Coming soon",
    status: "예정",
    description: "폐렴·ABGA·산소요법"
  },
  {
    id: "emergency-series",
    icon: "E",
    title: "응급 케이스",
    label: "준비 중",
    price: "Coming soon",
    status: "예정",
    description: "ACS·패혈증·DKA"
  }
];


function renderAgentScreen() {
  if (!agentScreen) return;

  const samples = [
    { icon: "♙", text: "ABGA 보상 어떻게 봐?" },
    { icon: "♧", text: "GBS에서 SpO2 정상인데 왜 위험해?" },
    { icon: "▣", text: "폐렴 케이스 우선순위는?" }
  ];
  agentScreen.innerHTML = `
    <div class="agent-app-top">
      <button type="button" data-agent-back aria-label="홈으로 돌아가기">‹</button>
      <span class="agent-avatar" aria-hidden="true">
        <i></i>
      </span>
      <div>
        <strong>PYM Agent</strong>
        <span>박용민 자료 기반 RAG 챗봇</span>
      </div>
    </div>
    <section class="agent-hero-card">
      <p class="eyebrow">Ask PYM</p>
      <h2>질환명, 검사수치,<br />실습 질문을 물어보세요.</h2>
      <p>먼저 PYM 자료를 찾고, 그 자료 요약과<br />근거를 바탕으로 답합니다.</p>
      <div class="agent-sample-row">
        ${samples.map((sample) => `<button type="button" data-agent-sample="${escapeHtml(sample.text)}"><span>${escapeHtml(sample.icon)}</span>${escapeHtml(sample.text)}</button>`).join("")}
      </div>
      <div class="agent-hero-progress" aria-hidden="true"><span></span></div>
    </section>
    <section class="agent-chat-card ${agentLoading ? "loading" : ""}">
      <div class="agent-chat-status">
        <div>
          <strong>${agentLoading ? "답변 생성 중" : "자료 기반 답변"}</strong>
          <span>${agentLoading ? "관련 PYM 자료를 읽고 정리하고 있어요." : "질문하면 먼저 자료를 찾고 답변합니다."}</span>
        </div>
        ${agentLoading ? `<i aria-hidden="true"></i>` : ""}
      </div>
      <div class="agent-message-list" id="agentMessageList">
        ${renderAgentMessages()}
      </div>
      <form class="agent-input-form" data-agent-form>
        <button class="agent-attach" type="button" aria-label="첨부 준비 중" disabled>⌘</button>
        <div class="agent-input-box">
          <textarea name="question" rows="1" placeholder="질문을 입력하세요..." ${agentLoading ? "disabled" : ""}></textarea>
          <span>Enter로 전송 / Shift + Enter로 줄바꿈</span>
        </div>
        <button class="agent-send" type="submit" aria-label="질문 전송" ${agentLoading ? "disabled" : ""}>➤</button>
      </form>
    </section>
  `;

  consumePendingAgentQuestion();
  const list = agentScreen.querySelector("#agentMessageList");
  if (list) list.scrollTop = list.scrollHeight;
}

function renderAgentMessages() {
  if (!agentMessages.length) {
    return `
      <article class="agent-message assistant">
        <span>PYM Agent</span>
        <p>질문을 입력하면 관련 PYM 자료를 먼저 찾고, 병태생리 → 검사수치 → 임상판단 순서로 정리해드릴게요.</p>
      </article>
    `;
  }

  return agentMessages.map((message) => `
    <article class="agent-message ${escapeHtml(message.role)} ${message.loading ? "loading" : ""}">
      <span>${message.role === "user" ? "나" : "PYM Agent"}</span>
      ${message.loading ? `
        <div class="agent-typing" aria-label="답변 생성 중">
          <i></i><i></i><i></i>
        </div>
      ` : `<p>${escapeHtml(message.content).replace(/\n/g, "<br />")}</p>`}
      ${message.references?.length ? `
        <div class="agent-references">
          <strong>참고한 PYM 자료</strong>
          ${message.references.map((item) => `<button type="button" data-agent-resource="${escapeHtml(item.id || "")}"><i aria-hidden="true">▤</i><span>${escapeHtml(item.title || "PYM 자료")}</span><em>›</em></button>`).join("")}
        </div>
      ` : ""}
    </article>
  `).join("");
}

function getAgentLocalMatches(question) {
  return scoreResources(question)
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .map(({ resource }) => ({
      id: resource.id,
      title: resource.displayTitle,
      summary: resource.summary,
      source: resource.source,
      url: resource.url
    }));
}

function saveAgentMessages() {
  safeStorageRemove("pym.agentMessages");
}

async function submitAgentQuestion(form) {
  const input = form.elements.question;
  const question = String(input.value || "").trim();
  if (!question || agentLoading) return;

  const localReferences = getAgentLocalMatches(question);
  agentMessages = [
    ...agentMessages,
    { role: "user", content: question },
    { role: "assistant", content: "관련 PYM 자료를 먼저 찾는 중이에요.", references: localReferences, loading: true }
  ].slice(-12);
  agentLoading = true;
  saveAgentMessages();
  renderAgentScreen();
  trackEvent("agent_question_submit", { questionLength: question.length, localReferenceCount: localReferences.length });

  try {
    const response = await fetch(agentApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "PYM Agent API 연결에 실패했어요.");

    agentMessages[agentMessages.length - 1] = {
      role: "assistant",
      content: payload.answer || "현재 자료 기준으로는 답변이 부족해요.",
      references: payload.references?.length ? payload.references : localReferences,
      loading: false
    };
    trackEvent("agent_answer_success", {
      referenceCount: agentMessages[agentMessages.length - 1].references.length,
      model: payload.model || "",
      rerankUsed: Boolean(payload.retrieval?.rerankUsed),
      rerankModel: payload.retrieval?.rerankModel || "",
      candidateCount: Number(payload.retrieval?.candidateCount || 0)
    });
  } catch (error) {
    agentMessages[agentMessages.length - 1] = {
      role: "assistant",
      content: `${error.message || "PYM Agent API 연결에 실패했어요."}\n\n지금 화면에서는 관련 자료까지만 먼저 보여줄게요. 배포 환경에 NVIDIA_API_KEY를 설정하고 PYM Agent API를 연결하면 답변 생성이 열립니다.`,
      references: localReferences,
      loading: false
    };
    trackEvent("agent_answer_failed", { message: error.message || "unknown" });
  } finally {
    agentLoading = false;
    saveAgentMessages();
    renderAgentScreen();
  }
}

function renderPremiumScreen() {
  if (!premiumScreen) return;

  const featured = premiumNeuroModules[1];
  const productId = "neuro-series-6";
  const displayPrice = getBankTransferAccount().amount || PREMIUM_REGULAR_PRICE;
  const hasDiscount = displayPrice !== PREMIUM_REGULAR_PRICE;
  const purchased = isPremiumPurchased(productId);
  const activeOrder = getLatestBankTransferOrder(productId);
  const previewCards = [
    { module: premiumNeuroModules[0], section: "p.01 왜 중요한가", image: "./assets/previews/neuro-assessment-p01.webp", lines: ["시험·실습·임상 연결", "박용민 요점"] },
    { module: premiumNeuroModules[0], section: "p.02 임상 상황", image: "./assets/previews/neuro-assessment-p02.webp", lines: ["GCS 변화", "동공 변화", "생각해보기"] },
    { module: premiumNeuroModules[0], section: "p.03 병태생리", image: "./assets/previews/neuro-assessment-p03.webp", lines: ["Monro-Kellie", "악화 순서"] },
    { module: premiumNeuroModules[0], section: "p.04 핵심 검사 및 수치", image: "./assets/previews/neuro-assessment-p04.webp", lines: ["GCS", "GCS-P", "ICP/CPP"] },
    { module: premiumNeuroModules[0], section: "p.05 임상추론 흐름", image: "./assets/previews/neuro-assessment-p05.webp", lines: ["해석", "우선순위", "보고"] },
    { module: premiumNeuroModules[0], section: "p.06 간호중재와 근거", image: "./assets/previews/neuro-assessment-p06.webp", lines: ["왜 이런 간호를 할까", "목표 및 수행"] },
    { module: premiumNeuroModules[0], section: "p.08 30초 복습", image: "./assets/previews/neuro-assessment-p08.webp", lines: ["체크리스트", "NCLEX Questions"] }
  ];
  currentPremiumPreviewCards = previewCards;

  premiumScreen.innerHTML = `
    <div class="premium-app-top">
      <div>
        <span class="brand-mark">P</span>
        <strong>PYM Search</strong>
      </div>
      <button type="button" aria-label="알림">☰</button>
    </div>

    <section class="premium-section premium-product-library" aria-label="유료 자료 목록">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Premium store</p>
          <h2>유료 자료</h2>
        </div>
        <span>${premiumProducts.filter((product) => product.status === "판매중").length}개 판매중</span>
      </div>
      <div class="premium-product-icon-grid">
        ${premiumProducts.map((product) => `
          <button type="button" class="premium-product-icon-card ${product.id === productId ? "active" : ""} ${product.status !== "판매중" ? "disabled" : ""}" ${product.status === "판매중" ? `data-premium-product="${escapeHtml(product.id)}"` : "disabled"}>
            <span>${escapeHtml(product.icon)}</span>
            <strong>${escapeHtml(product.title)}</strong>
            <em>${escapeHtml(product.label)}</em>
            <small>${escapeHtml(product.description)}</small>
            <b>${escapeHtml(product.status === "판매중" && product.id === productId ? displayPrice : (product.status === "판매중" ? product.price : product.status))}</b>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="premium-product-hero" id="premiumProductDetail" aria-labelledby="premium-title">
      <p class="premium-breadcrumb">홈 프리미엄 › 신경계 시리즈 › ${escapeHtml(featured.title)}</p>
      <div class="premium-cover-card">
        <div class="premium-cover-copy">
          <span>BEST</span>
          <em>신경계 시리즈 01</em>
          <h1 id="premium-title">신경계<br />임상추론</h1>
          <p>병태생리 이해<br />핵심 요약 정리<br />임상추론 활용<br />간호중재 & 근거</p>
          <strong>BY PARK YONG MIN</strong>
        </div>
        <img class="premium-brain-image" src="./assets/iicp-brain-cover.webp" alt="신경계 임상추론 학습을 상징하는 뇌 이미지" loading="eager" fetchpriority="high" />
      </div>
      <h2>신경계 임상추론 시리즈 6편</h2>
      <p class="premium-product-subtitle">실습에서 자주 막히는 GCS·ICP·뇌졸중 판단을 30분 안에 하나의 흐름으로 정리하세요.</p>
      <div class="premium-product-meta">
        <span class="sale-live">판매중</span>
        <span>누적 구매 ${formatCount(getPremiumBuyerCount())}명</span>
        <span>조회 ${formatCount(getPremiumDisplayViews())}회</span>
      </div>
      <div class="premium-spec-grid">
        <article><strong>PDF 자료</strong><span>6편 · 96섹션</span></article>
        <article><strong>최종 업데이트</strong><span>2026.06</span></article>
        <article><strong>난이도</strong><span>중급</span></article>
        <article><strong>학습 시간</strong><span>30분</span></article>
      </div>
    </section>

    <section class="premium-section">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Table of contents</p>
          <h2>목차 총 6편</h2>
        </div>
      </div>
      <div class="premium-module-list commerce">
        ${premiumNeuroModules.map((module) => `
          <article>
            <span>${escapeHtml(module.number)}</span>
            <div>
              <strong>${escapeHtml(module.title)}</strong>
              <p>${escapeHtml(module.subtitle)}</p>
            </div>
            <em>${Number(module.pages || 0)}페이지</em>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="premium-section premium-preview-strip">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Preview</p>
          <h2>실제 자료 미리보기</h2>
        </div>
        <button type="button" data-premium-preview-gallery="0">전체 보기</button>
      </div>
      <div class="premium-doc-strip">
        ${previewCards.map((card, index) => premiumDocPreviewCard(card, index)).join("")}
        <article class="premium-doc-card locked">
          <div class="doc-page-mini"><strong>전체 내용은<br />구매 후 확인 가능</strong></div>
          <span>🔒</span>
        </article>
      </div>
      <p class="premium-preview-caption">01_신경학적 사정의 일부 내용입니다</p>
      ${purchased ? "" : `<button class="premium-preview-cta" type="button" data-premium-checkout="neuro-series-6" data-checkout-placement="after_preview">나머지 6편 전체 열기 · ${escapeHtml(displayPrice)}</button>`}
    </section>

    <section class="premium-section premium-special-grid">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Why premium</p>
          <h2>이 자료가 특별한 이유</h2>
        </div>
      </div>
      <div class="premium-reason-grid">
        <article><strong>임상 추론 중심</strong><span>실제 환자 상황 기반 사고 흐름 제시</span></article>
        <article><strong>핵심 수치 정리</strong><span>시험 및 임상에서 자주 쓰이는 수치 정리</span></article>
        <article><strong>간호중재 & 근거</strong><span>왜 이 간호를 하는지 근거까지 연결</span></article>
        <article><strong>실전 적용 가능</strong><span>실습과 국시 흐름에 맞춰 적용</span></article>
        <article><strong>도식·표·그림</strong><span>이해를 돕는 도식과 표 기반 구성</span></article>
        <article><strong>최신 기준 반영</strong><span>AHA/ASA, BTF 등 기준 반영</span></article>
      </div>
    </section>

    <section class="premium-purchase-card">
      <p>프리미엄 자료</p>
      <div class="premium-price-row">
        ${hasDiscount ? `<span>${PREMIUM_REGULAR_PRICE}</span>` : ""}
        <h2>${escapeHtml(displayPrice)}</h2>
        ${hasDiscount ? "<em>오픈 할인</em>" : ""}
      </div>
      <strong class="premium-buyer-proof">${formatCount(getPremiumBuyerCount())}명이 구매하고 있어요 · 조회 ${formatCount(getPremiumDisplayViews())}회</strong>
      <ul>
        <li>신경계 임상추론 6편 · 총 58페이지</li>
        <li>결제 후 평생 소장</li>
        <li>모바일/PC 열람 가능</li>
        <li>업데이트 시 추가 비용 없음</li>
      </ul>
      ${purchased ? `
        <div class="premium-purchase-complete">
          <strong>구매완료</strong>
          <span>신경계 임상추론 시리즈 6편 자료가 열렸어요.</span>
        </div>
        <a class="premium-primary-link" href="#premiumAccess">자료 보러가기</a>
      ` : `
        <button type="button" data-premium-checkout="neuro-series-6" data-checkout-placement="purchase_card">6편 전체 구매하기 · ${escapeHtml(displayPrice)}</button>
        <button type="button" data-premium-preview="neuro-series-6">구성 미리보기</button>
        <span>신청 후 계좌이체 · 입금 확인 뒤 평생 열람</span>
      `}
    </section>

    ${renderPremiumAccessPanel(purchased)}

    ${renderBankTransferStatusPanel(activeOrder)}

    <section class="premium-section premium-social-proof">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Review</p>
          <h2>구매자 리뷰 ${formatCount(getPremiumReviews().length)}개</h2>
        </div>
        <a href="#premium">전체 보기</a>
      </div>
      <p class="premium-review-note">구매 승인과 자료 열람이 확인된 사용자만 작성할 수 있는 인증 리뷰입니다.</p>
      ${purchased ? `
        <form class="premium-review-form" data-premium-review-form>
          <textarea name="review" placeholder="자료를 보고 도움이 된 점을 남겨주세요." maxlength="300" aria-label="리뷰 내용"></textarea>
          <button type="submit">리뷰 남기기</button>
        </form>
      ` : `
        <div class="premium-review-locked">구매 승인 후 리뷰 작성이 열립니다.</div>
      `}
      <div class="premium-review-list" id="premiumReviewList">
        ${renderPremiumReviews()}
      </div>
    </section>

    <section class="premium-section premium-qa">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Q&A</p>
          <h2>자주 묻는 질문</h2>
        </div>
      </div>
      <article><strong>Q. 캐러셀과 유료 자료가 다른가요?</strong><span>캐러셀은 요약본이고, 유료 자료는 전체 DOCX 원고와 표·보고 기준까지 포함됩니다.</span></article>
      <article><strong>Q. 결제 후 어떻게 받나요?</strong><span>계좌이체로 구매 신청을 남기면 승인 요청 상태가 됩니다. 입금 확인 후 운영자가 승인하면 주문번호로 확인할 수 있고, 구매완료 자료 영역에 열기 링크가 표시됩니다.</span></article>
      <article><strong>Q. 휴대폰과 PC에서 모두 볼 수 있나요?</strong><span>네. 주문번호와 구매 신청 이메일, 휴대폰 뒤 4자리로 승인 상태를 확인하면 모바일과 PC에서 모두 열람할 수 있습니다.</span></article>
    </section>
    ${purchased ? "" : `
      <aside class="premium-sticky-cta" aria-label="프리미엄 구매 바로가기">
        <span>${hasDiscount ? `<del>${PREMIUM_REGULAR_PRICE}</del>` : ""}<strong>${escapeHtml(displayPrice)}</strong></span>
        <button type="button" data-premium-checkout="neuro-series-6" data-checkout-placement="sticky_mobile">6편 전체 구매</button>
      </aside>
    `}
  `;
}

function premiumDocPreviewCard(card, index) {
  const image = card.image ? `<img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.module.title)} ${escapeHtml(card.section)} 미리보기" loading="lazy" />` : "";
  const mini = image || `
        <h3>${escapeHtml(card.section)}</h3>
        <strong>${escapeHtml(card.module.title)}</strong>
        <ul>${card.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      `;

  return `
    <button class="premium-doc-card" type="button" data-premium-preview-card="${index}">
      <div class="doc-page-mini ${image ? "has-image" : ""}">${mini}</div>
      <p>${escapeHtml(card.module.title)}</p>
    </button>
  `;
}



const DEFAULT_BANK_TRANSFER_ACCOUNT = {
  bank: "입금 계좌 설정 필요",
  holder: "박용민",
  number: "계좌번호를 입력해주세요",
  amount: PREMIUM_REGULAR_PRICE
};


function getBankTransferAccount() {
  return { ...DEFAULT_BANK_TRANSFER_ACCOUNT, ...readJsonObject("pym.bankTransferAccount") };
}

function getPremiumFileLinks() {
  return readJsonObject("pym.premiumFileLinks");
}

function premiumOperatingSettingsPayload() {
  return {
    account: getBankTransferAccount(),
    fileLinks: getPremiumFileLinks(),
    updatedAt: new Date().toISOString()
  };
}

async function loadRemotePremiumOperatingSettings() {
  try {
    const response = await fetch(`${orderApiUrl}?action=settings`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("설정을 불러오지 못했습니다.");
    const settings = await response.json();
    if (settings?.account) applyPremiumOperatingSettings({ account: settings.account });
  } catch {
    // The last server-approved account remains cached locally when offline.
  }
}

function applyPremiumOperatingSettings(settings) {
  if (settings.account) safeStorageSet("pym.bankTransferAccount", JSON.stringify(settings.account));
  if (settings.fileLinks && adminSecret) safeStorageSet("pym.premiumFileLinks", JSON.stringify(settings.fileLinks));
  const currentPrice = getBankTransferAccount().amount || PREMIUM_REGULAR_PRICE;
  document.querySelectorAll("[data-premium-price]").forEach((node) => {
    node.textContent = currentPrice;
  });
  renderPremiumScreen();
}

function readBankTransferOrders() {
  return readJsonArray("pym.bankTransferOrders");
}

function writeBankTransferOrders(orders) {
  safeStorageSet("pym.bankTransferOrders", JSON.stringify(orders.slice(-200)));
}


function mergeBankTransferOrders(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach((order) => {
    if (!order.id) return;
    const existing = map.get(order.id);
    if (!existing || new Date(order.updatedAt || order.approvedAt || order.createdAt || 0) >= new Date(existing.updatedAt || existing.approvedAt || existing.createdAt || 0)) {
      map.set(order.id, order);
    }
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getAdminBankTransferOrders() {
  return mergeBankTransferOrders(readBankTransferOrders(), adminDashboardState.data?.bankOrders || []);
}

function getFilteredAdminBankTransferOrders() {
  const needle = adminOrderState.query.trim().toLowerCase();
  return getAdminBankTransferOrders().filter((order) => {
    const statusMatches = adminOrderState.status === "all" || order.status === adminOrderState.status;
    if (!statusMatches) return false;
    if (!needle) return true;
    return [order.id, order.depositor, order.email, order.phoneLast4, order.memo, order.amount, order.status]
      .some((value) => String(value || "").toLowerCase().includes(needle));
  });
}

function bankTransferOrderPayload(order) {
  return {
    orderId: order.id,
    productId: order.productId,
    productTitle: order.productTitle,
    amount: order.amount,
    status: order.status || "pending",
    createdAt: order.createdAt,
    approvedAt: order.approvedAt || ""
  };
}

function orderFromAnalyticsEvent(event) {
  const props = event.properties || {};
  const orderId = props.orderId || props.id;
  if (!orderId) return null;
  const approved = event.event_name === "bank_transfer_order_approve" || props.status === "approved";
  return {
    id: orderId,
    productId: props.productId || "neuro-series-6",
    productTitle: props.productTitle || "신경계 임상추론 시리즈 6편",
    amount: props.amount || getBankTransferAccount().amount,
    depositor: props.depositor || "입금자명 미기록",
    email: props.email || "이메일 미기록",
    phoneLast4: props.phoneLast4 || "",
    memo: props.memo || "",
    status: approved ? "approved" : "pending",
    createdAt: props.createdAt || event.created_at,
    approvedAt: approved ? (props.approvedAt || event.created_at) : "",
    updatedAt: event.created_at,
    fileLinks: props.fileLinks || {}
  };
}

function extractBankTransferOrdersFromEvents(events) {
  return mergeBankTransferOrders(events
    .filter((event) => ["bank_transfer_order_submit", "bank_transfer_order_approve"].includes(event.event_name))
    .map(orderFromAnalyticsEvent)
    .filter(Boolean));
}

function getLatestBankTransferOrder(productId) {
  return readBankTransferOrders()
    .filter((order) => order.productId === productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
}

function openBankTransferOrderModal(productId) {
  previewModal.hidden = false;
  previewModal.setAttribute("aria-labelledby", "bankTransferTitle");
  modalContent.innerHTML = `
    <div class="bank-order-modal">
      <p class="eyebrow">Bank transfer</p>
      <h2 id="bankTransferTitle">신경계 시리즈 구매 신청</h2>
      <p>입금자 정보를 남기고 아래 계좌로 이체하면 운영자가 입금 확인 후 자료 열람을 승인합니다.</p>
      <div class="bank-account-card">
        <span>입금액</span><strong>${escapeHtml(getBankTransferAccount().amount)}</strong>
        <span>은행</span><strong>${escapeHtml(getBankTransferAccount().bank)}</strong>
        <span>계좌</span><strong>${escapeHtml(getBankTransferAccount().number)}</strong>
        <span>예금주</span><strong>${escapeHtml(getBankTransferAccount().holder)}</strong>
      </div>
      <form class="bank-order-form" data-bank-order-form>
        <input type="hidden" name="productId" value="${escapeHtml(productId)}" />
        <label><span>입금자명</span><input name="depositor" required placeholder="계좌이체할 때 입력할 이름" /></label>
        <label><span>이메일</span><input name="email" type="email" required placeholder="자료 안내를 받을 이메일" /></label>
        <label><span>휴대폰 뒤 4자리</span><input name="phoneLast4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required placeholder="입금 확인 보조용" /></label>
        <label><span>요청사항</span><textarea name="memo" maxlength="200" placeholder="남길 말이 있으면 적어주세요"></textarea></label>
        <label class="bank-privacy-check"><input type="checkbox" name="privacyConsent" required /> <span>입금 확인과 주문 조회를 위해 입금자명, 이메일, 휴대폰 뒤 4자리를 수집·이용하는 데 동의합니다.</span></label>
        <button type="submit">구매 신청 접수</button>
      </form>
      <p class="bank-order-help">입금자명은 신청한 이름과 같게 보내주세요. 입력한 정보는 구매 확인과 자료 열람 안내 목적으로만 사용됩니다.</p>
    </div>
  `;
  trackEvent("bank_transfer_order_open", { productId });
}

async function submitBankTransferOrder(form) {
  const formData = new FormData(form);
  const productId = String(formData.get("productId") || "neuro-series-6");
  const depositor = String(formData.get("depositor") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phoneLast4 = String(formData.get("phoneLast4") || "").trim();
  const memo = String(formData.get("memo") || "").trim();
  const privacyConsent = formData.get("privacyConsent") === "on";

  if (!depositor || !email || !phoneLast4) {
    showToast("입금자명, 이메일, 휴대폰 뒤 4자리를 모두 입력해주세요");
    return;
  }

  if (!/^\d{4}$/.test(phoneLast4)) {
    showToast("휴대폰 뒤 4자리는 숫자 4자리로 입력해주세요");
    return;
  }

  if (!privacyConsent) {
    showToast("개인정보 수집·이용 동의가 필요해요");
    return;
  }

  const button = form.querySelector("button[type='submit']");
  if (button) {
    button.disabled = true;
    button.textContent = "접수 중...";
  }
  try {
    const response = await fetch(orderApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", productId, depositor, email, phoneLast4, memo })
    });
    const order = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(order.error || "구매 신청을 접수하지 못했습니다.");
    writeBankTransferOrders(mergeBankTransferOrders(readBankTransferOrders(), [order]));
    trackEvent("bank_transfer_order_submit", { ...bankTransferOrderPayload(order), remoteSaved: true });
    if (!analyticsAdmin.hidden && adminUsername && adminSecret) loadAdminDashboardData();
    renderBankOrderSubmitted(order, { ok: true });
  } catch (error) {
    showToast(error.message || "구매 신청을 접수하지 못했습니다.");
    if (button) {
      button.disabled = false;
      button.textContent = "구매 신청 접수";
    }
  }
}

function renderBankOrderSubmitted(order, remoteResult = { ok: true }) {
  modalContent.innerHTML = `
    <div class="bank-order-modal submitted">
      <p class="eyebrow">Order received</p>
      <h2>구매 신청이 접수됐어요</h2>
      <div class="bank-order-code">${escapeHtml(order.id)}</div>
      <p>아래 정보로 입금 후 운영자가 승인하면, 이 주문번호로 자료 열람을 열 수 있습니다.</p>
      ${remoteResult.ok ? "" : `<p class="bank-order-warning-text">서버 저장이 막혀 이 기기에만 접수됐어요. 운영자에게 주문번호를 보내주세요.</p>`}
      <div class="bank-account-card">
        <span>입금액</span><strong>${escapeHtml(order.amount)}</strong>
        <span>은행</span><strong>${escapeHtml(getBankTransferAccount().bank)}</strong>
        <span>계좌</span><strong>${escapeHtml(getBankTransferAccount().number)}</strong>
        <span>예금주</span><strong>${escapeHtml(getBankTransferAccount().holder)}</strong>
      </div>
      <button type="button" data-close-modal>확인</button>
    </div>
  `;
  renderPremiumScreen();
  showToast("구매 신청이 접수됐어요");
}

function renderBankTransferStatusPanel(order) {
  if (!order || isPremiumPurchased(order.productId)) return "";
  return `
    <section class="premium-section bank-status-card">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Bank transfer</p>
          <h2>구매 신청 상태</h2>
        </div>
        <span class="bank-status ${escapeHtml(order.status)}">${order.status === "approved" ? "승인완료" : "입금 확인 대기"}</span>
      </div>
      <p>주문번호 <strong>${escapeHtml(order.id)}</strong> · 입금자명 ${escapeHtml(order.depositor)} · 금액 ${escapeHtml(order.amount)}</p>
      <form class="bank-order-lookup" data-bank-order-lookup-form>
        <input name="orderCode" value="${escapeHtml(order.id)}" autocomplete="off" />
        <input type="hidden" name="email" value="${escapeHtml(order.email || "")}" />
        <input type="hidden" name="phoneLast4" value="${escapeHtml(order.phoneLast4 || "")}" />
        <button type="submit">승인 확인</button>
      </form>
    </section>
  `;
}

async function verifyBankTransferOrder(form) {
  const formData = new FormData(form);
  const orderCode = String(formData.get("orderCode") || "").trim().toUpperCase();
  const localOrder = readBankTransferOrders().find((item) => String(item.id || "").toUpperCase() === orderCode);
  const email = String(formData.get("email") || localOrder?.email || "").trim();
  const phoneLast4 = String(formData.get("phoneLast4") || localOrder?.phoneLast4 || "").trim();
  if (!orderCode || !email || !/^\d{4}$/.test(phoneLast4)) {
    showToast("주문번호, 이메일, 휴대폰 뒤 4자리를 입력해 주세요");
    return;
  }
  let order;
  try {
    const response = await fetch(orderApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", orderId: orderCode, email, phoneLast4 })
    });
    order = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(order.error || "주문을 찾지 못했습니다.");
  } catch (error) {
    showToast(error.message || "주문을 찾지 못했어요");
    return;
  }
  writeBankTransferOrders(mergeBankTransferOrders(readBankTransferOrders().filter((item) => item.id !== order.id), [order]));
  if (order.status !== "approved") {
    showToast("아직 입금 확인 대기 상태예요");
    return;
  }
  if (order.fileLinks && Object.keys(order.fileLinks).length) {
    safeStorageSet("pym.premiumFileLinks", JSON.stringify(order.fileLinks));
  }
  safeStorageSet(`pym.premiumAccess.${order.productId}`, "true");
  safeStorageSet(`pym.premiumAccessAt.${order.productId}`, order.approvedAt || new Date().toISOString());
  trackEvent("bank_transfer_order_verified", { orderId: order.id, productId: order.productId });
  showToast("승인 확인 완료! 자료가 열렸어요");
  renderPremiumScreen();
  document.querySelector("#premiumAccess")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function lookupBankTransferOrderByIdentity(form) {
  const formData = new FormData(form);
  const depositor = String(formData.get("depositor") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phoneLast4 = String(formData.get("phoneLast4") || "").trim();

  if (!depositor || !email || !phoneLast4) {
    showToast("입금자명, 이메일, 휴대폰 뒤 4자리를 모두 입력해주세요");
    return;
  }

  if (!/^\d{4}$/.test(phoneLast4)) {
    showToast("휴대폰 뒤 4자리는 숫자 4자리로 입력해주세요");
    return;
  }

  const button = form.querySelector("button[type='submit']");
  if (button) {
    button.disabled = true;
    button.textContent = "조회 중...";
  }

  let order = null;
  let lookupError = "";
  try {
    const response = await fetch(orderApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lookup", depositor, email, phoneLast4 })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "일치하는 구매 신청을 찾지 못했습니다.");
    order = payload;
  } catch (error) {
    lookupError = error.message || "일치하는 구매 신청을 찾지 못했습니다.";
  }
  if (button) {
    button.disabled = false;
    button.textContent = "주문번호 조회";
  }
  if (!order) {
    showToast(lookupError || "일치하는 구매 신청을 찾지 못했어요");
    return;
  }

  writeBankTransferOrders(mergeBankTransferOrders(readBankTransferOrders().filter((item) => item.id !== order.id), [order]));
  trackEvent("bank_transfer_order_identity_lookup", { orderId: order.id, productId: order.productId, status: order.status });

  if (order.status === "approved") {
    if (order.fileLinks && Object.keys(order.fileLinks).length) {
      safeStorageSet("pym.premiumFileLinks", JSON.stringify(order.fileLinks));
    }
    safeStorageSet(`pym.premiumAccess.${order.productId}`, "true");
    safeStorageSet(`pym.premiumAccessAt.${order.productId}`, order.approvedAt || new Date().toISOString());
    showToast(`주문번호 ${order.id} 승인완료. 자료가 열렸어요`);
  } else {
    showToast(`주문번호는 ${order.id} 입니다. 아직 입금 확인 대기 상태예요`);
  }

  renderPremiumScreen();
  document.querySelector(order.status === "approved" ? "#premiumAccess" : ".bank-status-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function approveBankTransferOrder(orderId) {
  const localOrders = readBankTransferOrders();
  const sourceOrder = getAdminBankTransferOrders().find((item) => item.id === orderId) || localOrders.find((item) => item.id === orderId);
  if (!sourceOrder) {
    showToast("주문을 찾지 못했어요");
    return;
  }
  try {
    await adminRequest("approve", { orderId });
    trackEvent("bank_transfer_order_approve", { orderId, productId: sourceOrder.productId });
    showToast("입금 확인 처리했어요");
    await loadAdminDashboardData();
  } catch (error) {
    showToast(error.message || "승인 처리에 실패했습니다.");
  }
}

async function deleteBankTransferOrder(orderId) {
  if (!orderId) return;
  const order = getAdminBankTransferOrders().find((item) => item.id === orderId);
  if (!order) return;
  if (!window.confirm(`${order.id} 구매 신청을 목록에서 삭제할까요? 테스트 데이터 정리에만 사용하세요.`)) return;

  try {
    await adminRequest("delete", { orderId });
    safeStorageSet("pym.bankTransferOrders", JSON.stringify(readBankTransferOrders().filter((item) => item.id !== orderId)));
    trackEvent("bank_transfer_order_delete", { orderId });
    showToast("구매 신청을 안전하게 삭제했어요");
    await loadAdminDashboardData();
  } catch (error) {
    showToast(error.message || "주문 삭제에 실패했습니다.");
  }
}

async function copyBankTransferOrder(orderId) {
  const order = readBankTransferOrders().find((item) => item.id === orderId);
  if (!order) return;
  const text = [
    `주문번호: ${order.id}`,
    `상품: ${order.productTitle}`,
    `금액: ${order.amount}`,
    `입금자명: ${order.depositor}`,
    `이메일: ${order.email}`,
    `상태: ${order.status === "approved" ? "승인완료" : "대기"}`
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showToast("주문 정보를 복사했어요");
  } catch {
    showToast("복사에 실패했어요");
  }
}

function isPremiumPurchased(productId) {
  if (safeStorageGet(`pym.premiumAccess.${productId}`) === "true") return true;
  return readBankTransferOrders().some((order) => order.productId === productId && order.status === "approved");
}

function completePremiumPurchase(productId) {
  safeStorageSet(`pym.premiumAccess.${productId}`, "true");
  safeStorageSet(`pym.premiumAccessAt.${productId}`, new Date().toISOString());
  trackEvent("premium_purchase_complete", { productId });
  showToast("구매완료! 자료가 열렸어요");
  renderPremiumScreen();
  document.querySelector("#premiumAccess")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetPremiumPurchaseTest(productId) {
  safeStorageRemove("pym.premiumAccess." + productId);
  safeStorageRemove("pym.premiumAccessAt." + productId);
  safeStorageRemove("pym.premiumAccess.");
  safeStorageRemove("pym.premiumAccessAt.");
  const remainingOrders = readBankTransferOrders().filter((order) => order.productId !== productId);
  writeBankTransferOrders(remainingOrders);
  trackEvent("premium_purchase_test_reset", { productId });
  showToast("구매 테스트 상태를 초기화했어요");
  renderPremiumScreen();
  document.querySelector("#premium")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function premiumFileHref(file) {
  const overrideMap = getPremiumFileLinks();
  const override = overrideMap[file.number] || overrideMap[file.fileName] || "";
  if (override) return override;
  return `./assets/premium/${file.fileName}`;
}

function readJsonObject(key) {
  try {
    const parsed = JSON.parse(safeStorageGet(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function renderPremiumAccessPanel(purchased) {
  if (!purchased) {
    return `
      <section class="premium-section premium-access-card locked" id="premiumAccess">
        <div class="premium-section-head">
          <div>
            <p class="eyebrow">Purchased content</p>
            <h2>구매 후 제공 자료</h2>
          </div>
        </div>
        <p>계좌이체 후 운영자 승인이 완료되면 주문번호로 PDF 6편 열람 영역이 열립니다.</p>
        <form class="bank-order-lookup" data-bank-order-lookup-form>
          <input name="orderCode" placeholder="주문번호 입력 (예: PYM-0625-AB12)" autocomplete="off" />
          <input name="email" type="email" placeholder="구매 신청 이메일" autocomplete="email" />
          <input name="phoneLast4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="휴대폰 뒤 4자리" />
          <button type="submit">승인 확인</button>
        </form>
        <div class="bank-order-divider"><span>주문번호를 잊었나요?</span></div>
        <form class="bank-order-identity-lookup" data-bank-order-identity-lookup-form>
          <input name="depositor" placeholder="입금자명" autocomplete="name" />
          <input name="email" type="email" placeholder="이메일 주소" autocomplete="email" />
          <input name="phoneLast4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="휴대폰 뒤 4자리" />
          <button type="submit">주문번호 조회</button>
        </form>
        <p class="bank-order-privacy-note">주문 조회를 위해 입력한 정보는 기존 신청 내역 확인에만 사용됩니다.</p>
      </section>
    `;
  }

  return `
    <section class="premium-section premium-access-card" id="premiumAccess">
      <div class="premium-section-head">
        <div>
          <p class="eyebrow">Purchased content</p>
          <h2>구매완료 자료</h2>
        </div>
        <span class="premium-access-badge">OPEN</span>
      </div>
      <div class="premium-download-list">
        ${premiumDownloadFiles.map((file) => `
          <article>
            <div>
              <strong>${escapeHtml(file.number)}. ${escapeHtml(file.title)}</strong>
              <span>${Number(file.pages)}페이지 · PDF</span>
            </div>
            <div class="premium-download-actions">
              <a href="${escapeHtml(premiumFileHref(file))}" target="_blank" rel="noreferrer" data-premium-secure-file="${escapeHtml(file.number)}" data-premium-secure-action="open">열기</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function getPremiumBuyerCount() {
  const approvedOrders = readBankTransferOrders().filter((order) => order.productId === "neuro-series-6" && order.status === "approved").length;
  return PREMIUM_BASE_BUYER_COUNT + approvedOrders;
}

function getPremiumDisplayViews() {
  return PREMIUM_BASE_VIEW_COUNT + Number(premiumSocialProof.accessCount || 0);
}

function getPremiumReviews() {
  return mergePremiumReviews(premiumSocialProof.reviews);
}

function mergePremiumReviews(...sources) {
  const lookup = new Map();
  sources.flat().forEach((review) => {
    const body = String(review?.body || "").trim();
    if (!body) return;
    const key = review.id || [review.name, body, review.createdAt].join(":");
    lookup.set(key, {
      id: key,
      name: review.name || randomPremiumReviewerName(),
      body,
      createdAt: review.createdAt || new Date().toISOString()
    });
  });
  return Array.from(lookup.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderPremiumReviews() {
  const reviews = getPremiumReviews();
  if (!reviews.length) {
    return `<article class="premium-review-empty"><span>아직 등록된 리뷰가 없어요. 첫 구매자 후기를 받을 준비 중입니다.</span></article>`;
  }

  return reviews.slice(0, 5).map((review) => `
    <article>
      <b>${escapeHtml(review.name || "익명 학습자")}</b>
      <span>${escapeHtml(review.body || "")}</span>
    </article>
  `).join("");
}

function randomPremiumReviewerName() {
  const groups = ["간호학생", "예비간호사", "실습생", "학습자", "신규준비생"];
  const group = groups[Math.floor(Math.random() * groups.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${group}_${suffix}`;
}

async function loadPremiumSocialProof() {
  const localEvents = readAnalyticsEvents().map(normalizeAdminEvent);
  let events = localEvents;
  try {
    const response = await fetch(`${orderApiUrl}?action=social`, { headers: { Accept: "application/json" } });
    if (response.ok) {
      const social = await response.json();
      premiumSocialProof.accessCount = Number(social.accessCount || 0);
      premiumSocialProof.reviews = Array.isArray(social.reviews) ? social.reviews : [];
      renderPremiumScreen();
      return;
    }
  } catch {
    // Fall through to this device's recent events.
  }

  premiumSocialProof.accessCount = events.filter((event) => event.event_name === "premium_secure_file_click").length;
  premiumSocialProof.reviews = events
    .filter((event) => event.event_name === "premium_review_submit")
    .map((event) => ({
      id: event.event_id,
      name: event.properties?.name,
      body: event.properties?.body,
      createdAt: event.created_at
    }))
    .filter((review) => review.body);
  renderPremiumScreen();
}

async function submitPremiumReview(form) {
  const productId = "neuro-series-6";
  const approvedOrder = readBankTransferOrders().find((order) => order.productId === productId && order.status === "approved" && order.email && order.phoneLast4);
  if (!isPremiumPurchased(productId) || !approvedOrder) {
    showToast("구매 승인 후 리뷰를 남길 수 있어요");
    return;
  }

  const formData = new FormData(form);
  const body = String(formData.get("review") || "").trim();
  if (body.length < 5) {
    showToast("리뷰 내용을 조금만 더 적어주세요");
    return;
  }

  const button = form.querySelector("button[type='submit']");
  if (button) button.disabled = true;
  try {
    const response = await fetch(orderApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "review",
        orderId: approvedOrder.id,
        email: approvedOrder.email,
        phoneLast4: approvedOrder.phoneLast4,
        body
      })
    });
    const review = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(review.error || "리뷰를 등록하지 못했습니다.");
    premiumSocialProof.reviews = mergePremiumReviews([review], premiumSocialProof.reviews);
    form.reset();
    const list = document.querySelector("#premiumReviewList");
    if (list) list.innerHTML = renderPremiumReviews();
    trackEvent("premium_review_submit", { productId, bodyLength: body.length, verifiedPurchase: true });
    showToast("구매 인증 리뷰가 등록됐어요");
  } catch (error) {
    showToast(error.message || "리뷰를 등록하지 못했습니다.");
  } finally {
    if (button) button.disabled = false;
  }
}
function openPremiumPreviewGallery(index = 0) {
  const cards = currentPremiumPreviewCards.filter((card) => card.image);
  if (!cards.length) return;
  const startIndex = Math.max(0, Math.min(Number(index) || 0, cards.length - 1));

  previewModal.setAttribute("aria-labelledby", "premiumGalleryPreviewTitle");
  modalContent.innerHTML = `
    <div class="premium-preview-modal premium-gallery-preview-modal">
      <div class="premium-gallery-head">
        <div>
          <p class="eyebrow">Preview</p>
          <h2 id="premiumGalleryPreviewTitle">실제 자료 미리보기</h2>
        </div>
        <span>${cards.length}장</span>
      </div>
      <div class="premium-preview-gallery-track" data-premium-gallery-track>
        ${cards.map((card, cardIndex) => `
          <figure class="premium-preview-gallery-page">
            <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.section)} 미리보기" />
            <figcaption>${escapeHtml(card.section)} · ${cardIndex + 1}/${cards.length}</figcaption>
          </figure>
        `).join("")}
      </div>
      <p class="premium-gallery-hint">좌우로 넘겨서 실제 자료 일부를 확인해보세요.</p>
      <div class="premium-preview-actions single">
        <button type="button" data-close-modal>닫기</button>
      </div>
    </div>
  `;
  previewModal.hidden = false;
  document.body.classList.add("modal-open");

  window.requestAnimationFrame(() => {
    const track = modalContent.querySelector("[data-premium-gallery-track]");
    const target = track?.children[startIndex];
    if (target) target.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
  });

  trackEvent("premium_preview_gallery_open", { productId: "neuro-series-6", startIndex });
}

renderPremiumScreen();
syncAdminRoute();
loadPremiumSocialProof();

function openPremiumPreviewModal() {
  previewModal.setAttribute("aria-labelledby", "premiumPreviewTitle");
  modalContent.innerHTML = `
    <div class="premium-preview-modal">
      <p class="eyebrow">Package preview</p>
      <h2 id="premiumPreviewTitle">신경계 임상추론 6편 구성</h2>
      <p class="premium-preview-lead">실제 DOCX 6편 기준으로 구성한 미리보기입니다. 무료 화면에서는 각 편의 학습 방향과 일부 핵심 흐름만 보여주고, 전체 원고와 표·보고 문장은 구매 후 제공하는 구조입니다.</p>
      <div class="premium-preview-summary">
        <article><strong>6편</strong><span>Tier 0·1 응급 신경계</span></article>
        <article><strong>96섹션</strong><span>각 편 16섹션 원고</span></article>
        <article><strong>72장</strong><span>12슬라이드 캐러셀 6세트</span></article>
      </div>
      <div class="premium-preview-list">
        ${premiumNeuroModules.map((module) => `
          <article>
            <div class="premium-preview-num">${escapeHtml(module.number)}</div>
            <div>
              <h3>${escapeHtml(module.title)}</h3>
              <p class="premium-preview-hook">${escapeHtml(module.hook)}</p>
              <p>${escapeHtml(module.preview)}</p>
              <div class="premium-paid-tags">
                ${module.paid.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
              </div>
            </div>
          </article>
        `).join("")}
      </div>
      <section class="premium-free-paid">
        <div>
          <h3>무료 공개</h3>
          <p>인스타 캐러셀, 사이트 핵심 요약, 각 편의 문제의식과 일부 미리보기</p>
        </div>
        <div>
          <h3>구매 후 제공</h3>
          <p>DOCX 전체 원고 6편, 12슬라이드 원본, 보고 기준표, 비교표, NCLEX-style 문제</p>
        </div>
      </section>
      <div class="premium-preview-actions">
        <button type="button" data-close-modal>닫기</button>
        <button type="button" data-premium-checkout="neuro-series-6">패키지 구매하기</button>
      </div>
    </div>
  `;
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function renderTrendScreen() {
  if (!trendScreen) return;

  const latestArticles = trendArticles.slice(0, 3);
  const previousArticles = trendArticles.slice(3);

  trendScreen.innerHTML = `
    <div class="trend-top">
      <div>
        <h1>최근 간호 동향</h1>
        <p>뉴스를 간호사·간호학생 관점으로 짧게 번역해요.</p>
      </div>
      <button type="button" aria-label="동향 알림">☰</button>
    </div>
    <section class="trend-feature">
      <div class="trend-section-head">
        <p class="eyebrow">이번 주 핵심 이슈</p>
        <span>옆으로 넘겨보기</span>
      </div>
      <div class="trend-list trend-list-latest" aria-label="이번 주 핵심 이슈">
        ${latestArticles.map((article, index) => trendCardTemplate(article, index)).join("")}
      </div>
    </section>
    ${previousArticles.length ? `
      <section class="trend-feature trend-archive">
        <div class="trend-section-head">
          <p class="eyebrow">지난 동향</p>
          <span>${previousArticles.length}개</span>
        </div>
        <div class="trend-archive-list">
          ${previousArticles.map((article) => trendArchiveTemplate(article)).join("")}
        </div>
      </section>
    ` : ""}
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

function trendArchiveTemplate(article) {
  return `
    <article class="trend-archive-row">
      <div>
        <p>
          <span>${escapeHtml(article.category)}</span>
          <em>${escapeHtml(article.date)}</em>
        </p>
        <h2>${escapeHtml(article.hook)}</h2>
        <strong>${escapeHtml(article.summary)}</strong>
        <div class="trend-archive-stats">${escapeHtml(trendMetaText(article))}</div>
        <div class="trend-archive-tags">
          ${article.tags.slice(0, 2).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <button type="button" data-trend-open="${escapeHtml(article.id)}" aria-label="${escapeHtml(article.hook)} 요약 보기">
        <span>요약</span>
        <i aria-hidden="true">›</i>
      </button>
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
    safeStorageSet(likedKey, JSON.stringify(Array.from(liked).slice(-300)));
    trackEvent("trend_comment_like", { articleId, commentId });
    const comments = await loadTrendComments(article);
    setTrendCommentCount(article.id, comments.length);
    renderTrendScreen();
    renderTrendComments(article, { comments });
  } catch {
    showToast("좋아요 반영에 실패했어요");
  }
}

function openResourceComments(resource) {
  trackEvent("resource_comments_open", resourcePayload(resource));
  renderResourceComments(resource, { loading: true });
  loadResourceComments(resource)
    .then((comments) => {
      setResourceCommentCount(resource.id, comments.length);
      renderDetail(activeResource);
      renderResourceComments(resource, { comments });
    })
    .catch(() => {
      const comments = readLocalResourceComments(resource.id);
      setResourceCommentCount(resource.id, comments.length);
      renderResourceComments(resource, {
        comments,
        error: supabaseConfig.enabled
          ? "댓글 서버 연결 전이라 이 기기에서 남긴 댓글을 보여주고 있어요."
          : "Supabase 연결 전이라 이 기기에서만 댓글이 저장돼요."
      });
    });
}

function renderResourceComments(resource, options = {}) {
  previewModal.setAttribute("aria-labelledby", "modalTitle");
  modalContent.innerHTML = resourceCommentsTemplate(resource, options);
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function resourceCommentsTemplate(resource, options = {}) {
  const comments = options.comments || readLocalResourceComments(resource.id);
  const titleCount = options.loading ? getResourceCommentCount(resource) : comments.length;

  return `
    <div class="trend-comments resource-comments">
      <h2 id="modalTitle">${escapeHtml(resource.displayTitle)} 댓글 (${formatCount(titleCount)})</h2>
      <div class="comment-guide">자료를 보며 헷갈린 지점, 실습에서 궁금한 점, 추가로 보고 싶은 내용을 남겨주세요.</div>
      ${options.loading ? `<div class="comment-status">댓글을 불러오는 중이에요.</div>` : ""}
      ${options.error ? `<div class="comment-status">${escapeHtml(options.error)}</div>` : ""}
      <div class="comment-list">
        ${comments.length ? comments.map((comment) => `
          <article class="comment-card">
            <div>
              <strong>${escapeHtml(comment.name)}</strong>
              <span>${escapeHtml(comment.time)}</span>
            </div>
            <p>${escapeHtml(comment.text)}</p>
            <button type="button" data-resource-comment-like="${escapeHtml(String(comment.id))}" data-resource-id="${escapeHtml(resource.id)}">좋아요 ${formatCount(comment.likes || 0)}</button>
          </article>
        `).join("") : `<div class="comment-status">아직 댓글이 없어요. 첫 질문을 남겨보세요.</div>`}
      </div>
      <div class="comment-input">
        <textarea maxlength="300" placeholder="의견이나 질문을 남겨주세요." aria-label="자료 댓글 입력"></textarea>
        <button type="button" data-resource-comment-submit="${escapeHtml(resource.id)}">등록</button>
      </div>
    </div>
  `;
}

async function loadResourceComments(resource) {
  if (!supabaseConfig.enabled) {
    throw new Error("Supabase is not configured");
  }

  const query = new URLSearchParams({
    select: "id,resource_id,nickname,body,likes,created_at",
    resource_id: `eq.${resource.id}`,
    hidden: "eq.false",
    order: "created_at.desc",
    limit: "50"
  });
  const rows = await supabaseRequest(`resource_comments?${query.toString()}`);

  return rows.map((row) => ({
    id: row.id,
    name: row.nickname,
    time: relativeTime(row.created_at),
    text: row.body,
    likes: row.likes || 0
  }));
}

async function submitResourceComment(resourceId) {
  const resource = resources.find((item) => item.id === resourceId);
  if (!resource) return;

  const textarea = modalContent.querySelector(".comment-input textarea");
  const button = modalContent.querySelector(`[data-resource-comment-submit="${CSS.escape(resourceId)}"]`);
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

  button.disabled = true;
  button.textContent = "등록 중";

  if (supabaseConfig.enabled) {
    try {
      await supabaseRequest("resource_comments", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          resource_id: resource.id,
          anonymous_user_id: analyticsUserId,
          nickname: getCommentNickname(),
          body
        })
      });
      trackEvent("resource_comment_submit", { ...resourcePayload(resource), bodyLength: body.length });
      textarea.value = "";
      showToast("댓글을 등록했어요");
      const comments = await loadResourceComments(resource);
      setResourceCommentCount(resource.id, comments.length);
      renderDetail(activeResource);
      renderResourceComments(resource, { comments });
      return;
    } catch {
      // Fall through to local save so the user does not lose their comment.
    }
  }

  saveLocalResourceComment(resource, body);
  trackEvent("resource_comment_submit_local", { ...resourcePayload(resource), bodyLength: body.length });
  textarea.value = "";
  showToast(supabaseConfig.enabled ? "서버 저장이 막혀 이 기기에 임시 저장했어요" : "이 기기에 댓글을 저장했어요");
  const comments = readLocalResourceComments(resource.id);
  setResourceCommentCount(resource.id, comments.length);
  renderDetail(activeResource);
  renderResourceComments(resource, {
    comments,
    error: "Supabase 댓글 테이블을 연결하면 다른 사용자도 이 댓글을 볼 수 있어요."
  });
}

async function likeResourceComment(commentId, resourceId) {
  const resource = resources.find((item) => item.id === resourceId);
  if (!resource || !commentId) return;

  if (String(commentId).startsWith("local_")) {
    const likedKey = "pym.likedLocalResourceComments";
    const liked = new Set(readJsonArray(likedKey));
    if (liked.has(commentId)) {
      showToast("이미 좋아요를 눌렀어요");
      return;
    }
    updateLocalResourceCommentLike(resourceId, commentId);
    liked.add(commentId);
    safeStorageSet(likedKey, JSON.stringify(Array.from(liked).slice(-300)));
    renderResourceComments(resource, { comments: readLocalResourceComments(resourceId) });
    return;
  }

  if (!supabaseConfig.enabled) return;

  const likedKey = "pym.likedResourceComments";
  const liked = new Set(readJsonArray(likedKey));
  if (liked.has(commentId)) {
    showToast("이미 좋아요를 눌렀어요");
    return;
  }

  try {
    const rows = await supabaseRequest(`resource_comments?select=likes&id=eq.${encodeURIComponent(commentId)}&limit=1`);
    const currentLikes = Number(rows[0]?.likes || 0);
    await supabaseRequest(`resource_comments?id=eq.${encodeURIComponent(commentId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ likes: currentLikes + 1 })
    });
    liked.add(commentId);
    safeStorageSet(likedKey, JSON.stringify(Array.from(liked).slice(-300)));
    trackEvent("resource_comment_like", { resourceId, commentId });
    const comments = await loadResourceComments(resource);
    setResourceCommentCount(resource.id, comments.length);
    renderResourceComments(resource, { comments });
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
  const existing = safeStorageGet(key);
  if (existing) return existing;

  const roles = ["간호사", "학생", "실습생", "신규간호사"];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const nickname = `익명 ${role}_${suffix}`;
  safeStorageSet(key, nickname);
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
    const parsed = JSON.parse(safeStorageGet(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => resources.some((resource) => resource.id === id)) : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key, ids) {
  safeStorageSet(key, JSON.stringify(ids));
}

const SEARCH_EXPANSION_RULES = [
  { terms: ["신경계", "신경", "neurology", "neuro"], tokens: ["신경계", "iicp", "두개내압", "gbs", "길랭", "mg", "중증근무력증", "als", "ms", "파킨슨", "임상추론"], systems: ["신경계"], boostIds: ["iicp", "gbs", "mg", "als", "ms", "pd"] },
  { terms: ["ecg", "ekg", "심전도"], tokens: ["ecg", "ekg", "심전도", "stemi", "nstemi", "acs", "심근경색", "흉통", "troponin"], boostIds: ["acs-clinical-reasoning", "acs-ecg", "mi", "acls"] },
  { terms: ["abga", "abg", "동맥혈가스", "동맥혈가스분석", "가스분석", "산염기"], tokens: ["abga", "abg", "동맥혈가스분석", "ph", "paco2", "hco3", "pao2", "rome", "보상", "산증", "알칼리증", "dka"], boostIds: ["abga", "dka", "pneumonia-case-study", "pneumothorax-cxr"] },
  { terms: ["심혈관", "순환기", "cardio", "cardiac", "심장"], tokens: ["심혈관", "acs", "ecg", "심근경색", "허혈", "흉통", "acls", "cpr", "troponin"], systems: ["심혈관"], boostIds: ["acs-clinical-reasoning", "acs-ecg", "mi", "acls"] },
  { terms: ["응급", "응급간호", "emergency", "쇼크", "shock"], tokens: ["응급", "쇼크", "저혈압", "기도", "산소포화도", "보고", "우선순위", "아나필락시스", "패혈증", "dka", "acls"], systems: ["응급간호"], boostIds: ["anaphylaxis", "sepsis", "dka", "acls"] },
  { terms: ["아나필락시스", "anaphylaxis", "알레르기", "에피네프린", "epinephrine"], tokens: ["아나필락시스", "anaphylaxis", "에피네프린", "두드러기", "기도부종", "저혈압", "biphasic"], boostIds: ["anaphylaxis", "acls", "sepsis"] },
  { terms: ["패혈증", "sepsis", "septic", "젖산", "lactate", "qsofa"], tokens: ["패혈증", "sepsis", "septic shock", "젖산", "lactate", "qsofa", "sofa", "map", "혈액배양", "항생제"], boostIds: ["sepsis", "pneumonia-case-study", "abga"] },
  { terms: ["dka", "당뇨병성 케톤산증", "케톤산증", "케톤", "kussmaul"], tokens: ["dka", "당뇨병성 케톤산증", "케톤", "혈당", "대사성 산증", "kussmaul", "anion gap", "칼륨", "인슐린"], boostIds: ["dka", "abga", "siadh"] },
  { terms: ["copd", "만성폐쇄성폐질환", "급성악화", "co2 마취", "과탄산혈증"], tokens: ["copd", "copd 급성악화", "만성폐쇄성폐질환", "co2 narcosis", "과탄산혈증", "spo2 88~92%", "venturi mask", "niv", "haldane effect", "v/q mismatch"], systems: ["호흡기"], boostIds: ["copd-acute-exacerbation", "abga", "pneumonia-case-study"] },
  { terms: ["간호중재", "중재", "nursing intervention", "간호수행", "간호관리"], tokens: ["간호중재", "간호수행", "보고", "우선순위", "산소요법", "체위", "사정", "모니터링"], intents: ["간호중재", "임상추론"], boostIds: ["iicp", "thyroidectomy", "pneumonia-case-study", "abga", "acls", "anaphylaxis", "sepsis", "dka"] },
  { terms: ["gbs", "길랑", "길랭", "길랑바레", "길랭바레", "guillain"], tokens: ["gbs", "길랭바레", "길랑바레", "상행성", "호흡근"], boostIds: ["gbs", "mg", "als"] },
  { terms: ["khsim", "시뮬레이션", "실습훈련", "간호시뮬레이션"], tokens: ["khsim", "시뮬레이션", "실습", "환자 시나리오"], boostIds: ["khsim-simulation", "abga", "acls", "pneumonia-case-study"] },
  { terms: ["흉부", "cxr", "chest", "xray", "x-ray", "호흡기"], tokens: ["흉부", "cxr", "chest x-ray", "호흡기", "기흉", "폐렴", "abga"], systems: ["호흡기"], boostIds: ["pneumothorax-cxr", "pneumonia-case-study", "abga"] },
  { terms: ["nclex", "엔클렉스"], tokens: ["nclex", "문제", "임상추론", "우선순위", "보고"], intents: ["임상추론"], boostIds: ["abga", "acls", "iicp", "pneumonia-case-study"] }
];

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[\s_\-/]+/g, " ").trim();
}

function buildSearchContext(query) {
  const normalized = normalizeSearchText(query);
  const baseTokens = normalized.split(/\s+/).filter(Boolean);
  const expansion = { tokens: [...baseTokens], boostIds: new Set(), systems: new Set(), intents: new Set(), matchedRules: [] };
  if (!normalized) return expansion;

  SEARCH_EXPANSION_RULES.forEach((rule) => {
    const matched = rule.terms.some((term) => {
      const normalizedTerm = normalizeSearchText(term);
      return normalized === normalizedTerm || normalized.includes(normalizedTerm) || normalizedTerm.includes(normalized);
    });
    if (!matched) return;
    expansion.matchedRules.push(rule);
    (rule.tokens || []).forEach((token) => expansion.tokens.push(normalizeSearchText(token)));
    (rule.boostIds || []).forEach((id) => expansion.boostIds.add(id));
    (rule.systems || []).forEach((system) => expansion.systems.add(system));
    (rule.intents || []).forEach((intent) => expansion.intents.add(intent));
  });

  expansion.tokens = Array.from(new Set(expansion.tokens.filter(Boolean)));
  return expansion;
}

function openAgentWithQuestion(question, context = {}) {
  const cleaned = String(question || "").trim();
  if (cleaned) safeStorageSet("pym.pendingAgentQuestion", cleaned);
  trackEvent("agent_cta_click", { query: cleaned, placement: context.placement || "search", resourceId: context.resourceId || "" });
  window.location.hash = "agent";
  setAgentMode();
}

function consumePendingAgentQuestion() {
  const pending = safeStorageGet("pym.pendingAgentQuestion");
  if (!pending) return;
  safeStorageRemove("pym.pendingAgentQuestion");
  const input = agentScreen?.querySelector("[data-agent-form] textarea");
  if (input) {
    input.value = pending;
    input.focus();
  }
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

  grid.querySelectorAll("[data-agent-search-question]").forEach((button) => {
    button.addEventListener("click", () => {
      openAgentWithQuestion(button.dataset.agentSearchQuestion, { placement: "search_empty" });
    });
  });

  renderDetail(activeResource);
}

function scoreResources(query) {
  const search = buildSearchContext(query);
  return resources.map((resource) => {
    const title = normalizeSearchText(resource.displayTitle);
    const tags = normalizeSearchText(resource.tags.join(" "));
    const haystack = normalizeSearchText([
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
    ].join(" "));

    let score = query ? 0 : 1;
    if (search.boostIds.has(resource.id)) score += 18;
    if (search.systems.has(resource.system)) score += 10;
    if (search.intents.has(resource.intent)) score += 8;

    score += search.tokens.reduce((sum, token) => {
      if (!token) return sum;
      if (title.includes(token)) return sum + 8;
      if (tags.includes(token)) return sum + 6;
      if (haystack.includes(token)) return sum + 3;
      return sum;
    }, 0);

    return { resource, score };
  });
}

function resourceSourceLabel(resource) {
  if (resource.id === "khsim-simulation") return "KHSIM 열기";
  if (resource.format === "Google Doc") return "원본 문서";
  if (resource.format === "Web App") return "체험하기";
  return "원본 PDF";
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
        <a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(resource.id)}">${escapeHtml(resourceSourceLabel(resource))}</a>
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
    <article class="resource-card empty-card search-empty-card">
      <h3>검색 결과가 없어요</h3>
      <p>"${escapeHtml(query)}" 검색어와 정확히 맞는 자료가 아직 없습니다. ${hasActiveFilters ? `${escapeHtml(filterText)} 필터와 검색어가 같이 적용 중이에요.` : "PYM Agent가 현재 자료를 먼저 훑어서 답변할 수 있어요."}</p>
      <div class="card-actions search-empty-actions">
        ${query ? `<button type="button" data-agent-search-question="${escapeHtml(query)}">Agent에게 물어보기</button>` : ""}
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

  detail.querySelectorAll("[data-detail-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      openAgentWithQuestion(`${resource.displayTitle}에서 가장 중요한 간호 판단을 알려줘`, { placement: "resource_detail", resourceId: resource.id });
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
      <div class="resource-community">
        <div class="resource-reactions" aria-label="자료 반응">
          <button type="button" class="${isResourceLiked(resource.id) ? "active" : ""}" data-resource-like="${escapeHtml(resource.id)}">좋아요 ${formatCount(getResourceLikeCount(resource.id))}</button>
          <button type="button" data-resource-comments="${escapeHtml(resource.id)}">댓글 ${formatCount(getResourceCommentCount(resource))}</button>
        </div>
        <p>이 자료가 도움 됐는지 남기고, 헷갈리는 포인트는 댓글로 같이 정리해요.</p>
      </div>
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
        <button type="button" data-detail-agent="${escapeHtml(resource.id)}">이 자료로 Agent에게 질문</button>
        <button type="button" data-detail-copy="${escapeHtml(resource.id)}">요약과 링크 복사</button>
        <button type="button" data-detail-save="${escapeHtml(resource.id)}">${saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}</button>
        <a class="detail-link" href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer" data-drive="${escapeHtml(resource.id)}">${escapeHtml(resourceSourceLabel(resource))}</a>
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
    "응급간호": { key: "emergency", icon: "ER", image: "./assets/nurse-guide.png" },
    "시뮬레이션": { key: "sim", icon: "SIM", image: "./assets/nurse-guide.png" },
    "수술간호": { key: "surgery", icon: "+", image: "./assets/thumb-surgery.png" }
  };

  const fallback = map[resource.system] || { key: "default", icon: "PDF" };
  return resource.image ? { ...fallback, image: resource.image } : fallback;
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
  modalContent.querySelectorAll("[data-detail-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      closePreviewModal();
      openAgentWithQuestion(`${resource.displayTitle}에서 가장 중요한 간호 판단을 알려줘`, { placement: "resource_preview", resourceId: resource.id });
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
  mergeLocalResourceViewStats();
  mergeLocalTrendViewStats();
  renderTrendScreen();
  try {
    const response = await fetch(`${orderApiUrl}?action=content-stats`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("통계 조회 실패");
    const payload = await response.json();
    const resourceRows = Array.isArray(payload.resources) ? payload.resources : [];
    resourceStats = new Map(resourceRows
      .filter((row) => row.resource_id)
      .map((row) => [row.resource_id, { views: Number(row.open_count || 0) }]));
    mergeLocalResourceViewStats();
    renderResults();
    renderDetail(activeResource);
    const resourceDiscussionRows = Array.isArray(payload.resourceDiscussion) ? payload.resourceDiscussion : [];
    resourceDiscussionStats = new Map(resourceDiscussionRows
      .filter((row) => row.resource_id)
      .map((row) => [row.resource_id, {
        likes: Math.max(Number(row.like_count || 0), Number(isResourceLiked(row.resource_id) ? 1 : 0)),
        comments: Math.max(Number(row.comment_count || 0), readLocalResourceComments(row.resource_id).length)
      }]));
    renderResults();
    renderDetail(activeResource);
    const trendRows = Array.isArray(payload.trends) ? payload.trends : [];
    const nextTrendStats = new Map(trendStats);
    trendRows
      .filter((row) => row.article_id)
      .forEach((row) => {
        const current = nextTrendStats.get(row.article_id) || { views: 0, comments: 0, likes: 0 };
        nextTrendStats.set(row.article_id, {
          views: Math.max(Number(current.views || 0), Number(row.view_count || 0)),
          comments: Number(row.comment_count || 0),
          likes: Number(row.like_count || 0)
        });
      });
    trendStats = nextTrendStats;
    mergeLocalTrendViewStats();
    renderTrendScreen();
  } catch {
    mergeLocalResourceViewStats();
    mergeLocalResourceDiscussionStats();
    mergeLocalTrendViewStats();
    loadTrendCommentCounts();
    renderResults();
    renderDetail(activeResource);
    renderTrendScreen();
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

function getLocalResourceViewCounts() {
  const counts = new Map();
  readAnalyticsEvents()
    .filter((event) => ["resource_open", "drive_open"].includes(event.name))
    .forEach((event) => {
      const resourceId = event.properties?.resourceId;
      if (!resourceId) return;
      counts.set(resourceId, Number(counts.get(resourceId) || 0) + 1);
    });
  return counts;
}

function mergeLocalResourceViewStats() {
  getLocalResourceViewCounts().forEach((views, resourceId) => {
    const current = resourceStats.get(resourceId) || { views: 0 };
    resourceStats.set(resourceId, { ...current, views: Math.max(Number(current.views || 0), views) });
  });
}

function getResourceDiscussionStats(resourceId) {
  return resourceDiscussionStats.get(resourceId) || { likes: 0, comments: 0 };
}

function getResourceLikeCount(resourceId) {
  const stats = getResourceDiscussionStats(resourceId);
  return Number(stats.likes || 0);
}

function getResourceCommentCount(resource) {
  const stats = getResourceDiscussionStats(resource.id);
  return Number(stats.comments || readLocalResourceComments(resource.id).length || 0);
}

function setResourceCommentCount(resourceId, count) {
  const current = getResourceDiscussionStats(resourceId);
  resourceDiscussionStats.set(resourceId, { ...current, comments: Number(count || 0) });
}

function isResourceLiked(resourceId) {
  return new Set(readJsonArray("pym.likedResources")).has(resourceId);
}

function toggleResourceLike(resourceId) {
  const resource = resources.find((item) => item.id === resourceId);
  if (!resource) return;

  const liked = new Set(readJsonArray("pym.likedResources"));
  if (liked.has(resourceId)) {
    showToast("이미 좋아요를 눌렀어요");
    return;
  }

  liked.add(resourceId);
  safeStorageSet("pym.likedResources", JSON.stringify(Array.from(liked).slice(-500)));
  const current = getResourceDiscussionStats(resourceId);
  resourceDiscussionStats.set(resourceId, {
    ...current,
    likes: Number(current.likes || 0) + 1
  });
  trackEvent("resource_like", resourcePayload(resource));
  showToast("좋아요를 눌렀어요");
  renderDetail(activeResource);
  if (!previewModal.hidden) {
    renderModalContent(resource);
  }
}

function mergeLocalResourceDiscussionStats() {
  resources.forEach((resource) => {
    const current = getResourceDiscussionStats(resource.id);
    resourceDiscussionStats.set(resource.id, {
      ...current,
      likes: Math.max(Number(current.likes || 0), Number(isResourceLiked(resource.id) ? 1 : 0)),
      comments: Math.max(Number(current.comments || 0), readLocalResourceComments(resource.id).length)
    });
  });
}

function readLocalResourceComments(resourceId) {
  return readJsonArray("pym.localResourceComments")
    .filter((comment) => comment.resourceId === resourceId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((comment) => ({
      id: comment.id,
      name: comment.name,
      time: relativeTime(comment.createdAt),
      text: comment.text,
      likes: Number(comment.likes || 0)
    }));
}

function saveLocalResourceComment(resource, body) {
  const comments = readJsonArray("pym.localResourceComments");
  comments.push({
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    resourceId: resource.id,
    name: getCommentNickname(),
    text: body,
    likes: 0,
    createdAt: new Date().toISOString()
  });
  safeStorageSet("pym.localResourceComments", JSON.stringify(comments.slice(-500)));
}

function updateLocalResourceCommentLike(resourceId, commentId) {
  const comments = readJsonArray("pym.localResourceComments");
  const next = comments.map((comment) => {
    if (comment.resourceId !== resourceId || comment.id !== commentId) return comment;
    return { ...comment, likes: Number(comment.likes || 0) + 1 };
  });
  safeStorageSet("pym.localResourceComments", JSON.stringify(next.slice(-500)));
}

function getTrendStats(articleId) {
  return trendStats.get(articleId) || { views: 0, comments: 0, likes: 0 };
}

function getLocalTrendViewCounts() {
  const counts = new Map();
  readAnalyticsEvents()
    .filter((event) => event.name === "trend_article_open")
    .forEach((event) => {
      const articleId = event.properties?.articleId;
      if (!articleId) return;
      counts.set(articleId, Number(counts.get(articleId) || 0) + 1);
    });
  return counts;
}

function mergeLocalTrendViewStats() {
  getLocalTrendViewCounts().forEach((views, articleId) => {
    const current = getTrendStats(articleId);
    trendStats.set(articleId, {
      ...current,
      views: Math.max(Number(current.views || 0), Number(views || 0))
    });
  });
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

function parseUtmParams(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  return ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].reduce((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});
}

function trackEvent(name, properties = {}) {
  const pageSearch = window.location.search || "";
  const enrichedProperties = {
    ...properties,
    pageSearch,
    ...parseUtmParams(pageSearch)
  };
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    properties: enrichedProperties,
    userId: analyticsUserId,
    sessionId: analyticsSessionId,
    path: window.location.pathname,
    search: pageSearch,
    hash: window.location.hash || "",
    referrer: document.referrer || "",
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    createdAt: new Date().toISOString()
  };

  const events = readAnalyticsEvents();
  events.push(event);
  safeStorageSet("pym.analyticsEvents", JSON.stringify(events.slice(-1000)));
  sendRemoteAnalytics(event);

  if (!analyticsAdmin.hidden) {
    renderAnalyticsAdmin();
  }

  return event;
}

function queueSearchAnalytics(query, resultCount) {
  if (resultMode !== "search" || !document.body.classList.contains("search-mode")) return;

  const normalized = normalizeSearchQuery(query);
  const trackable = getSearchTrackingDecision(normalized, resultCount);
  if (!trackable.shouldTrack) return;

  const signature = [
    normalized,
    resultCount,
    activeType,
    activeIntent,
    activeSort
  ].join("|");

  if (signature === lastSearchSignature) return;
  lastSearchSignature = signature;

  window.clearTimeout(queueSearchAnalytics.timer);
  queueSearchAnalytics.timer = window.setTimeout(() => {
    const finalResultCount = scoreResources(normalized)
      .filter((item) => activeType === "전체" || item.resource.system === activeType)
      .filter((item) => activeIntent === "전체" || item.resource.intent === activeIntent)
      .filter((item) => item.score > 0).length;
    const finalDecision = getSearchTrackingDecision(normalized, finalResultCount);
    if (!finalDecision.shouldTrack) return;

    trackEvent(finalResultCount === 0 ? "search_no_result" : "search", {
      query: normalized,
      resultCount: finalResultCount,
      system: activeType,
      intent: activeIntent,
      sort: activeSort,
      quality: finalDecision.quality
    });
  }, 700);
}

function normalizeSearchQuery(query) {
  return String(query || "").trim().replace(/\s+/g, " ");
}

function getSearchTrackingDecision(query, resultCount) {
  if (!query) return { shouldTrack: false, quality: "empty" };
  if (isNoiseQuery(query)) return { shouldTrack: false, quality: "noise" };
  if (resultCount > 0) return { shouldTrack: true, quality: "matched" };
  if (isExactKnownResourceQuery(query)) return { shouldTrack: true, quality: "known_zero" };
  if (query.length >= 3 || /[가-힣]{2,}/.test(query)) return { shouldTrack: true, quality: "unmet_demand" };
  return { shouldTrack: false, quality: "too_short_no_result" };
}

function isNoiseQuery(query) {
  const text = normalizeSearchQuery(query);
  if (text.length < 2) return true;
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(text)) return true;
  if (/^[A-Za-z]$/.test(text)) return true;
  if (/^[A-Za-z]{2}$/.test(text) && !isExactKnownResourceQuery(text)) return true;
  return false;
}

function isExactKnownResourceQuery(query) {
  const needle = normalizeSearchQuery(query).toLowerCase();
  if (!needle) return false;
  return resources.some((resource) => {
    const values = [
      resource.id,
      resource.title,
      resource.displayTitle,
      resource.system,
      resource.intent,
      ...(resource.tags || []),
      ...(resource.keywords || [])
    ].filter(Boolean).map((value) => String(value).toLowerCase());
    return values.includes(needle);
  });
}

function readAnalyticsEvents() {
  return readJsonArray("pym.analyticsEvents");
}

function readJsonArray(key) {
  try {
    const parsed = JSON.parse(safeStorageGet(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sendRemoteAnalytics(event) {
  if (!supabaseConfig.enabled) return;

  postSupabaseEvents([event])
    .then(() => {
      markSupabaseSent([event.id]);
      if (["trend_article_open", "resource_open", "drive_open"].includes(event.name)) {
        loadContentStats();
      }
    })
    .catch((error) => {
      if (error.status === 409) {
        markSupabaseSent([event.id]);
        return;
      }
      scheduleAnalyticsFlush();
    });
}

function scheduleAnalyticsFlush() {
  if (analyticsFlushScheduled) return;
  analyticsFlushScheduled = true;
  window.setTimeout(() => {
    analyticsFlushScheduled = false;
    flushRemoteAnalytics({ silent: true, limit: 40 });
  }, 3000);
}

async function flushRemoteAnalytics(options = {}) {
  if (!supabaseConfig.enabled) return 0;

  const silent = Boolean(options.silent);
  const limit = Number(options.limit || 80);
  const sentIds = readSupabaseSentIds();
  const pending = readAnalyticsEvents()
    .filter((event) => !sentIds.has(event.id))
    .slice(-limit);

  if (!pending.length) {
    if (!silent) renderAnalyticsAdmin();
    return 0;
  }

  try {
    let synced = 0;
    for (let index = 0; index < pending.length; index += 20) {
      const batch = pending.slice(index, index + 20);
      try {
        await postSupabaseEvents(batch);
        markSupabaseSent(batch.map((event) => event.id));
        synced += batch.length;
      } catch {
        synced += await flushRemoteAnalyticsOneByOne(batch);
      }
    }
    if (!silent) showToast(`${synced}개 이벤트를 Supabase로 보냈어요`);
    return synced;
  } finally {
    if (!silent) renderAnalyticsAdmin();
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
  const response = await fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ events }),
    keepalive: events.length === 1
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || `Analytics insert failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
}

function getSupabaseConfig() {
  const url = String(window.PYM_SUPABASE_URL || safeStorageGet("pym.supabaseUrl") || "").trim().replace(/\/$/, "");
  const anonKey = String(window.PYM_SUPABASE_ANON_KEY || safeStorageGet("pym.supabaseAnonKey") || "").trim();

  return {
    url,
    anonKey,
    enabled: Boolean(url && anonKey)
  };
}

function readSupabaseSentIds() {
  try {
    const parsed = JSON.parse(safeStorageGet("pym.supabaseSentIds") || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markSupabaseSent(ids) {
  const sentIds = readSupabaseSentIds();
  ids.forEach((id) => sentIds.add(id));
  safeStorageSet("pym.supabaseSentIds", JSON.stringify(Array.from(sentIds).slice(-1200)));
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
  const existing = safeStorageGet(key);
  if (existing) return existing;

  const id = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  safeStorageSet(key, id);
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
  const hash = window.location.hash;
  const isAdmin = isAdminHash(hash);
  const isPremium = hash === "#premium";
  const isAgent = hash === "#agent";
  analyticsAdmin.hidden = !isAdmin;
  document.body.classList.toggle("admin-mode", isAdmin);

  if (isAdmin) {
    if (!adminUsername || !adminSecret) {
      renderAdminLogin();
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    try {
      renderAnalyticsAdmin();
      trackEvent("admin_view");
      loadAdminDashboardData();
    } catch (error) {
      renderAdminFallback(error);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  if (isPremium) {
    setPremiumMode();
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  if (isAgent) {
    setAgentMode();
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}


function renderAdminFallback(error) {
  analyticsAdmin.hidden = false;
  document.body.classList.add("admin-mode");
  const message = error?.message || "알 수 없는 오류";
  analyticsContent.innerHTML = `
    <section class="admin-hero">
      <p class="eyebrow">Admin recovery</p>
      <h2>어드민 화면을 복구했어요</h2>
      <p>렌더 중 오류가 발생해서 안전 모드로 열었습니다. 아래 버튼으로 로컬 기록 기준 대시보드를 다시 불러올 수 있어요.</p>
    </section>
    <section class="admin-card">
      <div class="admin-card-head">
        <h2>오류 내용</h2>
        <span>진단</span>
      </div>
      <p class="admin-note">${escapeHtml(message)}</p>
      <div class="admin-actions inline">
        <button type="button" data-admin-refresh>다시 불러오기</button>
        <button type="button" data-supabase-test>Supabase 테스트</button>
      </div>
    </section>
    ${premiumOperatingSettingsAdminTemplate()}
    ${premiumTestToolsAdminTemplate()}
    ${bankTransferOrdersAdminTemplate()}
  `;
}


function buildAdminRenderContext() {
  const data = adminDashboardState.data || buildEmptyAdminDashboardData();
  const filtered = filterAdminData(data);
  const kpis = getAdminKpis(filtered);
  const revenue = getRevenueKpis(data.bankOrders || []);
  const insights = getAdminInsights(filtered);
  const gaps = getContentGaps(filtered.noResults);
  const demand = getDemandAnalysis(filtered.searchTerms, filtered.popularResources);
  const periodLabel = adminPeriodLabel(adminDashboardState.period);
  const premiumFunnel = getPremiumFunnel(filtered.rawEvents, filtered.bankOrders || [], filtered.premiumFileViews || []);
  const funnelFreshness = getFunnelFreshness(premiumFunnel);
  const dataFreshness = getAdminDataFreshness(filtered);
  const funnelLimited = !filtered.rawEvents.length && ((filtered.bankOrders || []).length || (filtered.popularResources || []).length || (filtered.searchTerms || []).length);
  const marketing = getMarketingAnalytics(filtered, premiumFunnel);
  return {
    activeSection: getActiveAdminSection(),
    data,
    filtered,
    kpis,
    revenue,
    insights,
    gaps,
    demand,
    periodLabel,
    premiumFunnel,
    funnelFreshness,
    dataFreshness,
    funnelLimited,
    marketing
  };
}

function renderAnalyticsAdmin() {
  const ctx = buildAdminRenderContext();
  analyticsContent.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar" aria-label="콘텐츠 운영센터 메뉴">
        <div class="admin-sidebar-brand">
          <span>P</span>
          <div>
            <strong>PYM Center</strong>
            <em>콘텐츠 운영센터</em>
          </div>
        </div>
        <nav class="admin-side-nav">
          ${adminSections.map((section) => `
            <a class="${ctx.activeSection.id === section.id ? "active" : ""}" href="${section.hash}">
              <strong>${escapeHtml(section.label)}</strong>
              <span>${escapeHtml(section.eyebrow)}</span>
            </a>
          `).join("")}
        </nav>
      </aside>
      <div class="admin-workspace">
        ${adminHeaderTemplate(ctx)}
        ${adminToolbarTemplate()}
        ${adminStatusTemplate()}
        <div class="admin-section-grid">
          ${adminSectionContentTemplate(ctx)}
        </div>
      </div>
    </div>
  `;
}

function adminHeaderTemplate(ctx) {
  return `
    <section class="admin-hero">
      <div class="admin-hero-row">
        <p class="eyebrow">${escapeHtml(ctx.activeSection.eyebrow)}</p>
        <button type="button" data-admin-logout>로그아웃</button>
      </div>
      <h2>${escapeHtml(ctx.activeSection.title)}</h2>
      <p>${escapeHtml(ctx.activeSection.description)}</p>
    </section>
  `;
}

function adminToolbarTemplate() {
  return `
    <div class="admin-toolbar">
      <div class="admin-period-tabs">
        ${["today", "7d", "30d", "all"].map((period) => `
          <button type="button" class="${adminDashboardState.period === period ? "active" : ""}" data-admin-period="${period}">${adminPeriodLabel(period)}</button>
        `).join("")}
      </div>
      <input data-admin-search type="search" value="${escapeHtml(adminDashboardState.query)}" placeholder="검색어, 자료명 검색" />
    </div>
  `;
}

function adminStatusTemplate() {
  return `
    ${adminDashboardState.loading ? `<p class="admin-status">Supabase 데이터를 불러오는 중이에요.</p>` : ""}
    ${adminDashboardState.error ? `<p class="admin-status error">${escapeHtml(adminDashboardState.error)}</p>` : ""}
  `;
}

function adminSectionContentTemplate(ctx) {
  if (ctx.activeSection.id === "content") return adminContentSectionTemplate(ctx);
  if (ctx.activeSection.id === "premium") return adminPremiumSectionTemplate(ctx);
  if (ctx.activeSection.id === "marketing") return adminMarketingSectionTemplate(ctx);
  if (ctx.activeSection.id === "community") return adminCommunitySectionTemplate(ctx);
  if (ctx.activeSection.id === "settings") return adminSettingsSectionTemplate(ctx);
  return adminOverviewSectionTemplate(ctx);
}

function adminFreshnessCardTemplate(ctx, extraClass = "wide") {
  return `
    <section class="admin-card admin-freshness-card admin-section-card ${extraClass}">
      <div class="admin-card-head">
        <h2>데이터 최신 상태</h2>
        <span>${ctx.periodLabel} 기준</span>
      </div>
      <div class="admin-freshness-grid">
        <article><strong>${escapeHtml(ctx.dataFreshness.overall)}</strong><span>전체 데이터 최신</span></article>
        <article><strong>${escapeHtml(ctx.dataFreshness.resource)}</strong><span>자료 조회 최신</span></article>
        <article><strong>${escapeHtml(ctx.dataFreshness.search)}</strong><span>검색 최신</span></article>
        <article><strong>${escapeHtml(ctx.funnelFreshness)}</strong><span>결제 퍼널 최신 활동</span></article>
      </div>
      <p class="admin-note">결제 퍼널 시간은 구매 여정 안의 마지막 활동만 뜻합니다. 사이트 전체 수집 상태는 전체 데이터 최신/자료 조회 최신을 기준으로 보세요.</p>
    </section>
  `;
}

function adminOverviewSectionTemplate(ctx) {
  return `
    ${adminFreshnessCardTemplate(ctx)}
    <div class="admin-summary dashboard-kpis">
      ${adminMetricTemplate("총 이벤트 수", ctx.kpis.totalEvents)}
      ${adminMetricTemplate("페이지 조회 수", ctx.kpis.totalPageViews)}
      ${adminMetricTemplate("총 자료 조회 수", ctx.kpis.totalResourceViews)}
      ${adminMetricTemplate("총 검색 수", ctx.kpis.totalSearches)}
      ${adminMetricTemplate("검색 실패 수", ctx.kpis.totalFailures)}
      ${adminMetricTemplate("댓글 수", ctx.kpis.totalComments)}
      ${adminMetricTemplate("프리미엄 방문", ctx.kpis.premiumViews)}
      ${adminMetricTemplate("최근 7일 활성 사용자", ctx.kpis.activeUsers7d)}
    </div>
    <section class="admin-card insight-card admin-section-card">
      <div class="admin-card-head">
        <h2>운영자 인사이트</h2>
        <span>${ctx.periodLabel} 기준</span>
      </div>
      <div class="admin-insights">
        ${ctx.insights.map((insight) => `<article>${escapeHtml(insight)}</article>`).join("")}
      </div>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>콘텐츠 제작 추천</h2>
        <span>실패 3회 이상</span>
      </div>
      <div class="gap-list">
        ${ctx.gaps.length ? ctx.gaps.map((row) => `
          <article>
            <strong>🔥 ${escapeHtml(row.query)}</strong>
            <span>검색 실패 ${formatCount(row.no_result_count)}회 · 사용자 수요는 있으나 콘텐츠가 부족한 주제</span>
          </article>
        `).join("") : `<p class="admin-empty">현재 기준 콘텐츠 제작 추천 항목이 없어요.</p>`}
      </div>
    </section>
    <div class="admin-summary dashboard-kpis revenue-kpis">
      ${adminMetricTemplate("오늘 수입", formatWon(ctx.revenue.todayRevenue))}
      ${adminMetricTemplate("이번 달 수입", formatWon(ctx.revenue.monthRevenue))}
      ${adminMetricTemplate("총 수입", formatWon(ctx.revenue.totalRevenue))}
      ${adminMetricTemplate("승인 주문", ctx.revenue.approvedOrders)}
    </div>
  `;
}

function adminContentSectionTemplate(ctx) {
  return `
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>인기 검색어 TOP 20</h2>
        <button type="button" data-admin-csv="searchTerms">CSV</button>
      </div>
      ${barChartTemplate(ctx.filtered.searchTerms.slice(0, 10), "query", "search_count")}
      ${adminDataTable(["검색어", "검색 횟수", "최근 검색일"], ctx.filtered.searchTerms.slice(0, 20).map((row) => [
        row.query,
        formatCount(row.search_count),
        formatAdminDate(row.last_searched_at)
      ]), "검색어 데이터가 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>검색 실패어 TOP 20</h2>
        <button type="button" data-admin-csv="noResults">CSV</button>
      </div>
      ${lineChartTemplate(ctx.filtered.noResults.slice(0, 20))}
      ${adminDataTable(["검색어", "실패 횟수", "마지막 검색일", "운영 판단"], ctx.filtered.noResults.slice(0, 20).map((row) => [
        row.query,
        formatCount(row.no_result_count),
        formatAdminDate(row.last_searched_at),
        row.no_result_count >= 3 ? `<span class="admin-badge danger">콘텐츠 제작 후보</span>` : `<span class="admin-badge">관찰</span>`
      ]), "검색 실패 데이터가 없어요")}
    </section>
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>인기 콘텐츠 TOP 20</h2>
        <button type="button" data-admin-csv="popularResources">CSV</button>
      </div>
      ${barChartTemplate(ctx.filtered.popularResources.slice(0, 10), "resource_title", "open_count")}
      ${adminDataTable(["제목", "조회수", "최근 조회일"], ctx.filtered.popularResources.slice(0, 20).map((row) => [
        row.resource_title || row.resource_id,
        formatCount(row.open_count),
        formatAdminDate(row.last_opened_at)
      ]), "인기 콘텐츠 데이터가 없어요")}
    </section>
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>자료별 조회 상세</h2>
        <span>미리보기와 원본 열기 분리</span>
      </div>
      ${adminDataTable(["자료", "미리보기", "원본 열기", "합계", "최근 조회"], ctx.filtered.resourceViewDetails.slice(0, 30).map((row) => [
        row.resource_title || row.resource_id,
        formatCount(row.preview_count),
        formatCount(row.source_open_count),
        formatCount(row.total_count),
        formatAdminDate(row.last_viewed_at)
      ]), "자료별 조회 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>콘텐츠 수요 분석</h2>
        <span>검색→조회 전환율</span>
      </div>
      ${adminDataTable(["주제", "검색량", "조회량", "전환율"], ctx.demand.slice(0, 20).map((row) => [
        row.topic,
        formatCount(row.searches),
        formatCount(row.views),
        `${row.conversion}%`
      ]), "수요 분석 데이터가 부족해요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>화면별 조회수</h2>
        <span>${ctx.periodLabel} 기준</span>
      </div>
      ${adminDataTable(["화면", "조회수", "최근 조회"], ctx.filtered.pageViews.slice(0, 20).map((row) => [
        row.page_label,
        formatCount(row.view_count),
        formatAdminDate(row.last_viewed_at)
      ]), "페이지 조회 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>운영 이벤트 조회수</h2>
        <span>배너·구매·자료 행동</span>
      </div>
      ${adminDataTable(["이벤트", "횟수", "최근 발생"], ctx.filtered.eventCounts.slice(0, 24).map((row) => [
        row.event_label,
        formatCount(row.event_count),
        formatAdminDate(row.last_event_at)
      ]), "운영 이벤트 데이터가 아직 없어요")}
    </section>
  `;
}

function adminPremiumSectionTemplate(ctx) {
  return `
    <div class="admin-summary dashboard-kpis revenue-kpis">
      ${adminMetricTemplate("오늘 수입", formatWon(ctx.revenue.todayRevenue))}
      ${adminMetricTemplate("이번 달 수입", formatWon(ctx.revenue.monthRevenue))}
      ${adminMetricTemplate("총 수입", formatWon(ctx.revenue.totalRevenue))}
      ${adminMetricTemplate("승인 주문", ctx.revenue.approvedOrders)}
      ${adminMetricTemplate("프리미엄 방문", ctx.kpis.premiumViews)}
      ${adminMetricTemplate("구매자료 열기", ctx.kpis.fileOpens)}
    </div>
    <section class="admin-card premium-funnel-card admin-section-card">
      <div class="admin-card-head">
        <h2>결제 페이지 퍼널</h2>
        <span>${ctx.periodLabel} · 퍼널 최신 활동 ${escapeHtml(ctx.funnelFreshness)}</span>
      </div>
      ${ctx.funnelLimited ? `<p class="admin-note funnel-warning">원본 이벤트 조회가 제한되어 방문/클릭 단계는 비어 보일 수 있어요. 접수·승인 단계는 구매 신청 DB 기준으로 보정해서 표시합니다.</p>` : ""}
      <div class="premium-funnel-list">
        ${ctx.premiumFunnel.map((step) => `
          <article>
            <div>
              <strong>${escapeHtml(step.label)}</strong>
              <span>이전 단계 대비 ${step.dropOff}% 이탈 · 최근 ${escapeHtml(formatAdminDate(step.lastAt))}</span>
            </div>
            <b>${formatCount(step.count)}</b>
            <em style="width: ${step.rate}%"></em>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>프리미엄 파일 열람</h2>
        <span>구매완료 이후</span>
      </div>
      ${adminDataTable(["파일", "열기", "최근 열람"], ctx.filtered.premiumFileViews.slice(0, 20).map((row) => [
        row.file_label,
        formatCount(row.open_count),
        formatAdminDate(row.last_opened_at)
      ]), "프리미엄 파일 열람 데이터가 아직 없어요")}
    </section>
    ${bankTransferOrdersAdminTemplate()}
    ${premiumOperatingSettingsAdminTemplate()}
    ${premiumTestToolsAdminTemplate()}
  `;
}

function adminMarketingSectionTemplate(ctx) {
  const marketing = ctx.marketing;
  return `
    <div class="admin-summary dashboard-kpis revenue-kpis marketing-kpis">
      ${adminMetricTemplate("홈배너 CTR", `${marketing.bannerCtr}%`)}
      ${adminMetricTemplate("구매 전환율", `${marketing.purchaseConversion}%`)}
      ${adminMetricTemplate("결제 완료율", `${marketing.approvalConversion}%`)}
      ${adminMetricTemplate("기간 매출", formatWon(marketing.periodRevenue))}
      ${adminMetricTemplate("광고비", formatWon(marketing.adSpend))}
      ${adminMetricTemplate("ROAS", marketing.roasLabel)}
      ${adminMetricTemplate("CPC", marketing.cpcLabel)}
      ${adminMetricTemplate("CPA", marketing.cpaLabel)}
    </div>
    <section class="admin-card admin-section-card marketing-spend-card">
      <div class="admin-card-head">
        <h2>광고비 입력</h2>
        <span>${ctx.periodLabel} 기준 ROAS 계산</span>
      </div>
      <form class="marketing-spend-form" data-marketing-spend-form>
        <label>
          <span>${escapeHtml(ctx.periodLabel)} 광고비</span>
          <input name="adSpend" inputmode="numeric" value="${marketing.adSpend || ""}" placeholder="예: 50000" />
        </label>
        <button type="submit">저장</button>
      </form>
      <p class="admin-note">광고비를 넣으면 기간 매출을 기준으로 ROAS, CPC, CPA가 계산됩니다. 광고비는 이 브라우저에 기간별로 저장됩니다.</p>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>홈배너 성과</h2>
        <span>노출→클릭</span>
      </div>
      ${adminDataTable(["구분", "노출", "클릭", "CTR", "최근 활동"], marketing.bannerRows.map((row) => [
        row.label,
        formatCount(row.impressions),
        formatCount(row.clicks),
        `${row.ctr}%`,
        formatAdminDate(row.lastAt)
      ]), "홈배너 데이터가 아직 없어요")}
    </section>
    <section class="admin-card premium-funnel-card admin-section-card">
      <div class="admin-card-head">
        <h2>결제 이탈 구간</h2>
        <span>가장 많이 빠지는 단계</span>
      </div>
      <div class="premium-funnel-list">
        ${marketing.dropOffRows.map((step) => `
          <article>
            <div>
              <strong>${escapeHtml(step.label)}</strong>
              <span>이전 단계 대비 ${step.dropOff}% 이탈 · 최근 ${escapeHtml(formatAdminDate(step.lastAt))}</span>
            </div>
            <b>${formatCount(step.count)}</b>
            <em style="width: ${step.rate}%"></em>
          </article>
        `).join("") || `<p class="admin-empty">결제 퍼널 데이터가 아직 없어요.</p>`}
      </div>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>클릭률 좋은 행동</h2>
        <span>CTA 이벤트 순위</span>
      </div>
      ${adminDataTable(["행동", "클릭/발생", "최근 발생"], marketing.topClicks.map((row) => [
        row.label,
        formatCount(row.count),
        formatAdminDate(row.lastAt)
      ]), "클릭 이벤트 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>이탈 후보 화면</h2>
        <span>세션 마지막 행동 기준</span>
      </div>
      ${adminDataTable(["마지막 화면", "세션 수", "최근 활동"], marketing.exitPages.map((row) => [
        row.label,
        formatCount(row.count),
        formatAdminDate(row.lastAt)
      ]), "세션 종료 화면 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>유입 소스</h2>
        <span>UTM/referrer 기준</span>
      </div>
      ${adminDataTable(["소스", "방문", "최근 방문"], marketing.trafficSources.map((row) => [
        row.label,
        formatCount(row.count),
        formatAdminDate(row.lastAt)
      ]), "유입 소스 데이터가 아직 없어요")}
    </section>
    <section class="admin-card insight-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>마케팅 운영 인사이트</h2>
        <span>${ctx.periodLabel} 기준</span>
      </div>
      <div class="admin-insights">
        ${marketing.insights.map((insight) => `<article>${escapeHtml(insight)}</article>`).join("")}
      </div>
    </section>
  `;
}

function adminCommunitySectionTemplate(ctx) {
  const comments = (ctx.filtered.comments || []).slice(0, 80);
  const trendCount = comments.filter((row) => row.comment_type === "trend").length;
  const resourceCount = comments.filter((row) => row.comment_type === "resource").length;
  const totalLikes = comments.reduce((sum, row) => sum + Number(row.likes || 0), 0);
  return `
    <div class="admin-summary dashboard-kpis">
      ${adminMetricTemplate("전체 댓글", ctx.kpis.totalComments)}
      ${adminMetricTemplate("동향 댓글", trendCount)}
      ${adminMetricTemplate("자료 댓글", resourceCount)}
      ${adminMetricTemplate("댓글 좋아요", totalLikes)}
    </div>
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>최근 댓글</h2>
        <span>동향·자료 통합</span>
      </div>
      ${adminDataTable(["구분", "대상", "닉네임", "내용", "좋아요", "작성일"], comments.map((row) => [
        row.comment_type === "resource" ? "자료" : "동향",
        row.article_id || row.resource_id || "-",
        row.nickname || "익명",
        row.body || "-",
        formatCount(row.likes || 0),
        formatAdminDate(row.created_at)
      ]), "댓글 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>반응 관리 메모</h2>
        <span>운영 가이드</span>
      </div>
      <div class="admin-insights">
        <article>댓글이 늘어나는 자료는 다음 인스타 캐러셀이나 추가 해설 콘텐츠 후보로 올려두세요.</article>
        <article>질문형 댓글은 PYM Agent 답변 품질 개선용 질문 세트로 모으면 좋아요.</article>
      </div>
    </section>
  `;
}

function adminSettingsSectionTemplate(ctx) {
  return `
    ${adminFreshnessCardTemplate(ctx)}
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>데이터 연결</h2>
        <span>${supabaseConfig.enabled ? "Supabase 연결됨" : "미연결"}</span>
      </div>
      <p class="admin-note">검색어 길이 2 이하의 노이즈는 기본 숨김 처리됩니다. 원본 이벤트 조회가 제한되어도 Supabase 집계 테이블을 우선 읽어 운영 숫자를 표시합니다.</p>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>수집 상태</h2>
        <span>${ctx.periodLabel} 기준</span>
      </div>
      <div class="admin-freshness-grid compact">
        <article><strong>${escapeHtml(ctx.dataFreshness.overall)}</strong><span>마지막 전체 이벤트</span></article>
        <article><strong>${escapeHtml(ctx.dataFreshness.resource)}</strong><span>마지막 자료 조회</span></article>
        <article><strong>${escapeHtml(ctx.dataFreshness.search)}</strong><span>마지막 검색</span></article>
        <article><strong>${escapeHtml(ctx.funnelFreshness)}</strong><span>마지막 결제 퍼널</span></article>
      </div>
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>운영 도구</h2>
        <span>Export · Test</span>
      </div>
      <div class="admin-actions inline">
        <button type="button" data-admin-refresh>데이터 새로고침</button>
        <button type="button" data-admin-export>JSON 내보내기</button>
        <button type="button" data-supabase-test>Supabase 테스트</button>
      </div>
    </section>
  `;
}

function renderAnalyticsAdminLegacy() {
  const data = adminDashboardState.data || buildEmptyAdminDashboardData();
  const filtered = filterAdminData(data);
  const kpis = getAdminKpis(filtered);
  const revenue = getRevenueKpis(data.bankOrders || []);
  const insights = getAdminInsights(filtered);
  const gaps = getContentGaps(filtered.noResults);
  const demand = getDemandAnalysis(filtered.searchTerms, filtered.popularResources);
  const periodLabel = adminPeriodLabel(adminDashboardState.period);
  const premiumFunnel = getPremiumFunnel(filtered.rawEvents, filtered.bankOrders || [], filtered.premiumFileViews || []);
  const funnelFreshness = getFunnelFreshness(premiumFunnel);
  const dataFreshness = getAdminDataFreshness(filtered);
  const funnelLimited = !filtered.rawEvents.length && ((filtered.bankOrders || []).length || (filtered.popularResources || []).length || (filtered.searchTerms || []).length);

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
    <section class="admin-card admin-freshness-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>데이터 최신 상태</h2>
        <span>${periodLabel} 기준</span>
      </div>
      <div class="admin-freshness-grid">
        <article><strong>${escapeHtml(dataFreshness.overall)}</strong><span>전체 데이터 최신</span></article>
        <article><strong>${escapeHtml(dataFreshness.resource)}</strong><span>자료 조회 최신</span></article>
        <article><strong>${escapeHtml(dataFreshness.search)}</strong><span>검색 최신</span></article>
        <article><strong>${escapeHtml(funnelFreshness)}</strong><span>결제 퍼널 최신 활동</span></article>
      </div>
      <p class="admin-note">결제 퍼널 시간은 구매 여정 안의 마지막 활동만 뜻합니다. 사이트 전체 수집 상태는 전체 데이터 최신/자료 조회 최신을 기준으로 보세요.</p>
    </section>
    <div class="admin-summary dashboard-kpis revenue-kpis">
      ${adminMetricTemplate("오늘 수입", formatWon(revenue.todayRevenue))}
      ${adminMetricTemplate("이번 달 수입", formatWon(revenue.monthRevenue))}
      ${adminMetricTemplate("총 수입", formatWon(revenue.totalRevenue))}
      ${adminMetricTemplate("승인 주문", revenue.approvedOrders)}
    </div>
    <div class="admin-summary dashboard-kpis">
      ${adminMetricTemplate("총 이벤트 수", kpis.totalEvents)}
      ${adminMetricTemplate("페이지 조회 수", kpis.totalPageViews)}
      ${adminMetricTemplate("총 자료 조회 수", kpis.totalResourceViews)}
      ${adminMetricTemplate("프리미엄 방문", kpis.premiumViews)}
      ${adminMetricTemplate("홈배너 클릭", kpis.bannerClicks)}
      ${adminMetricTemplate("구매자료 열기", kpis.fileOpens)}
      ${adminMetricTemplate("총 검색 수", kpis.totalSearches)}
      ${adminMetricTemplate("검색 실패 수", kpis.totalFailures)}
      ${adminMetricTemplate("댓글 수", kpis.totalComments)}
      ${adminMetricTemplate("최근 7일 활성 사용자", kpis.activeUsers7d)}
    </div>
    <section class="admin-card premium-funnel-card admin-section-card">
      <div class="admin-card-head">
        <h2>결제 페이지 퍼널</h2>
        <span>${periodLabel} · 퍼널 최신 활동 ${escapeHtml(funnelFreshness)}</span>
      </div>
      ${funnelLimited ? `<p class="admin-note funnel-warning">원본 이벤트 조회가 제한되어 방문/클릭 단계는 비어 보일 수 있어요. 접수·승인 단계는 구매 신청 DB 기준으로 보정해서 표시합니다.</p>` : ""}
      <div class="premium-funnel-list">
        ${premiumFunnel.map((step) => `
          <article>
            <div>
              <strong>${escapeHtml(step.label)}</strong>
              <span>이전 단계 대비 ${step.dropOff}% 이탈 · 최근 ${escapeHtml(formatAdminDate(step.lastAt))}</span>
            </div>
            <b>${formatCount(step.count)}</b>
            <em style="width: ${step.rate}%"></em>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="admin-card insight-card admin-section-card">
      <div class="admin-card-head">
        <h2>운영자 인사이트</h2>
        <span>${periodLabel} 기준</span>
      </div>
      <div class="admin-insights">
        ${insights.map((insight) => `<article>${escapeHtml(insight)}</article>`).join("")}
      </div>
    </section>
    <section class="admin-card admin-section-card">
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
    <section class="admin-card admin-section-card">
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
    <section class="admin-card admin-section-card wide">
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
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>자료별 조회 상세</h2>
        <span>미리보기와 원본 열기 분리</span>
      </div>
      ${adminDataTable(["자료", "미리보기", "원본 열기", "합계", "최근 조회"], filtered.resourceViewDetails.slice(0, 30).map((row) => [
        row.resource_title || row.resource_id,
        formatCount(row.preview_count),
        formatCount(row.source_open_count),
        formatCount(row.total_count),
        formatAdminDate(row.last_viewed_at)
      ]), "자료별 조회 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>화면별 조회수</h2>
        <span>${periodLabel} 기준</span>
      </div>
      ${adminDataTable(["화면", "조회수", "최근 조회"], filtered.pageViews.slice(0, 20).map((row) => [
        row.page_label,
        formatCount(row.view_count),
        formatAdminDate(row.last_viewed_at)
      ]), "페이지 조회 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>운영 이벤트 조회수</h2>
        <span>배너·구매·자료 행동</span>
      </div>
      ${adminDataTable(["이벤트", "횟수", "최근 발생"], filtered.eventCounts.slice(0, 24).map((row) => [
        row.event_label,
        formatCount(row.event_count),
        formatAdminDate(row.last_event_at)
      ]), "운영 이벤트 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
      <div class="admin-card-head">
        <h2>프리미엄 파일 열람</h2>
        <span>구매완료 이후</span>
      </div>
      ${adminDataTable(["파일", "열기", "최근 열람"], filtered.premiumFileViews.slice(0, 20).map((row) => [
        row.file_label,
        formatCount(row.open_count),
        formatAdminDate(row.last_opened_at)
      ]), "프리미엄 파일 열람 데이터가 아직 없어요")}
    </section>
    <section class="admin-card admin-section-card">
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
    <section class="admin-card admin-section-card">
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
    ${premiumOperatingSettingsAdminTemplate()}
    ${premiumTestToolsAdminTemplate()}
    ${bankTransferOrdersAdminTemplate()}
    <section class="admin-card admin-section-card wide">
      <div class="admin-card-head">
        <h2>데이터 연결</h2>
        <span>${supabaseConfig.enabled ? "Supabase 연결됨" : "미연결"}</span>
      </div>
      <p class="admin-note">검색어 길이 2 이하의 노이즈는 기본 숨김 처리됩니다. 원본 이벤트 조회가 제한되어도 Supabase 집계 테이블을 우선 읽어 운영 숫자를 표시합니다.</p>
    </section>
    <div class="admin-actions">
      <button type="button" data-admin-refresh>데이터 새로고침</button>
      <button type="button" data-admin-export>JSON 내보내기</button>
      <button type="button" data-supabase-test>Supabase 테스트</button>
    </div>
  `;
}

function premiumTestToolsAdminTemplate() {
  const productId = "neuro-series-6";
  const purchased = isPremiumPurchased(productId);
  const accessAt = safeStorageGet(`pym.premiumAccessAt.${productId}`) || "";
  return `
    <section class="admin-card premium-test-card">
      <div class="admin-card-head">
        <h2>프리미엄 테스트 도구</h2>
        <span>${purchased ? "현재 브라우저 구매완료" : "현재 브라우저 미구매"}</span>
      </div>
      <p class="admin-note">이 도구는 이 브라우저에서만 작동합니다. 공개 판매 페이지에는 테스트 버튼이 보이지 않습니다.</p>
      <div class="premium-test-state">
        <article><strong>${purchased ? "OPEN" : "LOCKED"}</strong><span>열람 상태</span></article>
        <article><strong>${accessAt ? escapeHtml(formatAdminDate(accessAt)) : "-"}</strong><span>열림 시각</span></article>
      </div>
      <div class="premium-test-actions">
        <button type="button" data-premium-test-complete="${productId}">내 브라우저 구매완료로 열기</button>
        <button type="button" data-premium-test-reset="${productId}">내 브라우저 구매상태 초기화</button>
        <button type="button" data-premium-test-open>프리미엄 페이지에서 확인</button>
      </div>
    </section>
  `;
}

function premiumOperatingSettingsAdminTemplate() {
  const account = getBankTransferAccount();
  const links = getPremiumFileLinks();
  return `
    <section class="admin-card premium-operating-card">
      <div class="admin-card-head">
        <h2>계좌/자료 링크 설정</h2>
        <span>실사용 필수</span>
      </div>
      <form class="premium-operating-form" data-premium-operating-form>
        <div class="premium-operating-grid">
          <label><span>은행</span><input name="bank" value="${escapeHtml(account.bank)}" placeholder="예: 카카오뱅크" /></label>
          <label><span>예금주</span><input name="holder" value="${escapeHtml(account.holder)}" placeholder="예: 박용민" /></label>
          <label><span>계좌번호</span><input name="number" value="${escapeHtml(account.number)}" placeholder="계좌번호" /></label>
          <label><span>금액</span><input name="amount" value="${escapeHtml(account.amount)}" placeholder="9,900원" /></label>
        </div>
        <div class="premium-link-grid">
          ${premiumDownloadFiles.map((file) => `
            <label>
              <span>${escapeHtml(file.number)}. ${escapeHtml(file.title)}</span>
              <input name="file_${escapeHtml(file.number)}" value="${escapeHtml(links[file.number] || links[file.fileName] || "")}" placeholder="Drive 또는 Supabase 파일 링크" />
            </label>
          `).join("")}
        </div>
        <button type="submit">계좌/자료 링크 저장</button>
      </form>
      <p class="admin-note">계좌와 유료 자료 링크는 관리자 인증을 거친 서버에서만 저장·조회됩니다. 공개 화면에는 계좌 정보만 전달됩니다.</p>
    </section>
  `;
}

async function savePremiumOperatingSettings(form) {
  const formData = new FormData(form);
  const account = {
    bank: String(formData.get("bank") || "").trim() || DEFAULT_BANK_TRANSFER_ACCOUNT.bank,
    holder: String(formData.get("holder") || "").trim() || DEFAULT_BANK_TRANSFER_ACCOUNT.holder,
    number: String(formData.get("number") || "").trim() || DEFAULT_BANK_TRANSFER_ACCOUNT.number,
    amount: String(formData.get("amount") || "").trim() || DEFAULT_BANK_TRANSFER_ACCOUNT.amount
  };
  const fileLinks = {};
  premiumDownloadFiles.forEach((file) => {
    const link = String(formData.get(`file_${file.number}`) || "").trim();
    if (link) fileLinks[file.number] = link;
  });

  safeStorageSet("pym.bankTransferAccount", JSON.stringify(account));
  safeStorageSet("pym.premiumFileLinks", JSON.stringify(fileLinks));
  trackEvent("premium_operating_settings_update", { updatedAt: new Date().toISOString(), fileCount: Object.keys(fileLinks).length });
  const button = form.querySelector("button[type='submit']");
  if (button) {
    button.disabled = true;
    button.textContent = "저장 중...";
  }

  try {
    await adminRequest("save-settings", { account, fileLinks });
    showToast("계좌와 자료 링크를 안전하게 저장했어요");
  } catch (error) {
    showToast(error.message || "운영 설정 저장에 실패했습니다.");
  }

  if (button) {
    button.disabled = false;
    button.textContent = "계좌/자료 링크 저장";
  }
  renderAnalyticsAdmin();
  renderPremiumScreen();
}

function bankTransferOrdersAdminTemplate() {
  const allOrders = getAdminBankTransferOrders();
  const orders = getFilteredAdminBankTransferOrders();
  const pendingCount = allOrders.filter((order) => order.status !== "approved").length;
  const approvedCount = allOrders.filter((order) => order.status === "approved").length;
  const orderRevenue = getRevenueKpis(allOrders);
  const visibleOrders = orders.slice(0, 100);
  return `
    <section class="admin-card bank-admin-card wide">
      <div class="admin-card-head">
        <h2>계좌이체 구매 신청</h2>
        <span>${allOrders.length ? `전체 ${allOrders.length}건` : "신청 없음"}</span>
      </div>
      <div class="bank-admin-summary revenue-summary">
        <article><strong>${formatWon(orderRevenue.todayRevenue)}</strong><span>오늘 수입</span></article>
        <article><strong>${formatWon(orderRevenue.monthRevenue)}</strong><span>이번 달 수입</span></article>
        <article><strong>${formatWon(orderRevenue.totalRevenue)}</strong><span>총 수입</span></article>
        <article><strong>${formatCount(pendingCount)}</strong><span>입금 확인 대기</span></article>
        <article><strong>${formatCount(approvedCount)}</strong><span>승인완료</span></article>
        <article><strong>${formatCount(orders.length)}</strong><span>현재 표시</span></article>
      </div>
      <div class="bank-admin-toolbar">
        <input data-admin-order-search type="search" value="${escapeHtml(adminOrderState.query)}" placeholder="주문번호, 입금자명, 이메일, 휴대폰 뒤 4자리 검색" />
        <select data-admin-order-status>
          <option value="all" ${adminOrderState.status === "all" ? "selected" : ""}>전체 상태</option>
          <option value="pending" ${adminOrderState.status === "pending" ? "selected" : ""}>대기</option>
          <option value="approved" ${adminOrderState.status === "approved" ? "selected" : ""}>승인완료</option>
        </select>
      </div>
      ${visibleOrders.length ? `
        <div class="bank-admin-table-wrap">
          <table class="bank-admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>입금자</th>
                <th>연락</th>
                <th>금액</th>
                <th>상태</th>
                <th>신청일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${visibleOrders.map((order) => `
                <tr>
                  <td><strong>${escapeHtml(order.id)}</strong>${order.memo ? `<span>${escapeHtml(order.memo)}</span>` : ""}</td>
                  <td>${escapeHtml(order.depositor)}</td>
                  <td><span>${escapeHtml(order.email)}</span><em>휴대폰 뒤 ${escapeHtml(order.phoneLast4 || "----")}</em></td>
                  <td>${escapeHtml(order.amount)}</td>
                  <td><span class="bank-status ${escapeHtml(order.status)}">${order.status === "approved" ? "승인완료" : "대기"}</span></td>
                  <td>${escapeHtml(formatAdminDate(order.createdAt))}</td>
                  <td>
                    <div class="bank-admin-actions compact">
                      <button type="button" data-bank-order-copy="${escapeHtml(order.id)}">복사</button>
                      ${order.status === "approved" ? "" : `<button type="button" data-bank-order-approve="${escapeHtml(order.id)}">승인</button>`}
                      <button type="button" class="danger" data-bank-order-delete="${escapeHtml(order.id)}">삭제</button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${orders.length > visibleOrders.length ? `<p class="admin-note">검색 결과가 많아 최근 100건만 표시 중이에요. 검색어 또는 상태 필터로 좁혀보세요.</p>` : ""}
      ` : `<p class="admin-empty">조건에 맞는 구매 신청이 없어요.</p>`}
    </section>
  `;
}

function adminMetricTemplate(label, value) {
  const displayValue = typeof value === "number" ? formatCount(value) : String(value || "0");
  return `
    <article>
      <strong>${escapeHtml(displayValue)}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `;
}

async function loadAdminDashboardData() {
  if (!adminUsername || !adminSecret) {
    renderAdminLogin();
    return;
  }
  adminDashboardState.loading = true;
  adminDashboardState.error = "";
  renderAnalyticsAdmin();
  try {
    const payload = await adminRequest("dashboard");
    applyAdminPayload(payload);
  } catch (error) {
    if (error.status === 401) {
      renderAdminLogin(error.message);
      return;
    }
    adminDashboardState.data = buildAdminDashboardDataFromEvents(readAnalyticsEvents(), []);
    adminDashboardState.error = "관리자 서버에서 데이터를 불러오지 못해 이 브라우저의 로컬 기록만 표시합니다.";
  } finally {
    adminDashboardState.loading = false;
    if (adminUsername && adminSecret) renderAnalyticsAdmin();
  }
}

function applyAdminPayload(payload = {}) {
  const rawEvents = Array.isArray(payload.rawEvents) ? payload.rawEvents : [];
  const trendComments = Array.isArray(payload.trendComments) ? payload.trendComments : [];
  const resourceComments = Array.isArray(payload.resourceComments) ? payload.resourceComments : [];
  const bankOrders = Array.isArray(payload.bankOrders) ? payload.bankOrders : [];
  const mergedRawEvents = mergeAdminEvents(rawEvents, readAnalyticsEvents());
  const comments = [
    ...trendComments.map((row) => ({ ...row, comment_type: "trend" })),
    ...resourceComments.map((row) => ({ ...row, comment_type: "resource", article_id: row.resource_id }))
  ];
  adminDashboardState.data = buildAdminDashboardDataFromEvents(mergedRawEvents, comments, bankOrders, {
    exactCounts: payload.exactCounts || {}
  });
  adminDashboardState.error = "";
  if (payload.settings?.account) safeStorageSet("pym.bankTransferAccount", JSON.stringify(payload.settings.account));
  if (payload.settings?.fileLinks) safeStorageSet("pym.premiumFileLinks", JSON.stringify(payload.settings.fileLinks));
}

function mergeAdminEvents(...sources) {
  const lookup = new Map();
  sources.flat().map(normalizeAdminEvent).forEach((event) => {
    if (!event.created_at) return;
    const key = event.event_id || [event.event_name, event.created_at, JSON.stringify(event.properties || {})].join(":");
    lookup.set(key, event);
  });
  return Array.from(lookup.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
  return buildAdminDashboardDataFromEvents(readAnalyticsEvents(), []);
}

function buildAdminDashboardDataFromEvents(events, comments = [], bankOrders = [], aggregates = {}) {
  const rawEvents = events.map(normalizeAdminEvent).filter((event) => event.created_at);
  const eventOrders = extractBankTransferOrdersFromEvents(rawEvents);
  const searchTerms = mergeSearchTermRows(aggregates.searchTerms || [], aggregateSearchTerms(rawEvents));
  const noResults = mergeNoResultRows(aggregates.noResults || [], aggregateNoResultTerms(rawEvents));
  const popularResources = mergePopularResourceRows(aggregates.popularResources || [], aggregatePopularResources(rawEvents));
  return {
    rawEvents,
    allRawEvents: rawEvents,
    comments,
    bankOrders: mergeBankTransferOrders(bankOrders, eventOrders),
    searchTerms,
    noResults,
    popularResources,
    resourceViewDetails: mergeResourceViewDetails(popularResources, aggregateResourceViewDetails(rawEvents)),
    pageViews: aggregatePageViews(rawEvents),
    eventCounts: aggregateOperatingEventCounts(rawEvents),
    premiumFileViews: aggregatePremiumFileViews(rawEvents),
    exactCounts: aggregates.exactCounts || {}
  };
}

function normalizeAdminEvent(event) {
  return {
    event_id: event.event_id || event.id || "",
    event_name: event.event_name || event.name || "",
    anonymous_user_id: event.anonymous_user_id || event.userId || "",
    session_id: event.session_id || event.sessionId || "",
    path: event.path || "",
    hash: event.hash || "",
    referrer: event.referrer || "",
    created_at: event.created_at || event.createdAt || "",
    properties: event.properties || {}
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

  const periodEvents = (data.rawEvents || [])
    .map(normalizeAdminEvent)
    .filter((row) => dateInRange(row.created_at));
  const periodComments = (data.comments || [])
    .filter((row) => dateInRange(row.created_at))
    .filter((row) => matches(row.body, row.nickname, row.article_id, row.resource_id));
  const searchTerms = filterDatedRows(data.searchTerms || aggregateSearchTerms(periodEvents), "last_searched_at", dateInRange);
  const noResults = filterDatedRows(data.noResults || aggregateNoResultTerms(periodEvents), "last_searched_at", dateInRange);
  const popularResources = filterDatedRows(data.popularResources || aggregatePopularResources(periodEvents), "last_opened_at", dateInRange);
  const resourceViewDetails = filterDatedRows(data.resourceViewDetails || mergeResourceViewDetails(popularResources, aggregateResourceViewDetails(periodEvents)), "last_viewed_at", dateInRange);

  return {
    searchTerms: searchTerms
      .filter((row) => isMeaningfulQuery(row.query))
      .filter((row) => matches(row.query))
      .sort((a, b) => b.search_count - a.search_count || new Date(b.last_searched_at) - new Date(a.last_searched_at)),
    noResults: noResults
      .filter((row) => isMeaningfulQuery(row.query))
      .filter((row) => matches(row.query))
      .sort((a, b) => b.no_result_count - a.no_result_count || new Date(b.last_searched_at) - new Date(a.last_searched_at)),
    popularResources: popularResources
      .filter((row) => matches(row.resource_title, row.resource_id))
      .sort((a, b) => b.open_count - a.open_count || new Date(b.last_opened_at) - new Date(a.last_opened_at)),
    resourceViewDetails: resourceViewDetails
      .filter((row) => matches(row.resource_title, row.resource_id))
      .sort((a, b) => b.total_count - a.total_count || new Date(b.last_viewed_at) - new Date(a.last_viewed_at)),
    pageViews: aggregatePageViews(periodEvents)
      .filter((row) => matches(row.page_label, row.page_key))
      .sort((a, b) => b.view_count - a.view_count || new Date(b.last_viewed_at) - new Date(a.last_viewed_at)),
    eventCounts: aggregateOperatingEventCounts(periodEvents)
      .filter((row) => matches(row.event_label, row.event_name))
      .sort((a, b) => b.event_count - a.event_count || new Date(b.last_event_at) - new Date(a.last_event_at)),
    premiumFileViews: aggregatePremiumFileViews(periodEvents)
      .filter((row) => matches(row.file_label, row.file_number))
      .sort((a, b) => b.open_count - a.open_count || new Date(b.last_opened_at) - new Date(a.last_opened_at)),
    bankOrders: (data.bankOrders || [])
      .filter((row) => dateInRange(row.createdAt || row.approvedAt || row.updatedAt))
      .filter((row) => matches(row.id, row.depositor, row.email, row.phoneLast4, row.status)),
    comments: periodComments,
    rawEvents: periodEvents,
    allRawEvents: data.allRawEvents || data.rawEvents || [],
    exactCounts: adminDashboardState.period === "all" ? data.exactCounts || {} : {}
  };
}

function filterDatedRows(rows, dateKeyName, dateInRange) {
  return (rows || []).filter((row) => dateInRange(row[dateKeyName]));
}

function mergeSearchTermRows(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach((row) => {
    const query = normalizeSearchQuery(row.query);
    if (!query) return;
    const current = map.get(query) || { query, search_count: 0, last_searched_at: row.last_searched_at };
    current.search_count = Math.max(Number(current.search_count || 0), Number(row.search_count || 0));
    if (!current.last_searched_at || new Date(row.last_searched_at || 0) > new Date(current.last_searched_at || 0)) current.last_searched_at = row.last_searched_at;
    map.set(query, current);
  });
  return Array.from(map.values());
}

function mergeNoResultRows(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach((row) => {
    const query = normalizeSearchQuery(row.query);
    if (!query) return;
    const current = map.get(query) || { query, no_result_count: 0, last_searched_at: row.last_searched_at };
    current.no_result_count = Math.max(Number(current.no_result_count || 0), Number(row.no_result_count || 0));
    if (!current.last_searched_at || new Date(row.last_searched_at || 0) > new Date(current.last_searched_at || 0)) current.last_searched_at = row.last_searched_at;
    map.set(query, current);
  });
  return Array.from(map.values());
}

function mergePopularResourceRows(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach((row) => {
    const resourceId = String(row.resource_id || "").trim();
    if (!resourceId) return;
    const resource = resources.find((item) => item.id === resourceId);
    const current = map.get(resourceId) || { resource_id: resourceId, resource_title: row.resource_title || resource?.displayTitle || resourceId, open_count: 0, last_opened_at: row.last_opened_at };
    current.open_count = Math.max(Number(current.open_count || 0), Number(row.open_count || 0));
    current.resource_title = row.resource_title || current.resource_title || resource?.displayTitle || resourceId;
    if (!current.last_opened_at || new Date(row.last_opened_at || 0) > new Date(current.last_opened_at || 0)) current.last_opened_at = row.last_opened_at;
    map.set(resourceId, current);
  });
  return Array.from(map.values());
}

function mergeResourceViewDetails(popularResources = [], detailRows = []) {
  const map = new Map();
  popularResources.forEach((row) => {
    if (!row.resource_id) return;
    map.set(row.resource_id, {
      resource_id: row.resource_id,
      resource_title: row.resource_title || row.resource_id,
      preview_count: 0,
      source_open_count: 0,
      total_count: Number(row.open_count || 0),
      last_viewed_at: row.last_opened_at
    });
  });
  detailRows.forEach((row) => {
    const current = map.get(row.resource_id) || row;
    map.set(row.resource_id, {
      ...current,
      ...row,
      total_count: Math.max(Number(current.total_count || 0), Number(row.total_count || 0)),
      preview_count: Number(row.preview_count || current.preview_count || 0),
      source_open_count: Number(row.source_open_count || current.source_open_count || 0),
      last_viewed_at: new Date(row.last_viewed_at || 0) > new Date(current.last_viewed_at || 0) ? row.last_viewed_at : current.last_viewed_at
    });
  });
  return Array.from(map.values());
}

function aggregateSearchTerms(events) {
  return aggregateBy(events.filter((event) => ["search", "search_no_result"].includes(event.event_name)), (event) => normalizeSearchQuery(event.properties?.query), {
    countKey: "search_count",
    dateKey: "last_searched_at"
  });
}

function aggregateNoResultTerms(events) {
  return aggregateBy(events.filter((event) => event.event_name === "search_no_result"), (event) => normalizeSearchQuery(event.properties?.query), {
    countKey: "no_result_count",
    dateKey: "last_searched_at"
  });
}

function aggregatePopularResources(events) {
  const grouped = new Map();
  events
    .filter((event) => ["resource_open", "drive_open", "trend_article_open", "premium_secure_file_click"].includes(event.event_name))
    .forEach((event) => {
      const resourceId = event.properties?.resourceId || event.properties?.articleId || event.properties?.fileNumber || event.properties?.url || "unknown";
      const title = event.properties?.resourceTitle || event.properties?.articleTitle || event.properties?.title || event.properties?.fileTitle || (event.event_name === "premium_secure_file_click" ? `프리미엄 자료 ${resourceId}` : resourceId);
      if (!resourceId || resourceId === "unknown") return;
      const current = grouped.get(resourceId) || { resource_id: resourceId, resource_title: title, open_count: 0, last_opened_at: event.created_at };
      current.open_count += 1;
      current.resource_title = current.resource_title || title;
      if (new Date(event.created_at).getTime() > new Date(current.last_opened_at).getTime()) {
        current.last_opened_at = event.created_at;
      }
      grouped.set(resourceId, current);
    });
  return Array.from(grouped.values());
}

function aggregateResourceViewDetails(events) {
  const grouped = new Map();
  events
    .filter((event) => ["resource_open", "drive_open"].includes(event.event_name))
    .forEach((event) => {
      const resourceId = event.properties?.resourceId;
      if (!resourceId) return;
      const resource = resources.find((item) => item.id === resourceId);
      const title = event.properties?.resourceTitle || resource?.displayTitle || resourceId;
      const current = grouped.get(resourceId) || {
        resource_id: resourceId,
        resource_title: title,
        preview_count: 0,
        source_open_count: 0,
        total_count: 0,
        last_viewed_at: event.created_at
      };
      if (event.event_name === "resource_open") current.preview_count += 1;
      if (event.event_name === "drive_open") current.source_open_count += 1;
      current.total_count += 1;
      current.resource_title = title;
      if (new Date(event.created_at).getTime() > new Date(current.last_viewed_at).getTime()) {
        current.last_viewed_at = event.created_at;
      }
      grouped.set(resourceId, current);
    });
  return Array.from(grouped.values());
}

function aggregatePageViews(events) {
  return aggregateBy(events.filter((event) => event.event_name === "page_view"), (event) => normalizePageKey(event.properties?.hash || event.hash || "#home"), {
    countKey: "view_count",
    dateKey: "last_viewed_at",
    labelKey: "page_key"
  }).map((row) => ({ ...row, page_key: row.page_key || row.query, page_label: pageLabel(row.page_key || row.query) }));
}

function aggregateOperatingEventCounts(events) {
  const labels = operatingEventLabels();
  const grouped = aggregateBy(events.filter((event) => labels[event.event_name]), (event) => event.event_name, {
    countKey: "event_count",
    dateKey: "last_event_at",
    labelKey: "event_name"
  });
  return grouped.map((row) => ({ ...row, event_name: row.event_name || row.query, event_label: labels[row.event_name || row.query] || row.event_name || row.query }));
}

function aggregatePremiumFileViews(events) {
  return aggregateBy(events.filter((event) => event.event_name === "premium_secure_file_click"), (event) => String(event.properties?.fileNumber || "unknown"), {
    countKey: "open_count",
    dateKey: "last_opened_at",
    labelKey: "file_number"
  }).map((row) => {
    const number = row.file_number || row.query;
    const file = premiumDownloadFiles.find((item) => String(item.number) === String(number));
    return { ...row, file_number: number, file_label: file ? `${file.number}. ${file.title}` : `프리미엄 자료 ${number}` };
  });
}

function normalizePageKey(value) {
  const hash = String(value || "#home").trim();
  if (!hash || hash === "#") return "#home";
  if (hash.startsWith("#")) return hash;
  return `#${hash}`;
}

function pageLabel(key) {
  const normalized = normalizePageKey(key);
  const map = {
    "#home": "홈",
    "#search": "검색",
    "#trend": "최근 간호 동향",
    "#premium": "유료 구매 페이지",
    "#premiumAccess": "구매완료 자료",
    "#admin": "운영센터 개요",
    "#admin-content": "운영센터 콘텐츠/검색",
    "#admin-premium": "운영센터 프리미엄/판매",
    "#admin-marketing": "운영센터 마케팅/ROAS",
    "#admin-community": "운영센터 커뮤니티/댓글",
    "#admin-settings": "운영센터 설정/데이터",
    "#agent": "PYM Agent"
  };
  return map[normalized] || normalized.replace(/^#/, "") || "홈";
}

function operatingEventLabels() {
  return {
    page_view: "페이지 조회",
    premium_view: "유료 페이지 방문",
    home_notice_impression: "홈배너 노출",
    home_notice_change: "홈배너 전환",
    home_notice_swipe: "홈배너 스와이프",
    home_notice_source_open: "홈배너 자료/기사 클릭",
    home_premium_banner_click: "홈배너 구매 클릭",
    premium_checkout_click: "구매 신청 클릭",
    bank_transfer_order_open: "계좌이체 창 열림",
    bank_transfer_form_start: "신청서 작성 시작",
    bank_transfer_order_submit: "구매 신청 접수",
    bank_transfer_order_approve: "입금 확인 승인",
    bank_transfer_order_verified: "구매자 승인 확인",
    premium_purchase_complete: "구매완료 처리",
    premium_preview_click: "유료 자료 미리보기",
    premium_product_select: "유료 상품 선택",
    premium_secure_file_click: "구매완료 자료 열기",
    premium_operating_settings_update: "유료 운영 설정 저장",
    marketing_spend_update: "광고비 저장",
    agent_cta_click: "Agent CTA 클릭",
    quick_query: "홈 빠른 검색",
    resource_open: "자료 미리보기",
    drive_open: "원본 자료 열기",
    trend_article_open: "동향 상세 보기",
    search: "검색 성공",
    search_no_result: "검색 실패"
  };
}

function aggregateBy(events, getKey, options) {
  const grouped = new Map();
  events.forEach((event) => {
    const key = getKey(event);
    if (!key) return;
    const current = grouped.get(key) || { query: key, [options.labelKey || "query"]: key, [options.countKey]: 0, [options.dateKey]: event.created_at };
    current[options.countKey] += 1;
    if (new Date(event.created_at).getTime() > new Date(current[options.dateKey]).getTime()) {
      current[options.dateKey] = event.created_at;
    }
    grouped.set(key, current);
  });
  return Array.from(grouped.values());
}

function getAdminKpis(data) {
  const totalSearches = sumBy(data.searchTerms, "search_count");
  const totalFailures = sumBy(data.noResults, "no_result_count");
  const totalResourceViews = sumBy(data.popularResources, "open_count");
  const totalComments = data.comments.length;
  const exactCounts = data.exactCounts || {};
  const totalPageViews = Number(exactCounts.totalPageViews ?? (data.rawEvents || []).filter((event) => event.event_name === "page_view").length);
  const premiumViews = Number(exactCounts.premiumViews ?? (data.rawEvents || []).filter((event) => event.event_name === "premium_view").length);
  const bannerClicks = Number(exactCounts.bannerClicks ?? (data.rawEvents || []).filter((event) => event.event_name === "home_premium_banner_click").length);
  const fileOpens = Number(exactCounts.fileOpens ?? (data.rawEvents || []).filter((event) => event.event_name === "premium_secure_file_click").length);
  const rawEvents = data.rawEvents || [];
  const allRawEvents = (data.allRawEvents || rawEvents).map(normalizeAdminEvent);
  const activeUsers7d = new Set(allRawEvents
    .filter((event) => new Date(event.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
    .map((event) => event.anonymous_user_id)
    .filter(Boolean)).size;

  return {
    totalEvents: Number(exactCounts.totalEvents ?? rawEvents.length),
    totalSearches,
    totalResourceViews,
    totalFailures,
    totalComments,
    activeUsers7d,
    totalPageViews,
    premiumViews,
    bannerClicks,
    fileOpens
  };
}

function getRevenueKpis(orders) {
  const approved = mergeBankTransferOrders(orders || []).filter((order) => order.status === "approved");
  const now = new Date();
  const todayKey = dateKey(now);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const revenueRows = approved.map((order) => ({
    ...order,
    amountValue: parseWonAmount(order.amount),
    revenueAt: order.approvedAt || order.updatedAt || order.createdAt
  }));

  return {
    approvedOrders: approved.length,
    todayRevenue: sumRevenue(revenueRows.filter((order) => dateKey(new Date(order.revenueAt)) === todayKey)),
    monthRevenue: sumRevenue(revenueRows.filter((order) => {
      const date = new Date(order.revenueAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` === monthKey;
    })),
    totalRevenue: sumRevenue(revenueRows)
  };
}

function sumRevenue(rows) {
  return rows.reduce((total, row) => total + Number(row.amountValue || 0), 0);
}

function parseWonAmount(value) {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function formatWon(value) {
  return `${formatCount(Number(value || 0))}원`;
}

function dateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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


function getAdminDataFreshness(data) {
  const resource = latestDate((data.popularResources || []).map((row) => row.last_opened_at));
  const search = latestDate([...(data.searchTerms || []), ...(data.noResults || [])].map((row) => row.last_searched_at));
  const orders = latestDate((data.bankOrders || []).flatMap((order) => [order.createdAt, order.approvedAt, order.updatedAt]));
  const events = latestDate((data.rawEvents || []).map((event) => event.created_at));
  const comments = latestDate((data.comments || []).map((row) => row.created_at));
  const premiumFiles = latestDate((data.premiumFileViews || []).map((row) => row.last_opened_at));
  const overall = latestDate([resource, search, orders, events, comments, premiumFiles]);
  return {
    overall: overall ? formatAdminDate(overall) : "없음",
    resource: resource ? formatAdminDate(resource) : "없음",
    search: search ? formatAdminDate(search) : "없음",
    orders: orders ? formatAdminDate(orders) : "없음"
  };
}

function getPremiumFunnel(events, orders = [], premiumFileViews = []) {
  const normalized = (events || []).map(normalizeAdminEvent);
  const eventSummary = summarizeEventsByName(normalized);
  const submittedOrders = mergeBankTransferOrders(orders || []);
  const approvedOrders = submittedOrders.filter((order) => order.status === "approved");
  const fileOpenCount = sumBy(premiumFileViews || [], "open_count");
  const latestFileOpenAt = latestDate((premiumFileViews || []).map((row) => row.last_opened_at));
  const steps = [
    { key: "premium_view", label: "프리미엄 페이지 방문" },
    { key: "premium_checkout_click", label: "구매 신청 클릭" },
    { key: "bank_transfer_order_open", label: "계좌이체 창 열림" },
    { key: "bank_transfer_form_start", label: "신청서 작성 시작" },
    { key: "bank_transfer_order_submit", label: "구매 신청 접수", fallbackCount: submittedOrders.length, fallbackLastAt: latestDate(submittedOrders.map((order) => order.createdAt)) },
    { key: "bank_transfer_order_approve", label: "입금 확인 승인", fallbackCount: approvedOrders.length, fallbackLastAt: latestDate(approvedOrders.map((order) => order.approvedAt || order.updatedAt)) },
    { key: "bank_transfer_order_verified", label: "구매자 승인 확인" },
    { key: "premium_secure_file_click", label: "자료 열기", fallbackCount: fileOpenCount, fallbackLastAt: latestFileOpenAt }
  ];
  const counts = steps.map((step) => {
    const summary = eventSummary.get(step.key) || { count: 0, lastAt: "" };
    const count = Math.max(Number(summary.count || 0), Number(step.fallbackCount || 0));
    const lastAt = latestDate([summary.lastAt, step.fallbackLastAt]);
    return { ...step, count, lastAt };
  });
  const max = Math.max(1, counts[0]?.count || 0, ...counts.map((step) => step.count));
  return counts.map((step, index) => {
    const prev = index === 0 ? step.count : counts[index - 1].count;
    const dropOff = prev > 0 ? Math.max(0, Math.round(((prev - step.count) / prev) * 100)) : 0;
    return { ...step, rate: Math.max(4, Math.round((step.count / max) * 100)), dropOff };
  });
}

function getMarketingAnalytics(data, premiumFunnel = []) {
  const events = (data.rawEvents || []).map(normalizeAdminEvent);
  const eventSummary = summarizeEventsByName(events);
  const orders = mergeBankTransferOrders(data.bankOrders || []);
  const approvedOrders = orders.filter((order) => order.status === "approved");
  const revenue = getRevenueKpis(orders);
  const adSpend = getMarketingAdSpend(adminDashboardState.period);
  const bannerImpressions = Number(eventSummary.get("home_notice_impression")?.count || 0);
  const premiumBannerClicks = Number(eventSummary.get("home_premium_banner_click")?.count || 0);
  const noticeSourceClicks = Number(eventSummary.get("home_notice_source_open")?.count || 0);
  const bannerClicks = premiumBannerClicks + noticeSourceClicks;
  const premiumViews = Number(eventSummary.get("premium_view")?.count || 0);
  const checkoutClicks = Number(eventSummary.get("premium_checkout_click")?.count || 0);
  const submittedOrders = orders.length;

  const bannerRows = [
    {
      label: "홈배너 전체",
      impressions: bannerImpressions,
      clicks: bannerClicks,
      ctr: percentage(bannerClicks, bannerImpressions),
      lastAt: latestDate([
        eventSummary.get("home_notice_impression")?.lastAt,
        eventSummary.get("home_premium_banner_click")?.lastAt,
        eventSummary.get("home_notice_source_open")?.lastAt
      ])
    },
    {
      label: "프리미엄 배너",
      impressions: bannerImpressions,
      clicks: premiumBannerClicks,
      ctr: percentage(premiumBannerClicks, bannerImpressions),
      lastAt: eventSummary.get("home_premium_banner_click")?.lastAt || ""
    },
    {
      label: "공지/자료 배너",
      impressions: bannerImpressions,
      clicks: noticeSourceClicks,
      ctr: percentage(noticeSourceClicks, bannerImpressions),
      lastAt: eventSummary.get("home_notice_source_open")?.lastAt || ""
    }
  ].filter((row) => row.impressions || row.clicks);

  const dropOffRows = [...premiumFunnel]
    .filter((step, index) => index > 0 && (step.count || step.dropOff))
    .sort((a, b) => b.dropOff - a.dropOff || b.count - a.count)
    .slice(0, 6);
  const topClicks = aggregateMarketingClicks(events);
  const exitPages = aggregateExitPages(events);
  const trafficSources = aggregateTrafficSources(events);
  const roas = adSpend > 0 ? Math.round((revenue.totalRevenue / adSpend) * 100) : 0;
  const cpc = adSpend > 0 && bannerClicks > 0 ? Math.round(adSpend / bannerClicks) : 0;
  const cpa = adSpend > 0 && approvedOrders.length > 0 ? Math.round(adSpend / approvedOrders.length) : 0;

  return {
    adSpend,
    periodRevenue: revenue.totalRevenue,
    bannerCtr: percentage(bannerClicks, bannerImpressions),
    purchaseConversion: percentage(checkoutClicks, premiumViews),
    approvalConversion: percentage(approvedOrders.length, premiumViews),
    orderSubmitConversion: percentage(submittedOrders, checkoutClicks),
    roas,
    roasLabel: adSpend > 0 ? `${formatCount(roas)}%` : "광고비 필요",
    cpcLabel: cpc ? formatWon(cpc) : "-",
    cpaLabel: cpa ? formatWon(cpa) : "-",
    bannerRows,
    dropOffRows,
    topClicks,
    exitPages,
    trafficSources,
    insights: getMarketingInsights({
      bannerCtr: percentage(bannerClicks, bannerImpressions),
      purchaseConversion: percentage(checkoutClicks, premiumViews),
      approvalConversion: percentage(approvedOrders.length, premiumViews),
      orderSubmitConversion: percentage(submittedOrders, checkoutClicks),
      roas,
      adSpend,
      topClicks,
      exitPages,
      trafficSources,
      dropOffRows
    })
  };
}

function readMarketingAdSpendMap() {
  try {
    const parsed = JSON.parse(safeStorageGet("pym.marketingAdSpend") || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getMarketingAdSpend(period) {
  return Number(readMarketingAdSpendMap()[period || "all"] || 0);
}

function saveMarketingAdSpend(form) {
  const formData = new FormData(form);
  const amount = parseWonAmount(formData.get("adSpend"));
  const period = adminDashboardState.period || "all";
  const spends = readMarketingAdSpendMap();
  spends[period] = amount;
  safeStorageSet("pym.marketingAdSpend", JSON.stringify(spends));
  trackEvent("marketing_spend_update", { period, amount });
  showToast(`${adminPeriodLabel(period)} 광고비를 저장했어요`);
  renderAnalyticsAdmin();
}

function percentage(value, total) {
  const denominator = Number(total || 0);
  if (!denominator) return 0;
  return Math.round((Number(value || 0) / denominator) * 1000) / 10;
}

function aggregateMarketingClicks(events) {
  const labels = {
    home_premium_banner_click: "홈배너 구매 클릭",
    home_notice_source_open: "홈배너 자료/기사 클릭",
    premium_checkout_click: "구매 신청 클릭",
    bank_transfer_order_open: "계좌이체 창 열림",
    bank_transfer_form_start: "신청서 작성 시작",
    bank_transfer_order_submit: "구매 신청 접수",
    agent_cta_click: "Agent CTA 클릭",
    quick_query: "홈 빠른 검색",
    premium_preview_click: "유료 자료 미리보기",
    premium_secure_file_click: "구매완료 자료 열기",
    resource_open: "자료 미리보기",
    drive_open: "원본 자료 열기",
    trend_article_open: "동향 상세 보기"
  };
  return aggregateBy(events.filter((event) => labels[event.event_name]), (event) => event.event_name, {
    countKey: "count",
    dateKey: "lastAt",
    labelKey: "event_name"
  }).map((row) => ({
    label: labels[row.event_name || row.query] || row.event_name || row.query,
    count: row.count,
    lastAt: row.lastAt
  })).sort((a, b) => b.count - a.count || new Date(b.lastAt) - new Date(a.lastAt)).slice(0, 12);
}

function aggregateExitPages(events) {
  const groupedSessions = new Map();
  events.forEach((event) => {
    const sessionKey = event.session_id || event.anonymous_user_id || event.event_id;
    if (!sessionKey) return;
    const current = groupedSessions.get(sessionKey);
    if (!current || new Date(event.created_at).getTime() > new Date(current.created_at).getTime()) {
      groupedSessions.set(sessionKey, event);
    }
  });

  return aggregateBy(Array.from(groupedSessions.values()), (event) => normalizePageKey(event.properties?.hash || event.hash || "#home"), {
    countKey: "count",
    dateKey: "lastAt",
    labelKey: "page_key"
  }).map((row) => ({
    label: pageLabel(row.page_key || row.query),
    count: row.count,
    lastAt: row.lastAt
  })).sort((a, b) => b.count - a.count || new Date(b.lastAt) - new Date(a.lastAt)).slice(0, 10);
}

function aggregateTrafficSources(events) {
  const pageViews = events.filter((event) => event.event_name === "page_view");
  return aggregateBy(pageViews, getTrafficSourceLabel, {
    countKey: "count",
    dateKey: "lastAt",
    labelKey: "source"
  }).map((row) => ({
    label: row.source || row.query,
    count: row.count,
    lastAt: row.lastAt
  })).sort((a, b) => b.count - a.count || new Date(b.lastAt) - new Date(a.lastAt)).slice(0, 10);
}

function getTrafficSourceLabel(event) {
  const properties = event.properties || {};
  if (properties.utm_source) {
    return [properties.utm_source, properties.utm_medium, properties.utm_campaign].filter(Boolean).join(" / ");
  }
  if (properties.pageSearch) {
    const utm = parseUtmParams(properties.pageSearch);
    if (utm.utm_source) return [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ");
  }
  if (event.referrer) {
    try {
      const url = new URL(event.referrer);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "외부 유입";
    }
  }
  return "직접/앱 바로가기";
}

function getMarketingInsights(marketing) {
  const insights = [];
  if (marketing.adSpend > 0) {
    insights.push(`현재 기간 ROAS는 ${formatCount(marketing.roas)}%입니다. 100% 미만이면 광고비 대비 매출 회수가 부족한 상태로 봐야 합니다.`);
  } else {
    insights.push("광고비를 입력하면 홈배너와 프리미엄 판매 기준 ROAS, CPC, CPA를 바로 계산할 수 있어요.");
  }
  if (marketing.dropOffRows[0]) {
    insights.push(`${marketing.dropOffRows[0].label} 단계에서 이탈률이 ${marketing.dropOffRows[0].dropOff}%로 가장 큽니다. 해당 화면의 문구, 버튼 위치, 입력 부담을 먼저 줄여보세요.`);
  }
  if (marketing.topClicks[0]) {
    insights.push(`${marketing.topClicks[0].label}이 ${formatCount(marketing.topClicks[0].count)}회로 가장 강한 행동 신호입니다. 이 행동 앞뒤 화면을 광고 소재와 연결하면 좋습니다.`);
  }
  if (marketing.exitPages[0]) {
    insights.push(`세션 마지막 화면은 ${marketing.exitPages[0].label}이 가장 많습니다. 이 화면에서 다음 행동 버튼이 충분히 눈에 띄는지 확인하세요.`);
  }
  if (marketing.bannerCtr && marketing.bannerCtr < 1) {
    insights.push("홈배너 CTR이 1% 미만이면 제목 훅, 첫 화면 배치, CTA 문구를 다시 실험해볼 필요가 있습니다.");
  }
  if (!insights.length) insights.push("아직 마케팅 판단 데이터가 부족합니다. 방문, 배너 클릭, 구매 신청 이벤트가 쌓이면 자동 인사이트가 생성됩니다.");
  return insights;
}

function summarizeEventsByName(events) {
  const map = new Map();
  events.forEach((event) => {
    const current = map.get(event.event_name) || { count: 0, lastAt: event.created_at };
    current.count += 1;
    current.lastAt = latestDate([current.lastAt, event.created_at]);
    map.set(event.event_name, current);
  });
  return map;
}

function getFunnelFreshness(steps) {
  const latest = latestDate((steps || []).map((step) => step.lastAt));
  return latest ? formatAdminDate(latest) : "없음";
}

function latestDate(values) {
  return (values || [])
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() || "";
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
  return !isNoiseQuery(query);
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

function agentIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3"/><path d="M5 10a7 7 0 0 1 14 0v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M9.5 16h5"/></svg>`;
}

function paidIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h15v12h-15v-12Z"/><path d="M7 7.5V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1.5"/><path d="M8 12h8M8 15.5h5"/></svg>`;
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
})().catch((error) => {
  console.error("PYM app failed to initialize", error);
  if (isAdminHash(window.location.hash)) {
    document.body.classList.add("admin-mode");
    const admin = document.querySelector("#analyticsAdmin");
    const content = document.querySelector("#analyticsContent");
    if (admin) admin.hidden = false;
    if (content) {
      content.innerHTML = `<section class="admin-hero"><p class="eyebrow">Admin recovery</p><h2>어드민 화면을 복구했어요</h2><p>앱 초기화 중 오류가 발생했습니다. 새로고침 후에도 반복되면 아래 오류 내용을 알려주세요.</p></section><section class="admin-card"><div class="admin-card-head"><h2>오류 내용</h2><span>진단</span></div><p class="admin-note"></p></section>`;
      const note = content.querySelector(".admin-note");
      if (note) note.textContent = error?.message || "알 수 없는 오류";
    }
  }
  const fallback = document.querySelector("#bottomTabs");
  if (fallback) {
    fallback.innerHTML = `
      <button class="bottom-tab active" type="button"><span>홈</span></button>
      <button class="bottom-tab" type="button"><span>검색</span></button>
      <button class="bottom-tab" type="button"><span>유료</span></button>
    `;
  }
  const toast = document.querySelector("#toast");
  if (toast) {
    toast.textContent = "앱을 불러오지 못했어요. 새로고침해 주세요.";
    toast.classList.add("show");
  }
});
