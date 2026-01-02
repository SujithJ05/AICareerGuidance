import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { Poppler } from "node-poppler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { apiLimiter } from "@/lib/rate-limit";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(req) {
  const tempDir = path.join(process.cwd(), "tmp");
  let tempFilePath = null;
  let imagePath = null;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = apiLimiter.check(10, userId);
    if (rateLimitResult.isRateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
          },
        }
      );
    }

    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription");
    const resumeFile = formData.get("resume");

    if (!jobDescription || !resumeFile) {
      return NextResponse.json(
        { error: "Missing job description or resume" },
        { status: 400 }
      );
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    await fs.mkdir(tempDir, { recursive: true });
    tempFilePath = path.join(tempDir, `${Date.now()}-${resumeFile.name}`);
    await fs.writeFile(
      tempFilePath,
      Buffer.from(await resumeFile.arrayBuffer())
    );

    const poppler = new Poppler();
    const outputPrefix = path.join(tempDir, `resume-${Date.now()}`);
    await poppler.pdfToCairo(tempFilePath, outputPrefix, {
      png: true,
      singleFile: true,
    });

    imagePath = `${outputPrefix}.png`;
    const imageBuffer = await fs.readFile(imagePath);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a skilled ATS (Applicant Tracking System) scanner with a deep understanding of data science and ATS functionality.
      Your task is to evaluate the resume against the provided job description. Give me the percentage of match if the resume matches
      with the job description. First, the output should come as a percentage, then keywords missing, and last, final thoughts.
      
      Job Description:
      ${jobDescription}
    `;

    const imagePart = await fileToGenerativePart(imageBuffer, "image/png");

    const result = await model.generateContent([prompt, imagePart]);

    const response = await result.response;
    const text = response.text();

    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    if (imagePath) await fs.unlink(imagePath).catch(() => {});

    return NextResponse.json({ result: text });
  } catch (error) {
    logger.error("Error in ats-checker API route:", error);

    try {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
      if (imagePath) await fs.unlink(imagePath).catch(() => {});

      const files = await fs.readdir(tempDir).catch(() => []);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file)).catch(() => {});
      }
    } catch (cleanupError) {
      logger.error("Cleanup error:", cleanupError);
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
