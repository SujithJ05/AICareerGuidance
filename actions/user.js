"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";


export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Always use db.user (lowercase) — matches Prisma client convention
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        industry: data.industry, // This will now be an array
        specializations: data.subIndustry, // Map to the new specializations array field
        name: data.name,
        bio: data.bio,
        experience: data.experience,
        skills: data.skills,
      },
    });

    return { success: true, updatedUser };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Error updating profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    // If no user record in DB yet → treat as not onboarded
    if (!user) {
      return { isOnboarded: false };
    }

    return {
      isOnboarded: !!user.industry, // true if industry exists, false otherwise
    };
  } catch (error) {
    console.error("Error getting user onboarding status:", error);
    throw new Error("Error getting user onboarding status");
  }
}
