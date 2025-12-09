"use client";
import { useEffect, useState } from "react";
import { Plus, Book, Clock, Award, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import MultiStepCourseGenerator from "./multi-step";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const motivationalQuotes = [
  "Every expert was once a beginner. Keep going!",
  "The only way to do great work is to love what you learn.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't give up now—you're closer to mastery than you think!",
  "Learning is a treasure that will follow its owner everywhere.",
  "The beautiful thing about learning is nobody can take it away from you.",
  "Your future self will thank you for not giving up today.",
  "Progress, not perfection. Every chapter counts!",
];

export default function CourseGeneratorPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [showGenerator, setShowGenerator] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    courseId: null,
    courseTitle: "",
  });
  const [randomQuote, setRandomQuote] = useState("");

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
    if (isLoaded && isSignedIn) {
      fetchCourses();
    } else if (isLoaded && !isSignedIn) {
      setCourses([]);
    }
  }, [isLoaded, isSignedIn]);

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm({ open: false, courseId: null, courseTitle: "" });
    }
  };

  const openDeleteConfirm = (id, title) => {
    const quote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setRandomQuote(quote);
    setDeleteConfirm({ open: true, courseId: id, courseTitle: title });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (showGenerator) {
    return (
      <>
        <SignedIn>
          <MultiStepCourseGenerator />
        </SignedIn>
        <SignedOut>
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <h2 className="text-2xl font-semibold text-black">
              Please sign in to create courses.
            </h2>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Course Generator</h1>
            <p className="text-gray-500 mt-2">
              View your courses or create a new one inspired by the video
              layout.
            </p>
          </div>
          <SignedIn>
            <button
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition shadow"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition shadow">
                <Plus className="w-5 h-5" /> Sign in to create
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first course to see it here.
            </p>
            <SignedIn>
              <button
                onClick={() => setShowGenerator(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <Plus className="w-5 h-5" /> Start Creating
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition">
                  <Plus className="w-5 h-5" /> Sign in to start
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/course-generator/${course.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-200 overflow-hidden"
              >
                <div className="bg-black p-5 text-white">
                  <h3 className="text-lg font-bold mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-gray-200 text-black px-3 py-1 rounded-full font-medium">
                      {course.category}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
                    <div className="flex items-center justify-between text-sm text-black mb-1">
                      <span>Progress</span>
                      <span>{computeCompletion(course)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black"
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
                      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                    >
                      View Course
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm(course.id, course.title);
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this course?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p className="text-base">
                  You're about to delete{" "}
                  <span className="font-semibold text-black">
                    "{deleteConfirm.courseTitle}"
                  </span>
                  . This action cannot be undone.
                </p>
                <div className="bg-gray-100 border-l-4 border-black p-4 rounded-r-lg">
                  <p className="text-black italic font-medium">
                    💡 "{randomQuote}"
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Consider completing the course instead—every step forward is
                  progress toward your goals!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-black text-white hover:bg-gray-800">
                Keep Learning
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(deleteConfirm.courseId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
