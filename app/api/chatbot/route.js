// This is a mock API for the chatbot. Replace with your OpenAI or other LLM integration.
import { logger } from "@/lib/logger";
import { apiLimiter } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    // Rate limiting
    const rateLimitResult = await apiLimiter(request);
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();
    const { messages, customPrompt } = body;
    // Ollama expects messages as an array of {role, content}
    // We'll use the 'mistral' model by default
    const ollamaPayload = {
      model: "mistral",
      messages: messages.filter((m) => m.role !== "system"), // remove system prompt if present
      stream: false,
    };
    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ollamaPayload),
    });
    if (!ollamaRes.ok) {
      const error = await ollamaRes.text();
      logger.error("Ollama API error:", error);
      return new Response(
        JSON.stringify({ error: `Ollama API error: ${error}` }),
        { status: 500 }
      );
    }
    const data = await ollamaRes.json();
    // Ollama returns { message: { role, content }, ... }
    const reply = data.message?.content || "No response from Ollama.";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    logger.error("Ollama API handler exception:", err);
    return new Response(
      JSON.stringify({
        error: `Failed to connect to Ollama API: ${err.message}`,
      }),
      { status: 500 }
    );
  }
}
