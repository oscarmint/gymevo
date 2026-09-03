# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 33/40
Craft: 13/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Identidad, toda la pantalla — fondo + acento] Paper cálido (#F5F1EA) + tinta verde (#5C7A1F) coincide en 2 de 3 rasgos con la combinación canónica VETADA "papel cálido + tinta verde + Petrona/Karla" (test anti-clon). Instrument Sans salva el tercer rasgo, pero el kit sigue peligrosamente cerca del arquetipo prohibido → EJE 3 bajado a 1. Fix: introducir una segunda nota de color/textura propia que rompa la lectura "papel+tinta" (el ámbar #9C5F1C ya existe en la ficha pero casi no aparece en esta pantalla — traerlo a un elemento visible del paywall).
2. [Tarjeta timeline, tercio superior] Al retirar el espiral sin reemplazo, el timeline quedó en el patrón más genérico posible (punto+línea vertical) — cero dispositivo ownable visible en esta pantalla, contradice la ficha ("cuaderno de gym" como mundo del sujeto). Fix: aplicar un tratamiento de bajo riesgo (borde punteado tipo cuaderno en los nodos, o el chip de meta con borde fino que la ficha ya define) en vez de dejarlo desnudo.
3. [Botón CTA "Empezar mis 7 días gratis"] Contraste medido texto-sobre-botón (cream #F5F1EA sobre verde #5C7A1F) ≈ 4.4:1 — por debajo del 4.5:1 AA para texto normal/semibold de 16.5px (no califica como "texto grande"). El botón en sí sí pasa el contraste contra el fondo de página (≥3:1), pero la legibilidad interna del texto queda al límite. Fix: aclarar el verde del botón 5-8% o engrosar/aumentar el texto a un tamaño que califique como "grande" (≥18.7px).
4. [Jerarquía tipográfica, toda la pantalla] Se cuentan 6+ tamaños distintos (eyebrow 14 / headline 30 / precio 24 / título de nodo 16 / cuerpo 14.5-13.5 / labels 12-11), por encima del máximo de 3 que pide la rúbrica — al entrecerrar los ojos se leen más de 4 niveles. Fix: fusionar título-de-nodo y FAQ-título en un mismo tamaño de tier, y bajar el precio de plan a la misma escala que el headline secundario.
5. [Banner de error, bajo el CTA] La corrección de contraste (texto en --text-primary) es correcta y ya no falla AA — pero el ícono de alerta sigue en --status-warning solo; si status-warning también tiene bajo contraste contra su propio fondo mezclado, el ícono se percibe apagado. Verificar ese contraste puntual (no crítico, pero es la única pieza que no se remidió esta ronda).
