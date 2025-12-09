"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
const MODEL_NAME = "claude-3-haiku-20240229";

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook":"POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await anthropic.messages.create({
    model: MODEL_NAME,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });
  const text = result.content[0].text;
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("user not found");

  if (!user.industry || user.industry.length === 0) {
    // User hasn't selected an industry yet
    return null; // Or redirect to onboarding
  }

  // Fetch the industry insight separately based on the user's first industry
  // Assuming a user primarily focuses on their first listed industry for a single insight
  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: user.industry[0] },
  });

  if (!industryInsight) {
    // If no existing insight, generate new ones
    const insights = await generateAIInsights(user.industry[0]); // Pass the first industry

    industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry[0], // Use the first industry for creation
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  // TODO: Add logic to update insight if nextUpdate is in the past

  return industryInsight;
}
