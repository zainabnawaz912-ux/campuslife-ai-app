/** Client-side PDF text extraction + shared helpers for the AI Learning Hub. */

export const MAX_PDF_BYTES = 15 * 1024 * 1024;

export async function extractPdfText(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const total = doc.numPages;
  const chunks: string[] = [];

  for (let i = 1; i <= total; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) chunks.push(text);
    onProgress?.(i, total);
  }

  await doc.destroy();
  return chunks.join("\n\n").trim();
}

export async function runAiTask(task: string, data: Record<string, unknown>): Promise<string> {
  const res = await fetch("/api/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, data }),
  });
  const json = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!res.ok || !json.text) {
    throw new Error(json.error || "Something went wrong. Please try again.");
  }
  return json.text;
}

/** Models sometimes wrap JSON in prose or code fences — recover the payload. */
export function parseJsonBlock<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }
    throw new Error("The AI response could not be read. Please try again.");
  }
}

export type Mcq = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

export type Flashcard = { front: string; back: string };
