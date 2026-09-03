-- Foto de perfil (03/09/2026): bucket público de solo-lectura (las fotos de
-- perfil no son datos sensibles) pero de escritura restringida — cada
-- usuario solo puede subir/actualizar/borrar SU PROPIA carpeta, nombrada
-- con su user_id, para que no pueda pisar la foto de otro.
alter table profiles add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar_lectura_publica" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar_sube_lo_propio" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "avatar_actualiza_lo_propio" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "avatar_borra_lo_propio" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);
