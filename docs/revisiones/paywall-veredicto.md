# VEREDICTO revisor-visual — Paywall
Fecha: 2026-09-28 00:00
Screenshot: docs/revisiones/paywall-375.png (docs/revisiones/paywall-375-completo.png)
Usabilidad: 27/40
Craft: 15/20
Copy (si vende): 16/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

## Detalle Usabilidad /40
h1 (estado sistema): 3 — spinner "Te llevamos a Hotmart", alerta de error de redirección con qué-pasó+qué-hacer, feedback de meneo en X antes de tiempo.
h2 (lenguaje usuario): 3 — copy en el léxico exacto del avatar ("Máquina ocupada", "Botón de Rescate", "Prensa ocupada"), cero jerga.
h3 (control y libertad, código): 3 — X para cerrar (con retraso justificado), "Cancelar" durante redirección, "Ahora no" al fondo.
h4 (consistencia): 3 — PlanCard y botones reutilizan el mismo sistema (boton-3d, radius-card) en toda la pantalla.
h5 (prevención de errores): 1 — falta la tarjeta del plan Mensual ($4.99) en el render; el usuario no puede verificar ni elegir la opción más barata antes de comprometerse con Anual/Semestral.
h6 (reconocer vs recordar): 2 — con solo 2 de 3 planes visibles, el usuario tiene que "confiar" en que hay más opciones en vez de verlas; rompe la promesa de transparencia de precio del avatar (FICHA-AVATAR, deseo 4 y objeción 4).
h7 (flexibilidad, código): 3 — recuerda el plan elegido en localStorage, ofrece ruta alterna "Prefiero pagar ahora".
h8 (estético/minimalista): 3 — jerarquía limpia, pero 2 CTAs de peso visual similar a centímetros uno del otro.
h9 (errores con solución): 3 — bloque de error de redirección con texto claro y enlace directo.
h10 (ayuda contextual): 3 — FAQ colapsable "Antes de empezar", contacto de soporte visible al fondo.

Gate de carga cognitiva: pasa (pocas opciones visibles, 1 acción primaria clara, texto corto) — el problema no es sobrecarga sino un plan FALTANTE.

## Detalle Craft /20
Jerarquía: 3 — 4 niveles nítidos (kicker → h1 con acento → subtítulo → labels de plan), máx 3 tamaños.
Profundidad: 3 — fondo con gradiente radial propio, superficie elevada en tarjetas (boton-3d/superficie-3d), CTA sticky con blur.
Identidad: 3 — dispositivo ownable real (demo "Prensa ocupada → Sentadilla guiada" con tachado verde), paleta no coincide con los clones vetados (papel+tinta verde ni pizarra+latón).
Movimiento: 3 (código) — stagger de entrada por bloques, whileTap 0.97, layoutId en el anillo de selección, AnimatePresence en FAQ, useReducedMotion respetado. El precio NO cuenta desde 0 (decisión explícita documentada, aceptable — no es el "número héroe" de un dashboard).
Encaje óptico: 3 — radios consistentes, padding simétrico, precio y badge alineados; sin desencajes visibles.

## Detalle Copy /20
Idea única dominante: 4 — todo gira en el mecanismo bautizado "Botón de Rescate", coherente en hero, demo y contexto.
Especificidad y prueba: 3 — cifras concretas (ahorras 50%/33%, 12 cuotas, fechas de acceso), demo visual del mecanismo; sin testimonios inventados (correcto, ficha dice que no hay prueba social día-1 todavía).
Emoción/dolor real: 4 — "Máquina ocupada, ¿y ahora qué?" es la escena EXACTA del dolor #3 de la ficha, no un dolor genérico.
Claridad de oferta: 2 — con el plan Mensual ausente del render, la oferta de "3 planes" que el negocio define no llega completa al usuario; no queda obvio que existe una entrada a $4.99, y el stack de opciones se percibe incompleto. Baja el eje aunque el resto del copy sea preciso.
Dirección a una acción: 3 — un solo tipo de acción primaria repetida (empezar prueba / activar plan), aunque "Prefiero pagar ahora" le resta algo de nitidez al tener peso visual similar.

Sub-checks binarios: garantía nombrada con plazo cerca del CTA de pago — CUMPLE ("Garantía del Primer Plan Claro: 7 días", junto a "Prefiero pagar ahora"). Message-match: no verificable (sin creativo de origen entregado).

## Top defectos
1. [Sección de precios, entre la tarjeta Semestral y el botón "Empezar mis 7 días gratis"] Falta por completo la tarjeta del plan Mensual ($4.99, 1 mes) — el código mapea 3 planes (anual/semestral/mensual) pero el render solo muestra 2 → revisar por qué `PlanCard('mensual')` no pinta (verificar el array `PLANES`, el `.map`, o algún filtro/overflow que la esté recortando) y confirmar que las 3 tarjetas aparezcan siempre en ambos screenshots.
2. [Toda la sección de precios] Con el plan de entrada oculto, la promesa de transparencia de precio del avatar ("quiero una app honesta que me cobre lo justo") no se puede verificar en pantalla — el usuario solo ve las 2 opciones más caras, sesgando la elección sin que él lo note → mismo fix que el defecto 1.
3. [Debajo del CTA principal, botón "Prefiero pagar ahora · $29.99 USD"] Tiene casi el mismo peso visual (borde grueso, texto bold, ancho completo) que el CTA primario justo arriba → bajar su contraste/grosor de borde para que se perciba con claridad como acción secundaria.
4. [Zona entre "Garantía del Primer Plan Claro" y "Antes de empezar", screenshot completo ~y:1000-1150] Salto de espacio en blanco notorio antes del acordeón FAQ cerrado → revisar el `pt-5`/`mt-8` del contenedor y compactar si no hay contenido intermedio.
5. [Pie de página, "Ahora no · ¿Ya pagaste? Escríbenos"] Texto en gris secundario y tamaño chico pese a resolver el miedo #2 del avatar ("¿es otra app con cobros ocultos?") — podría llevar algo más de peso visual dado lo sensible que es esa objeción para este avatar.
