# VEREDICTO revisor-visual — paywall
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 30/40
Craft: 12/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [fila de enlaces bajo el CTA, "Ahora no · Restaurar compra"] El botón "Restaurar compra" no tiene onClick ni ninguna acción en el código (app/paywall/page.tsx líneas 131-133) — parece interactivo y no hace nada → implementar el flujo real de restauración o mostrar un estado "Próximamente"/ocultarlo hasta que Hotmart esté conectado (Sesión 6).
2. [3 bullets bajo el CTA: "Hoy no pagas nada / Te avisamos.../ Cancela en 1 tap"] Usan el carácter "✓" del sistema en vez del checkmark custom (círculo acento 12% + ícono SVG) exigido para listas de beneficios en pantallas de conversión → reemplazar por un chip circular con el ícono Check de Lucide dentro de un círculo con fondo acento al 12%.
3. [pantalla completa, especialmente timeline y plan cards] No aparece el dispositivo ownable aprobado en FICHA-ARTE.md ("tachado verde grueso" / "chips de meta con borde fino punteado") en ningún elemento — la pantalla no se distingue como "Cuaderno de Sala" y queda cerca de la paleta genérica "papel + verde" → aplicar el tachado o el borde punteado en al menos el plan seleccionado o el nodo completado del timeline.
4. [trust row inferior, "Pago seguro · Garantía Hotmart 7 días"] La garantía Hotmart solo aparece al final de la pantalla, lejos del CTA principal (sub-check binario de copy: garantía nombrada cerca del CTA) → repetir "Garantía 7 días" como microcopy inmediato bajo o junto al botón "Empezar mis 7 días gratis".
5. [bloque completo debajo del timeline: plan cards, CTA, bullets, FAQ] La entrada animada (motion.div con stagger) solo cubre el headline y el timeline; el resto del contenido aparece sin transición y el código no implementa guard de `prefers-reduced-motion` → envolver cada bloque restante en motion.div con stagger 60-80ms y respetar la preferencia de movimiento reducido.
