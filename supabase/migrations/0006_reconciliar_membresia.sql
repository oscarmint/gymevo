-- GymEvo — reconciliación de membresía en el primer login (Sesión 7, auditoría).
-- `hotmart_purchases` no tiene políticas para anon/authenticated (a propósito:
-- es data de pagos, solo el webhook con service_role la toca). Esta función
-- SECURITY DEFINER es la única puerta que un usuario normal tiene para "subir"
-- su propio perfil a pro si ya pagó — usa auth.uid()/su propio email de
-- auth.users, nunca un email que el cliente pueda inventar (sin IDOR).

create or replace function public.reconciliar_membresia()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
  v_compra record;
begin
  select email into v_email from auth.users where id = (select auth.uid());
  if v_email is null then
    return;
  end if;

  select * into v_compra from public.hotmart_purchases where email = v_email;
  if v_compra is null then
    -- Nunca pagó (o pagó con otro correo) — deja el perfil como está (free).
    update public.profiles set email = v_email where id = (select auth.uid()) and email is null;
    return;
  end if;

  update public.profiles
  set email = v_email,
      plan = case when v_compra.status in ('trialing', 'active', 'past_due', 'cancelled') then 'pro' else 'free' end,
      membership_status = v_compra.status,
      trial_ends_at = v_compra.trial_ends_at,
      access_until = v_compra.access_until,
      grace_ends_at = v_compra.grace_ends_at
  where id = (select auth.uid());
end;
$$;

grant execute on function public.reconciliar_membresia to authenticated;
