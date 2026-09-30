# VEREDICTO revisor-visual — onboarding (ronda 8)
Fecha: 2026-09-30 00:00
Screenshot: docs/revisiones/onboarding-375.png (cuestionario) + docs/revisiones/onboarding-plan-375.png (Día 1 / plan)
Usabilidad: 36/40
Craft: 15/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Top defectos:
1. [plan/Día 1, sección "El resto de tu semana" justo bajo el CTA sticky] En el screenshot full-page la etiqueta y las tarjetas borrosas quedan apretadas/casi ilegibles pegadas al bloque sticky del CTA (backdrop-blur + fondo semitransparente) → reproducir el scroll real (no solo captura full-page) y confirmar que el CTA sticky (`bottom-0`, `z-20`, `backdrop-blur-md`) no se superpone visualmente con "El resto de tu semana"; si se superpone, separar con más margen inferior o pasar a un footer fijo simple con altura reservada.
2. [plan/Día 1, pill "Desbloquea tu semana completa"] Es un `<p>` sin `onClick`, con apariencia de botón (borde, radio pill) sentado sobre las tarjetas borrosas → viola la regla "todo elemento con apariencia interactiva hace algo" (UX regla 11): el usuario lo va a tocar esperando desbloquear y no pasa nada. Convertirlo en `<button>` real que navegue a `/paywall`, o quitarle el borde/forma de control para que se lea como leyenda, no como acción.
3. [cuestionario, paso "frustración"] El delay de 1.7s tras elegir es ahora el más largo de todo el flujo (vs. 260ms del resto) sin ningún indicador de progreso durante la espera — solo el checkmark bajo la opción ya elegida. Si el usuario toca la opción y no ve avanzar nada en ~1s, puede pensar que no registró el tap y tocar de nuevo. Agregar un leve pulso en la barra de progreso superior durante esos 1.7s para que la espera se lea como transición intencional, no como lentitud.
4. [plan/Día 1, CTA sticky] "Ver mi plan completo" es más honesto que la versión anterior ("Activar...") pero sigue siendo un verbo de sistema ("ver"), no un beneficio en 1ª persona (copy EJE 5: dirección a una acción) → probar algo como "Quiero mi semana completa" que mantenga la honestidad (lleva a precios) y sume beneficio desde el punto de vista del usuario.
5. [cuestionario, pasos "meta" y "frustración" — TarjetaRuta] En las preguntas de 2 chips la tarjeta inferior ocupa gran parte del resto de la pantalla con dos bloques de lectura (label "Tu ruta se está armando" + beneficio con ícono/texto) frente a una decisión binaria simple arriba — no rompe el gate de carga cognitiva, pero un ojo entrenado nota el desbalance entre el esfuerzo de decisión (2 opciones) y el volumen de texto de apoyo.

Detalle usabilidad: h1:4 h2:4 h3:4 h4:4 h5:4 h6:4 h7:3 h8:2 h9:3 h10:4
Detalle craft: jerarquía:3 profundidad:3 identidad:3 movimiento:4 encaje:2
Detalle copy: idea:4 especificidad:4 emoción:3 oferta:4 acción:3

Notas de verificación en código:
- Control y libertad (h3): confirmado en app/onboarding/page.tsx — modal de confirmación de salida con foco inicial en "Seguir aquí" (no en la acción destructiva), trampa de foco Tab/Shift+Tab, cierre con Escape, y salida directa sin confirmar si pasoIdx===0 (nada que perder). Correcto.
- Flexibilidad (h7): Enter avanza en el paso "reconocimiento" (única CTA sin equivalente de teclado), flechas ↑/↓ navegan entre chips como radiogroup real. No hay atajos adicionales para el usuario experto más allá de eso — de ahí el 3, no 4.
- Movimiento (eje 4, código): stagger de entrada en chips (delay i*0.05) y en ejercicios del plan (delay 0.08+i*0.06) ✓ · conteo ascendente de "días/semana" en el paso compromiso (animate 1→dias) ✓ · sin gráficos de anillo/barra en esta pantalla (N/A, no cuenta en contra) · whileTap scale 0.97/0.9 en botones y en el ícono de Rescate ✓ · transición entre pasos con AnimatePresence + dirección custom ✓ · modal de salida con fade+y suave ✓ · celebración real: trazo SVG que se dibuja bajo "entendemos" y en el check del paso reconocimiento ✓ · useReducedMotion respetado en todas las animaciones revisadas ✓. 6/7 aplicables, cumplidos.
- Identidad (eje 3): paleta #12161c + acento #97d131 + Poppins, extraída del ebook propio del usuario (FICHA-ARTE.md, redecisión aprobada 03/09/2026) — NO coincide con los dos combos vetados del test anti-clon (papel cálido+tinta verde+Petrona/Karla, ni pizarra #0E0F13+latón+Archivo). Pasa el test anti-clon; no se anula el eje.
- Garantía nombrada (copy, sub-check binario): cumple — "Garantía del Primer Plan Claro: 7 días tras pagar" aparece con nombre y plazo justo bajo el CTA de compra.
- CTA héroe vivo (los 4 anclajes): contraste alto (lima sobre casi-negro, >3:1 ampliamente) ✓ · whileTap scale 0.97 implementado ✓ · nunca disabled por defecto, siempre activo ✓ · área táctil h-14 (56px) ancho completo ✓. Los 4 se cumplen — no baja ningún eje por este punto.

Conclusión: la ronda 8 corrige bien los 3 puntos pedidos (delay del 1.7s sí da tiempo de leer, la metáfora de libreta desapareció sin dejar rastro, y "Ver mi plan completo" ya no promete activación falsa). El cuestionario en sí (onboarding-375.png) está sólido y cerca del nivel de la ronda 7. Lo que baja el puntaje es específicamente la pantalla del Día 1 (onboarding-plan-375.png): el remate visual del CTA sticky contra la sección bloqueada de "el resto de tu semana" no se ve limpio en el screenshot, y el pill de desbloqueo parece interactivo sin serlo. Craft 15/20 no alcanza el umbral de 16/20 — gate doble no se cumple. Corregir los defectos 1 y 2 (los que bajan craft/encaje) y volver a capturar antes de la próxima ronda.
