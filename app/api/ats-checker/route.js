import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { Poppler } from "node-poppler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";

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
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription");
    const resumeFile = formData.get("resume");

    if (!jobDescription || !resumeFile) {
      return NextResponse.json(
        { error: "Missing job description or resume" },
        { status: 400 }
      );
    }

    const tempDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, resumeFile.name);
    await fs.writeFile(tempFilePath, Buffer.from(await resumeFile.arrayBuffer()));

    const poppler = new Poppler();
    const outputPrefix = path.join(tempDir, "resume");
    await poppler.pdfToCairo(tempFilePath, outputPrefix, {
      png: true,
      singleFile: true,
    });

    const imagePath = `${outputPrefix}.png`;
    const imageBuffer = await fs.readFile(imagePath);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a skilled ATS (Applicant Tracking System) scanner with a deep understanding of data science and ATS functionality.
      Your task is to evaluate the resume against the provided job description. Give me the percentage of match if the resume matches
      with the job description. First, the output should come as a percentage, then keywords missing, and last, final thoughts.
    `;

    const imagePart = await fileToGenerativePart(imageBuffer, "image/png");

    const result = await model.generateContent([prompt, imagePart]);

    const response = await result.response;
    const text = response.text();

    await fs.unlink(tempFilePath);
    await fs.unlink(imagePath);

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Error in ats-checker API route:", error);
    const tempDir = path.join(process.cwd(), "tmp");
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file));
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
