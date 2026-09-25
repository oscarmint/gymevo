# VEREDICTO revisor-visual — paywall (ronda 5)
Fecha: 2026-09-25 13:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 31/40
Craft: 14/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Mini-demo, app/paywall/page.tsx L254-263] Los dos chips y el icono de refresco parecen controles y no hacen nada (aria-hidden, sin onClick), y el icono se repite abajo en el chip de la tarjeta. Es la falla de "elemento que parece interactivo". Ademas, el screenshot muestra "Prensa inclina..." truncado y el codigo dice "Prensa · ocupada" (screenshot desactualizado o texto cortado a 360px). Fix: hacerla animada (el tachado se dibuja y el chip lima entra en bucle unico) o presentarla como ilustracion no tapable, quitar el icono duplicado y reducir el texto para que no se trunque.
2. [Craft, identidad, toda la pantalla] Oscuro + lima + Poppins, sin tratamiento propio visible: el tachado lima solo aparece dentro de la mini-demo y no en el precio. Sigue siendo un kit intercambiable con cualquier app fitness, aunque no coincide con las paletas vetadas Capitulo ni Umbral. Fix: llevar el tachado lima a un precio de referencia (ej. 12 x $4.99 = $59.88 tachado sobre el Anual) y subir el radial de fondo, casi invisible al 9%.
3. [Bajo el CTA, page.tsx L349-364 y L366-387] Cinco micro-lineas de 12px seguidas (total/fecha, medios de pago, garantia, "prueba antes", ademas de FAQ y salidas) diluyen el cierre. Ademas "7 dias gratis" y "garantia de 7 dias" en el mismo bloque confunden, y la prueba gratis compite con el pago. Fix: fusionar total+medios en 2 lineas, dejar la garantia con nombre propio ("Garantia Rescate 7 dias") y separar visualmente la prueba gratis con un divisor.
4. [Encaje, tarjetas de plan, page.tsx L543-550] La insignia "MAS POPULAR" mide 10.5px con verde oscuro sobre fondo oscuro y apenas se distingue en el screenshot. La tarjeta Mensual muestra el detalle "por 1 mes" sin dato util, lo que deja el pie de las tres tarjetas desigual. Fix: insignia con acento lima y texto oscuro, y en Mensual mostrar "Sin ahorro · el mas caro por mes".
5. [Copy] Especificidad limitada a garantia y precio: sin prueba (se anota como observacion, no como defecto de craft), la garantia no tiene nombre propio y no hay stack de lo que incluye el plan (plan fijo, ruta de 90 dias, Rescate). Fix: 3 lineas con chip SVG bajo la demo con lo incluido y nombrar la garantia.

Notas de verificacion:
- CTA heroe vivo: 4/4 (contraste lima/oscuro alto, whileTap 0.97, nunca disabled por defecto, h-14 ancho completo).
- Codigo: cancelar redireccion, error con salida, reduced-motion, stagger, PrecioAnimado y layoutId verificados. Sin celebracion de hito, por eso movimiento 3. Cerrar con retraso 1.5s con feedback de meneo (h3 ok). Recuerda el plan elegido (h7).
- Mejoras reales frente a la ronda 4: total en COP, medios de pago junto al CTA, contraste del pie, cuotas del Anual y garantia junto al boton. Aun asi craft queda en 14 por identidad 2 y encaje 2.
- Gate de carga cognitiva: 1 falla (elemento que parece interactivo), sin sobrecarga.
- Gate de copy: 15/20 (idea 3, especificidad 2, emocion 3, oferta 4, accion 3), bajo el umbral 16 y con un eje en 2. Garantia con plazo pero sin nombre: sub-check binario falla.
- Gate doble: 31/40 y 14/20, no alcanza 36/40 ni 16/20.
