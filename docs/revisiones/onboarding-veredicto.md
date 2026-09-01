# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-01 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 33/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [zona bajo la tarjeta "Tu ruta se está armando"] Queda ~40-45% de la pantalla vacío (solo renglones de fondo, sin contenido) → agregar un bloque de valor real ahí (ej. mini-preview de lo que se está armando) o centrar verticalmente todo el bloque de pregunta+tarjeta para que el vacío deje de leerse como espacio sin usar; texturizar el fondo no resuelve la falta de contenido.
2. [tarjeta "Tu ruta se está armando"] Sigue leyéndose como tappable: ícono + etiqueta en mayúsculas dentro de una card redondeada con borde completo es el mismo patrón visual de un ítem de lista accionable, y no tiene onClick → quitar el patrón de "header de botón" (mover el ícono en línea junto al texto, sin badge superior) o cambiar el tratamiento visual (solo separador/línea superior, no card con borde perimetral) para que no compita visualmente con los chips reales.
3. [Chips, app/onboarding/page.tsx líneas ~454-456] La animación de entrada de los chips (`initial={{opacity:0,y:10}}`) no está gateada por `useReducedMotion()` a diferencia del resto del archivo → envolver con el mismo patrón `reduce ? {} : {...}` usado en PantallaPregunta y en el número de "compromiso".
4. [TarjetaRuta, línea ~349] Padding horizontal asimétrico (`pl-9` vs `pr-6`) por la espiral de encuadernación → igualar el padding de contenido y resolver el espacio de la espiral con un margen/offset interno separado del padding.
5. [paleta general] Papel cálido + tinta verde sigue en la vecindad de la combinación vetada "Capítulo" (aunque la tipografía difiere, así que no dispara el gate automático de EJE 3=0) → riesgo conocido, no accionable esta sesión por decisión ya tomada del usuario.
