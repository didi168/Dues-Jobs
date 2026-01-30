-- Create fetch_logs table if not exists
create table if not exists public.fetch_logs (
  id uuid default gen_random_uuid() primary key,
  status text not null,
  jobs_fetched int,
  jobs_inserted int,
  details text,
  completed_at timestamp with time zone default now()
);
