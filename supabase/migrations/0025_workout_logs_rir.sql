-- Esfuerzo (RIR) de cada serie registrada: antes solo vivia en el telefono y se
-- perdia al cambiar de dispositivo, asi que la sugerencia de peso cambiaba.
-- Aditiva y nullable: los registros viejos quedan sin RIR.
alter table public.workout_logs
  add column if not exists rir smallint check (rir between 0 and 4);
