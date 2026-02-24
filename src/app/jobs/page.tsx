import { getJobs } from "@/lib/jobs-repo";
import DashboardClient from "@/app/ui/dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JobsPage() {
  const initialJobs = await getJobs();
  return <DashboardClient initialJobs={initialJobs} />;
}
