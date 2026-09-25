# VEREDICTO revisor-visual — landing
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 27/40
Craft: 13/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [CtaButton, components/landing/ui.tsx; visible en el CTA tras AppPorDentro] La etiqueta del CTA se alinea a la izquierda en ese bloque y centrada en los demás; en todos parte en 2 líneas ("Crear mi plan de mañana / gratis") con una palabra huérfana. Fix: forzar text-center y whitespace-nowrap con texto más corto ("Empezar mis 7 días gratis") o reducir el tamaño de fuente para que quepa en 1 línea.
2. [Oferta.tsx, tarjeta "Incluido" y 3 tarjetas de plan] Sigue habiendo demasiadas capas apiladas: lista de 5 con la columna "Incluido" repetida, bloque de ancla, bloque de 7 días, 3 planes y CTA. Pasa el umbral del gate cognitivo. Fix: quitar la columna "Incluido" (basta el check), colapsar Semestral y Mensual en una fila compacta bajo el Anual.
3. [ui.tsx / landing completa] Movimiento a medias: hay reveal, whileTap y acordeón, pero ningún conteo animado ($2.50, $0.09/día) ni dibujado de barras o progreso. Fix: contar de 0 al precio con animate() de motion al entrar en vista (respetando useReducedMotion) y animar la barra de progreso del mockup.
4. [Oferta.tsx y CtaFinal.tsx] No hay prueba social (decisión del dueño, no es defecto de craft). La prueba tangible existe (capturas reales, garantía Hotmart, ancla Fitbod), pero la garantía aparece lejos del primer CTA y el ancla es pequeña y gris. Fix: subir el ancla "Fitbod Elite $79.99/año" al titular de la oferta y repetir un sello "7 días de garantía Hotmart" pegado al CTA de la oferta.
5. [FooterLegal.tsx, tramo 10; Hero.tsx, tramo 1] Vacío muerto de ~150px bajo el footer, y links legales con separadores "·" sueltos que se parten en 2 líneas. Además el hero tiene un CTA de 2 líneas sobre una foto oscura. Fix: reducir el padding-bottom del footer y darle a cada link su propio ítem con gap; acortar el CTA del hero.
Observaciones: paleta y Poppins coinciden con FICHA-ARTE (sin desvío); no es un clon del ejemplo vetado; no hay emojis como íconos. Verificaciones de código: h3/h7 no observables en la landing (sin acciones destructivas ni atajos), por eso puntúan 3 y 2. El copy traza bien a la ficha del avatar, pero sin testimonios el eje de especificidad se queda en 3.
