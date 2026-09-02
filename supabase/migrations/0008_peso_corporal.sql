-- Peso corporal (kg) — la única entrada que le falta al usuario para que la
-- app calcule sus macros de Ruta A (ganar músculo) / Ruta B (bajar grasa),
-- ver docs/sistema y el ebook "Transformación en 90 días", cap. 3.
-- Nullable: no se le exige al usuario, solo se le pide cuando quiere ver sus
-- macros (Perfil → "Tus macros").
alter table public.profiles
  add column if not exists peso_kg numeric;
