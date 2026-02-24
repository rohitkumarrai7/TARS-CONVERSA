import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "Tars-Conversa",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            {
              role: "system",
              content: `You are TARS AI, an intelligent assistant built directly into Tars-Conversa, a real-time chat application built for the Tars (Tarsense Technologies) internship challenge. You help users with:
- Drafting and improving messages
- Summarizing long conversations
- Answering general questions
- Writing suggestions and templates
- Explaining technical concepts simply
Keep responses concise and friendly. You are powered by OpenRouter AI.`,
            },
            ...messages,
          ],
          stream: false,
          max_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable", details: errorText }),
        { status: 500 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ??
      "Sorry, I could not generate a response.";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TARS AI error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
