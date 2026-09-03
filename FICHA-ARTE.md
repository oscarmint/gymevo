# FICHA DE DIRECCIÓN DE ARTE — GymEvo

## Referencia del usuario (CONTRATO — ver 16) — REDECISIÓN 03/09/2026
- ¿Hay imagen(es) de referencia del usuario?: **SÍ** — el usuario compartió su propio ebook `TRANSFORMACIÓN EN 90 DÍAS` (el material que sirvió de base para la app) y pidió explícitamente extraer su composición de colores y diseño porque consideraba la identidad anterior (ver historial abajo) genérica y aburrida para una app de ejercicio, y quería algo "ganador y motivante... que en publicidad dé ganas de tenerla".
- Extracción: 61 páginas del PDF renderizadas e inspeccionadas directamente (portada + páginas de contenido con tarjetas, callouts, fotografía de gimnasio). Constantes encontradas en TODAS las páginas: fondo casi-negro con tinte azulado, un verde militar oscuro para bloques/tarjetas, un verde lima eléctrico para números y énfasis, tipografía display geométrica muy redondeada y bold (Poppins), fotografía de gimnasio oscura y de alto contraste.
- Esta es una REDECISIÓN deliberada de la identidad — pedida y aprobada por el usuario, no una iniciativa unilateral de la IA (la doctrina de "cosa juzgada" protege a la IA de redecidir sola; no le quita al usuario el derecho a cambiar de opinión).

## Identidad derivada (extracción fiel del ebook, no fusión de líderes esta vez)
- Arquetipo: pasa de **Sabio/Gente Común** a **Héroe/Atleta** — el usuario explícitamente quiere energía y ambición ("ganador, motivante"), no calma. Keywords: intenso, imparable, directo, ambicioso.
- Mundo del sujeto: el gimnasio de pesas real de noche/interior industrial (el de la portada del ebook) — metal, hierro, luces puntuales, sudor — no el cuaderno de anotaciones de la dirección anterior.
- Dispositivo ownable: el **verde eléctrico como "energía que se enciende"** — se usa igual que el ebook usa el "90" en verde brillante sobre fondo oscuro: SOLO en el dato/CTA que más importa, nunca de fondo. Se conserva el tachado de ejercicio completado (ahora en el verde eléctrico en vez del verde militar) como memoria del gesto ya aprendido por el usuario.

## Brand kit final (valores reales en `components/landing/tokens.css`)
- Fondo: `#12161c` (casi-negro con tinte azulado, el de TODAS las páginas del ebook) · Superficie: `#1a2029` · Hundido: `#0d1015` · Texto 1º/2º/3º: `#f2f4f0` / `#aab1bd` / `#7d8492`
- Acento primario: `#97d131` (verde eléctrico/lima — el color exacto del "90" de la portada y de los énfasis de texto del ebook) — SOLO en CTA, progreso, dato clave, igual que en el ebook
- Acento secundario: `#5c7a1f` (verde militar — el de las tarjetas "Principio 01-04" del ebook; **es el mismo verde que ya usaba la identidad anterior completa** — no se descarta, pasa a ser el acento de apoyo/bloques)
- Cantos 3D (`--accent-deep`/`--accent-2-deep`): `#5a7d16` / `#3f5416` — mismos verdes oscurecidos ~30%, sin acento nuevo
- Semánticos (recalibrados para AA sobre fondo oscuro): éxito `#97d131` (=acento) · error `#ff6b5e` · aviso `#f5a524`
- Display/Body: **Poppins** única familia (pesos 400/500/600/700/800) — es la familia real de los títulos del ebook (geométrica, terminales redondeadas, muy bold en headings)
- Radio: 14-16px cards · 100px pills (sin cambios — es forma, no color, y ya funcionaba)
- Profundidad: el canto 3D puntual (`.boton-3d`/`.boton-3d-borde`/`.superficie-3d`, ver `app/globals.css`) ahora encaja mejor con la identidad — Duolingo y el ebook comparten el mismo lenguaje de "energía sólida y con volumen"
- Espaciado base: escala 4·8·12·16·24·32·48·64 (sin cambios)
- Motion signature: sin cambios (ease-out corto, bounce 0.05, stagger 60-80ms) — la energía nueva la dan el color y la tipografía, no animaciones más agresivas

## Pendiente de esta redecisión (anotado para no declarar "terminado" antes de tiempo)
- Los 4 screenshots reales de la landing (`public/screenshots/frame-*.png`, sección "La app por dentro") se capturaron con la identidad ANTERIOR (clara) — quedan desactualizados visualmente contra el nuevo fondo oscuro. Hay que re-capturarlos con la app ya en el nuevo tema antes de dar la landing por completamente consistente.
- Todas las pantallas se verificaron por CASCADA de tokens CSS (arquitectura ya 100% var(...), confirmado por auditoría de grep — cero hex hardcodeados en `.tsx`), no una por una con sesión autenticada real. Antes de vender, correr el TEST DE FIDELIDAD (screenshot a 375px) en las 4 pantallas del dinero + panel de administrador cuando se construya.
- El panel de administrador (aún no construido) debe nacer YA con este brand kit — no heredar el anterior.

## Trazabilidad y vetos
- Dirección ANTERIOR (28/08/2026 – 03/09/2026, "Cuaderno de Sala"): protocolo A/B/C, opción C elegida, paleta papel cálido `#F5F1EA` + tinta verde `#5C7A1F` + Instrument Sans — quedó **reemplazada por decisión del usuario**, no por hallazgo de la IA. El verde `#5C7A1F` sobrevive como acento secundario de la nueva dirección (no se perdió el trabajo previo).
- Verde eléctrico `#97D131` + Poppins quedan como identidad VIGENTE de este proyecto (no vetados: si un futuro proyecto del SO los reutiliza, es coincidencia de nicho fitness, no plagio — el registro anti-repetición del SO aplica entre proyectos DISTINTOS, no dentro del mismo).
- Modo: pasa de claro a OSCURO, derivado explícitamente del mundo del sujeto (gimnasio de pesas nocturno/industrial del ebook), no del reflejo genérico de "toda app de fitness es oscura" — aquí SÍ hay una referencia real que lo pide.

## Idioma UI: Español latino neutro (tuteo) · Fecha de esta redecisión: 03/09/2026 · Aprobada por el usuario: SÍ (pidió explícitamente el análisis y el cambio)
