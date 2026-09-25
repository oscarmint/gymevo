# VEREDICTO revisor-visual — landing (ronda 2)
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 15/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Oferta, bajo el stack y los planes] Dos etiquetas de CTA distintas para la misma acción (hero/medio/final "Crear mi plan de mañana gratis" vs. "Probar 7 días gratis"), y 6 botones repetidos en ~9.400px. Fix: una sola etiqueta en 1a persona en todos.
2. [Oferta] Bloque más denso de la página: stack de valor + "Así funcionan tus 7 días" + 3 planes de 4 features + CTA + nota, antes de la garantía. Fix: colapsar features de Semestral/Mensual a 1-2 líneas o mover el stack fuera; una sola decisión visible.
3. [Copy, Oferta] Sin ninguna prueba propia (testimonio, demo, número real); solo la garantía Hotmart. "Valor total $108 USD" tachado no tiene base verificable (observación de negocio pendiente del dueño, no bloqueante de craft). Fix: prueba verificable o retirar el ancla hasta tenerla.
4. [Oferta vs código] Los comentarios del código dicen "pago único, sin trial", pero el copy vende "7 días gratis" con registro por correo; ningún plan pasa trialDias y no hay badge. Riesgo de contradicción con el paywall. Fix: alinear una sola verdad de trial entre landing, paywall y comentarios.
5. [Verificación] El screenshot completo se ve a 76px de ancho: no se pudo verificar a ojo encaje óptico (chips, radios, padding) ni contraste por sección. Fix: entregar recortes por tramo (~1000px) para confirmar el eje de encaje.

Observaciones: cuerpo de FAQ y planes cumple (aria-expanded, CTA >=52px, .boton-3d:active definido, reduced-motion respetado, PrecioAnimado ya arranca en el valor final). Sin desvío de paleta contra FICHA-ARTE en código (tokens var). No es clon vetado. Identidad: verde lima sobre casi-negro + Poppins, sostenida por video del hero y capturas; el kit sigue siendo algo intercambiable con otras apps fitness oscuras (3/4).
