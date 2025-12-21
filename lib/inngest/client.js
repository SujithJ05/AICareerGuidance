import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-career-coach", // Restore the required id field
  name: "AI Career Coach",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
