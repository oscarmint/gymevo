-- Rutinas del plan hechas en la semana en curso y rutina elegida para hoy:
-- antes vivían solo en el dispositivo; ahora siguen a la cuenta (celular y PC ven lo mismo).
alter table public.profiles
  add column if not exists rutinas_hechas jsonb,
  add column if not exists rutina_elegida jsonb;
