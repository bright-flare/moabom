create table if not exists public.jobs (
  id text primary key,
  source text not null check (source in ('saramin','jobkorea','work24')),
  title text not null,
  url text not null,
  collected_at timestamptz not null,
  status text not null default 'normal' check (status in ('normal','bookmarked','hidden')),
  note text default ''
);

create index if not exists idx_jobs_collected_at on public.jobs (collected_at desc);
create index if not exists idx_jobs_source on public.jobs (source);

alter table public.jobs enable row level security;

-- For private dashboard with service-role backend calls, you can keep strict policies.
-- Allow anon read only if you later move to browser-side querying.
drop policy if exists "allow read via anon" on public.jobs;
create policy "allow read via anon"
on public.jobs
for select
to anon
using (true);
