# Auditoría completa de GymEvoApp — 05/10/2026

Hecha por 8 especialistas en paralelo (accesibilidad, seguridad, React/TypeScript, base de datos, SEO, fallos silenciosos, conversión/copy, rendimiento) más un recorrido funcional propio. **Solo lectura: no se cambió ningún archivo de la app.**

Marcas: ✅ = lo comprobé yo directamente (código, base de datos real o `npm audit`) · 🔎 = lo reporta un especialista, sin comprobar aparte.

## Correcciones a los informes (para no actuar por una falsa alarma)

- **"Un usuario puede hacerse admin editando su perfil" → FALSO en la base real.** ✅ El trigger `proteger_columnas_sensibles` existe en producción y bloquea `role`, `plan`, `email`, `membership_status`, `trial_ends_at`, `access_until` y `grace_ends_at`. Lo que sí falta es **versionarlo en el repositorio** (si se recrea la base desde las migraciones, quedaría sin protección).
- **"`usuarios_para_recordatorio_inactividad` abierta a anónimos" → FALSO en la base real.** ✅ `anon` y `authenticated` no pueden ejecutarla. Solo falta dejar ese `revoke` escrito en una migración.

---

## 0. El hallazgo más importante (afecta lo que construimos hoy)

**La sugerencia de peso por esfuerzo (el semáforo) pierde su dato en cuanto la persona tiene cuenta.** ✅ Comprobado en tres sitios:
- La tabla real `workout_logs` **no tiene columna `rir`** (consulta a la base de producción).
- `lib/supabase/sync.ts` no guarda ni lee `rir` (líneas 70 y 293).
- Cada vez que se abre `/app` con sesión, el progreso remoto **reemplaza** al local (`app/app/page.tsx:145-151`), sin esfuerzo y con `hechosHoy: []`.

Resultado: el color que la persona marca se guarda solo en el teléfono y se borra la próxima vez que abre la app. La "Ruta Intermedio: sube el peso según tu esfuerzo" que prometes en la oferta, y el comportamiento distinto por meta que acabamos de hacer, **no funcionan en producción para usuarios con cuenta**.

**Solución:** (1) migración `alter table workout_logs add column rir smallint check (rir between 0 and 4)`; (2) incluir `rir` en el insert y el select de `sync.ts`; (3) fusionar remoto y local en vez de reemplazar (ver sección 2).

---

## 1. Dinero y acceso (lo que más duele si falla)

| # | Problema | Solución |
|---|---|---|
| 1.1 | **El correo del comprador no se normaliza.** Hotmart puede mandar `Juan@Gmail.com`; Supabase lo guarda en minúsculas → pagó y no recibe acceso. 🔎 (webhook `route.ts:67`) | `email.trim().toLowerCase()` en el webhook y `lower()` en los RPC; migración que pase `hotmart_purchases.email` a minúsculas con `check`. |
| 1.2 | **Webhook: pierde días de acceso pagados.** Calcula `access_until` fuera de la transacción (dos eventos simultáneos se pisan) y si falla la lectura previa lo calcula desde hoy. 🔎 | Pasar los meses al RPC y calcular adentro con bloqueo de fila; si la lectura falla, responder 500 para que Hotmart reintente. |
| 1.3 | **Webhook: ventana de 5 min y rechazos sin rastro.** Un reintento legítimo tardío recibe 400 y no queda registrado. 🔎 | Ventana de 24 h (la idempotencia por `event_id` ya cubre el replay) y registrar los rechazos. |
| 1.4 | **Pago aprobado archivado como "transición ilegal" con 200.** Si alguien canceló y vuelve a comprar, no recibe acceso y nadie se entera. 🔎 | Permitir `cancelled → active`; alertar cuando una compra aprobada termine en `illegal`. |
| 1.5 | **`reconciliar_membresia` falla en silencio** (callback, login con código, paywall): quien pagó ve el paywall sin explicación. 🔎 | Revisar el `error`, reintentar una vez y mostrar "Estamos confirmando tu pago" con botón de reintento. |
| 1.6 | **El paywall no avisa qué correo usar en Hotmart.** Pagar con otro correo = sin acceso = reembolso. 🔎 | Texto bajo el botón: "En Hotmart usa este mismo correo para que tu acceso se active solo". Precargar el correo en el enlace si Hotmart lo permite. |
| 1.7 | **Prueba gratis reutilizable:** borrar la cuenta y recrearla da otros 7 días. 🔎 | Guardar un hash del correo en una tabla que no se borre. |

## 2. Datos del usuario (su progreso, lo que más confianza rompe)

| # | Problema | Solución |
|---|---|---|
| 2.1 | **Una serie registrada sin señal nunca llega a la nube y no hay aviso** (justo el escenario del gimnasio). El aviso `errorSync` no se dispara porque `getUser()` también necesita red. 🔎 (`sync.ts:287-306`) | Cola persistente de series pendientes en localStorage, reintento al volver la red/foco, y distinguir "sin sesión" de "sin red". |
| 2.2 | **"Reintentar" no reenvía las series perdidas**, solo el perfil. 🔎 | Que vacíe la cola del punto 2.1; el aviso desaparece solo cuando la cola queda vacía. |
| 2.3 | **Al abrir la app, lo remoto pisa lo local** ✅ y puede borrar series no subidas y el entrenamiento de hoy en curso. Además, tras recargar a mitad del entrenamiento los ejercicios ya hechos reaparecen como pendientes y el botón puede crear una serie extra (la 5 de 4). 🔎 | Si falla la lectura remota, no tocar lo local; fusionar por (fecha, ejercicio, serie); derivar `hechosHoy` de los registros de hoy. |
| 2.4 | **Historial truncado a 1.000 filas** (límite de PostgREST): con ~3-4 meses de uso se pierde **lo más reciente**. 🔎 (`sync.ts:62`) | Paginar con `.range()` o traer solo últimos 90 días + última marca por ejercicio. |
| 2.5 | **localStorage corrupto o bloqueado rompe `/app` para siempre** (`JSON.parse` sin protección; modo privado de Safari lanza al guardar). 🔎 (`routine.ts:1381`, `onboarding.ts`, `perfil.ts`, `utm.ts`) | `lib/storage.ts` con lectura/escritura protegidas; `leerProgreso` valida la forma y cae al valor por defecto; botón "restablecer datos locales". |
| 2.6 | **Cerrar sesión borra lo local aunque haya series sin subir,** y deja nombre, foto, respuestas del onboarding y UTM en el dispositivo (un segundo usuario las vería). 🔎 | Antes de salir, vaciar la cola o avisar; una función `limpiarDatosLocales()` que borre todo `gymevo_*`. |
| 2.7 | **Eliminar cuenta ignora errores parciales:** puede decir "listo" y dejar datos (derecho de supresión). 🔎 | Revisar cada `error` y abortar con 500 antes de borrar la cuenta de acceso. |
| 2.8 | **Subir foto de perfil:** si la red falla, el botón queda bloqueado para siempre; no se valida tipo ni tamaño (15 MB entra tal cual). 🔎 | `try/finally`, validar `image/*` y ≤5 MB, redimensionar antes de subir. |

## 3. Seguridad

| # | Problema | Solución |
|---|---|---|
| 3.1 | **Next.js 16.3.3 tiene un aviso crítico** (RCE en `next/og`). ✅ `npm audit`. Tu código no usa `next/og`, así que probablemente no es explotable hoy, pero hay que actualizar. | `npm install next@16.3.8` + `npm audit fix`. |
| 3.2 | **Redirección abierta en `/auth/callback`** (`next` sin validar: `?next=@sitio-malo.com`). ✅ (`route.ts:9,21`) | Aceptar solo rutas internas: empieza por `/`, sin `//`, sin `@`, sin `\`; si no, `/app`. |
| 3.3 | **`push/subscribe` guarda cualquier URL como destino** y los cron le hacen POST desde tu servidor (SSRF a ciegas). 🔎 | Exigir `https:` y host de servicios push conocidos (FCM, Mozilla, Windows, Apple); envolver `req.json()` en try/catch. |
| 3.4 | **Contadores de analítica manipulables:** `/api/analitica/visita` sin límite de tasa ni tamaño y un tipo inválido se cuenta como `landing_view`; además cualquier usuario autenticado puede insertar `type='purchase'` en `event_log`. 🔎 | Devolver 204 sin insertar si el tipo es inválido, cortar campos UTM a 64 caracteres, límite por IP; quitar la política de INSERT de `event_log` para usuarios (las compras ya entran por servidor). |
| 3.5 | **Trigger y tablas fuera del repositorio:** `proteger_columnas_sensibles_profiles`, `push_subscriptions`, `costos_servicios`, columnas `sexo`/UTM y el `revoke` del RPC de recordatorios. ✅ (el trigger sí existe en vivo) | `supabase db pull` → migración nueva; añadir test que verifique que `update profiles set role='admin'` falla. |
| 3.6 | **Server Actions del admin dependen solo de `proxy.ts` y RLS.** 🔎 | `assertAdmin()` al inicio de cada acción y página de `/admin`. |
| 3.7 | **Faltan CSP y HSTS; `X-Frame-Options` no cubre `/login` ni `/paywall`.** 🔎 | Añadir HSTS y una CSP (primero en modo Report-Only). |
| 3.8 | **Bucket `avatars` sin límite de tamaño ni tipo** (acepta SVG/HTML) y permite listar usuarios. 🔎 | `file_size_limit` 2 MB y solo jpeg/png/webp. |
| 3.9 | **Mensajes de error del trigger en voseo** ("No **podés** cambiar…"), contra tu regla de tuteo neutro. ✅ | Reescribir con "No puedes…" en la función de la base. |

## 4. Páginas, SEO y rendimiento

| # | Problema | Solución |
|---|---|---|
| 4.1 | **La landing es 100 % del cliente: el HTML inicial no trae H1 ni contenido** ✅ (comprobado: no hay `<h1>` en el HTML). Buscadores y rastreadores de IA ven una página vacía; el visitante ve blanco hasta que responde Supabase, y si esa llamada falla se queda en blanco para siempre. | Hacer `app/page.tsx` un componente de servidor que pinte `LandingV1`, y mover la redirección por sesión a `proxy.ts`/un componente aparte que no devuelva `null`. |
| 4.2 | **Imágenes de ejercicios: 20 PNG pesan 32,8 MB** (2 de calentamiento >4 MB cada una). 🔎 | Convertir a WebP (≈60-150 KB c/u → ~2,5 MB total). Requiere tu revisión visual antes de reemplazar. |
| 4.3 | **Video del hero (3,1 MB) se descarga siempre en móvil**, con `preload="auto"` y sin póster; el del Perfil (3,1 MB) igual. `hero-paywall.mp4` no se usa en ningún lado. 🔎 | Cargar solo en pantallas anchas, sin ahorro de datos ni movimiento reducido; póster WebP; recodificar a ~600 KB; borrar el archivo huérfano. |
| 4.4 | **Precarga del GIF de 1,4 MB al abrir `/app`** aunque la persona nunca llegue a esa pantalla (`app/app/page.tsx:342`) — choca con tu regla de no precargar. Lottie (~380 KB) entra con todo `/app` para animar un ícono. 🔎 | Cargar el GIF solo al mostrarse (o convertirlo a video/WebP corto); `dynamic()` para Lottie. **Decisión tuya:** esa precarga se puso para evitar una pantalla en blanco. |
| 4.5 | **Imágenes sin tamaño ni prioridad** (riesgo de saltos de diseño; la del hero es el LCP). 🔎 | `width/height` + `fetchPriority="high"` en la del hero; `decoding="async"`. |
| 4.6 | **Sin datos estructurados ni `noindex` en rutas privadas;** `/login`, `/paywall`, `/onboarding` solo tienen `Disallow` (no desindexa). 🔎 | JSON-LD Organization + SoftwareApplication + FAQPage (sin `aggregateRating`: no hay reseñas reales); `robots: noindex` en esas rutas. |
| 4.7 | **Sitemap con `lastModified = ahora`; sin `title.template`; meta description de ~175 caracteres.** 🔎 | Fechas fijas; plantilla de título; descripción ≤160. |
| 4.8 | **El service worker re-descarga cada imagen vista en segundo plano** (con PNG de 3 MB, gasto de datos oculto). 🔎 | Pasar a "primero caché" con versión; el punto 4.2 reduce el costo. |
| 4.9 | **Sin páginas de error:** no existen `not-found.tsx`, `error.tsx` ni `global-error.tsx`. ✅ Una URL mala muestra el 404 en inglés de Next y un fallo en pantalla puede quedar en blanco — **contradice tu propia regla "la app nunca muestra pantalla blanca".** | Crear las 3 páginas en español, con marca y botón "Volver al inicio / Reintentar". |
| 4.10 | **Avisos de consola:** `strokeDashoffset` sin valor inicial en `onboarding/generando` ✅ y `scroll-behavior: smooth` en `<html>` sin `data-scroll-behavior`. | Añadir `initial={{ strokeDashoffset: circunferencia }}`; añadir el atributo. |

## 5. Errores de comportamiento en pantallas

| # | Problema | Solución |
|---|---|---|
| 5.1 | **Bucle en el login ✅:** con `?desde=app` el destino es `/onboarding/plan` (línea 30), así que tras entrar vuelve a ver el Día 1 y de nuevo el paywall. Dos pantallas de más en el momento de mayor intención. | Con `desde=app` ir directo a `/app`. Botón: "Entrar y empezar mis 7 días gratis". |
| 5.2 | **"Reenviar código" queda bloqueado para siempre ✅:** `reenviar()` pone el contador en 60 pero no crea otro intervalo (el primero se detuvo en 0). Tampoco maneja el error. | Un solo `useEffect` ligado a `countdown > 0` con `setTimeout` de 1 s y limpieza. |
| 5.3 | **`/onboarding/generando`:** desajuste de hidratación (lee `sessionStorage` en el render) y usa `router.push`: con Atrás desde el plan se vuelve a ver la carga y rebota al plan. 🔎 | Leer en un efecto; `router.replace`. |
| 5.4 | **Cuestionario: el avance automático usa un paso desactualizado** si tocas Atrás/Salir durante los 260 ms (1,7 s en "frustración"). 🔎 | Guardar el timer en una ref y cancelarlo; `setPasoIdx(i => i + 1)`. |
| 5.5 | **Los temporizadores de descanso y calentamiento se desfasan con la pantalla bloqueada** (restan 1 por tick). 🔎 | Guardar la hora de fin y recalcular el tiempo restante en cada tick y en `visibilitychange`. |
| 5.6 | **Efectos secundarios dentro de funciones de `setState`** (`actualizar`, `elegirRutina`, `finalizarEntrenamiento`): en modo estricto o al re-renderizar se guardan dos veces en el teléfono y en Supabase. 🔎 | Calcular el siguiente progreso con una ref o `useReducer` y persistir en un efecto con debounce. |
| 5.7 | **`registrarEvento` puede lanzar una excepción** con almacenamiento bloqueado y el botón que lo llama (registrar serie, iniciar, finalizar) no hace nada. 🔎 | `try/catch` dentro de `registrarEvento` y `leerUTM`. |
| 5.8 | **`completarEntrenamiento` no es idempotente:** repetirlo el mismo día suma otra sesión a la semana. 🔎 | Guarda `ultimaFecha === hoy`. |
| 5.9 | **Peso sin límites:** acepta negativos o `1e5`. 🔎 | `min=0` y `max`. |
| 5.10 | **`app/app/page.tsx` (~1.500 líneas) y `perfil/page.tsx` (~1.200) re-renderizan todo en cada tecla** del campo de peso. 🔎 | Partir: hook `useProgresoLocal`, `TarjetaEjercicio` memoizada con su propio estado, temporizador, diálogos y secciones del perfil como componentes. |

## 6. Accesibilidad (WCAG 2.2 AA)

| # | Problema | Solución |
|---|---|---|
| 6.1 | **Seis ventanas emergentes de Entrenar y tres de Perfil no mueven el foco, no lo atrapan y no cierran con Escape;** varias ni tienen `role="dialog"`. 🔎 | Extraer a un componente `<Dialog>` reutilizable el patrón que ya funciona bien en `onboarding/page.tsx:128-158`. |
| 6.2 | **La etapa "Hoy toca construir" es un `div role="button"` sin teclado** y su `aria-label` tapa el contenido: con teclado o lector de pantalla no se puede avanzar. 🔎 (`app/app/page.tsx:620`) | Botón real "Continuar al plan". |
| 6.3 | **Contrastes bajo 4,5:1:** `--text-tertiary` sobre tarjetas (4,36:1), `--accent-2` usado como texto (3,3:1), texto blanco en "Sí, eliminar" (2,8:1). 🔎 | `--text-tertiary: #8a91a0`; texto con `--accent`, no `--accent-2`; texto oscuro sobre el rojo. |
| 6.4 | **Campos sin etiqueta** (correo, código, nombre: solo placeholder) y **errores sin `role="alert"`:** el lector de pantalla no anuncia nada. 🔎 | `aria-label`/`label sr-only`; `role="alert"` y foco al checkbox cuando falta el consentimiento. |
| 6.5 | **Estados que solo se ven:** el interruptor de descanso no es `role="switch"`; las tarjetas de plan del paywall no dicen cuál está elegida. 🔎 | `role="switch" aria-checked`; `role="radiogroup"`/`aria-checked` en los planes. |
| 6.6 | **Objetivos táctiles de ~16 px** ("Deshacer", "Reintentar", enlaces de ayuda) en el gimnasio, con manos sudadas. 🔎 | `min-h-11 px-2` (≥44 px). |
| 6.7 | **El cuestionario avanza solo y el foco se pierde;** sin barra de progreso accesible; sin `<main>`, sin `aria-current` en la barra inferior; sin anuncio al registrar una serie ni al terminar el descanso. 🔎 | Foco al `h1` por paso, `role="progressbar"`, landmarks, `aria-live`. |

## 7. Conversión y copy (verificado contra tu modelo: pago único, 7 días gratis sin tarjeta)

| # | Problema | Solución |
|---|---|---|
| 7.1 | **El paywall mezcla dos decisiones:** elegir plan no cambia el botón de prueba; "Desbloquea tu Botón de Rescate" sugiere algo bloqueado cuando ya probó el Rescate gratis. 🔎 | Titular de prueba ("Empieza tu prueba de 7 días, sin tarjeta"), tarjetas como "si decides seguir", un solo verbo por acción. |
| 7.2 | **Palabras de "suscripción" en Perfil** que contradicen el pago único ("Vas a desactivar tu suscripción… tu próximo ciclo"). 🔎 | Reescribir; mostrar la cancelación solo a cuentas antiguas. |
| 7.3 | **La garantía se dice distinto en 3 sitios:** landing "por cualquier motivo, sin preguntas" vs. política de reembolsos condicionada; y `docs/copy/landing.md` aún trae "14 días" y "6 meses gratis". 🔎 | Una sola redacción en landing, reembolsos y `landing.md` (la política legal es la que manda; verificar con abogado el derecho de retracto). |
| 7.4 | **"MÁS POPULAR" sin ventas que lo respalden; "hasta 12 cuotas" y la lista de medios de pago sin fuente en `FICHA-MERCADO.md`; "/mes" grande sobre un pago único.** 🔎 | "MEJOR PRECIO"; quitar cuotas/medios hasta confirmarlos en el checkout real; mostrar "$29.99 USD · pago único (≈ $2.50/mes)". |
| 7.5 | **"Te avisamos antes de que termine" solo se cumple con notificaciones push** (quien no las activó no recibe aviso previo). 🔎 | Decirlo con precisión o añadir correo de aviso. |
| 7.6 | **CTAs con verbos distintos** para la misma acción (7 variantes entre landing, cuestionario, plan, paywall y login); y bajo el botón del hero se lee la garantía (que aplica *después* de pagar) en vez de "sin tarjeta". 🔎 | Un verbo ("Empezar") para la prueba y "Pagar" solo al pagar; microcopy: "7 días gratis · sin tarjeta · pago único si sigues". |
| 7.7 | **Regionalismos y claims absolutos:** "comadrear", "claven una suscripción", "las apps de IA te cambian la rutina cada día", "sin arriesgar tu espalda" (V2; tus términos excluyen lesiones). 🔎 | Alternativas neutras sin afirmaciones absolutas (textos propuestos en el informe de conversión). |
| 7.8 | **Sin prueba social real todavía.** 🔎 | Franja de datos verificables (70 ejercicios, 2 rutas, Rescate en cada ejercicio), nota del creador, y pedir testimonio con permiso al día 5 de la prueba. |

## 8. Robustez del panel de administración

| # | Problema | Solución |
|---|---|---|
| 8.1 | **El panel se rompe en silencio desde ~1.000 filas** (tope de PostgREST): totales de usuarios, series y etapas dejan de ser reales y nadie lo nota. 🔎 | Mover los agregados a funciones SQL (`admin_resumen`, `admin_embudo`). |
| 8.2 | **`event_log` crece sin límite** y el Embudo lanza ~15 conteos exactos por carga. 🔎 | Una consulta agrupada + purga a 90 días (pg_cron); lo mismo para `webhook_log` y `error_log`. |
| 8.3 | **Faltan índices:** `workout_logs (user_id, fecha)`, búsquedas por correo con `ilike`. 🔎 | Índices (incluido `pg_trgm` para correo) creados con `concurrently`. |
| 8.4 | **Los cron responden 200 aunque no hayan enviado nada** (VAPID faltante, fallos de envío) y procesan usuario por usuario. 🔎 | Verificar la configuración antes del bucle, devolver `{procesados, enviados, fallidos}`, enviar con concurrencia limitada. |

## Lo que ya está bien (no hace falta tocar)

Webhook con `hottok` en tiempo constante, idempotencia y orden de estados; los 3 cron exigen `CRON_SECRET`; `cuenta/eliminar` valida sesión y borra solo al dueño; `/admin` verifica el rol en servidor y la base real protege `role`/`plan`/`email`; el service worker no cachea HTML, API ni datos de usuario; secretos fuera del repositorio; tuteo consistente en la interfaz; un solo `<h1>` por pantalla y `lang="es"`; sin errores de consola ni imágenes rotas ni desbordes horizontales en las páginas públicas a 375 px.

## Orden recomendado

1. **Primero (rompe lo que ya prometes):** 0 (columna `rir` + fusión de progreso), 5.1 (bucle del login), 5.2 (reenviar código), 1.1 y 1.6 (correo del comprador), 3.1 y 3.2 (Next y redirección), 4.9 (páginas de error), 2.5 (almacenamiento corrupto).
2. **Después (confianza del usuario):** 2.1–2.4 (cola de series y paginación), 1.2–1.5, 7.2–7.4, 3.3, 3.4.
3. **Luego (crecimiento y calidad):** 4.1 (landing en servidor), 4.2–4.4 (peso), 6.1–6.4, 7.1, 7.5–7.8, 8.x.
4. **Deuda a ordenar:** 3.5 (versionar la base), 3.6–3.8, 5.10 (partir los archivos grandes).
