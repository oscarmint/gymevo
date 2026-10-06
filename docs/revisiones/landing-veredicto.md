# VEREDICTO revisor-visual — landing
Fecha: 2026-10-05 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Oferta, tarjetas de plan y bloque "Hoy: $2.50 USD/mes"] El precio se presenta como mensual ($2.50/mes, $3.33/mes) pero se cobra UNA vez ($29.99 / $19.99). El usuario que viene escaneando "cobros ocultos" tiene que releer para entender que no es suscripción. Además el bloque "Una app equivalente... Fuente..." son 5 líneas de texto apretado. Archivos: components/landing/Oferta.tsx y bloque `stack`/`anual` en components/landing/LandingV1.tsx. Fix: poner el TOTAL ($29.99 pago único) como cifra héroe y el equivalente mensual como apoyo; recortar la nota del stack a 2 líneas.
2. [Prueba social: Hero y sección Testimonios] Cero prueba de terceros en toda la página (Testimonios no pinta nada, el hero solo tiene la garantía como "social proof"). Las afirmaciones grandes ("70 ejercicios", "te cambia la rutina") no tienen demo ni número verificable salvo el ancla de Fitbod. Archivos: components/landing/Testimonios.tsx, lib/testimonios.ts. Fix: meter una prueba real (video/GIF corto del Botón de Rescate, número de ejercicios con ilustración, o un primer testimonio con permiso) justo antes de la Oferta.
3. [CTA final, sección clara al pie] El botón lima #97d131 sobre fondo casi blanco verdoso tiene contraste de unos 1.5:1 con su fondo inmediato; solo lo salva el canto 3D. Falla el ancla de CTA vivo (≥3:1). Además esa sección clara rompe el modo oscuro del resto de la página sin un motivo de marca. Archivos: components/landing/CtaFinal.tsx y .boton-3d en app/globals.css. Fix: mantener el CTA final sobre fondo oscuro (--bg/--surface), o usar un canto/borde acento-profundo de al menos 3:1.
4. [Hero, tarjeta del plan del día] La captura de app incrustada trae un emoji de bíceps (💪) como ícono y "Racha: 0 semanas", justo en la primera pantalla de venta. Un emoji como ícono rompe la regla de chips SVG, y un 0 de racha no vende. Archivo: public/screenshots/frame-plan-del-dia.png (usada en LandingV1.tsx hero y AppPorDentro). Fix: regenerar el frame con ícono SVG y datos semilla de una usuaria con racha de varias semanas (ej. 3 semanas).
5. [Estructura general y Agitación/Solucion] Página de ~9900px con 5 CTA idénticos y 6 secciones antes de ver el precio; la "Antes" tachada en gris sobre fondo oscuro es casi ilegible, y "Todo bajo control" (cards de 1 palabra con mucho aire) repite lo que ya dijeron Solución y Problema. Archivos: components/landing/Solucion.tsx (bloque Antes), components/landing/Mecanismos.tsx. Fix: fusionar o quitar Mecanismos, subir contraste del texto tachado a ≥4.5:1 y reducir la página en un 20-25%.

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:3 identidad:2 movimiento:3 encaje:2
Detalle copy: idea:3 especificidad:2 emoción:3 oferta:3 acción:3 (especificidad ≤2 obliga a corregir aunque el total pase; el total 14/20 queda bajo el umbral de 16)
Verificado en código (ui.tsx): whileTap 0.97 y h-52px en CtaButton, reduced-motion respetado en reveal/PrecioAnimado/sticky, conteo de precio al entrar en vista, sticky con safe-area, botón volver arriba. No hay anillos/barras que se dibujen ni celebración (no aplica a landing).
Gate de carga cognitiva: 2 fallas (bloques de texto >4 líneas en Oferta y Garantía; página muy larga). No es sobrecarga crítica.
Ficha de arte: fondo #12161c, acento lima #97d131 y Poppins única coinciden con la ficha; el desvío es la sección clara final, no prevista en la ficha. Verificación de message-match: no verificable (no hay dato del anuncio de origen). Garantía nombrada con plazo: cumple.
