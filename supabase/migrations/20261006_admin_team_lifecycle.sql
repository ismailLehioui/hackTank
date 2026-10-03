-- Admin-only team creation and permanent deletion with all related records.

create or replace function public.admin_create_team_with_leader(
  p_team_name text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_age integer,
  p_school text,
  p_company text,
  p_position text,
  p_payment_method text,
  p_payment_reference text,
  p_payment_commitment boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_team_id uuid;
  leader_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create teams';
  end if;

  if nullif(trim(p_team_name), '') is null
     or nullif(trim(p_first_name), '') is null
     or nullif(trim(p_last_name), '') is null
     or nullif(trim(p_email), '') is null
     or nullif(trim(p_phone), '') is null
     or p_age is null or p_age < 15 or p_age > 99
     or nullif(trim(p_position), '') is null
     or (nullif(trim(p_school), '') is null and nullif(trim(p_company), '') is null)
     or nullif(trim(p_payment_method), '') is null
     or nullif(trim(p_payment_reference), '') is null
     or not coalesce(p_payment_commitment, false) then
    raise exception 'Complete all required team and leader fields';
  end if;

  insert into public.teams (team_name)
  values (trim(p_team_name))
  returning id into new_team_id;

  insert into public.participants (
    first_name, last_name, email, phone, age, school, company, position,
    skills, has_team, looking_for_teammates, payment_status, payment_method,
    payment_reference, payment_commitment
  ) values (
    trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone), p_age,
    nullif(trim(p_school), ''), nullif(trim(p_company), ''), nullif(trim(p_position), ''),
    '{}', true, false, 'pending', trim(p_payment_method), trim(p_payment_reference), p_payment_commitment
  ) returning id into leader_id;

  insert into public.team_members (team_id, participant_id, is_leader)
  values (new_team_id, leader_id, true);

  return new_team_id;
end;
$$;

revoke all on function public.admin_create_team_with_leader(
  text, text, text, text, text, integer, text, text, text, text, text, boolean
) from public;
grant execute on function public.admin_create_team_with_leader(
  text, text, text, text, text, integer, text, text, text, text, text, boolean
) to authenticated;

create or replace function public.admin_delete_team_with_participants(
  p_team_id uuid,
  p_confirmation_name text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_team_name text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete teams';
  end if;

  select team_name into existing_team_name
  from public.teams
  where id = p_team_id
  for update;

  if existing_team_name is null then
    raise exception 'Team not found';
  end if;

  if p_confirmation_name is distinct from existing_team_name then
    raise exception 'Team name confirmation does not match';
  end if;

  delete from public.projects where team_id = p_team_id;
  delete from public.participants participant
  where exists (
    select 1 from public.team_members membership
    where membership.team_id = p_team_id
      and membership.participant_id = participant.id
  );
  delete from public.teams where id = p_team_id;
end;
$$;

revoke all on function public.admin_delete_team_with_participants(uuid, text) from public;
grant execute on function public.admin_delete_team_with_participants(uuid, text) to authenticated;