import crypto from "node:crypto";
import { apiError, cleanText, env, json, requestIp, rpc } from "./_lib/supabase.js";
import { notifyApprovedOrder } from "./bank-order-automation.js";

export const config = { maxDuration: 30 };

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

const ADMIN_COOKIE = "pym_admin_session";
const loginAttempts = new Map();

function assertLoginRate(req) {
  const key = requestIp(req);
  const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) {
    const error = new Error("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
    error.status = 429;
    throw error;
  }
  recent.push(now);
  loginAttempts.set(key, recent);
}

function clearLoginRate(req) {
  loginAttempts.delete(requestIp(req));
}

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((item) => {
    const index = item.indexOf("=");
    return index < 0 ? ["", ""] : [item.slice(0, index).trim(), item.slice(index + 1).trim()];
  }).filter(([key]) => key));
}

function sessionSignature(expiresAt, secret) {
  return crypto.createHmac("sha256", secret).update(`pym-admin:${expiresAt}`).digest("base64url");
}

function createSessionToken(secret, remember) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  return { token: `${expiresAt}.${sessionSignature(expiresAt, secret)}`, maxAge };
}

function hasValidSession(req, secret) {
  const [expiresAtText, signature] = String(parseCookies(req)[ADMIN_COOKIE] || "").split(".");
  const expiresAt = Number(expiresAtText);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() / 1000 && safeEqual(signature, sessionSignature(expiresAtText, secret));
}

function setAdminCookie(req, res, token, maxAge, remember) {
  const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  const persistence = remember ? `; Max-Age=${maxAge}` : "";
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure}${persistence}`);
}

function adminClientHash(req, secret) {
  return crypto.createHmac("sha256", secret).update(requestIp(req)).digest("hex");
}

function assertSameOrigin(req) {
  const origin = String(req.headers.origin || "");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (!origin || !host) {
    const error = new Error("요청 출처를 확인할 수 없습니다.");
    error.status = 403;
    throw error;
  }
  try {
    if (new URL(origin).host !== host) throw new Error("origin mismatch");
  } catch {
    const error = new Error("허용되지 않은 요청 출처입니다.");
    error.status = 403;
    throw error;
  }
}

function requireAdmin(req) {
  const configuredId = env("ADMIN_ACCESS_ID", "admin");
  const configured = env("ADMIN_ACCESS_SECRET");
  const providedId = String(req.headers["x-admin-id"] || "");
  const provided = String(req.headers["x-admin-secret"] || "");
  if (!configured) {
    const error = new Error("관리자 비밀키가 설정되지 않았습니다.");
    error.status = 503;
    throw error;
  }
  if (hasValidSession(req, configured)) {
    assertSameOrigin(req);
    return configured;
  }
  if (!safeEqual(providedId, configuredId) || !safeEqual(provided, configured)) {
    const error = new Error("관리자 인증이 필요합니다.");
    error.status = 401;
    throw error;
  }
  return configured;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = cleanText(body.action || "dashboard", 30);
    if (action === "logout") {
      setAdminCookie(req, res, "", 0, true);
      return json(res, 200, { ok: true });
    }

    if (action === "login") {
      assertLoginRate(req);
      const configuredId = env("ADMIN_ACCESS_ID", "admin");
      const secret = env("ADMIN_ACCESS_SECRET");
      const providedId = String(req.headers["x-admin-id"] || "");
      const provided = String(req.headers["x-admin-secret"] || "");
      if (!secret) return json(res, 503, { error: "관리자 비밀키가 설정되지 않았습니다." });
      if (!safeEqual(providedId, configuredId) || !safeEqual(provided, secret)) {
        return json(res, 401, { error: "관리자 인증이 필요합니다." });
      }
      assertSameOrigin(req);
      const remember = body.remember === true;
      const session = createSessionToken(secret, remember);
      setAdminCookie(req, res, session.token, session.maxAge, remember);
      const payload = await rpc("admin_login_payload", {
        p_secret: secret,
        p_client_hash: adminClientHash(req, secret)
      });
      clearLoginRate(req);
      return json(res, 200, payload);
    }

    const secret = requireAdmin(req);

    if (action === "dashboard") {
      return json(res, 200, await rpc("admin_dashboard_payload", { p_secret: secret }));
    }

    if (action === "analytics-export") {
      const days = Math.max(1, Math.min(Number(body.days) || 90, 365));
      return json(res, 200, await rpc("admin_analytics_export", { p_secret: secret, p_days: days }));
    }

    if (["approve", "delete"].includes(action)) {
      const orderId = cleanText(body.orderId, 40).toUpperCase();
      if (!orderId) return json(res, 400, { error: "주문번호가 필요합니다." });
      let order = null;
      if (action === "approve") {
        const dashboard = await rpc("admin_dashboard_payload", { p_secret: secret });
        order = (Array.isArray(dashboard?.bankOrders) ? dashboard.bankOrders : []).find((item) => item.id === orderId) || null;
      }
      const result = await rpc("admin_update_bank_order", {
        p_secret: secret,
        p_order_id: orderId,
        p_action: action
      });
      if (!result?.ok) return json(res, 404, { error: "주문을 찾지 못했습니다." });
      if (action === "approve" && order) {
        const delivery = await notifyApprovedOrder({ ...order, ...result, status: "approved" });
        return json(res, 200, { ...(result || { ok: true }), delivery });
      }
      return json(res, 200, result || { ok: true });
    }

    if (action === "save-settings") {
      const account = body.account && typeof body.account === "object" ? body.account : {};
      const fileLinks = body.fileLinks && typeof body.fileLinks === "object" ? body.fileLinks : {};
      const result = await rpc("admin_save_premium_settings", {
        p_secret: secret,
        p_account: {
          bank: cleanText(account.bank, 50),
          holder: cleanText(account.holder, 50),
          number: cleanText(account.number, 60),
          regularAmount: cleanText(account.regularAmount, 30),
          saleAmount: cleanText(account.saleAmount, 30),
          amount: cleanText(account.saleAmount || account.amount, 30)
        },
        p_file_links: Object.fromEntries(Object.entries(fileLinks).slice(0, 20).map(([key, value]) => [cleanText(key, 80), cleanText(value, 1000)]))
      });
      return json(res, 200, result || { ok: true });
    }

    return json(res, 400, { error: "지원하지 않는 관리자 요청입니다." });
  } catch (error) {
    return apiError(res, error, "관리자 서버 연결에 실패했습니다.");
  }
}
