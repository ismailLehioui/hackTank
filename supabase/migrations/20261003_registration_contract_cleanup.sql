-- Evolution migration for an already-created database.
-- This is intentionally separate from the original schema creation migration.

alter table public.participants
  drop column if exists city;

alter table public.participants
  drop column if exists country;

alter table public.participants
  drop column if exists experience_level;

-- Remove older registration overloads that still expect removed parameters.
drop function if exists public.submit_registration(
  text, text, text, text, integer, text, text, text, text, text,
  text, text[], boolean, text, text, text, text, boolean
);

drop function if exists public.submit_registration(
  text, text, text, text, integer, text, text, text, text, text,
  text, text[], boolean, text, text, text, text, boolean, text, text, boolean
);

drop function if exists public.submit_registration(
  text, text, text, text, integer, text, text, text, text, text[],
  boolean, text, text, text, text, boolean, text, text, boolean
);

create or replace function public.submit_registration(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_age integer,
  p_school text,
  p_company text,
  p_position text,
  p_skills text[],
  p_has_team boolean,
  p_team_name text,
  p_track text,
  p_idea text,
  p_problem text,
  p_looking_for_teammates boolean,
  p_payment_method text,
  p_payment_reference text,
  p_payment_commitment boolean,
  p_team_members jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_uuid uuid;
  team_uuid uuid;
  project_uuid uuid;
  team_member jsonb;
  member_first_name text;
  member_last_name text;
  member_email text;
  member_phone text;
  member_age integer;
begin
  if not exists (select 1 from public.settings where registration_open = true) then
    raise exception 'Registration is currently closed';
  end if;

  if not p_has_team or nullif(trim(p_team_name), '') is null then
    raise exception 'A team name is required';
  end if;

  if nullif(trim(p_payment_method), '') is null or nullif(trim(p_payment_reference), '') is null or not p_payment_commitment then
    raise exception 'Payment method, reference and commitment are required';
  end if;

  insert into public.participants (
    first_name, last_name, email, phone, age, school, company, position,
    skills, has_team, looking_for_teammates,
    payment_status, payment_method, payment_reference, payment_commitment
  ) values (
    trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone), p_age,
    nullif(trim(p_school), ''), nullif(trim(p_company), ''), nullif(trim(p_position), ''),
    coalesce(p_skills, '{}'), true, false, 'pending', trim(p_payment_method),
    nullif(trim(p_payment_reference), ''), true
  ) returning id into participant_uuid;

  insert into public.teams (team_name)
  values (trim(p_team_name))
  returning id into team_uuid;

  insert into public.team_members (team_id, participant_id, is_leader)
  values (team_uuid, participant_uuid, true);

  if jsonb_typeof(coalesce(p_team_members, '[]'::jsonb)) = 'array' then
    for team_member in select jsonb_array_elements(p_team_members)
    loop
      member_first_name := nullif(trim(team_member->>'first_name'), '');
      member_last_name := nullif(trim(team_member->>'last_name'), '');
      member_email := lower(nullif(trim(team_member->>'email'), ''));
      member_phone := nullif(trim(team_member->>'phone'), '');
      member_age := nullif(team_member->>'age', '')::integer;

      if member_first_name is null or member_last_name is null or member_email is null or member_phone is null or member_age is null then
        raise exception 'Each team member must include first name, last name, email, phone and age';
      end if;

      insert into public.participants (
        first_name, last_name, email, phone, age, school, company, position,
        skills, has_team, looking_for_teammates,
        payment_status, payment_method, payment_reference, payment_commitment
      ) values (
        member_first_name, member_last_name, member_email, member_phone, member_age,
        null, null, null, '{}', true, false, 'pending', trim(p_payment_method),
        nullif(trim(p_payment_reference), ''), true
      ) returning id into participant_uuid;

      insert into public.team_members (team_id, participant_id, is_leader)
      values (team_uuid, participant_uuid, false);
    end loop;
  end if;

  insert into public.projects (team_id, owner_participant_id, project_name, category, description, problem_statement)
  values (
    team_uuid, participant_uuid, trim(p_team_name), nullif(trim(p_track), ''),
    nullif(trim(p_idea), ''), nullif(trim(p_problem), '')
  ) returning id into project_uuid;

  return project_uuid;
end;
$$;

revoke all on function public.submit_registration(
  text, text, text, text, integer, text, text, text, text[],
  boolean, text, text, text, text, boolean, text, text, boolean
) from public;

grant execute on function public.submit_registration(
  text, text, text, text, integer, text, text, text, text[],
  boolean, text, text, text, text, boolean, text, text, boolean, jsonb
) to anon, authenticated;
