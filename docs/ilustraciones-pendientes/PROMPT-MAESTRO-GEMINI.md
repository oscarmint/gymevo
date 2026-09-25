# Prompt maestro para Gemini (versión 3) — solo cambia el nombre del ejercicio

Pega esto en un chat NUEVO de Gemini (uno por ejercicio) y escribe el nombre del ejercicio en la última línea.

```
Eres un entrenador de gimnasio y un ilustrador anatómico. Te voy a dar SOLO el nombre de un ejercicio. Genera UNA imagen que cumpla TODAS las reglas de abajo.

PASO 1 — INVESTIGA EN SILENCIO cómo se hace de verdad este ejercicio en un gimnasio comercial: el equipo exacto y su ángulo, la posición del cuerpo, qué hace el cuerpo al inicio y al final del movimiento, y los músculos principales. Si hay dos formas, usa la más común. No lo confundas con otro ejercicio parecido.

PASO 2 — DISEÑO DE LA IMAGEN (formato vertical 4:5):

DISTRIBUCIÓN, NO NEGOCIABLE
- Divide mentalmente el lienzo en DOS mitades iguales, izquierda y derecha, en UNA sola fila.
- Mitad izquierda: UN solo cuerpo en la posición inicial. Mitad derecha: UN solo cuerpo en la posición final. En total hay EXACTAMENTE 2 cuerpos en toda la imagen: ni 3, ni 4.
- Los dos dibujos usan la MISMA máquina o el MISMO equipo, idéntico en forma, tamaño y ángulo. Solo cambia la posición del cuerpo.
- Debajo de cada mitad, en letras blancas mayúsculas: POSICIÓN INICIAL (izquierda) y POSICIÓN FINAL (derecha), alineadas a la misma altura.

ESTILO
- Ilustración anatómica 3D de manual de gimnasio: figura masculina con músculos visibles (sin piel), gris plateado, luz de estudio suave, fondo de gimnasio casi negro y desenfocado.
- Los músculos principales del ejercicio brillan en verde lima (#B6F03C). Las flechas de movimiento, también verde lima. Ningún otro color de acento: nada de cian, azul, naranja ni rojo.

ETIQUETAS (aquí es donde más se equivoca: sé estricto)
- Máximo 3 etiquetas en toda la imagen, cada una con una línea fina hacia el músculo.
- Usa SOLO nombres de esta lista, escritos exactamente así y con su tilde: PECTORAL MAYOR, PECTORAL SUPERIOR, DORSAL ANCHO, TRAPECIO, ROMBOIDES, DELTOIDES, TRÍCEPS, BÍCEPS, ANTEBRAZOS, RECTO ABDOMINAL, OBLICUOS, LUMBARES, GLÚTEO MAYOR, CUÁDRICEPS, ISQUIOTIBIALES, GEMELOS, ADUCTORES.
- Revisa cada etiqueta letra por letra antes de entregar. Si dudas de la ortografía, quita la etiqueta.

PROHIBIDO
- Título, subtítulo, cuadros de indicaciones, de volumen o de consejo, texto en inglés, corchetes, marcas de agua, figuras repetidas o fantasma, y equipo que el ejercicio no use.

ENCUADRE
- Los dos cuerpos y todo el equipo completos dentro del cuadro, con margen de aire. No cortes cabeza, manos, pies ni pesas en los bordes. Los dos dibujos del mismo tamaño.

REALISMO
- Postura, agarre, ángulo del banco y recorrido del ejercicio real. Si no puedes dibujarlo fielmente, dímelo en una línea en vez de dibujar otro ejercicio.

PASO 3 — VERIFICA ANTES DE ENTREGAR, en silencio, esta lista: (a) ¿hay exactamente 2 cuerpos? (b) ¿la máquina es idéntica en los dos? (c) ¿las etiquetas están bien escritas y son de la lista? (d) ¿nada cortado? (e) ¿solo verde lima? Si algo falla, corrige y vuelve a generar. No me muestres versiones intermedias.

RESPUESTA: entrega solo la imagen y debajo dos líneas:
EQUIPO Y POSICIÓN: lo que usaste.
ARCHIVO: el nombre del ejercicio en minúsculas, sin tildes y con guiones.

EJERCICIO:
```

## Si la imagen sale con un defecto
Responde en el mismo chat con UNA sola frase que nombre el defecto y lo que quieres, por ejemplo:
- "Hay 3 cuerpos: deja SOLO 2, uno por mitad."
- "La máquina cambia entre los dos dibujos: usa exactamente la misma."
- "La etiqueta dice X: corrígela a GLÚTEO MAYOR."
- "Se cortan los pies en el borde: reduce el tamaño y deja margen."

## Sobre el nombre del archivo
Gemini siempre guarda como `Gemini_Generated_Image_….jpg`; el nombre no se puede controlar. Descarga cada imagen tal cual a `Downloads/Ejercicios/nuevas-gemini`, sin renombrar. Yo identifico cada una por el equipo y los músculos, la renombro con el nombre del catálogo y te muestro la hoja para confirmar.
