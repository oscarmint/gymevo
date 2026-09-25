# VEREDICTO revisor-visual — onboarding (ronda 5)
Fecha: 2026-09-25 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 30/40
Craft: 14/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [app/onboarding/plan/page.tsx, microcopy bajo el CTA "Ver mi plan completo"] "7 días gratis, sin tarjeta · sin renovación automática · garantía de 7 días" repite "7 días" dos veces con sentidos distintos (prueba y garantía), y la garantía no tiene nombre. FICHA-AVATAR promete "aviso antes del cobro", lo que implica cobro automático, y choca con "sin renovación automática". Fix: verificar la mecánica real del paywall y Hotmart, y dejar una sola promesa por línea. Si hay garantía, darle nombre y plazo distinto al de la prueba.
2. [plan/page.tsx, lista de ejercicios] 5 botones de rescate en verde, más la fila "+2 ejercicios", el aviso, 3 filas bloqueadas y el CTA. Compiten con el CTA héroe y la pantalla queda densa. Fix: dejar UN botón de rescate destacado (primera fila) y los demás en tono neutro hasta que se toque el primero. Reducir a 3 filas bloqueadas, o a un resumen "+3 días".
3. [plan/page.tsx L60 y L90] Jerga sin traducir para el avatar principiante: eyebrow "RUTA PRINCIPAL · HIPERTROFIA" y "4×10-12". Fix: "Ganar músculo" en lugar de "Hipertrofia", y "4 series de 10 a 12" en lugar de "4×10-12".
4. [onboarding/page.tsx paso "Te entendemos", tarjeta 2, L479-481] "Tu constancia queda registrada: ves tu racha y tu progreso reales" es genérica, sin cifra, sin escena y sin dolor de la ficha. Fix: sustituirla por un beneficio concreto del avatar (por ejemplo "Sabes qué hacer apenas cruzas la puerta: el plan de hoy ya está listo").
5. [plan/page.tsx, controles y movimiento] La vista previa no tiene "Volver" hacia el cuestionario (solo el CTA). Devuelve null mientras carga, sin skeleton. Usa motion sin useReducedMotion (el CSS global no frena los transforms de JS). Fix: agregar flecha atrás a /onboarding, un skeleton de 5 filas y useReducedMotion en las entradas.

Notas: el trazo recto y el copy "Tu plan no cambia cada semana" se ven bien en el screenshot. Paleta y Poppins coinciden con FICHA-ARTE (#97d131 sobre #12161c). El aviso del rescate con borde sólido e ícono arriba está resuelto. Identidad ownable: 2/4 (dark + lima con hairline degradé y canto 3D, sin textura ni ilustración propia). Sin celebración de hito ni conteo en estas dos vistas (el conteo solo está en el paso de días). Carga cognitiva: la lista de 5 ejercicios pasa el gate, pero el conjunto de la vista previa queda al límite (≤4 fallas, no crítico).
