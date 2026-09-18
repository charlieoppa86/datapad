"use client";

import { useEffect, useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import ResultPanel, { type ResultState } from "@/components/ResultPanel";

interface Counters {
  visits: number;
  runs: number;
}

async function analyze(csvText: string, question: string): Promise<string> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvText, question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data.answer as string;
}

export default function Home() {
  const [rawText, setRawText] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [running, setRunning] = useState(false);
  const [rawResult, setRawResult] = useState<ResultState>({ status: "idle" });
  const [aiResult, setAiResult] = useState<ResultState>({ status: "idle" });
  const [counters, setCounters] = useState<Counters>({ visits: 0, runs: 0 });

  async function refreshCounters() {
    try {
      const res = await fetch("/api/stats");
      setCounters(await res.json());
    } catch {
      // 카운터는 부가 기능이므로 실패해도 무시
    }
  }

  useEffect(() => {
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit" }),
    }).finally(refreshCounters);
  }, []);

  const canRun = Boolean(rawText) && Boolean(aiText) && question.trim().length > 0 && !running;

  async function handleRun() {
    if (!rawText || !aiText) return;

    setRunning(true);
    setRawResult({ status: "loading" });
    setAiResult({ status: "loading" });

    const [rawSettled, aiSettled] = await Promise.allSettled([
      analyze(rawText, question),
      analyze(aiText, question),
    ]);

    setRawResult(
      rawSettled.status === "fulfilled"
        ? { status: "done", answer: rawSettled.value }
        : { status: "error", message: rawSettled.reason?.message ?? "요청에 실패했습니다." },
    );
    setAiResult(
      aiSettled.status === "fulfilled"
        ? { status: "done", answer: aiSettled.value }
        : { status: "error", message: aiSettled.reason?.message ?? "요청에 실패했습니다." },
    );
    setRunning(false);

    if (rawSettled.status === "fulfilled" || aiSettled.status === "fulfilled") {
      await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "run" }),
      });
      refreshCounters();
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Datapad</p>
          <h1 className="text-lg font-semibold text-text-primary">같은 질문, 다른 답변</h1>
        </div>
        <p className="text-xs text-text-secondary">
          누적 방문 {counters.visits} · 누적 실행 {counters.runs}
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <UploadPanel
            label="Raw CSV"
            sampleUrl="/samples/raw-sample.csv"
            sampleFileName="raw-sample.csv"
            onLoaded={(text) => setRawText(text)}
            onCleared={() => setRawText(null)}
          />
          <UploadPanel
            label="AI-ready CSV"
            sampleUrl="/samples/ai-ready-sample.csv"
            sampleFileName="ai-ready-sample.csv"
            onLoaded={(text) => setAiText(text)}
            onCleared={() => setAiText(null)}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 이 데이터로 고객 나이대를 분석할 수 있어?"
            className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/10"
          />
          <button
            onClick={handleRun}
            disabled={!canRun}
            className="rounded-sm bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? "실행 중…" : "Run"}
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <ResultPanel label="Raw CSV 결과" result={rawResult} />
          <ResultPanel label="AI-ready CSV 결과" result={aiResult} />
        </div>
      </main>
    </div>
  );
}
