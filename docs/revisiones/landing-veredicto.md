# VEREDICTO revisor-visual — landing
Fecha: 2026-09-01 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 34/40
Craft: 13/20
Copy (si vende): 20/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Top defectos:
1. [Paleta global — toda la pantalla] Papel cálido `#F5F1EA` + tinta verde `#5C7A1F` coincide en 2 de 3 rasgos con la paleta vetada "Capítulo" (papel+verde+Petrona/Karla) de los ejemplos canónicos del 53; el único dispositivo ownable real (tachado verde) aparece UNA vez en toda la página (Solución → antes/después) → fix: repetir el tachado/dispositivo ownable en al menos 2 lugares más (p.ej. sobre el "$108" tachado de Oferta, que hoy es un tachado genérico de Tailwind en vez del tachado de marca) o activar una textura de grano/cuaderno real para que la identidad no dependa solo de hue+papel.
2. [Problema, Agitación, Garantía] Estas 3 secciones corren en solo 2 planos tipográficos (título + cuerpo), sin el eyebrow/label de 11-12px que sí tienen Oferta/AppPorDentro/Faq/Solución → fix: añadir un Kicker a Problema y Agitación (Garantía puede usar el nombre propio en Accent como 3er plano, hoy funciona parcialmente) para una jerarquía de 4 niveles uniforme en toda la página.
3. [Oferta → tarjeta Mensual, CTA] "Elegir mensual" no usa `<CtaButton variant="outline">` del kit sino un `<motion.a>` inline duplicado con el mismo patrón visual → fix: extraer una variante `outline` dentro de `CtaButton` (ui.tsx) en vez de mantener una segunda implementación del mismo componente.
4. [AppPorDentro — los 4 frames] La sección depende de 4 screenshots reales en `/public/screenshots/*`; si falta alguno, el placeholder gris rompe la promesa visual justo en la sección que más vende el mecanismo → fix: confirmar en el repo que las 4 imágenes existen y muestran datos semilla reales (no se pudo verificar disponibilidad de archivo en esta revisión, solo el componente).
5. [CtaFinal — recap y PS] `recap` usa `color-mix(in oklab, var(--bg) 65%, transparent)` sobre fondo invertido `--text-primary`, a 13px — riesgo de caer bajo 4.5:1 (AA) al ser el texto más apagado del bloque de mayor contraste de la página → fix: medir el contraste real y subir la opacidad del recap si no cumple AA.

Nota de cierre de ronda: los defectos #1 y #2 son los mismos de la ronda 3 (paleta cercana al ejemplo vetado, planos tipográficos incompletos) — no se tocaron esta ronda por decisión de alcance, y siguen bloqueando el gate de craft (13/20, umbral 16/20) pese a que usabilidad (34/40) y copy (20/20) están cerca o por encima del umbral.
