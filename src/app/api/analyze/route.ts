import { NextRequest, NextResponse } from "next/server";
import { buildCsvContext, formatCsvContextForPrompt } from "@/lib/csv";
import { askLlm } from "@/lib/llm";

// PRD 6, 8: 파일 크기 제한 4MB (Vercel 함수 body 한도 4.5MB 이내)
const MAX_CSV_BYTES = 4 * 1024 * 1024;

interface AnalyzeRequestBody {
  csvText: string;
  question: string;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { csvText, question } = body;

  if (!csvText || !question) {
    return NextResponse.json({ error: "csvText와 question은 필수입니다." }, { status: 400 });
  }

  if (Buffer.byteLength(csvText, "utf8") > MAX_CSV_BYTES) {
    return NextResponse.json({ error: "CSV 파일이 4MB를 초과합니다." }, { status: 413 });
  }

  let csvContext;
  try {
    csvContext = buildCsvContext(csvText);
  } catch {
    return NextResponse.json({ error: "CSV 파싱에 실패했습니다. 인코딩/구분자를 확인해주세요." }, { status: 422 });
  }

  const { summaryText, sampleRowsText } = formatCsvContextForPrompt(csvContext);

  try {
    const answer = await askLlm({ question, summaryText, sampleRowsText });
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "LLM 응답 생성에 실패했습니다." }, { status: 502 });
  }
}
