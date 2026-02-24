import { getJobs } from "@/lib/jobs-repo";
import DashboardClient from "./ui/dashboard-client";

export default async function Home() {
  const initialJobs = await getJobs();
  return <DashboardClient initialJobs={initialJobs} />;
}
