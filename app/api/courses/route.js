export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find the internal user by Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const courses = await db.course.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(courses);
}

export async function POST(req) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find the internal user by Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId },
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

  // Calculate fallback rating from content metrics if no rating provided
  let finalRating = rating ? parseFloat(rating) : null;
  if (!finalRating && roadmap) {
    const chapterCount = (roadmap.match(/^## /gm) || []).length;
    const codeBlockCount = Math.floor((roadmap.match(/```/g) || []).length / 2);
    const wordCount = roadmap.split(/\s+/).length;

    // Calculate metrics-based rating
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

  return NextResponse.json(course, { status: 201 });
}
