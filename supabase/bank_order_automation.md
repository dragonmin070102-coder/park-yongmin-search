# Bank Order Automation

프리미엄 계좌이체 구매 신청이 들어오면 서버에서 다음 순서로 처리합니다.

1. Slack으로 구매 신청 알림 전송
2. 실제 입금 여부와 관계없이 `bank_transfer_orders.status`를 즉시 `approved`로 변경
3. Resend를 통해 구매자 이메일로 구매 감사 및 자료 열람 안내 발송

## Vercel Environment Variables

Vercel 프로젝트 Settings > Environment Variables에 아래 값을 추가합니다.

```text
SUPABASE_URL=https://htoocddwxzgspqdihonm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=Supabase service_role key
BANK_ORDER_AUTOMATION_SECRET=긴 랜덤 문자열
CRON_SECRET=위와 같은 값이어도 됨
SLACK_WEBHOOK_URL=Slack Incoming Webhook URL
RESEND_API_KEY=Resend API Key
MAIL_FROM=PYM Search <verified-domain@example.com>
MAIL_REPLY_TO=답장 받을 이메일
SITE_URL=https://park-yongmin-search.vercel.app
```

`SUPABASE_SERVICE_ROLE_KEY`, `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`는 절대 프론트엔드 코드에 넣지 않습니다.

## Supabase Webhook

운영 DB에는 `supabase/bank_order_automation.sql`의 트리거가 적용되어 있습니다. 공유 비밀값은 SQL에 넣지 않고 Supabase Vault의 `bank_order_automation_secret`에 저장합니다.

대시보드에서 직접 설정할 경우 아래와 동일하게 구성합니다.

- Table: `bank_transfer_orders`
- Event: `Insert`
- Method: `POST`
- URL: `https://park-yongmin-search.vercel.app/api/bank-order-automation`
- Headers:

```text
x-automation-secret: BANK_ORDER_AUTOMATION_SECRET 값
content-type: application/json
```

Webhook이 호출되면 새 주문 1건을 즉시 처리합니다.

## Vercel Cron Backup

`vercel.json`에 매일 `/api/bank-order-automation`을 호출하는 Cron을 추가했습니다.
Webhook이 실패해도 pending 주문을 다시 찾아 처리하는 백업입니다.

Vercel Cron은 `CRON_SECRET` 환경변수가 있으면 `Authorization: Bearer CRON_SECRET`으로 호출됩니다.

## Email

메일 발송은 Resend를 사용합니다. `RESEND_API_KEY`가 없으면 주문 승인은 처리되지만 이메일은 건너뜁니다. 운영 환경에서는 반드시 설정해야 합니다.

메일 요청에는 주문번호 기반 `Idempotency-Key`가 포함되어 웹훅 재시도 시 같은 안내 메일이 중복 발송되지 않습니다.

Resend는 처음에는 `onboarding@resend.dev` 테스트 발신자가 제한될 수 있으므로, 실제 운영 전에는 도메인 인증 후 `MAIL_FROM`을 바꾸는 것을 권장합니다.
