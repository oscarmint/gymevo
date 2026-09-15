# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-14 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 36/40
Craft: 18/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA

Top defectos:
1. [PlanCard, app/paywall/page.tsx:566] El borde punteado en Semestral/Mensual usa accent-2 al 45% mezclado con text-tertiary — visualmente correcto y con contraste suficiente por ser solo borde, pero al ser el único elemento con ese patrón "punteado = no elegido" podría leerse como "cupón recortable"; no bloquea el gate, solo vigilar en próxima ronda de copy.
2. [Timeline, línea ~491] La línea vertical entre nodos usa bg-[var(--accent)] sólido incluso para el segmento hacia el nodo "vacío" (día de cobro) — funciona pero podría atenuarse (accent al 40%) para reforzar visualmente que ese tramo aún no ocurrió; cosmético, no afecta el puntaje.
3. [Densidad de la pantalla completa] El scroll total sigue siendo largo (headline, video, timeline, 3 planes, CTA, garantía, FAQ, footer, trust row) — cada bloque individual cumple el gate cognitivo (≤4-5 ítems, 1 acción primaria, texto corto), pero es la pantalla más larga de las 4 del dinero; si en el futuro se agrega más contenido, considerar recortar antes de sumar.

Verificación puntual del bug reportado en la ronda anterior:
- Línea ~339 ("Garantía Hotmart...") → confirmado texto en `text-[var(--accent)]` (#97d131 sobre #12161c ≈ 9.9:1). Visible en el screenshot como texto verde brillante, legible sin esfuerzo.
- Línea ~386 ("Antes de empezar") → confirmado texto en `text-[var(--accent)]`. Visible en el screenshot como texto verde brillante, legible.
- Grep de `accent-2)]` en el archivo: las 3 instancias restantes son (a) fondo de gradiente decorativo (no texto), (b) borde punteado de card (no texto), (c) comentarios explicativos — cero texto usando `--accent-2` (#5c7a1f) directo sobre `--bg` en toda la pantalla. Bug cerrado.
