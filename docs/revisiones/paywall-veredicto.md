# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 15/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Dos CTAs compiten: "Activar mi plan" y "Probar 7 días gratis" (enlace lima subrayado de 16px, casi del mismo peso visual) justo debajo; además el párrafo "sin tarjeta / garantía aparte" en 3 líneas confunde (prueba vs garantía vs pago único) -> dejar un solo CTA primario y mover la prueba gratis a texto terciario de 1 línea. 2) Pantalla sobrecargada antes del CTA: foto + mecanismo + timeline de 3 nodos + 3 tarjetas de plan; el timeline repite "Hoy/acceso/aviso" que ya dicen las tarjetas y la FAQ -> quitar o reducir el timeline a 1 línea con la fecha. 3) Tarjetas de plan: cada una lleva 4-5 capas (badge, chip de ahorro, "Antes", precio USD, USD·COP, detalle) y el chip "AHORRA 50%" + "MÁS POPULAR" duplican mensaje; textos de 10.5-12px de bajo contraste (text-tertiary) en USD/COP -> un solo badge por tarjeta y COP en 13px secundario. 4) PrecioAnimado: aunque ya parte del valor final, al entrar en vista salta a 0 y cuenta (parpadeo del precio; en el Anual se ve un "$0.00" fugaz) -> arrancar la animación desde el valor final o no animar precios. 5) Movimiento incompleto: sin celebración ni transición al elegir plan (solo cambio de color), sin count-up del héroe distinto del precio -> animar el cambio de plan (layout/borde) y el precio del CTA. Verificado en código: X con retraso de 1.5s y meneo, cancelar redirección, alerta de error con enlace, plan recordado en localStorage, CTA nunca deshabilitado por defecto, whileTap 0.97, reduced-motion respetado. Garantía nombrada con plazo junto al CTA (OK). Paleta y Poppins coinciden con FICHA-ARTE.
