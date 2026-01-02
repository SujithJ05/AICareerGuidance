import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getCachedUser } from "@/lib/db-utils";

/**
 * GET /api/user/progress
 * Returns comprehensive user progress statistics
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with cached query
    const user = await getCachedUser(clerkUserId, {
      id: true,
      currentStreak: true,
      longestStreak: true,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's courses
    const courses = await db.course.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        progress: true,
        chapters: true,
      },
    });

    // Calculate courses completed (100% progress)
    const coursesCompleted = courses.filter((course) => {
      const completedChapters = course.progress?.length || 0;
      const totalChapters = course.chapters || 0;
      return totalChapters > 0 && completedChapters === totalChapters;
    }).length;

    // Fetch certificates
    const certificatesCount = await db.certificate.count({
      where: { userId: user.id },
    });

    // Fetch interviews completed
    const interviewsCount = await db.voiceInterview.count({
      where: { userId: user.id, feedback: { not: null } },
    });

    // Calculate weekly progress (courses started this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const coursesThisWeek = await db.course.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneWeekAgo },
      },
    });

    const coursesLastWeek = courses.length - coursesThisWeek;
    const weeklyProgress =
      coursesLastWeek > 0
        ? Math.round((coursesThisWeek / coursesLastWeek) * 100)
        : coursesThisWeek > 0
        ? 100
        : 0;

    // Estimate total learning time (rough calculation)
    const totalLearningTime = courses.reduce((total, course) => {
      const duration = course.duration || "30 minutes";
      const minutes = parseInt(duration.match(/\d+/)?.[0] || "30");
      const completedChapters = course.progress?.length || 0;
      return total + minutes * completedChapters;
    }, 0);

    // Count unique skills (from course categories)
    const uniqueCategories = new Set(
      courses.map((c) => c.category).filter(Boolean)
    );

    return NextResponse.json({
      coursesCompleted,
      totalCourses: courses.length,
      certificatesEarned: certificatesCount,
      interviewsCompleted: interviewsCount,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalLearningTime,
      skillsLearned: uniqueCategories.size,
      weeklyProgress,
    });
  } catch (error) {
    logger.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress statistics" },
      { status: 500 }
    );
  }
}
