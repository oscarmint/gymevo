-- GymEvo — membresía real vía Hotmart (Sesión 7: auditoría, hallazgo crítico #1).
-- Antes de esto, cualquier cuenta creada por magic link tenía acceso completo a
-- /app para siempre, sin haber pagado nunca. Este archivo agrega el mínimo
-- necesario para que el pago sea real, siguiendo docs/sistema/18-VENTA-HOTMART.md
-- (versión con alcance recortado: sin ledger económico ni reconciliación semanal
-- todavía — documentado como pendiente en ESTADO.md, no bloquea la primera venta).

-- `profiles.id` ya es NOT NULL → FK a auth.users (no se puede volver nullable sin
-- romper lo existente). Por eso el pago se registra en una tabla propia, indexada
-- por EMAIL (el webhook puede llegar antes de que exista la cuenta de auth), y se
-- reconcilia contra `profiles` cuando el usuario entra por primera vez o cuando
-- ya tiene cuenta al momento del pago (ver función más abajo).

create table if not exists public.hotmart_purchases (
  email text primary key,
  plan text not null default 'pro' check (plan in ('pro')),
  status text not null check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback')),
  hotmart_subscriber_code text,
  trial_ends_at timestamptz,
  access_until timestamptz,
  grace_ends_at timestamptz,
  first_paid_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Solo el service_role (el webhook) toca esta tabla — RLS activa, cero políticas
-- para anon/authenticated (nadie con sesión normal puede leerla ni escribirla).
alter table public.hotmart_purchases enable row level security;

create table if not exists public.processed_events (
  event_id text primary key,
  event_type text not null,
  payload_hash text,
  processed_at timestamptz not null default now()
);
alter table public.processed_events enable row level security;

create table if not exists public.webhook_log (
  id bigserial primary key,
  event_id text,
  type text,
  result text not null check (result in ('applied', 'duplicate', 'illegal', 'unauthorized', 'error')),
  received_at timestamptz not null default now()
);
create index if not exists webhook_log_received_idx on public.webhook_log (received_at desc);
alter table public.webhook_log enable row level security;

-- `profiles` gana: email (para reconciliar con hotmart_purchases), plan real,
-- estado de membresía, y las fechas que decide `hasFullAccess` (18/26).
alter table public.profiles add column if not exists email text;
create unique index if not exists profiles_email_key on public.profiles (email) where email is not null;
alter table public.profiles add column if not exists plan text not null default 'free' check (plan in ('free', 'pro'));
alter table public.profiles add column if not exists membership_status text;
alter table public.profiles add column if not exists trial_ends_at timestamptz;
alter table public.profiles add column if not exists access_until timestamptz;
alter table public.profiles add column if not exists grace_ends_at timestamptz;

-- RPC atómica que aplica un evento de Hotmart: idempotencia + transición legal +
-- upsert de hotmart_purchases + (si ya existe la cuenta) actualización directa
-- de profiles por email — así no hace falta esperar al próximo login si el
-- usuario ya tenía cuenta al momento de pagar.
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
begin
  -- (a) IDEMPOTENCIA — Hotmart reenvía; si ya procesamos este event_id, salir.
  begin
    insert into public.processed_events (event_id, event_type, payload_hash)
    values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;

  select status into v_current from public.hotmart_purchases where email = p_email;

  -- (b) TRANSICIÓN LEGAL — un evento viejo reentregado no resucita un refund/chargeback.
  if v_current in ('refunded', 'chargeback') and p_new_status in ('active', 'trialing') then
    return jsonb_build_object('status', 'illegal_transition', 'from', v_current);
  end if;

  -- (c) Fuente de verdad del pago, por email (puede no existir cuenta de auth todavía).
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

  -- (d) Si la cuenta de auth YA existe para ese correo, subirla a pro de inmediato
  --     (si no existe todavía, se reconcilia sola al primer login — ver sync.ts).
  update public.profiles
  set plan = case when p_new_status in ('trialing', 'active', 'past_due', 'cancelled') then 'pro' else 'free' end,
      membership_status = p_new_status,
      trial_ends_at = coalesce(p_trial_ends_at, public.profiles.trial_ends_at),
      access_until = coalesce(p_access_until, public.profiles.access_until)
  where email = p_email;

  return jsonb_build_object('status', 'applied', 'new_status', p_new_status);
end;
$$;

revoke execute on function public.apply_hotmart_event from anon, authenticated;
