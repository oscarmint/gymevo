# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 33/40
Craft: 16/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Modal "¿Salir sin terminar?", app/onboarding/page.tsx líneas 184-222] Sin role="dialog"/aria-modal="true", sin cierre por tecla Escape y sin gestión de foco (no autofocus al abrir ni retorno de foco al botón X al cerrar) → agregar los tres.
2. [Pasos "nivel" y "meta", líneas 226-248] Decisión de solo 2 chips sigue apilando TarjetaBeneficio + TarjetaRuta (densidad ya señalada en ronda anterior, no resuelta) → fusionar en una sola tarjeta o mostrar solo una por paso corto.
3. [Paleta papel cálido + verde tinta, FICHA-ARTE.md líneas 24-25] Roza el patrón vetado "Capítulo" (papel cálido + tinta verde) del banco canónico; solo la tipografía (Instrument Sans vs Petrona/Karla) diverge → documentar en ESTADO.md por qué no se considera clon o reforzar el 2º matiz ámbar para distanciarse más.
4. [Paso "compromiso", input range líneas 331-340] Sin aria-valuetext para lectores de pantalla y sin screenshot real verificado en ninguna ronda → agregar aria-valuetext="{dias} días por semana" y capturar el render de este paso.
5. [Selección de chips, función seleccionarYAvanzar línea 101] Sin feedback háptico en la selección (recomendado transversalmente por el SO en acciones clave) → agregar navigator.vibrate(10) con guard de soporte.
