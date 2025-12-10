export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
const MODEL_NAME = "claude-3-haiku-20240307";

export async function POST(_, { params }) {
  const { id } = await params;
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const course = await db.course.findFirst({
    where: { id, userId: user.id },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  try {
    // Analyze actual content metrics
    const roadmap = course.roadmap || "";
    const chapterCount = (roadmap.match(/^## /gm) || []).length;
    const codeBlockCount = Math.floor((roadmap.match(/```/g) || []).length / 2);
    const wordCount = roadmap.split(/\s+/).length;

    let rating;

    // Try AI-based rating first
    try {
      const contentForEvaluation = roadmap.substring(0, 8000);

      const prompt = `You are a course quality evaluator. Analyze this course and provide an accurate rating.

COURSE METADATA:
- Title: "${course.title}"
- Category: ${course.category}
- Target Level: ${course.difficulty}
- Duration: ${course.duration}
- Requested Chapters: ${course.chapters}

ACTUAL CONTENT METRICS:
- Chapters found: ${chapterCount}
- Code blocks: ${codeBlockCount}
- Word count: ${wordCount}

COURSE CONTENT:
${contentForEvaluation}
${roadmap.length > 8000 ? "\n... [content truncated for evaluation]" : ""}

EVALUATION CRITERIA (rate each 1-5, then calculate weighted average):
1. Content Depth (25%): Does it cover the topic thoroughly for ${
        course.difficulty
      } level?
2. Practical Value (25%): Are there real-world examples and usable code?
3. Clarity (20%): Is the explanation clear and well-structured?
4. Code Quality (15%): Are code examples correct and educational?
5. Completeness (15%): Does content match the ${
        course.chapters
      } chapters requested?

RATING GUIDELINES:
- 1.0-2.0: Poor - Missing content, errors, or very incomplete
- 2.1-3.0: Below Average - Basic content, few examples, needs improvement
- 3.1-3.5: Average - Decent coverage but lacking depth or examples
- 3.6-4.0: Good - Solid content with good examples
- 4.1-4.5: Very Good - Comprehensive with excellent examples
- 4.6-5.0: Excellent - Outstanding, professional quality course

Based on your analysis, provide the final rating.
RESPOND WITH ONLY A SINGLE NUMBER (e.g., 3.7 or 4.2). Nothing else.`;

      const result = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      });

      const responseText = result.content[0].text.trim();
      const numberMatch = responseText.match(/(\d+\.?\d*)/);
      rating = numberMatch ? parseFloat(numberMatch[1]) : null;

      if (!isNaN(rating) && rating !== null) {
        rating = Math.min(5.0, Math.max(1.0, rating));
        rating = Math.round(rating * 10) / 10;
        console.log("AI evaluated rating:", rating);
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (aiError) {
      // Fallback to metrics-based rating if AI fails
      console.log(
        "AI rating failed, using metrics-based fallback:",
        aiError.message
      );
      rating = Math.min(
        5.0,
        2.5 +
          (chapterCount >= course.chapters ? 0.5 : 0) +
          (codeBlockCount >= 3 ? 0.5 : codeBlockCount * 0.15) +
          (wordCount >= 1000 ? 0.5 : wordCount / 2000)
      );
      rating = Math.round(rating * 10) / 10;
      console.log("Metrics-based fallback rating:", rating);
    }

    // Update the course with the new rating
    await db.course.update({
      where: { id },
      data: { rating },
    });

    return NextResponse.json({ rating, success: true });
  } catch (error) {
    console.error("Rating generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate rating" },
      { status: 500 }
    );
  }
}
