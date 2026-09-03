-- Soporte para "agregar usuario manualmente" del panel de admin (21-BACKOFFICE):
-- el dueño puede dar acceso por correo cuando el webhook de Hotmart falla.
-- reconciliar_membresia() ya concede plan='pro' a cualquier fila de
-- hotmart_purchases con status activo — esto solo agrega trazabilidad de
-- que la fila la creó el dueño a mano, no un webhook real.
alter table hotmart_purchases add column nombre_manual text;
alter table hotmart_purchases add column agregado_manualmente boolean not null default false;
