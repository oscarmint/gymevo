# Auditoría externa (ChatGPT + Gemini) — plan condensado (26/09/2026)

Fuentes: informe maestro de ChatGPT, prompt de Gemini y dos videos de la app (embudo en iPhone y app en Android). Etiquetas: [video] visto en los videos · [código] confirmado en el repo.

## Ya hecho hoy (esta ronda)
| # | Qué | Por qué | Métrica |
|---|---|---|---|
| 1 | Casilla de términos: vibra y se pone roja al tocar Google sin marcar, área táctil más grande, mensaje "Para continuar, acepta los Términos…" (NO se marca sola) | El botón parecía roto | Registro completado |
| 2 | Botón "Continuar con Google" (antes "Guardar mi plan con Google") | Google es el método; el beneficio ya está en el subtítulo | Clic en Google |
| 3 | Pantalla "Construyendo tu plan": quitado "tiempo bajo tensión" (no se calcula); ahora "Eligiendo los ejercicios de tu nivel" y "Preparando alternativas por si una máquina está ocupada" | Toda promesa de la interfaz debe ser real | Confianza |
| 4 | Círculos de esfuerzo con micro-etiqueta debajo (Ligera, Buena, Pesada, Al límite) | Un principiante no recuerda el color | Series con esfuerzo marcado |
| 5 | Racha: el primer día dice "Tu primera semana empieza hoy" en vez de "Racha: 0 semanas" | El cero se siente como fracaso | Retención D2 |
| 6 | Pantalla "Hoy toca construir": el GIF (1,4 MB) se precarga desde el saludo y se avisa "Toca la pantalla para continuar" | Se veía en blanco unos segundos [video] | Inicio de entrenamiento |
| 7 | Eventos nuevos del embudo: entrenamiento_iniciado, serie_registrada, entrenamiento_completado, rescate_usado | No se puede optimizar lo que no se mide | Panel del dueño |

## Lo que NO haría (o haría distinto) — decide el dueño
1. **Quitar los precios de la landing (Gemini).** No lo hago ya: es una hipótesis, no un hecho. Propuesta: experimento A/B cuando haya tráfico (con 50–100 visitas por variante no hay decisión posible). Hoy la oferta ya es corta y con ancla honesta.
2. **Marcar la casilla de términos por defecto (Gemini, "opcional").** No: la Ley 1581 pide autorización expresa y sin premarcar. Ya lo protege el sistema.
3. **Cambiar el tiempo de "Hoy toca construir" (5 s).** Tú pediste 5 s para poder leer el consejo. Lo dejé y arreglé la carga; si prefieres 3 s dímelo.
4. **Confeti en "Terminar entrenamiento" (Gemini).** Ya existe una celebración al terminar (overlay). Sumar una librería nueva solo para confeti no lo justifica; propongo mejorar la celebración existente con "Día N de 90".
5. **Service worker que precarga imágenes (Gemini/ChatGPT).** Correcto en la idea, pero el service worker actual es un paso-directo y tocarlo mal puede dejar a usuarios con una app vieja pegada. Es un trabajo aparte, con pruebas, y lo dejo para después de la beta.
6. **"Mostrar el plan de 90 días antes del registro" (ChatGPT §9).** Ya se ve el Día 1 y el resto de la semana desenfocado tras el registro. Mostrar toda la ruta antes de registrarse cambia el embudo (correo antes del Día 1); mejor A/B, no cambio directo.
7. **Emails automáticos de 7 días y retargeting.** Buena idea, pero es un proyecto: Resend ya está listo con acceso@gymevoapp.com. Lo propongo como siguiente fase con 3 correos (día 0, 2, 5) y el segmento "se registró y no entrenó".
8. **Perfil con mucho texto repetido y dos calorías distintas [video].** En el video del Android el bloque de alimentación mostró 831 kcal y luego 3139 kcal. Eso hay que investigarlo antes de cualquier pulido: un número de calorías que cambia destruye confianza. Hipótesis: el bloque se recalcula MIENTRAS se escribe el peso (un peso a medias, como 6 kg, da 831 kcal). Propuesta: validar rangos razonables (30–250 kg, 120–230 cm) y mostrar el cálculo solo al guardar. Necesita tu OK porque cambia la edición del Perfil.

## Pendiente (orden sugerido)
- P0: revisar por qué las calorías cambian (831 → 3139) y si el peso en LB está bien convertido; comprobar en Android real.
- P0: "Día N de 90" visible en Plan del día y mensaje de primer entrenamiento completado.
- P1: aclarar "Cardio Zona 2" (opcional u obligatorio) en la tarjeta.
- P1: tarjeta "Rescate" más visible dentro del entrenamiento y en la landing (ya es el diferenciador).
- P1: Perfil más corto (nutrición plegada por defecto) y sin fondo de foto.
- P2: emails, A/B de precio y de hero, service worker, dashboard de embudo con los eventos nuevos.

## Riesgos
- Las 3 pantallas clave (landing, onboarding, paywall) siguen "no lista" según el revisor; ver `ESTADO.md`.
- Todo cambio de precio o de garantía debe coincidir con Hotmart (hoy: 7 días de garantía, pago único, sin renovación automática).
