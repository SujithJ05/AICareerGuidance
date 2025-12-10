"use client";
import { Button } from "@/components/ui/button";
import { Download, Save, Loader2, ArrowLeft, FileCheck } from "lucide-react";
import { toast } from "sonner";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useFetch from "@/hooks/use-fetch";
import { saveResume } from "@/actions/resume";

import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/app/lib/schema";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntryForm } from "../_components/entry-form.jsx";

import { entriesToMarkdown } from "@/app/lib/helper";
import { useUser } from "@clerk/nextjs";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link as PdfLink,
} from "@react-pdf/renderer";

const ResumeBuilderPage = ({ initialContent }) => {
  const [previewContent, setPreviewContent] = useState(initialContent);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingForAts, setIsSavingForAts] = useState(false);
  const [emptyResumeDialogOpen, setEmptyResumeDialogOpen] = useState(false);
  const [emptyResumeMessage, setEmptyResumeMessage] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        name: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });
  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    const newContent = getCombinedContent();
    setPreviewContent(newContent ? newContent : initialContent);
  }, [formValues]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);

    return parts.length > 0
      ? `## <div align="center">${contactInfo.name}</div>
        

<div align="center">

${parts.join(" | ")}

</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  // Check which required fields are missing
  const getMissingFields = () => {
    const { contactInfo, summary, skills } = formValues;
    const missing = [];

    // Check Personal Information
    if (!contactInfo?.name?.trim()) {
      missing.push("Name");
    }
    if (!contactInfo?.email?.trim()) {
      missing.push("Email");
    }

    // Check Professional Summary
    if (!summary?.trim()) {
      missing.push("Professional Summary");
    }

    // Check Skills
    if (!skills?.trim()) {
      missing.push("Skills");
    }

    return missing;
  };

  // Check if resume has required fields filled
  const hasRequiredFields = () => {
    const missing = getMissingFields();
    return missing.length === 0;
  };

  // Show dialog with missing fields
  const showMissingFieldsDialog = (action) => {
    const missing = getMissingFields();
    const missingList = missing.join(", ");

    let actionText = "";
    if (action === "save") {
      actionText = "saving";
    } else if (action === "download") {
      actionText = "downloading";
    } else if (action === "ats") {
      actionText = "checking ATS score";
    }

    setEmptyResumeMessage(
      `Please fill in the following required fields before ${actionText}: ${missingList}.`
    );
    setEmptyResumeDialogOpen(true);
  };

  const handleSave = async () => {
    if (!hasRequiredFields()) {
      showMissingFieldsDialog("save");
      return;
    }
    try {
      const data = formValues;
      const resumeContent = JSON.stringify(data);
      await saveResumeFn({
        title: data.contactInfo?.name || "Untitled",
        content: resumeContent,
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const onSubmit = async (data) => {
    if (!hasRequiredFields()) {
      showMissingFieldsDialog("save");
      return;
    }
    try {
      const resumeContent = JSON.stringify(data);
      await saveResumeFn({
        title: data.contactInfo.name || "Untitled",
        content: resumeContent,
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // register font once at top

  // Save resume and navigate to ATS checker
  const handleCheckAtsScore = async () => {
    if (!hasRequiredFields()) {
      showMissingFieldsDialog("ats");
      return;
    }
    setIsSavingForAts(true);
    try {
      const data = formValues;
      const resumeContent = JSON.stringify(data);
      const result = await saveResume({
        title: data.contactInfo?.name || "Untitled",
        content: resumeContent,
      });

      if (result?.id) {
        toast.success("Resume saved! Redirecting to ATS Checker...");
        router.push(`/resume/ats?resumeId=${result.id}`);
      } else {
        toast.error("Failed to save resume");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save resume");
    } finally {
      setIsSavingForAts(false);
    }
  };

  const generatePDF = async () => {
    if (!hasRequiredFields()) {
      showMissingFieldsDialog("download");
      return;
    }
    setIsGenerating(true);
    try {
      // First save the resume
      const data = formValues;
      const resumeContent = JSON.stringify(data);
      await saveResume({
        title: data.contactInfo?.name || "Untitled",
        content: resumeContent,
      });
      toast.success("Resume saved!");

      const styles = StyleSheet.create({
        page: {
          padding: 30,
          fontSize: 11,
          lineHeight: 1.5,
          fontFamily: "Helvetica",
        },
        header: { textAlign: "center", marginBottom: 15 },
        name: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
        contact: { fontSize: 10, color: "#444" },
        section: { marginTop: 12 },
        sectionTitle: {
          fontSize: 13,
          fontWeight: "bold",
          marginBottom: 6,
          borderBottom: "1pt solid #aaa",
          paddingBottom: 2,
        },
        itemTitle: { fontSize: 11, fontWeight: "bold" },
        itemDate: { fontSize: 9, color: "gray", marginBottom: 2 },
        itemDesc: { fontSize: 10 },
      });

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.name}>{data.contactInfo?.name}</Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {data.contactInfo?.email && (
                  <Text>{data.contactInfo.email}</Text>
                )}
                {data.contactInfo?.mobile && (
                  <Text> | {data.contactInfo.mobile}</Text>
                )}
                {data.contactInfo?.linkedin && (
                  <Text>
                    {" "}
                    |{" "}
                    <PdfLink src={data.contactInfo.linkedin}>LinkedIn</PdfLink>
                  </Text>
                )}
                {data.contactInfo?.github && (
                  <Text>
                    {" "}
                    | <PdfLink src={data.contactInfo.github}>GitHub</PdfLink>
                  </Text>
                )}
              </View>
            </View>

            {/* Summary */}
            {data.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text>{data.summary}</Text>
              </View>
            )}

            {/* Skills */}
            {data.skills && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <Text>{data.skills}</Text>
              </View>
            )}

            {/* Work Experience */}
            {data.experience?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={styles.itemTitle}>
                      {exp.title} @ {exp.company}
                    </Text>
                    <Text style={styles.itemDate}>
                      {exp.startDate} – {exp.endDate || "Present"}
                    </Text>
                    <Text style={styles.itemDesc}>{exp.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {data.education.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>
                      {edu.institution} | {edu.startDate} – {edu.endDate}
                    </Text>
                    <Text style={styles.itemDesc}>{edu.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {data.projects?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Projects</Text>
                {data.projects.map((proj, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    <Text style={styles.itemDate}>{proj.technologies}</Text>
                    <Text style={styles.itemDesc}>{proj.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </Page>
        </Document>
      );

      // download
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Back Button */}
      <Link
        href="/resume"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resume Studio</span>
      </Link>
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="text-6xl font-bold gradient-title">Resume Builder</h1>

        <div className="space-x-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleCheckAtsScore}
            disabled={isSavingForAts}
          >
            {isSavingForAts ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Check ATS Score
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-8">
        {/* Form Section */}
        <div className="col-span-3 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    {...register("contactInfo.name")}
                    placeholder="Your Name"
                    error={errors.contactInfo?.name}
                  />
                  {errors.contactInfo?.name && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="Example@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile no:</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+XX XXXXXXXXXX"
                    error={errors.contactInfo?.mobile}
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Linkedin:</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    error={errors.contactInfo?.linkedin}
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub:</label>
                  <Input
                    {...register("contactInfo.github")}
                    type="url"
                    placeholder="https://github.com/username"
                    error={errors.contactInfo?.github}
                  />
                  {errors.contactInfo?.github && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.github.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* --------------------------------------------------------------------------------------------------------------------------------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                control={control}
                name="summary"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32 "
                    placeholder="Write a brief summary about your professional background and career objectives"
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.summary.message}
                </p>
              )}
            </div>
            {/* -------------------------------------------------------------------------------------------------------------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                control={control}
                name="skills"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-16 "
                    placeholder="List your skills"
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* -------------------------------------------------------------------------------------------------------------------*/}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </div>
        {/* Preview Section */}
        <div className="col-span-7 space-y-4">
          <h3 className="text-lg font-medium">Live Preview</h3>
          <div className="border rounded-lg h-full p-4 overflow-auto">
            <MDEditor.Markdown
              source={previewContent}
              style={{
                background: "white",
                color: "black",
                minHeight: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Empty Resume Dialog */}
      <AlertDialog
        open={emptyResumeDialogOpen}
        onOpenChange={setEmptyResumeDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">
              Resume is Empty
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              {emptyResumeMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-black text-white hover:bg-gray-800">
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResumeBuilderPage;
