-- El interruptor "Descanso automático entre series" debe empezar apagado
-- (pedido del usuario, 22/09/2026) — antes el default era `true`. Solo cambia
-- el default para perfiles NUEVOS; los usuarios existentes conservan su valor
-- actual (ya sea que lo hayan encendido o no).
alter table public.profiles
  alter column descanso_automatico set default false;
