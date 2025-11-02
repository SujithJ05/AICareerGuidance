"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export async function saveResume(content) {

    const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    
  });
  if (!user) throw new Error("user not found");


  try{
    const resume =await db.resume.upsert({
        where:{userId:user.id},
        update:{content,},
        create:{userId:user.id,content}

    })
    revalidatePath("/resume")
    return resume;
  } catch(error){
    console.error("error saving resume",error);
    throw new Error("Error saving resume");
  }
}

export async function getResume(){
    const {userId}=await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const user=await db.user.findUnique({
        where:{clerkUserId:userId},
    });
    if(!user) throw new Error("user not found");

    return await db.resume.findUnique({
        where:{userId:user.id},
    })
}

export async function improveWithAI({current,type}){

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
    try{
        const result=await model.generateContent(prompt)
        const response=result.response;
        const improvedresponse=response.text().trim();
        return improvedresponse;
    }catch(error){
        console.error("error improving resume",error);
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("error checking ats", error);
    throw new Error("Error checking ats");
  }
}
  
  

  
  
