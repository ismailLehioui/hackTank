-- Admin-managed footer contacts, social links and home hero image.

alter table public.settings
  add column if not exists contact_email text not null default 'hello@hacktank.tn',
  add column if not exists contact_phone text not null default '+216 00 000 000',
  add column if not exists linkedin_url text not null default 'https://www.linkedin.com/company/jci-sousse/home/',
  add column if not exists instagram_url text not null default 'https://www.instagram.com/jcisousse/',
  add column if not exists hero_image_url text;

insert into public.settings (event_name, registration_open, max_team_size)
select 'Hack Tank', true, 5
where not exists (select 1 from public.settings);

drop policy if exists "admins manage settings" on public.settings;
create policy "admins manage settings" on public.settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read site assets" on storage.objects;
create policy "public read site assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "admins upload site assets" on storage.objects;
create policy "admins upload site assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins update site assets" on storage.objects;
create policy "admins update site assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins delete site assets" on storage.objects;
create policy "admins delete site assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());