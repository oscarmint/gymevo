# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/onboarding-nivel-375.png (+ onboarding-meta-375.png, onboarding-compromiso-375.png)
Usabilidad: 36/40
Craft: 16/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA

Top defectos:
1. [CTA "Fijar mi meta" → terminar()] guardarRespuestas() es sessionStorage síncrono y la navegación a /onboarding/generando es inmediata (pantalla de carga rica con anillo+checklist+aria-live) — el riesgo teórico de "tap sin feedback" que se señaló la ronda pasada no se resolvió con un estado visual propio, pero en la práctica el hueco es sub-100ms y el whileTap ya cubre el instante del tap: defecto real pero de impacto marginal, solo lo nota quien revisa con lupa.
2. [Jerarquía tipográfica global — Pregunta() + TarjetaRuta()] Siguen conviviendo 4 tamaños (título 3xl, chip base, micro/body sm, eyebrow "TU RUTA SE ESTÁ ARMANDO" xs) en la misma pantalla, por encima del máximo de 3 recomendado → unificar micro-copy del paso y eyebrow de la tarjeta a un mismo tamaño.
3. [Fondo global + TarjetaRuta — dirección de arte] Papel cálido (#F5F1EA) + tinta verde (#5C7A1F) + renglones de cuaderno sigue siendo el punto más frágil de identidad frente al patrón vetado "Capítulo"; la tipografía (Instrument Sans, no Petrona/Karla) y el dispositivo de espiral+tachado alejan del clon exacto, pero el kit se siente intercambiable con cualquier "app-libreta" genérica → reforzar el dispositivo ownable (espiral más protagonista, textura de tachado más marcada) antes de reutilizar esta paleta en otra pantalla.
4. [Paso "compromiso" — feedback de error] No hay evidencia en código de qué pasa si sessionStorage falla o está deshabilitado (modo incógnito estricto): leerRespuestas() en /onboarding/generando redirige silenciosamente a /onboarding sin explicar por qué se reinició — mensaje breve ("no pudimos guardar tus respuestas, empecemos de nuevo") evitaría que se lea como un bug.
5. [Chips no seleccionados — Chips()] El borde punteado (border-dashed) en el estado no-seleccionado puede leerse como "placeholder/deshabilitado" en vez de "opción disponible"; confirmar con un usuario real que no reduce la tasa de tap en el primer paso.

Nota: ninguno de los 5 bloquea el gate (≥36/40 y ≥16/20) — son candidatos a una ronda de pulido posterior, no defectos que un usuario promedio note sin buscarlos.
