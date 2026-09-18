// 질문 + CSV 요약으로 LLM 호출 (PRD 7.3)
// 벤더는 PRD 10 오픈 이슈 — Anthropic을 기본값으로 두되 필요시 교체.

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT =
  "아래 데이터 요약과 샘플을 참고해 사용자의 질문에 답하라. 데이터를 비교하거나 진단 리포트를 작성하지 말고, 주어진 데이터만 근거로 자연어 문단으로 답하라.";

export interface AskLlmParams {
  question: string;
  summaryText: string;
  sampleRowsText: string;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function askLlm({ question, summaryText, sampleRowsText }: AskLlmParams): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          `[컬럼 요약]\n${summaryText}`,
          `[샘플 데이터]\n${sampleRowsText}`,
          `[질문]\n${question}`,
        ].join("\n\n"),
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("LLM 응답에서 텍스트를 찾을 수 없습니다.");
  }
  return textBlock.text;
}
