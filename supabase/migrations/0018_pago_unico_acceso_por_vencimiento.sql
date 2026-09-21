-- GymEvo — pago único (21/09/2026): el plan 'pro' ya no depende solo del
-- estado de Hotmart, también del vencimiento del acceso (access_until, que el
-- webhook fija según la oferta comprada). Sin esto, una compra dejaría el plan
-- en 'pro' para siempre, y un pago PENDIENTE (Efecty/PSE, evento
-- PURCHASE_DELAYED → 'past_due') daría acceso antes de recibir el dinero.
--
-- Reglas:
--   active / trialing        → pro si no hay vencimiento (cuentas antiguas de
--                              suscripción) o si el vencimiento + 3 días de
--                              gracia aún no pasó.
--   past_due / cancelled     → pro SOLO si ya hay un vencimiento vigente
--                              (pago anterior todavía cubre), nunca por sí solo.
--   cualquier otro           → free.
--
-- APLICAR en Supabase antes de publicar el código de pago único.

create or replace function public.plan_segun_estado(p_status text, p_access_until timestamptz)
returns text
language sql stable set search_path = ''
as $$
  select case
    when p_status in ('active', 'trialing')
      then case when p_access_until is null or p_access_until + interval '3 days' > now() then 'pro' else 'free' end
    when p_status in ('past_due', 'cancelled')
      then case when p_access_until is not null and p_access_until + interval '3 days' > now() then 'pro' else 'free' end
    else 'free'
  end
$$;

create or replace function public.apply_hotmart_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_email text,
  p_subscriber_code text,
  p_new_status text,
  p_trial_ends_at timestamptz default null,
  p_access_until timestamptz default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_current text;
  v_access_until timestamptz;
begin
  begin
    insert into public.processed_events (event_id, event_type, payload_hash)
    values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;

  select status into v_current from public.hotmart_purchases where email = p_email;

  if v_current in ('refunded', 'chargeback') and p_new_status in ('active', 'trialing') then
    return jsonb_build_object('status', 'illegal_transition', 'from', v_current);
  end if;

  insert into public.hotmart_purchases (email, status, hotmart_subscriber_code, trial_ends_at, access_until, first_paid_at)
  values (
    p_email, p_new_status, p_subscriber_code, p_trial_ends_at, p_access_until,
    case when p_new_status = 'active' then now() else null end
  )
  on conflict (email) do update
    set status = excluded.status,
        hotmart_subscriber_code = coalesce(excluded.hotmart_subscriber_code, public.hotmart_purchases.hotmart_subscriber_code),
        trial_ends_at = coalesce(excluded.trial_ends_at, public.hotmart_purchases.trial_ends_at),
        access_until = coalesce(excluded.access_until, public.hotmart_purchases.access_until),
        first_paid_at = coalesce(public.hotmart_purchases.first_paid_at, excluded.first_paid_at),
        updated_at = now();

  select access_until into v_access_until from public.hotmart_purchases where email = p_email;

  update public.profiles
  set plan = public.plan_segun_estado(p_new_status, v_access_until),
      membership_status = p_new_status,
      trial_ends_at = coalesce(p_trial_ends_at, public.profiles.trial_ends_at),
      access_until = v_access_until
  where email = p_email;

  return jsonb_build_object('status', 'applied', 'new_status', p_new_status);
end;
$$;

revoke execute on function public.apply_hotmart_event from anon, authenticated;

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

  v_plan := public.plan_segun_estado(v_status, v_access_until);

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
