"use client";
import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  LayoutDashboard,
  HeartPulse,
  Palette,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen,
  Brain,
  Lightbulb,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Loading messages that cycle during course generation
const loadingMessages = [
  { text: "AI is cooking up your course...", icon: Sparkles },
  { text: "Gathering knowledge ingredients...", icon: BookOpen },
  { text: "Mixing learning objectives...", icon: Brain },
  { text: "Adding a dash of creativity...", icon: Lightbulb },
  { text: "Preparing your learning journey...", icon: Rocket },
  { text: "Almost ready to serve...", icon: Sparkles },
];

// Loading screen component
function LoadingScreen({ progress, currentPhase }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = loadingMessages[messageIndex].icon;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Animated cooking pot / brain icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center animate-pulse">
              <CurrentIcon className="w-16 h-16 text-white animate-bounce" />
            </div>
            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2 animate-ping">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <div className="absolute -bottom-1 -left-3 animate-ping delay-300">
              <Sparkles className="w-4 h-4 text-gray-500" />
            </div>
            <div className="absolute top-0 -left-4 animate-ping delay-700">
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2 transition-all duration-500">
            {loadingMessages[messageIndex].text}
          </h2>
          <p className="text-gray-500">
            This may take a minute. Great things take time!
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentPhase}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex justify-between text-xs text-gray-400 mt-6">
          <span className={progress >= 10 ? "text-black font-medium" : ""}>
            Analyzing
          </span>
          <span className={progress >= 40 ? "text-black font-medium" : ""}>
            Generating
          </span>
          <span className={progress >= 70 ? "text-black font-medium" : ""}>
            Structuring
          </span>
          <span className={progress >= 95 ? "text-black font-medium" : ""}>
            Finalizing
          </span>
        </div>

        {/* Spinning loader at bottom */}
        <div className="flex justify-center mt-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>

      {/* Add shimmer animation style */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

// Helper to split markdown into chapters by H2 (##) headings
function splitMarkdownByChapters(markdown) {
  const lines = markdown.split("\n");
  const chapters = [];
  let current = { title: "", content: "" };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      if (current.title) chapters.push({ ...current });
      current = { title: line.replace(/^## /, "").trim(), content: "" };
    } else {
      current.content += line + "\n";
    }
  }
  if (current.title) chapters.push({ ...current });
  return chapters.length ? chapters : [{ title: "Course", content: markdown }];
}

function CourseRoadmapDisplay({ roadmap }) {
  const chapters = useMemo(() => splitMarkdownByChapters(roadmap), [roadmap]);
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex w-full max-w-4xl min-h-[500px] rounded-lg overflow-hidden border border-gray-200 mt-8 bg-white shadow">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-0 border-r border-gray-200 flex flex-col">
        <div className="font-bold text-lg px-6 py-4 border-b border-gray-200 bg-black text-white">
          Chapters
        </div>
        <ol className="flex-1 overflow-y-auto">
          {chapters.map((ch, idx) => (
            <li
              key={ch.title + idx}
              className={`flex items-center gap-3 px-6 py-4 cursor-pointer border-b border-gray-200 transition-all ${
                selected === idx
                  ? "bg-gray-200 border-l-4 border-l-black"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setSelected(idx)}
            >
              <span
                className={`flex items-center justify-center h-7 w-7 rounded-full font-bold ${
                  selected === idx
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {idx + 1}
              </span>
              <span className="font-semibold text-black">{ch.title}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* Main Content */}
      <div className="w-2/3 p-8 bg-white overflow-y-auto">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                return !inline ? (
                  <pre className="bg-black text-white rounded p-4 overflow-x-auto my-4">
                    <code>{children}</code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 px-1 rounded text-sm">
                    {children}
                  </code>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-2xl font-bold mt-6 mb-2 text-black">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-xl font-semibold mt-4 mb-2 text-black">
                    {children}
                  </h3>
                );
              },
            }}
          >
            {chapters[selected]?.content || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function MultiStepCourseGenerator() {
  const router = useRouter();
  const categories = [
    { name: "Programming", icon: <LayoutDashboard className="h-8 w-8" /> },
    { name: "Health", icon: <HeartPulse className="h-8 w-8" /> },
    { name: "Creative", icon: <Palette className="h-8 w-8" /> },
  ];
  const steps = ["Category", "Topic & Desc", "Options"];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: "",
    topic: "",
    desc: "",
    difficulty: "",
    duration: "",
    chapters: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");

  // Step 1: Category
  const renderCategory = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-black">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s}
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="mx-2 text-gray-400" />
            )}
          </div>
        ))}
      </div>
      <div className="mb-6 text-lg font-medium text-black">
        Select the Course Category
      </div>
      <div className="flex gap-8 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`flex flex-col items-center px-8 py-6 rounded-lg border-2 transition-all ${
              form.category === cat.name
                ? "border-black bg-gray-100"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => setForm((f) => ({ ...f, category: cat.name }))}
          >
            {cat.icon}
            <span className="mt-2 font-semibold text-black">{cat.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-md">
        <button
          className="px-6 py-2 rounded bg-gray-100 text-gray-500"
          disabled
        >
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-black text-white"
          disabled={!form.category}
          onClick={() => setStep(1)}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 2: Topic & Description
  const renderTopicDesc = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-black">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s}
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="mx-2 text-gray-400" />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        <div>
          <label className="block font-medium mb-2 text-black">
            Difficulty Level
          </label>
          <select
            className="w-full border border-gray-300 bg-white text-black p-2 rounded"
            value={form.difficulty}
            onChange={(e) =>
              setForm((f) => ({ ...f, difficulty: e.target.value }))
            }
          >
            <option value="" disabled>
              Select difficulty
            </option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2 text-black">
            Course Duration
          </label>
          <input
            className="w-full border border-gray-300 bg-white text-black p-2 rounded"
            type="text"
            placeholder="e.g. 1 Hour"
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block font-medium mb-2 text-black">
            No of Chapters
          </label>
          <input
            className="w-full border border-gray-300 bg-white text-black p-2 rounded"
            type="number"
            min={1}
            placeholder="e.g. 7"
            value={form.chapters}
            onChange={(e) =>
              setForm((f) => ({ ...f, chapters: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="flex justify-between w-full max-w-md">
        <button
          className="px-6 py-2 rounded bg-gray-100 text-gray-500"
          onClick={() => setStep(0)}
        >
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-black text-white"
          disabled={!form.difficulty || !form.duration || !form.chapters}
          onClick={() => setStep(2)}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Options & Generate
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setCurrentPhase("Initializing AI...");

    // Simulated progress updates
    const progressSteps = [
      { progress: 10, phase: "Analyzing your requirements...", delay: 500 },
      { progress: 25, phase: "Understanding the topic...", delay: 1500 },
      { progress: 40, phase: "Generating course structure...", delay: 2500 },
      { progress: 55, phase: "Creating chapter outlines...", delay: 4000 },
      { progress: 70, phase: "Adding learning objectives...", delay: 5500 },
      { progress: 85, phase: "Structuring content...", delay: 7000 },
    ];

    // Start progress simulation
    const progressTimers = progressSteps.map(({ progress: p, phase, delay }) =>
      setTimeout(() => {
        setProgress(p);
        setCurrentPhase(phase);
      }, delay)
    );

    try {
      const res = await fetch("/api/course-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Clear progress timers
      progressTimers.forEach(clearTimeout);

      if (!res.ok) throw new Error("Failed to generate course layout");

      setProgress(90);
      setCurrentPhase("Saving your course...");

      const data = await res.json();

      // Save course via API (with fallbacks and numeric chapters)
      const courseInfo = data.courseInfo || {};
      const chaptersCount =
        parseInt(courseInfo.chapters || form.chapters || 0, 10) || 0;

      setProgress(95);
      setCurrentPhase("Almost there...");

      const resCreate = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseInfo.title || form.topic || "Untitled Course",
          description: courseInfo.description || form.desc || "",
          category: courseInfo.category || form.category || "General",
          difficulty: courseInfo.difficulty || form.difficulty || "Beginner",
          duration: courseInfo.duration || form.duration || "",
          chapters: chaptersCount,
          roadmap: data.roadmap || "",
          progress: Array(Math.max(1, chaptersCount || 0)).fill(false),
          sectionProgress: [],
        }),
      });
      if (!resCreate.ok) {
        const errBody = await resCreate.json().catch(() => ({}));
        if (resCreate.status === 401) {
          throw new Error("Please sign in to create courses.");
        }
        throw new Error(
          errBody?.error || errBody?.message || "Failed to save course"
        );
      }
      const created = await resCreate.json();

      setProgress(100);
      setCurrentPhase("Course ready! Redirecting...");

      // Small delay to show 100% before redirecting
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to course view page
      router.push(`/course-generator/${created.id}`);
    } catch (err) {
      // Clear progress timers on error
      progressTimers.forEach(clearTimeout);
      setError(err.message || "Unknown error");
      setLoading(false);
      setProgress(0);
    }
  };

  const renderOptions = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-black">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s}
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="mx-2 text-gray-400" />
            )}
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl mb-8">
        <label className="block font-medium mb-2 text-black">
          Course Topic & Description
        </label>
        <input
          className="w-full border border-gray-300 bg-white text-black p-2 rounded mb-4"
          type="text"
          placeholder="Course Title"
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
        />
        <textarea
          className="w-full border border-gray-300 bg-white text-black p-2 rounded"
          rows={4}
          placeholder="Course Description"
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
        />
      </div>
      <div className="flex justify-between w-full max-w-md">
        <button
          className="px-6 py-2 rounded bg-gray-100 text-gray-500"
          onClick={() => setStep(1)}
        >
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-black text-white"
          disabled={!form.topic || !form.desc || loading}
          onClick={handleGenerate}
        >
          {loading ? "Generating..." : "Generate Course Layout"}
        </button>
      </div>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {result && (
        <CourseRoadmapDisplay roadmap={result.roadmap || "No roadmap found."} />
      )}
    </div>
  );

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <LoadingScreen progress={progress} currentPhase={currentPhase} />
      )}

      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded shadow border border-gray-200">
        {step === 0 && renderCategory()}
        {step === 1 && renderTopicDesc()}
        {step === 2 && renderOptions()}
      </div>
    </>
  );
}
