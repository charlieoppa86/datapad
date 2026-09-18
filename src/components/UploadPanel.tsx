"use client";

import { useRef, useState } from "react";
import { buildCsvContext, type CsvContext } from "@/lib/csv";

const MAX_BYTES = 4 * 1024 * 1024;
const PREVIEW_ROWS = 8;

interface UploadPanelProps {
  label: string;
  sampleUrl: string;
  sampleFileName: string;
  onLoaded: (text: string, ctx: CsvContext) => void;
  onCleared: () => void;
}

export default function UploadPanel({
  label,
  sampleUrl,
  sampleFileName,
  onLoaded,
  onCleared,
}: UploadPanelProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [ctx, setCtx] = useState<CsvContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError("파일이 4MB를 초과합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      try {
        const parsed = buildCsvContext(text);
        setFileName(file.name);
        setCtx(parsed);
        onLoaded(text, parsed);
      } catch {
        setError("CSV 파싱에 실패했습니다. 인코딩/구분자를 확인해주세요.");
        setFileName(null);
        setCtx(null);
        onCleared();
      }
    };
    reader.onerror = () => setError("파일을 읽는 중 오류가 발생했습니다.");
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
        <a
          href={sampleUrl}
          download={sampleFileName}
          className="text-xs text-primary hover:text-primary-hover"
        >
          샘플 다운로드
        </a>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center text-xs transition-colors ${
          isDragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-text-secondary hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {fileName ? (
          <span className="font-medium text-text-primary">{fileName}</span>
        ) : (
          <span>CSV 파일을 드래그하거나 클릭해서 업로드</span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      {ctx && (
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-background">
                {ctx.headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-1.5 font-medium text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ctx.sampleRows.slice(0, PREVIEW_ROWS).map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-2 py-1.5 text-text-primary">
                      {cell || <span className="text-text-secondary">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-border px-2 py-1.5 text-[11px] text-text-secondary">
            {ctx.rowCount}행 · {ctx.columnCount}열
          </p>
        </div>
      )}
    </div>
  );
}
