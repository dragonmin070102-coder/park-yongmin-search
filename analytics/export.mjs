import fs from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = String(process.env.SUPABASE_URL || "https://htoocddwxzgspqdihonm.supabase.co").replace(/\/$/, "");
const SUPABASE_KEY = String(process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_azcwJigJPfzpdcnNKFBm6g_dA_HQU-F");
const ADMIN_SECRET = String(process.env.ADMIN_ACCESS_SECRET || process.env.PYM_ADMIN_PASSWORD || "");
const DAYS = Math.max(1, Math.min(Number(process.argv[2]) || 90, 365));
const outputDir = path.join(process.cwd(), "analytics", "data");

if (!ADMIN_SECRET) {
  throw new Error("ADMIN_ACCESS_SECRET 또는 PYM_ADMIN_PASSWORD가 필요합니다.");
}

const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_analytics_export`, {
  method: "POST",
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ p_secret: ADMIN_SECRET, p_days: DAYS })
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  throw new Error(body.message || body.error || `Supabase analytics export failed: ${response.status}`);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "latest.json"), `${JSON.stringify(body, null, 2)}\n`);

const datasets = {
  daily: body.daily || [],
  "event-mix": body.eventMix || [],
  "search-terms": body.searchTerms || [],
  resources: body.resources || [],
  funnel: body.funnel ? [body.funnel] : [],
  quality: body.quality ? [body.quality] : []
};

for (const [name, rows] of Object.entries(datasets)) {
  await fs.writeFile(path.join(outputDir, `${name}.csv`), toCsv(rows));
}

await fs.writeFile(path.join(outputDir, "summary.md"), buildSummary(body));
console.log(`Analytics export complete: ${outputDir} (${body.metadata?.periodDays || DAYS} days)`);

function toCsv(rows) {
  if (!rows.length) return "";
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escape = (value) => {
    const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return `${columns.map(escape).join(",")}\n${rows.map((row) => columns.map((column) => escape(row[column])).join(",")).join("\n")}\n`;
}

function rate(value, denominator) {
  return denominator ? `${(Number(value || 0) / Number(denominator) * 100).toFixed(1)}%` : "0.0%";
}

function buildSummary(data) {
  const events = new Map((data.eventMix || []).map((row) => [row.event_name, Number(row.events || 0)]));
  const funnel = data.funnel || {};
  const searches = events.get("search") || 0;
  const noResults = events.get("search_no_result") || 0;
  const topResources = (data.resources || []).slice(0, 10);
  const topSearches = (data.searchTerms || []).filter((row) => Number(row.searches || 0) > 0).slice(0, 10);
  return `# PYM Analytics Snapshot

- Generated: ${data.metadata?.generatedAt || new Date().toISOString()}
- Period: ${data.metadata?.periodDays || DAYS} days
- Time zone: ${data.metadata?.timezone || "Asia/Seoul"}
- Personal data included: no

## Core totals

- Events: ${data.summary?.events || 0}
- Anonymous users: ${data.summary?.users || 0}
- Sessions: ${data.summary?.sessions || 0}
- Orders: ${data.summary?.orders || 0}
- Approved orders: ${data.summary?.approvedOrders || 0}
- Search no-result rate: ${rate(noResults, searches)} (${noResults}/${searches})

## Premium funnel (unique anonymous users)

- Visitors: ${funnel.visitors || 0}
- Premium visitors: ${funnel.premium_visitors || 0} (${rate(funnel.premium_visitors, funnel.visitors)})
- Checkout clickers: ${funnel.checkout_clickers || 0} (${rate(funnel.checkout_clickers, funnel.premium_visitors)} of premium visitors)
- Order submitters: ${funnel.order_submitters || 0} (${rate(funnel.order_submitters, funnel.checkout_clickers)} of checkout clickers)
- File openers: ${funnel.file_openers || 0}

## Top resources

${topResources.map((row, index) => `${index + 1}. ${row.resource_id}: ${row.opens} opens / ${row.users} users`).join("\n") || "No data"}

## Top search terms

${topSearches.map((row, index) => `${index + 1}. ${row.query}: ${row.searches} searches / ${row.users} users`).join("\n") || "No data"}

## Data quality

- Duplicate event IDs: ${data.quality?.duplicate_event_ids || 0}
- Missing required fields: ${data.quality?.missing_required || 0}
- Future-dated rows: ${data.quality?.future_rows || 0}
- Event types: ${data.quality?.event_types || 0}

## Interpretation guardrails

- Treat anonymous users as browser identifiers, not verified people.
- Do not sum event counts as engagement without excluding automatic impression events.
- Use \`search_no_result\` events for no-result measurement; older \`search.properties.resultCount\` is not reliable.
- Funnel values are unique users per step, not a strict same-session ordered cohort.
`;
}
