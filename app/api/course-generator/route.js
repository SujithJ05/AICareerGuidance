import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript"; // Uncomment if using youtube-transcript
import Anthropic from "@anthropic-ai/sdk"; // Or your LLM provider

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const MODEL_NAME = "claude-sonnet-4-5-20250929";

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, topic, desc, difficulty, duration, addVideo, chapters } =
      body;

    // Create a detailed prompt for course generation
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

Now generate the full course:`;

    // Generate course content using Claude
    let roadmap;
    try {
      const result = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });
      roadmap = result.content[0].text;
    } catch (err) {
      console.error("Course generation error:", err);
      roadmap = "Course could not be generated. Please try again.";
    }

    return NextResponse.json({
      roadmap,
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
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
