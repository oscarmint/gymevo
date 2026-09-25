# Beta cerrada de GymEvo — material listo (25/09/2026)

Objetivo: que 15 a 30 personas reales usen GymEvo 30 días y, si quieren, dejen una opinión que podamos publicar **con su permiso escrito**. Cero testimonios inventados.

## 1. A quién invitar
- Gente de tu gimnasio, amigos y conocidos que **ya entrenan** (principiantes e intermedios).
- Mezcla: unos 2/3 principiantes y 1/3 intermedios; hombres y mujeres.
- Evita familiares muy cercanos como única fuente: sus opiniones pesan menos.

## 2. Mensaje de invitación (WhatsApp)

> Hola [nombre] 👋 Estoy lanzando GymEvo, una app que te dice exactamente qué entrenar cada día en el gimnasio y, si la máquina está ocupada, con un toque te da otro ejercicio. Estoy armando un grupo pequeño de personas para probarla **30 días gratis** (sin tarjeta) y contarme qué les parece, con toda honestidad, lo bueno y lo malo.
>
> ¿Te animas? Entra aquí: https://www.gymevoapp.com/?utm_source=whatsapp&utm_medium=beta&utm_campaign=invitacion
> Y respóndeme este mensaje con **el correo con el que te vas a registrar**, para dejarte los 30 días.
>
> Mil gracias, me ayudas muchísimo 🙏

Variante corta para recordatorio (a los 5 días):

> ¿Cómo vas con GymEvo? Si algo no se entiende o falla, dímelo por aquí. Es justo lo que necesito saber.

## 3. Cómo se le dan los 30 días (lo hago yo)
La app da 7 días gratis al crear la cuenta. Para la beta se extienden a 30.
1. La persona se registra en la web con su correo.
2. Me pasas la lista de correos que ya se registraron.
3. Yo corro un cambio en la base de datos que pone el fin de su prueba a 30 días desde hoy:
   `update profiles set trial_ends_at = now() + interval '30 days' where id in (select id from auth.users where email = any(array[...]))`
4. Te confirmo cuántas cuentas cambié.

Sin código de descuento ni pago de por medio.

## 4. Formulario de opinión (crear en Google Forms)
Título: **Tu opinión sobre GymEvo (2 minutos)**

1. ¿Cuántos días usaste GymEvo? (1–3 / 4–10 / 11–20 / más de 20)
2. ¿Qué nivel tienes? (Principiante / Intermedio)
3. ¿Qué tan claro fue saber qué hacer en el gimnasio? (1 a 5)
4. ¿Usaste el **Botón de Rescate**? (Sí / No). Si sí: ¿te sirvió? (1 a 5)
5. ¿Qué fue lo **mejor** de la app? (párrafo)
6. ¿Qué **no entendiste** o te molestó? (párrafo)
7. ¿Pagarías por GymEvo? (Sí / Tal vez / No). ¿Cuánto te parecería justo al mes? (USD o COP)
8. ¿Se lo recomendarías a un amigo del gimnasio? (0 a 10)

**Permiso para publicar (obligatorio para usar la opinión):**
9. ¿Autorizas que publiquemos tu opinión (la frase de la pregunta 5) en la página de GymEvo?
   - Sí, con mi nombre y apellido inicial (ej. Camilo R.)
   - Sí, solo con mi nombre de pila
   - No, solo es para mejorar la app
10. Nombre como quieres que aparezca: ______
11. Ciudad (opcional): ______
12. Texto de autorización (casilla): "Confirmo que escribí esta opinión libremente, que es mi experiencia real y autorizo a GymEvo a publicarla en su página web y redes con el nombre indicado. Puedo pedir que la retiren escribiendo a gymevo@outlook.com."

Configuración: activar "recopilar correos" para poder demostrar el permiso.

## 5. Cómo se publica un testimonio (solo si dijo Sí en la 9)
1. Copia la frase **tal cual** (solo corrijo tildes o errores de tipeo).
2. Guarda la captura de la respuesta con el permiso en una carpeta privada tuya.
3. Me pasas: frase, nombre autorizado, ciudad (si dio) y días de uso.
4. Yo la agrego en `lib/testimonios.ts` con `permisoPublicar: true`. La sección de la landing **aparece sola** en cuanto hay el primero y no se pinta nada mientras la lista esté vacía.

Reglas fijas: nada de inventar, resumir con otras palabras, mezclar frases de personas distintas ni poner fotos de bancos de imágenes.

## 6. Qué medir durante la beta
- Cuántos se registran de los que invitas (meta ≥ 60 %).
- Cuántos entrenan al menos 3 días en la primera semana (meta ≥ 50 %).
- Cuántos usan el Botón de Rescate.
- Cuántos responden el formulario (meta ≥ 40 %).
- Qué confunde más (pregunta 6).

## 7. Calendario sugerido
- Día 0: invitar a 20 personas.
- Día 1–3: registrar correos y extender a 30 días.
- Día 5: recordatorio corto.
- Día 14: mensaje a quien no ha entrado ("¿te ayudo con algo?").
- Día 28–30: enviar el formulario.
- Día 31–35: publicar los testimonios autorizados y cerrar la beta.
