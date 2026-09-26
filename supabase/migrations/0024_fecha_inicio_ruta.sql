-- Fecha en que la persona empezó su ruta: permite mostrar "Día N de 90"
-- (Ruta Principiante) o "Semana N" (Ruta Intermedio) y que siga a la cuenta.
alter table public.profiles
  add column if not exists fecha_inicio_ruta date;
