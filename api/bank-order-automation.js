import { env, rpc } from "./_lib/supabase.js";

const DEFAULT_SITE_URL = "https://park-yongmin-search.vercel.app";
const AUTO_APPROVE = env("BANK_ORDER_AUTO_APPROVE", "false") === "true";

export const config = {
  maxDuration: 30
};

function json(res, status, payload) {
  res.status(status).json(payload);
}

function authOk(req) {
  const secret = env("BANK_ORDER_AUTOMATION_SECRET") || env("CRON_SECRET") || env("ADMIN_ACCESS_SECRET");
  if (!secret) return false;
  const authorization = String(req.headers.authorization || "");
  const headerSecret = String(req.headers["x-automation-secret"] || "");
  return authorization === `Bearer ${secret}` || headerSecret === secret;
}

function fromOrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: row.product_title,
    amount: row.amount,
    depositor: row.depositor,
    email: row.email,
    phoneLast4: row.phone_last4 || "",
    memo: row.memo || "",
    status: row.status || "pending",
    createdAt: row.created_at,
    approvedAt: row.approved_at || "",
    updatedAt: row.updated_at || row.created_at
  };
}

function orderFromWebhookBody(body) {
  const row = body?.record || body?.new || body?.order || body;
  if (!row || typeof row !== "object") return null;
  if (!row.id && !row.orderId) return null;
  if (row.product_id || row.created_at) return fromOrderRow(row);
  return {
    id: row.id || row.orderId,
    productId: row.productId || "neuro-series-6",
    productTitle: row.productTitle || "신경계 임상추론 시리즈 6편",
    amount: row.amount || "3,900원",
    depositor: row.depositor || "",
    email: row.email || "",
    phoneLast4: row.phoneLast4 || row.phone_last4 || "",
    memo: row.memo || "",
    status: row.status || "pending",
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    approvedAt: row.approvedAt || row.approved_at || "",
    updatedAt: row.updatedAt || row.updated_at || new Date().toISOString()
  };
}

async function fetchPendingOrders(limit = 20) {
  const payload = await rpc("admin_dashboard_payload", { p_secret: env("ADMIN_ACCESS_SECRET") });
  return (Array.isArray(payload?.bankOrders) ? payload.bankOrders : [])
    .filter((order) => order.status === "pending")
    .slice(0, Math.max(1, Math.min(Number(limit) || 20, 100)));
}

async function approveOrder(order) {
  const result = await rpc("admin_update_bank_order", {
    p_secret: env("ADMIN_ACCESS_SECRET"),
    p_order_id: order.id,
    p_action: "approve"
  });
  return { ...order, ...result, status: "approved" };
}

async function postSlack(order, status) {
  const webhookUrl = env("SLACK_WEBHOOK_URL");
  if (!webhookUrl) return { skipped: true, reason: "SLACK_WEBHOOK_URL missing" };

  const siteUrl = env("SITE_URL", DEFAULT_SITE_URL);
  const text = [
    `PYM 프리미엄 구매신청 ${status === "approved" ? "자동 승인 완료" : "접수"}`,
    `주문번호: ${order.id}`,
    `상품: ${order.productTitle}`,
    `금액: ${order.amount}`,
    `입금자: ${order.depositor}`,
    `이메일: ${order.email}`,
    `휴대폰 뒤 4자리: ${order.phoneLast4 || "----"}`,
    `상태: ${status === "approved" ? "승인완료" : order.status}`,
    `관리: ${siteUrl}/#admin-premium`
  ].join("\n");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`Slack ${response.status}: ${await response.text().catch(() => "")}`);
  }
  return { ok: true };
}

async function sendApprovalEmail(order) {
  const resendApiKey = env("RESEND_API_KEY");
  if (!resendApiKey) return { skipped: true, reason: "RESEND_API_KEY missing" };
  if (!order.email) return { skipped: true, reason: "order email missing" };

  const siteUrl = env("SITE_URL", DEFAULT_SITE_URL);
  const from = env("MAIL_FROM", "PYM Search <onboarding@resend.dev>");
  const replyTo = env("MAIL_REPLY_TO");
  const premiumUrl = `${siteUrl}/#premium`;
  const buyerName = order.depositor || "구매자";
  const subject = `[PYM] ${order.productTitle} 구매 감사드립니다`;
  const text = [
    `${buyerName}님! 자료 구매 감사드립니다!!`,
    "",
    "지금부터 사이트에서 열람 및 다운로드가 가능하십니다!",
    "행복한 하루 되세요 :)",
    "",
    `주문번호: ${order.id}`,
    `상품: ${order.productTitle}`,
    `금액: ${order.amount}`,
    "",
    `자료 열람 및 다운로드: ${premiumUrl}`,
    "",
    "주문번호를 잊었다면 구매 신청 때 입력한 입금자명, 이메일, 휴대폰 뒤 4자리로 조회할 수 있습니다.",
    "",
    "감사합니다.",
    "PYM Search"
  ].join("\n");

  const html = `
    <div style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.65;color:#111827\">
      <h2 style=\"margin:0 0 12px\">자료 구매 감사드립니다!</h2>
      <p><strong>${escapeHtml(buyerName)}님!</strong> 자료 구매 감사드립니다!!</p>
      <p>지금부터 사이트에서 열람 및 다운로드가 가능하십니다!<br>행복한 하루 되세요 :)</p>
      <div style=\"background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0\">
        <p><strong>주문번호</strong><br>${escapeHtml(order.id)}</p>
        <p><strong>상품</strong><br>${escapeHtml(order.productTitle)}</p>
        <p><strong>금액</strong><br>${escapeHtml(order.amount)}</p>
      </div>
      <p><a href=\"${escapeHtml(premiumUrl)}\" style=\"display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700\">자료 열람하러 가기</a></p>
      <p style=\"color:#6b7280;font-size:14px\">주문번호를 잊었다면 구매 신청 때 입력한 입금자명, 이메일, 휴대폰 뒤 4자리로 조회할 수 있습니다.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `premium-purchase-${order.id}`
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text().catch(() => "")}`);
  }
  return { ok: true };
}

export async function notifyApprovedOrder(order) {
  const delivery = { slack: null, email: null };
  try {
    delivery.slack = await postSlack(order, "approved");
  } catch (error) {
    delivery.slack = { error: error.message || "Slack notification failed" };
  }
  try {
    delivery.email = await sendApprovalEmail(order);
  } catch (error) {
    delivery.email = { error: error.message || "Email delivery failed" };
  }
  return delivery;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function processOrder(order) {
  if (!order?.id) return { skipped: true, reason: "missing order id" };
  if (order.status === "approved") return { orderId: order.id, skipped: true, reason: "already approved" };

  let finalOrder = order;
  const result = { orderId: order.id, startedStatus: order.status, approved: false, slack: null, email: null };

  if (AUTO_APPROVE) {
    finalOrder = await approveOrder(order);
    result.approved = true;
    const delivery = await notifyApprovedOrder(finalOrder);
    result.slack = delivery.slack;
    result.email = delivery.email;
    return result;
  }

  // Slack 장애가 구매자 메일 발송을 막지 않도록 두 작업을 독립적으로 처리한다.
  try {
    result.slack = await postSlack(finalOrder, finalOrder.status);
  } catch (error) {
    result.slack = { error: error.message || "Slack notification failed" };
  }
  result.email = { skipped: true, reason: "awaiting payment approval" };

  return result;
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    json(res, 405, { error: "GET or POST only" });
    return;
  }

  if (!authOk(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const incoming = req.method === "POST" ? orderFromWebhookBody(body) : null;
    const orders = incoming ? [incoming] : await fetchPendingOrders(Number(env("BANK_ORDER_AUTOMATION_LIMIT", "20")));
    const results = [];

    for (const order of orders) {
      try {
        results.push(await processOrder(order));
      } catch (error) {
        results.push({ orderId: order?.id || "", error: error.message || "Unknown error" });
      }
    }

    json(res, 200, {
      ok: true,
      processed: results.length,
      autoApprove: AUTO_APPROVE,
      results
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Bank order automation failed" });
  }
}
