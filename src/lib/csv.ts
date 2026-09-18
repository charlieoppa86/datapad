// CSV 파싱 + 컬럼 요약 생성 (PRD 7.2, 7.3)

export interface ColumnSummary {
  name: string;
  inferredType: "number" | "string" | "boolean" | "empty";
  missingRatio: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface CsvContext {
  rowCount: number;
  columnCount: number;
  columns: ColumnSummary[];
  sampleRows: string[][];
  headers: string[];
}

const SAMPLE_ROW_LIMIT = 30;

export function parseCsvText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error("CSV가 비어 있습니다.");
  }

  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(splitCsvLine);

  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((v) => v.trim());
}

function inferType(values: string[]): ColumnSummary["inferredType"] {
  const nonEmpty = values.filter((v) => v !== "");
  if (nonEmpty.length === 0) return "empty";
  if (nonEmpty.every((v) => v === "true" || v === "false")) return "boolean";
  if (nonEmpty.every((v) => v !== "" && !Number.isNaN(Number(v)))) return "number";
  return "string";
}

export function buildCsvContext(text: string): CsvContext {
  const { headers, rows } = parseCsvText(text);

  const columns: ColumnSummary[] = headers.map((name, colIdx) => {
    const values = rows.map((row) => row[colIdx] ?? "");
    const missing = values.filter((v) => v === "").length;
    const unique = new Set(values.filter((v) => v !== ""));

    return {
      name,
      inferredType: inferType(values),
      missingRatio: rows.length === 0 ? 0 : missing / rows.length,
      uniqueCount: unique.size,
      sampleValues: Array.from(unique).slice(0, 5),
    };
  });

  return {
    rowCount: rows.length,
    columnCount: headers.length,
    columns,
    sampleRows: rows.slice(0, SAMPLE_ROW_LIMIT),
    headers,
  };
}

export function formatCsvContextForPrompt(ctx: CsvContext): { summaryText: string; sampleRowsText: string } {
  const summaryText = ctx.columns
    .map((c) => {
      const missingPct = (c.missingRatio * 100).toFixed(1);
      return `- ${c.name} (${c.inferredType}): 결측치 ${missingPct}%, 고유값 ${c.uniqueCount}개, 예시 [${c.sampleValues.join(", ")}]`;
    })
    .join("\n");

  const header = ctx.headers.map(csvEscape).join(",");
  const rows = ctx.sampleRows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const sampleRowsText = `${header}\n${rows}`;

  return { summaryText, sampleRowsText };
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
