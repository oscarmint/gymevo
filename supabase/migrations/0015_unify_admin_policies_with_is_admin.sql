-- Consistencia: todas las políticas admin usan la función segura is_admin()
-- en vez de repetir el EXISTS inline (más corto, y evita el riesgo de
-- recursión si alguna de estas tablas algún día se auto-referencia).
drop policy if exists "admin_reads_events" on event_log;
create policy "admin_reads_events" on event_log for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_reads_errors" on error_log;
create policy "admin_reads_errors" on error_log for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_all_acquisition_spend" on acquisition_spend;
create policy "admin_all_acquisition_spend" on acquisition_spend for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_cost_assumptions" on cost_assumptions;
create policy "admin_all_cost_assumptions" on cost_assumptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_reads_all_workout_logs" on workout_logs;
create policy "admin_reads_all_workout_logs" on workout_logs for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_reads_all_hotmart_purchases" on hotmart_purchases;
create policy "admin_reads_all_hotmart_purchases" on hotmart_purchases for select to authenticated
  using (public.is_admin());
drop policy if exists "admin_inserts_hotmart_purchases" on hotmart_purchases;
create policy "admin_inserts_hotmart_purchases" on hotmart_purchases for insert to authenticated
  with check (public.is_admin());
drop policy if exists "admin_updates_hotmart_purchases" on hotmart_purchases;
create policy "admin_updates_hotmart_purchases" on hotmart_purchases for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_reads_webhook_log" on webhook_log;
create policy "admin_reads_webhook_log" on webhook_log for select to authenticated
  using (public.is_admin());
