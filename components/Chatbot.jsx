"use client";
import { useState, useRef, useEffect } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { logger } from "@/lib/logger";

export default function Chatbot({ customPrompt = "" }) {
  const [messages, setMessages] = useState([
    { role: "system", content: customPrompt },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, customPrompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply || "No response received" },
      ]);
    } catch (err) {
      logger.error("Chatbot error:", err);
      setError("Failed to get response. Please try again.");
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6 flex flex-col h-[600px] w-full">
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3">
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-line wrap-break-word ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-gray-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg bg-neutral-800 text-gray-100">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-900/20 border border-red-900 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 rounded-lg px-4 py-2 bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
