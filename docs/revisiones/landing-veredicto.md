# VEREDICTO revisor-visual — landing
Fecha: 2026-09-30 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1. [entre FAQ y footer, ~CtaFinal] sección de fondo claro sin contenido legible en el screenshot (posible fallo de contraste/reveal real, no solo de mi captura anterior) → verificar en producción que h2/CTA/PS de CtaFinal.tsx se vean con opacidad 1 y contraste AA, no solo tras animación. 2. [Oferta → precios, ui.tsx L21-25] PrecioAnimado quedó estático a propósito (comentario del código) rompiendo la baseline obligatoria de conteo animado en números héroe → resolver el bug de parpadeo con key/AnimatePresence en vez de eliminar la animación. 3. [página completa, ~8800px] header sin acceso directo a Precios/FAQ (decisión documentada, no descuido) → igual conviene una micro-nav o ancla sticky para quien ya decidió comprar, evitar forzar scroll completo. 4. [Oferta → stack de valor, Oferta.tsx L203] línea "Fuente: ficha oficial de Fitbod..." en text-tertiary 12px, casi invisible en el screenshot pese a respaldar el claim comparativo del precio → subir a text-secondary o acercarla visualmente al total tachado. 5. [heurística 7, toda la página] cero atajos/flexibilidad para el usuario avanzado (aceptable en landing, pero puntúa bajo por rúbrica) → sin acción requerida, solo anotado.
