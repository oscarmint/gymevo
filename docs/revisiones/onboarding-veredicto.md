# VEREDICTO revisor-visual — onboarding
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 31/40
Craft: 11/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Debajo de las 2 tarjetas, ~60% de la pantalla] Vacío muerto sin contenido ni tratamiento visual → centrar verticalmente el bloque pregunta+chips o llenar el espacio con un elemento de apoyo; viola "la app nunca se enseña vacía" (32) y baja el EJE 2 de craft.
2. [Fondo completo de la pantalla] Plano de un solo color sin ningún nivel de profundidad (sin tinte, sin mesh sutil, sin separación de planos) → aplicar el tratamiento de profundidad de 3 niveles que exige DESIGN-CORE.
3. [Todo el paso 1] Cero dispositivo ownable visible (el tachado verde / chip con borde punteado de FICHA-ARTE.md no aparecen aquí) → introducir al menos un guiño del dispositivo ownable (p.ej. borde punteado en los chips) para que el paso no sea intercambiable con cualquier otra app; además la combinación papel cálido + acento verde tinta se acerca al patrón vetado "Capítulo" del banco de direcciones — vigilar que no converja más con él en las siguientes pantallas.
4. [Barra superior] No hay forma de salir/cancelar el onboarding, solo "Atrás" (deshabilitado en el paso 1 sin alternativa) → agregar una X o "Salir" discreta para cumplir control y libertad (heurística 3).
5. [Círculo "N" inferior izquierdo] Elemento redondo con apariencia de botón flotante sin función definida en el código de la pantalla (app/onboarding/page.tsx no lo renderiza) → verificar si es el overlay de desarrollo de Next.js; si aparece también en build de producción, se viola la regla "todo elemento con apariencia interactiva hace algo".
