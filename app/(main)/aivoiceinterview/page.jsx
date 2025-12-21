import { Suspense } from "react";
import { getUserVoiceInterviews } from "@/actions/aiinterview";
import AiVoiceInterviewDashboardClient from "./ai-voice-interview-dashboard-client";

export default async function AiVoiceInterviewPage() {
  const interviews = await getUserVoiceInterviews();

  return (
    <Suspense fallback={<div>Loading interviews...</div>}>
      <AiVoiceInterviewDashboardClient initialInterviews={interviews} />
    </Suspense>
  );
}
