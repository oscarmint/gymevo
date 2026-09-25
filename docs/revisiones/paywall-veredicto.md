# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-25 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Mini-demo del mecanismo, arriba] "Prensa · ocupada" se ve cortado como "Prensa ocupa…" y el chip dice "Hack inclinado" (anglicismo/jerga). Es lo primero que prueba el mecanismo y se lee roto. Fix: acortar a "Prensa ocupada" en una línea (quitar el truncate o bajar el padding) y renombrar el ejercicio en español ("Press inclinado").
2. [Primera vista, zona de planes] La barra fija del botón tapa la tarjeta Semestral y deja a la vista solo el "$19.99" cortado. En la primera vista el señuelo de 3 planes no se ve y no se entiende que hay opciones. Fix: reducir la tarjeta del mecanismo, o pasar a un selector compacto, para que las 3 tarjetas entren antes de la barra fija.
3. [Tarjeta Anual, columna del precio] "USD · pago único · ≈ $105.619 COP" salta a 2 líneas y empuja el precio. Las tarjetas quedan de distinto alto y desencajadas. Fix: dejar el precio grande + "USD" en una línea y mover "pago único · ≈ COP" a la línea de detalle inferior, o abreviar.
4. [Copy, todo el paywall] Emoción y prueba flojas (emoción 2). Solo hay un eyebrow ("Se acabó adivinar…") y ninguna escena del dolor del avatar (6:30 PM, todas las máquinas ocupadas, vergüenza de quedarse parado). No hay prueba más allá de la garantía. Además, el "hasta 12 cuotas en Colombia" no se pudo trazar a FICHA-MERCADO en esta revisión. Fix: reescribir el subtítulo con la frase literal del avatar ("máquina ocupada, sin saber qué más hacer") y verificar o quitar el claim de cuotas.
5. [Debajo de las tarjetas / cierre] Hay dos garantías/promesas que compiten: 7 días gratis sin tarjeta y "devolución de 7 días" (redundante para quien no ha pagado). Junto con el secundario "Prefiero pagar ahora", la decisión es confusa y el bloque de confianza son 3 líneas seguidas sin jerarquía. Además queda un hueco muerto de unos 130px entre la tarjeta Mensual y el botón secundario. Fix: aclarar que la garantía aplica solo tras el pago, fusionar las líneas de confianza en una y quitar el vacío.

Verificaciones de código: h3 (control) parcial: "X" atenuada 1.5s + "Ahora no" + Cancelar en la redirección, OK. h7: plan Anual por defecto y plan recordado en localStorage, OK. h9: error de redirección con enlace de salida, OK. Movimiento: stagger de entrada, PrecioAnimado, layoutId del anillo, whileTap 0.97 y reduced-motion presentes; sin celebración (no aplica). CTA héroe vivo: contraste alto, tap 56px, no disabled por defecto, OK. Paleta y Poppins coinciden con FICHA-ARTE (sin desvío). Nota: en el screenshot completo la barra fija aparece superpuesta a mitad de página por el método de captura, no se cuenta como defecto por sí sola.
