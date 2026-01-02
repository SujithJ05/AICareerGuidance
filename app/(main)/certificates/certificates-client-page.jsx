"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Calendar,
  ArrowRight,
  Loader2,
  Flame,
  Zap,
  Star,
  Trophy,
  Target,
  Crown,
} from "lucide-react";

// Badge definitions based on streak milestones
const STREAK_BADGES = [
  {
    id: "first-step",
    name: "First Step",
    description: "Started your learning journey",
    icon: Zap,
    requirement: 1,
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "3-day streak achieved",
    icon: Flame,
    requirement: 3,
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "7-day streak achieved",
    icon: Star,
    requirement: 7,
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    id: "fortnight-focus",
    name: "Fortnight Focus",
    description: "14-day streak achieved",
    icon: Target,
    requirement: 14,
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    description: "30-day streak achieved",
    icon: Trophy,
    requirement: 30,
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "streak-legend",
    name: "Streak Legend",
    description: "60-day streak achieved",
    icon: Crown,
    requirement: 60,
    color: "from-pink-400 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
];

export default function CertificatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [certificates, setCertificates] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch certificates and streak in parallel
        const [certRes, streakRes] = await Promise.all([
          fetch("/api/certificates"),
          fetch("/api/streak"),
        ]);

        if (certRes.ok) {
          const certData = await certRes.json();
          setCertificates(certData);

          // If courseId is provided, find and redirect to that certificate
          if (courseId && certData.length > 0) {
            const cert = certData.find((c) => c.courseId === courseId);
            if (cert) {
              router.replace(`/certificates/${cert.id}`);
              return;
            }
          }
        }

        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData);
        }
      } catch (error) {
        logger.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, router]);

  // Get earned badges based on longest streak
  const earnedBadges = streak
    ? STREAK_BADGES.filter((badge) => streak.longestStreak >= badge.requirement)
    : [];
  const nextBadge = streak
    ? STREAK_BADGES.find((badge) => streak.longestStreak < badge.requirement)
    : STREAK_BADGES[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-xl p-10 border border-gray-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-extrabold text-gray-900">
              Streak & Certifications
            </h1>
          </div>
          <p className="text-gray-600">
            Your earned certificates and badges from your learning journey
          </p>
        </div>

        {/* Streak Badges Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Streak Badges
            </h2>
            {streak && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Current Streak:</span>
                <span className="font-bold text-orange-500 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {streak.currentStreak} days
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Best:</span>
                <span className="font-bold text-purple-500">
                  {streak.longestStreak} days
                </span>
              </div>
            )}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STREAK_BADGES.map((badge) => {
              const isEarned =
                streak && streak.longestStreak >= badge.requirement;
              const Icon = badge.icon;
              const progress = streak
                ? Math.min(
                    100,
                    (streak.longestStreak / badge.requirement) * 100
                  )
                : 0;

              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                    isEarned
                      ? `${badge.bgColor} ${badge.borderColor}`
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      isEarned
                        ? `bg-linear-to-br ${badge.color}`
                        : "bg-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isEarned ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-sm font-semibold ${
                      isEarned ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.requirement} day{badge.requirement > 1 ? "s" : ""}
                  </p>
                  {!isEarned && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-linear-to-r ${badge.color}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isEarned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Badge Progress */}
          {nextBadge && streak && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Next badge: <strong>{nextBadge.name}</strong>
                </span>
                <span className="text-sm text-gray-500">
                  {streak.longestStreak} / {nextBadge.requirement} days
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${nextBadge.color} transition-all`}
                  style={{
                    width: `${Math.min(
                      100,
                      (streak.longestStreak / nextBadge.requirement) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Certificates Section */}
        <div>
          <h2 className="text-xl font-semibold text-black flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            Course Certificates
          </h2>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Certificates Yet
              </h2>
              <p className="text-gray-500 mb-6">
                Complete a course to earn your first certificate!
              </p>
              <Link
                href="/course-generator"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
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
                    boxShadow: "0 8px 32px 0 rgba(255, 200, 0, 0.10)",
                    transition: { type: "spring", stiffness: 200, damping: 12 },
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="h-full"
                >
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="group block bg-linear-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 hover:shadow-lg hover:border-yellow-300 transition-all h-full"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-linear-to-br from-yellow-400 to-amber-500 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-amber-700 transition truncate">
                          {cert.courseName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Awarded to {cert.userName}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(cert.issueDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
