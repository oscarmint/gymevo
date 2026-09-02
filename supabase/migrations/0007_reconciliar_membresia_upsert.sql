-- GymEvo — reconciliar_membresia debe poder CREAR el perfil, no solo
-- actualizarlo. Si el usuario recién confirmó su enlace mágico, `profiles`
-- todavía no tiene fila (se crea client-side en sincronizarPerfilInicial con
-- las respuestas del onboarding) — pero el PLAN hay que fijarlo antes de que
-- proxy.ts decida si lo deja entrar a /app. Sin este ajuste, un usuario que
-- acaba de pagar vería el paywall otra vez en su primer clic.
--
-- Usa variables escalares (no un %rowtype) para el resultado de
-- hotmart_purchases: si no hay compra para ese correo, cada variable queda
-- NULL de forma segura — un record sin fila asignada puede lanzar error al
-- leer sus campos, un escalar nunca.

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
begin
  select email into v_email from auth.users where id = (select auth.uid());
  if v_email is null then
    return;
  end if;

  select status, trial_ends_at, access_until, grace_ends_at
    into v_status, v_trial_ends_at, v_access_until, v_grace_ends_at
  from public.hotmart_purchases
  where email = v_email;

  v_plan := case when v_status in ('trialing', 'active', 'past_due', 'cancelled') then 'pro' else 'free' end;

  insert into public.profiles (id, email, plan, membership_status, trial_ends_at, access_until, grace_ends_at)
  values ((select auth.uid()), v_email, v_plan, v_status, v_trial_ends_at, v_access_until, v_grace_ends_at)
  on conflict (id) do update
    set email = v_email,
        plan = v_plan,
        membership_status = v_status,
        trial_ends_at = coalesce(v_trial_ends_at, public.profiles.trial_ends_at),
        access_until = coalesce(v_access_until, public.profiles.access_until),
        grace_ends_at = coalesce(v_grace_ends_at, public.profiles.grace_ends_at);
end;
$$;
