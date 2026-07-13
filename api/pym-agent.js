import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k2.6";
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NIM_TIMEOUT_MS = Number(process.env.NVIDIA_TIMEOUT_MS || 22000);
const RERANK_MODEL = process.env.NVIDIA_RERANK_MODEL || "nvidia/llama-nemotron-rerank-1b-v2";
const RERANK_URL = process.env.NVIDIA_RERANK_URL || "https://ai.api.nvidia.com/v1/retrieval/nvidia/llama-nemotron-rerank-1b-v2/reranking";
const RERANK_TIMEOUT_MS = Number(process.env.NVIDIA_RERANK_TIMEOUT_MS || 7000);
const RERANK_ENABLED = process.env.NVIDIA_RERANK_ENABLED !== "false";

export const config = {
  maxDuration: 30
};

function normalizeResourceData(payload) {
  const items = Array.isArray(payload) ? payload : payload.resources;
  return Array.isArray(items) ? items : [];
}

async function loadResources() {
  const filePath = path.join(process.cwd(), "data", "resources.json");
  const raw = await fs.readFile(filePath, "utf8");
  return normalizeResourceData(JSON.parse(raw));
}

function scoreResources(resources, query) {
  const tokens = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  return resources.map((resource, index) => {
    const tags = Array.isArray(resource.tags) ? resource.tags : [];
    const points = Array.isArray(resource.points) ? resource.points : [];
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
      tags.join(" "),
      points.join(" ")
    ].filter(Boolean).join(" ").toLowerCase();

    const score = tokens.reduce((sum, token) => {
      if (String(resource.displayTitle || "").toLowerCase().includes(token)) return sum + 8;
      if (tags.join(" ").toLowerCase().includes(token)) return sum + 6;
      if (haystack.includes(token)) return sum + 3;
      return sum;
    }, tokens.length ? 0 : 1);

    return { resource, score, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
}

function contextBlock(matches) {
  return matches.map(({ resource }, index) => {
    const points = Array.isArray(resource.points) ? resource.points.slice(0, 3) : [];
    const tags = Array.isArray(resource.tags) ? resource.tags.slice(0, 10) : [];
    return [
      `[${index + 1}] ${resource.displayTitle || resource.title}`,
      `분류: ${resource.system || ""} / ${resource.intent || ""} / ${resource.stage || ""}`,
      `요약: ${resource.summary || ""}`,
      `본문 일부/근거: ${resource.evidence || resource.useCase || ""}`,
      points.length ? `핵심 포인트: ${points.join(" / ")}` : "",
      tags.length ? `태그: ${tags.join(", ")}` : ""
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

function resourcePassage(resource) {
  const tags = Array.isArray(resource.tags) ? resource.tags.slice(0, 14) : [];
  const points = Array.isArray(resource.points) ? resource.points.slice(0, 5) : [];
  const keywords = Array.isArray(resource.keywords) ? resource.keywords.slice(0, 10) : [];
  return [
    `제목: ${resource.displayTitle || resource.title || ""}`,
    `원제목: ${resource.title || ""}`,
    `분류: ${resource.system || resource.type || ""} / ${resource.intent || ""} / ${resource.stage || ""}`,
    `요약: ${resource.summary || ""}`,
    `근거/본문 일부: ${resource.evidence || ""}`,
    `활용 상황: ${resource.useCase || ""}`,
    points.length ? `핵심 포인트: ${points.join(" / ")}` : "",
    tags.length ? `태그: ${tags.join(", ")}` : "",
    keywords.length ? `키워드: ${keywords.join(", ")}` : ""
  ].filter(Boolean).join("\n").slice(0, 2600);
}

function parseRerankRows(payload) {
  const candidates = [
    payload?.rankings,
    payload?.results,
    payload?.data,
    payload?.ranked_passages,
    payload?.response?.rankings
  ].find(Array.isArray);
  return Array.isArray(candidates) ? candidates : [];
}

function rerankIndex(row) {
  const value = row?.index ?? row?.passage_index ?? row?.input_index ?? row?.document_index ?? row?.id;
  const number = Number(value);
  return Number.isInteger(number) ? number : -1;
}

function rerankScore(row) {
  const value = row?.logit ?? row?.score ?? row?.relevance_score ?? row?.ranking_score;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function rerankMatches(question, matches) {
  if (!RERANK_ENABLED || matches.length < 2) {
    return { matches, used: false, reason: "disabled_or_too_few" };
  }

  const passages = matches.map(({ resource }) => ({ text: resourcePassage(resource) }));
  const response = await withTimeout(fetch(RERANK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      model: RERANK_MODEL,
      query: { text: question },
      passages,
      truncate: "END"
    })
  }), RERANK_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`NVIDIA rerank failed: ${response.status}`);
  }

  const payload = await response.json();
  const rows = parseRerankRows(payload)
    .map((row) => ({ index: rerankIndex(row), score: rerankScore(row) }))
    .filter((row) => row.index >= 0 && row.index < matches.length)
    .sort((a, b) => b.score - a.score);

  if (!rows.length) {
    return { matches, used: false, reason: "empty_rerank_result" };
  }

  const ranked = rows.map((row) => ({
    ...matches[row.index],
    rerankScore: row.score
  }));
  const seen = new Set(ranked.map((item) => item.resource.id));
  const leftovers = matches.filter((item) => !seen.has(item.resource.id));
  return { matches: [...ranked, ...leftovers], used: true, model: RERANK_MODEL };
}

function referencePayload(matches) {
  return matches.map(({ resource }) => ({
    id: resource.id,
    title: resource.displayTitle || resource.title,
    summary: resource.summary || "",
    source: resource.source || "",
    url: resource.url || ""
  }));
}

function fallbackAnswer(question, matches) {
  const titles = matches.map(({ resource }) => resource.displayTitle || resource.title).filter(Boolean);
  const top = matches[0]?.resource;
  if (!top) {
    return "현재 PYM 자료 기준으로는 이 질문에 바로 답하기에 근거가 부족해요. 질환명, 검사명, 증상 키워드를 조금 더 구체적으로 입력해주면 관련 자료를 다시 찾아볼게요.";
  }

  const points = Array.isArray(top.points) ? top.points.slice(0, 3) : [];
  return [
    `질문: ${question}`,
    "",
    `현재 PYM 자료 기준으로는 ${top.displayTitle || top.title} 자료가 가장 관련 있어 보여요.`,
    "",
    "1. 병태생리/핵심 흐름",
    top.summary || "자료 요약 기준으로 핵심 개념을 먼저 잡는 것이 좋아요.",
    "",
    "2. 검사수치/사정 포인트",
    points[0] || top.evidence || "현재 자료에는 세부 수치 근거가 충분하지 않아, 원본 자료 확인이 필요해요.",
    "",
    "3. 임상판단/간호 우선순위",
    points.slice(1).join(" ") || top.useCase || "실제 환자 판단은 기관 기준과 담당 의료진 판단을 따라야 해요.",
    "",
    `참고한 PYM 자료: ${titles.join(", ")}`
  ].join("\n");
}

async function withTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("NVIDIA NIM 응답 시간이 길어 PYM 자료 기반 요약으로 대신 표시했어요.")), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.PYM_AGENT_ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  if (!process.env.NVIDIA_API_KEY) {
    res.status(500).json({ error: "NVIDIA_API_KEY 환경변수가 설정되지 않았어요." });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    res.status(400).json({ error: "요청 형식이 올바르지 않아요." });
    return;
  }
  const question = String(body.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "질문을 입력해주세요." });
    return;
  }

  const resources = await loadResources();
  const candidates = scoreResources(resources, question).filter((item) => item.score > 0).slice(0, 20);
  let retrieval = { matches: candidates, used: false };
  try {
    retrieval = await rerankMatches(question, candidates);
  } catch (error) {
    retrieval = { matches: candidates, used: false, warning: error.message || "NVIDIA rerank failed" };
  }
  const matches = retrieval.matches.slice(0, 5);
  const context = contextBlock(matches);
  const references = referencePayload(matches);

  if (!matches.length) {
    res.status(200).json({
      answer: "현재 PYM 자료 기준으로는 이 질문에 바로 답하기에 근거가 부족해요. 질환명, 검사명, 증상 키워드를 조금 더 구체적으로 입력해주면 관련 자료를 다시 찾아볼게요.",
      references: [],
      retrieval: { rerankUsed: false, candidateCount: 0 }
    });
    return;
  }

  const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: NIM_BASE_URL
  });

  let completion;
  try {
    completion = await withTimeout(client.chat.completions.create({
      model: MODEL,
      temperature: 0.25,
      max_tokens: 650,
      messages: [
        {
          role: "system",
          content: [
            "너는 PYM Agent다. 박용민 간호 자료 검색 사이트 안에서만 답변한다.",
            "답변은 쉽고 직관적으로 쓴다.",
            "가능하면 병태생리 → 검사수치/사정 → 임상판단/간호 우선순위 순서로 설명한다.",
            "간호학생이 실습과 케이스스터디에 바로 연결할 수 있게 말한다.",
            "제공된 PYM 자료 context에 없는 내용은 지어내지 말고 '현재 자료 기준으로는 부족하다'고 말한다.",
            "의학적 진단을 확정하지 말고 학습 보조 설명으로 제한한다. 응급/실제 환자는 기관 기준과 담당 의료진 판단을 따르라고 안내한다.",
            "한국어로 답한다. 문단은 짧게, 핵심은 굵은 느낌의 표현 대신 일반 텍스트로 명확히 쓴다."
          ].join("\n")
        },
        {
          role: "user",
          content: [
            `질문: ${question}`,
            "",
            "PYM 자료 context:",
            context
          ].join("\n")
        }
      ]
    }), NIM_TIMEOUT_MS);
  } catch (error) {
    res.status(200).json({
      answer: fallbackAnswer(question, matches),
      references,
      model: MODEL,
      fallback: true,
      retrieval: {
        rerankUsed: Boolean(retrieval.used),
        rerankModel: retrieval.model || "",
        candidateCount: candidates.length,
        warning: retrieval.warning || ""
      },
      warning: error.message || "NVIDIA NIM 응답을 받지 못해 PYM 자료 기반 요약으로 대신 표시했어요."
    });
    return;
  }

  const answer = completion.choices?.[0]?.message?.content?.trim() || "현재 자료 기준으로는 답변을 생성하지 못했어요.";
  res.status(200).json({
    answer,
    references,
    model: MODEL,
    retrieval: {
      rerankUsed: Boolean(retrieval.used),
      rerankModel: retrieval.model || "",
      candidateCount: candidates.length,
      warning: retrieval.warning || ""
    }
  });
}
