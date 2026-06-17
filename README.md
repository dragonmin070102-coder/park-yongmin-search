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
