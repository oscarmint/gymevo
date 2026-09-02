-- Unidad en la que el usuario registra el peso levantado en cada serie
-- (kg o lb — no toda la gente entrena en kg). Default 'lb' a pedido
-- explícito del usuario; se puede cambiar en Perfil en cualquier momento.
-- No confundir con peso_kg (0008): ese es el peso CORPORAL para las macros,
-- siempre en kg porque las fórmulas del ebook son por kg.
alter table public.profiles
  add column if not exists unidad_peso text not null default 'lb'
    check (unidad_peso in ('kg', 'lb'));
