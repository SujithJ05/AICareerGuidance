import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// GET - Get user's streak info
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if streak should be reset (missed a day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = user.currentStreak || 0;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      // If more than 1 day has passed, streak is broken
      if (diffDays > 1) {
        currentStreak = 0;
        // Update in database
        await db.user.update({
          where: { clerkUserId: userId },
          data: { currentStreak: 0 },
        });
      }
    }

    return NextResponse.json({
      currentStreak,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: user.lastActiveDate,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

// POST - Update streak (called when user interacts with app)
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.currentStreak || 0;
    let newLongestStreak = user.longestStreak || 0;
    let shouldUpdate = false;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already logged activity today, no change needed
        return NextResponse.json({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          message: "Already logged today",
        });
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
        shouldUpdate = true;
      } else {
        // Streak broken - start fresh
        newStreak = 1;
        shouldUpdate = true;
      }
    } else {
      // First activity ever
      newStreak = 1;
      shouldUpdate = true;
    }

    // Update longest streak if current is higher
    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }

    if (shouldUpdate) {
      await db.user.update({
        where: { clerkUserId: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      message: "Streak updated",
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}
