import { NextRequest, NextResponse } from "next/server";
import { getCounters, incrementRun, incrementVisit } from "@/lib/kv";

// PRD 7.6: 누적 방문자 수 / 실행 수 (개인별 집계 없이 전체 카운터 1개씩)

export async function GET() {
  const counters = await getCounters();
  return NextResponse.json(counters);
}

interface StatsRequestBody {
  type: "visit" | "run";
}

export async function POST(req: NextRequest) {
  let body: StatsRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (body.type === "visit") {
    const visits = await incrementVisit();
    return NextResponse.json({ visits });
  }

  if (body.type === "run") {
    const runs = await incrementRun();
    return NextResponse.json({ runs });
  }

  return NextResponse.json({ error: "type은 'visit' 또는 'run'이어야 합니다." }, { status: 400 });
}
