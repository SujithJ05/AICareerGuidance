"use client";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the dashboard for client-side rendering only
const AiVoiceInterviewDashboard = dynamic(
  () => import("../aivoiceinterview/page.jsx"),
  { ssr: false }
);

export default function VoiceInterviewToolPage() {
  return <AiVoiceInterviewDashboard />;
}
