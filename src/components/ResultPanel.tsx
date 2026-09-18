"use client";

export type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; answer: string };

export default function ResultPanel({ label, result }: { label: string; result: ResultState }) {
  return (
    <div className="flex min-h-[320px] min-w-0 flex-1 flex-col rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">{label}</h2>

      {result.status === "idle" && (
        <p className="text-xs text-text-secondary">Run을 누르면 답변이 여기 표시됩니다.</p>
      )}
      {result.status === "loading" && (
        <p className="text-xs text-text-secondary">답변 생성 중…</p>
      )}
      {result.status === "error" && <p className="break-words text-xs text-error">{result.message}</p>}
      {result.status === "done" && (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary">
          {result.answer}
        </p>
      )}
    </div>
  );
}
