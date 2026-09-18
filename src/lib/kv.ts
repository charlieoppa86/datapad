// 누적 방문자 수 / 실행 수 카운터 (PRD 7.6)
// 운영 환경: Upstash Redis (Vercel Marketplace 연동 시 KV_REST_API_URL/TOKEN 자동 주입)
// 로컬 개발: env 미설정 시 인메모리 폴백 (서버 재시작 시 초기화됨)

import { Redis } from "@upstash/redis";

const VISITS_KEY = "datapad:visits";
const RUNS_KEY = "datapad:runs";

const hasUpstashEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const redis = hasUpstashEnv
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

// 로컬 개발용 인메모리 폴백
const memoryCounters = { visits: 0, runs: 0 };

export async function incrementVisit(): Promise<number> {
  if (redis) return redis.incr(VISITS_KEY);
  return ++memoryCounters.visits;
}

export async function incrementRun(): Promise<number> {
  if (redis) return redis.incr(RUNS_KEY);
  return ++memoryCounters.runs;
}

export async function getCounters(): Promise<{ visits: number; runs: number }> {
  if (redis) {
    const [visits, runs] = await Promise.all([redis.get<number>(VISITS_KEY), redis.get<number>(RUNS_KEY)]);
    return { visits: visits ?? 0, runs: runs ?? 0 };
  }
  return { ...memoryCounters };
}
