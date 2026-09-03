-- Panel de administración del dueño (21-BACKOFFICE.md). Acceso restringido:
-- profiles.role server-side + RLS estricto — nunca solo ocultar la ruta (IDOR).

alter table profiles add column role text not null default 'user'
  check (role in ('user', 'admin'));

-- Origen del cliente (para atribución por canal, aún no capturado por el
-- checkout — la columna existe para cuando 34/36 lo instrumenten).
alter table profiles add column source text;

-- El único perfil existente hoy es el del dueño de la app.
update profiles set role = 'admin' where email = 'oskitarmint@gmail.com';

-- ── event_log: eventos de uso/activación/retención (21, 36) ──────────────
create table event_log (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index event_log_type_created_idx on event_log(type, created_at desc);
create index event_log_user_created_idx on event_log(user_id, created_at desc);

alter table event_log enable row level security;
create policy "insert_own_events" on event_log for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "admin_reads_events" on event_log for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ── error_log: errores reales capturados por Error Boundaries/catch (21) ──
create table error_log (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  context text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index error_log_created_idx on error_log(created_at desc);

alter table error_log enable row level security;
create policy "insert_own_errors" on error_log for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "admin_reads_errors" on error_log for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ── acquisition_spend: gasto por canal, lo carga el dueño a mano (21) ─────
create table acquisition_spend (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  amount numeric not null,
  currency text not null default 'USD',
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

alter table acquisition_spend enable row level security;
create policy "admin_all_acquisition_spend" on acquisition_spend for all to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ── cost_assumptions: supuestos de costo que el dueño llena para "Ganancia
--    real" (tarifa Hotmart %, comisión afiliado %, impuestos %, infra/email
--    fijos mensuales). Fila única (id fijo) — se actualiza, no se inserta más. ──
create table cost_assumptions (
  id boolean primary key default true check (id),
  hotmart_fee_pct numeric,
  afiliado_pct numeric,
  impuestos_pct numeric,
  infra_mensual numeric,
  email_mensual numeric,
  updated_at timestamptz not null default now()
);

alter table cost_assumptions enable row level security;
create policy "admin_all_cost_assumptions" on cost_assumptions for all to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ── RLS admin sobre las tablas operativas ya existentes ───────────────────
-- Sin esto, el dueño solo podría leer SU propia fila (política normal de
-- usuario) — el panel necesita ver a TODOS los usuarios/compras/registros.
create policy "admin_reads_all_profiles" on profiles for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "admin_updates_all_profiles" on profiles for update to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy "admin_reads_all_workout_logs" on workout_logs for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy "admin_reads_all_hotmart_purchases" on hotmart_purchases for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy "admin_reads_webhook_log" on webhook_log for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
