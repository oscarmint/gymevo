# VEREDICTO revisor-visual — onboarding (paso "Te entendemos", ronda 2)
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 30/40
Craft: 14/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Tarjetas de refuerzo vs CTA] Las tarjetas (max-w-xs, ~320px, x=28-347) son más angostas que el CTA (335px, x=20-355): dos anchos y bordes izquierdos que no alinean → mismo ancho (w-full) para tarjetas y CTA.
2. [Icono tarjeta 1] "Tu plan no cambia de la nada" lleva ShieldAlert (escudo con "!"), que se lee como alerta, no como plan fijo → ícono neutro (Lock, CalendarCheck o Repeat).
3. [Tarjeta 2, hairline e ícono] El acento secundario #5c7a1f sobre #1a2029 queda a ~3:1 y el hairline casi no se ve; el ícono Activity queda apagado → subir a un tono más claro del verde, o usar el acento lima en ambos.
4. [Identidad] En esta pantalla no hay dispositivo ownable visible (sin renglones ni tachado): lima + Poppins + tarjeta oscura es intercambiable con cualquier app fitness → reintroducir el tachado/trazo lima como firma (por ejemplo, una línea que se dibuja bajo "entendemos").
5. [Copy] "Botón de Rescate" aparece sin explicar qué es y "Continuar" es genérico; además la tarjeta "plan fijo" responde a la objeción de apps que cambian la rutina, no a la de máquina ocupada que acaba de elegir el usuario → CTA en 1ª persona ("Ver mi plan") y una tarjeta que cierre el dolor elegido.

Verificación en código (no invento lo no visible): Enter avanza en este paso; atrás y salir siempre presentes; modal de confirmación con trampa de foco; stagger de entrada, trazo del check que se dibuja y whileTap 0.97; reduced-motion respetado. Faltan el conteo de números y la celebración en este paso; el conteo solo existe en "compromiso". No hay estados de error ni offline en la pantalla.
