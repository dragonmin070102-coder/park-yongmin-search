const DEFAULT_SUPABASE_URL = "https://htoocddwxzgspqdihonm.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_azcwJigJPfzpdcnNKFBm6g_dA_HQU-F";

export function json(res, status, payload, headers = {}) {
  Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value));
  res.status(status).json(payload);
}

export function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

export function requestIp(req) {
  return String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown")
    .split(",")[0]
    .trim();
}

export async function rpc(name, payload = {}) {
  const url = env("SUPABASE_URL", DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const key = env("SUPABASE_PUBLISHABLE_KEY", DEFAULT_PUBLISHABLE_KEY);
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(body?.message || body?.error || `Supabase RPC ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

export function cleanText(value, maxLength = 200) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, maxLength);
}

export function apiError(res, error, fallback = "요청을 처리하지 못했습니다.") {
  const status = Number(error?.status || 500);
  const safeStatus = status >= 400 && status < 500 ? status : 500;
  json(res, safeStatus, { error: safeStatus === 500 ? fallback : String(error.message || fallback) });
}
