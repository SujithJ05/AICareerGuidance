import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export function handleApiError(error, customMessage = "Internal server error") {
  logger.error("API Error:", error);

  const status = error.status || 500;
  const message = error.message || customMessage;

  return NextResponse.json(
    {
      error: customMessage,
      ...(process.env.NODE_ENV === "development" && { details: message }),
    },
    { status }
  );
}

export async function authenticateUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      name: true,
      imageUrl: true,
      industry: true,
      specializations: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return { clerkUserId, user };
}

export function validateFields(data, requiredFields) {
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw {
      status: 400,
      message: `Missing required fields: ${missing.join(", ")}`,
    };
  }
}

export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
