"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileText,
  X,
} from "lucide-react";
import { getResumes, deleteResume } from "@/actions/resume";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { entriesToMarkdown } from "@/app/lib/helper";

const ResumeDashboardPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const fetchedResumes = await getResumes();
        setResumes(fetchedResumes);
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDeleteClick = (resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;
    try {
      await deleteResume(resumeToDelete.id);
      setResumes(resumes.filter((resume) => resume.id !== resumeToDelete.id));
      toast.success("Resume deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete resume.");
    } finally {
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handlePreview = (resume) => {
    setPreviewResume(resume);
    setPreviewOpen(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Parse resume content to get name for display
  const getResumeName = (resume) => {
    try {
      const content = JSON.parse(resume.content);
      return content?.contactInfo?.name || resume.title || "Untitled";
    } catch {
      return resume.title || "Untitled";
    }
  };

  // Get mini preview data from resume content
  const getResumePreview = (resume) => {
    try {
      const data = JSON.parse(resume.content);
      const { contactInfo, summary, skills, experience, education } = data;

      return {
        name: contactInfo?.name || "Untitled",
        email: contactInfo?.email || "",
        phone: contactInfo?.mobile || "",
        summary: summary
          ? summary.substring(0, 80) + (summary.length > 80 ? "..." : "")
          : "",
        skills: skills
          ? skills.substring(0, 60) + (skills.length > 60 ? "..." : "")
          : "",
        experience:
          experience?.[0]?.title || experience?.[0]?.organization || "",
        education: education?.[0]?.organization || education?.[0]?.title || "",
      };
    } catch {
      return {
        name: resume.title || "Untitled",
        email: "",
        phone: "",
        summary: "",
        skills: "",
        experience: "",
        education: "",
      };
    }
  };

  // Convert resume JSON content to markdown for preview
  const getResumeMarkdown = (resume) => {
    try {
      const data = JSON.parse(resume.content);
      const { contactInfo, summary, skills, experience, education, projects } =
        data;

      const parts = [];

      // Contact Info
      if (contactInfo?.name) {
        const contactParts = [];
        if (contactInfo.email) contactParts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) contactParts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin) contactParts.push(`💼 LinkedIn`);
        if (contactInfo.github) contactParts.push(`💻 GitHub`);

        parts.push(`## ${contactInfo.name}\n\n${contactParts.join(" | ")}`);
      }

      // Summary
      if (summary) {
        parts.push(`## Professional Summary\n\n${summary}`);
      }

      // Skills
      if (skills) {
        parts.push(`## Skills\n\n${skills}`);
      }

      // Experience
      if (experience?.length > 0) {
        parts.push(entriesToMarkdown(experience, "Work Experience"));
      }

      // Education
      if (education?.length > 0) {
        parts.push(entriesToMarkdown(education, "Education"));
      }

      // Projects
      if (projects?.length > 0) {
        parts.push(entriesToMarkdown(projects, "Projects"));
      }

      return parts.filter(Boolean).join("\n\n");
    } catch {
      return resume.content || "Unable to preview resume content.";
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <h1 className="text-6xl font-bold gradient-title">Resume Studio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              ATS Checker & Resume Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Upload your resume and a job description to get an ATS score and
              feedback on how to improve your resume.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/resume/ats">
                Go to ATS Checker <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create a New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Build a professional resume from scratch with our easy-to-use
              resume builder.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/resume/build">
                Create Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Manage, preview, and refine every version you've saved.
        </p>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : resumes.length === 0 ? (
          <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
            <CardContent className="p-6 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-black mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Create your first resume to see it here!
              </p>
              <Button
                asChild
                className="bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                <Link href="/resume/build">
                  Create Resume <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resumes.map((resume, i) => (
              <motion.div
                key={resume.id}
                custom={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 80,
                    damping: 15,
                  },
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 32px 0 rgba(80, 0, 200, 0.10)",
                  transition: { type: "spring", stiffness: 200, damping: 12 },
                }}
                viewport={{ once: true, amount: 0.2 }}
                className="h-full"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  {/* Resume Preview Card - Smaller */}
                  <div className="relative p-3 bg-gray-50">
                    {/* Mini Resume Preview */}
                    {(() => {
                      const preview = getResumePreview(resume);
                      return (
                        <div className="bg-white rounded shadow-sm border border-gray-200 p-3 min-h-[140px] h-[140px] flex flex-col justify-between text-[9px] leading-relaxed overflow-hidden">
                          {/* Header */}
                          <div className="border-b border-gray-200 pb-1.5 mb-1.5">
                            <h4 className="font-bold text-[11px] text-black truncate">
                              {preview.name}
                            </h4>
                            <div className="text-[8px] text-gray-500 truncate">
                              {preview.email}
                              {preview.email && preview.phone ? " • " : ""}
                              {preview.phone}
                            </div>
                          </div>

                          {/* Summary */}
                          {preview.summary && (
                            <div className="mb-1.5">
                              <div className="font-semibold text-[8px] text-gray-600 uppercase">
                                Summary
                              </div>
                              <p className="text-gray-600 line-clamp-2">
                                {preview.summary}
                              </p>
                            </div>
                          )}

                          {/* Skills */}
                          {preview.skills && (
                            <div className="mb-1.5">
                              <div className="font-semibold text-[8px] text-gray-600 uppercase">
                                Skills
                              </div>
                              <p className="text-gray-600 truncate">
                                {preview.skills}
                              </p>
                            </div>
                          )}

                          {/* Experience */}
                          {preview.experience && (
                            <div className="mb-1">
                              <div className="font-semibold text-[8px] text-gray-600 uppercase">
                                Experience
                              </div>
                              <p className="text-gray-700 truncate">
                                {preview.experience}
                              </p>
                            </div>
                          )}

                          {/* Education */}
                          {preview.education && (
                            <div>
                              <div className="font-semibold text-[8px] text-gray-600 uppercase">
                                Education
                              </div>
                              <p className="text-gray-700 truncate">
                                {preview.education}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Card Footer - Compact */}
                  <div className="p-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-black truncate">
                          {resume.title || "Untitled"}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          Updated {formatDate(resume.updatedAt)}
                        </p>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(resume)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition shrink-0"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action Buttons - Smaller */}
                    <div className="flex gap-1.5 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 px-2"
                        onClick={() => handlePreview(resume)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 px-2"
                      >
                        <Link href={`/resume/build/${resume.id}`}>
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>

                    {/* Download PDF Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      asChild
                    >
                      <Link href={`/resume/build/${resume.id}?download=true`}>
                        <Download className="w-3 h-3 mr-1" />
                        Download PDF
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">
                Delete "{resumeToDelete?.title || "Untitled"}"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                This action cannot be undone. This will permanently delete your
                resume.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 text-black hover:bg-gray-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent
            className="bg-white overflow-hidden flex flex-col p-0 sm:max-w-none"
            style={{
              width: "95vw",
              maxWidth: "1200px",
              height: "90vh",
              maxHeight: "90vh",
            }}
          >
            <DialogHeader className="shrink-0 px-6 py-4 border-b">
              <DialogTitle className="text-black text-xl">
                {previewResume?.title || "Resume Preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
                {previewResume && (
                  <MDEditor.Markdown
                    source={getResumeMarkdown(previewResume)}
                    style={{
                      background: "white",
                      color: "black",
                      fontSize: "16px",
                      lineHeight: "1.8",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="shrink-0 flex gap-3 px-6 py-4 border-t bg-white">
              <Button
                asChild
                className="flex-1 bg-black text-white hover:bg-gray-800 h-10"
              >
                <Link href={`/resume/build/${previewResume?.id}`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Resume
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50 h-10"
              >
                <Link href={`/resume/build/${previewResume?.id}?download=true`}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumeDashboardPage;
