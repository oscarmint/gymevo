# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-25 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Login/registro, docs/revisiones/onboarding-captura-375.png, input de correo] `autoFocus` en el correo lo pinta con borde lima y abre el teclado en móvil, tapando el botón de Google, que es el método principal. Dos elementos compiten por la acción primaria. Fix: quitar autoFocus y dejar el foco en Google; el correo se enfoca al tocarlo.
2. [Copy del login, subtítulo y CTA] El subtítulo dice "Escribe tu correo para guardarlo" y el botón "Guardar mi plan y ver mi Día 1" está en estilo secundario. El método principal es Google y el copy empuja al correo. "Continuar con Google" tampoco es un CTA de beneficio en 1ª persona. Fix: subtítulo "Guarda tu plan y empieza tus 7 días gratis, sin tarjeta" y CTA "Guardar mi plan con Google".
3. [Onboarding/plan, CTA "Ver mi plan completo" y microcopy inferior] La persona ya creó cuenta y su prueba ya empezó, pero la última pantalla repite "7 días gratis, sin tarjeta" y manda a /paywall sin decir qué pasa. Es incoherente con el negocio vigente y rompe el message-match. La garantía no tiene nombre. Además el CTA queda en y≈1150 del screenshot, fuera del primer viewport. Fix: CTA "Seguir con mi prueba gratis" o "Activar mi plan completo", con el precio único visible y la garantía nombrada, y una barra fija inferior.
4. [Control y libertad, login, generando y plan] Login: no hay flecha atrás, solo el logo que lleva a "/" y pierde las respuestas. Generando: no se puede salir ni saltar la espera de 4,8 s. Plan: no hay volver. Fix: agregar flecha "Atrás" a onboarding en login y plan, y un "Omitir" en generando.
5. [Craft, profundidad y encaje] El paso 1 tiene gradiente y canto 3D, pero login, plan y generando son un fill plano #12161c. La casilla de autorización es el checkbox nativo blanco, que desentona con la paleta. El label "TU RUTA SE ESTÁ ARMANDO" está en #5c7a1f sobre #1a2029, con contraste de aprox. 2,6:1 a 12px, bajo AA. Radios mezclados: rounded-2xl, rounded-xl y --radius-card. En la vista previa, el pill "Desbloquea tu semana completa" se superpone al texto desenfocado y el bloque se ve turbio. Fix: reusar el fondo con gradiente en todo el flujo, casilla custom con acento, label en --accent (#97d131) y un solo radio.

Otros hallazgos menores:
- Generando: "Calculando el tiempo bajo tensión de cada ejercicio" es jerga de teatro de carga.
- El scrim del modal de salida usa --text-primary claro al 35% sobre un tema oscuro, lo que lava el fondo.
- Movimiento: el login no tiene entrada, el plan no respeta reduced-motion y los chips no tienen whileTap propio.
- Verificado en código: existen Enter y flechas para los chips, un modal de salida con trampa de foco y Escape, y estados de carga en Google y en el envío del correo.
- FICHA-ARTE: paleta y Poppins coinciden con la ficha. Sin desvíos, salvo el contraste del verde militar como texto.
- Gate de carga cognitiva: 0 a 1 fallas.
