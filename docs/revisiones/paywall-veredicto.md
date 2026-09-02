# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 30/40
Craft: 13/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Toda la pantalla — plan cards, badge, timeline] El dispositivo ownable de FICHA-ARTE.md (tachado verde estilo cuaderno) sigue sin aparecer en esta pantalla; la combinación papel cálido + tinta verde queda peligrosamente cerca del patrón vetado "Capítulo" del test anti-clon (solo la tipografía, Instrument Sans vs Petrona/Karla, la salva de la descalificación automática) → sin ningún rasgo propio visible, se lee como paywall de suscripción genérico (badge + checks + radio circles) — sumar el tachado o una textura de cuaderno a al menos un elemento (ej. el nodo del timeline al completarse "Hoy").
2. [Bloque inferior: bullets de transparencia + mini-FAQ + trust row] Persiste el defecto de la ronda anterior: tres bloques de texto consecutivos con pesos casi idénticos (text-sm/text-xs) aplanan la jerarquía de la mitad baja de la pantalla frente a la nitidez del bloque superior (headline→timeline→planes→CTA) → diferenciar peso/color entre bullets y FAQ, o insertar un separador visual entre bloques.
3. [Headline + subtítulo, líneas 77-82] Eje "emoción" de copy sigue en 2/4: el texto salta directo a la resolución ("Tu plan... está listo") sin agitar antes el dolor real de Mateo (miedo a lesionarse, vergüenza de improvisar frente a otros) que FICHA-AVATAR.md marca como ancla emocional obligatoria del paywall → añadir una frase corta que reconozca el dolor antes del alivio (ej. subtítulo: "Se acabó improvisar frente a la máquina — con el Botón de Rescate incluido para [horario]").
4. ["Restaurar compra", línea 203] Abre un `mailto:` que compone un correo, no restaura nada — para un avatar cuya objeción #2 es literalmente "¿es otra app con cobros ocultos/estafa?", una etiqueta que promete "restaurar" y en realidad abre el cliente de correo genera la misma desconfianza que se buscaba evitar con el fix del CTA → renombrar a "¿Ya compraste? Escríbenos" o conectar una restauración real vía Hotmart.
5. [empezarTrial(), línea 47-53] El `setTimeout` fijo de 350ms se SUMA al tiempo real de red hacia Hotmart (variable en Android gama media/LATAM) — el spinner ya cubre la percepción de "está pasando algo", el delay artificial es tiempo muerto extra que no aporta confianza adicional más allá de ~150-200ms → recortar a 200ms o disparar la redirección en cuanto el spinner pinta el primer frame.
