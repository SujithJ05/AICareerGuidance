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
      console.error("ATS API: Missing job description or resume file", { jobDescription, resumeFile });
      return NextResponse.json(
        { error: "Missing job description or resume file" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploaded_resume.pdf");
    try {
      fs.writeFileSync(tempFilePath, Buffer.from(await resumeFile.arrayBuffer()));
    } catch (err) {
      console.error("ATS API: Error writing temp PDF file", err);
      return NextResponse.json({ error: "Failed to write temp PDF file", details: err?.message || String(err) }, { status: 500 });
    }

    let text = "";
    try {
      const pdfParser = new PDFParser();
      const pdfData = fs.readFileSync(tempFilePath);
      await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (err) => {
          console.error("ATS API: PDF parse error", err);
          reject(err.parserError);
        });
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          if (!pdfData.Pages) {
            console.error("ATS API: Invalid PDF structure", pdfData);
            reject(new Error("Invalid PDF structure: Missing 'Pages'"));
            return;
          }
          text = pdfData.Pages.map((page) =>
            page.Texts.map((textObj) => textObj.R.map((r) => r.T).join("")).join(" ")
          ).join("\n");
          resolve();
        });
        pdfParser.parseBuffer(pdfData);
      });
    } catch (err) {
      console.error("ATS API: Error parsing PDF", err);
      return NextResponse.json({ error: "Failed to parse PDF", details: err?.message || String(err) }, { status: 500 });
    }

    const prompt = `
    As a skilled ATS scanner, your task is to evaluate the provided resume against the job description.
    
    Resume Content:
    ${text}
    
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

      const aiResponseText = result.content[0].text;

      let parsedAnalysis;
      try {
        // First, try to parse the whole string.
        parsedAnalysis = JSON.parse(aiResponseText);
      } catch (e) {
        // If that fails, try to extract JSON from a larger string.
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedAnalysis = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.error("ATS API: Failed to parse extracted JSON", e2);
            return NextResponse.json({ error: "Failed to parse AI response: extracted content is not valid JSON." }, { status: 500 });
          }
        } else {
          console.error("ATS API: Failed to parse AI response and no JSON object found", e);
          return NextResponse.json({ error: "Failed to parse AI response: no JSON object found." }, { status: 500 });
        }
      }
      return NextResponse.json({ analysis: parsedAnalysis });
    } catch (error) {
      console.error("ATS API: Error generating content from Claude", error);
      return NextResponse.json({ error: "Failed to generate ATS analysis", details: error?.message || String(error) }, { status: 500 });
    }
  } catch (error) {
    console.error("ATS API: General error analyzing resume", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }