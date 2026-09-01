# ESTADO — GymEvo (nombre tentativo: Método Cero)
Última actualización: 2026-08-29 | Sesión actual: 6

⏸️ CHECKPOINT — Última acción completada: **Login real de Supabase confirmado funcionando** (31/08/2026). Camino recorrido: (1) se encontró y corrigió un bug real — `/app` no exigía sesión, `proxy.ts` ahora redirige a `/login` sin sesión (commit `25a9394`); (2) el usuario probó el login completo en su propio navegador con `oskitarmint@gmail.com` — confirmado en los logs de Supabase (`query_logs`, source `auth_logs`): `user_signedup` + `login` exitosos, `confirmed_at`/`email_confirmed_at` sí quedaron (el campo `last_sign_in_at` se queda en null en este proyecto — parece una particularidad del proveedor, no algo que dependa de nuestro código, no bloquea nada); (3) un segundo intento con `oscarmint@hotmail.com` chocó con el **límite de correos de prueba gratis de Supabase** (error `over_email_send_rate_limit`, esperado — no es bug nuestro). Esto se resuelve solo al conectar Resend (ya en el plan de esta sesión) para que los correos de acceso salgan sin límite y con dominio propio. / Siguiente acción exacta: seguir con el siguiente servicio externo — dominio propio → Hotmart → Resend.

## Logo / isotipo (31/08/2026)
- El usuario mandó un isotipo generado con IA (dumbbell + reloj de arena formando una "H", verde sobre crema — coincide de casualidad con los tokens de FICHA-ARTE). No llegó como archivo editable (solo visible en el chat), así que se redibujó como vector en `components/Logo.tsx` (mismo diseño, `fill="currentColor"`, sin fondo, nítido a cualquier tamaño) en vez de recortar la imagen rasterizada.
- Ya reemplaza el placeholder verde genérico en: header de la landing (`Hero.tsx`) y `/login`. También es el favicon nuevo (`app/icon.svg`, se borró el `app/favicon.ico` genérico de Next.js).
- Pendiente: si el usuario quiere ajustar el diseño del isotipo (proporciones, grosor), se edita `components/Logo.tsx` y `app/icon.svg` (mismo path, duplicado a propósito porque el favicon no puede usar variables CSS).

## Video de fondo del hero (31/08/2026)
- El usuario pidió agregar un video propio (`Personas_entrenando_en_gimnasio...mp4`, IA) como fondo de la sección Hero de la landing. Copiado a `public/videos/hero-gimnasio.mp4`. `Hero.tsx` ganó un prop `backgroundVideoSrc` opcional: video absoluto detrás del contenido + scrim en degradé del propio `--bg` (58%→92%) para que el texto siga legible, oculto con `prefers-reduced-motion` (motion-reduce:hidden). Verificado por código/DOM/canvas que decodifica frames reales con color; la herramienta de screenshot remota que uso no logra capturar el video en movimiento (limitación de la herramienta, no del código) — el usuario debe confirmarlo en su propio navegador.

## Sesión 7 (31/08/2026) — en curso: revisor-visual de las 4 pantallas del dinero
- Se instaló Playwright (`npm i -D playwright` + `npx playwright install chromium`) para generar screenshots REALES a 375px (antes no había manera de generarlos sin pedirle capturas al usuario). Script: `scripts/capturar-screenshots.mjs` (sembra sessionStorage/localStorage con datos de ejemplo realistas antes de capturar).
- Se corrigió de paso: Next.js 16 le apendizaba su propio bloque a `AGENTS.md` en cada `next dev` (pisando la copia intencional del SO) — se agregó `agentRules: false` en `next.config.ts`.
- Capturas generadas (página completa a 375px): `docs/revisiones/{landing,onboarding,paywall,pantalla-principal}-375.png`.
- El subagente `revisor-visual` NO aparece en la lista de subagent_type disponibles del harness de esta sesión — se invocó como `general-purpose` con la instrucción explícita de leer y seguir `.claude/agents/revisor-visual.md` al pie de la letra (mismo efecto: contexto limpio, sin conocer las intenciones de quien construyó).
- Los 4 veredictos llegaron: **ninguno pasó el gate** (≥36/40 usabilidad y ≥16/20 craft). Se detectó que el screenshot de landing salió CASI EN BLANCO (solo Hero y Footer) — causa raíz: bug del SCRIPT de captura, no de la página real (las secciones usan `whileInView` de framer-motion, que no dispara sin scroll real; Playwright no scrollea antes del `fullPage` screenshot). Corregido en `scripts/capturar-screenshots.mjs` (scrollea la página en pasos de 400px antes de capturar) y se recapturó. También se ajustaron los datos de ejemplo de pantalla-principal (racha activa + 1 ejercicio tachado, antes salía sin nada marcado). Se relanzó el revisor para landing y pantalla-principal con las capturas corregidas; onboarding y paywall ya tenían capturas válidas, sus veredictos se mantienen.

### Resultados (primera pasada, antes del pulido de esta sesión)
- **onboarding** (paso 1): NO LISTA — Usabilidad 31/40, Craft 11/20. Defectos: vacío muerto bajo las 2 opciones (fondo plano sin profundidad), cero dispositivo ownable, sin salida/cancelar visible.
- **paywall**: NO LISTA — Usabilidad 30/40, Craft 12/20, Copy 18/20 (el copy SÍ pasa). Defectos: "Restaurar compra" sin onClick (parece interactivo, no hace nada), checkmarks del sistema "✓" en vez de custom, sin dispositivo ownable, garantía lejos del CTA, falta stagger en la mitad de los bloques.
- **landing / pantalla-principal**: veredicto inicial inválido por el bug del script — repetido, resultado pendiente de la notificación.

## Pendientes de pulido detectados por revisor-visual (Sesión 7, antes de declarar listas las 4 pantallas del dinero)
- [ ] onboarding: llenar el vacío bajo las opciones (centrar o agregar contenido), dar profundidad al fondo (mesh/tinte sutil), aplicar el tachado verde/chip de FICHA-ARTE como guiño de identidad, agregar salida/cancelar visible.
- [ ] paywall: conectar o quitar "Restaurar compra" (botón sin función hoy), cambiar los "✓" del sistema por checkmarks custom (círculo acento 12% + Check de Lucide), agregar el dispositivo ownable, repetir la garantía cerca del CTA principal, envolver los bloques restantes en stagger de entrada.
- [ ] pantalla-principal (primera pasada, a confirmar en la repetición): verificar en código el color del ícono de flama en el estado "racha en riesgo" (una revisión sospechó inconsistencia con el texto), agregar `whileTap` a los botones de registrar, validar el peso antes de habilitar el registro, animar el conteo de la racha, avisar visiblemente si falla la sincronización con Supabase.
- [ ] landing: pendiente de la repetición (el primer veredicto no es válido, screenshot roto por el bug del script).

## Dirección de Arte (Sesión 2 — CERRADA, cosa juzgada)
- FICHA-ARTE.md: existe y aprobada — 28/08/2026 (ver archivo en la raíz)
- ¿Hubo referencia visual del usuario?: NO → REFERENCIA-INVESTIGACIÓN (fusión Hevy/Fitbod/Strong, 16 PASO 0.2bis)
- Opción elegida: **C — "Cuaderno de Sala"** (el usuario detectó un bug de layout en el primer render — hueco vacío antes del botón de Rescate — ya corregido y reverificado)
- Resumen: fondo `#F5F1EA` · superficie `#FFFFFF` · texto `#211D17`/`#8A7F6A` · acento `#5C7A1F` (verde tinta, solo en progreso/CTA/check) · Display y Body: **Instrument Sans** única familia · radio 14-16px cards, 100px pills
- Personalidad: Sobrio (dominante) · Técnico · Cálido — voz: experto sobrio con calidez cercana
- Dispositivo ownable: tachado verde sobre ejercicio completado (estilo cuaderno real) + chips de meta con borde fino
- Modo: claro — derivado porque el avatar busca calma/certeza, no adrenalina (evita el reflejo "fitness = oscuro + neón")
- REGISTRO ANTI-REPETICIÓN: verde `#5C7A1F` + Instrument Sans vetados para el próximo proyecto del SO
- Página comparativa (evidencia, incluye las descartadas A/B): `docs/revisiones/direcciones-abc.html`

## Qué es esta app (3 líneas máximo)
App con dos rutas de nivel: Ruta Principiante (programa fijo de 90 días que dice exactamente qué hacer cada día) y Ruta Intermedio (rutinas efectivas con progresión para salir del estancamiento), ambas en gimnasios comerciales (Smart Fit/Bodytech), con alternativas de un toque cuando la máquina está ocupada. Monetización por suscripción (Freemium: semana 1 gratis, luego de pago).

> ⚠️ Corrección del usuario (28/08/2026): NO es un programa cerrado solo de 90 días para principiantes. Debe servir también a nivel intermedio que ya no es novato pero quiere rutinas efectivas y romper el estancamiento. Esto deja de ser un "desbloqueo automático al día 90" y pasa a ser una ruta propia desde el día 1 (el usuario elige su nivel al entrar).

## Promesa central
"GymEvo ayuda al joven de gimnasio comercial en LATAM —sea principiante o nivel intermedio— a construir un físico atlético y entrenar con la seguridad de un experto, sin depender de entrenadores que lo ignoran ni perder tiempo cuando las máquinas están ocupadas, mediante un mapa táctico (fijo de 90 días para principiantes, o de progresión para nivel intermedio) con un botón de alternativa en tiempo real."

## Reporte de validación (Sesión 1) — ya investigado por el usuario, no se repite
- Veredicto: Excelente oportunidad (validación ya hecha por el usuario con su propio prompt de investigación)
- Apps de referencia: Hevy (~$800K MRR, queja: exige armar rutina propia) · Fitbod (queja: IA cambia rutina a diario, sin progresión) · MadMuscles/BetterMe (queja: cobros ocultos, estafas) · Strong (queja: pantalla en blanco, asume experto)
- Lo que los usuarios odian de la competencia (nuestra oportunidad): 1) tener que armar su propia rutina desde cero, 2) que la IA cambie el plan cada día sin lógica ni progresión, 3) cobros ocultos/suscripciones no autorizadas
- Brecha LATAM confirmada: Sí — dolor de hacinamiento en gimnasios de cadena económica (Smart Fit, Bodytech) y desconfianza por estafas de apps fitness, sin solución local que dé plan fijo + alternativa en tiempo real
- Precio de referencia del mercado: Hevy $23.99 USD/año; propuesta propia $4.99/mes o $29.99/año

## Avatar y venta (Sesión 1)
- FICHA-AVATAR.md: existe y aprobada — 28/08/2026 (ver archivo en la raíz; todo el copy de venta se traza a ella)
- FICHA-MERCADO.md: existe — 28/08/2026 (ver archivo en la raíz; precio y trial documentados, plazos de garantía de Hotmart marcados como pendientes de verificar contra la pasarela real en Sesión 6)
- Avatar: Mateo, 26 años, oficinista, va a Smart Fit a las 6:30 PM (hora pico), paraliza frente a las máquinas, se avergüenza, termina haciendo caminadora y se va frustrado.
- Nivel de consciencia: 4/5 — Consciente de la Solución, quemado y escéptico (ya probó apps de IA, influencers, y fue estafado por apps de cobros ocultos)
- Dolor #1: terror a lesionarse por mala técnica + vergüenza de no saber qué hacer frente a las máquinas
- Deseo #1 (superficial): saber exactamente qué máquina usar y cómo. Deseo profundo: entrar con autoridad de experto, dejar de sentirse invisible/juzgado
- Objeciones clave: "¿Y si mi gimnasio no tiene la máquina o está siempre lleno?" · "¿Es otra app con cobros ocultos?" · "¿Qué pasa después del día 90?"
- Ángulo de venta ganador: "El entrenador que tu gimnasio te cobra pero nunca te da" — vende certeza y protección contra el caos, no "fitness"
- Diferenciador: No usa IA que cambia el plan al azar. Plan fijo de 90 días + Botón de Rescate para sustituir ejercicios al instante.
- Frases literales del cliente (para copy): "Se la pasan comadreando o coqueteando" · "El exceso de personas hace que sea imposible usar las máquinas" · "Sigue cambiándome de rutina casi a diario" · "Llevo meses y me veo igual" · "Entrenar sin estrategia"

## Estrategia de monetización (Sesión 1 — NO cambiar sin validar)
- Modelo: **Modelo 2 — Onboarding + Paywall de prueba** (decidido por el SO, matriz A-F de 02C: fitness/wellness B2C, uso diario, necesita HÁBITO). Reemplaza el "Freemium" que proponía el documento del usuario — el freemium puro es el modelo de PEOR conversión (2.1%) según 02C; el onboarding+trial es el que usan Duolingo/Cal AI/Noom con hasta +234% de conversión.
  Flujo: Onboarding personalizado (elige nivel + meta metabólica) → ve su plan del Día 1 generado para él → Paywall → trial de 7 días con acceso completo → pago.
- Trial: 7 días (equivalente a la "semana 1 gratis" del reporte, pero como trial estructurado con tarjeta, no como freemium indefinido) — aviso claro antes del cobro en el Día 6 (transparencia radical, responde directo a la objeción #2 del avatar: "¿cobro oculto?")
- Pricing: $4.99 USD/mes o $29.99 USD/año ≈ $2.49/mes mostrado como "2 meses gratis" (benchmark Hevy $23.99/año) — mantiene el precio que ya validó el usuario
- Riesgo de churn identificado: día 90 (fin del programa Principiante) — mitigación: transición fluida a la Ruta Intermedio (no es "desbloqueo especial", es la ruta que ya existe para seguir progresando)

## MVP — funciones núcleo (ajustado con la corrección del usuario, Sesión 1)
0. Selector de NIVEL al entrar: Principiante (plan fijo 90 días) vs Intermedio (rutina de progresión anti-estancamiento) — antes del selector de meta metabólica
1. Selector de ruta metabólica (Músculo / Pérdida de grasa) — aplica a ambos niveles
2. Plan diario con ilustraciones biomecánicas simples: fijo e inalterable en Principiante; con progresión de carga/variación en Intermedio
3. Botón "Alternativa de ejercicio" (Botón de Rescate) para sustituir máquinas ocupadas al instante — ambos niveles
4. Temporizador de descanso integrado entre series
5. Registro histórico de pesos/cargas — clave en Intermedio para medir progresión y romper estancamiento
- NO construir en el MVP: integraciones con redes sociales, IA generativa de rutinas, sincronización con smartwatches
- Primera victoria (<5 min): elegir nivel + meta metabólica y ver la rutina exacta del día, lista para iniciar cronómetro
- Pendiente de definir con el usuario más adelante (no bloquea el plan maestro): cómo pasa un Principiante a Intermedio (¿automático al día 90, o el usuario elige entrar directo a Intermedio si ya no es novato?)

## Sesión 5bis (29/08/2026) — Pulido de la app interna a pedido del usuario
- Interruptor "Descanso automático entre series" en `/app`: el usuario decide antes de entrenar si el temporizador arranca solo al registrar una serie, o si prefiere descansar a su ritmo (campo `descansoAutomatico` en `lib/routine.ts`, default true, retrocompatible con progreso guardado antes de este campo).
- Enlace "¿Cómo se hace?" en cada ejercicio: abre una búsqueda de YouTube (`[ejercicio] técnica correcta`) en pestaña nueva. Resuelve la duda de técnica sin producir contenido propio.
- Evaluadas y decididas explícitamente: (a) NO se agregó texto de técnica por ejercicio (el usuario solo pidió el interruptor + el enlace) — pendiente si se quiere más adelante; (b) NO se adapta nada por género — ninguna pantalla pregunta género hoy y la técnica correcta de un ejercicio no depende de eso; (c) ilustraciones/video PROPIOS por ejercicio quedan pendientes de decisión explícita del usuario — implican costo/tiempo real (diseño o licencias), no se construyen sin su OK.
- **Mascota — decidido con el usuario (29/08/2026), arte PENDIENTE**: sí lleva personaje ("muñequito con personalidad propia", no solo un ícono minimalista). El usuario genera los bocetos con IA de imagen por su cuenta; el brief que se le dio: personaje humano tipo "entrenador confiable" (NO animal, NO infantil/tierno — Mateo no quiere sentirse tratado como niño), paleta limitada a los tokens ya aprobados (fondo #F5F1EA, acento #5C7A1F, tinta #211D17), con el logo en la ropa, 4 poses: reposo/inicio, aviso de fin de descanso, inicio de ejercicio, fin de entrenamiento (celebración CONTENIDA, sin saltos ni confeti — coherente con la personalidad "Sobria" ya compilada). Pendiente: que el usuario traiga los bocetos para elegir uno antes de implementar nada en código.
- Mockup de referencia recibido (29/08/2026): clipart genérico de "Personal Trainer" (camiseta negra, tabla, silbato). Sirve de referencia de pose/personalidad, NO de paleta/estilo — se le indicó al usuario ajustar antes de generar sus bocetos: ropa en tono papel/crudo (no negro) con el acento #5C7A1F como único detalle, línea plana/editorial (no clipart 3D con degradados) para no chocar con la UI flat existente, y el logo de GymEvo en vez de texto "PERSONAL TRAINER".

## Gamificación y retención (loop implementado en Sesión 5)
- Loop del hábito (Hooked): Gatillo [hora de entreno que eligió en el onboarding] → Acción [marcar cada ejercicio de hoy como hecho] → Recompensa [tachado verde + racha que sube] → Inversión [historial de pesos acumulado — cuesta más abandonar mientras más tiene registrado]
- Mecánica elegida: racha diaria (sin XP ni ligas — el nicho y la personalidad "Sobria" de FICHA-ARTE no piden más capas)
- Primera victoria que celebra el onboarding (<60s): ver el plan del Día 1 generado con su meta real (ya construida en Sesión 4)
- Momentos emocionales (56) implementados: M0 ritual diario (pantalla `/app`) · M4 racha en riesgo (llama apagada, sin pánico ni rojo) · hito de racha 7/30/100 días (número que cuenta, sin confetti — coherente con el compilador de personalidad "Sobrio" de FICHA-ARTE)
- Notificaciones push: NO implementadas todavía (requieren backend/servicio push — Sesión 6)

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: Landing ✅ construida · Onboarding ✅ construido · Paywall ✅ construido · Login ✅ construido (mock) · App interna ✅ construida (sin backend) · Servicios externos: pendiente (Sesión 6)
- Ruta aprobada: `/` → `/onboarding` → `/onboarding/generando` → `/onboarding/plan` (vista previa Día 1) → `/paywall` → `/login` → `/app`

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: **Next.js App Router** (decidido el 28/08/2026) — el default del stack pineado (51): necesitamos SEO en la landing de ventas, API routes para el webhook de Hotmart, y auth. Vite queda descartado porque es solo para herramientas puras post-login sin landing pública.
- Offline-first ligero: el contenido del día (rutina + ilustraciones) se cachea localmente (localStorage/IndexedDB vía Service Worker simple) tras la primera carga, para que funcione aunque el sótano del gimnasio tenga mala señal (riesgo #3 del reporte). El registro de pesos se guarda local y sincroniza al recuperar conexión. No es una PWA offline completa — es cache-first del contenido estático del día.
- Auth: **Supabase Auth con magic link (sin contraseña)** — encaja con el modelo onboarding-first: el usuario hace todo el onboarding y ve su plan del Día 1 SIN cuenta; la cuenta se crea recién en el paywall/checkout (evita fricción temprana, responde a la objeción de "otra app que pide mis datos de una"). Sesión larga (30-90 días, default de Supabase) porque es una app de consumo diario.
- Base de datos: Supabase (Postgres) con RLS. Tablas propias del usuario (`profiles`, `workout_logs`, `user_progress`) llevan `user_id` + RLS estricta (cada quien ve solo lo suyo). El contenido de las rutinas (`exercises`, `routine_days`, `exercise_alternatives`) es catálogo fijo de solo-lectura pública, sin datos personales — no necesita RLS por usuario.

### Mapa de pantallas
```
/                    → Landing (venta)
/onboarding          → Selector de nivel (Principiante/Intermedio) + meta (Músculo/Grasa) — sin cuenta
/paywall             → Trial 7 días + oferta $4.99/mes o $29.99/año
/login               → Magic link (se crea la cuenta aquí, tras decidir pagar)
/app                 → Plan del día (protagonista) + botón de Rescate + temporizador
/app/historial       → Registro de pesos/cargas por ejercicio
/app/perfil          → Nivel actual, meta, plan, cerrar sesión
```
Total: 6 pantallas únicas (dentro del límite de 8).

### Modelo de datos (resumen — el SQL exacto se escribe en Sesión 6/Deploy)
- `profiles`: id (FK auth.users), nivel (principiante/intermedio), meta (musculo/grasa), dia_actual, fecha_inicio, racha
- `exercises` (catálogo): id, nombre, grupo_muscular, ilustracion_url, tipo (máquina/peso libre)
- `exercise_alternatives` (catálogo): exercise_id → alternative_exercise_id (para el Botón de Rescate)
- `routine_days` (catálogo, contenido curado por nosotros): nivel, meta, numero_dia, lista de ejercicios+series+reps+descanso
- `workout_logs` (usuario): user_id, exercise_id, fecha, peso, reps, series
- `user_progress` (usuario): user_id, racha_actual, ultimo_dia_completado, hitos desbloqueados

## Sesiones completadas ✅
- Sesión 1 — Validación + avatar + monetización (02C) + framework + arquitectura + modelo de datos + auth — cerrada 28/08/2026
- Sesión 2 — Identidad visual: FICHA-ARTE.md cerrada, opción C "Cuaderno de Sala" — cerrada 28/08/2026
- Sesión 3 — Página de ventas: Next.js scaffolded, kit de landing (plantillas-codigo/landing) copiado a components/landing, tokens.css tematizado con FICHA-ARTE, copy marcado en docs/copy/landing.md, 10 secciones canónicas compuestas en app/page.tsx, páginas legales creadas (/privacidad /terminos /reembolsos) — cerrada 28/08/2026
- Sesión 4 — Onboarding + Paywall + Login: `/onboarding` (6 pasos: nivel, meta, frustración con eco de dolores reales, reconocimiento personalizado por objeción, horario, compromiso de días/semana con slider) → `/onboarding/generando` (loading persuasivo 4.8s con líneas reales) → `/paywall` (timeline de trial Hoy/Día 6/Día 7, planes anual+mensual, CTA, trust row) → `/login` (magic link mock con estados enviando/enviado/error). Probado de punta a punta en navegador — cerrada 28/08/2026
- Sesión 4bis (29/08/2026) — Onboarding mejorado tras comparar contra un análisis externo (Gemini) sobre apps de fitness/wellness (Verv): (1) NUEVA pantalla `/onboarding/plan` — vista previa REAL del Día 1 entre "generando" y el paywall (antes faltaba: pedíamos pago sin mostrar el resultado, contra nuestra propia doctrina de Cal AI/Duolingo). Muestra los ejercicios reales del Día 1 + el resto de la semana bloqueado con honestidad (sin blur falso). (2) Se agregó **tempo de ejecución** (ej. "3-1-1" seg) a cada ejercicio en `lib/routine.ts` — cumple la promesa original de la idea validada ("a qué velocidad exacta hacerlo") que nunca se había implementado; visible en `/app` y en la vista previa. Decisiones rechazadas del análisis externo, con razón: NO se agregan reseñas/testimonios (fabricarlos viola la ética del sistema y el diferenciador #1 del avatar) NI datos biométricos edad/peso/altura (ninguna función los usa todavía; sería fricción decorativa). NO se cambia la barra de progreso a puntos (el archivo 50 lo prohíbe explícitamente).
- Sesión 3bis (29/08/2026) — Elevación de la landing para conversión/escaneabilidad: headline nuevo ("Nunca más sin saber qué hacer en el gym", eco literal del dolor #1 de FICHA-AVATAR) · CTA repetido tras la Solución y tras la Garantía (antes solo estaba en hero/mid-page/oferta) · garantía corregida para reflejar los 14 días reales (7 trial + 7 Hotmart, FICHA-MERCADO.md) en vez de decir "7 días" de forma ambigua. Auditoría de escaneabilidad a 375px pasada — ver tabla abajo.
- Sesión 5 — App interna: shell de 3 secciones (`/app` Plan del día, `/app/historial`, `/app/perfil`) con tab bar inferior. Plan del día = M0 "ritual diario" (56): split de 4 días (Empuje/Tirón/Piernas/Full) según catálogo de 20 ejercicios con alternativas, registro de peso por serie, Botón de Rescate (swap a alternativa), temporizador de descanso, tachado verde al completar (dispositivo ownable de FICHA-ARTE), estado M4 "racha en riesgo" (llama apagada, sin pánico) y celebración de hito de racha (7/30/100 días, estilo sobrio sin confetti). Progreso en localStorage (`lib/routine.ts`) — cerrada 28/08/2026

## Sesión en progreso 🔧
Sesión 6 (integraciones reales y seguridad) — en curso.
- Pre-flight P1 completado: se encontraron y corrigieron 2 bugs reales que el proyecto arrastraba sin que el usuario lo pidiera (no se buscaban, los sacó a la luz `npx eslint .` que no se había corrido explícito antes): (a) `<a href="/">` en vez de `<Link>` en app/login y Hero.tsx (regla next/next), (b) un bug de hydration que YO MISMO introduje al intentar arreglar el lint `react-hooks/set-state-in-effect` (cambié `useState(null)+useEffect` a `useState(() => leerX())` en 5 archivos — pasaba el lint pero rompía en runtime porque sessionStorage/localStorage no existen en el server). Revertido a `useState(null)+useEffect` + comentario `eslint-disable-next-line` puesto justo encima de la línea exacta del `setState`. Verificado en navegador: 0 errores de hydration en las 5 pantallas afectadas.
- `eslint.config.mjs`: se agregó `plantillas-codigo/**` y `docs/**` a `globalIgnores` (el kit vendored del SO no debe lintearse, igual que ya excluía tsconfig.json).
- `components/landing/Hero.tsx`: primera vez que se toca este archivo del kit → el lint de diseño exigió convertir valores de píxel arbitrarios a clases Tailwind por defecto (max-w-*, text-*) — hecho.
- **GitHub: ✅ conectado** (31/08/2026) — repo `oscarmint/gymevo`, push exitoso.
- **Vercel: ✅ conectado y verificado** (31/08/2026) — dominio público `https://gymevo-eta.vercel.app`, landing carga sin errores de consola.
- **Supabase: ✅ código y tablas listos** (31/08/2026) — proyecto, código de conexión, tablas `profiles`/`workout_logs` con RLS (aplicadas directo por MCP), y `/login` con magic link real. Commit+push hechos.
- ✅ **Incidente resuelto** (31/08/2026): tras el push, `gymevo-eta.vercel.app` mostró "Internal Server Error" (`Invalid supabaseUrl` en el proxy, por un valor mal pegado en `NEXT_PUBLIC_SUPABASE_URL` en Vercel). Usuario corrigió la variable con el valor exacto confirmado por Supabase MCP y volvió a desplegar. Verificado en navegador y con `get_runtime_errors` (Vercel MCP): 0 errores en `/`, `/login`, `/app`.
- Nota técnica: se descubrió acceso directo a Supabase y Vercel vía MCP en esta sesión — se puede aplicar SQL, revisar tablas y auditar seguridad sin pedirle al usuario que copie/pegue nada en el panel. Usar esto de ahora en adelante en vez de pedirle pasos manuales cuando sea posible.
- Pendiente de esta sesión: dominio propio → Hotmart → Resend (un pedido a la vez, Protocolo Cero Secretos en Chat — nunca pedir que pegue valores secretos en el chat).

## Próximas sesiones 📋
- Sesión 6: integraciones reales (Supabase, Hotmart, dominio) y seguridad
- Sesión 7: testing, animaciones, pulido y rigor de entrega

## Problemas conocidos ⚠️
- Visual del hero y los 4 frames del carrusel ("La app por dentro") son PLACEHOLDERS honestos (marco punteado + ilustración/nombre de pantalla) — se reemplazan por screenshots reales cuando la app interna exista (Sesión 5). No declarar la landing 100% terminada hasta ese reemplazo (regla del 19).
- `scripts/audit-conversion.sh` marca varios "críticos" que son falsos positivos del propio script contra los archivos DEL KIT del SO (comentarios de código y className de Tailwind mal contados como "copy") — verificado a mano; no requieren corrección. También marca "cero hairline degradé" y "fondo plano" como críticos pese a que `Hero.tsx` sí trae el mesh radial-gradient de fondo y `Oferta.tsx` sí usa `<Hairline emphasis>` en el plan anual — confirmado leyendo el código; falso negativo del script (no reconoce estilos inline multilínea). Pendiente: no se corrió aún el subagente `revisor-visual` (rúbricas /40 y /20) ni `scripts/audit-diseno.sh` — eso es parte del cierre de Sesión 7 (pulido y rigor de entrega) según la secuencia maestra, no bloquea seguir a Sesión 4.
- Dominio real de la app aún no existe — el email de soporte usa `soporte@gymevo.app` como placeholder hasta que el usuario compre el dominio (Sesión 6, servicios externos).
- Onboarding/paywall/login (Sesión 4) son UI real y funcional pero sin backend: las respuestas viven en sessionStorage (no hay cuenta todavía, según el modelo onboarding-first), el botón de pago del paywall navega a /login en vez de abrir el checkout real de Hotmart, y el login no envía emails de verdad. Todo esto se conecta a Supabase Auth + Hotmart real en la Sesión 6 — está señalado con comentarios "Sesión 6" en el código (lib/onboarding.ts, app/paywall/page.tsx, app/login/page.tsx).
- Paywall construido como página única (no la secuencia de 3 pantallas que recomienda 50 §C0 para +37% de conversión) — decisión de alcance para esta sesión; se puede partir en 3 pasos más adelante si los datos lo justifican.
- App interna (Sesión 5) sin backend todavía: el progreso (racha, día, historial de pesos) vive en localStorage del navegador, se pierde si el usuario cambia de dispositivo o borra datos. Sesión 6 lo mueve a las tablas `workout_logs`/`user_progress` de Supabase.
- Las ilustraciones de ejercicios son solo texto (nombre + series/reps), sin dibujo biomecánico — el documento original de la idea pedía "ilustraciones anatómicas sencillas". Pendiente de diseño gráfico si se quiere esa capa visual; no es un placeholder deshonesto (no finge tener algo que no tiene), pero es una reducción de alcance visual a anotar.
- Corregido durante la Sesión 5: un bug real de condición de carrera si el usuario tocaba "Registrar" en dos ejercicios muy rápido (el segundo tap sobrescribía el primero) — se arregló usando actualización funcional de estado (setState con función, no valor directo). Verificado con clics simultáneos simulados.
- **veredicto:paywall** — falta el veredicto independiente del subagente `revisor-visual` (docs/revisiones/paywall-veredicto.md + screenshot docs/revisiones/paywall-375.png, rúbricas Usabilidad ≥36/40 y Craft ≥16/20). Autoevaluarse no cuenta como evidencia (Regla de Oro 7).
- **veredicto:landing** — mismo pendiente que paywall: falta docs/revisiones/landing-veredicto.md + docs/revisiones/landing-375.png del subagente `revisor-visual`. Verificado en navegador que la landing carga y funciona (Sesión 6, deploy a Vercel), pero eso NO sustituye el veredicto de diseño con rúbrica — autoevaluarse no cuenta como evidencia (Regla de Oro 7).
- **veredicto:onboarding** — mismo pendiente: falta docs/revisiones/onboarding-veredicto.md + docs/revisiones/onboarding-375.png del subagente `revisor-visual`.
- Las 3 pantallas del dinero (landing, paywall, onboarding) se resuelven juntas en Sesión 7 (testing, pulido y rigor de entrega), que es donde la secuencia maestra ubica esta revisión — no antes.
- **garantía / FICHA-MERCADO** — FICHA-MERCADO.md ya existe (creada 28/08/2026) con Prueba elegida: 7 días y Garantía elegida: 14 días (14>7, cumple la regla dura). PERO los plazos reales de garantía de Hotmart (desde cuándo cuenta, máximo configurable) siguen **sin verificar contra la pasarela real**, porque la cuenta de Hotmart todavía no existe (creación de cuenta es tarea del usuario en Sesión 6). El copy publicado (landing/paywall/FAQ) usa estos plazos como el PLAN a implementar, no como algo ya confirmado en el panel — antes de lanzar de verdad, hay que crear la cuenta, configurar el producto con estos plazos exactos, y volver a llenar los campos "NO ENCONTRADO" de FICHA-MERCADO.md con el dato real.

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguna acción pendiente por ahora — sigo yo con la Sesión 4 (onboarding, paywall, login)

## Notas para la próxima sesión
- El usuario llegó con el "RESUMEN FINAL — IDEA VALIDADA PARA CONSTRUIR" completo (prompt de investigación externo). No se debe re-validar la idea ni proponer alternativas.
- Nombre FINAL confirmado por el usuario: **GymEvo** (28/08/2026) — "Método Cero" queda solo como referencia interna del documento original, no se usa en producto ni copy.
