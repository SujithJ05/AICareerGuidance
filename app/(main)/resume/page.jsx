"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Eye, Pencil, Trash, Download } from "lucide-react";
import { getResumes, deleteResume } from "@/actions/resume";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ResumeDashboardPage = () => {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const fetchResumes = async () => {
      const fetchedResumes = await getResumes();
      setResumes(fetchedResumes);
    };
    fetchResumes();
  }, []);

  const handleDelete = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      setResumes(resumes.filter((resume) => resume.id !== resumeId));
      toast.success("Resume deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete resume.");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-6xl font-bold gradient-title">Resume Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>ATS Checker & Resume Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload your resume and a job description to get an ATS score and
              feedback on how to improve your resume for a specific job.
            </p>
            <Button asChild className="mt-4">
              <Link href="/resume/ats">
                Go to ATS Checker <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create a New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Build a professional resume from scratch with our easy-to-use
              resume builder.
            </p>
            <Button asChild className="mt-4">
              <Link href="/resume/build">
                Create Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Saved Resumes</h2>
        {resumes.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No resumes created yet. Create your first resume to see it here!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((resume) => (
              <Card key={resume.id}>
                <CardHeader>
                  <CardTitle>{resume.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" disabled>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/resume/build/${resume.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resume.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDashboardPage;