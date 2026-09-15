# VEREDICTO revisor-visual — landing-v2
Fecha: 2026-09-15 00:00
Screenshot: docs/revisiones/landing-v2-375.png
Usabilidad: 36/40
Craft: 18/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. [CtaButton, components/landing/ui.tsx L181-202] El <motion.a> del CTA principal no declara whileTap explícito (depende solo de la clase CSS `boton-3d`, no auditada en esta revisión) → agregar whileTap={{ scale: 0.97 }} para garantizar el feedback de tap sin depender de CSS externo.
2. [Hero, ángulo de copy] El mecanismo "Botón de Rescate" no se nombra hasta la sección Solución — el hero lidera solo con el miedo, sin bautizar el mecanismo (EJE 1 de copy pide mecanismo en hero+solución+oferta) → si se quiere subir el eje sin diluir el ángulo de miedo, añadir una mención breve en el social-proof bajo el CTA del hero (ej. "con Botón de Rescate incluido").
3. [Pantalla completa, ~8700px] El screenshot entregado se redujo demasiado para el visor (factor ~4.3x) y no permitió verificar encaje óptico fino (padding simétrico, radios, alineación de chips) sección por sección → antes de publicar en producción, recapturar por secciones a 375px reales y confirmar encaje visual.
4. [Heurística 7 — flexibilidad] Fuera del sticky CTA de dos estados, no hay atajos adicionales para el usuario que ya vio la oferta → esperable en una landing, sin acción obligatoria.
