alter table public.participants add column user_id uuid unique references auth.users(id) on delete set null;
alter table public.jury_members add column user_id uuid unique references auth.users(id) on delete set null;
alter table public.projects add column owner_participant_id uuid references public.participants(id) on delete set null;

create or replace function public.claim_my_participant()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  participant_uuid uuid;
begin
  update public.participants
  set user_id = auth.uid()
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and (user_id is null or user_id = auth.uid())
  returning id into participant_uuid;

  if participant_uuid is null then
    raise exception 'No registration found for this account email';
  end if;
  return participant_uuid;
end;
$$;

grant execute on function public.claim_my_participant to authenticated;

create or replace function public.is_project_owner(target_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects project
    join public.participants participant on participant.id = project.owner_participant_id
    where project.id = target_project_id and participant.user_id = auth.uid()
  );
$$;

create or replace function public.is_current_jury_member(target_jury_member_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jury_members where id = target_jury_member_id and user_id = auth.uid()
  );
$$;

create or replace function public.add_team_member(p_project_id uuid, p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  project_team_id uuid;
  member_id uuid;
  maximum_size integer;
begin
  if not public.is_project_owner(p_project_id) then
    raise exception 'Only the project owner can add team members';
  end if;
  select team_id into project_team_id from public.projects where id = p_project_id;
  if project_team_id is null then
    raise exception 'Create a team before adding members';
  end if;
  select id into member_id from public.participants where lower(email) = lower(trim(p_email));
  if member_id is null then
    raise exception 'No registered participant has this email';
  end if;
  select max_team_size into maximum_size from public.settings limit 1;
  if (select count(*) from public.team_members where team_id = project_team_id) >= coalesce(maximum_size, 5) then
    raise exception 'This team has reached its maximum size';
  end if;
  insert into public.team_members (team_id, participant_id) values (project_team_id, member_id)
  on conflict do nothing;
end;
$$;

grant execute on function public.add_team_member to authenticated;

create or replace function public.get_jury_ranking()
returns table (
  project_id uuid,
  project_name text,
  category text,
  average_score numeric,
  total_scores bigint
) language sql stable security definer set search_path = public as $$
  select project.id, project.project_name::text, project.category::text,
    round(avg(score.score)::numeric, 2), count(score.id)
  from public.projects project
  left join public.project_scores score on score.project_id = project.id
  group by project.id, project.project_name, project.category
  order by avg(score.score) desc nulls last, count(score.id) desc;
$$;

grant execute on function public.get_jury_ranking to authenticated;

create or replace function public.submit_registration(
  p_first_name text, p_last_name text, p_email text, p_phone text, p_age integer,
  p_city text, p_country text, p_school text, p_company text, p_position text,
  p_experience text, p_skills text[], p_has_team boolean, p_team_name text,
  p_track text, p_idea text, p_problem text, p_looking_for_teammates boolean
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

  insert into public.projects (team_id, owner_participant_id, project_name, category, description, problem_statement)
  values (
    team_uuid, participant_uuid, coalesce(nullif(trim(p_team_name), ''), trim(p_idea)),
    nullif(trim(p_track), ''), trim(p_idea), trim(p_problem)
  ) returning id into project_uuid;

  return project_uuid;
end;
$$;

drop policy if exists "jury read projects" on public.projects;
create policy "team read own project" on public.projects for select using (public.is_project_owner(id));
create policy "team update own project" on public.projects for update using (public.is_project_owner(id)) with check (public.is_project_owner(id));

create policy "team read own participant" on public.participants for select using (user_id = auth.uid());
create policy "team read own memberships" on public.team_members for select using (
  exists (select 1 from public.participants where participants.id = team_members.participant_id and participants.user_id = auth.uid())
);
create policy "team read own teams" on public.teams for select using (
  exists (
    select 1 from public.team_members join public.participants on participants.id = team_members.participant_id
    where team_members.team_id = teams.id and participants.user_id = auth.uid()
  )
);

create policy "jury read projects" on public.projects for select using (public.is_jury());
create policy "jury read own profile" on public.jury_members for select using (user_id = auth.uid());

drop policy if exists "jury score projects" on public.project_scores;
drop policy if exists "jury update scores" on public.project_scores;
create policy "jury score own record" on public.project_scores for insert with check (
  public.is_jury() and public.is_current_jury_member(jury_member_id)
);
create policy "jury read own scores" on public.project_scores for select using (
  public.is_current_jury_member(jury_member_id)
);
create policy "jury update own scores" on public.project_scores for update using (
  public.is_current_jury_member(jury_member_id)
) with check (public.is_current_jury_member(jury_member_id));

insert into storage.buckets (id, name, public) values ('pitch-decks', 'pitch-decks', false)
on conflict (id) do nothing;

create policy "project owners upload pitch decks" on storage.objects for insert to authenticated with check (
  bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "project owners read pitch decks" on storage.objects for select to authenticated using (
  bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "project owners replace pitch decks" on storage.objects for update to authenticated using (
  bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text
);

-- For a jury user, first create the account in Authentication, then run:
-- update public.profiles set role = 'jury' where id = '<jury-auth-user-uuid>';
-- update public.jury_members set user_id = '<jury-auth-user-uuid>' where id = '<jury-member-uuid>';
