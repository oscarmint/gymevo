# Auditoría de ilustraciones — 24/09/2026

Alcance: las 70 ilustraciones del catálogo, las 2 de cardio, las 2 de calentamiento, los 4 pantallazos de la landing y los GIF/íconos. Revisadas en hojas de contacto (`docs/ilustraciones-pendientes/revision/auditoria-1..3.jpg`).

## Estado general
- Todas las rutas del catálogo apuntan a un archivo real (se corrigió `crunch_superior_horizontal`, que apuntaba a un .png inexistente).
- Ningún archivo de `public/explicaciones/` está sin uso.
- 43 de 70 ilustraciones del catálogo están bien.

## A. Lámina completa con título y cajas de texto (9) — duplican la guía de la app; varias en cian/azul
`encogimientos_mancuernas`, `lumbares_maquina`, `press_banco_barra`, `elevacion_frontal_polea`, `encogimientos_maquina`, `crunch_banco_declinado`, `sentadilla_goblet_kettlebell`, `remo_polea_baja_pie`, `press_inclinado_barra`.

## B. Texto pintado dentro del dibujo o cortado (9)
`prensa_inclinada` (título grande), `peso_muerto_barra` (título), `press_inclinado_mancuerna` ("mancuernas" cortado), `extension_triceps_copa` (título cortado), `pajaros_pie_mancuerna` (título), `press_banco_mancuernas` (START/END en inglés), `press_militar_barra` y `jalon_pecho` (corchetes), `jalon_pecho_cerrado_neutro` (etiqueta cortada arriba).

## C. Baja resolución, 750 px o menos (12)
`remo_mancuerna_banco`, `hip_thrust_maquina`, `jalon_unilateral_polea`, `curl_femoral_acostado`, `hack_inclinado`, `curl_femoral_maquina`, `plancha_abdominal`, `extension_cuadriceps`, `curl_barra`, `remo_cerrado_maquina`, `curl_supinacion_maquina`, `pajaros_pie_mancuerna`.
(Muchas más están en 750 px y se ven aceptables; las listadas son las más pequeñas o borrosas.)

## D. La imagen no corresponde al ejercicio (2)
`crunch_lateral_inclinado` (muestra otro ejercicio), `crunch_superior_horizontal_banco` (usa la imagen de la máquina).

## E. Otras imágenes de la app
- **Pantallazos de la landing** (`public/screenshots/frame-*.png`, del 16/09): están viejos. `frame-historial.png` muestra una pantalla Historial que ya no existe (se fusionó en Progreso) y `frame-plan-del-dia.png` no refleja los nombres de sesión ni el domingo de descanso actuales. Hay que recapturarlos (requiere OK para correr el script de Playwright).
- **Cardio** (`cardio-hiit.jpg`, `cardio-zona2.jpg`, 900×1342) y **calentamiento** (1696×2528): pendientes de revisión visual por el texto pequeño.
- `public/email-logo-dark.png` no se referencia en el código (puede usarse desde las plantillas de correo externas; confirmar).
- `public/ilustraciones/entrenador-inicio.gif` pesa 1,3 MB: candidato a optimizar para carga en Android de gama media.
- Plantilla de Next sin usar en `public/` (`file.svg`, `vercel.svg`, `window.svg`, `globe.svg`, `next.svg`): se pueden borrar.

## Bloqueo
Los archivos 01–09 de `Downloads/Ejercicios/nuevas-gemini` (crunch lateral, lumbares, remo polea baja, jalón pecho, press banco mancuernas, encogimientos, hip thrust barra, press inclinado mancuernas, extensión tríceps copa) desaparecieron de la carpeta. Sin ellos hay que regenerar 9 imágenes.

Regla vigente: nada se monta sin que el usuario lo revise.
