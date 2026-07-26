import { createFileRoute } from "@tanstack/react-router";
import {
  announcements,
  books,
  buses,
  lostItems,
  notes,
} from "@/lib/mock-data";

function buildContext() {
  const busLines = buses
    .map(
      (b) =>
        `- ${b.number} (${b.route}): status "${b.status}", ${b.eta}. Pickup ${b.pickup}, drop ${b.drop}. Driver ${b.driver} (${b.driverPhone}). Note: ${b.note}`,
    )
    .join("\n");

  const announcementLines = announcements
    .map(
      (a) =>
        `- [${a.category}${a.pinned ? " • Pinned" : ""}] ${a.title} (${a.date}): ${a.body}`,
    )
    .join("\n");

  const noteLines = notes
    .map(
      (n) =>
        `- "${n.title}" — ${n.department}, Sem ${n.semester}, ${n.subject}. Uploader ${n.uploader}, ${n.size}, ${n.downloads} downloads, updated ${n.updatedAt}.`,
    )
    .join("\n");

  const bookLines = books
    .map(
      (b) =>
        `- "${b.title}" by ${b.author} — ${b.department}, Sem ${b.semester}. ${b.condition}, ${b.mode}${b.price ? ` (${b.price})` : ""}. Owner ${b.owner} (${b.contact}). ${b.description}`,
    )
    .join("\n");

  const lostLines = lostItems
    .map(
      (l) =>
        `- [${l.type} • ${l.status}] ${l.title} at ${l.location} (${l.date}). ${l.description} Contact: ${l.contact}.`,
    )
    .join("\n");

  return `You have access to the following live CampusLife app data. Treat this as the single source of truth for any campus-specific question. Do NOT invent details beyond what is listed here.

=== BUS UPDATES ===
${busLines}

=== ANNOUNCEMENTS ===
${announcementLines}

=== NOTES LIBRARY ===
${noteLines}

=== BOOK EXCHANGE ===
${bookLines}

=== LOST & FOUND ===
${lostLines}

=== STUDENT PROFILE ===
The signed-in student's profile (name, email, registration number, department, semester) is stored locally in the app on the Profile page. You do not have direct access to their personal details in this conversation — if asked, guide them to the Profile page.`;
}

const SYSTEM_PROMPT = `You are CampusLife AI — a friendly, professional, concise campus + study assistant for university students.

You serve TWO roles:

1) CAMPUS ASSISTANT — answer questions about the CampusLife app's features:
   • Bus Updates  • Notes Sharing  • Book Exchange  • Lost & Found
   • Campus Announcements  • Student Profile

2) STUDY ASSISTANT — help students learn:
   • Explain academic concepts in Physics, Chemistry, Mathematics, Computer Science and general subjects
   • Generate quizzes and MCQs (with answers/explanations when useful)
   • Summarize notes and topics for revision
   • Give study tips and exam preparation guidance

STRICT RULES FOR CAMPUS QUESTIONS:
- ALWAYS answer campus-specific questions using ONLY the app data provided in the context below.
- If the user asks about a bus, announcement, note, book, or lost/found item, quote the actual details from the context (e.g. "Bus 02 is currently Delayed — traffic near flyover, delayed 15 min.").
- If the requested campus information is NOT in the context (e.g. real-time GPS tracking, future bus arrival predictions, a professor's name, an item not listed), respond honestly with:
  "I currently only have access to the information available within CampusLife AI. Please check the [relevant] section for the latest available status."
- NEVER invent campus data — no fake bus numbers, professors, event dates, prices, phone numbers, or people.
- For personal profile details, direct the student to the Profile page (the app stores those locally).

STRICT RULES FOR STUDY QUESTIONS:
- Give accurate, clear explanations for academic topics.
- When asked for a quiz or MCQs, always provide the correct answer and a brief explanation for each question.
- Keep study answers concise and focused on what the student asked.

STYLE:
- Friendly, professional, concise.
- Short paragraphs, bullet points, and everyday language.
- Skimmable answers. Encouraging tone.
- When the user types with spelling mistakes, understand the intent and respond helpfully.

--- LIVE APP DATA (source of truth for campus questions) ---
${buildContext()}
--- END APP DATA ---`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return new Response("Missing GEMINI_API_KEY", { status: 500 });
        }
        let body: { messages?: Array<{ role: string; content: string }> };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const msgs = Array.isArray(body.messages) ? body.messages : [];
        if (msgs.length === 0) return new Response("No messages", { status: 400 });

        // Gemini requires strict user/model alternation. Embed the system prompt into the first
        // user message so the live app data remains the single source of truth for campus answers.
        let systemInjected = false;
        const geminiMessages = msgs.map((m) => {
          if (m.role === "user" && !systemInjected) {
            systemInjected = true;
            return {
              role: "user",
              content: `${SYSTEM_PROMPT}\n\nStudent question: ${m.content}`,
            };
          }
          return {
            role: m.role === "assistant" ? "model" : "user",
            content: m.content,
          };
        });

        const upstream = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: "gemini-1.5-flash",
              stream: true,
              messages: geminiMessages,
            }),
          },
        );

        if (upstream.status === 429) {
          return new Response("Rate limit reached. Please slow down and try again.", {
            status: 429,
          });
        }
        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "AI error");
          return new Response(text, { status: 500 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
