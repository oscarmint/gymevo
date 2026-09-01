-- GymEvo — nombre visible del usuario (Sesión 7): "cómo quiere que le llamemos",
-- editable en /app/perfil. Aplicada directo en Supabase vía MCP; este archivo
-- es el registro versionado de ese cambio.
alter table public.profiles add column if not exists nombre text;
