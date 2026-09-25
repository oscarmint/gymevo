# Prompt maestro para Gemini — solo cambia el nombre del ejercicio

Pega esto en Gemini y escribe el nombre del ejercicio en la última línea.

```
Eres un entrenador de gimnasio y un ilustrador anatómico. Voy a darte SOLO el nombre de un ejercicio. Haz esto en orden:

PASO 1 — INVESTIGA (no lo muestres, úsalo para dibujar bien): busca cómo se ejecuta de verdad este ejercicio en un gimnasio comercial: el equipo exacto (barra, mancuernas, máquina, polea, banco y su inclinación), la posición del cuerpo (de pie, sentado, acostado boca arriba, boca abajo o de lado), el plano del movimiento, qué hace el cuerpo en la posición inicial y en la final, y cuáles son los músculos principales y los secundarios. Si hay dos formas de hacerlo, usa la más común. Si el nombre se parece a otro ejercicio, no los confundas.

PASO 2 — GENERA UNA IMAGEN VERTICAL 4:5 con estas reglas fijas:
- Estilo: ilustración anatómica 3D de manual de gimnasio. Figura masculina con músculos visibles (sin piel), en gris plateado, con iluminación de estudio suave. Fondo de gimnasio muy oscuro, casi negro y desenfocado.
- Color: los músculos que trabaja el ejercicio brillan en verde lima (#B6F03C). NADA en cian, azul, naranja ni rojo. Las flechas de movimiento también en verde lima.
- Composición: EXACTAMENTE DOS vistas del MISMO ejercicio, en UNA sola fila (nunca dos filas ni cuatro dibujos), una al lado de la otra. Izquierda: posición inicial. Derecha: posición final. Debajo de cada una, en letras blancas en mayúsculas: POSICIÓN INICIAL y POSICIÓN FINAL.
- Etiquetas: 2 a 4 etiquetas cortas en español, con una línea fina que apunta al músculo (por ejemplo DORSAL ANCHO, GLÚTEO MAYOR). Ortografía perfecta, con tildes. Nada de corchetes.
- PROHIBIDO: título, subtítulo, cuadros de indicaciones, cuadros de volumen o consejo, texto en inglés (nada de START o END), marcas de agua, figuras fantasma o repetidas, y equipo que no se use en el ejercicio.
- Encuadre: el cuerpo completo y el equipo completo dentro del cuadro. No cortes la cabeza, las manos, los pies ni las pesas en los bordes. Deja un margen de aire alrededor.
- Realismo: la postura, el agarre, el ángulo del banco y el recorrido deben ser los correctos del ejercicio real. Si no puedes dibujarlo fielmente, dímelo en una línea en vez de dibujar otro ejercicio.

Al terminar, escribe una sola línea: qué equipo y qué posición usaste, para que yo la revise.

EJERCICIO:
```

## Cómo usarlo
1. Abre un chat nuevo en Gemini por cada ejercicio (así no se mezclan).
2. Pega el prompt y escribe el nombre después de `EJERCICIO:` (por ejemplo: `Press militar con barra`).
3. Revisa la línea final de Gemini sobre el equipo y la posición. Si algo está mal, respóndele lo que falla, en una frase.
4. Descarga la imagen a `Downloads/Ejercicios/nuevas-gemini` con el nombre del ejercicio.
