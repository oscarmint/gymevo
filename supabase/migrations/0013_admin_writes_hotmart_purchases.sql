-- El admin necesita poder INSERTAR/ACTUALIZAR hotmart_purchases desde el
-- panel (agregar acceso manual) usando su propia sesión, no una service key.
create policy "admin_inserts_hotmart_purchases" on hotmart_purchases for insert to authenticated
  with check (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "admin_updates_hotmart_purchases" on hotmart_purchases for update to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
