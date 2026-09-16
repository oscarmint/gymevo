# VEREDICTO revisor-visual — onboarding (paso "reconocimiento")
Fecha: 2026-09-16 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 32/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Zona central-baja, entre "Tu constancia queda registrada..." y el botón "Continuar"] Bloque de ~170px de aire muerto sin usar (~21% del alto de pantalla) porque el div interior con `flex-1 justify-start` (línea ~401 de app/onboarding/page.tsx) absorbe todo el espacio sobrante y lo deja debajo del contenido en vez de repartirlo → fix: quitar `flex-1` del div interior (que tome su alto natural) y en su lugar centrar verticalmente todo el bloque de contenido con `justify-center` en el `PantallaPregunta` padre, dejando el botón con `mt-auto` fijo al fondo.
2. [Encaje óptico general de la pantalla] El vacío del punto 1 rompe el ritmo vertical: el ojo entrecerrado ve 3 masas de contenido arriba y un tercio de pantalla vacío abajo antes del CTA, en vez de una composición balanceada → mismo fix del punto 1; re-verificar que la distancia tarjeta-2→botón quede en la escala 32-48px, no en cientos de px.
3. [Hairline superior de ambas tarjetas] El `borderImage` con degradé (accent→accent-2) se percibe en el screenshot como una línea verde sólida plana, no como degradé — a 375px el efecto de "detalle firma" del kit no se lee → fix: aumentar el contraste entre los 2 stops del gradiente (usar accent y un tono claramente distinto, no accent-2 mezclado 70% con accent) o engrosar levemente a 2-3px para que el degradé sea perceptible.
4. [Botón "Continuar"] Cumple contraste, tap feedback (whileTap 0.97), altura 56px y ancho completo — sin defecto propio, pero su posición fija abajo hace más evidente el vacío del punto 1 por contraste con el bloque de arriba.
5. [Consistencia entre rutas Intermedio/Principiante] El ícono de la primera tarjeta cambia (TrendingUp vs ShieldAlert) y el copy es distinto por ruta — correcto y deseado, no es un defecto real, pero conviene confirmar en QA que ningún otro paso del flujo deje el mismo hueco estructural del punto 1 (el comentario en código sugiere que este ya es el 3er intento de reubicar el mismo hueco).

Nota de esta ronda: se resolvieron los defectos 2 (gap ~70-90px antes del check, ahora con pt-2) y 3
(texto de tarjetas sin énfasis, ahora con frase clave en font-semibold) del veredicto anterior. El
defecto 1 del veredicto anterior (aire sin usar antes del botón) NO se corrigió en esta ronda — de
hecho el hueco es más notorio ahora porque el contenido superior subió. La causa raíz es
estructural (flex-1 + justify-start en el contenedor de contenido) y requiere el fix indicado en el
punto 1 de esta lista, no un ajuste de padding.
