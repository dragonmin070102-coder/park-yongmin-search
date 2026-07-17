import crypto from "node:crypto";
import { apiError, cleanText, env, json, requestIp, rpc } from "./_lib/supabase.js";

export const config = { maxDuration: 15 };

function hashClient(req) {
  const secret = env("ORDER_HASH_SECRET") || env("ADMIN_ACCESS_SECRET") || "pym-analytics-rate-limit";
  return crypto.createHmac("sha256", secret).update(requestIp(req)).digest("hex");
}

function cleanEvent(event = {}) {
  const properties = event.properties && typeof event.properties === "object" && !Array.isArray(event.properties)
    ? Object.fromEntries(Object.entries(event.properties).slice(0, 40).map(([key, value]) => [cleanText(key, 60), typeof value === "string" ? cleanText(value, 500) : value]))
    : {};
  return {
    event_id: cleanText(event.id || event.event_id, 100),
    event_name: cleanText(event.name || event.event_name, 80),
    anonymous_user_id: cleanText(event.userId || event.anonymous_user_id, 100),
    session_id: cleanText(event.sessionId || event.session_id, 100),
    path: cleanText(event.path, 300),
    hash: cleanText(event.hash, 200),
    referrer: cleanText(event.referrer, 500),
    user_agent: cleanText(event.userAgent || event.user_agent, 500),
    viewport: cleanText(event.viewport, 40),
    properties,
    created_at: cleanText(event.createdAt || event.created_at, 40)
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const source = Array.isArray(body.events) ? body.events : [];
    if (!source.length || source.length > 20) return json(res, 400, { error: "이벤트는 한 번에 1~20개만 전송할 수 있습니다." });
    const events = source.map(cleanEvent).filter((event) => event.event_id && event.event_name && event.anonymous_user_id && event.session_id);
    if (!events.length) return json(res, 400, { error: "유효한 이벤트가 없습니다." });
    const result = await rpc("submit_analytics_events", { p_events: events, p_client_hash: hashClient(req) });
    return json(res, 202, result || { accepted: events.length });
  } catch (error) {
    return apiError(res, error, "분석 이벤트를 전송하지 못했습니다.");
  }
}
