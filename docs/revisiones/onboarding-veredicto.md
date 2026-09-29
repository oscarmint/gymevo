# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-28 00:00
Screenshot: docs/revisiones/onboarding-375.png (+ onboarding-frustracion-valor-375.png, onboarding-captura-375.png, onboarding-plan-375.png)
Usabilidad: 35/40
Craft: 16/20
Copy (si vende): 16/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Top defectos:
1. [Paso "¿Qué te frustra?" — texto de valor bajo el chip elegido] Solo 1.1s entre que aparece la frase de valor (ej. "GymEvo te dará una alternativa cuando ocurra") y el auto-avance a la siguiente pregunta: para una frase de 6-8 palabras es un tiempo ajustado, sobre todo la primera vez que el usuario ve este patrón → subir a ~1.6-1.8s o cambiar a un botón "Siguiente" en vez de auto-avance ciego (app/onboarding/page.tsx, seleccionarYAvanzar(setFrustracion, v, 1100)).
2. [Tarjeta "TU RUTA SE ESTÁ ARMANDO" repetida en cada paso del onboarding] Usa el ícono NotebookPen y el copy "Cada respuesta se guarda aquí, como en una libreta" — es la metáfora de "cuaderno" de la dirección de arte ANTERIOR ("Cuaderno de Sala"), que FICHA-ARTE.md declara explícitamente reemplazada por la dirección Héroe/Atleta de gimnasio (verde eléctrico, Poppins, mundo de hierro/gimnasio nocturno). Rompe la consistencia de identidad frente al resto de la app (login, vista del Día 1), que sí respira la identidad nueva → quitar el ícono de libreta y el copy "como en una libreta"; usar un ícono/lenguaje coherente con el gimnasio (clipboard de entrenamiento, check de progreso) (app/onboarding/page.tsx, componente TarjetaRuta).
3. [Vista previa Día 1, microcopy bajo el CTA sticky] "Prueba de 7 días ya activa, sin tarjeta · pago único, sin renovación · Garantía del Primer Plan Claro: 7 días tras pagar" mete 3 ideas en una sola línea densa (11-13px) y puede leerse contradictorio a primera vista: ¿es gratis o ya es pago único? → partir en 2 líneas cortas: "7 días gratis, sin tarjeta" y, debajo, "Luego pago único · Garantía de 7 días" (app/onboarding/plan/page.tsx).
4. [Vista previa Día 1, botón principal "Activar mi plan completo"] El verbo "Activar" sugiere que el plan queda activo de inmediato, pero el botón solo navega al paywall — todavía no se paga ni se activa nada → usar un verbo más honesto, ej. "Ver mi plan completo" o "Continuar a mi prueba gratis" (app/onboarding/plan/page.tsx).
5. [Login, checkbox de autorización de datos] Bloquea tanto "Continuar con Google" como el envío por correo, pero un usuario que toca Google directo sin leer el checkbox solo se entera del bloqueo cuando falla (shake + mensaje) — es corrección de error, no prevención → atenuar visualmente el botón de Google (opacidad reducida, sin quitar el tap) mientras la casilla no esté marcada, para prevenir el error en vez de solo reaccionar a él (app/login/page.tsx, continuarConGoogle).
