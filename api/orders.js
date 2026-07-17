import crypto from "node:crypto";
import { apiError, cleanText, env, json, requestIp, rpc } from "./_lib/supabase.js";

export const config = { maxDuration: 15 };

function hashClient(req) {
  const secret = env("ORDER_HASH_SECRET") || env("ADMIN_ACCESS_SECRET") || "pym-order-rate-limit";
  return crypto.createHmac("sha256", secret).update(requestIp(req)).digest("hex");
}

function orderInput(body = {}) {
  return {
    productId: cleanText(body.productId || "neuro-series-6", 40),
    depositor: cleanText(body.depositor, 80),
    email: cleanText(body.email, 160).toLowerCase(),
    phoneLast4: cleanText(body.phoneLast4, 4),
    memo: cleanText(body.memo, 300)
  };
}

function validateIdentity(input, { depositor = false } = {}) {
  if (depositor && input.depositor.length < 2) throw Object.assign(new Error("입금자명을 확인해 주세요."), { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw Object.assign(new Error("이메일 주소를 확인해 주세요."), { status: 400 });
  if (!/^\d{4}$/.test(input.phoneLast4)) throw Object.assign(new Error("휴대폰 뒤 4자리를 확인해 주세요."), { status: 400 });
}

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (!["GET", "POST"].includes(req.method)) return json(res, 405, { error: "GET or POST only" });

  try {
    if (req.method === "GET") {
      const action = cleanText(req.query?.action, 30);
      if (action === "settings") {
        const result = await rpc("get_public_premium_settings");
        return json(res, 200, result || {}, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
      }
      if (action === "social") {
        const result = await rpc("get_public_premium_social_proof");
        return json(res, 200, result || {}, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
      }
      if (action === "content-stats") {
        const result = await rpc("get_public_content_stats");
        return json(res, 200, result || {}, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
      }
      return json(res, 400, { error: "지원하지 않는 요청입니다." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = cleanText(body.action || "create", 30);
    const input = orderInput(body);

    if (action === "create") {
      validateIdentity(input, { depositor: true });
      if (input.productId !== "neuro-series-6") return json(res, 400, { error: "판매 중인 상품이 아닙니다." });
      const result = await rpc("submit_bank_order", {
        p_product_id: input.productId,
        p_depositor: input.depositor,
        p_email: input.email,
        p_phone_last4: input.phoneLast4,
        p_memo: input.memo,
        p_client_hash: hashClient(req)
      });
      return json(res, 201, result || {});
    }

    validateIdentity(input, { depositor: action === "lookup" });
    if (action === "status") {
      const orderId = cleanText(body.orderId, 40).toUpperCase();
      if (!orderId) return json(res, 400, { error: "주문번호를 입력해 주세요." });
      const result = await rpc("lookup_bank_order", {
        p_order_id: orderId,
        p_email: input.email,
        p_phone_last4: input.phoneLast4,
        p_client_hash: hashClient(req)
      });
      if (!result) return json(res, 404, { error: "일치하는 주문을 찾지 못했습니다." });
      return json(res, 200, result);
    }

    if (action === "lookup") {
      const result = await rpc("find_bank_order", {
        p_depositor: input.depositor,
        p_email: input.email,
        p_phone_last4: input.phoneLast4,
        p_client_hash: hashClient(req)
      });
      if (!result) return json(res, 404, { error: "일치하는 주문을 찾지 못했습니다." });
      return json(res, 200, result);
    }

    if (action === "review") {
      const orderId = cleanText(body.orderId, 40).toUpperCase();
      const reviewBody = cleanText(body.body, 300);
      if (!orderId || reviewBody.length < 5) return json(res, 400, { error: "리뷰는 5자 이상 입력해 주세요." });
      const result = await rpc("submit_premium_review", {
        p_order_id: orderId,
        p_email: input.email,
        p_phone_last4: input.phoneLast4,
        p_body: reviewBody,
        p_client_hash: hashClient(req)
      });
      return json(res, 201, result || {});
    }

    return json(res, 400, { error: "지원하지 않는 요청입니다." });
  } catch (error) {
    return apiError(res, error, "주문 서버 연결에 실패했습니다.");
  }
}
