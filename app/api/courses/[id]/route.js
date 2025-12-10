export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(_, { params }) {
  const { id } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const course = await db.course.findFirst({
    where: { id, userId: user.id },
  });
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const {
    progress,
    sectionProgress,
    title,
    description,
    category,
    difficulty,
    duration,
    chapters,
    roadmap,
    rating,
  } = body;

  // Build update data object with only defined fields
  const updateData = {};
  if (progress !== undefined) updateData.progress = progress;
  if (sectionProgress !== undefined)
    updateData.sectionProgress = sectionProgress;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (duration !== undefined) updateData.duration = duration;
  if (chapters !== undefined) updateData.chapters = chapters;
  if (roadmap !== undefined) updateData.roadmap = roadmap;
  if (rating !== undefined)
    updateData.rating = rating ? parseFloat(rating) : null;

  const course = await db.course.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });

  if (course.count === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await db.course.findFirst({
    where: { id, userId: user.id },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.course.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
