# VEREDICTO revisor-visual — Paywall
Fecha: 2026-09-30 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

## Nota sobre el screenshot
Se confirma el artefacto conocido de captura `fullPage` de Playwright con elemento `sticky`
(el CTA principal): la tarjeta "Mensual" existe en el DOM (verificado por el propio equipo,
`innerText.includes('Mensual') === true`) pero el render largo la tapa. NO se cuenta como
defecto — así lo indica el brief y así se puntúa en esta ronda. Sí se deja como advertencia de
proceso (ver defecto #2): recomendable verificar con captura por secciones o scroll real en
dispositivo antes de dar por buena cualquier futura regresión en esa zona, porque este mismo
artefacto podría esconder un bug real el día que exista uno.

## Qué cambió desde ronda 7 (verificado en código, app/paywall/page.tsx)
1. "Prefiero pagar ahora" (línea 389-397): pasó de botón con caja a texto plano gris terciario,
   sin borde, con subrayado solo en hover — ya NO compite visualmente con el CTA principal.
   Corrige el defecto #3 de ronda 7.
2. Margen antes de "Antes de empezar" (línea 436): `mt-8` → `mt-6`. Cambio real pero pequeño
   (-8px); el salto de espacio grande que se ve en el screenshot de esta ronda es,
   con alta probabilidad, el mismo artefacto de captura del sticky (24-32px de margen en código
   no explican ~150px de hueco visual) — no se penaliza como defecto de diseño, pero tampoco se
   puede dar 100% por resuelto sin una captura limpia.

## Detalle Usabilidad /40
h1 (estado sistema): 3 — spinner "Te llevamos a Hotmart", alerta de error de redirección con qué-pasó+qué-hacer, feedback de meneo en X antes de tiempo. Sin cambios.
h2 (lenguaje usuario): 3 — copy en el léxico exacto del avatar ("Máquina ocupada", "Botón de Rescate", "Prensa ocupada"), cero jerga.
h3 (control y libertad, código): 3 — X para cerrar (con retraso justificado), "Cancelar" durante redirección, "Ahora no" al fondo.
h4 (consistencia): 3 — PlanCard y botones reutilizan el mismo sistema (boton-3d, radius-card) en toda la pantalla.
h5 (prevención de errores): 3 — con el plan Mensual descartado como falso defecto, no queda ningún bloqueo real: selección deshabilitada durante redirect, sin inputs libres que validar. Sube de 1 a 3 respecto a ronda 7 (el 1 anterior asumía el bug de render como real).
h6 (reconocer vs recordar): 3 — los 3 planes están disponibles para elegir sin tener que recordar nada de otra pantalla; localStorage recuerda la elección entre visitas. Sube de 2 a 3 por la misma razón que h5.
h7 (flexibilidad, código): 3 — recuerda el plan elegido en localStorage, ofrece ruta alterna "Prefiero pagar ahora" ahora con el peso correcto.
h8 (estético/minimalista): 3 — jerarquía de CTA ya corregida (un solo botón domina), pero el bloque posterior al CTA (nota de trial, "Prefiero pagar ahora", candado, garantía) son 4 líneas de microcopy consecutivas con pesos muy similares entre sí — un ojo entrenado nota que "candado" y "garantía" podrían fusionarse o diferenciarse mejor.
h9 (errores con solución): 3 — bloque de error de redirección con texto claro y enlace directo.
h10 (ayuda contextual): 3 — FAQ colapsable "Antes de empezar", contacto de soporte visible al fondo (aunque con poco peso, ver defecto #1).

Gate de carga cognitiva: pasa (≤5 opciones de plan visibles en el código, 1 acción primaria clara, texto corto por bloque, nada interactivo sin función).

## Detalle Craft /20
Jerarquía: 3 — 4 niveles nítidos (kicker → h1 con acento → subtítulo → labels de plan); el CTA secundario aligerado ayuda pero no cambia la jerarquía tipográfica de fondo.
Profundidad: 3 — fondo con gradiente radial propio, superficie elevada en tarjetas (boton-3d/superficie-3d), CTA sticky con blur. Sin cambios.
Identidad: 3 — dispositivo ownable real (demo "Prensa ocupada → Sentadilla guiada" con tachado verde), paleta verde eléctrico + Poppins NO coincide con los clones vetados (papel+tinta verde+Petrona/Karla ni pizarra+latón+Archivo) — pasa el test anti-clon.
Movimiento: 3 (código) — stagger de entrada por bloques, whileTap 0.97, layoutId en el anillo de selección, AnimatePresence en FAQ, useReducedMotion respetado en el botón X. Sin cambios.
Encaje óptico: 3 — radios consistentes, padding simétrico, precio y badge alineados. El CTA héroe cumple las 4 anclas (contraste alto verde/fondo oscuro, whileTap definido, nunca disabled salvo durante redirect en curso, h-14 ancho completo ≥48px).

## Detalle Copy /20
Idea única dominante: 4 — todo gira en el mecanismo bautizado "Botón de Rescate", coherente en hero, demo y contexto.
Especificidad y prueba: 3 — cifras concretas (ahorras 50%/33%, 12 cuotas, fechas de acceso), demo visual del mecanismo; sin testimonios inventados (correcto según ficha, sin prueba social día-1 todavía).
Emoción/dolor real: 4 — "Máquina ocupada, ¿y ahora qué?" es la escena EXACTA del dolor #3 de la ficha, no un dolor genérico.
Claridad de oferta: 3 — con el plan Mensual confirmado como presente (no un bug real), el stack de 3 planes con precio, equivalencia mensual, ahorro %, fechas de acceso y garantía nombrada cierra el ciclo de "qué recibo / cuánto cuesta / qué me protege" con claridad. Sube de 2 a 3 respecto a ronda 7 (el 2 anterior penalizaba el falso defecto).
Dirección a una acción: 4 — un solo tipo de acción primaria repetida ("Empezar mis 7 días gratis" / "Activar mi plan"), y ahora "Prefiero pagar ahora" quedó claramente subordinado en peso visual — ya no compite, cumple el criterio de UN tipo de acción dominante con alternativa discreta en 1ª persona.

Sub-checks binarios: garantía nombrada con plazo cerca del CTA de pago — CUMPLE ("Garantía del Primer Plan Claro: 7 días", junto a "Prefiero pagar ahora"). Message-match: no verificable (sin creativo de origen entregado).

## Top defectos
1. [Pie de página, "Ahora no · ¿Ya pagaste? Escríbenos"] Responde a la objeción #2 del avatar (miedo a cobros ocultos/estafa — "Es una estafa... te realizan una suscripción obligatoria") pero tiene el mismo peso visual chico y gris que cualquier link secundario sin importancia → darle algo más de contraste o un ícono (sobre/soporte) para que se lea como salida de confianza, no como letra pequeña perdida.
2. [Sección de precios completa] El artefacto de captura fullPage+sticky que oculta la tarjeta Mensual en este screenshot es un riesgo de PROCESO, no de diseño: si mañana hay un bug real ahí, esta forma de capturar no lo va a mostrar → para las próximas rondas, agregar una captura adicional sin fullPage (o con scroll incremental) específica de la sección de precios, para no depender de inspeccionar el DOM a mano cada vez.
3. [Bloque entre el CTA y "Antes de empezar": nota de trial, "Prefiero pagar ahora", candado de pago, garantía] 4 líneas de microcopy consecutivas con jerarquía muy plana entre sí (todas grises, tamaños similares) — un usuario que sí lee todo ese bloque no tiene pistas visuales de cuál es más importante → diferenciar candado+garantía en una sola línea compacta, o usar un tono/peso distinto para la garantía (es la respuesta a la objeción más cara del avatar).
4. [Acordeón "Antes de empezar", margen superior] Verificar en dispositivo real (no en captura fullPage) que el `mt-6` no deje un salto de espacio visualmente desproporcionado como el que aparenta el screenshot actual — si el hueco real persiste más allá de lo que explica el margen de código, hay otro elemento invisible ocupando espacio.
5. [General, h8/estética] La pantalla acumula 5 bloques de confianza distintos bajo el CTA (nota trial, pagar ahora, candado, garantía, FAQ, footer) — cada uno se justifica por una objeción puntual del avatar, pero el conjunto empieza a sentirse como "pared de reaseguros" más que como una decisión limpia → considerar agrupar candado+garantía+FAQ en una sola superficie visual (card) en vez de líneas sueltas apiladas.
