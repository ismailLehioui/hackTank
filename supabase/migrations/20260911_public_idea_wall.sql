-- Allow the public Idea Wall to read only the display fields it needs.
alter table public.projects enable row level security;
alter table public.teams enable row level security;

drop policy if exists "public read idea wall projects" on public.projects;
create policy "public read idea wall projects"
on public.projects for select
using (true);

drop policy if exists "public read idea wall teams" on public.teams;
create policy "public read idea wall teams"
on public.teams for select
using (true);