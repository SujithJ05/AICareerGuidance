import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript"; // Uncomment if using youtube-transcript
import Anthropic from "@anthropic-ai/sdk"; // Or your LLM provider
import { logger } from "@/lib/logger";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const MODEL_NAME = "claude-sonnet-4-5-20250929";

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, topic, desc, difficulty, duration, addVideo, chapters } =
      body;

    // Create a detailed prompt for course generation with rating
    const prompt = `You are an expert course designer and educator. Create a comprehensive, detailed course for "${topic}" with the following specifications:

Course Details:
- Category: ${category}
- Description: ${desc}
- Difficulty Level: ${difficulty}
- Duration: ${duration}
- Number of Chapters: ${chapters}
- Include Video Resources: ${addVideo}

Generate a complete course with ${chapters} chapters. For EACH chapter, provide:

1. Chapter title (use ## heading)
2. Estimated time (e.g., "15 minutes", "20 minutes")
3. Detailed explanation of concepts
4. Code examples in code blocks (use \`\`\` for code blocks)
5. Practical examples and use cases
6. Key points to remember

Format the response in Markdown with:
- ## for chapter titles (e.g., "## Chapter 1: Welcome to Python")
- ### for section headings within chapters
- Code blocks with \`\`\` for all code examples
- Clear explanations and descriptions
- Time estimates for each chapter

Make the content practical, educational, and easy to follow. Include real code examples that students can learn from.

IMPORTANT: After generating the course content, you MUST evaluate the course quality and provide a rating.
At the VERY END of your response, on its own line, add the rating in this EXACT format:
COURSE_RATING: X.X

Where X.X is a decimal rating from 1.0 to 5.0 based on these criteria:
- Content depth and comprehensiveness (weight: 25%)
- Practical applicability (weight: 25%)  
- Clarity of explanations (weight: 20%)
- Code examples quality (weight: 15%)
- Overall learning value (weight: 15%)

Calculate a weighted average for the final rating. Be critical and honest - not every course is 4.0 or above.
A beginner course might rate 3.5-4.0, an excellent comprehensive course 4.5-5.0.

YOU MUST include the COURSE_RATING line at the very end. This is mandatory.

Example format:
## Chapter 1: Introduction to [Topic]
⏱️ 15 minutes

[Detailed explanation of the chapter content]

### Key Concepts
[List key concepts]

### Code Example
\`\`\`
[actual code here]
\`\`\`

### Explanation
[Explain the code]

...more chapters...

COURSE_RATING: 4.2

Now generate the full course:`;

    // Generate course content using Claude
    let roadmap;
    let rating = null;
    try {
      const result = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });
      const fullResponse = result.content[0].text;

      // Extract rating from the response - try multiple patterns
      const ratingPatterns = [
        /COURSE_RATING:\s*(\d+\.?\d*)/i,
        /COURSE RATING:\s*(\d+\.?\d*)/i,
        /Rating:\s*(\d+\.?\d*)\s*\/\s*5/i,
        /(\d+\.?\d*)\s*\/\s*5\s*$/m,
      ];

      let ratingMatch = null;
      for (const pattern of ratingPatterns) {
        ratingMatch = fullResponse.match(pattern);
        if (ratingMatch) break;
      }

      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
        // Ensure rating is within bounds
        rating = Math.min(5.0, Math.max(1.0, rating));
        // Round to 1 decimal place
        rating = Math.round(rating * 10) / 10;
        // Remove the rating line from the roadmap
        roadmap = fullResponse
          .replace(/COURSE_RATING:\s*\d+\.?\d*/gi, "")
          .replace(/COURSE RATING:\s*\d+\.?\d*/gi, "")
          .replace(/Rating:\s*\d+\.?\d*\s*\/\s*5/gi, "")
          .trim();
        logger.debug("AI evaluated rating from course generation:", rating);
      } else {
        roadmap = fullResponse;
        logger.debug("Rating not found in response, evaluating separately...");
      }

      // Always evaluate separately to ensure accurate rating
      // This evaluates the ACTUAL generated content, not just metadata
      try {
        // Take a substantial portion of the course for evaluation
        const contentForEvaluation = roadmap.substring(0, 8000);
        const chapterCount = (roadmap.match(/^## /gm) || []).length;
        const codeBlockCount = (roadmap.match(/```/g) || []).length / 2;
        const wordCount = roadmap.split(/\s+/).length;

        const ratingPrompt = `You are a course quality evaluator. Analyze this generated course and provide a rating.

COURSE METADATA:
- Topic: "${topic}"
- Category: ${category}
- Target Level: ${difficulty}
- Requested Duration: ${duration}
- Requested Chapters: ${chapters}

ACTUAL CONTENT METRICS:
- Chapters found: ${chapterCount}
- Code blocks: ${Math.floor(codeBlockCount)}
- Word count: ${wordCount}

COURSE CONTENT TO EVALUATE:
${contentForEvaluation}

EVALUATION CRITERIA (rate each 1-5):
1. Content Depth: Does it cover the topic thoroughly for the ${difficulty} level?
2. Practical Value: Are there real-world examples and usable code?
3. Clarity: Is the explanation clear and well-structured?
4. Code Quality: Are code examples correct, commented, and educational?
5. Completeness: Does it meet the requested ${chapters} chapters and ${duration} duration?

Based on your evaluation, calculate a weighted score:
- Content Depth: 25%
- Practical Value: 25%
- Clarity: 20%
- Code Quality: 15%
- Completeness: 15%

IMPORTANT: Respond with ONLY the final rating as a decimal number between 1.0 and 5.0.
Examples: 3.2, 4.1, 3.7, 4.5

Your rating:`;

        const ratingResult = await anthropic.messages.create({
          model: "claude-3-haiku-20240229",
          max_tokens: 10,
          messages: [{ role: "user", content: ratingPrompt }],
        });

        const ratingText = ratingResult.content[0].text.trim();
        // Extract just the number from response
        const numberMatch = ratingText.match(/(\d+\.?\d*)/);
        if (numberMatch) {
          const evaluatedRating = parseFloat(numberMatch[1]);
          if (
            !isNaN(evaluatedRating) &&
            evaluatedRating >= 1.0 &&
            evaluatedRating <= 5.0
          ) {
            rating = Math.round(evaluatedRating * 10) / 10;
            logger.debug(
              "Evaluated rating:",
              rating,
              "from response:",
              ratingText
            );
          }
        }
      } catch (ratingErr) {
        logger.error("Rating evaluation error:", ratingErr);
        // Keep the rating from the main response if we had one, otherwise null
      }
    } catch (err) {
      logger.error("Course generation error:", err);
      roadmap = "Course could not be generated. Please try again.";
      rating = null;
    }

    return NextResponse.json({
      roadmap,
      rating,
      courseInfo: {
        title: topic,
        description: desc,
        category,
        difficulty,
        duration,
        chapters: parseInt(chapters),
      },
    });
  } catch (error) {
    logger.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
