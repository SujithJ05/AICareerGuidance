"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Book, Clock, Award, Trash2, ExternalLink } from "lucide-react";

export default function CourseDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          My Learning Courses
        </h2>
        <button
          onClick={() => router.push("/course-generator")}
          className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start your learning journey by creating your first course
          </p>
          <button
            onClick={() => router.push("/course-generator")}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              custom={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                },
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 32px 0 rgba(80, 0, 200, 0.10)",
                transition: { type: "spring", stiffness: 200, damping: 12 },
              }}
              viewport={{ once: true, amount: 0.2 }}
              className="h-full"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group h-full flex flex-col">
                {/* Header with gradient */}
                <div className="bg-linear-to-br from-violet-600 to-purple-700 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:scale-105 transition-transform">
                    {course.title}
                  </h3>
                  <p className="text-violet-100 text-sm line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Course info */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
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

                  <div className="pt-4 border-t grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() =>
                        router.push(`/course-generator/${course.id}`)
                      }
                      className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-all font-medium inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Course
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-all font-medium inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
