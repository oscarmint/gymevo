-- Rutinas flexibles: la persona elige cuántos días por semana entrena (1-6), no
-- cuáles. Avisar a los 2 días exactos molestaba a quien planeó pocos días — el
-- umbral pasa a ser el intervalo esperado entre sesiones (7 / días por semana,
-- redondeado hacia arriba) más 1 día de margen: 1 día → 8, 2 → 5, 3 → 4, 4-6 → 3.
create or replace function public.usuarios_para_recordatorio_inactividad()
returns table(id uuid, nombre text)
language sql
security definer
set search_path to 'public'
as $function$
  select p.id, p.nombre
  from public.profiles p
  where p.ultimo_dia_completado is not null
    and current_date - p.ultimo_dia_completado =
        ceil(7.0 / least(greatest(coalesce(p.dias_semana, 4), 1), 6))::int + 1
    and (
      p.ultimo_recordatorio_inactividad is null
      or p.ultimo_recordatorio_inactividad < p.ultimo_dia_completado
    );
$function$;
