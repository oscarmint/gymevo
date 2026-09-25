# Prompt maestro para Gemini — solo cambia el nombre del ejercicio

Pega esto en un chat NUEVO de Gemini (uno por ejercicio) y escribe el nombre del ejercicio en la última línea.

```
Eres un entrenador de gimnasio y un ilustrador anatómico. Te voy a dar SOLO el nombre de un ejercicio. Sigue estos pasos en orden.

PASO 1 — INVESTIGA (en silencio, no lo muestres): busca cómo se ejecuta de verdad este ejercicio en un gimnasio comercial. Define: el equipo exacto (barra, mancuernas, máquina, polea, banco y su inclinación), la posición del cuerpo (de pie, sentado, acostado boca arriba, boca abajo o de lado), el plano del movimiento, qué hace el cuerpo en la posición inicial y en la final, y cuáles son los músculos principales y secundarios. Si hay dos formas de hacerlo, usa la más común. Si el nombre se parece a otro ejercicio, no los confundas.

PASO 2 — GENERA UNA SOLA IMAGEN VERTICAL 4:5 con estas reglas, todas obligatorias:

ESTILO
- Ilustración anatómica 3D de manual de gimnasio: figura masculina con músculos visibles (sin piel), en gris plateado, con iluminación de estudio suave. Fondo de gimnasio muy oscuro, casi negro y desenfocado.
- Los músculos que trabaja el ejercicio brillan en verde lima (#B6F03C). Las flechas de movimiento también en verde lima. Ningún otro color de acento: nada de cian, azul, naranja ni rojo.

COMPOSICIÓN
- EXACTAMENTE dos dibujos del MISMO ejercicio, en UNA sola fila, uno al lado del otro. Izquierda: posición inicial. Derecha: posición final. Nunca dos filas, nunca cuatro dibujos, nunca una tercera figura.
- Debajo de cada dibujo, en letras blancas mayúsculas: POSICIÓN INICIAL (izquierda) y POSICIÓN FINAL (derecha).
- De 2 a 4 etiquetas cortas en español con una línea fina que apunta al músculo (por ejemplo DORSAL ANCHO, GLÚTEO MAYOR). Ortografía perfecta, con tildes. Sin corchetes.

PROHIBIDO
- Título, subtítulo, cuadros de indicaciones, cuadros de volumen o de consejo, texto en inglés (nada de START ni END), marcas de agua, figuras repetidas o fantasma, y equipo que el ejercicio no use.

ENCUADRE
- El cuerpo completo y el equipo completo dentro del cuadro, con margen de aire alrededor. No cortes la cabeza, las manos, los pies ni las pesas en los bordes.

REALISMO
- La postura, el agarre, el ángulo del banco y el recorrido deben ser los del ejercicio real. Si no puedes dibujarlo fielmente, dímelo en una línea en vez de dibujar otro ejercicio.

PASO 3 — REVISA ANTES DE ENTREGAR (en silencio): ¿hay solo dos dibujos en una fila? ¿sin título ni cuadros? ¿solo verde lima? ¿nada cortado en los bordes? ¿es el ejercicio correcto? Si algo falla, corrígelo y vuelve a generar.

AL TERMINAR escribe solo dos líneas:
1) EQUIPO Y POSICIÓN: lo que usaste.
2) ARCHIVO: el nombre del ejercicio en minúsculas, sin tildes y con guiones (por ejemplo: press-militar-barra).

EJERCICIO:
```

## Sobre el nombre del archivo
Gemini no puede poner nombre al archivo que se descarga: siempre lo llama `Gemini_Generated_Image_….jpg`. Por eso el prompt le pide que escriba el nombre sugerido al final, para tenerlo a la vista. **No hace falta que renombres nada:** descarga cada imagen a `Downloads/Ejercicios/nuevas-gemini` tal como sale. Yo reconozco cada una por el equipo y los músculos que muestra, la renombro con el nombre del catálogo y te muestro la hoja para que confirmes que cada una quedó bien identificada.

Consejo para que no haya dudas: descarga en el mismo orden del listado (`LISTADO-IMAGENES-A-REGENERAR.md`).
