# VEREDICTO revisor-visual — paywall (ronda 9)
Fecha: 2026-10-05 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 15/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos: (1) CTA principal "Empezar mis 7 días gratis" sin estado de carga: empezarPrueba() hace await rpc y no desactiva el botón ni muestra spinner (doble-tap, sensación de cuelgue); (2) inversión de jerarquía en la pila bajo el CTA: "Ahora no · ¿Ya pagaste? Escríbenos" quedó en text-primary medio, más brillante que "Prefiero pagar ahora" (text-tertiary), así que la salida pesa más que la acción secundaria; (3) la elección de plan no cambia lo que hace el CTA (siempre inicia prueba) y a primera vista el sticky tapa la tarjeta Mensual, de modo que el señuelo queda oculto; (4) pb-32 deja ~110px de aire muerto entre Mensual y el CTA en la captura de scroll; (5) sin prueba ni número que ancle el valor (ej. "menos de $0.09/día" de la ficha) y 6 bloques de reaseguro/enlaces bajo el CTA.
