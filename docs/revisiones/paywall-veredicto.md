# VEREDICTO revisor-visual — paywall
Fecha: 2026-10-06 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Primer viewport, tarjeta Mensual + barra fija] La barra sticky tapa la tercera tarjeta: el detalle "1 mes de acceso · sin ahorro" queda cortado. Quien decide entre planes no ve el ancla completa. Fix: reducir la altura de las tarjetas o de la barra para que las 3 quepan encima de ella, o pasar la barra a la zona inferior sin solaparse.
2. [Tarjetas de plan vs CTA "Empezar mis 7 días gratis"] El usuario elige un plan, pero el CTA inicia una prueba que no depende del plan. No se dice para qué sirve elegir ahora ("Si sigues: ..." es vago). Fix: título sobre las tarjetas tipo "Elige el plan para cuando termine tu prueba" y cambiar la nota a "Al día 8 eliges y pagas una sola vez"; o agrupar tarjetas y CTA bajo el mismo encabezado.
3. [Toda la pantalla, copy de oferta] No hay stack de lo que se recibe (plan fijo, Botón de Rescate, ruta de 90 días, técnica guiada). Solo hay 1 mini-demo y tres precios, sin prueba ni números verificables. Dos ejes de copy quedan en 2. Fix: lista de 3-4 entregables con chips SVG entre la demo y los planes, con cifras (90 días, N ejercicios).
4. [Bajo el CTA, "Prefiero pagar ahora" + bloque de garantía] Hay dos acciones primarias en competencia y la garantía "Primer Plan Claro" queda separada del CTA por la nota y el enlace, fuera del primer viewport. Para el avatar que teme los cobros ocultos, es lo que más tranquiliza. Fix: poner la garantía nombrada en una línea con ícono justo debajo del CTA dentro de la barra fija, y bajar "Prefiero pagar ahora" al bloque de confianza.
5. [Tarjetas de plan, microtexto] Badge "MÁS POPULAR" de 10.5px, detalle de 13px, y una línea de COP larga ("USD · ≈ $ 102.518 COP") que compite con el precio. No hay prueba social real que justifique "más popular" en una app sin lanzar (ficha: sin testimonios). Fix: cambiar el badge a "MEJOR PRECIO · ahorras 50%" (dato verificable), subir el badge a 11-12px y mostrar el COP solo en la tarjeta seleccionada.

Notas de verificación:
- Cambios de la ronda anterior verificados. Se quitó el relleno muerto, las tarjetas son compactas con detalle de una línea, "Así funciona el rescate:" ya no parece un selector, y whileTap de PlanCard respeta reduced-motion (`whileTap={reduce ? undefined : ...}`).
- La barra fija sí cumple las anclas del CTA vivo: alto 56px, ancho completo, whileTap 0.97, no deshabilitado por defecto, y contraste lima sobre texto oscuro alto.
- Movimiento: stagger, conteo de precio (PrecioAnimado) y reduced-motion en código. No hay celebración ni dibujado de barras/anillos. Se puntúa 3.
- Gate de carga cognitiva: 1 falla (2 acciones primarias). No es sobrecarga crítica.
- Ficha de arte: paleta #12161c, lima #97d131 y Poppins coinciden con el screenshot. No coincide con los clones vetados.
