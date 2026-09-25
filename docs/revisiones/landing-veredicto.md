# VEREDICTO revisor-visual — landing
Fecha: 2026-09-25 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 11/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:2 h8:2 h9:2 h10:3
Detalle craft: jerarquia:3 profundidad:2 identidad:3 movimiento:2 encaje:1
Detalle copy: idea:4 especificidad:2 emocion:3 oferta:3 accion:3

Fidelidad: paleta oscura con tinte azulado y acento lima, Poppins, coherente con FICHA-ARTE (no es clon de Capitulo ni Umbral).

Top defectos:
1. [Screenshot completo, desde debajo de "¿Te suena?" (aprox. y=1900px) hasta el CTA final (aprox. y=8200px)] Casi 6000px de fondo vacio: Agitacion, Solucion, App por dentro, Oferta, Garantia y FAQ no se ven en el render. Es una revelacion por scroll (whileInView) que no se dispara en la captura, o un fallo real de render. Como esta, esas secciones (incluida la tabla de precios) NO estan verificadas, y si el fallo es real la landing esta rota. Fix: recapturar tras hacer scroll gradual por toda la pagina (o forzar reduced-motion / estado visible) y volver a pasar al revisor; si sigue vacio, corregir el reveal.
2. [Seccion "¿Te suena?", 5 preguntas seguidas] Son 5 items y una fila de dolores sin transicion; el bloque queda flotando sobre un vacio oscuro. Ademas hay dos CTA casi identicos muy juntos (barra/boton tras Problema y boton en Solucion/CTA global) con la misma etiqueta. Fix: agrupar a 3-4 dolores y cerrar la seccion con la transicion a la Solucion sin espacio muerto.
3. [Hero, linea de prueba bajo el CTA] La unica prueba es "Garantia del Primer Plan Claro: 7 dias desde tu pago", en texto pequeno y bajo contraste, sin numeros ni demo verificable. Copy con especificidad baja (sin cifra de usuarios o resultado, el precio comparativo "$79.99 Fitbod" es un ancla externa sin fuente visible). Fix: subir la garantia a bloque destacado junto al CTA y agregar prueba concreta (video del Boton de Rescate en uso, o dato propio verificable).
4. [Hero, imagen del plan del dia y frames de "App por dentro"] Las capturas se ven diminutas a 375px (texto ilegible del mockup), y el paso "Ruta / nivel" pierde su valor. Encaje visual flojo (mockup no abraza el ancho, margenes desiguales). Fix: recortar el mockup al area util y ampliarlo al ancho del contenedor.
5. [Codigo: components/landing/ui.tsx + LandingV1.tsx] Movimiento verificado solo parcialmente: hay reduced-motion en la barra fija y sube-arriba, pero no se confirmo conteo animado de numeros (precio/dias) ni celebracion; no se pudo verificar la barra fija sobre pantalla (no aparece en captura). Control/libertad y atajos: /login en el hero, boton volver-arriba, pero sin deshacer aplicable. Fix: agregar conteo animado al dato heroe del precio y confirmar la barra fija en captura de viewport.

Nota de verificacion: h3/h7 verificados en codigo (CTA unico a /onboarding, sticky con IntersectionObserver que se oculta con CTAs a la vista, sin salto a precios). Prueba honesta sin testimonios inventados: correcto. Las secciones vacias en el render impiden puntuar oferta, garantia y FAQ visualmente; se puntuaron al menor.
