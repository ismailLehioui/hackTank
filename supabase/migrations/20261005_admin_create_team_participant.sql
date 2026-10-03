-- Create a new participant and attach them to an existing team atomically.

create or replace function public.admin_create_team_participant(
  p_team_id uuid,
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
  participant_uuid uuid;
  maximum_size integer;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create participants for a team';
  end if;

  if nullif(trim(p_first_name), '') is null
     or nullif(trim(p_last_name), '') is null
     or nullif(trim(p_email), '') is null
     or nullif(trim(p_phone), '') is null
     or p_age is null or p_age < 15 or p_age > 99
     or nullif(trim(p_position), '') is null
     or (nullif(trim(p_school), '') is null and nullif(trim(p_company), '') is null)
     or nullif(trim(p_payment_method), '') is null
    or nullif(trim(p_payment_reference), '') is null
    or not coalesce(p_payment_commitment, false) then
    raise exception 'Complete all required participant and payment fields';
  end if;

  if not exists (select 1 from public.teams where id = p_team_id) then
    raise exception 'Team not found';
  end if;

  select max_team_size into maximum_size from public.settings limit 1;
  if (select count(*) from public.team_members where team_id = p_team_id) >= coalesce(maximum_size, 5) then
    raise exception 'This team has reached its maximum size';
  end if;

  insert into public.participants (
    first_name, last_name, email, phone, age, school, company, position,
    skills, has_team, looking_for_teammates, payment_status, payment_method,
    payment_reference, payment_commitment
  ) values (
    trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone), p_age,
    nullif(trim(p_school), ''), nullif(trim(p_company), ''), nullif(trim(p_position), ''),
    '{}', true, false, 'pending', trim(p_payment_method), trim(p_payment_reference), p_payment_commitment
  ) returning id into participant_uuid;

  insert into public.team_members (team_id, participant_id, is_leader)
  values (p_team_id, participant_uuid, false);

  return participant_uuid;
end;
$$;

revoke all on function public.admin_create_team_participant(
  uuid, text, text, text, text, integer, text, text, text, text, text, boolean
) from public;

grant execute on function public.admin_create_team_participant(
  uuid, text, text, text, text, integer, text, text, text, text, text, boolean
) to authenticated;