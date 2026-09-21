-- GymEvo — prueba gratis SIN tarjeta, manejada por la app (21/09/2026).
-- Quien crea su cuenta y no ha pagado recibe 7 días de acceso completo; al
-- terminar, proxy.ts lo manda al paywall (pantalla "tu prueba terminó").
-- No depende de Hotmart: no hay tarjeta ni suscripción de por medio.
--
-- La fecha se fija UNA sola vez por cuenta (coalesce con lo que ya tenga):
-- volver a iniciar sesión no la reinicia. Quien ya tiene una compra en
-- hotmart_purchases (aunque esté reembolsada) no recibe prueba nueva.
--
-- APLICAR en Supabase junto con 0018, antes de publicar.

create or replace function public.reconciliar_membresia()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
  v_status text;
  v_trial_ends_at timestamptz;
  v_access_until timestamptz;
  v_grace_ends_at timestamptz;
  v_plan text;
  v_prueba timestamptz;
begin
  select email into v_email from auth.users where id = (select auth.uid());
  if v_email is null then
    return;
  end if;

  select status, trial_ends_at, access_until, grace_ends_at
    into v_status, v_trial_ends_at, v_access_until, v_grace_ends_at
  from public.hotmart_purchases
  where email = v_email;

  v_plan := public.plan_segun_estado(v_status, v_access_until);

  -- Sin ninguna compra: abrir la prueba gratis de 7 días.
  v_prueba := case when v_status is null then now() + interval '7 days' else null end;

  insert into public.profiles (id, email, plan, membership_status, trial_ends_at, access_until, grace_ends_at)
  values ((select auth.uid()), v_email, v_plan, v_status, coalesce(v_trial_ends_at, v_prueba), v_access_until, v_grace_ends_at)
  on conflict (id) do update
    set email = v_email,
        plan = v_plan,
        membership_status = v_status,
        trial_ends_at = coalesce(v_trial_ends_at, public.profiles.trial_ends_at, v_prueba),
        access_until = coalesce(v_access_until, public.profiles.access_until),
        grace_ends_at = coalesce(v_grace_ends_at, public.profiles.grace_ends_at);
end;
$$;
