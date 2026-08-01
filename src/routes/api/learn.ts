import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: string; content: string };

const BASE_STYLE = `You are CampusLife AI — an expert, friendly and concise study coach for university students.
Always produce accurate, well-structured, student-friendly output.
Use clean markdown (headings, bullet points, bold key terms). Never invent facts that contradict the material you are given.`;

const MAX_DOC_CHARS = 22000;

function clampDoc(doc: string) {
  const clean = (doc ?? "").replace(/\s+/g, " ").trim();
  return clean.length > MAX_DOC_CHARS
    ? `${clean.slice(0, MAX_DOC_CHARS)}\n\n[Document truncated for length]`
    : clean;
}

function buildPrompt(task: string, data: Record<string, unknown>): { system: string; user: string } | null {
  const doc = clampDoc(String(data.document ?? ""));
  const docBlock = `--- STUDENT'S UPLOADED NOTES ---\n${doc}\n--- END NOTES ---`;

  switch (task) {
    case "summary":
      return {
        system: BASE_STYLE,
        user: `${docBlock}\n\nWrite a clear, well-structured summary of these notes for revision. Start with a 2-3 sentence overview, then section-wise summaries with short headings. Keep it skimmable.`,
      };
    case "keypoints":
      return {
        system: BASE_STYLE,
        user: `${docBlock}\n\nExtract the most important key points from these notes as a bullet list grouped under short topic headings. Bold the key terms. Include formulas or definitions exactly as they appear.`,
      };
    case "explain":
      return {
        system: BASE_STYLE,
        user: `${docBlock}\n\nExplain the main concepts in these notes in very simple language, as if teaching a beginner. Use analogies and short examples. One concept per section.`,
      };
    case "studyplan":
      return {
        system: BASE_STYLE,
        user: `${docBlock}\n\nCreate a personalised study plan to master this material. Include: a day-by-day breakdown (assume 7 days), what to study each day, estimated time, revision checkpoints, and a final self-test day. Use a markdown table where helpful.`,
      };
    case "chat": {
      const question = String(data.question ?? "").trim();
      if (!question) return null;
      return {
        system: `${BASE_STYLE}\nAnswer strictly using the student's uploaded notes. If the answer is not in the notes, say so honestly and then give a brief general explanation clearly labelled as outside the notes.`,
        user: `${docBlock}\n\nStudent question: ${question}`,
      };
    }
    case "mcq": {
      const count = Math.min(Math.max(Number(data.count ?? 10) || 10, 5), 30);
      return {
        system: `${BASE_STYLE}\nYou reply with raw JSON only. No markdown fences, no commentary.`,
        user: `${docBlock}\n\nGenerate exactly ${count} multiple-choice questions from these notes, ordered easy to hard.
Return JSON with this exact shape:
{"questions":[{"question":"...","options":["A text","B text","C text","D text"],"answer":0,"explanation":"why this is correct"}]}
"answer" is the zero-based index of the correct option. Exactly 4 options per question.`,
      };
    }
    case "flashcards": {
      const count = Math.min(Math.max(Number(data.count ?? 12) || 12, 5), 30);
      return {
        system: `${BASE_STYLE}\nYou reply with raw JSON only. No markdown fences, no commentary.`,
        user: `${docBlock}\n\nCreate exactly ${count} revision flashcards from these notes.
Return JSON: {"cards":[{"front":"question or term","back":"concise answer or definition"}]}`,
      };
    }
    case "coach": {
      const subjects = String(data.subjects ?? "").trim();
      const examDate = String(data.examDate ?? "").trim();
      const hours = String(data.hours ?? "").trim();
      const goal = String(data.goal ?? "").trim();
      if (!subjects) return null;
      return {
        system: BASE_STYLE,
        user: `Act as a personal AI study coach. Build a complete, realistic study strategy.

Student details:
- Subjects/topics: ${subjects}
- Exam date: ${examDate || "not specified"}
- Available study hours per day: ${hours || "not specified"}
- Learning goal: ${goal || "score well and understand deeply"}

Produce these sections with markdown headings, in this order:
1. **Daily Study Timetable** — an hour-by-hour table for a typical day fitting the available hours.
2. **Weekly Revision Schedule** — a table mapping each week/day until the exam to subjects and revision type.
3. **Priority Topics** — ranked list with why each matters.
4. **Smart Study Recommendations** — techniques (active recall, spaced repetition, past papers) tailored to the subjects.
5. **Motivation Tips** — 5 short, genuine tips.
6. **Progress Tracking Suggestions** — how to measure progress weekly, with a simple checklist.

Be specific to the subjects given. Keep it practical and encouraging.`,
      };
    }
    default:
      return null;
  }
}

async function callModel(messages: ChatMessage[]) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  const attempts: Array<() => Promise<Response>> = [];
  if (groqKey) {
    attempts.push(() =>
      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          max_tokens: 6000,
          messages,
        }),
      }),
    );
  }
  if (geminiKey) {
    attempts.push(() =>
      fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${geminiKey}` },
        body: JSON.stringify({ model: "gemini-2.0-flash-001", messages }),
      }),
    );
  }
  if (lovableKey) {
    attempts.push(() =>
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
        body: JSON.stringify({ model: "google/gemini-3.6-flash", messages }),
      }),
    );
  }

  let last: Response | null = null;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      last = res;
      if (res.ok) return res;
    } catch {
      // try the next provider
    }
  }
  return last;
}

export const Route = createFileRoute("/api/learn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { task?: string; data?: Record<string, unknown> };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const task = String(body.task ?? "");
        const prompt = buildPrompt(task, body.data ?? {});
        if (!prompt) {
          return Response.json({ error: "Missing or invalid request details." }, { status: 400 });
        }

        const doc = String(body.data?.document ?? "").trim();
        if (task !== "coach" && doc.length < 40) {
          return Response.json(
            { error: "We couldn't read enough text from that PDF. Try a text-based (non-scanned) PDF." },
            { status: 400 },
          );
        }

        const res = await callModel([
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ]);

        if (!res) {
          return Response.json({ error: "AI is not configured for this project." }, { status: 500 });
        }
        if (res.status === 429) {
          return Response.json(
            { error: "AI is busy right now (rate limit). Please try again in a moment." },
            { status: 429 },
          );
        }
        if (!res.ok) {
          return Response.json({ error: "The AI service failed. Please try again." }, { status: 502 });
        }

        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content ?? "";
        if (!text.trim()) {
          return Response.json({ error: "The AI returned an empty response. Please retry." }, { status: 502 });
        }
        return Response.json({ text });
      },
    },
  },
});
