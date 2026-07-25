import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are the CampusLife AI Assistant — a friendly, patient university assistant for students, faculty and campus admins.

You help with:
- Explaining academic concepts in simple, clear language
- Summarizing notes and generating quick revision material
- Suggesting study tips and habits
- Generating quiz or practice questions
- Guiding new students through campus services (notes library, book exchange, lost & found, bus updates, announcements)
- Answering general campus support questions

Rules:
- Never invent specific campus-internal facts (like a real professor's name, an exact bus arrival time, or exam dates). If the user asks something campus-specific you can't know, tell them to check the Announcements or Bus Updates page and offer to help them find it.
- Use short paragraphs, bullet points, and everyday language.
- Be encouraging, warm and respectful.
- Keep responses focused and skimmable.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }
        let body: { messages?: Array<{ role: string; content: string }> };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const msgs = Array.isArray(body.messages) ? body.messages : [];
        if (msgs.length === 0) return new Response("No messages", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3.5-flash",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...msgs.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (upstream.status === 429 || upstream.status === 402) {
          return new Response(await upstream.text(), { status: upstream.status });
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
