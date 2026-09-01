# Imágenes de "Explicación del ejercicio"

Cuando tengas la imagen lista para un ejercicio:

1. Ponla en esta carpeta (`public/explicaciones/`), en formato `.jpg`, `.png` o `.webp`.
   Nombre sugerido: el mismo id del ejercicio, ej. `curl-biceps.jpg`.
2. En `lib/routine.ts`, busca ese ejercicio dentro de `CATALOGO` y agrégale:
   `imagenExplicacion: '/explicaciones/curl-biceps.jpg',`
3. Listo — la app la muestra sola en el botón "Explicación del ejercicio".

Si un ejercicio todavía no tiene imagen, la app muestra automáticamente la
silueta de cuerpo con el músculo resaltado (no se rompe ni queda vacío).
