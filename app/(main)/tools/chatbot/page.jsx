import Chatbot from "@/components/Chatbot";

export default function ChatbotPage({ searchParams }) {
  // Accept custom prompt from query string or default
  const customPrompt = searchParams?.prompt || "";
  return (
    <div className="min-h-screen w-full px-6 py-10 pt-24 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        <Chatbot customPrompt={customPrompt} />
      </div>
    </div>
  );
}
