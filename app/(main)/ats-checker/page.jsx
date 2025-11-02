"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AtsCheckerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription || !resume) {
      alert("Please provide both a job description and a resume.");
      return;
    }

    setLoading(true);
    setAnalysis("");

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("resume", resume);

    try {
      const response = await fetch("/api/ats-checker", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setAnalysis(result.analysis);
      } else {
        throw new Error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ATS Resume Checker</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="resume">Resume (PDF)</Label>
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </Button>
      </form>
      {analysis && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          <div className="p-4 bg-gray-100 rounded-md dark:bg-gray-800">
            <pre className="whitespace-pre-wrap">{analysis}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
