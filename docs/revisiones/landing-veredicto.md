# VEREDICTO revisor-visual — landing
Fecha: 2026-09-28 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:4 h3:3 h4:3 h5:3 h6:3 h7:2 h8:3 h9:2 h10:3
Detalle craft: jerarquia:3 profundidad:3 identidad:3 movimiento:2 encaje:3
Detalle copy: idea:4 especificidad:3 emocion:3 oferta:4 accion:3

Fidelidad: fondo casi-negro con tinte azulado, acento lima `#97d131`, Poppins y tachado ownable — coherente con FICHA-ARTE (extracción del ebook del usuario). No coincide con las paletas vetadas "Capítulo" ni "Umbral" → identidad no es clon.

Mejoras verificadas desde el veredicto del 25/09 (28/40 · 11/20 · 15/20, NO LISTA): el fallo de render que dejaba ~6000px de fondo vacío (Agitación→FAQ) está resuelto — todas las secciones se ven en el screenshot de página completa. El nuevo titular "Tu gimnasio, por fin bajo control" mantiene bold+acento correcto. La sección Mecanismos reutiliza IconChip/SectionShell del kit sin romper consistencia y da una jerarquía clara Rescate (protagonista) vs Técnica/Plan/Registro (apoyo).

Top defectos:
1. [components/landing/ui.tsx, PrecioAnimado, líneas 20-24 — usado en Oferta, cards $2.50/$3.33/$4.99] La baseline de movimiento OBLIGATORIA #2 (conteo animado del número héroe) está explícitamente DESACTIVADA: el componente ahora solo devuelve `<span>{texto}</span>` estático, con un comentario que admite que se quitó el conteo para no "parpadear". Es un incumplimiento directo de DESIGN-CORE/22-LIBRERIAS-Y-CRAFT (7 baseline no negociables). Fix: implementar el conteo real con un guard `useRef` que anime una sola vez al entrar en viewport (no en cada re-render), en vez de eliminar la animación.
2. [Sección Oferta, bloque "stack", línea `etiquetaTotal: 'Una app equivalente (Fitbod Elite, desde)'` / `totalTachado: '$79.99 USD/año'`] Claim de precio de un competidor sin fuente ni fecha visible junto al dato — no pasa el EJE 2 de copy (especificidad y prueba: todo claim grande necesita número verificable). Fix: agregar nota pequeña con fuente/fecha de consulta del precio de Fitbod Elite, o quitar la cifra si no se puede sostener.
3. [Toda la página, ~9720px de alto a 375px ≈ 12 pantallas] Página muy larga con el mismo CTA repetido 6 veces (Hero, tras Solución, AppPorDentro, Oferta, sticky, CtaFinal); ningún desvío grave, pero para un usuario que solo quiere ver precio no hay forma de saltar directo — el único control de navegación es "volver arriba", no hay ancla a Precios/FAQ desde el header. Fix: agregar un enlace ancla discreto en el header ("Precios") o un indicador de progreso de scroll.
4. [Heurística 9 — errores claros] La landing no demuestra ningún estado de error (no hay formularios propios; el CTA va directo a /onboarding), así que no hay evidencia de que el sistema explique qué pasó + qué hacer si algo falla en la navegación al onboarding. No es un defecto visible pero queda sin verificar — anotarlo como pendiente de prueba real de clic.
5. [Heurística 7 — flexibilidad, código] Sin atajos para el usuario recurrente: no hay lógica que reconozca una segunda visita y ofrezca saltar directo a precios/checkout; toda visita repite el funnel completo de 12 pantallas. Fix: bajo prioridad, pero anotar para iteración post-lanzamiento.
