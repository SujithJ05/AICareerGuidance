"use client";
import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  LayoutDashboard,
  HeartPulse,
  Palette,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="flex w-full max-w-4xl min-h-[500px] rounded-lg overflow-hidden border mt-8 bg-white shadow">
      {/* Sidebar */}
      <div className="w-1/3 bg-violet-50 p-0 border-r flex flex-col">
        <div className="font-bold text-lg px-6 py-4 border-b bg-violet-600 text-white">
          Chapters
        </div>
        <ol className="flex-1 overflow-y-auto">
          {chapters.map((ch, idx) => (
            <li
              key={ch.title + idx}
              className={`flex items-center gap-3 px-6 py-4 cursor-pointer border-b transition-all ${
                selected === idx
                  ? "bg-violet-100 border-l-4 border-violet-600"
                  : "hover:bg-violet-100"
              }`}
              onClick={() => setSelected(idx)}
            >
              <span
                className={`flex items-center justify-center h-7 w-7 rounded-full font-bold text-white ${
                  selected === idx ? "bg-violet-600" : "bg-violet-300"
                }`}
              >
                {idx + 1}
              </span>
              <span className="font-semibold text-violet-900">{ch.title}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* Main Content */}
      <div className="w-2/3 p-8 bg-gray-50 overflow-y-auto">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                return !inline ? (
                  <pre className="bg-black text-white rounded p-4 overflow-x-auto my-4">
                    <code>{children}</code>
                  </pre>
                ) : (
                  <code className="bg-gray-200 px-1 rounded text-sm">
                    {children}
                  </code>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-2xl font-bold mt-6 mb-2 text-violet-700">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-xl font-semibold mt-4 mb-2 text-violet-600">
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

  // Step 1: Category
  const renderCategory = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-600"
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
      <div className="mb-6 text-lg font-medium">Select the Course Category</div>
      <div className="flex gap-8 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`flex flex-col items-center px-8 py-6 rounded-lg border-2 transition-all ${
              form.category === cat.name
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200 bg-white"
            }`}
            onClick={() => setForm((f) => ({ ...f, category: cat.name }))}
          >
            {cat.icon}
            <span className="mt-2 font-semibold">{cat.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-md">
        <button className="px-6 py-2 rounded bg-gray-200" disabled>
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-purple-600 text-white"
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
      <h2 className="text-2xl font-bold mb-6">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-600"
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
          <label className="block font-medium mb-2">Difficulty Level</label>
          <select
            className="w-full border p-2 rounded"
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
          <label className="block font-medium mb-2">Course Duration</label>
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="e.g. 1 Hour"
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block font-medium mb-2">No of Chapters</label>
          <input
            className="w-full border p-2 rounded"
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
          className="px-6 py-2 rounded bg-gray-200"
          onClick={() => setStep(0)}
        >
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-purple-600 text-white"
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
    try {
      const res = await fetch("/api/course-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to generate course layout");
      const data = await res.json();

      // Save course via API (with fallbacks and numeric chapters)
      const courseInfo = data.courseInfo || {};
      const chaptersCount =
        parseInt(courseInfo.chapters || form.chapters || 0, 10) || 0;
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

      // Navigate to course view page
      router.push(`/course-generator/${created.id}`);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Create Course</h2>
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                step === idx
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-600"
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
        <label className="block font-medium mb-2">
          Course Topic & Description
        </label>
        <input
          className="w-full border p-2 rounded mb-4"
          type="text"
          placeholder="Course Title"
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
        />
        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          placeholder="Course Description"
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
        />
      </div>
      <div className="flex justify-between w-full max-w-md">
        <button
          className="px-6 py-2 rounded bg-gray-200"
          onClick={() => setStep(1)}
        >
          Previous
        </button>
        <button
          className="px-6 py-2 rounded bg-purple-600 text-white"
          disabled={!form.topic || !form.desc || loading}
          onClick={handleGenerate}
        >
          {loading ? "Generating..." : "Generate Course Layout"}
        </button>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {result && (
        <CourseRoadmapDisplay roadmap={result.roadmap || "No roadmap found."} />
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded shadow">
      {step === 0 && renderCategory()}
      {step === 1 && renderTopicDesc()}
      {step === 2 && renderOptions()}
    </div>
  );
}
