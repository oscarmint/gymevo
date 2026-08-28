# ESTADO — GymEvo (nombre tentativo: Método Cero)
Última actualización: 2026-08-28 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: app interna (Plan del día + Historial + Perfil) construida, probada en el navegador y con un bug de concurrencia real corregido (ver Problemas conocidos) / Siguiente acción exacta: pedir OK para pasar a Sesión 6 (integraciones reales y seguridad)

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

## Gamificación y retención (loop implementado en Sesión 5)
- Loop del hábito (Hooked): Gatillo [hora de entreno que eligió en el onboarding] → Acción [marcar cada ejercicio de hoy como hecho] → Recompensa [tachado verde + racha que sube] → Inversión [historial de pesos acumulado — cuesta más abandonar mientras más tiene registrado]
- Mecánica elegida: racha diaria (sin XP ni ligas — el nicho y la personalidad "Sobria" de FICHA-ARTE no piden más capas)
- Primera victoria que celebra el onboarding (<60s): ver el plan del Día 1 generado con su meta real (ya construida en Sesión 4)
- Momentos emocionales (56) implementados: M0 ritual diario (pantalla `/app`) · M4 racha en riesgo (llama apagada, sin pánico ni rojo) · hito de racha 7/30/100 días (número que cuenta, sin confetti — coherente con el compilador de personalidad "Sobrio" de FICHA-ARTE)
- Notificaciones push: NO implementadas todavía (requieren backend/servicio push — Sesión 6)

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: Landing ✅ construida · Onboarding ✅ construido · Paywall ✅ construido · Login ✅ construido (mock) · App interna ✅ construida (sin backend) · Servicios externos: pendiente (Sesión 6)
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`

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
- Sesión 5 — App interna: shell de 3 secciones (`/app` Plan del día, `/app/historial`, `/app/perfil`) con tab bar inferior. Plan del día = M0 "ritual diario" (56): split de 4 días (Empuje/Tirón/Piernas/Full) según catálogo de 20 ejercicios con alternativas, registro de peso por serie, Botón de Rescate (swap a alternativa), temporizador de descanso, tachado verde al completar (dispositivo ownable de FICHA-ARTE), estado M4 "racha en riesgo" (llama apagada, sin pánico) y celebración de hito de racha (7/30/100 días, estilo sobrio sin confetti). Progreso en localStorage (`lib/routine.ts`) — cerrada 28/08/2026

## Sesión en progreso 🔧
(ninguna — esperando OK del usuario para arrancar Sesión 6)

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

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguna acción pendiente por ahora — sigo yo con la Sesión 4 (onboarding, paywall, login)

## Notas para la próxima sesión
- El usuario llegó con el "RESUMEN FINAL — IDEA VALIDADA PARA CONSTRUIR" completo (prompt de investigación externo). No se debe re-validar la idea ni proponer alternativas.
- Nombre FINAL confirmado por el usuario: **GymEvo** (28/08/2026) — "Método Cero" queda solo como referencia interna del documento original, no se usa en producto ni copy.
