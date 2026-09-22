-- Panel del dueño: rastro de auditoría para acciones sensibles del admin
-- (dar/quitar acceso manual, borrar un costo). Antes de esto, esas acciones
-- no dejaban ningún registro de quién las hizo ni cuándo — inspirado en el
-- panel de MeritGO (otro proyecto del usuario), adaptado a un solo admin
-- dueño (sin roles múltiples: aquí no hace falta RBAC).
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  accion text not null,
  detalle text,
  motivo text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "admin_all_audit_log" on public.admin_audit_log for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
