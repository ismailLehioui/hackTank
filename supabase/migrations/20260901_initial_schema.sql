create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'jury', 'participant');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'participant',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  email varchar(255) unique not null,
  phone varchar(30) not null,
  age integer not null check (age between 15 and 99),
  city varchar(120) not null,
  country varchar(120) not null,
  school varchar(255),
  company varchar(255),
  position varchar(255),
  experience_level varchar(80),
  skills text[] not null default '{}',
  has_team boolean not null default false,
  looking_for_teammates boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name varchar(255) not null unique,
  slogan varchar(255),
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  is_leader boolean not null default false,
  primary key (team_id, participant_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  project_name varchar(255) not null,
  category varchar(100),
  description text,
  problem_statement text,
  solution text,
  target_market text,
  business_model text,
  pitch_deck_url text,
  github_url text,
  demo_url text,
  created_at timestamptz not null default now()
);

create table public.jury_members (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(255) not null,
  position varchar(255),
  company varchar(255),
  photo_url text,
  linkedin_url text,
  bio text
);

create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(255) not null,
  specialization varchar(255),
  company varchar(255),
  photo_url text,
  bio text
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  sponsor_type varchar(100),
  logo_url text,
  website text
);

create table public.evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  weight integer not null check (weight between 1 and 100)
);

create table public.project_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  jury_member_id uuid not null references public.jury_members(id) on delete cascade,
  criteria_id uuid not null references public.evaluation_criteria(id) on delete cascade,
  score integer not null check(score between 1 and 10),
  comment text,
  created_at timestamptz not null default now(),
  unique (project_id, jury_member_id, criteria_id)
);

create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  pitch_date timestamptz,
  pitch_order integer,
  status varchar(50) not null default 'scheduled'
);

create table public.winners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  rank_position integer not null unique check (rank_position > 0),
  prize varchar(255)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  email varchar(255) not null,
  subject varchar(255),
  message text not null,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  event_name varchar(255),
  description text,
  event_date date,
  location varchar(255),
  registration_open boolean not null default true,
  max_team_size integer not null default 5 check (max_team_size between 1 and 10),
  logo_url text
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_jury()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'jury'));
$$;

create or replace function public.submit_registration(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_age integer,
  p_city text,
  p_country text,
  p_school text,
  p_company text,
  p_position text,
  p_experience text,
  p_skills text[],
  p_has_team boolean,
  p_team_name text,
  p_track text,
  p_idea text,
  p_problem text,
  p_looking_for_teammates boolean
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  participant_uuid uuid;
  team_uuid uuid;
  project_uuid uuid;
begin
  if not exists (select 1 from public.settings where registration_open = true) then
    raise exception 'Registration is currently closed';
  end if;

  insert into public.participants (
    first_name, last_name, email, phone, age, city, country, school, company,
    position, experience_level, skills, has_team, looking_for_teammates
  ) values (
    trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone), p_age,
    trim(p_city), trim(p_country), nullif(trim(p_school), ''), nullif(trim(p_company), ''),
    nullif(trim(p_position), ''), nullif(trim(p_experience), ''), p_skills,
    p_has_team, p_looking_for_teammates
  ) returning id into participant_uuid;

  if nullif(trim(p_team_name), '') is not null then
    insert into public.teams (team_name) values (trim(p_team_name)) returning id into team_uuid;
    insert into public.team_members (team_id, participant_id, is_leader)
    values (team_uuid, participant_uuid, true);
  end if;

  insert into public.projects (team_id, project_name, category, description, problem_statement)
  values (
    team_uuid,
    coalesce(nullif(trim(p_team_name), ''), trim(p_idea)),
    nullif(trim(p_track), ''),
    trim(p_idea),
    trim(p_problem)
  ) returning id into project_uuid;

  return project_uuid;
end;
$$;

revoke all on function public.submit_registration from public;
grant execute on function public.submit_registration to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.jury_members enable row level security;
alter table public.mentors enable row level security;
alter table public.sponsors enable row level security;
alter table public.evaluation_criteria enable row level security;
alter table public.project_scores enable row level security;
alter table public.pitches enable row level security;
alter table public.winners enable row level security;
alter table public.contacts enable row level security;
alter table public.settings enable row level security;

create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage participants" on public.participants for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage teams" on public.teams for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage team members" on public.team_members for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage jury" on public.jury_members for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage mentors" on public.mentors for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage sponsors" on public.sponsors for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage criteria" on public.evaluation_criteria for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage scores" on public.project_scores for all using (public.is_admin()) with check (public.is_admin());
create policy "jury read projects" on public.projects for select using (public.is_jury());
create policy "jury read criteria" on public.evaluation_criteria for select using (public.is_jury());
create policy "jury score projects" on public.project_scores for insert with check (public.is_jury());
create policy "jury update scores" on public.project_scores for update using (public.is_jury()) with check (public.is_jury());
create policy "public read jury" on public.jury_members for select using (true);
create policy "public read mentors" on public.mentors for select using (true);
create policy "public read sponsors" on public.sponsors for select using (true);
create policy "public read settings" on public.settings for select using (true);
create policy "public read winners" on public.winners for select using (true);

insert into public.settings (event_name, registration_open, max_team_size)
values ('Hack Tank', true, 5);

-- After creating the organizer user in Supabase Authentication, run:
-- update public.profiles set role = 'admin' where id = '<organizer-user-uuid>';
