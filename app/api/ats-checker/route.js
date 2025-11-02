import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import fs from "fs";
import path from "path";
import os from "os";

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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("No Gemini/Google API key found in environment");
      return NextResponse.json(
        {
          error: "Missing API key",
          details: "Set GEMINI_API_KEY or GOOGLE_API_KEY in your .env",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Update the model name directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Save the uploaded file temporarily
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploaded_resume.pdf");
    fs.writeFileSync(tempFilePath, Buffer.from(await resumeFile.arrayBuffer()));

    // Extract text from the PDF using pdf2json
    const pdfParser = new PDFParser();
    const pdfData = fs.readFileSync(tempFilePath);

    let text = "";
    await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        console.log("PDF Data:", pdfData); // Log the entire pdfData object for debugging

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
      const result = await model.generateContent(prompt);

      const analysis =
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        JSON.stringify(result?.response || result);

      return NextResponse.json({ analysis });
    } catch (error) {
      console.error("Error generating content:", error);

      if (error.message.includes("ListModels")) {
        return NextResponse.json(
          {
            error: "Model not found or unsupported",
            details:
              "Use the ListModels method to fetch available models and their supported methods.",
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw other errors
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

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    );
    const models = await genAI.listModels();

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error listing models:", error);
    return NextResponse.json(
      {
        error: "Failed to list models",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
