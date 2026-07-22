# PYM Analytics Workspace

운영 Supabase 데이터를 개인정보 없이 집계해 로컬에서 분석하기 위한 작업공간입니다.

## Export

```sh
npm run analytics:export
```

기본 기간은 최근 90일입니다. 기간을 바꾸려면 다음처럼 직접 실행합니다.

```sh
node --env-file=.env.admin.local analytics/export.mjs 30
```

생성 파일은 `analytics/data/` 아래에 저장됩니다.

- `latest.json`: 전체 익명 집계
- `daily.csv`: 일별 사용자·세션·핵심 이벤트
- `event-mix.csv`: 이벤트 종류별 규모
- `search-terms.csv`: 검색어·무결과 검색
- `resources.csv`: 자료별 열람·좋아요
- `funnel.csv`: 프리미엄 퍼널
- `quality.csv`: 데이터 품질 점검
- `summary.md`: 자동 요약

생성 데이터는 운영 수치를 포함하므로 Git에는 커밋하지 않습니다. 구매자 이름, 이메일, 전화번호, 주문번호, 댓글 본문은 export에 포함되지 않습니다.

지표 정의와 주의점은 `semantic-layer/references/semantic-layer.md`를 기준으로 사용합니다.
