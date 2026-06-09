# 자료 업데이트 방법

앱 검색 자료는 `data/resources.json`에서 관리합니다.

## 새 자료 추가 순서

1. `data/resources.json`을 엽니다.
2. `resources` 배열 마지막에 새 자료 객체를 추가합니다.
3. `id`는 영어/숫자/하이픈으로 고유하게 만듭니다.
4. `url`에는 박용민 PDF 원본 Drive 링크를 넣습니다.
5. `tags`, `keywords`, `related`는 배열로 입력합니다.
6. 저장 후 로컬 앱을 새로고침합니다.

## 필수 필드

- `id`
- `title`
- `displayTitle`
- `system`
- `intent`
- `stage`
- `format`
- `source`
- `url`
- `summary`
- `points`
- `useCase`
- `evidence`
- `tags`
- `keywords`
- `related`
- `confidence`
- `rank`

## CSV 초안

`data/resources-template.csv`는 자료를 표로 정리하기 위한 초안입니다.
구글시트에서 관리하고 싶을 때 이 컬럼 구조를 그대로 쓰면 됩니다.
