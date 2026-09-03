-- BUG REAL: las políticas admin_reads_all_profiles / admin_updates_all_profiles
-- de la migración 0011 consultan `profiles` DENTRO de una política de `profiles`
-- — Postgres detecta esto como recursión infinita al evaluarla (42P17), y la
-- consulta de perfil del usuario falla en silencio, tumbando el chequeo de
-- plan='pro' en proxy.ts (un usuario pro real terminaba viendo el paywall).
-- Fix: función SECURITY DEFINER que consulta profiles SIN pasar por RLS
-- (mismo patrón que reconciliar_membresia), usada en vez del EXISTS directo.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin_reads_all_profiles" on profiles;
drop policy if exists "admin_updates_all_profiles" on profiles;

create policy "admin_reads_all_profiles" on profiles for select to authenticated
  using (public.is_admin());
create policy "admin_updates_all_profiles" on profiles for update to authenticated
  using (public.is_admin());
