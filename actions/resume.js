"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
const MODEL_NAME = "claude-sonnet-4-5-20250929";

export async function saveResume({ title, content, resumeId }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("user not found");

  if (resumeId) {
    // Update existing resume
    const resume = await db.resume.update({
      where: { id: resumeId },
      data: { title, content },
    });
    revalidatePath("/resume");
    return resume;
  } else {
    // Create new resume
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        title,
        content,
      },
    });
    revalidatePath("/resume");
    return resume;
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
  if (!user) return [];

  return await db.resume.findMany({
    where: { userId: user.id },
  });
}

export async function getResumeById(resumeId) {
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
    throw new Error("User not authorized to view this resume");
  }

  return resume;
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
}

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
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
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
    const result = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });
    const improvedresponse = result.content[0].text.trim();
    return improvedresponse;
  } catch (error) {
    console.error("error improving resume", error);
    throw new Error("Error improving resume");
  }
}

export async function checkAts(resumeContent, jobDescription) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const prompt = `
    As a skilled ATS scanner, your task is to evaluate the provided resume against the job description.
    
    Resume Content:
    ${resumeContent}
    
    Job Description:
    ${jobDescription}
    
    Provide the following in a JSON format:
    1. "score": A match percentage (0-100).
    2. "keywords_matched": An array of keywords found in both the resume and job description.
    3. "keywords_missing": An array of important keywords from the job description that are missing in the resume.
    4. "suggestions": A string of suggestions to improve the resume for this specific job.

    Example Output:
    {
      "score": 85,
      "keywords_matched": ["JavaScript", "React", "Node.js"],
      "keywords_missing": ["GraphQL", "TypeScript"],
      "suggestions": "Consider adding GraphQL and TypeScript to your skills section to better match the job requirements."
    }
  `;

  try {
    const result = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = result.content[0].text;

    try {
      // First, try to parse the whole string.
      const parsed = JSON.parse(text);
      return { success: true, data: parsed };
    } catch (e) {
      // If that fails, try to extract JSON from a larger string.
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return { success: true, data: parsed };
        } catch (e2) {
          // If even that fails, return an error.
          console.error("Failed to parse extracted JSON", e2);
          return { success: false, error: "Failed to parse AI response." };
        }
      }
      console.error("Failed to parse AI response and no JSON object found", e);
      return { success: false, error: "Failed to parse AI response." };
    }
  } catch (error) {
    console.error("error checking ats", error);
    return { success: false, error: error.message || 'An unknown error occurred during ATS check.' };
  }
}
