# VEREDICTO revisor-visual — paywall
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 36/40
Craft: 16/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. [Toda la pantalla, motion.div/motion.button en app/paywall/page.tsx] Ninguna animación respeta `prefers-reduced-motion` (no hay `useReducedMotion` ni variantes sin transición, y no existe una regla global en app/globals.css) → envolver las transiciones en un check de reduced-motion (como ya hace app/app/page.tsx con el número de racha) o añadir la media query global.
2. [Headline + subheadline] No hay un listado explícito de "qué incluye tu plan" más allá de "Todo tu plan, sin límites" y la mención del Botón de Rescate → agregar 2-3 bullets concretos de contenido (rutina diaria, Botón de Rescate, seguimiento) para que la oferta sea inequívoca antes del precio.
3. [Bloque inferior: bullets de transparencia + mini-FAQ + trust row] Tres bloques consecutivos usan tamaños de texto casi idénticos (text-sm/text-xs), aplanando la jerarquía en la mitad baja de la pantalla → diferenciar peso o color entre el bloque de bullets y el de FAQ.
4. [Plan cards] El dispositivo ownable de FICHA-ARTE.md (tachado verde estilo cuaderno) no aparece en esta pantalla; solo queda el borde punteado como eco parcial → considerar una nota visual adicional (textura o línea) que conecte más con el "cuaderno de sala" en una superficie de conversión.
5. [CTA "Empezar mis 7 días gratis"] La navegación a /login ocurre sin ningún feedback de carga intermedio (ni loading inline ni deshabilitar el doble tap) → aunque es navegación local rápida, agregar un estado de "cargando" de 100-200ms evita el doble-tap accidental.
