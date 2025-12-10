"use client";
import { useState, useMemo, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import {
  Clock,
  ArrowLeft,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Star,
  Loader2,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Slugify helper for heading ids
const slugify = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Helper to split markdown into chapters by H2 (##) headings and capture H3 subsections with content
function splitMarkdownByChapters(markdown) {
  const lines = markdown.split("\n");
  const chapters = [];
  let current = { title: "", duration: "", sections: [] };
  let currentSection = null;

  const pushSection = () => {
    if (currentSection) current.sections.push({ ...currentSection });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      pushSection();
      if (current.title) chapters.push({ ...current });
      current = {
        title: line.replace(/^## /, "").trim(),
        duration: "",
        sections: [],
      };
      currentSection = null;
    } else if (line.startsWith("### ")) {
      pushSection();
      const secTitle = line.replace(/^### /, "").trim();
      currentSection = { title: secTitle, id: slugify(secTitle), content: "" };
    } else if (line.includes("⏱️") || line.includes("minutes")) {
      if (!currentSection) {
        currentSection = {
          title: "Overview",
          id: slugify(`overview-${current.sections.length}`),
          content: "",
        };
      }
      current.duration = current.duration || line.trim();
      currentSection.content += line + "\n";
    } else {
      if (!currentSection) {
        currentSection = {
          title: "Overview",
          id: slugify(`overview-${current.sections.length}`),
          content: "",
        };
      }
      currentSection.content += line + "\n";
    }
  }
  pushSection();
  if (current.title) chapters.push({ ...current });
  return chapters.length
    ? chapters.map((ch) => ({
        ...ch,
        sections: ch.sections.length
          ? ch.sections
          : [
              {
                title: ch.title || "Section",
                id: slugify(ch.title || "section"),
                content: ch.duration ? `${ch.duration}\n` : "",
              },
            ],
      }))
    : [
        {
          title: "Course",
          duration: "",
          sections: [{ title: "Course", id: "course", content: markdown }],
        },
      ];
}

export default function CourseViewPage({ params }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [courseData, setCourseData] = useState(null);
  const [selected, setSelected] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [progress, setProgress] = useState([]);
  const [sectionProgress, setSectionProgress] = useState([]);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [sectionAnchor, setSectionAnchor] = useState("");
  const [expanded, setExpanded] = useState({});

  const deriveChapterProgress = (sectionsState, chapterList) =>
    sectionsState.map((row, idx) => {
      const hasSections = (chapterList[idx]?.sections?.length || 0) > 0;
      return hasSections ? row.every(Boolean) : false;
    });

  useEffect(() => {
    if (sectionAnchor) {
      const el = document.getElementById(sectionAnchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [sectionAnchor]);

  // Update streak when user visits a course
  useEffect(() => {
    const updateStreak = async () => {
      try {
        await fetch("/api/streak", { method: "POST" });
      } catch (error) {
        console.error("Failed to update streak:", error);
      }
    };
    updateStreak();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const course = await res.json();
        setCourseData(course);
        const chaptersArr = splitMarkdownByChapters(course.roadmap);
        const len = chaptersArr.length;
        const secProg = Array(len)
          .fill(null)
          .map((_, ci) => {
            const secLen = chaptersArr[ci].sections.length;
            const existingRow = Array.isArray(course.sectionProgress?.[ci])
              ? course.sectionProgress[ci]
                  .slice(0, secLen)
                  .concat(
                    Array(
                      Math.max(0, secLen - course.sectionProgress[ci].length)
                    ).fill(false)
                  )
              : Array(secLen).fill(false);
            return existingRow;
          });
        setSectionProgress(secProg);
        setProgress(deriveChapterProgress(secProg, chaptersArr));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [courseId]);

  const chapters = useMemo(
    () => (courseData ? splitMarkdownByChapters(courseData.roadmap) : []),
    [courseData]
  );

  // Check if course is 100% complete
  const isCourseComplete = useMemo(() => {
    if (!sectionProgress.length) return false;
    return sectionProgress.every(
      (chapter) =>
        Array.isArray(chapter) && chapter.length > 0 && chapter.every(Boolean)
    );
  }, [sectionProgress]);

  const generateCertificate = async () => {
    setIsGeneratingCertificate(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate certificate");
      }
      const certificate = await res.json();
      // Navigate to the certificate page
      router.push(`/certificates/${certificate.id}`);
    } catch (err) {
      console.error("Certificate generation error:", err);
      alert(err.message);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const updateSectionProgress = (next) => {
    const nextProgress = deriveChapterProgress(next, chapters);
    setSectionProgress(next);
    setProgress(nextProgress);
    // persist to API (fire and forget)
    fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionProgress: next, progress: nextProgress }),
    }).catch((err) => console.error(err));
  };

  const toggleSectionProgress = (cIdx, sIdx) => {
    const next = sectionProgress.map((row, i) =>
      i === cIdx ? row.map((v, j) => (j === sIdx ? !v : v)) : row
    );
    updateSectionProgress(next);
  };

  const markSectionDone = (cIdx, sIdx) => {
    const next = sectionProgress.map((row, i) =>
      i === cIdx ? row.map((v, j) => (j === sIdx ? true : v)) : row
    );
    updateSectionProgress(next);
  };

  const goToSection = (cIdx, sIdx, markDone = false) => {
    setSelected(cIdx);
    setSelectedSection(sIdx);
    setExpanded((prev) => ({ ...prev, [cIdx]: true }));
    const secId = chapters[cIdx]?.sections?.[sIdx]?.id;
    if (markDone) {
      markSectionDone(cIdx, sIdx);
    }
    if (secId) setSectionAnchor(secId);
  };

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/course-generator")}
          className="flex items-center gap-2 text-gray-500 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course Generator</span>
        </button>
        <h1 className="text-xl font-bold text-black">{courseData.title}</h1>
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Course Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-black text-white flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold mb-2">{courseData.title}</h2>
            <p className="text-gray-300 text-sm">{courseData.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
              <span className="bg-gray-700 px-3 py-1 rounded">
                {courseData.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {courseData.duration}
              </span>
              {courseData.rating && (
                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {courseData.rating.toFixed(1)}
                </span>
              )}
            </div>
            {/* Get Certificate Button - Only visible when course is 100% complete */}
            {isCourseComplete && (
              <button
                onClick={generateCertificate}
                disabled={isGeneratingCertificate}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold px-4 py-3 rounded-lg transition disabled:opacity-50"
              >
                {isGeneratingCertificate ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Award className="w-5 h-5" />
                )}
                {isGeneratingCertificate ? "Generating..." : "Get Certificate"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {chapters.map((ch, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                className={`w-full text-left px-6 py-4 border-b border-gray-700 transition-all cursor-pointer ${
                  selected === idx ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  setSelected(idx);
                  setSelectedSection(0);
                  setSectionAnchor("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelected(idx);
                    setSelectedSection(0);
                    setSectionAnchor("");
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5" aria-label="Chapter completion">
                    {progress[idx] ? (
                      <CheckSquare className="w-5 h-5 text-white" />
                    ) : (
                      <Square className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span
                    className={`flex items-center justify-center min-w-7 h-7 rounded-full font-bold text-sm ${
                      selected === idx ? "bg-white text-black" : "bg-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ch.title}</div>
                    {ch.duration && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ch.duration.replace("⏱️", "").trim()}
                      </div>
                    )}
                    {ch.sections.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }));
                          }}
                          className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                        >
                          {expanded[idx] ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                          Topics
                        </button>
                        {expanded[idx] &&
                          ch.sections.map((sec, sIdx) => (
                            <button
                              key={sec.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                goToSection(idx, sIdx, false);
                              }}
                              className="flex items-center gap-2 w-full text-left text-sm text-gray-300 hover:text-white truncate"
                            >
                              {sectionProgress[idx]?.[sIdx] ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                              {sec.title}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white p-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  pre({ children }) {
                    return (
                      <pre className="bg-black text-white rounded-lg p-6 overflow-x-auto my-6 font-mono text-sm">
                        {children}
                      </pre>
                    );
                  },
                  code({ node, inline, className, children, ...props }) {
                    // For block code, just return the code element (pre handles wrapper)
                    if (!inline) {
                      return <code>{children}</code>;
                    }
                    // For inline code
                    return (
                      <code className="bg-gray-100 text-black px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  },
                  h1({ children }) {
                    return (
                      <h1 className="text-3xl font-bold mt-8 mb-4 text-black">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-2xl font-bold mt-6 mb-3 text-black">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    const text = Array.isArray(children)
                      ? children.join(" ")
                      : String(children);
                    const id = slugify(text);
                    return (
                      <h3
                        id={id}
                        className="text-xl font-semibold mt-4 mb-2 text-black"
                      >
                        {children}
                      </h3>
                    );
                  },
                  p({ children }) {
                    return (
                      <p className="mb-4 text-gray-600 leading-relaxed">
                        {children}
                      </p>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside mb-4 space-y-2">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside mb-4 space-y-2">
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li className="text-gray-600">{children}</li>;
                  },
                }}
              >
                {chapters[selected]?.sections?.[selectedSection]?.content || ""}
              </ReactMarkdown>
            </div>
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => {
                  if (selectedSection > 0)
                    goToSection(selected, selectedSection - 1, false);
                }}
                disabled={selectedSection === 0}
                className={`px-4 py-2 rounded border ${
                  selectedSection === 0
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-black border-gray-300 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const secCount = chapters[selected]?.sections?.length || 0;
                  markSectionDone(selected, selectedSection);
                  if (selectedSection < secCount - 1) {
                    goToSection(selected, selectedSection + 1, false);
                  } else if (selected < chapters.length - 1) {
                    goToSection(selected + 1, 0, false);
                  }
                }}
                className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
