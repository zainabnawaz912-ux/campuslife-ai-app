import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — CampusLife AI" },
      { name: "description", content: "A friendly campus AI that answers, summarizes and guides." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Summarize the topic 'binary search trees' in simple language.",
  "Give me 5 quick revision tips for my exams.",
  "Which bus goes to City Centre and when?",
  "How do I report a lost item on campus?",
  "Generate 3 quiz questions on Newton's laws.",
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your CampusLife AI Assistant. Ask me about your coursework, campus services, buses, notes, or anything you'd like help with today.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 429) {
        toast.error("Rate limit reached. Please slow down and try again.");
        setLoading(false);
        return;
      }
      if (res.status === 402) {
        toast.error("AI credits exhausted. Please contact admin.");
        setLoading(false);
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error("Assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            // ignore keepalive/comments
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Campus Assistant"
        subtitle="Your friendly guide for classes, campus and everyday student life."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="flex h-[70vh] flex-col overflow-hidden">
          <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "flex items-start gap-3 " + (m.role === "user" ? "flex-row-reverse text-right" : "")
                }
              >
                <div
                  className={
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full " +
                    (m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-primary text-primary-foreground")
                  }
                >
                  {m.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div
                  className={
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                    (m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t bg-card p-3"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about coursework, buses, notes, campus…"
                className="min-h-[48px] resize-none rounded-xl"
              />
              <Button type="submit" disabled={loading} className="h-auto rounded-xl px-4">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="hidden h-fit lg:block">
          <CardContent className="p-5">
            <div className="text-sm font-semibold">Try asking</div>
            <div className="mt-3 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-left text-xs hover:border-primary/40 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              The AI Assistant answers in simple language and never invents facts about your specific
              campus. For official info, cross-check the announcements page.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
