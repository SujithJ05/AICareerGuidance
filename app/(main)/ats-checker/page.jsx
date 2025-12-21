"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">ATS Resume Checker</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full mt-2"
            />
          </div>
          <div>
            <Label htmlFor="resume-upload">Upload Resume</Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full mt-2"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full text-lg font-semibold bg-gray-900 hover:bg-gray-800">
            {loading ? "Checking..." : "Check ATS Score"}
          </Button>
        </form>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200"
          >
            <h2 className="font-semibold mb-2 text-gray-800">Analysis Result</h2>
            <pre className="whitespace-pre-wrap text-base text-gray-700">{analysis}</pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">ATS Resume Checker</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full mt-2"
            />
          </div>
          <div>
            <Label htmlFor="resume-upload">Upload Resume</Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full mt-2"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full text-lg font-semibold bg-gray-900 hover:bg-gray-800">
            {loading ? "Checking..." : "Check ATS Score"}
          </Button>
        </form>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200"
          >
            <h2 className="font-semibold mb-2 text-gray-800">Analysis Result</h2>
            <pre className="whitespace-pre-wrap text-base text-gray-700">{analysis}</pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
