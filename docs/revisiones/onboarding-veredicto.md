# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-01 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 34/40
Craft: 11/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Todo el layout — paleta y concepto] Coincide con el patrón vetado "Capítulo" (papel cálido #F5F1EA + tinta verde #5C7A1F + motivo de cuaderno/libreta con tachado) — solo difiere la familia tipográfica exacta (Instrument Sans en vez de Petrona/Karla), pero el ADN visual completo (fondo papel, acento verde, lenguaje de "libreta que se llena") es el mismo archetype → EJE identidad = 0. FIX: no es retoque — requiere decidir si se re-deriva la identidad visual desde otro mundo/arquetipo (16, PASO 0.45) o se acepta el riesgo de clon como decisión de producto explícita, documentada como tal.
2. [Debajo de la tarjeta "Tu ruta se está armando", pasos con 2 chips: nivel/meta] Queda un vacío muerto de ~200-250px sin contenido ni centrado vertical → viola "nunca vacío muerto abajo". FIX: centrar el bloque pregunta+chips+tarjeta en el alto disponible, o agregar un elemento de contexto que llene el espacio en pasos cortos.
3. [Fondo completo de la pantalla] Los 3 gradientes radiales de accent/accent-2 (12-18% opacidad) definidos en el código son imperceptibles en el render real — la pantalla se ve como un fill plano de cream. FIX: subir la opacidad o acercar el radio del gradiente a la zona del héroe para que la profundidad se perciba de verdad.
4. [Paso "compromiso", código — no visible en el screenshot capturado] El número de días salta instantáneo al mover el slider, sin conteo/transición animada — falta 1 de las 7 baseline de movimiento (conteo animado de número héroe). FIX: animar el número con motion (spring/tween) en cada cambio de valor.
5. [Chips de opción, todos los pasos] El radio de los chips en el screenshot se ve como rectángulo medio-redondeado (~14-16px), no como pill completo (100px) que documenta FICHA-ARTE para botones/pills. FIX: verificar si --radius-button coincide con el valor real deseado o corregir la ficha para reflejar el valor efectivo, evitando el desvío entre documento y código.
