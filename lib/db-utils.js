import { db } from "./prisma";
import { memoryCache } from "./cache";

export async function getCachedUser(clerkUserId, ttl = 300000) {
  const cacheKey = `user:${clerkUserId}`;
  const cached = memoryCache.get(cacheKey);

  if (cached) return cached;

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
      bio: true,
      experience: true,
      skills: true,
    },
  });

  if (user) {
    memoryCache.set(cacheKey, user, ttl);
  }

  return user;
}

export function invalidateUserCache(clerkUserId) {
  memoryCache.delete(`user:${clerkUserId}`);
}

export async function getCachedCourses(userId, ttl = 60000) {
  const cacheKey = `courses:${userId}`;
  const cached = memoryCache.get(cacheKey);

  if (cached) return cached;

  const courses = await db.course.findMany({
    where: { userId },
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
      progress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  memoryCache.set(cacheKey, courses, ttl);
  return courses;
}

export function invalidateCourseCache(userId) {
  memoryCache.delete(`courses:${userId}`);
}

export async function batchFindUsers(clerkUserIds) {
  return db.user.findMany({
    where: {
      clerkUserId: { in: clerkUserIds },
    },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      email: true,
      imageUrl: true,
    },
  });
}

export async function optimizedResumeFetch(userId) {
  return db.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
