"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AtsCheckerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);
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
    setResult(null);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("resume", resume);

    try {
      const response = await fetch("/api/ats-checker", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while analyzing the resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl">ATS Resume Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here"
                className="h-40"
              />
            </div>
            <div>
              <Label htmlFor="resume">Resume (PDF only)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Check ATS Score"}
            </Button>
          </form>

          {result && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold">Analysis Result</h3>
              <pre className="bg-gray-100 p-4 rounded-md mt-4 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}