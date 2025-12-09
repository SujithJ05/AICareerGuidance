import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import PDFParser from "pdf2json";
import fs from "fs";
import path from "path";
import os from "os";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
const MODEL_NAME = "claude-3-haiku-20240229";

export async function POST(request) {
  try {
    const data = await request.formData();
    const jobDescription = data.get("jobDescription");
    const resumeFile = data.get("resume");

    if (!jobDescription || !resumeFile) {
      return NextResponse.json(
        { error: "Missing job description or resume file" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploaded_resume.pdf");
    fs.writeFileSync(tempFilePath, Buffer.from(await resumeFile.arrayBuffer()));

    const pdfParser = new PDFParser();
    const pdfData = fs.readFileSync(tempFilePath);

    let text = "";
    await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        if (!pdfData.Pages) {
          reject(new Error("Invalid PDF structure: Missing 'Pages'"));
          return;
        }

        text = pdfData.Pages.map((page) =>
          page.Texts.map((textObj) => textObj.R.map((r) => r.T).join("")).join(
            " "
          )
        ).join("\n");
        resolve();
      });
      pdfParser.parseBuffer(pdfData);
    });

    const prompt =
      `You are a skilled ATS (Applicant Tracking System) scanner with a deep understanding of data science and ATS functionality.\n\n` +
      `The resume is provided as extracted text. Evaluate the resume against the provided job description.\n\n` +
      `Return the output exactly in this format:\n1) Percentage match: <number>%\n2) Missing keywords: [comma separated]\n3) Final thoughts: <text>\n\n` +
      `Job Description:\n${jobDescription}\n\nResume Text:\n${text}`;

    try {
      const result = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });

      const analysis = result.content[0].text || JSON.stringify(result);

      return NextResponse.json({ analysis });
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}