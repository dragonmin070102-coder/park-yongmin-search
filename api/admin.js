import crypto from "node:crypto";
import { apiError, cleanText, env, json, rpc } from "./_lib/supabase.js";

export const config = { maxDuration: 30 };

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req) {
  const configuredId = env("ADMIN_ACCESS_ID", "admin");
  const configured = env("ADMIN_ACCESS_SECRET");
  const providedId = String(req.headers["x-admin-id"] || "");
  const provided = String(req.headers["x-admin-secret"] || "");
  if (!configured || !safeEqual(providedId, configuredId) || !safeEqual(provided, configured)) {
    const error = new Error("관리자 인증이 필요합니다.");
    error.status = 401;
    throw error;
  }
  return provided;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });

  try {
    const secret = requireAdmin(req);
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = cleanText(body.action || "dashboard", 30);

    if (action === "dashboard") {
      return json(res, 200, await rpc("admin_dashboard_payload", { p_secret: secret }));
    }

    if (["approve", "delete"].includes(action)) {
      const orderId = cleanText(body.orderId, 40).toUpperCase();
      if (!orderId) return json(res, 400, { error: "주문번호가 필요합니다." });
      const result = await rpc("admin_update_bank_order", {
        p_secret: secret,
        p_order_id: orderId,
        p_action: action
      });
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
          amount: cleanText(account.amount, 30)
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
