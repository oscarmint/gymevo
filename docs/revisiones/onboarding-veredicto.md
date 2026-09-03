# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-03 00:00
Screenshot: docs/revisiones/onboarding-sexo-375.png
Usabilidad: 36/40
Craft: 16/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. [TarjetaRuta, paso "sexo"] El ícono PlayCircle del bloque de beneficio no corresponde al contenido (texto sobre cálculo de calorías/macros, ícono de "reproducir") — el mismo ícono ya se usa en el paso "nivel" para un beneficio distinto (técnica en video), rompiendo la asociación ícono=significado → usar un ícono propio (p.ej. Activity/HeartPulse) para el beneficio de sexo.
2. [Paso "sexo", chips] Sexo biológico solo ofrece 2 opciones sin ninguna nota de por qué no hay más (la micro-copy explica el USO del dato pero no por qué es binario) — un usuario que no se identifica con ninguna de las dos puede sentirse excluido sin explicación; agregar una línea que aclare que es un dato fisiológico para la fórmula, no una casilla de identidad.
3. [Barra de progreso, paso 1 de 7] El avance ahora arranca en ~14% (1/7) en vez de ~17% (1/6) — el cuestionario se percibe marginalmente más largo desde el primer paso; vigilar que no se sea sume un octavo paso sin revisar longitud total contra el límite de 4-8 pasos de 02B.
4. [Código, comentario línea 101 de app/onboarding/page.tsx] El comentario interno sigue diciendo "son 6 pasos, ~1 minuto" tras agregar el paso "sexo" — no afecta al usuario pero es documentación desactualizada que puede confundir a quien mantenga el flujo; actualizar a "7 pasos".
5. [ESTADO.md línea 369] La descripción de la Sesión 4 sigue listando el onboarding como "6 pasos" sin el paso "sexo" — actualizar la memoria del proyecto para que refleje el flujo real de 7 pasos.
