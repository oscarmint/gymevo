# VEREDICTO revisor-visual — onboarding
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 32/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Composición general] Hueco muerto masivo arriba (~300px) y abajo (~140px) del bloque de pregunta — `justify-center` en `PantallaPregunta` (app/onboarding/page.tsx) centra verticalmente el contenido en el `flex-1`, dejando más vacío que contenido → anclar el bloque arriba (justify-start + margen fijo) y llenar el resto con valor real, no con aire.
2. [Fondo completo] El gradiente radial de profundidad (14%/12% de acento) sigue siendo imperceptible en el render — la pantalla se lee como un fill plano de un solo color → subir la opacidad efectiva (probar 20-24% o un stop más saturado antes del transparent) y reverificar a 375px, no solo el valor en código.
3. [Paleta de toda la app] Papel cálido + tinta verde (#F5F1EA + #5C7A1F) queda peligrosamente cerca de la combinación vetada "Capítulo" (papel cálido + tinta verde + Petrona/Karla) — solo la tipografía (Instrument Sans) diferencia el kit → reforzar el dispositivo ownable (tachado verde, chips punteados) en más puntos de contacto de la app para que la paleta no lea como el ejemplo canónico del sistema.
4. [Chips de opción] Sin nivel "elevado" real: sobre un fondo casi plano, los chips blancos no muestran una superficie claramente distinta (sin sombra ni contraste tonal con el fondo) → aplicar el nivel elevado de la ficha (sombra sutil o mayor contraste con `--surface`) para que lean como tarjetas y no como recuadros con borde.
5. [Heurística 7 — flexibilidad] No hay atajo de teclado (flechas + Enter) para elegir opción desde escritorio, solo tap — agregar navegación por teclado en el componente `Chips` para no penalizar a quien llega sin touch.
