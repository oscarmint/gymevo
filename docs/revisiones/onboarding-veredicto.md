# VEREDICTO revisor-visual — onboarding (/onboarding/plan, Tu Día 1)
Fecha: 2026-10-05 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 31/40
Craft: 12/20
Copy (si vende): 11/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. Carga/valor - app/onboarding/plan/page.tsx l.145-158 y l.196: la tarjeta del Botón de Rescate (el mecanismo, la única pista de que el icono de refrescar es interactivo) queda fuera del primer viewport y tapada por el CTA sticky en la captura; el usuario ve 5 iconos circulares sin explicación. Fix: mover la pista encima de la lista o a un subtítulo corto y dejar el pulso solo en el primer icono.
2. Copy de oferta - l.76-83 y l.202-206: ninguna pieza dice precio ni qué se recibe (cuántos días, 90 días, plan fijo); el microcopy bajo el CTA son tres claims pegados en 11-12px, la garantía no tiene plazo. Falta H1 con promesa de FICHA-AVATAR (plan exacto, sin cobros ocultos). Fix: añadir línea de precio ("US$X pago único") y plazo de la garantía; separar en 2 líneas.
3. Craft/identidad y profundidad - página entera: fondo plano #12161c, 5 tarjetas idénticas, un solo dispositivo (verde lima + canto 3D del botón); sin hairline degradé, sin chips SVG de beneficios, sin textura. El bloque "resto de tu semana" difuminado casi no se distingue y deja ~300px de vacío muerto al final de la captura completa. Fix: añadir fondo con tinte/gradiente, una superficie elevada para el bloque bloqueado y un hairline degradé en el CTA/tarjeta héroe.
4. Jerarquía/movimiento - l.79 y 88-133: titular text-2xl sin palabras clave en acento (Día 1 / Pierna completa en blanco plano), no hay número héroe; sin reduced-motion explícito en la pantalla (solo CSS global, motion no lo respeta), sin celebración ni transición al paywall. Fix: resaltar "Día 1" en acento, envolver con MotionConfig reducedMotion="user".
5. Encaje/usabilidad - l.164 y l.196-207: el label "El resto de tu semana" queda cortado bajo el backdrop del CTA sticky; el CTA sticky y el botón "Desbloquea tu semana completa" compiten (dos primarios al mismo destino, la píldora tiene contraste bajo sobre el blur); el mismo ícono de refrescar sin etiqueta visible en 5 filas (solo aria-label). Fix: añadir pb al contenedor para que no lo tape, quitar la píldora o volverla secundaria clara, rotular el primer botón "Cambiar".

Notas de verificación: CTA vivo = contraste OK, h-14 (56px) OK, canto 3D, habilitado siempre, falta whileTap propio en el CTA (solo clase boton-3d, no verificado :active). Control/atajos (h3/h7): sin botón volver ni salir visible en esta pantalla; el cambio de ejercicio es reversible (toca de nuevo). Gate de carga cognitiva: 1 falla (acciones: icono x5 + 2 CTAs). Paleta y Poppins coinciden con FICHA-ARTE. Garantía "Primer Plan Claro" no aparece en FICHA-MERCADO.md (plazo no verificable). Hallazgo de proceso: la captura no muestra la tarjeta de pista que el código renderiza; puede ser una captura anterior o estar tapada por el sticky.
