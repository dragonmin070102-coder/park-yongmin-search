# PYM Searching Agent

Google Drive의 `박용민 컨텐츠 정리본 PDF` 폴더 안 PDF 자료와 주간 간호 동향을 학생들이 쉽게 검색하고, 간단 설명을 본 뒤 원본 PDF나 기사 요약으로 이동할 수 있게 만든 정적 프로토타입입니다.

## Run

```sh
python3 -m http.server 5279
```

Open `http://127.0.0.1:5279`.

## Deploy

이 프로젝트는 빌드 과정이 없는 정적 사이트입니다. 아래 파일만 저장소 루트에 올리면 GitHub Pages, Netlify, Vercel에서 바로 배포할 수 있습니다.

- `index.html`
- `styles.css`
- `src/main.js`
- `assets/nurse-guide.png`

GitHub Pages 기준:

1. GitHub에서 새 public repository를 만든다.
2. 위 파일과 `src` 폴더를 저장소 루트에 업로드한다.
3. Repository `Settings` -> `Pages` -> `Build and deployment`에서 `Deploy from a branch`를 선택한다.
4. Branch는 `main`, folder는 `/root`로 설정한다.
5. 잠시 뒤 `https://사용자명.github.io/저장소명/` 주소로 접속한다.

## Prototype Focus

- 항상 모바일 프레임으로 표시되는 검색 경험
- 상단 고정 검색창과 가로 스크롤 필터 칩
- Drive 자료 기반 검색 카드
- 쉬운 설명, 핵심 포인트, 사용 상황 제공
- 실제 Drive 원본 링크 연결
- 계통 분류와 사용 목적 필터
- 바텀시트형 미리보기, 자료 근거, 관련 자료 추천
- 요약 및 원본 링크 복사

## Indexed Sources

- 박용민 컨텐츠 정리본 PDF
- 신경계 질환 하위 폴더

## PYM Agent MVP

PYM Agent는 기존 `data/resources.json` 자료에서 키워드 후보를 먼저 찾고, NVIDIA Retrieval reranker로 관련도를 다시 정렬한 뒤, 관련 자료 제목/요약/근거를 NVIDIA NIM LLM 프롬프트에 넣어 답변하는 RAG 챗봇입니다. Reranker가 실패하면 기존 키워드 검색 결과로 자동 fallback됩니다.

### API 환경변수

서버리스 배포 환경에 아래 값을 설정합니다. 이 값은 프론트엔드에 넣으면 안 됩니다.

- `NVIDIA_API_KEY`: NVIDIA NIM API Key
- `NVIDIA_MODEL`: 선택값. 기본값은 `moonshotai/kimi-k2.6`
- `NVIDIA_RERANK_MODEL`: 선택값. 기본값은 `nvidia/llama-nemotron-rerank-1b-v2`
- `NVIDIA_RERANK_ENABLED`: 선택값. `false`로 두면 rerank 없이 키워드 검색만 사용
- `NVIDIA_RERANK_TIMEOUT_MS`: 선택값. 기본값은 `7000`
- `PYM_AGENT_ALLOWED_ORIGIN`: 선택값. 허용할 사이트 Origin

LLM 답변과 Retrieval reranker는 같은 `NVIDIA_API_KEY`를 사용합니다. 별도 키를 추가로 발급할 필요는 없지만, NVIDIA 계정/크레딧/모델 접근 권한에 따라 특정 모델 호출이 막힐 수 있습니다.

### 로컬/배포 메모

정적 GitHub Pages만으로는 `/api/pym-agent` 서버리스 함수가 실행되지 않습니다. 챗봇 답변 생성을 쓰려면 Vercel, Netlify Functions, Cloudflare Workers, Supabase Edge Functions 중 하나로 API를 배포해야 합니다.

Vercel 기준으로는 저장소를 연결하고 환경변수 `NVIDIA_API_KEY`를 넣으면 `api/pym-agent.js`가 `/api/pym-agent`로 동작합니다.
