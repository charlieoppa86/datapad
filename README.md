# Datapad

Raw CSV와 AI-ready CSV에 같은 질문을 던져, LLM 답변이 데이터 품질에 따라
어떻게 달라지는지 나란히 보여주는 웹 서비스. 전체 요구사항은
[`docs/datapad_prd.md`](./docs/datapad_prd.md), 디자인 토큰은
[`docs/datapad-DESIGN.md`](./docs/datapad-DESIGN.md) 참고.

## Stack

- **Next.js 16 (App Router, TypeScript)** — 프론트엔드와 API 라우트를 한 프로젝트로.
  PRD가 요구하는 서버사이드 LLM 호출(API 키 은닉)과 CSV 처리를 위해 정적
  HTML/CSS/JS만으로는 구성할 수 없어 채택.
- **Tailwind CSS v4** — `src/app/globals.css`의 `@theme`에 디자인 문서의
  색상/폰트/spacing/radius 토큰을 그대로 반영.
- **Anthropic SDK** — `src/lib/llm.ts`, LLM 벤더는 PRD 오픈 이슈(10)로 교체 가능.
- **Upstash Redis** (`@upstash/redis`) — 누적 방문자/실행 수 카운터.
  env 미설정 시 인메모리 폴백으로 로컬 개발 가능.

## 폴더 구조

```
src/
  app/
    page.tsx              # 2-pane UI (업로드/결과) — 다음 작업에서 구현
    api/analyze/route.ts  # CSV 요약 + LLM 호출 (PRD 7.3), raw/ai-ready 각각 호출
    api/stats/route.ts    # 방문/실행 카운터 조회·증가 (PRD 7.6)
  lib/
    csv.ts                # CSV 파싱 + 컬럼 요약 생성
    llm.ts                # 질문 + 요약으로 LLM 호출
    kv.ts                 # 카운터 저장소 (Upstash / 인메모리 폴백)
```

## 시작하기

```bash
cp .env.example .env.local   # ANTHROPIC_API_KEY 채우기
npm install
npm run dev
```

http://localhost:3000 에서 확인.

## 배포

Vercel 배포 시 `ANTHROPIC_API_KEY`를 프로젝트 환경변수로 등록하고,
Vercel Marketplace에서 Upstash Redis(또는 다른 Redis) 통합을 추가하면
`KV_REST_API_URL` / `KV_REST_API_TOKEN`이 자동 주입된다.
