import {
  BookOpenCheck,
  Brain,
  CalendarRange,
  CheckCircle2,
  FileText,
  Layers,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { MarkdownView } from "@/components/learning/MarkdownView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  extractPdfText,
  MAX_PDF_BYTES,
  parseJsonBlock,
  runAiTask,
  type Flashcard,
  type Mcq,
} from "@/lib/ai-learning";
import { cn } from "@/lib/utils";

type Tool = "summary" | "keypoints" | "explain" | "studyplan" | "mcq" | "flashcards" | "chat";

const TEXT_TOOLS: Array<{ id: Tool; label: string; icon: typeof FileText; hint: string }> = [
  { id: "summary", label: "Summarize", icon: FileText, hint: "Revision-ready summary" },
  { id: "keypoints", label: "Key points", icon: ListChecks, hint: "The must-know bullets" },
  { id: "explain", label: "Explain simply", icon: Lightbulb, hint: "Beginner-friendly" },
  { id: "studyplan", label: "Study plan", icon: CalendarRange, hint: "7-day plan from your notes" },
];

type ChatMsg = { role: "user" | "assistant"; content: string };

export function AiNotesTab() {
  const [fileName, setFileName] = useState("");
  const [doc, setDoc] = useState("");
  const [reading, setReading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [tool, setTool] = useState<Tool>("summary");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const [mcqCount, setMcqCount] = useState("10");
  const [quiz, setQuiz] = useState<Mcq[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetOutputs = () => {
    setResult("");
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setCards(null);
    setFlipped({});
    setChat([]);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("That PDF is larger than 15 MB. Try a smaller file.");
      return;
    }
    setReading(true);
    setReadProgress(0);
    resetOutputs();
    try {
      const text = await extractPdfText(file, (page, total) =>
        setReadProgress(Math.round((page / total) * 100)),
      );
      if (text.trim().length < 40) {
        toast.error("We couldn't read text from that PDF — it may be a scanned image.");
        setDoc("");
        setFileName("");
        return;
      }
      setDoc(text);
      setFileName(file.name);
      toast.success(`"${file.name}" is ready. Pick an AI tool below.`);
    } catch {
      toast.error("Could not read that PDF. Please try another file.");
    } finally {
      setReading(false);
    }
  };

  const run = async (id: Tool) => {
    if (!doc) {
      toast.error("Upload a PDF first.");
      return;
    }
    setTool(id);
    setBusy(true);
    try {
      if (id === "mcq") {
        const raw = await runAiTask("mcq", { document: doc, count: Number(mcqCount) });
        const parsed = parseJsonBlock<{ questions: Mcq[] }>(raw);
        const questions = (parsed.questions ?? []).filter(
          (q) => q?.question && Array.isArray(q.options) && q.options.length >= 2,
        );
        if (!questions.length) throw new Error("No questions were generated. Please retry.");
        setQuiz(questions);
        setAnswers({});
        setSubmitted(false);
        setResult("");
        toast.success(`${questions.length} questions ready — good luck!`);
      } else if (id === "flashcards") {
        const raw = await runAiTask("flashcards", { document: doc, count: 12 });
        const parsed = parseJsonBlock<{ cards: Flashcard[] }>(raw);
        const list = (parsed.cards ?? []).filter((c) => c?.front && c?.back);
        if (!list.length) throw new Error("No flashcards were generated. Please retry.");
        setCards(list);
        setFlipped({});
        setResult("");
        toast.success(`${list.length} flashcards created.`);
      } else {
        const text = await runAiTask(id, { document: doc });
        setResult(text);
        setQuiz(null);
        setCards(null);
        toast.success("Done!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || busy) return;
    if (!doc) {
      toast.error("Upload a PDF first.");
      return;
    }
    setQuestion("");
    setChat((prev) => [...prev, { role: "user", content: q }]);
    setBusy(true);
    try {
      const text = await runAiTask("chat", { document: doc, question: q });
      setChat((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
      setChat((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setBusy(false);
    }
  };

  const score = quiz
    ? quiz.reduce((acc, q, i) => (answers[i] === q.answer ? acc + 1 : acc), 0)
    : 0;

  return (
    <div className="space-y-5">
      {/* Upload */}
      <Card>
        <CardContent className="p-5">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {!fileName ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={reading}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFile(e.dataTransfer.files?.[0]);
              }}
              className="grid w-full place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary/60 hover:bg-primary/5 disabled:opacity-70"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                {reading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              </div>
              <div className="mt-3 font-semibold">
                {reading ? "Reading your PDF…" : "Upload a PDF to start"}
              </div>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Drag & drop or tap to choose your notes. Text-based PDFs up to 15 MB.
              </p>
              {reading && <Progress value={readProgress} className="mt-4 h-1.5 w-48" />}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {doc.length.toLocaleString()} characters ready for AI
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => inputRef.current?.click()}>
                  <Upload size={14} /> Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setDoc("");
                    setFileName("");
                    resetOutputs();
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="text-primary" /> AI tools
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TEXT_TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={!doc || busy}
                onClick={() => void run(t.id)}
                className={cn(
                  "rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow disabled:pointer-events-none disabled:opacity-50",
                  tool === t.id && busy && "border-primary/60",
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  {busy && tool === t.id ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : (
                    <t.icon size={16} className="text-primary" />
                  )}
                  {t.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t.hint}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl border border-border p-3">
              <Select value={mcqCount} onValueChange={setMcqCount}>
                <SelectTrigger className="h-9 w-28 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 MCQs</SelectItem>
                  <SelectItem value="20">20 MCQs</SelectItem>
                  <SelectItem value="30">30 MCQs</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="h-9 flex-1 rounded-xl"
                disabled={!doc || busy}
                onClick={() => void run("mcq")}
              >
                {busy && tool === "mcq" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Brain size={14} />
                )}
                Start quiz
              </Button>
            </div>
            <Button
              variant="outline"
              className="h-[58px] rounded-2xl"
              disabled={!doc || busy}
              onClick={() => void run("flashcards")}
            >
              {busy && tool === "flashcards" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Layers size={14} />
              )}
              Create flashcards
            </Button>
          </div>
        </CardContent>
      </Card>

      {busy && !quiz && !cards && !result && (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin text-primary" />
            CampusLife AI is working through your notes…
          </CardContent>
        </Card>
      )}

      {/* Text result */}
      {result && (
        <Card className="animate-in fade-in-50">
          <CardContent className="p-5">
            <MarkdownView>{result}</MarkdownView>
          </CardContent>
        </Card>
      )}

      {/* Quiz */}
      {quiz && (
        <Card className="animate-in fade-in-50">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <BookOpenCheck size={16} className="text-primary" /> Quiz mode
              </div>
              {submitted ? (
                <Badge className="rounded-full">
                  Score {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)
                </Badge>
              ) : (
                <Badge variant="secondary" className="rounded-full">
                  {Object.keys(answers).length}/{quiz.length} answered
                </Badge>
              )}
            </div>

            {quiz.map((q, i) => (
              <div key={i} className="rounded-2xl border border-border p-4">
                <div className="text-sm font-medium">
                  {i + 1}. {q.question}
                </div>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[i] === oi;
                    const correct = submitted && oi === q.answer;
                    const wrong = submitted && picked && oi !== q.answer;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-left text-sm transition",
                          picked && !submitted && "border-primary bg-primary/10",
                          correct && "border-success bg-success/10",
                          wrong && "border-destructive bg-destructive/10",
                          !submitted && "hover:border-primary/50",
                        )}
                      >
                        {correct ? (
                          <CheckCircle2 size={15} className="shrink-0 text-success" />
                        ) : wrong ? (
                          <XCircle size={15} className="shrink-0 text-destructive" />
                        ) : (
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[10px]">
                            {String.fromCharCode(65 + oi)}
                          </span>
                        )}
                        <span className="min-w-0">{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Why: </strong>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {!submitted ? (
                <Button
                  className="rounded-xl"
                  onClick={() => {
                    if (Object.keys(answers).length < quiz.length) {
                      toast.error("Answer every question before submitting.");
                      return;
                    }
                    setSubmitted(true);
                    toast.success("Quiz submitted — check your score!");
                  }}
                >
                  Submit quiz
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                >
                  <RotateCcw size={14} /> Retake
                </Button>
              )}
              <Button variant="ghost" className="rounded-xl" onClick={() => setQuiz(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flashcards */}
      {cards && (
        <Card className="animate-in fade-in-50">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 font-semibold">
              <Layers size={16} className="text-primary" /> Flashcards
              <span className="text-xs font-normal text-muted-foreground">(tap a card to flip)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                  className={cn(
                    "min-h-28 rounded-2xl border border-border p-4 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-glow",
                    flipped[i] ? "bg-primary/5" : "bg-card",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {flipped[i] ? "Answer" : "Question"}
                  </div>
                  <div className="mt-1.5">{flipped[i] ? c.back : c.front}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat with PDF */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquare size={16} className="text-primary" /> Ask about this PDF
          </div>
          {chat.length > 0 && (
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl p-3 text-sm",
                    m.role === "user"
                      ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                      : "max-w-[95%] border border-border bg-card",
                  )}
                >
                  {m.role === "user" ? m.content : <MarkdownView>{m.content}</MarkdownView>}
                </div>
              ))}
              {busy && tool !== "mcq" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void ask();
                }
              }}
              disabled={!doc || busy}
              placeholder={doc ? "e.g. Explain the third topic with an example" : "Upload a PDF to ask questions"}
              className="h-10 rounded-xl"
            />
            <Button className="h-10 rounded-xl" disabled={!doc || busy} onClick={() => void ask()}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
