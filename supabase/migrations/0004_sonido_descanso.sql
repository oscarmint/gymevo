alter table public.profiles
  add column if not exists sonido_descanso boolean not null default true;
