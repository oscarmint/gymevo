# ESTADO — GymEvo (nombre tentativo: Método Cero)
Última actualización: 2026-08-28 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: RESUMEN FINAL — IDEA VALIDADA leído y guardado como reporte de validación / Siguiente acción exacta: preguntar referencias visuales (B4) y luego presentar Plan Maestro (B5)

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

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: pendiente de iniciar — próximo paso: referencias visuales (B4) y Plan Maestro (B5)
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: **Next.js App Router** (decidido el 28/08/2026) — el default del stack pineado (51): necesitamos SEO en la landing de ventas, API routes para el webhook de Hotmart, y auth. Vite queda descartado porque es solo para herramientas puras post-login sin landing pública.
- Arquitectura offline-first a evaluar en Sesión 1 (04-ARQUITECTURA) por el riesgo de mala señal en sótanos de gimnasio (riesgo #3 del reporte del usuario)
- [pendiente de completar en el resto de Sesión 1: base de datos, auth]

## Sesiones completadas ✅
(ninguna aún)

## Sesión en progreso 🔧
- Sesión 1 — Validación ya recibida del usuario. Falta: referencias visuales, avatar/monetización formal (02C), arquitectura (04), base de datos (25), auth (26)

## Próximas sesiones 📋
- Sesión 1 (continuar): referencias visuales + Plan Maestro completo
- Sesión 2: identidad visual y sistema de diseño

## Problemas conocidos ⚠️
(ninguno aún)

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Elegir referencias visuales (B4) — ver siguiente mensaje

## Notas para la próxima sesión
- El usuario llegó con el "RESUMEN FINAL — IDEA VALIDADA PARA CONSTRUIR" completo (prompt de investigación externo). No se debe re-validar la idea ni proponer alternativas.
- Nombre tentativo doble: "Método Cero" (documento) y "GymEvo" (usado en el ángulo de venta) — falta decidir el nombre final con el usuario en la sesión de identidad visual.
