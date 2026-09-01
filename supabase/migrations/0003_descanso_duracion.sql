alter table public.profiles
  add column if not exists descanso_duracion_seg integer not null default 60;
