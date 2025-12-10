import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// GET - List all certificates for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's database ID
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificates = await db.certificate.findMany({
      where: { userId: user.id },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

// POST - Generate a certificate for a completed course
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the course and verify it belongs to the user
    const course = await db.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have access to this course" },
        { status: 403 }
      );
    }

    // Check if course is 100% complete
    const sectionProgress = course.sectionProgress || [];
    const isComplete =
      sectionProgress.length > 0 &&
      sectionProgress.every(
        (chapter) =>
          Array.isArray(chapter) && chapter.length > 0 && chapter.every(Boolean)
      );

    if (!isComplete) {
      return NextResponse.json(
        { error: "Course must be 100% complete to generate a certificate" },
        { status: 400 }
      );
    }

    // Check if certificate already exists for this course
    const existingCertificate = await db.certificate.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    if (existingCertificate) {
      return NextResponse.json(existingCertificate);
    }

    // Create the certificate
    const certificate = await db.certificate.create({
      data: {
        userId: user.id,
        courseId: course.id,
        courseName: course.title,
        userName: user.name || "Learner",
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
