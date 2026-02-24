import { JobItem, Source } from "./types";

const sources: Source[] = ["saramin", "jobkorea", "work24"];

function make(i: number): JobItem {
  const source = sources[i % sources.length];
  const dayOffset = i % 3;
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  date.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);

  const idNum = 53000000 + i;
  const urlBySource = {
    saramin: `https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=${idNum}`,
    jobkorea: `https://www.jobkorea.co.kr/Recruit/GI_Read/${idNum}`,
    work24: `https://www.work24.go.kr/wk/a/b/1500/empDetailAuthView.do?wantedAuthNo=${idNum}`,
  };

  return {
    id: `job-${i + 1}`,
    source,
    title: `생산직 채용 공고 샘플 ${i + 1} (${source})`,
    url: urlBySource[source],
    collectedAt: date.toISOString(),
    status: i % 8 === 0 ? "bookmarked" : "normal",
    note: i % 10 === 0 ? "검토 필요" : "",
  };
}

export const sampleJobs: JobItem[] = Array.from({ length: 30 }, (_, i) => make(i));
