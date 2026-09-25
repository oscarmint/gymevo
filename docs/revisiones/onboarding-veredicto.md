# VEREDICTO revisor-visual — onboarding (paso "Te entendemos", ronda 3)
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 31/40
Craft: 15/20
Copy (si vende): 16/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. app/onboarding/page.tsx L155-162: el listener global de Enter avanza el paso aunque el foco esté en Atrás o Salir (Enter activa el botón y además avanza). Fix: ignorar el evento si e.target es un button/input, o si e.defaultPrevented.
2. app/onboarding/page.tsx L438-480 (movimiento 3/4): en este paso no hay conteo de número héroe ni celebración de hito más allá del check y el trazo; el conteo vive solo en "compromiso". Fix: añadir un contador o anillo con dato propio, o una micro-celebración con spring al montar el check.
3. app/onboarding/page.tsx L442-444 y L470-472: el hairline lima de 2px queda recortado por overflow-hidden + radio y se ve como una barra curvada en el borde superior. Además, la 2ª tarjeta usa borde de ícono con accent-2 y la 1ª con accent (L445 vs L473). Fix: hairline inset con degradé que se desvanece en los extremos, y unificar el borde de ambos íconos en accent.
4. app/onboarding/page.tsx L400-413 (identidad 3/4): el subrayado ondulado bajo el titular es un gesto muy común y no diferencia a la app de otras. La ficha define el dispositivo como "verde que se enciende" y el tachado. Fix: hacer que el trazo imite el tachado de ejercicio completado (trazo recto con leve inclinación) o reutilizar el mismo componente que el tachado real.
5. app/onboarding/page.tsx L452-479 (jerarquía): las dos tarjetas usan el mismo peso, tamaño e ícono lima que el resto y compiten con el párrafo. "Tu plan no cambia de la nada" suena forzado. Fix: reescribir a "Tu plan no cambia cada semana: mismos ejercicios para que veas tu progreso real" y bajar la tarjeta 2 a un peso secundario (texto gris).
