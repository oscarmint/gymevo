# VEREDICTO revisor-visual — onboarding
Fecha: 2026-10-05 10:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 34/40
Craft: 15/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: (1) Craft 15/20, 1 punto bajo el gate: el plan del Día 1 no tiene un elemento héroe, el título de 24px pesa casi igual que los nombres de ejercicio, y el CTA y las tarjetas no tienen whileTap ni conteo/dibujado propio. (2) Los chips de la pregunta de meta miden distinto ancho (hugging) frente al ancho completo de la tarjeta de ruta, y las tarjetas de ejercicio usan rounded-2xl mientras los chips usan --radius-button. (3) El microcopy bajo el CTA dice "Prueba de 7 días ya activa, sin tarjeta" y "Garantía de 7 días tras pagar": dos plazos de 7 días que se contradicen con "pago único" y no se entienden sin releer. (4) Hay dos CTAs al paywall en la misma vista (píldora borrosa y CTA fijo). (5) La pantalla del plan no tiene volver ni salir, y app/onboarding/plan/page.tsx no usa useReducedMotion.
