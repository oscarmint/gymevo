-- GymEvo — esquema inicial (Sesión 6)
-- Tablas de USUARIO (con RLS: cada quien ve solo lo suyo).
-- El catálogo de ejercicios/rutinas sigue viviendo en lib/routine.ts (contenido
-- estático curado, sin datos personales) — no necesita tabla ni RLS todavía.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nivel text not null default 'principiante' check (nivel in ('principiante', 'intermedio')),
  meta text not null default 'musculo' check (meta in ('musculo', 'grasa')),
  horario text,
  dias_semana int not null default 4,
  dia_actual int not null default 1,
  racha int not null default 0,
  ultimo_dia_completado date,
  descanso_automatico boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ejercicio_id text not null,
  fecha date not null default current_date,
  series int not null,
  reps int not null,
  peso numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists workout_logs_user_id_idx on public.workout_logs (user_id);

alter table public.workout_logs enable row level security;

create policy "workout_logs_select_own" on public.workout_logs
  for select using ((select auth.uid()) = user_id);

create policy "workout_logs_insert_own" on public.workout_logs
  for insert with check ((select auth.uid()) = user_id);
