"use client";
import { logger } from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumes } from "@/actions/resume";
// Helper to call the ATS checker API
async function checkAts({ jobDescription, resumeFile }) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("resume", resumeFile);
  const res = await fetch("/api/ats-checker", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("ATS check failed");
  }
  const data = await res.json();
  return data.analysis;
}
import { toast } from "sonner";
import { Loader2, Upload, ArrowLeft, FileText, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { entriesToMarkdown } from "@/app/lib/helper";

const AtsCheckerPage = () => {
  const searchParams = useSearchParams();
  const resumeIdFromUrl = searchParams.get("resumeId");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeName, setSelectedResumeName] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);

  // Auto-load resume if resumeId is in URL
  useEffect(() => {
    const loadResumeFromUrl = async () => {
      if (resumeIdFromUrl) {
        setLoadingFromUrl(true);
        try {
          const resumes = await getResumes();
          const resume = resumes.find((r) => r.id === resumeIdFromUrl);
          if (resume) {
            const textContent = convertResumeToText(resume);
            setResumeContent(textContent);
            setSelectedResumeName(resume.title || "Untitled Resume");
            toast.success(
              `Resume "${resume.title || "Untitled"}" loaded automatically`
            );
          }
        } catch (error) {
          logger.error("Failed to load resume from URL:", error);
        } finally {
          setLoadingFromUrl(false);
        }
      }
    };
    loadResumeFromUrl();
  }, [resumeIdFromUrl]);

  // Fetch saved resumes when dialog opens
  const fetchSavedResumes = async () => {
    setLoadingResumes(true);
    try {
      const resumes = await getResumes();
      setSavedResumes(resumes);
    } catch (error) {
      toast.error("Failed to load saved resumes");
    } finally {
      setLoadingResumes(false);
    }
  };

  // Convert resume JSON to text for ATS checking
  const convertResumeToText = (resume) => {
    try {
      const data = JSON.parse(resume.content);
      const { contactInfo, summary, skills, experience, education, projects } =
        data;

      const parts = [];

      // Contact Info
      if (contactInfo?.name) {
        parts.push(`${contactInfo.name}`);
        if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`Phone: ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
          parts.push(`LinkedIn: ${contactInfo.linkedin}`);
        if (contactInfo.github) parts.push(`GitHub: ${contactInfo.github}`);
      }

      // Summary
      if (summary) {
        parts.push(`\nProfessional Summary:\n${summary}`);
      }

      // Skills
      if (skills) {
        parts.push(`\nSkills:\n${skills}`);
      }

      // Experience
      if (experience?.length > 0) {
        parts.push(`\nWork Experience:`);
        experience.forEach((exp) => {
          parts.push(`${exp.title || ""} at ${exp.organization || ""}`);
          if (exp.startDate || exp.endDate) {
            parts.push(`${exp.startDate || ""} - ${exp.endDate || "Present"}`);
          }
          if (exp.description) parts.push(exp.description);
        });
      }

      // Education
      if (education?.length > 0) {
        parts.push(`\nEducation:`);
        education.forEach((edu) => {
          parts.push(`${edu.title || ""} at ${edu.organization || ""}`);
          if (edu.startDate || edu.endDate) {
            parts.push(`${edu.startDate || ""} - ${edu.endDate || ""}`);
          }
          if (edu.description) parts.push(edu.description);
        });
      }

      // Projects
      if (projects?.length > 0) {
        parts.push(`\nProjects:`);
        projects.forEach((proj) => {
          parts.push(`${proj.title || ""}`);
          if (proj.description) parts.push(proj.description);
        });
      }

      return parts.filter(Boolean).join("\n");
    } catch {
      return resume.content || "";
    }
  };

  const handleSelectResume = (resume) => {
    const textContent = convertResumeToText(resume);
    setResumeContent(textContent);
    setSelectedResumeName(resume.title || "Untitled Resume");
    setImportDialogOpen(false);
    toast.success(`Loaded "${resume.title || "Untitled Resume"}"`);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeContent(e.target.result);
        setSelectedResumeName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleCheckAts = async () => {
    if (!jobDescription) {
      toast.error("Please paste the job description.");
      return;
    }
    if (!resumeContent) {
      toast.error("Please upload your resume.");
      return;
    }
    setIsChecking(true);
    try {
      const result = await checkAts(resumeContent, jobDescription);
      let parsed = null;
      // Log the raw result for debugging
      logger.debug("Raw ATS result:", result);
      if (result && typeof result === "object" && result.success) {
        // New server action format
        if (result.data) {
          try {
            parsed =
              typeof result.data === "string"
                ? JSON.parse(result.data)
                : result.data;
          } catch (err) {
            // If parsing fails, show raw data
            logger.error(
              "Failed to parse ATS data as JSON:",
              result.data,
              err
            );
            toast.error(
              "ATS check completed, but result could not be parsed. Showing raw analysis."
            );
            setAtsResult({ raw: result.data });
            return;
          }
        } else if (result.error) {
          toast.error(result.error);
          return;
        }
      } else if (typeof result === "string") {
        try {
          parsed = JSON.parse(result);
        } catch (err) {
          logger.error("Failed to parse ATS result as JSON:", result, err);
          toast.error(
            "ATS check completed, but result could not be parsed. Showing raw analysis."
          );
          setAtsResult({ raw: result });
          return;
        }
      }
      if (parsed) {
        setAtsResult(parsed);
        toast.success("ATS check completed!");
      } else {
        toast.error("ATS check failed: No result returned.");
      }
    } catch (error) {
      logger.error("Failed to check ATS score:", error);
      toast.error("Failed to check ATS score.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Back Button */}
      <Link
        href="/resume"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resume Studio</span>
      </Link>
      <h1 className="text-6xl font-bold gradient-title">
        ATS Checker & Resume Analysis
      </h1>

      <div className="space-y-3">
        <label className="text-sm font-medium">Select Your Resume</label>
        <div className="flex items-center gap-3">
          {/* Upload from device */}
          <input
            id="resume-upload"
            type="file"
            onChange={handleFileChange}
            accept=".txt,.pdf,.docx"
            className="hidden"
          />
          <Button variant="outline" className="gap-2" asChild>
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload from Device
            </label>
          </Button>

          {/* Import from saved resumes */}
          <Dialog
            open={importDialogOpen}
            onOpenChange={(open) => {
              setImportDialogOpen(open);
              if (open) fetchSavedResumes();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Import from Application
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-black">
                  Select a Saved Resume
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto space-y-2 py-2">
                {loadingResumes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : savedResumes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No saved resumes found.</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/resume/build">Create a Resume</Link>
                    </Button>
                  </div>
                ) : (
                  savedResumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => handleSelectResume(resume)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-medium text-black">
                          {resume.title || "Untitled"}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Updated{" "}
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Check className="h-4 w-4 text-gray-300 group-hover:text-black" />
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Show selected resume name with remove option */}
        {selectedResumeName && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Loaded: {selectedResumeName}
            </p>
            <button
              onClick={() => {
                setResumeContent("");
                setSelectedResumeName("");
                toast.success("Resume removed");
              }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
              title="Remove resume"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="job-description" className="text-sm font-medium">
          Paste Job Description
        </label>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="h-40"
        />
      </div>
      <Button onClick={handleCheckAts} disabled={isChecking}>
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          "Check ATS Score"
        )}
      </Button>

      {atsResult && (
        <Card>
          <CardHeader>
            <CardTitle>ATS Score & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {atsResult.raw ? (
              <div>
                <h4 className="font-medium text-red-600">
                  Raw Analysis Output
                </h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {typeof atsResult.raw === "string"
                    ? atsResult.raw
                    : JSON.stringify(atsResult.raw, null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  (Could not parse structured ATS result. Please review the raw
                  output.)
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">
                    Overall Match Score: {atsResult.score}%
                  </p>
                  <Progress value={atsResult.score} className="w-full" />
                </div>
                <div>
                  <h4 className="font-medium">Keywords Matched:</h4>
                  <p>{atsResult.keywords_matched?.join(", ")}</p>
                </div>
                <div>
                  <h4 className="font-medium">Keywords Missing:</h4>
                  <p>{atsResult.keywords_missing?.join(", ")}</p>
                </div>
                <div>
                  <h4 className="font-medium">Suggestions:</h4>
                  <p>{atsResult.suggestions}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AtsCheckerPage;
