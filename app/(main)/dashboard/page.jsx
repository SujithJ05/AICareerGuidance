import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";
import CourseDashboard from "./_components/course-dashboard";

const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();
  const insights = await getIndustryInsights();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardView insights={insights} />
    </div>
  );
};

export default IndustryInsightsPage;
