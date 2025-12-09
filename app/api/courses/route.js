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
    progress = [],
    sectionProgress = [],
  } = body;

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
      progress,
      sectionProgress,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
