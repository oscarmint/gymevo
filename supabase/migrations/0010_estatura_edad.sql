-- Estatura (cm) y edad — junto con peso_kg (0008) y el sexo del onboarding,
-- completan los datos de la ecuación Mifflin-St Jeor para calcular el gasto
-- calórico real en la calculadora de macros (ver lib/macros.ts). Nullable:
-- solo se piden en Perfil cuando el usuario quiere ver sus macros.
alter table public.profiles
  add column if not exists estatura_cm numeric,
  add column if not exists edad smallint;
