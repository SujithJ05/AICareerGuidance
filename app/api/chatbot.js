// This is a mock API for the chatbot. Replace with your OpenAI or other LLM integration.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { messages, customPrompt } = req.body;
  // For demo, echo last user message. Replace with real LLM call.
  const lastUserMsg =
    messages.filter((m) => m.role === "user").pop()?.content || "";
  // Simulate AI reply
  let reply = `Echo: ${lastUserMsg}`;
  if (customPrompt) {
    reply = `(${customPrompt})\n${reply}`;
  }
  await new Promise((r) => setTimeout(r, 700)); // Simulate latency
  res.status(200).json({ reply });
}
