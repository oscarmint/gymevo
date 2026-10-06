# VEREDICTO revisor-visual — onboarding (Tu Día 1, /onboarding/plan) — ronda 11
Fecha: 2026-10-06 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 27/40
Craft: 13/20
Copy (si vende): 12/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Microcopy bajo CTA] Oferta contradictoria y sin nombre: "7 días gratis, sin tarjeta" + "pago único desde $4.99 USD" (¿único o desde?) y la garantía aparece como "garantía de 7 días" sin el nombre "Primer Plan Claro" (falla el sub-check binario de garantía nombrada). Fix: una línea con precio exacto y garantía nombrada, ej. "7 días gratis sin tarjeta · después $4.99 USD único · Garantía Primer Plan Claro".
2. [Titular y jerarquía] El h1 es de 24px y no hay héroe: título, cards de ejercicio (16px semibold) y CTA pesan casi igual; "Día 1" en acento ayuda pero no crea 4 niveles. Fix: subir el h1 a 32-36px/800 y bajar el peso de las cards.
3. [Zona inferior, bajo el CTA fijo] Segundo CTA ("Desbloquea tu semana completa") sobre cards borrosas, con el mismo destino que el CTA principal, más el botón sticky que tapa la 5ª card y el botón "+N ejercicios". Fix: quitar el pill del blur (o dejarlo como texto) y dar al sticky un fade/padding para que no corte contenido.
4. [Movimiento] Solo stagger y tap scale en el botón de rescate; el CTA héroe no tiene whileTap en el código (depende de .boton-3d), el Botón de Rescate no celebra el cambio y no hay transición de salida. Fix: whileTap 0.97 en el CTA y un micro-feedback (pulso/check) al cambiar de ejercicio.
5. [Control y errores] No hay volver/salir hacia el onboarding ni estado de error o fallo de lectura (redirige en silencio). Fix: enlace "Cambiar mis respuestas" visible y un mensaje con acción si faltan respuestas.

Notas de verificación:
- Cambios de la ronda verificados: pista del Botón de Rescate arriba de la lista (sí); "Día 1" en acento (sí); radiales de fondo (en el código; en el screenshot casi imperceptibles); MotionConfig reducedMotion="user" (sí); microcopy en 2 líneas con precio (sí).
- Gate de carga cognitiva: 0-1 fallas (5 ítems visibles, 1 CTA primario); aprobado.
- Craft detalle: jerarquía 2, profundidad 3, identidad 3, movimiento 2, encaje 3.
- Usabilidad detalle: h1:3 h2:3 h3:2 h4:3 h5:3 h6:3 h7:2 h8:3 h9:2 h10:3.
- Copy detalle: idea 3, especificidad 2, emoción 2, oferta 2, acción 3. FICHA-MERCADO.md no se verificó con este revisor; el precio "$4.99 USD" frente a "/mes" en FICHA-AVATAR debe conciliarse.
- Paleta (#12161c, #97d131) y Poppins coinciden con FICHA-ARTE.
