# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Bajo el CTA, app/paywall/page.tsx L349-381] Se apilan 4 líneas de microcopy (pago único, garantía, prueba gratis, FAQ) más "Ahora no", "¿Ya pagaste?" y "Pago seguro": la zona de decisión se diluye. Fix: fusionar "Pago único · acceso hasta X · no se renueva solo" con la garantía en una sola línea, y mover "¿Ya pagaste?" y "Pago seguro" a una sola fila de pie.
2. [Identidad, hero/tarjeta del video] Foto genérica de gimnasio más verde lima y Poppins: es correcto según la ficha, pero un solo dispositivo firma (canto 3D) y nada propio del Botón de Rescate. Fix: sustituir la franja de video por una miniatura del Botón de Rescate en uso (mecanismo bautizado) o aplicar el tachado verde de la ficha como detalle firma.
3. [Precios, PlanCard L610 y L629] Texto de 12px en --text-tertiary (#7d8492 sobre #1a2029, ~4.2:1) para "USD · ≈ COP" y detalle en 12.5px: bajo AA y difícil de leer. Fix: subir a --text-secondary y a 13px.
4. [Copy, todo el paywall] Sin prueba ni razón de fondo: el bloque no enumera qué incluye el plan (plan fijo de 90 días, rutina, Botón de Rescate) ni el ancla citable (Fitbod Elite). La única prueba es la garantía. Sin testimonios por decisión del dueño, hay que compensar con especificidad. Fix: agregar 3 bullets con chip SVG bajo el título con lo que se recibe, y una línea "Menos de $0.08/día".
5. [Screenshot desactualizado, L43-47] El screenshot muestra "24 de sept de 2027", pero el código produce "24 sep 2027": el render no corresponde al código actual. Además el movimiento no incluye conteo del héroe al cambiar de plan ni celebración. Fix: recapturar el screenshot tras el último cambio; el conteo ya existe con PrecioAnimado, así que basta con verificar que corra al cambiar de plan.

Observaciones de copy: no hay testimonios (intencional, no se penaliza en craft). El copy traza a la ficha (Botón de Rescate, "sin cobros ocultos", garantía con plazo junto al CTA).
Verificado en código: CTA vivo (nunca disabled por defecto, h-14, whileTap 0.97, contraste alto). Cancelar redirección, cierre con meneo y error con solución presentes. Reduced-motion respetado. Sin atajos de teclado (h7 limitado a defaults y plan recordado).
