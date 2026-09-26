# Cambio a GymEvoApp — qué hice yo y qué debes cambiar tú (26/09/2026)

## Hecho en el código (queda en tu computador hasta que digas "subir")
- Logo nuevo (pesa + reloj de arena + flecha) calcado de tu archivo, en verde lima de la app: componente `Logo`, ícono de la app (`app/icon.svg`, `apple-icon`, `icon-192/512`, `favicon-48`), logo de correo (`email-logo-dark.png`).
- Imágenes al compartir el enlace (`opengraph-image.jpg`, `twitter-image.jpg`) con el logo y el nombre nuevos.
- Nombre "GymEvoApp" en 19 archivos: landing, login, onboarding, paywall, Perfil, avisos, Privacidad, Términos, Reembolsos, título de la pestaña, manifiesto de la app instalable y notificaciones.
- Textos de la beta y de la descripción de Hotmart.
- Archivos listos para subir a otras plataformas: `docs/logos/entregables/` (logo con fondo oscuro, logo transparente PNG y SVG, ícono 512 y tu original).

## Lo que debes cambiar tú (en este orden)
1. **Hotmart**: nombre del producto y de las 3 ofertas ("GymEvoApp Anual/Semestral/Mensual"), imagen/portada del producto (usa `icono-app-512.png`), y el logo o nombre del Checkout Builder. Revisa que la descripción diga GymEvoApp (el texto está en `docs/DESCRIPCION-HOTMART.txt`).
2. **Google Auth Platform → Información de la marca**: cambia el nombre de la aplicación a "GymEvoApp". Puede pedir verificar la marca otra vez (días). Sigue sin subir logo.
3. **Supabase → Authentication → Email Templates**: cambia "GymEvo" por "GymEvoApp" en el asunto y el cuerpo del correo con el código. En **Auth → SMTP Settings** cambia "Sender name" a `GymEvoApp` (el correo `acceso@gymevoapp.com` no cambia).
4. **Resend**: nombre del remitente si aparece "GymEvo". El dominio no cambia.
5. **Google Form de la beta**: pon "GymEvoApp" en el título y en el texto de autorización (`docs/BETA-CERRADA.md` ya está actualizado).
6. **Redes**: crea o renombra los perfiles como `@gymevoapp` y pon el enlace a `www.gymevoapp.com`.
7. **Search Console**: cuando publiques, pide "Inspeccionar URL → Solicitar indexación" de la página principal para que Google actualice el título.
8. **Vista previa de enlaces**: WhatsApp y Facebook guardan la imagen vieja. Actualízala en el depurador de Facebook (developers.facebook.com/tools/debug) pegando `https://www.gymevoapp.com`.

## Lo que NO cambia
- Dominio `gymevoapp.com`, correo `gymevo@outlook.com`, repositorio de GitHub y proyecto de Vercel.
- Colores, tipografía y diseño de pantallas.

## Avisos
- Quien ya instaló la app en el celular seguirá viendo el ícono y el nombre viejos hasta que la desinstale y la vuelva a instalar.
- La búsqueda de marca en la SIC sigue pendiente: revisa "GymEvoApp" y "GymEvo" antes de invertir en publicidad.
