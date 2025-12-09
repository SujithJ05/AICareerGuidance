"use client";
import { useEffect, useState } from "react";
import { Plus, Book, Clock, Award, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MultiStepCourseGenerator from "./multi-step";

export default function CourseGeneratorPage() {
  const router = useRouter();
  const [showGenerator, setShowGenerator] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("courses") || "[]");
    setCourses(saved);
  }, []);

  const computeCompletion = (course) => {
    const secProg = course.sectionProgress;
    if (Array.isArray(secProg) && secProg.length > 0) {
      const { checked, total } = secProg.reduce(
        (acc, row) => {
          if (!Array.isArray(row)) return acc;
          const rowChecked = row.filter(Boolean).length;
          return {
            checked: acc.checked + rowChecked,
            total: acc.total + row.length,
          };
        },
        { checked: 0, total: 0 }
      );
      if (total > 0) return Math.round((checked / total) * 100);
    }

    if (Array.isArray(course.progress) && course.progress.length > 0) {
      const checked = course.progress.filter(Boolean).length;
      return Math.round((checked / course.progress.length) * 100);
    }
    return 0;
  };

  const handleDelete = (id) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
  };

  // After returning from a created course page, refresh courses
  useEffect(() => {
    const handle = () => {
      const saved = JSON.parse(localStorage.getItem("courses") || "[]");
      setCourses(saved);
    };
    window.addEventListener("focus", handle);
    return () => window.removeEventListener("focus", handle);
  }, []);

  if (showGenerator) {
    return <MultiStepCourseGenerator />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Course Generator
            </h1>
            <p className="text-gray-600 mt-2">
              View your courses or create a new one inspired by the video
              layout.
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-3 rounded-lg hover:bg-violet-700 transition shadow"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first course to see it here.
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-3 rounded-lg hover:bg-violet-700 transition"
            >
              <Plus className="w-5 h-5" /> Start Creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/course-generator/${course.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
                  <h3 className="text-lg font-bold mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-violet-100 text-sm line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">
                      {course.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      <span>{course.chapters} chapters</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                      <span>Progress</span>
                      <span>{computeCompletion(course)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600"
                        style={{ width: `${computeCompletion(course)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/course-generator/${course.id}`);
                      }}
                      className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition font-medium"
                    >
                      View Course
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(course.id);
                      }}
                      className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition font-medium inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
