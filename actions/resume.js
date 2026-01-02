"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * Get resume by ID
 */
export async function getResumeById(resumeId) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  return resume;
}

/**
 * Check ATS compatibility
 */
export async function checkAts(content, jobDescription) {
  try {
    // Implementation for ATS checking would go here
    // This could integrate with the ATS checker API
    return {
      success: true,
      score: 0,
      message: "ATS check completed",
    };
  } catch (error) {
    console.error("ATS check error:", error);
    return {
      success: false,
      error: "Failed to check ATS compatibility",
    };
  }
}

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("user not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${
    user.industry || "general"
  } professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const improvedResponse = response.content[0].text.trim();
    return improvedResponse;
  } catch (error) {
    console.error("error improving resume", error);
    throw new Error("Error improving resume");
  }
}

export async function getResumes() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("user not found");
  return await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteResume(resumeId) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (resume.userId !== user.id) {
    throw new Error("User not authorized to delete this resume");
  }

  await db.resume.delete({
    where: { id: resumeId },
  });

  revalidatePath("/resume");
  return { success: true };
}

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("user not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });
    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("error saving resume", error);
    throw new Error("Error saving resume");
  }
}
