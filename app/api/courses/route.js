export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limit";
import { memoryCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cacheKey = `courses:${clerkUserId}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const courses = await db.course.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        chapters: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    memoryCache.set(cacheKey, courses, 60000);
    return NextResponse.json(courses);
  } catch (error) {
    logger.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimitResult = apiLimiter.check(10, clerkUserId);
    if (rateLimitResult.isRateLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      chapters,
      roadmap,
      rating,
      progress = [],
      sectionProgress = [],
    } = body;

    let finalRating = rating ? parseFloat(rating) : null;
    if (!finalRating && roadmap) {
      const chapterCount = (roadmap.match(/^## /gm) || []).length;
      const codeBlockCount = Math.floor(
        (roadmap.match(/```/g) || []).length / 2
      );
      const wordCount = roadmap.split(/\s+/).length;

      finalRating = Math.min(
        5.0,
        2.5 +
          (chapterCount >= chapters ? 0.5 : (chapterCount / chapters) * 0.5) +
          (codeBlockCount >= 3 ? 0.5 : codeBlockCount * 0.15) +
          (wordCount >= 1000 ? 0.5 : wordCount / 2000) +
          (wordCount >= 2000 ? 0.3 : 0)
      );
      finalRating = Math.round(finalRating * 10) / 10;
    }

    const course = await db.course.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        difficulty,
        duration,
        chapters,
        roadmap,
        rating: finalRating,
        progress,
        sectionProgress,
      },
    });

    memoryCache.delete(`courses:${clerkUserId}`);

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    logger.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
