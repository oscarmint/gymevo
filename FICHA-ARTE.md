# FICHA DE DIRECCIÓN DE ARTE — GymEvo

## Referencia del usuario (CONTRATO — ver 16)
- ¿Hay imagen(es) de referencia del usuario?: NO — el usuario aceptó usar las apps del reporte de validación como referencia de investigación (Hevy, Fitbod, MadMuscles/BetterMe, Strong)
- Extracción: N/A — no hay imagen que extraer, se usó el protocolo de FUSIÓN DE LÍDERES (16, PASO 0.2bis)
- Prohibiciones anti-IA que la referencia LEVANTA: ninguna — se mantiene la capa anti-IA completa (sin dark+neón por defecto, sin glass, sin gradiente morado)

## Identidad derivada (FUSIÓN de líderes — 16 PASO 0.2bis)
- TABLA DE LÍDERES: Hevy → número del día como héroe + celebración de PRs · Fitbod → cards de datos compactas + acento de alta energía · Strong → registro de series sin fricción, minimalismo, modo claro disponible
- Combinación tipográfica probada usada: fila "Fitness/nutrición" de 29 (sans sólida, bold en números) → **Instrument Sans**, validada contra Strong (que también usa una sans neutra clara)
- Arquetipo: **Sabio / Gente Común** (no Héroe puro) — el usuario eligió la opción calmada; Mateo (avatar) quiere certeza y "apagar el cerebro", no adrenalina. Keywords: directo, capaz, honesto, sereno
- Mundo del sujeto (0.45): cuaderno físico de gimnasio → timeline editorial · trazo de tiza/lápiz → el "tachado" al completar ejercicio · anotación a mano → chips de meta con borde fino
- Dispositivo ownable: **marca de tachado verde** sobre el ejercicio completado (como tachar en una libreta real) + chips de meta con borde fino punteado

## Personalidad compilada
- 3 adjetivos: **Sobrio** (dominante) + Técnico + Cálido
- Compilación (tabla del 11):
  → spring: bounce 0.05 / stiffness ~240 · duración base: 260-300ms · exclamaciones: máx 0/pantalla
  → celebración N1: check simple con trazo verde (tachado) · N2: número que cuenta (racha/PR) · N3: línea de reconocimiento, sin confetti
  → radio tendencial: 12-16px · color emocional: mínima — verde solo en logro/progreso
  → arquetipo de voz: experto sobrio, con calidez cercana (tuteo latino, nunca frío)

## Brand kit final (valores para globals.css)
- Fondo: `#F5F1EA` (papel cálido) · Superficie: `#FFFFFF` · Hundido: `#EFE9DE` · Texto 1º/2º: `#211D17` / `#8A7F6A`
- Acento: `#5C7A1F` (verde tinta, SOLO en: progreso, CTA principal, check de completado) · 2ª nota: `#9C5F1C` (ámbar tierra, activada Sesión 7 — hitos y momentos puntuales: trial/"días gratis", tarjeta de progreso del onboarding, contraste "después" de la landing; nunca en CTA principal ni en progreso/completado, eso sigue siendo verde)
- Semánticos: éxito `#5C7A1F` · error `#C0392B` (siempre con ícono) · aviso `#B8860B`
- Display/Body: **Instrument Sans** única familia (pesos 400 body / 500 labels / 700 display-lead) · Escala: lead ~24px / body ~14.5px / meta ~12px / eyebrow ~11px
- Radio: 14-16px cards · 100px pills · Profundidad: hairlines finos (borde `rgba(0,0,0,.08)`) en cards/superficies — el "cuaderno" no flota, se apoya en líneas · Espaciado base: escala 4·8·12·16·24·32·48·64
- **Enmienda 03/09/2026 (pedido explícito del usuario, referencia Duolingo):** profundidad 3D puntual (canto sólido debajo del botón, se "hunde" al presionar) SOLO en la acción primaria de cada pantalla y el ícono activo del menú inferior — clases `.boton-3d`/`.chip-3d` en `app/globals.css`, cantos `--accent-deep #3f5416` / `--accent-2-deep #6e4413` (mismo verde/ámbar de marca oscurecido, sin acento nuevo). El resto de la app (cards, chips secundarios) sigue con hairlines, sin sombra dura.
- Dispositivo ownable: tachado verde grueso sobre el nombre del ejercicio completado + chips de meta con borde fino
- Motion signature: ease-out corto (`--ease-out`), bounce 0.05, stagger 60-80ms en listas, duración base 260-300ms — celebración discreta, nunca confetti

## Trazabilidad y vetos
- Protocolo A/B/C: opción elegida **C ("Cuaderno de Sala")** · descartadas: A "Placa de Hierro" (oscuro, lima eléctrica, hero numérico — demasiado "gym de neón" para lo que el usuario quería) y B "Modo Bento" (oscuro cálido, cards Fitbod) · página comparativa: `docs/revisiones/direcciones-abc.html` (Artifact: https://claude.ai/code/artifact/e3533dca-d624-4fc6-9f6b-62a99c47ac62)
- Paleta derivada de: fusión de líderes (registro claro de Strong + minimalismo), sin clonar ninguna app entera
- Registro anti-repetición: verde `#5C7A1F` + Instrument Sans quedan VETADOS para el próximo proyecto del SO
- Modo (claro) DERIVADO por: el avatar busca certeza y calma ("apagar el cerebro"), no adrenalina — un modo oscuro+neón hubiera sido el reflejo genérico de "app de fitness"; el claro editorial es lo distintivo y lo que el usuario efectivamente eligió

## Idioma UI: Español latino neutro (tuteo) · Fecha de cierre: 28/08/2026 · Aprobada por el usuario: SÍ
