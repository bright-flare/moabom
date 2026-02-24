export type Source = "saramin" | "jobkorea" | "work24";
export type JobStatus = "normal" | "bookmarked" | "hidden";

export interface JobItem {
  id: string;
  source: Source;
  title: string;
  url: string;
  collectedAt: string;
  status: JobStatus;
  note?: string;
}

export interface JobsResponse {
  jobs: JobItem[];
}
