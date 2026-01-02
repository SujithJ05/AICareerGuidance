import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Centralized error handler for API routes
 */
export function handleApiError(error, customMessage = "Internal server error") {
  console.error("API Error:", error);

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

/**
 * Authenticate user and return both Clerk user ID and database user
 */
export async function authenticateUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return { clerkUserId, user };
}

/**
 * Validate required fields in request body
 */
export function validateFields(data, requiredFields) {
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw {
      status: 400,
      message: `Missing required fields: ${missing.join(", ")}`,
    };
  }
}

/**
 * Success response helper
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
