# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/onboarding-375.png (paso "nivel") + docs/revisiones/onboarding-meta-375.png (paso "meta")
Usabilidad: 34/40
Craft: 17/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [botón X "Salir", esquina superior derecha, header] Al tocar Salir con respuestas ya dadas (visibles en "Tu ruta se está armando") se navega a "/" sin ninguna confirmación — el usuario pierde nivel/meta/horario/días sin aviso. Fix: agregar confirmación breve ("¿Salir? Perderás tus respuestas") antes de navegar, o persistir el progreso en localStorage para retomarlo.
2. [pasos "frustracion" y "horario", debajo de los chips] Estos dos pasos NO llevan `TarjetaBeneficio` (solo nivel/meta la tienen) — la plantilla de pantalla-pregunta cambia de estructura entre pasos cortos y largos sin razón visible para el usuario, rompe la heurística de consistencia. Fix: decidir con un criterio único y aplicado a los 4 pasos con opciones (ej. "toda pantalla con ≤2 chips lleva TarjetaBeneficio"), documentarlo, y si "frustracion"/"horario" ya llenan el espacio con 4 chips, aclarar en comentario de código que la ausencia es deliberada por densidad, no un olvido.
3. [pasos "nivel"/"meta", entre los chips y "Tu ruta se está armando"] Apilar TarjetaBeneficio + TarjetaRuta debajo de una decisión binaria de 2 chips es bastante contenido para una sola micro-decisión — funciona, pero un ojo entrenado nota que la pantalla ya no es "una decisión, aire alrededor" sino "una decisión + 2 bloques informativos". Fix: si se repite en más rondas, considerar reducir el padding vertical de TarjetaBeneficio o fusionar visualmente con TarjetaRuta en un solo bloque para bajar la carga.
4. [paso "compromiso", slider de días] El input range nativo del navegador no lleva el mismo tratamiento visual (color de thumb/track) que el resto del kit más allá de `accent-[var(--accent)]` — en algunos motores de render el thumb no hereda el radio/sombra del sistema de componentes. Fix: verificar en el screenshot real de este paso (no fue entregado en esta ronda) que el slider se vea con el mismo nivel de pulido que chips y botones.
5. [header, barra de progreso] `progresoMostrado` fuerza un mínimo de 8% incluso en el primer paso — correcto como truco de arranque, pero al ser el primer paso "nivel" (1 de 6 ≈ 17%) ya casi no se nota el truco; verificar que no quede una barra que parezca "atascada" cerca del 15-17% durante dos pasos seguidos (nivel y meta) antes de dar el salto visible en "frustracion".
